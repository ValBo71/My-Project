import sqlite3
import logging
from config import DATABASE_PATH

logger = logging.getLogger(__name__)

def get_db_connection():
    """Establishes connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS jobs (
                    url TEXT PRIMARY KEY,
                    company TEXT NOT NULL,
                    title TEXT NOT NULL,
                    date_published TEXT,
                    requirements TEXT,
                    leave_days INTEGER,
                    salary_from INTEGER,
                    salary_to INTEGER,
                    description TEXT,
                    source TEXT DEFAULT 'dev.bg',
                    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    published_at TEXT
                )
            """)
            
            # Database Migration: Check if columns exist in case of an already existing table
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(jobs)")
            columns = [row['name'] for row in cursor.fetchall()]
            if 'source' not in columns:
                logger.info("Migrating database: adding 'source' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN source TEXT DEFAULT 'dev.bg'")
            if 'published_at' not in columns:
                logger.info("Migrating database: adding 'published_at' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN published_at TEXT")
            if 'flag' not in columns:
                logger.info("Migrating database: adding 'flag' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN flag TEXT DEFAULT NULL")
            if 'cv_sent' not in columns:
                logger.info("Migrating database: adding 'cv_sent' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN cv_sent TEXT DEFAULT NULL")
            if 'interview_scheduled' not in columns:
                logger.info("Migrating database: adding 'interview_scheduled' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN interview_scheduled TEXT DEFAULT NULL")
            if 'offer_result' not in columns:
                logger.info("Migrating database: adding 'offer_result' column to jobs table.")
                conn.execute("ALTER TABLE jobs ADD COLUMN offer_result TEXT DEFAULT NULL")

            # Backfill published_at for existing records where it is NULL
            cursor.execute("SELECT url, date_published FROM jobs WHERE published_at IS NULL")
            rows = cursor.fetchall()
            if rows:
                from parser import parse_date_to_timestamp
                to_update = []
                for row in rows:
                    url = row['url']
                    date_published = row['date_published']
                    if date_published and date_published != "N/A":
                        ts = parse_date_to_timestamp(date_published)
                        if ts:
                            to_update.append((ts, url))
                if to_update:
                    logger.info(f"Backfilling published_at for {len(to_update)} existing records.")
                    conn.executemany("UPDATE jobs SET published_at = ? WHERE url = ?", to_update)
                    
            # Migration to convert all date_published values to DD.MM.YYYY format
            cursor.execute("SELECT url, date_published, published_at, scraped_at FROM jobs")
            all_rows = cursor.fetchall()
            dates_to_update = []
            from datetime import datetime
            import re
            
            for row in all_rows:
                url = row['url']
                raw_date = row['date_published']
                pub_at = row['published_at']
                scraped = row['scraped_at']
                
                # Check if it's already in DD.MM.YYYY format
                if raw_date and re.match(r'^\d{2}\.\d{2}\.\d{4}$', raw_date.strip()):
                    continue
                    
                # If not, let's determine the correct formatted date
                new_date_str = None
                
                # 1. Try to use published_at if available
                if pub_at:
                    try:
                        if ' ' in pub_at:
                            dt = datetime.strptime(pub_at, '%Y-%m-%d %H:%M:%S')
                        else:
                            dt = datetime.strptime(pub_at, '%Y-%m-%d')
                        new_date_str = dt.strftime('%d.%m.%Y')
                    except Exception:
                        pass
                
                # 2. If published_at was not parsed, try to parse raw_date itself
                if not new_date_str and raw_date and raw_date != "N/A":
                    from parser import parse_date_to_timestamp
                    ts = parse_date_to_timestamp(raw_date)
                    if ts:
                        try:
                            dt = datetime.strptime(ts, '%Y-%m-%d %H:%M:%S')
                            new_date_str = dt.strftime('%d.%m.%Y')
                        except Exception:
                            pass
                            
                # 3. Fallback to scraped_at
                if not new_date_str and scraped:
                    try:
                        if ' ' in scraped:
                            dt = datetime.strptime(scraped, '%Y-%m-%d %H:%M:%S')
                        else:
                            dt = datetime.strptime(scraped, '%Y-%m-%d')
                        new_date_str = dt.strftime('%d.%m.%Y')
                    except Exception:
                        pass
                        
                # 4. Final fallback to today's date
                if not new_date_str:
                    new_date_str = datetime.now().strftime('%d.%m.%Y')
                    
                dates_to_update.append((new_date_str, url))
                
            if dates_to_update:
                logger.info(f"Migrating date_published to DD.MM.YYYY format for {len(dates_to_update)} records.")
                conn.executemany("UPDATE jobs SET date_published = ? WHERE url = ?", dates_to_update)
                
            # Create companies table if it doesn't exist
            conn.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    flag TEXT DEFAULT NULL,
                    label TEXT DEFAULT NULL,
                    parent_company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
                    display_name TEXT DEFAULT NULL
                )
            """)
            
            # Populate companies table with unique companies from jobs
            conn.execute("""
                INSERT OR IGNORE INTO companies (name)
                SELECT DISTINCT company FROM jobs WHERE company IS NOT NULL AND company != ''
            """)
            
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise
    finally:
        conn.close()

def save_job(job_data):
    """
    Saves a job listing to the database.
    Ignores insertion if the job URL already exists.
    Returns True if a new job was inserted, False otherwise.
    """
    conn = get_db_connection()
    try:
        with conn:
            from parser import parse_date_to_timestamp
            from datetime import datetime
            
            raw_date = job_data.get('date_published')
            published_at = parse_date_to_timestamp(raw_date)
            
            if published_at:
                try:
                    dt = datetime.strptime(published_at, '%Y-%m-%d %H:%M:%S')
                    formatted_date = dt.strftime('%d.%m.%Y')
                except Exception as ex:
                    logger.error(f"Error parsing date {published_at} for formatting: {ex}")
                    now = datetime.now()
                    formatted_date = now.strftime('%d.%m.%Y')
                    published_at = now.strftime('%Y-%m-%d %H:%M:%S')
            else:
                now = datetime.now()
                formatted_date = now.strftime('%d.%m.%Y')
                published_at = now.strftime('%Y-%m-%d %H:%M:%S')
            
            # Ensure the company exists in the companies table
            if job_data.get('company'):
                conn.execute("""
                    INSERT OR IGNORE INTO companies (name)
                    VALUES (?)
                """, (job_data['company'],))
                
            # We use INSERT OR IGNORE to prevent duplicate entries based on the URL primary key
            cursor = conn.execute("""
                INSERT OR IGNORE INTO jobs (
                    url, company, title, date_published, requirements, 
                    leave_days, salary_from, salary_to, description, source, published_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                job_data['url'],
                job_data['company'],
                job_data['title'],
                formatted_date,
                job_data['requirements'],
                job_data['leave_days'],
                job_data['salary_from'],
                job_data['salary_to'],
                job_data['description'],
                job_data.get('source', 'dev.bg'),
                published_at
            ))
            # cursor.rowcount will be 1 if a row was inserted, 0 if ignored
            return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error saving job {job_data.get('url')}: {e}")
        return False
    finally:
        conn.close()

