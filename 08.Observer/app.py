from flask import Flask, render_template, jsonify, request
import logging
import os
import sys

# Add current directory to python path to avoid import issues
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from config import DEV_BG_URL, PORT, FLASK_DEBUG
from database import init_db, save_job, get_all_jobs
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

def perform_refresh_cycle():
    """
    Coordinates the scraping, parsing, and DB saving workflow.
    Returns:
        tuple: (success_boolean, error_message_string, new_jobs_count)
    """
    new_jobs_saved = 0
    errors = []
    
    # --- Part 1: Scrape dev.bg ---
    try:
        logger.info(f"Starting refresh cycle from URL: {DEV_BG_URL}")
        main_html = fetch_html(DEV_BG_URL)
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
        
    # --- Part 2: Scrape LinkedIn ---
    try:
        linkedin_jobs = scrape_linkedin_jobs()
        for job in linkedin_jobs:
            if save_job(job):
                new_jobs_saved += 1
    except Exception as e:
        logger.error(f"Error during LinkedIn scrape: {e}")
        errors.append(f"LinkedIn error: {e}")
        
    # --- Part 3: Scrape jobs.bg ---
    try:
        jobs_bg_jobs = scrape_jobs_bg_jobs()
        for job in jobs_bg_jobs:
            if save_job(job):
                new_jobs_saved += 1
    except Exception as e:
        logger.error(f"Error during jobs.bg scrape: {e}")
        errors.append(f"jobs.bg error: {e}")
        
    # Success is True if at least one source worked or if no errors occurred
    success = len(errors) < 3
    error_msg = "; ".join(errors) if errors else ""
    
    logger.info(f"Refresh completed. Saved {new_jobs_saved} new jobs in total.")
    return success, error_msg, new_jobs_saved

@app.route('/')
def index():
    """
    Main dashboard route.
    Performs an automatic refresh cycle. If the refresh fails, 
    displays an error notification but still loads the existing database jobs.
    """
    # 1. Run the refresh cycle
    success, error_msg, new_count = perform_refresh_cycle()
    
    # 2. Retrieve all jobs from the database (both old and newly scraped)
    jobs = get_all_jobs()
    
    return render_template(
        'index.html',
        jobs=jobs,
        refresh_success=success,
        refresh_error=error_msg,
        new_jobs_count=new_count
    )

@app.route('/api/refresh', methods=['POST'])
def api_refresh():
    """
    API endpoint to trigger a manual refresh from the UI.
    Returns status and statistics in JSON format.
    """
    success, error_msg, new_count = perform_refresh_cycle()
    jobs = get_all_jobs()
    
    return jsonify({
        'success': success,
        'error': error_msg,
        'new_jobs_count': new_count,
        'total_jobs_count': len(jobs),
        'jobs': jobs
    })

if __name__ == '__main__':
    logger.info(f"Starting Flask server on port {PORT}...")
    app.run(host='127.0.0.1', port=PORT, debug=FLASK_DEBUG)
