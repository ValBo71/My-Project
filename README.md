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
* **02. Selenium_PageObject**: Tests built with Selenium WebDriver implementing the **Page Object Model (POM)** design pattern:
  * **Java/01. Exam2_Selenium_PageObject**: Jira bug reporting UI automation framework utilizing Selenium Page Factory and JUnit 4. Automates project creation, issue reporting (description iframe rendering), and search queries.
  * **Java/02. WeareSocialNetwork**: Selenium PageObject UI test suite for the WEare social network. Automates registration, login, profile updates, posting, liking, friend requests, and admin actions in sequential order.
  * **Java/03. PageObject_TestNG**: Selenium PageObject UI test suite built with TestNG and Java. Automates search functionality on the realt.by portal, featuring custom cookie consent handling, dynamic room filters, and automated ChromeDriver lifecycle management with TestNG suite hooks.

### 🖼️ 3. Sikuli GUI Automation (`03. Sikuli`)
* **01. ValentinBogdanov.sikuli**: Desktop automation scripts based on image recognition using Sikuli.

### 🔌 4. API Testing (`04. API Testing`)
Collections and projects for automated REST API testing:
* **01. API testing with Postman**: Test collections and environments for automated testing in Postman:
  * **01. Approval Book iMX**: Postman regression testing collection verifying that XML inputs entered into the iMX system are correctly loaded and verified in REST API responses, using CSV dataloaders for collection variables.
  * **03. WeareSocialNetwork**: Newman-runnable Postman API test collection (91 scripts) covering authentication, administrator actions, posts, and comments on the WEare social network. Includes custom environment settings and htmlextra reporting.
* **02. API testing with RestAssured**: Test scenarios in Java using the REST Assured library:
  * **01. GoogleAPI**: Refactored Java Maven + TestNG API testing framework targeting JSONPlaceholder, SWAPI, and a complete CRUD integration lifecycle of a Place using the Google Places API sandbox. Features separated Request/Response specifications to isolate endpoint configurations.
  * **02. ProjectGoogleApi**: Refactored Model-Based Java Maven + TestNG API testing project targeting Google Places Find Place Search API. Implements Lombok builders, property-based credentials, and positive/negative test suites.
* **03. API testing with RestSharp**: API testing in C# using the RestSharp library:
  * **01. AutomationExercise.RestSharp.ApiTests**: Complete C# NUnit API Automation framework for `automationexercise.com` covering all 14 API scenarios from the official practice list. Features a clean client-based architecture, strongly-typed models, dynamic data generation, request/response logging, and Allure reporting.

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

## ⚡ Performance Testing Projects (`05. Performance Tests`)