def get_all_jobs():
    """Fetches all saved job listings from the database with resolved company info and inherited flags."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                j.url,
                j.company,
                j.title,
                j.date_published,
                j.requirements,
                j.leave_days,
                j.salary_from,
                j.salary_to,
                j.description,
                j.source,
                j.scraped_at,
                j.published_at,
                j.cv_sent,
                j.interview_scheduled,
                j.offer_result,
                COALESCE(
                    (SELECT p.flag FROM companies p WHERE p.id = c.parent_company_id AND p.flag IS NOT NULL AND p.flag != ''),
                    c.flag,
                    j.flag
                ) AS flag,
                c.id AS company_id,
                COALESCE(
                    (SELECT p.flag FROM companies p WHERE p.id = c.parent_company_id AND p.flag IS NOT NULL AND p.flag != ''),
                    c.flag
                ) AS company_flag,
                c.label AS company_label,
                c.parent_company_id AS company_parent_id,
                COALESCE(
                    (SELECT COALESCE(p.display_name, p.name) FROM companies p WHERE p.id = c.parent_company_id),
                    c.display_name,
                    c.name,
                    j.company
                ) AS resolved_company
            FROM jobs j
            LEFT JOIN companies c ON j.company = c.name
            ORDER BY COALESCE(j.published_at, j.scraped_at) DESC, j.scraped_at DESC
        """)
        rows = cursor.fetchall()
        # Convert sqlite3.Row items to standard dictionaries
        jobs = [dict(row) for row in rows]
        return jobs
    except Exception as e:
        logger.error(f"Error retrieving jobs: {e}")
        return []
    finally:
        conn.close()

