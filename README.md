# QA Automation & Software Engineering Portfolio

Welcome to my portfolio! Here you will find various projects, tasks, and practical applications in the fields of software testing (QA), automation, web development, and printing pre-press utilities, created during my training at **Telerik Academy** as well as personal practice projects.

---

## Repository Structure

The projects are logically organized by categories and technology stack:

### 1. Web Projects (01. WEB project)
* **01. Telerik web project**: "Bug Hunters" Profile Portal — A responsive, multilingual static portal website featuring the profiles, personality index cards (with 3D card flip animations), about pages, and interactive hobby galleries for 6 team members. Developed using HTML5, Vanilla CSS, and JavaScript/jQuery.
* **02. Personal site**: Personal Portfolio Website — An interactive, responsive personal portal detailing professional experience, dynamic skill diagrams (radial and progress bars), a working contact form, and a filterable project portfolio spanning QA automation, printing tools, and other personal projects. Developed using HTML5, Bootstrap v3, and JavaScript/jQuery.

### 2. UI Automation (02. UI Testing)
* **01. Cucumber**: BDD UI Test Automation framework utilizing JBehave and JUnit 4, featuring a custom Selenium WebDriver wrapper with dynamic element visibility waits and optimized configuration caching.
* **02. Selenium_PageObject**: Tests built with Selenium WebDriver implementing the **Page Object Model (POM)** design pattern:
  * **Java/01. Exam2_Selenium_PageObject**: Jira bug reporting UI automation framework utilizing Selenium Page Factory and JUnit 4. Automates project creation, issue reporting (description iframe rendering), and search queries.
  * **Java/02. WeareSocialNetwork**: Selenium PageObject UI test suite for the WEare social network. Automates registration, login, profile updates, posting, liking, friend requests, and admin actions in sequential order.
  * **Java/03. PageObject_TestNG**: Selenium PageObject UI test suite built with TestNG and Java. Automates search functionality on the realt.by portal, featuring custom cookie consent handling, dynamic room filters, and automated ChromeDriver lifecycle management with TestNG suite hooks.
  * **C#/1.httpsautomationexercise.com**: C# Selenium WebDriver & NUnit UI automation project covering 20 test cases from the official practice list. Features a clean Page Object Model with isolated locators, stale-proof wait utilities, automatic GDPR consent handling, dynamic Google Vignette ad bypass, and failure screenshot attachment.

### 3. Sikuli GUI Automation (03. Sikuli)
* **01. ValentinBogdanov.sikuli**: Desktop GUI automation script based on image recognition using SikuliX to automate the end-to-end Jira registration, sandbox setup, and bug reporting flow.

### 4. API Testing (04. API Testing)
* **01. API testing with Postman**: Test collections and environments for automated testing in Postman:
  * **01. Approval Book iMX**: Postman regression testing collection verifying that XML inputs entered into the iMX system are correctly loaded and verified in REST API responses, using CSV dataloaders for collection variables.
  * **03. WeareSocialNetwork**: Newman-runnable Postman API test collection (91 scripts) covering authentication, administrator actions, posts, and comments on the WEare social network. Includes custom environment settings and htmlextra reporting.
* **02. API testing with RestAssured (Java)**:
  * **01. GoogleAPI**: Maven + TestNG API testing framework targeting JSONPlaceholder, SWAPI, and a complete CRUD integration lifecycle of a Place using the Google Places API sandbox. Features separated Request/Response specifications to isolate endpoint configurations.
  * **02. ProjectGoogleApi**: Model-Based Java Maven + TestNG API testing project targeting Google Places Find Place Search API. Implements Lombok builders, property-based credentials, and positive/negative test suites.
