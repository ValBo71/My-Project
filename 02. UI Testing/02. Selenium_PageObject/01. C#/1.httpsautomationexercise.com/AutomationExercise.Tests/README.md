# AutomationExercise.Tests - C# Selenium NUnit UI Automation Framework

This repository hosts a clean, robust, and decoupled UI Automation testing framework developed using **C#**, **.NET 9.0**, **Selenium WebDriver (Selenium 4)**, and **NUnit**, targeting the practice e-commerce portal [automationexercise.com](https://automationexercise.com/).

---

## 🏛️ Architecture & Design Patterns

1. **Page Object Model (POM)**:
   - Page Object classes (under `Pages/`) model the web page structures and expose higher-level, chainable actions (e.g. `Login()`, `AddToCart()`, `SubmitContactForm()`).
   - No direct element locators (`By`) are defined inside the Page Objects.

2. **Decoupled Selectors Isolation**:
   - Web element locators are completely isolated into dedicated static classes under `Selectors/` (e.g. `HomePageSelectors`, `LoginPageSelectors`).
   - Page Object classes consume these static locators. This prevents UI DOM updates from breaking action scripts and keeps the locator definitions DRY.

3. **Built-in Selenium Manager (Selenium 4)**:
   - The framework relies on Selenium 4's native **Selenium Manager** to download, configure, and match browser driver binaries automatically. This eliminates the need for obsolete third-party managers like `WebDriverManager.Net`.

4. **Failure Diagnostics**:
   - `ScreenshotHelper.cs` automatically captures screenshots on NUnit test failures, saving files under `TestResults/Screenshots/` and linking them directly to test results.

5. **Wait Evasion Utilities**:
   - `WaitHelper.cs` wraps explicit waits using custom C# lambda expressions that handle `NoSuchElementException` and `StaleElementReferenceException` on the fly.

---

## 📂 Directory Layout

```
AutomationExercise.Tests/
│
├── AutomationExercise.Selenium.sln
│
└── AutomationExercise.Tests/
    ├── AutomationExercise.Tests.csproj
    ├── appsettings.json                   # Configuration settings
    ├── Drivers/
    │   └── DriverFactory.cs               # Browser configuration and setups
    ├── Pages/
    │   ├── BasePage.cs                    # Base Page Object wrappers
    │   ├── HomePage.cs
    │   ├── LoginPage.cs
    │   ├── SignupPage.cs
    │   ├── ProductsPage.cs
    │   ├── CartPage.cs
    │   ├── CheckoutPage.cs
    │   └── ContactUsPage.cs
    ├── Selectors/
    │   ├── HomePageSelectors.cs           # Decoupled element locators
    │   ├── LoginPageSelectors.cs
    │   ├── SignupPageSelectors.cs
    │   ├── ProductsPageSelectors.cs
    │   ├── CartPageSelectors.cs
    │   ├── CheckoutPageSelectors.cs
    │   └── ContactUsPageSelectors.cs
    ├── Tests/
    │   ├── BaseTest.cs                    # NUnit SetUp and TearDown hooks
    │   ├── RegisterUserTests.cs           # Test Cases 1, 5
    │   ├── LoginTests.cs                  # Test Cases 2, 3, 4
    │   ├── ProductTests.cs                # Test Cases 8, 9
    │   ├── CartTests.cs                   # Test Cases 10, 11, 12, 13, 17
    │   └── CheckoutTests.cs               # Test Cases 14, 15, 16, 18, 19, 20
    ├── TestData/
    │   └── TestUsers.cs                   # Centralized test values
    └── Utilities/
        ├── WaitHelper.cs                  # Explicit wait wrapper
        ├── ScreenshotHelper.cs            # Failure screenshots
        └── ConfigReader.cs                # Settings parser
```

---

## ⚙️ Configuration (`appsettings.json`)

Configure execution options in the `appsettings.json` file:
```json
{
  "BaseUrl": "https://automationexercise.com",
  "Browser": "Chrome",
  "Headless": false,
  "DefaultTimeout": 10
}
```
* **Browser**: Chrome / Firefox / Edge
* **Headless**: Set `true` to run the browser in headless mode (perfect for CI/CD pipelines).

---

## 🛠️ How to Compile and Run Tests

1. **Prerequisites**:
   Ensure you have the [.NET SDK 8.0 / 9.0](https://dotnet.microsoft.com/) installed on your machine.

2. **Restore NuGet Packages & Build**:
   Navigate to the directory and run:
   ```bash
   dotnet build
   ```

3. **Run All Tests**:
   Execute the test suite using NUnit test runner:
   ```bash
   dotnet test
   ```

4. **Run a Specific Test Class / Method**:
   ```bash
   dotnet test --filter FullyQualifiedName~Tests.LoginTests
   dotnet test --filter Name=TestCase1_RegisterUser
   ```

5. **Clean Test Results**:
   Test results, attachments, and failure screenshots are stored in:
   `AutomationExercise.Tests/bin/Debug/net9.0/TestResults/`

---

## ➕ How to Add New Tests

1. **Add Locators**:
   If a new page element is required, define its locator inside the appropriate class under `Selectors/` (e.g. `ProductsPageSelectors.cs`).
2. **Add Page Action**:
   Create a matching method inside the page object class under `Pages/` that consumes that locator.
3. **Write Test Method**:
   Write the test logic in a new or existing test class under `Tests/` utilizing NUnit assert syntax.
