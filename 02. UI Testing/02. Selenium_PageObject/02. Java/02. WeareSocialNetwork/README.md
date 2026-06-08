# WeareSocialNetwork UI Testing Framework

This directory contains the Selenium PageObject UI automation test suite for the **WEare Social Network** application.

## Technologies Used
- **Java** (version 8+)
- **JUnit 4** (test runner and assertions)
- **Selenium WebDriver** (UI interaction)
- **WebDriverManager** (automatic ChromeDriver matching and management)
- **Log4j** (logging framework)
- **Maven** (dependency and build management)

## Directory Structure
- `src/main/java/com/telerikacademy/testframework/` - Core web driver configuration, property managers, and actions wrapper.
- `src/main/java/pages/` - Page Object Pattern classes representing individual pages of the application.
- `src/test/java/testCases/` - JUnit test classes containing assertions and execution flows.
- `src/test/resources/` - Configuration properties (`config.properties`) and UI element mapping locators (`ui_map.properties`).

## Test Execution Order
To ensure consistent execution (as tests create data that subsequent tests rely on), the tests are structured to run in a strict logical sequence:
1. **`A_RegistrationTests`**: Registers the test users (regular user, second user, and admin).
2. **`B_LoginTests`**: Verifies login authentication with the created accounts.
3. **`C_PersonalProfileTests`**: Updates profile information, workplace, and services.
4. **`D_PostsTests`**: Creates a new social post.
5. **`E_ExplorePostsTests`**: Explores the feed, likes and dislikes a post.
6. **`F_FriendRequestTests`**: Sends, accepts, and disconnects a friend request.
7. **`G_AdminTests`**: Performs administrator tasks (disabling/enabling users, editing/deleting posts).

All method-level tests inside these classes are annotated with `@FixMethodOrder(MethodSorters.NAME_ASCENDING)` to guarantee correct execution ordering.

## Configuration
Before running the tests, verify that the social network server is running and configured under:
`src/test/resources/config.properties`

```properties
config.defaultTimeoutSeconds=4
baseUrl = http://localhost:8081/
```

## Running the Tests
You can run the entire test suite in sequential order using the provided batch file or via Maven:

### Option 1: Via Batch File
Double-click `run.bat` in the root of this project directory. It runs the Maven command and serves the Allure reports.

### Option 2: Via Maven Command Line
```bash
mvn clean install test -Dtest=RunAllTests
```
