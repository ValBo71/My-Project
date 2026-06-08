# BDD UI Test Automation (JBehave & Selenium)

This directory contains BDD (Behavior-Driven Development) test automation suites written in Java, designed to verify the functionality of web-based forum pages using the Page Object Model (POM) and automated Selenium WebDriver scripts.

---

## 📂 Directory Contents

* **`Cucumber -Telerik Forum Test/`**: The main test automation project. *Note: Despite the parent folder being named Cucumber, the framework utilizes **JBehave BDD** for scenario orchestration and story step execution.*
* **`javaLearning/`**: A skeleton Maven playground project for Java learning.
* **`untitled/`**: A skeleton Maven playground project.

---

## 🛠️ Technology Stack

* **Programming Language**: Java 11 (compiled target: Java 8 compatibility)
* **BDD Framework**: JBehave Core (v4.8.3) & `jbehave-junit-runner`
* **UI Automation Tool**: Selenium WebDriver (v3.14.0) with automated binary setups via `webdrivermanager`
* **Test Runner & Assertions**: JUnit 4
* **Build Automation**: Maven
* **Logging**: Log4j2

---

## 🏗️ Architecture & Component Design

The project implements a clean page-object-based automation architecture:

```
Cucumber -Telerik Forum Test/
├── src/
│   ├── main/
│   │   └── java/
│   │       ├── com/telerikacademy/forumframework/
│   │       │   ├── Driver.java                   <-- Custom WebDriver Wrapper
│   │       │   ├── CustomWebDriverManager.java   <-- Singleton WebDriver manager
│   │       │   ├── PropertiesManager.java        <-- Config & locator loader
│   │       │   ├── UserActions.java              <-- High-level action keywords
│   │       │   └── pages/
│   │       │       └── BasePage.java             <-- Common page base class
│   │       └── pages/forum/
│   │           ├── ForumHomePage.java            <-- Homepage elements & actions
│   │           ├── ForumLogInPage.java           <-- Login page elements & actions
│   │           └── ForumNewTopicPage.java        <-- New Topic elements & assertions
│   └── test/
│       ├── java/
│       │   ├── testCases/forum/
│       │   │   ├── BaseTest.java
│       │   │   └── ForumTopicCreationTests.java  <-- Standard JUnit tests
│       │   ├── stepDefinitions/
│       │   │   ├── BaseStepDefinitions.java
│       │   │   └── StepDefinitions.java          <-- BDD step mappings
│       │   ├── runners/
│       │   │   └── JUnitRunner.java              <-- JBehave Story runner
│       │   └── reporter/
│       │       └── JbehaveStoryReporter.java     <-- Custom console/logger reporter
│       └── resources/
│           ├── ForumTopicCreation.story          <-- JBehave BDD Story scenarios
│           ├── config.properties                 <-- Test environments & settings
│           └── mappings/
│               └── ui_map.properties             <-- Externalized XPath locators
```

### 1. Behavior-Driven Development (BDD) Scenarios
Test specifications are written as Gherkin-like `.story` files under `src/test/resources/`. For example, `ForumTopicCreation.story` includes:
* **Scenario 001:** Create a new topic with a valid title and description.
* **Scenario 002:** Verify system behavior and validation popups when trying to post an empty topic.

### 2. Custom WebDriver Wrapper (`Driver.java`)
We wrap the raw Selenium `WebDriver` to automatically intercept element lookup calls:
* Overridden `findElement(By by)` logs the locator and dynamically waits for element visibility using `ExpectedConditions.visibilityOfElementLocated(by)`.
* This eliminates the risk of `NoSuchElementException` when elements are slow to render, preventing fragile test runs.

### 3. Properties Management (`PropertiesManager.java`)
Reads test URLs, timeout settings, and UI mappings from property files. It uses lazy initialization (caching) to load configurations once and save disk read cycles.

---

## ⚙️ Configuration File (`config.properties`)

The BDD framework parameters are configured inside `src/test/resources/config.properties`:
* `config.defaultTimeoutSeconds`: The default time to wait for elements to load (currently set to `5` seconds).
* Target web links:
  * Forum home page URL
  * Authentication login page URL
  * Thread posting endpoint URL

---

## 🏃 How to Run the Tests

### From IntelliJ IDEA or Eclipse:
1. Open the project root `Cucumber -Telerik Forum Test/`.
2. Locate the JUnit story runner class: `src/test/java/runners/JUnitRunner.java`.
3. Right-click and choose **Run 'JUnitRunner'**.

### From Command Line:
Navigate to the project directory and execute tests via Maven:
```bash
cd "02. UI Testing/01. Cucumber/Cucumber -Telerik Forum Test"
mvn clean test
```

> [!NOTE]
> The JBehave story runner builds HTML, XML, Console, and TXT reports under the `target/jbehave/logs/` directory upon test completion.
