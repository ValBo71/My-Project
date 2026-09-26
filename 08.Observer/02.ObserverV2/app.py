from flask import Flask, render_template, jsonify, request
from urllib.parse import urlparse
import logging
import os
import sys
import threading

# Add current directory to python path to avoid import issues
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from config import DEV_BG_URL, LINKEDIN_URL, JOBS_BG_URL, PORT, FLASK_DEBUG
from database import init_db, save_job, get_all_jobs, update_job_flag, update_job_status, get_all_companies, update_company, get_scraper_urls, update_scraper_url, clear_jobs_and_companies
from scraper import fetch_html, fetch_job_details, scrape_linkedin_jobs, scrape_jobs_bg_jobs
from parser import parse_job_listings, parse_job_detail_page

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.abspath(os.path.dirname(__file__)), "app.log"), encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("app")

app = Flask(__name__)

# Initialize database schema
init_db()

@app.before_request
def reject_cross_site_posts():
    """
    Blocks state-changing requests coming from other websites (CSRF): a page on any
    site could otherwise auto-submit a form to 127.0.0.1 and e.g. wipe the database.
    Browsers always send Origin on cross-site POSTs, so a foreign Origin is refused.
    """
    if request.method != 'POST':
        return None
    origin = request.headers.get('Origin')
    if origin and urlparse(origin).netloc != request.host:
        logger.warning(f"Rejected cross-site POST to {request.path} from Origin {origin}")
        return jsonify({'success': False, 'error': 'Cross-site request rejected.'}), 403
    return None

# Only one scraping cycle may run at a time: parallel cycles would launch several
# browsers, log in to LinkedIn repeatedly and race on linkedin_session.json.
refresh_lock = threading.Lock()

class RefreshInProgress(Exception):
    pass

def perform_refresh_cycle():
    """
    Runs one refresh cycle, refusing to start while another one is running.
    Returns:
        tuple: (success_boolean, error_message_string, new_jobs_count)
    Raises:
        RefreshInProgress: if another cycle is already running.
    """
    if not refresh_lock.acquire(blocking=False):
        raise RefreshInProgress()
    try:
        return _run_refresh_cycle()
    finally:
        refresh_lock.release()