* **03. API testing with RestSharp (C#)**:
  * **01. AutomationExercise.RestSharp.ApiTests**: Complete C# NUnit API Automation framework for `automationexercise.com` covering all 14 API scenarios from the official practice list. Features a clean client-based architecture, strongly-typed models, dynamic data generation, request/response logging, and Allure reporting.

### 5. Performance & Load Testing (05. Performance Tests)
* **01. JMeter**: Test plans (JMX) for performance and load testing with Apache JMeter:
  * **01. WEare**: Load and stress tests with 30 and 60 users.
  * **02. AutomationExercise**: Parameterized API performance testing project for `automationexercise.com` simulating 20 and 40 virtual users, featuring response/JSON assertions, random timers, CSV config, and automated HTML report generation.
* **02. K6**: Modern JavaScript-based load testing scripts executed with Grafana k6:
  * **01. AutomationExercise**: Replicated API performance testing project for `automationexercise.com` simulating 20 and 40 virtual users using ramping-vus, check assertions, and SLA thresholds (error rate < 5%).

### 6. JavaScript Applications (06. JavaScript application)
* **01. JavaScript Web Games**: A premium collection of 7 classic interactive web games developed from scratch using HTML5, Vanilla CSS (with responsive layouts and glassmorphic designs), and pure JavaScript (Vanilla JS):
  * **01. Snake**: Classic retro game featuring canvas rendering, grid movement, apple consumption mechanics, tail collision detection, and screen-rendered boundary checks.
  * **02. Dino**: Fast-paced endless runner game featuring custom CSS keyframe animations, jump collision detection, and clean state reset scripts to avoid alert interrupts.
  * **03. Bird**: Side-scrolling 2D Flappy Bird clone featuring gravity physics, dynamic obstacle spawning, audio triggers, and safe asset loading.
  * **04. Shooting_Range**: Interactive crosshair clicker game featuring custom target-seeking controls, 3D rotating targets, audio triggers, and duplicate hit filtering.
  * **05. Clickr**: Rapid-clicking reflex game with custom retro design styling, high-precision millisecond timing, and score-state tracking.
  * **06. Sea Chess One**: Advanced Tic-Tac-Toe game featuring a dual-difficulty defensive/offensive computer AI, session score history tracking, and board-level event delegation.
  * **07. Retro Fighting Game**: 2D arcade cyber-themed fighter game built with OOP classes, physics gravity, computer AI combat behaviors, visual hit flash notifications, and clean UI health metrics.

### 7. Playwright Automation (07.Playwright)
* **1. FirstProject**: Introductory test scenarios demonstrating Playwright capabilities.
* **2. Api testing**: Automating API requests directly through Playwright context.
* **3. TS and Playwright project**: Test structures utilizing TypeScript and Playwright Test Runner.
* **4. Automation at automationexercise.com**: Complete automated C# Playwright & NUnit test suite (26/26 test cases) featuring the Page Object Model (POM) design pattern, automated overload-resilience checks, custom SlowMo debugging, and Allure reporting.
* **5. API Testing on automationexercise.com**: Complete automated C# Playwright & NUnit API test framework covering all 14 API scenarios from the official practice list. Features a clean client-based architecture, request/response payload capture, Allure attachments, and full state integration tests for account lifecycle orchestration.

### 8. QA Jobs Tracker — Observer (08.Observer & 11.Observer v2)
* **08.Observer**: Main Project (Automation QA Jobs Tracker v1) — A full-featured Python Flask and SQLite dashboard scraping job listings from dev.bg, LinkedIn (Playwright with session persistence), and jobs.bg (Playwright with DataDome bypass). Extracts salaries, annual leaves, and required tech stack (runs on port 5000).
* **11.Observer v2**: Jobs Tracker v2 — Upgraded version of the job tracker introducing dynamic scraping URLs configuration directly in the UI settings panel, selective/optional scraping support, database resetting capability, and running on port 5001.

### 9. Special Utilities (09. Other tools)
This section contains helpful tools for the printing industry and foreign vocabulary study:
* **02.Printing/01.Spine and Creep Calculator**: Web-based pre-press utility calculating book spine thickness (paperback/hardcover, EVA/PUR glue options, paper weight, and thread-sewing swelling coefficients) with real-time 3D book mockup visualization (HTML5, CSS, Vanilla JS).
* **02.Printing/02.InDesign Booklet Creep**: Professional script for Adobe InDesign (ExtendScript/JSX) that calculates and applies horizontal booklet creep scaling (shrinking) on page items to compensate for paper thickness buildup in folded signatures.
* **02.Printing/03.Catalog**: Dies & Clichés Catalog — Flask + SQLite warehouse tool for archiving and searching printing dies (shapes, types, ups, plate dimensions, item dimensions, and CAD drawings) and hot foil/embossing clichés. Features Cyrillic case-insensitive search, responsive card/table views, full pagination (10 & 25 rows options), and a custom `run.bat` bootstrapping a zero-dependency local Portable Python env on any Windows machine.
* **03.Dictionary**: Flash Cards — A local, zero-setup, offline-capable single-page application (SPA) for vocabulary flashcard study. Features 3D card flipping, IndexedDB storage, Excel vocabulary imports via SheetJS, multi-file filters, and JSON database backup/restoration.

### 10. AI QA Assistant (10.AI QA Assistant Test Case and Automation Generator)
* **AI QA Assistant**: A modern web platform powered by Google Gemini AI designed to automate QA routines. Generates structured test cases (JSON), identifies non-obvious edge cases, designs API test scenarios, writes C# Playwright POM automation skeletons, and formats raw bug descriptions into detail-rich QA Bug Reports.
* **Tech Stack**: C# & .NET 9 Web API backend (Clean Architecture), React + TypeScript frontend (Vite), Entity Framework Core & SQLite (history audit log), DocX for Word document generation, and NUnit & Playwright .NET tests.

---

## Featured Complex Projects

### 1. **AI QA Assistant** (10.AI QA Assistant...)
An advanced AI-powered web tool for software testing professionals.
* **AI Orchestration**: Direct integration with Gemini API, enforcing structured JSON outputs that are parsed and rendered as rich interactive UI cards.
* **Multi-Format Export**: Generates local downloads of results as Markdown, JSON, CSV, or formatted Word documents (DOCX).
* **Architecture**: Clean Architecture structure with decoupled layers: `Domain`, `Application`, `Infrastructure`, and `Api`.
* **Testing**: Includes comprehensive Unit tests and E2E browser tests driven by Playwright for .NET.

### 2. **Observer (QA Jobs Tracker) - Versions 1 & 2** (08.Observer & 11.Observer v2)
Full-featured automated job search and parsing system for Automation QA roles in Bulgaria.
* **Scraping Engine**: Extracts job listings from dev.bg, jobs.bg (bypassing DataDome using Playwright), and LinkedIn (retaining session credentials).
* **Smart Parsing**: Automatically extracts salary thresholds, annual leave, and tech stacks.
* **Version 2**: Introduces an in-app settings panel to configure search URLs dynamically and support selective platform scraping.

### 3. **Dies & Clichés Catalog** (09. Other tools/02.Printing/03.Catalog)
Industrial tool management catalog for print shops.
* **Zero-Dependency Bootstrap**: `run.bat` checks for Python. If not found, it downloads, unpacks, and configures a **Portable Python** environment, installs `pip` and required packages (`Flask`, `Pillow`) in user space without requiring admin privileges.
* **Cyrillic Case-Insensitivity**: Integrates custom `py_lower` Unicode function into SQLite, enabling full case-insensitive searches on Bulgarian text (LIKE operations).
* **Modern UI**: Clean design featuring responsive card/table views (table default), Inter & Manrope typography, and dynamic pagination supporting 10 and 25 items per page.

---

Contacts:
If you have any questions about these projects or would like to get in touch, feel free to visit my GitHub profile: [ValBo71](https://github.com/ValBo71).
