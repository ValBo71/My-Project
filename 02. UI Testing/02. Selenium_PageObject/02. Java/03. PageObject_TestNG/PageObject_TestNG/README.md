# PageObject_TestNG UI Automation Project

This project contains automated UI regression tests for the real estate portal [realt.by](https://realt.by) using **Java**, **Selenium WebDriver 4**, and **TestNG**.

The codebase has been refactored and modernized to support the latest web technologies, resolve dependency conflicts, handle modern dynamic React overlays, and ensure stable and clean browser process execution.

---

## 🚀 Key Modernizations & Features

1. **Selenium 4 Upgrade (`4.16.1`)**:
   - Upgraded to the modern Selenium 4 API signature (using `java.time.Duration` for explicit waits).
   - Removed conflicting legacy beta dependencies.
2. **Native Selenium Manager Integration**:
   - Removed obsolete hardcoded ChromeDriver binaries (`System.setProperty("webdriver.chrome.driver", ...)`).
   - The framework now automatically fetches, configures, and matches the correct Chrome binary version using Selenium Manager, natively supporting modern Google Chrome versions (148+).
3. **Resilient Browser Lifecycle Teardown**:
   - Integrated TestNG `@BeforeSuite` and `@AfterSuite` hooks in `BaseTest`.
   - Properly closes browser sessions (`driver.quit()`) after the entire test suite completes, resolving background `chromedriver.exe` process leaks.
4. **Cookie Consent Evasion**:
   - Automated detection and dismissal of the cookie consent banner popup upon loading the home page to prevent click interception issues.
5. **Dynamic Locators for Modern React UI**:
   - Shifted from legacy HTML select-option locators (obsolete in the portal's new Next.js structure) to dynamic React dropdown selectors.
   - Tests now dynamically click the dropdown wrapper and find text options corresponding to target room configurations.
6. **Code Quality and Naming Conventions**:
   - Refactored the test class to standard Java camel-casing naming convention (`SearchApartmentTest`).
   - Configured `testng.xml` to correctly targets the class name and methods.

---

## 📂 Project Structure

- **`src/main/java/common/`**:
  - `CommonAction.java`: Driver initialization and static termination logic.
  - `Config.java`: General configuration variables (timeouts, window options).
- **`src/main/java/pages/`**:
  - `baze/BasePage.java`: Core Page Object class containing general methods (open page, wait visibility) and the automated cookie banner dismisser.
  - `realhome/RealHomePage.java`: Page object model for the home page search bar and rooms dropdown.
  - `listing/RealListingPage.java`: Page object model for search result verification (listing cards).
- **`src/test/java/tests/`**:
  - `base/BaseTest.java`: Teardown suite execution listener.
  - `searchapartment/SearchApartmentTest.java`: Tests verifying redirection and card loading for 1-room, 2-room, and 3-room search parameters.
- **`src/test/resources/testng.xml`**: TestNG suite runner XML configuration.

---

## 🛠️ How to Run the Tests

To compile the codebase and run the full TestNG test suite, run the following command in the project directory:

```bash
mvn clean test
```

If Maven (`mvn`) is not configured in your global system `PATH`, you can run the Maven wrapper or command line bundled with IntelliJ IDEA:
```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.1.2\plugins\maven\lib\maven3\bin\mvn.cmd" test
```