def _run_refresh_cycle():
    """
    Coordinates the scraping, parsing, and DB saving workflow.
    Returns:
        tuple: (success_boolean, error_message_string, new_jobs_count)
        success is True when at least one enabled source worked (or none is enabled);
        error_message lists the failed ones.
    """
    new_jobs_saved = 0
    errors = []
    attempted = 0
    
    # Load dynamic URLs from database
    try:
        urls = get_scraper_urls()
    except Exception as e:
        logger.error(f"Error fetching URLs from database: {e}")
        urls = {}
        
    dev_bg_url = urls.get('dev.bg', DEV_BG_URL)
    linkedin_url = urls.get('LinkedIn', LINKEDIN_URL)
    jobs_bg_url = urls.get('jobs.bg', JOBS_BG_URL)
    
    # --- Part 1: Scrape dev.bg ---
    if dev_bg_url:
        attempted += 1
        try:
            logger.info(f"Starting refresh cycle from URL: {dev_bg_url}")
            main_html = fetch_html(dev_bg_url)
            if not main_html:
                errors.append("Could not fetch or load the main dev.bg listings page.")
            else:
                listings = parse_job_listings(main_html)
                logger.info(f"Parsed {len(listings)} listings from dev.bg.")
                if listings:
                    listings_with_details = fetch_job_details(listings)
                    for job in listings_with_details:
                        if 'html_detail' in job and job['html_detail']:
                            details = parse_job_detail_page(job['html_detail'])
                            full_job_data = {
                                'url': job['url'],
                                'company': job['company'],
                                'title': job['title'],
                                'date_published': job['date_published'],
                                'requirements': job['requirements'],
                                'leave_days': details['leave_days'],
                                'salary_from': job.get('salary_from') if job.get('salary_from') is not None else details['salary_from'],
                                'salary_to': job.get('salary_to') if job.get('salary_to') is not None else details['salary_to'],
                                'description': details['description'],
                                'source': 'dev.bg'
                            }
                            if save_job(full_job_data):
                                new_jobs_saved += 1
        except Exception as e:
            logger.error(f"Error during dev.bg scrape: {e}")
            errors.append(f"dev.bg error: {e}")
    else:
        logger.info("dev.bg URL is empty, skipping dev.bg scraping.")
        
    # --- Part 2: Scrape LinkedIn ---
    if linkedin_url:
        attempted += 1
        try:
            linkedin_jobs = scrape_linkedin_jobs(linkedin_url)
            for job in linkedin_jobs:
                if save_job(job):
                    new_jobs_saved += 1
        except Exception as e:
            logger.error(f"Error during LinkedIn scrape: {e}")
            errors.append(f"LinkedIn error: {e}")
    else:
        logger.info("LinkedIn URL is empty, skipping LinkedIn scraping.")
        
    # --- Part 3: Scrape jobs.bg ---
    if jobs_bg_url:
        attempted += 1
        try:
            jobs_bg_jobs = scrape_jobs_bg_jobs(jobs_bg_url)
            for job in jobs_bg_jobs:
                if save_job(job):
                    new_jobs_saved += 1
        except Exception as e:
            logger.error(f"Error during jobs.bg scrape: {e}")
            errors.append(f"jobs.bg error: {e}")
    else:
        logger.info("jobs.bg URL is empty, skipping jobs.bg scraping.")
        
    # Success is True if at least one enabled source worked; partial failures are still
    # reported through error_msg and shown as a warning in the UI. Counting against the
    # enabled sources matters because a source with an empty URL is skipped entirely.
    success = attempted == 0 or len(errors) < attempted
    error_msg = "; ".join(errors) if errors else ""
    
    logger.info(f"Refresh completed. Saved {new_jobs_saved} new jobs in total.")
    return success, error_msg, new_jobs_saved

@app.route('/')
def index():
    """
    Main dashboard route.
    Renders the jobs already stored in the database right away; the page then
    starts the refresh cycle in the background via /api/refresh.
    """
    jobs = get_all_jobs()
    companies = get_all_companies()

    return render_template(
        'index.html',
        jobs=jobs,
        companies=companies,
        refresh_success=True,
        refresh_error="",
        new_jobs_count=0,
        scraper_urls=get_scraper_urls()
    )

@app.route('/api/refresh', methods=['POST'])
def api_refresh():
    """
    API endpoint to trigger a refresh from the UI (automatically on page load or manually).
    Returns status and statistics in JSON format, or 409 if a refresh is already running.
    """
    try:
        success, error_msg, new_count = perform_refresh_cycle()
    except RefreshInProgress:
        return jsonify({
            'success': False,
            'in_progress': True,
            'error': 'Вече тече обновяване. Изчакайте да приключи.'
        }), 409
    jobs = get_all_jobs()
    
    return jsonify({
        'success': success,
        'error': error_msg,
        'new_jobs_count': new_count,
        'total_jobs_count': len(jobs),
        'jobs': jobs,
        'companies': get_all_companies()
    })

@app.route('/api/job/flag', methods=['POST'])
def api_update_flag():
    """
    API endpoint to update the flag of a job listing.
    Expects JSON: { "url": "...", "flag": "red"|"green"|"yellow"|null }
    """
    data = request.get_json()
    if not data or 'url' not in data or 'flag' not in data:
        return jsonify({'success': False, 'error': 'Invalid request data.'}), 400
        
    url = data['url']
    flag = data['flag']
    
    # Validate flag value
    if flag not in [None, 'red', 'green', 'yellow', '']:
        return jsonify({'success': False, 'error': 'Invalid flag value.'}), 400
        
    # Standardize empty string/None representation
    if flag == '':
        flag = None
        
    success = update_job_flag(url, flag)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Failed to update flag in database.'})

