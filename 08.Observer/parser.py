from bs4 import BeautifulSoup
import re
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def parse_job_listings(html_content):
    """
    Parses the main dev.bg job search list page.
    Returns a list of dictionaries representing the parsed jobs.
    Each job has: company, title, url, date_published, requirements.
    """
    if not html_content:
        return []
        
    soup = BeautifulSoup(html_content, "lxml")
    items = soup.find_all("div", class_="job-list-item")
    
    parsed_jobs = []
    for item in items:
        try:
            # 1. Company Name
            company_tag = item.find(class_="company-name")
            company = company_tag.get_text(strip=True) if company_tag else "N/A"
            
            # 2. Job Title
            title_tag = item.find(class_="job-title")
            title = title_tag.get_text(strip=True) if title_tag else "N/A"
            
            # 3. URL Link
            link_tag = item.find("a", class_="overlay-link")
            url = link_tag.get("href") if link_tag else None
            if not url:
                continue  # Skip listings without a valid link
                
            # 4. Date published
            date_tag = item.find(class_="date")
            date_published = date_tag.get_text(strip=True) if date_tag else "N/A"
            
            # 5. Requirements (Tech stack icons)
            tech_stack = []
            ts_wrap = item.find(class_="tech-stack-wrap")
            if ts_wrap:
                images = ts_wrap.find_all("img")
                for img in images:
                    img_title = img.get("title")
                    if img_title:
                        tech_stack.append(img_title)
            
            requirements = ", ".join(tech_stack) if tech_stack else "N/A"
            
            # 6. Salary (direct from listing badge)
            salary_from = None
            salary_to = None
            
            badges = item.find_all(class_=lambda c: c and "badge" in c)
            for badge in badges:
                badge_text = badge.get_text(strip=True)
                if any(curr in badge_text for curr in ["BGN", "лв", "EUR", "€"]):
                    import copy
                    badge_clone = copy.copy(badge)
                    for child in badge_clone.find_all(class_=["hidden-text", "badge-tooltip", "tooltip"]):
                        child.decompose()
                    clean_text = badge_clone.get_text(strip=True)
                    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                    
                    range_match = re.search(r'(\d[\d\s]*)\s*[-–—]\s*(\d[\d\s]*)', clean_text)
                    if range_match:
                        try:
                            val_from = int(re.sub(r'\s+', '', range_match.group(1)))
                            val_to = int(re.sub(r'\s+', '', range_match.group(2)))
                            
                            is_eur = any(curr in clean_text for curr in ["EUR", "€"])
                            if is_eur:
                                val_from = int(val_from * 1.95583)
                                val_to = int(val_to * 1.95583)
                                
                            salary_from = val_from
                            salary_to = val_to
                            break
                        except ValueError:
                            pass
                    else:
                        single_match = re.search(r'(\d[\d\s]*)\+', clean_text)
                        if single_match:
                            try:
                                val = int(re.sub(r'\s+', '', single_match.group(1)))
                                if any(curr in clean_text for curr in ["EUR", "€"]):
                                    val = int(val * 1.95583)
                                salary_from = val
                                break
                            except ValueError:
                                pass
            
            parsed_jobs.append({
                'company': company,
                'title': title,
                'url': url,
                'date_published': date_published,
                'requirements': requirements,
                'salary_from': salary_from,
                'salary_to': salary_to
            })
        except Exception as e:
            logger.error(f"Error parsing job list item: {e}")
            
    return parsed_jobs

