# Jira Bug Reporting UI Automation (Selenium Page Factory + JUnit)

This project is an automated UI testing framework built with **Java**, **Selenium WebDriver**, **JUnit 4**, and **WebDriverManager**. It automates the end-to-end user lifecycle on a Jira sandbox instance: logging in, creating projects (Kanban flow), reporting bug tickets (writing summaries and filling out description rich-text iframes), and searching for issues.

---

## 📂 Project Structure

```text
Exam2_Selenium_PageObject/
│
├── pom.xml                                     # Maven dependencies (Selenium, JUnit, WebDriverManager, Log4j)
└── src/
    └── test/java/
        ├── pages/                              # Page Factory classes (Locators & Interactions)
        │   ├── LoginJira_Page_Factory.java     # User login page locators & methods
        │   ├── JiraBugReport_Page_Factory.java # Project creation & bug reporting page locators
        │   └── SearchBugReportJira_Page_Factory.java # Issue search page locators
        └── test/cases/                         # JUnit Test Suites
            ├── BaseTest.java                   # Browser setup and tearDown hooks
            └── JiraBugReportTest.java          # Integrations tests (Login, Create Project, File Bug, Search)
```

---

## 🛠️ Key Refactoring Enhancements

1. **Typos Corrected**:
   - Corrected test method typos from `creteNewProject` to `createNewProject`.
   - Corrected variable and click method typos from `NewSearchIssueMenue` to `NewSearchIssueMenu` and `clickNewSearchMenue` to `clickNewSearchMenu` respectively.

2. **Parameterization & Reusability**:
   - Parameterized Page Factory methods (`enterEmail`, `enterPassword`, `enterSummary`, `enterContent`, `enterSearchField`) to accept dynamic inputs.
   - Retained default parameterless overloads for backward compatibility, keeping standard credentials and issue descriptions as default values.

3. **Driver Resource Leak Resolution**:
   - Uncommented the `@After` `tearDown` method in `BaseTest.java` to guarantee `webdriver.quit()` is invoked at the end of each test, cleaning up chromium processes and releasing system memory.
   - Removed unused `io.opentelemetry` imports.

---

## 🚀 How to Run the Tests

### Prerequisites
- **Java Development Kit (JDK)** version 11 or higher.
- **Apache Maven** installed and configured.

### Execution
Run the following Maven command in the directory containing `pom.xml`:
```bash
mvn clean test
```
Maven Surefire Plugin will compile the Page Factory elements, download the matching ChromeDriver version via WebDriverManager, and run all test cases.
