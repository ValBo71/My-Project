# Java API Automation Framework (RestAssured + TestNG + Maven)

This project is a Java-based API testing framework built using **RestAssured**, **TestNG**, and **Maven**. It demonstrates how to write clean, reusable, and robust automated API tests against multiple target APIs by isolating configurations using Request and Response Specifications.

---

## 📂 Project Structure

```text
GoogleApi/
│
├── pom.xml                               # Maven dependencies & compiler settings
└── src/
    ├── main/java/
    │   ├── config/
    │   │   └── TestConfig.java           # Request & Response specifications (SWAPI, JSONPlaceholder, Google Places, XML)
    │   └── constants/
    │       └── Constants.java            # Global servers, paths, API keys, and actions
    └── test/java/
        ├── FirstTest.java                # SWAPI integration test (GET people)
        ├── JsonPlaceHolderTest.java      # JSONPlaceholder CRUD (GET, POST, PUT, DELETE) and XML Post tests
        └── GooglePlacesTest.java         # Stateful Google Places CRUD lifecycle test
```

---

## 🛠️ Key Features

1. **Isolated Endpoint Configurations**:
   Instead of setting a global `RestAssured.baseURI`, the framework uses encapsulated `RequestSpecification` properties for each target API. This allows multiple tests targeting different servers (SWAPI, JSONPlaceholder, Google Places, httpbin) to run concurrently without base URL conflicts.

2. **Stateful CRUD Lifecycle Chains**:
   In [GooglePlacesTest.java](src/test/java/GooglePlacesTest.java), we chain all CRUD operations to test the full lifecycle of a Place:
   - **POST** `/add/json` (Creates a Place and extracts the dynamic `place_id`)
   - **GET** `/get/json` (Verifies creation values)
   - **PUT** `/update/json` (Updates the address details)
   - **GET** `/get/json` (Verifies the address update)
   - **POST** `/delete/json` (Deletes the Place)
   - **GET** `/get/json` (Asserts `404` status code and verifies that the resource no longer exists)
   We use TestNG `dependsOnMethods` to guarantee the execution order of these stateful operations.

3. **Robust Request / Response Assertions**:
   - Reusable `ResponseSpecification` objects verify expected HTTP status codes (`200 OK` vs `201 Created`).
   - Standardized payload validations are performed using Hamcrest matchers (`equalTo`, `notNullValue`, `containsString`).

4. **Public Sandbox API Endpoints**:
   - Tests run against public sandbox endpoints (JSONPlaceholder, SWAPI, httpbin) and the Rahul Shetty Academy Maps API (`https://rahulshettyacademy.com` with API Key `qaclick123`), making them runnable out-of-the-box without requiring custom paid credentials.

---

## 🚀 How to Run the Tests

### Prerequisites
- **Java Development Kit (JDK)** version 11 or higher.
- **Apache Maven** installed and configured on your system's PATH.

### Execution Command
Navigate to the project directory containing `pom.xml` and execute:
```bash
mvn clean test
```
This will compile the classes, download dependencies, and execute all TestNG test suites.