This section features API performance and load testing projects built for the practice platform [Automation Exercise](https://automationexercise.com) using two different industry-standard tools: **Apache JMeter** and **Grafana k6**.

### 1. **Apache JMeter Project** (`05. Performance Tests/01. JMeter/02.AutomationExercise`)
* **Core Capabilities**:
  * **Dynamic Parameterization**: Configured with JMeter Properties for threads (`users`), ramp-up, and duration.
  * **Dual Thread Groups**: A main load group for GET/POST API endpoints and a low-load account lifecycle group (using unique emails) to test account creation, details, updates, and deletion.
  * **SLA Threshold Verification**: Duration assertions enforce a response time threshold under `2000 ms`.
  * **Local Reporting**: Features automated HTML report generation during non-GUI CLI execution.
* **Quick CLI Start**:
  ```bash
  jmeter -n -t "05. Performance Tests/01. JMeter/02.AutomationExercise/AutomationExercise_Performance_Test.jmx" -Jusers=20 -Jrampup=60 -Jduration=60 -l results_20_users.jtl -e -o report_20_users
  ```

### 2. **Grafana k6 Project** (`05. Performance Tests/02. K6`)
* **Core Capabilities**:
  * **Code-as-Test Scenarios**: Written in JavaScript utilizing custom multi-scenario configurations (`main_load` and `account_lifecycle`).
  * **Strict Threshold Checks (SLAs)**: Automatically enforces error rate `< 5%` and response times: average `< 2000ms`, 95th percentile `< 3000ms`, and 99th percentile `< 5000ms`.
  * **CLI Parameterization**: Custom variables passed through environment flags (`-e USERS=20`).
* **Quick CLI Start**:
  ```bash
  k6 run -e USERS=20 -e RAMPUP=60s -e DURATION=60s "05. Performance Tests/02. K6/k6_performance_test.js"
  ```

---

## 🖥️ UI Automation Projects (`02. UI Testing`)

This section features automated web UI test suites implementing the Page Object Model (POM) and Page Factory design patterns using **Selenium WebDriver (Java)**.

### 1. **Jira Bug Reporting Automation** (`02. UI Testing/02. Selenium_PageObject/02. Java/01. Exam2_Selenium_PageObject`)
* **Core Capabilities**:
  * **Page Factory Design Pattern**: Encapsulates web elements and interactions into dedicated Page Objects (`LoginJira_Page_Factory`, `JiraBugReport_Page_Factory`, `SearchBugReportJira_Page_Factory`).
  * **Project & Bug Lifecycle Automation**: Automates logging into Jira, creating a new Kanban project with random IDs, creating bug tickets (handling nested description rich-text editor iframes), and searching for tickets.
  * **Resource Management**: Extends `BaseTest` to automatically clean up WebDriver and browser processes (`quit()`) after each run, preventing system memory leaks.
* **Quick CLI Start**:
  ```bash
  cd "02. UI Testing/02. Selenium_PageObject/02. Java/01. Exam2_Selenium_PageObject"
  mvn clean test
  ```

### 2. **WEare Social Network UI Automation** (`02. UI Testing/02. Selenium_PageObject/02. Java/02. WeareSocialNetwork`)
* **Core Capabilities**:
  * **Method and Class-level Sequential Ordering**: Implements `@FixMethodOrder(MethodSorters.NAME_ASCENDING)` on all test classes and a JUnit `RunAllTests` Suite class to guarantee tests execute in a strict logical dependency flow.
  * **Headless execution and modern Chrome support**: Refactored to utilize `webdrivermanager` 5.8.0 for compatibility with Chrome 148+ (CFT) while preserving the browser configuration settings.
  * **Full Flow Coverage**: Automates registration of multiple users, profiles updates, creating posts, liking/disliking comments, sending/approving/disconnecting friend requests, and administrator enablement/disablement.
* **Quick CLI Start**:
  ```bash
  cd "02. UI Testing/02. Selenium_PageObject/02. Java/02. WeareSocialNetwork"
  run.bat
  ```

### 3. **PageObject TestNG UI Automation** (`02. UI Testing/02. Selenium_PageObject/02. Java/03. PageObject_TestNG/PageObject_TestNG`)
* **Core Capabilities**:
  * **Page Object Design Pattern**: Encapsulates pages (`RealHomePage`, `RealListingPage`) and their interactions into dedicated modular Page Objects extending `BasePage`.
  * **Robust Browser Control & Lifecycle Teardown**: Uses modern Selenium 4 native Selenium Manager for Chrome driver binaries, and wraps automated browser processes in TestNG `@BeforeSuite` and `@AfterSuite` hooks to cleanly quit ChromeDriver processes, avoiding resource leaks.
  * **Cookie Banner & Dynamic Locators**: Automatically handles cookie consent banner dismissal and dynamic React dropdown select options for room counts to build resilient, flake-free UI tests.
* **Quick CLI Start**:
  ```bash
  cd "02. UI Testing/02. Selenium_PageObject/02. Java/03. PageObject_TestNG/PageObject_TestNG"
  & "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.2\plugins\maven\lib\maven3\bin\mvn.cmd" test
  ```

---

## 🔌 API Testing Projects (`04. API Testing`)

This section features automated API testing frameworks and scripts built to verify REST API endpoints using **RestAssured (Java)** and **RestSharp (C#)**.

### 1. **RestAssured GoogleAPI Project** (`04. API Testing/02. API testing with RestAssured/01. GoogleAPI/GoogleApi`)
* **Core Capabilities**:
  * **Multi-API Request Separation**: Implements isolated `RequestSpecification` contexts for SWAPI, JSONPlaceholder, httpbin, and Google Places. This prevents URL pollution and enables clean concurrent testing.
  * **Stateful CRUD Verification**: Automates the full lifecycle of a Place (Add, Get, Update, Get, Delete, Verify Deleted) using TestNG `dependsOnMethods` to chain state between tests.
  * **Dynamic Payload Validation**: Extracts JSON responses using `JsonPath` and asserts response properties via Hamcrest matchers.
* **Quick CLI Start**:
  ```bash
  cd "04. API Testing/02. API testing with RestAssured/01. GoogleAPI/GoogleApi"
  mvn clean test
  ```

### 2. **RestAssured ProjectGoogleApi (Model-Based) Project** (`04. API Testing/02. API testing with RestAssured/02. ProjectGoogleApi/ProjectGoogleApiTest`)
* **Core Capabilities**:
  * **Model-Based HTTP Requests**: Encapsulates request parameters using a nested `RequestModel` with Lombok `@Builder` pattern for dynamic mapping.
  * **Property-Based Credentials**: Reads security tokens securely from `userData.properties` in a configured classpath directory.
  * **Positive & Negative Suites**: Validates location search success with DataProviders, and verifies error handling (status `REQUEST_DENIED` / `INVALID_REQUEST`) on invalid keys, missing parameters, and bad inputtypes.
* **Quick CLI Start**:
  ```bash
  cd "04. API Testing/02. API testing with RestAssured/02. ProjectGoogleApi/ProjectGoogleApiTest"
  mvn clean test
  ```

### 3. **RestSharp C# Project** (`04. API Testing/03. API testing with RestSharp`)
* **Core Capabilities**:
  * **Strongly-Typed Payloads**: Built with C# and .NET 8 using strongly-typed models for requests and responses, utilizing `System.Text.Json` serialization.
  * **Allure Reports Integration**: Automatically logs request URLs, methods, headers, parameters, and response bodies to Allure report attachments for rich execution dashboards.
  * **Complete Business Scenarios**: Fully automates all 14 official test cases from `automationexercise.com` (user lifecycle, products, brands, login verification).
* **Quick CLI Start**:
  ```bash
  cd "04. API Testing/03. API testing with RestSharp/AutomationExercise.RestSharp.ApiTests"
  dotnet test
  ```

### 4. **Postman Approval Book iMX Project** (`04. API Testing/01. API testing with Postman/01. Approval Book iMX`)
* **Core Capabilities**:
  * **Regression Testing**: Validates that case data created in the iMX backend via XML schemas maps correctly to REST API response structures.
  * **Dynamic Variable Injection**: Loads testing credentials and Case/Reference/BU/Debtor IDs from an external `Variables for test.csv` file into Postman collection variables via Runner iterations.
  * **JavaScript Assertions**: Refactored to utilize safe array lookup find-match logic (avoiding loop closure bugs) and compliant Chai assertion patterns (`to.not.be.empty`, `to.not.be.null`).
* **Quick Run**:
  * Import `EH AB - UK book- API testing.postman_collection.json` and `EH _environments_ODIN.postman_environment.json` into Postman.
  * Open **Collection Runner**, select the CSV data file `Variables for test.csv`, and run the suite.

### 5. **Postman WEare Social Network API Test Suite** (`04. API Testing/01. API testing with Postman/03 WeareSocialNetwork`)
* **Core Capabilities**:
  * **Full Coverage Regression Testing**: Covers REST API endpoints for a social network platform (users, administrators, posts, comments, friends, categories, and skills).
  * **Chai Assertion Syntax Cleanup**: Corrected silent passes by replacing invalid assertion getters (`.is.not.empty` and `.is.not.null`) with valid, strict Chai checks (`.to.not.be.empty` and `.to.not.be.null`).
  * **Encoding Bug Resolution**: Resolved broken text characters in test case result descriptions.
* **Quick CLI Run**:
  * Double-click `Run_API_Tests.bat` or run:
    ```bash
    cd "04. API Testing/01. API testing with Postman/03 WeareSocialNetwork"
    newman run WEareSocialNetwork.postman_collection.json -e PlutoFinalProject.postman_environment.json -r htmlextra
    ```
    View the generated report inside the `newman/` folder.

---

✉️ **Contacts**:
If you have any questions about the projects or would like to get in touch, feel free to visit my GitHub profile [ValBo71](https://github.com/ValBo71).
