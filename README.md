# QA Automation & Software Engineering Portfolio

Welcome to my portfolio! Here you will find various projects, tasks, and practical applications in the fields of software testing, automation, and web development, created during my training at **Telerik Academy** as well as personal practice projects.

---

## 📂 Repository Structure

The projects are logically organized by categories and technology stack:

### 🔍 1. Web Projects (`01. WEB project`)
* **01. Telerik web project**: Web projects developed as part of my training at Telerik.
* **02. Personal site**: A personal website built using HTML, CSS, and JavaScript.

### 🖥️ 2. UI Automation (`02. UI Testing`)
* **01. Cucumber**: Automated UI tests written using the Cucumber BDD framework.
* **02. Selenium_PageObject**: Tests built with Selenium WebDriver implementing the **Page Object Model (POM)** design pattern for improved maintainability and code reusability.

### 🖼️ 3. Sikuli GUI Automation (`03. Sikuli`)
* **01. ValentinBogdanov.sikuli**: Desktop automation scripts based on image recognition using Sikuli.

### 🔌 4. API Testing (`04. API Testing`)
Collections and projects for automated REST API testing:
* **01. API testing with Postman**: Test collections and environments for automated testing in Postman.
* **02. API testing with RestAssured**: Test scenarios in Java using the REST Assured library.
* **03. API testing with RestSharp**: API testing in C# using the RestSharp library.

### ⚡ 5. Performance & Load Testing (`05. Performance Tests`)
* **01. JMeter**: Test plans (JMX) for performance and load testing with Apache JMeter:
  * **01. WEare**: Load and stress tests with 30 and 60 users.
  * **02. AutomationExercise**: Parameterized API performance testing project for `automationexercise.com` simulating 20 and 40 virtual users, featuring response/JSON assertions, random timers, CSV config, and automated HTML report generation.
* **02. K6**: Modern JavaScript-based load testing scripts executed with Grafana k6:
  * **01. AutomationExercise**: Replicated API performance testing project for `automationexercise.com` simulating 20 and 40 virtual users using ramping-vus, custom scenarios (main load vs account lifecycle), check assertions, and SLA thresholds.

### 🎮 6. JavaScript Applications (`06. JavaScript application`)
* **01. JavaScript Web Games**: Interactive web games and applications built with pure JavaScript (Vanilla JS).

### 🎭 7. Playwright Automation (`07.Playwright`)
Projects using Playwright — a modern tool for UI and API automation:
* **1. FirstProject**: Introductory test scenarios demonstrating Playwright capabilities.
* **2. Api testing**: Automating API requests directly through Playwright context.
* **3. TS and Playwright project**: Test structures utilizing TypeScript and Playwright Test Runner.
* **4. Automation at automationexercise.com**: Complete automated C# Playwright & NUnit test suite (26/26 test cases) featuring the Page Object Model (POM) design pattern, automated overload-resilience checks, custom SlowMo debugging, and Allure reporting.
* **5. API Testing on automationexercise.com**: Complete automated C# Playwright & NUnit API test framework covering all 14 API scenarios from the official practice list. Features a clean client-based architecture, request/response payload capture, Allure attachments, and full state integration tests for account lifecycle orchestration.

---

## 🚀 Main Project: **Observer (Automation QA Jobs Tracker)** (`08.Observer`)

`Observer` is a full-featured web application (Dashboard) designed to automatically track new **Automation QA** job listings in Bulgaria.

### 💡 Core Features:
* **Multi-Platform Scraping**:
  * Scrapes job listings from **dev.bg**, **LinkedIn** (using Playwright with session/cookie persistence), and **jobs.bg** (using Playwright with DataDome bot-protection evasion).
* **Smart Detail Parsing**:
  * Automatically extracts salary details, annual paid leave days, and required technologies (Tech Stack).
  * Supports dual detail formats for jobs.bg (custom HTML in a sandboxed iframe and standard templates).
* **Database**: Saves listings to a SQLite database with automatic validation to prevent duplicate entries.
* **Real-Time Frontend Filtering & Search**:
  * Free-text search (technology, company, job title).
  * Filter by company and location (Remote / Hybrid / Sofia).
  * Filter by source (`dev.bg`, `LinkedIn`, `jobs.bg`).
  * Filter by disclosed metrics (only with salary, only with specified paid leave).
  * **Date Filtering**: Preset filters for "Today only", "Last 3 days", or "Last 7 days" (based on calendar date calculations).
* **Sorting**: All listings are automatically sorted chronologically with the newest postings at the top.

### 🛠️ Tech Stack:
* **Backend**: Python, Flask, Playwright, SQLite, BeautifulSoup (lxml).
* **Frontend**: HTML5, Vanilla CSS (Premium Light Theme, Glassmorphic effects), JavaScript (AJAX).

---

## 🛠️ How to Run the `Observer` Project Locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ValBo71/My-Project.git
   cd My-Project/08.Observer
   ```

2. **Install the required dependencies**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

3. **Configure LinkedIn Credentials**:
   Create a `linkedin_credentials.json` file inside the `08.Observer/` directory with your email and password:
   ```json
   {
     "email": "your_email@example.com",
     "password": "your_password"
   }
   ```

4. **Start the application**:
   Run the `run.bat` file or start directly with:
   ```bash
   python app.py
   ```
   Open your browser and navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

✉️ **Contacts**:
If you have any questions about the projects or would like to get in touch, feel free to visit my GitHub profile [ValBo71](https://github.com/ValBo71).
