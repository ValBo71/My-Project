# dev.bg, LinkedIn & jobs.bg Automation QA Jobs Tracker

This is a web application developed in **Python (Flask)** and **SQLite** that automatically scrapes, processes, and visualizes job advertisements for **Automation QA** roles from **dev.bg**, **LinkedIn**, and **jobs.bg**.

---

## Key Features

1. **Multi-Source Scraping:**
   * **dev.bg**: Rapid parallel scraping (`ThreadPoolExecutor`) of detail pages, enhanced by direct salary badge extraction from main listing pages with automatic BGN conversion.
   * **LinkedIn**: Automated scraping using **Playwright** with session cookies support to bypass login walls and CAPTCHAs.
   * **jobs.bg**: Specialized scraper bypassing DataDome protection, with support for extracting descriptions from both standard elements and inline sandboxes (iframes).

2. **Date Standardization & Chronological Sorting:**
   * Standardized date storage and display in `DD.MM.YYYY` format (e.g., `03.06.2026`) rather than relative times (e.g. *"15 minutes ago"*, *"today"*), preventing data from becoming outdated.
   * Automatic database migration during initialization to backfill and convert old relative dates.
   * Global chronological sorting with the newest listings at the top.

3. **Disclosed Salary & Currency Standardization:**
   * Direct parsing of salary ranges from the listing page badges (dev.bg).
   * Automatic conversion of salaries published in Euro (€/EUR) to Bulgarian Lev (BGN) at the BNB exchange rate (1.95583) for UI consistency.

4. **Premium UI with Layout Optimization:**
   * Modern light dashboard interface with Glassmorphism effects and statistic cards.
   * Layout optimized for widescreen displays (max width `1650px` with tight cell padding) to display all columns cleanly on desktop without horizontal viewport scrollbars.
   * Interactive modal window showing company advertisement statistics (total ads and duplicate count over the past week, month, and year).

5. **Smart Filtering & Real-time Search:**
   * Instant search by company, position, or technology stack.
   * Filtering by source (`dev.bg` / `LinkedIn` / `jobs.bg`).
   * Filtering by publication date (Today / Last 3 Days / Last 7 Days).
   * Filtering by location (Remote / Hybrid / Sofia) and indicators (Only showing listings with salary / leave details).
   * Filtering by color/flag status (All / No Flag / Green / Yellow / Red).

6. **Duplicate Prevention & Performance:**
   * Unique URLs are used as primary keys in SQLite to prevent duplicate entries.
   * Client-side data caching makes opening company statistics instant, with zero database load.

7. **Job Categorization Flags & Subtle Highlighting:**
   * Interactive flag selection (green for suitable, yellow for interesting, red for unsuitable, or clear) available directly on each row via a dropdown menu.
   * Persistence of flags in SQLite database.
   * Row backgrounds highlighted dynamically using premium, subtle pastel tints to preserve design aesthetics and hover feedback, avoiding bright "screaming" colors.

8. **Companies Tab, Alias Grouping & Flag Inheritance:**
   * **Dedicated Tab**: Switch to the "Фирми" (Companies) tab to manage all registered companies in a single place.
   * **Spelling Aliases & Connections**: Link spelling variations of the same company (e.g. "DraftKings Bulgaria" and "Draft Kings" under "DraftKings") to group them under a single resolved name on the main dashboard. Enforces a flat hierarchy to prevent circular dependencies.
   * **Custom Display Names**: Assign a custom display name override (e.g. "DraftKings Inc.") for primary companies.
   * **Company Flags & Labels**: Set color flags (Green, Yellow, Red) and custom text labels directly on companies. These markers are displayed next to the company name on the main jobs page.
   * **Automatic Flag Inheritance**: Jobs automatically inherit the flag status of their company (or its parent company if it is an alias) in real-time, coloring all job rows from that company.
   * **Grouped Statistics**: The company statistics modal automatically groups and aggregates job counts and repetitions across all spelling variations in a connected company group.

---

## Project Structure

```text
Observer/
│
├── run.bat                     # Windows startup file (installs dependencies, starts server, opens Firefox)
├── app.py                      # Main Flask server, API and web routes
├── config.py                   # Configuration file (target URLs, DB paths, settings)
├── database.py                 # SQLite database layer (schemas, migrations, and CRUD operations)
├── scraper.py                  # Scraping engines (urllib, Playwright LinkedIn/jobs.bg)
├── parser.py                   # Regex & BeautifulSoup selectors for parsing salaries, leave days, and dates
├── linkedin_credentials.json   # Local credentials for LinkedIn access (not uploaded to GitHub)
├── linkedin_session.json       # Preserved session state for LinkedIn
├── jobs.db                     # SQLite database file (created automatically on startup)
├── app.log                     # Application log file for process tracking (created automatically)
│
├── static/
│   └── css/
│       └── styles.css          # Premium layout styling with Glassmorphism and responsive design
│
└── templates/
    └── index.html              # Main dashboard and stats dashboard template
```

---

## Execution Instructions

### Automatic Startup (Windows)
Double-click the **`run.bat`** file in the root directory of the project. The script will automatically install the required Python packages (Flask, BeautifulSoup4, lxml, Playwright), download the Chromium browser Playwright needs for LinkedIn/jobs.bg scraping, start the server, and open the app in your default browser.

### Manual Startup (Cross-Platform)

1. **Install dependencies and the web browser:**
   ```bash
   pip install flask beautifulsoup4 lxml playwright
   playwright install chromium
   ```

2. **LinkedIn Authentication Setup (Optional):**
   Create or edit the local `linkedin_credentials.json` file in the root directory to supply your account details:
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
   Open your browser and navigate to: `http://127.0.0.1:5000`
