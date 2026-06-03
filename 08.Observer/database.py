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
    """Fetches all saved job listings from the database."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs ORDER BY COALESCE(published_at, scraped_at) DESC, scraped_at DESC")
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
