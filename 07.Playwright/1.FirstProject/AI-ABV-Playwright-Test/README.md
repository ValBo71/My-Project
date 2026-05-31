# AI-ABV-Playwright-Test

This is a UI Automation testing project for **ABV.bg** built with **Playwright for .NET (C#)** and **NUnit**, following the **Page Object Model (POM)** architecture.

## Architecture

- **Playwright + NUnit**: Used as the core driving framework and test engine.
- **Page Object Model**: Web page elements and actions are encapsulated in classes (`LoginPage`, `InboxPage`), making tests cleaner and maintaining separation of concerns.
- **Selectors Layer**: All locators and CSS selectors are isolated in specific classes (`Selectors/*Selectors.cs`).
- **Configuration**: Managed via `appsettings.json` and customized for environments.
- **BaseTest**: A reusable NUnit `[SetUp]` and `[TearDown]` integration that handles context initialization, taking a screenshot on test failure.

## Project Structure

```text
AI-ABV-Playwright-Test/
??? Config/             # Environment configuration (appsettings.json parsing)
??? Core/               # Playwright BaseTest class setup
??? Pages/              # Page Object classes encapsulating page actions
??? Selectors/          # CSS locators for the different pages
??? Tests/              # NUnit test classes inside (e.g., SmokeTests.cs)
```

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- Supported browser binaries (installed via Playwright CLI)

## Setup & Build

1. **Restore dependencies & build the project:**
   ```bash
   dotnet build
   ```

2. **Install Playwright browsers:**
   ```bash
   pwsh bin/Debug/net9.0/playwright.ps1 install
   # OR if using cmd/PowerShell:
   # powershell -ExecutionPolicy Bypass -File .\bin\Debug\net9.0\playwright.ps1 install
   ```

## Running Tests

To run the tests, execute:
```bash
dotnet test
```

To see detailed output (e.g., logging output from tests):
```bash
dotnet test --logger "console;verbosity=detailed"
```

### Changing Configuration

The application is configured using `appsettings.json` located at the root of the project:

```json
{
  "TestSettings": {
    "BaseUrl": "https://www.abv.bg/",
    "Headed": true,
    "SlowMo": 0,
    "TimeoutMs": 30000
  }
}
```

- **`Headed`**: Set to `true` to view the browser UI during execution. Set to `false` for CI headless execution.
- **`SlowMo`**: Slow down execution by a specified number of milliseconds per Playwright action.
- **`TimeoutMs`**: Global waiting timeout for elements to appear.

### Screenshots on Failure

If a test fails, `BaseTest` automatically takes a screenshot and saves it to the `bin/Debug/net9.0/Screenshots` directory. The screenshot path is also attached to the NUnit Test Context output.