def job_exists(url):
    """Checks if a job listing already exists in the database by its URL."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM jobs WHERE url = ?", (url,))
        return cursor.fetchone() is not None
    except Exception as e:
        logger.error(f"Error checking job existence for URL {url}: {e}")
        return False
    finally:
        conn.close()

def refresh_job_if_reposted(url, fresh_date_published):
    """
    Detects whether an already-known job listing has been reposted/renewed by
    the company (same URL, but the site now shows a newer publish date) and,
    if so, bumps its date_published/published_at/scraped_at so it moves back
    to the top of the recency-sorted view instead of staying buried under its
    original scrape date.

    Only the date fields are touched - user-tracking fields (flag, cv_sent,
    interview_scheduled, offer_result) and previously scraped content
    (description, requirements, salary) are left untouched.

    Returns True if the job was bumped as a repost, False otherwise
    (including when the job doesn't exist yet, or the fresh date isn't newer).
    """
    from parser import parse_date_to_timestamp
    from datetime import datetime

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT published_at FROM jobs WHERE url = ?", (url,))
        row = cursor.fetchone()
        if row is None:
            return False  # job doesn't exist yet - not our concern here

        fresh_ts = parse_date_to_timestamp(fresh_date_published)
        if not fresh_ts:
            return False  # couldn't determine a real date for the fresh listing

        stored_published_at = row['published_at'] or ''
        fresh_day = fresh_ts.split(' ')[0]
        stored_day = stored_published_at.split(' ')[0]

        if stored_day and fresh_day <= stored_day:
            return False  # not newer than what we already have - nothing to do

        with conn:
            formatted_date = datetime.strptime(fresh_ts, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y')
            update_cursor = conn.execute("""
                UPDATE jobs
                SET date_published = ?, published_at = ?, scraped_at = CURRENT_TIMESTAMP
                WHERE url = ?
            """, (formatted_date, fresh_ts, url))
            if update_cursor.rowcount > 0:
                logger.info(f"Repost detected for {url}: bumped publish date to {formatted_date}.")
                return True
            return False
    except Exception as e:
        logger.error(f"Error refreshing repost date for {url}: {e}")
        return False
    finally:
        conn.close()

def update_job_flag(url, flag):
    """Updates the flag/color indicator of a job listing."""
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("UPDATE jobs SET flag = ? WHERE url = ?", (flag, url))
            return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating flag for job {url}: {e}")
        return False
    finally:
        conn.close()

# Columns that back the tri-state application-tracking icons (CV sent / Interview / Offer).
JOB_STATUS_FIELDS = {'cv_sent', 'interview_scheduled', 'offer_result'}

def update_job_status(url, field, value):
    """Updates one of the application-tracking status fields for a job listing.
    'value' is one of None, 'green', 'red'."""
    if field not in JOB_STATUS_FIELDS:
        logger.error(f"Attempted to update invalid job status field: {field}")
        return False

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute(f"UPDATE jobs SET {field} = ? WHERE url = ?", (value, url))
            return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating {field} for job {url}: {e}")
        return False
    finally:
        conn.close()

def get_all_companies():
    """Fetches all companies with job counts, parent info, and resolved names."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.id,
                c.name,
                c.flag,
                c.label,
                c.parent_company_id,
                c.display_name,
                (SELECT COUNT(*) FROM jobs j WHERE j.company = c.name) AS job_count,
                COALESCE(
                    (SELECT COALESCE(p.display_name, p.name) FROM companies p WHERE p.id = c.parent_company_id),
                    c.display_name,
                    c.name
                ) AS resolved_name
            FROM companies c
            ORDER BY LOWER(c.name) ASC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Error retrieving companies: {e}")
        return []
    finally:
        conn.close()

def update_company(company_id, **kwargs):
    """Updates company attributes. kwargs contains field-value pairs to update."""
    if not kwargs:
        return False
        
    conn = get_db_connection()
    try:
        with conn:
            # Validate parent_company_id to prevent circular references and self-linking
            if 'parent_company_id' in kwargs:
                parent_id = kwargs['parent_company_id']
                if parent_id is not None:
                    # Cast to int to ensure correct comparison
                    if int(parent_id) == int(company_id):
                        return False
                        
                    # Verify target parent is not an alias itself
                    cursor = conn.execute("SELECT parent_company_id FROM companies WHERE id = ?", (parent_id,))
                    row = cursor.fetchone()
                    if row and row['parent_company_id'] is not None:
                        # Parent cannot be an alias
                        return False
                        
                # Enforce flat hierarchy: if this company is updated to point to a parent,
                # any company that currently points to this company as parent must be detached.
                conn.execute("UPDATE companies SET parent_company_id = NULL WHERE parent_company_id = ?", (company_id,))
            
            # Construct dynamic UPDATE query
            set_clauses = []
            params = []
            for key, val in kwargs.items():
                if key in ['flag', 'label', 'parent_company_id', 'display_name']:
                    set_clauses.append(f"{key} = ?")
                    # Standardize empty strings to None/NULL
                    if val == '':
                        val = None
                    params.append(val)
                    
            if not set_clauses:
                return False
                
            params.append(company_id)
            query = f"UPDATE companies SET {', '.join(set_clauses)} WHERE id = ?"
            cursor = conn.execute(query, params)
            return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Error updating company {company_id}: {e}")
        return False
    finally:
        conn.close()