def extract_leave_days(text):
    """
    Extracts the number of paid annual leave days from text using regex.
    Returns the number of days as an integer, or None.
    """
    if not text:
        return None
        
    # Match patterns like:
    # "25 days of paid vacation", "20 days paid leave", "25 days of paid annual leave", "vacation of 25 days"
    # "20 дни платен отпуск", "24 дена отпуск", "25 дни годишен отпуск", "платен отпуск от 20 дни"
    patterns = [
        # BG patterns
        r'(\d+)\s*(?:дни|дена|дни\s+платен|дена\s+платен|годишен|работни\s+дни)\s*(?:платен|годишен)?\s*отпуск',
        r'(?:платен|годишен)\s*отпуск\s*(?:от|на)?\s*(\d+)\s*(?:дни|дена)?',
        # EN patterns
        r'(\d+)\s*(?:days?)\s*(?:of\s+)?(?:paid\s+)?(?:annual\s+)?(?:vacation|leave|holiday|time\s+off)',
        r'(?:paid\s+)?(?:annual\s+)?(?:vacation|leave|holiday|time\s+off)\s+(?:of|up\s+to)?\s*(\d+)\s*(?:days?)?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                days = int(match.group(1))
                if 10 <= days <= 100:  # Sanity check for realistic vacation range
                    return days
            except ValueError:
                pass
                
    return None

def extract_salary(text, soup):
    """
    Extracts the salary range (from/to) from the detail text and badges.
    Returns (salary_from, salary_to) as a tuple of integers/None.
    """
    salary_from = None
    salary_to = None
    
    # 1. First, search for any badges containing currency symbols
    # Some job boards display salary in a dedicated badge (e.g. "3000 - 5000 BGN")
    for badge in soup.find_all(class_=re.compile(r"badge|salary|money|price|pay")):
        badge_text = badge.get_text(strip=True)
        if any(curr in badge_text for curr in ["BGN", "лв", "EUR", "€"]):
            # Look for ranges in badge: "3000 - 5000 BGN", "4 000 - 6 000 лв", "3k - 5k"
            range_match = re.search(r'(\d[\d\s]*)\s*[-–—]\s*(\d[\d\s]*)', badge_text)
            if range_match:
                try:
                    val_from = int(re.sub(r'\s+', '', range_match.group(1)))
                    val_to = int(re.sub(r'\s+', '', range_match.group(2)))
                    
                    is_eur = any(curr in badge_text for curr in ["EUR", "€"])
                    if is_eur:
                        val_from = int(val_from * 1.95583)
                        val_to = int(val_to * 1.95583)
                        
                    return val_from, val_to
                except ValueError:
                    pass
            # Single value like "5000+ BGN"
            single_match = re.search(r'(\d[\d\s]*)\+', badge_text)
            if single_match:
                try:
                    val = int(re.sub(r'\s+', '', single_match.group(1)))
                    is_eur = any(curr in badge_text for curr in ["EUR", "€"])
                    if is_eur:
                        val = int(val * 1.95583)
                    return val, None
                except ValueError:
                    pass
                    
    # 2. Parse text of description using regex
    if text:
        # Match patterns like:
        # "3000 - 5000 BGN", "4500 - 6500 BGN", "3000 - 5000 лв", "3000 to 5000 EUR", "3 000 - 5 000 лв."
        # Note: We strip whitespace inside numbers
        patterns = [
            # Range with currency: "3000 - 5000 BGN"
            r'(\d[\d\s,]*)\s*(?:-|to|–|—)\s*(\d[\d\s,]*)\s*(?:BGN|EUR|лв|лв\.|Euro|€)',
            # Currency first: "EUR 3000 - 5000"
            r'(?:BGN|EUR|лв|лв\.|Euro|€)\s*(\d[\d\s,]*)\s*(?:-|to|–|—)\s*(\d[\d\s,]*)',
            # Word-based: "заплата от 3000 до 5000"
            r'(?:заплат[аи]|salary|възнаграждение|чисто)\s*(?:от|from)?\s*(\d[\d\s,]*)\s*(?:до|to)\s*(\d[\d\s]*)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    # Clear whitespace and commas
                    from_str = re.sub(r'[\s,]+', '', match.group(1))
                    to_str = re.sub(r'[\s,]+', '', match.group(2))
                    
                    val_from = int(from_str)
                    val_to = int(to_str)
                    
                    if 500 <= val_from <= 50000 and 500 <= val_to <= 50000:
                        matched_text = match.group(0).upper()
                        is_eur = any(curr in matched_text for curr in ["EUR", "EURO", "€"])
                        if is_eur:
                            val_from = int(val_from * 1.95583)
                            val_to = int(val_to * 1.95583)
                        return val_from, val_to
                except ValueError:
                    pass
                    
    return salary_from, salary_to

def extract_tech_stack_from_text(text):
    """
    Scans the description text for known technologies/tools and returns a list.
    """
    if not text:
        return "N/A"
        
    techs = [
        "Python", "Java", "C#", "C\\+\\+", "Go", "Rust", "Ruby", "PHP", 
        "JavaScript", "TypeScript", "JS", "TS", "HTML", "CSS", "SQL", "NoSQL",
        "Selenium", "Playwright", "Cypress", "Appium", "Postman", "SoapUI", 
        "Jmeter", "Robot Framework", "Cucumber", "SpecFlow", "JUnit", "TestNG",
        "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Jenkins", 
        "GitLab CI", "GitHub Actions", "CI/CD", "Jira", "Confluence", "Agile", "Scrum"
    ]
    
    found_techs = []
    for tech in techs:
        pattern = r'\b' + tech + r'\b'
        if tech == "C\\+\\+":
            pattern = r'\bC\+\+'
        
        if re.search(pattern, text, re.IGNORECASE):
            display_name = tech.replace(r'\\', '').replace(r'\+', '+')
            if display_name == "JS": display_name = "JavaScript"
            if display_name == "TS": display_name = "TypeScript"
            if display_name not in found_techs:
                found_techs.append(display_name)
                
    return ", ".join(found_techs) if found_techs else "N/A"

def parse_job_detail_page(html_content):
    """
    Parses an individual job detail page.
    Extracts:
      - description (full text)
      - leave_days (integer or None)
      - salary_from (integer or None)
      - salary_to (integer or None)
    """
    if not html_content:
        return {
            'description': 'N/A',
            'leave_days': None,
            'salary_from': None,
            'salary_to': None
        }
        
    soup = BeautifulSoup(html_content, "lxml")
    
    # Locate the job description container
    desc_tag = soup.find(class_="job_description")
    if not desc_tag:
        # Fallback if class changes
        desc_tag = soup.find(class_=re.compile("description|content|job-details"))
        
    if desc_tag:
        # Get full description text with HTML spacing preserved
        # We can extract paragraphs or clean text
        description = desc_tag.get_text("\n", strip=True)
    else:
        # If no specific container found, get all body text as fallback
        description = soup.body.get_text("\n", strip=True) if soup.body else "N/A"
        
    # Extract leave days
    leave_days = extract_leave_days(description)
    
    # Extract salary
    salary_from, salary_to = extract_salary(description, soup)
    
    return {
        'description': description,
        'leave_days': leave_days,
        'salary_from': salary_from,
        'salary_to': salary_to
    }

def parse_date_to_timestamp(date_str):
    """
    Parses a human-readable job posting date string to a normalized ISO timestamp string.
    Supports LinkedIn relative formats ("12 hours ago", "3 days ago") and
    dev.bg Bulgarian formats ("днес", "вчера", "28 май").
    """
    if not date_str or date_str == "N/A":
        return None
        
    date_str = date_str.strip()
    if re.match(r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$', date_str):
        return date_str
        
    # YYYY-MM-DD
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return f"{date_str} 12:00:00"
        
    # DD.MM.YYYY
    match_dd_mm_yyyy = re.match(r'^(\d{2})\.(\d{2})\.(\d{4})$', date_str)
    if match_dd_mm_yyyy:
        day = int(match_dd_mm_yyyy.group(1))
        month = int(match_dd_mm_yyyy.group(2))
        year = int(match_dd_mm_yyyy.group(3))
        try:
            dt = datetime(year, month, day, 12, 0, 0)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            pass
            
    now = datetime.now()
    ds = date_str.lower().strip()
    
    # Remove LinkedIn prefix "posted "
    if ds.startswith("posted"):
        ds = ds[len("posted"):].strip()
        
    # Check for LinkedIn relative times: minutes/hours/days/weeks/months ago
    match = re.search(r'(\d+)\s+(minute|hour|day|week|month|min|hr|wk)s?\s+ago', ds)
    if match:
        val = int(match.group(1))
        unit = match.group(2)
        if "min" in unit:
            return (now - timedelta(minutes=val)).strftime('%Y-%m-%d %H:%M:%S')
        elif "hour" in unit or "hr" in unit:
            return (now - timedelta(hours=val)).strftime('%Y-%m-%d %H:%M:%S')
        elif "day" in unit:
            return (now - timedelta(days=val)).strftime('%Y-%m-%d %H:%M:%S')
        elif "week" in unit or "wk" in unit:
            return (now - timedelta(weeks=val)).strftime('%Y-%m-%d %H:%M:%S')
        elif "month" in unit:
            return (now - timedelta(days=val * 30)).strftime('%Y-%m-%d %H:%M:%S')
            
    # dev.bg words: "днес" / "вчера"
    if ds == "днес":
        return now.strftime('%Y-%m-%d 12:00:00')
    elif ds == "вчера":
        return (now - timedelta(days=1)).strftime('%Y-%m-%d 12:00:00')
        
    # jobs.bg date format: "28.05.26" (DD.MM.YY)
    match_jobs = re.match(r'^(\d{2})\.(\d{2})\.(\d{2})$', ds)
    if match_jobs:
        day = int(match_jobs.group(1))
        month = int(match_jobs.group(2))
        year = int("20" + match_jobs.group(3))
        try:
            dt = datetime(year, month, day, 12, 0, 0)
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            pass
        
    # dev.bg month names: "28 май", "8 май", "19 май"
    months_bg = {
        "януари": 1, "февруари": 2, "март": 3, "април": 4, "май": 5, "юни": 6,
        "юли": 7, "август": 8, "септември": 9, "октомври": 10, "ноември": 11, "декември": 12
    }
    match = re.match(r'(\d+)\s+([а-я]+)', ds)
    if match:
        day = int(match.group(1))
        month_name = match.group(2)
        if month_name in months_bg:
            month = months_bg[month_name]
            year = now.year
            # In case we parse an older year or transition over New Year:
            if month > now.month and now.month == 1:
                year -= 1
            try:
                dt = datetime(year, month, day, 12, 0, 0)
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                pass
                
    return None
