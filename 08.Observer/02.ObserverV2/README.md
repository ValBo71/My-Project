# Jobs Tracker (Observer v2)

This is a web application developed in **Python (Flask)** and **SQLite** that automatically scrapes, processes, and visualizes job advertisements from **dev.bg**, **LinkedIn**, and **jobs.bg**.

This version (**Observer v2**) is an upgraded version of the original observer project, featuring fully customizable scraping URLs, optional/selective scraping, database reset capabilities, and updated port configuration.

---

## Key Upgrades in Version 2

1. **Configurable Scraping URLs (Settings Panel):**
   * A new **"Настройки" (Settings)** tab has been added to the UI dashboard.
   * Users can dynamically modify, save, or reset search links for **dev.bg**, **Jobs.bg**, and **LinkedIn** directly from the web interface.
   * URL configurations are persisted inside a dedicated SQLite table (`scraper_urls`).

2. **Optional & Selective Scraping:**
   * URL input fields are optional. 
   * If a search link is cleared/left empty, the application will automatically skip that platform during the refresh cycle.
   * If even a single URL is configured, the system will process only that active source and run without errors.

3. **Database Reset ("Danger Zone"):**
   * Added a **"Изчисти базата данни" (Clear database)** button under the Settings tab.
   * Allows deleting all job listings and registered companies while retaining the current scraper URLs.

4. **Port & Process Isolation:**
   * Configured to run on port **`5001`** (instead of `5000`) to run alongside the original project without port conflicts.

---

## Core Features

* **Multi-Source Scraping:**
  * **dev.bg**: Rapid parallel scraping (`ThreadPoolExecutor`) of detail pages, with direct salary badge extraction.
  * **LinkedIn**: Scrapes listings using **Playwright** with session cookies to bypass login walls.
  * **jobs.bg**: Specialized scraper bypassing DataDome protection and extracting descriptions from inline iframes.
* **Chronological Sorting & Date Standardization:**
  * Dates are standardized in `DD.MM.YYYY` format and sorted globally.
* **Salary & Currency Standardization:**
  * Automatic conversion of salaries in EUR to BGN.
* **Premium Glassmorphism UI:**
  * Clean layout optimized for widescreen displays with zero horizontal scrollbars.
  * Interactive modal displaying company statistics (total listings and duplicate counts).
* **Smart Filtering & Real-time Search:**
  * Search by company, title, or tech stack. Filter by platform, date, location (Remote/Hybrid/Sofia), salary/leave availability, flag status, and application-tracking stage.
* **Application Tracking (Проследяване Column):**
  * Three per-listing icons record application progress - **CV sent**, **Interview scheduled**, and **Offer / rejection received** - each cycling neutral → green → red and persisted in SQLite (`cv_sent`, `interview_scheduled`, `offer_result`).
  * On the result icon, green marks a received **offer** and red a **rejection**.
  * The sidebar "Проследяване" filter narrows the table to a single stage: *All*, *Not tracked*, *CV sent*, *Interview scheduled*, *Offer received*, or *Rejected*. Offer and rejection are separate options because they are opposite outcomes of the same icon.
  * Composes with all other filters, and re-applies immediately when an icon is toggled, so rows leave or enter the current view without a refresh.
* **Categorization Flags & Aliases:**
  * Assign color flags (green, yellow, red) to listings and companies.
  * Link aliases/spelling variations of companies under a single resolved company to consolidate views and statistics.

---

## Project Structure

```text
02.ObserverV2/
│
├── run.bat                     # Windows startup file (installs dependencies, runs on port 5001)
├── run_mac.command             # macOS startup file (self-installing, same setup as run.bat)
├── app.py                      # Flask server, API endpoints, and web controllers
├── config.py                   # Global configuration settings (port 5001, defaults)
├── database.py                 # Database schemas, scraper_urls initialization, and CRUD operations
├── scraper.py                  # Scraping engines (Playwright & urllib requests with optional arguments)
├── parser.py                   # RegEx & BeautifulSoup parsing utility
├── linkedin_credentials.json   # Local credentials for LinkedIn access
├── linkedin_session.json       # Saved session cookies for LinkedIn
├── jobs.db                     # SQLite database file (created and migrated automatically)
├── manual.md                   # Short guide for setup and running the application (Bulgarian)
├── app.log                     # Log output tracking scraping and server events
│
├── static/
│   └── css/
│       └── styles.css          # Premium layout styling with Glassmorphism and responsive design
│
└── templates/
    └── index.html              # Main dashboard and tabbed panels
```

---

## Execution Instructions

### Automatic Startup (Windows)
Double-click the **`run.bat`** file in this directory. The script will install the required Python packages (Flask, BeautifulSoup4, lxml, Playwright), download the Chromium browser Playwright needs for LinkedIn/jobs.bg scraping, start the server, and open the app in your default browser.

### Automatic Startup (macOS)
Double-click the **`run_mac.command`** file in Finder (or run `./run_mac.command` in Terminal). It does the same setup as `run.bat`: finds a Python 3 interpreter (or downloads a portable one if none is installed), installs the required packages and Chromium, starts the server, and opens the app in your default browser.

If macOS blocks the first run ("unidentified developer"), allow it once via System Settings → Privacy & Security, or run `chmod +x run_mac.command` in Terminal first.

### Manual Startup (Cross-Platform)

1. **Install dependencies:**
   ```bash
   pip install flask beautifulsoup4 lxml playwright
   playwright install chromium
   ```

2. **LinkedIn Auth Setup (Optional):**
   Configure your email and password in `linkedin_credentials.json`:
   ```json
   {
     "email": "your_email@example.com",
     "password": "your_password"
   }
   ```

3. **Start the application:**
   ```bash
   python app.py
   ```

4. **Access the Web Dashboard:**
   Open your browser and navigate to: **`http://127.0.0.1:5001`**