@app.route('/api/job/status', methods=['POST'])
def api_update_job_status():
    """
    API endpoint to update one of the application-tracking icons on a job listing
    (CV sent / Interview scheduled / Offer or rejection received).
    Expects JSON: { "url": "...", "field": "cv_sent"|"interview_scheduled"|"offer_result", "value": "green"|"red"|null }
    """
    data = request.get_json()
    if not data or 'url' not in data or 'field' not in data:
        return jsonify({'success': False, 'error': 'Invalid request data.'}), 400

    url = data['url']
    field = data['field']
    value = data.get('value')

    if field not in ['cv_sent', 'interview_scheduled', 'offer_result']:
        return jsonify({'success': False, 'error': 'Invalid field.'}), 400
    if value not in [None, 'green', 'red']:
        return jsonify({'success': False, 'error': 'Invalid status value.'}), 400

    success = update_job_status(url, field, value)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Failed to update status in database.'})

@app.route('/api/company/update', methods=['POST'])
def api_update_company():
    """
    API endpoint to update a company's details.
    Expects JSON: { "id": int, "flag": string|null, "label": string|null, 
                    "parent_company_id": int|null, "display_name": string|null }
    """
    data = request.get_json()
    if not data or 'id' not in data:
        return jsonify({'success': False, 'error': 'Липсва ID на фирмата.'}), 400
        
    company_id = data['id']
    
    # Extract optional fields
    update_fields = {}
    for field in ['flag', 'label', 'parent_company_id', 'display_name']:
        if field in data:
            val = data[field]
            if val == '':
                val = None
            if field == 'parent_company_id' and val is not None:
                try:
                    val = int(val)
                except ValueError:
                    val = None
            update_fields[field] = val
            
    if not update_fields:
        return jsonify({'success': False, 'error': 'Няма посочени полета за актуализация.'}), 400
        
    success = update_company(company_id, **update_fields)
    if success:
        return jsonify({
            'success': True,
            'companies': get_all_companies(),
            'jobs': get_all_jobs()
        })
    else:
        return jsonify({
            'success': False, 
            'error': 'Грешка при записване или невалидна връзка (цикличност/двустепенна йерархия).'
        })
        
@app.route('/api/settings/update', methods=['POST'])
def api_update_settings():
    """
    API endpoint to update a search URL for a given source.
    Expects JSON: { "source": "dev.bg"|"jobs.bg"|"LinkedIn", "url": "..." }
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or 'source' not in data or not isinstance(data.get('url'), str):
        return jsonify({'success': False, 'error': 'Невалидни данни за заявката.'}), 400

    source = data['source']
    url = data['url'].strip()
    
    if source not in ['dev.bg', 'jobs.bg', 'LinkedIn']:
        return jsonify({'success': False, 'error': 'Невалиден източник.'}), 400
    if url != "":
        if not url.startswith('http://') and not url.startswith('https://'):
            return jsonify({'success': False, 'error': 'Адресът трябва да започва с http:// или https://.'}), 400
        
    success = update_scraper_url(source, url)
    if success:
        return jsonify({'success': True, 'scraper_urls': get_scraper_urls()})
    else:
        return jsonify({'success': False, 'error': 'Грешка при записване на настройките в базата данни.'})

@app.route('/api/database/clear', methods=['POST'])
def api_clear_database():
    """
    API endpoint to clear all jobs and companies from the database.
    Expects JSON: { "confirm": "CLEAR" }. Requiring a JSON body means a plain HTML
    form from another site cannot trigger it (on top of the Origin check).
    """
    data = request.get_json(silent=True)
    if not request.is_json or not isinstance(data, dict) or data.get('confirm') != 'CLEAR':
        return jsonify({'success': False, 'error': 'Липсва потвърждение за изчистване.'}), 400

    success = clear_jobs_and_companies()
    if success:
        return jsonify({
            'success': True,
            'jobs': get_all_jobs(),
            'companies': get_all_companies()
        })
    else:
        return jsonify({'success': False, 'error': 'Грешка при изчистване на базата данни.'})

if __name__ == '__main__':
    logger.info(f"Starting Flask server on port {PORT}...")
    app.run(host='127.0.0.1', port=PORT, debug=FLASK_DEBUG)
