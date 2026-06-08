# Model-Based Google Places Search API Test Framework

This project is a Java-based API testing framework built using **RestAssured**, **TestNG**, **Maven**, and **Lombok**. It demonstrates a **Model-Based HTTP Request** pattern, where requests are encapsulated into custom Java models and mapped dynamically to parameters.

---

## 📂 Project Structure

```text
ProjectGoogleApiTest/
│
├── pom.xml                               # Maven project dependencies (RestAssured, TestNG, Lombok, org.json)
└── src/
    ├── main/java/
    │   ├── api/
    │   │   ├── api_manager/
    │   │   │   └── ApiManager.java       # API manager wrapping model instances
    │   │   ├── models/
    │   │   │   └── google_places/
    │   │   │       └── GooglePlacesModel.java # Google Places search endpoint model & runner
    │   │   └── utils/
    │   │       ├── NetworkCore.java      # REST client wrapper carrying out HTTP requests
    │   │       └── UtilsMethod.java      # Helper methods (property reader)
    │   └── constants/
    │       └── Constants.java            # Server, path, and endpoint constants
    └── test/java/
        ├── base/
        │   └── BaseTest.java             # Base test setup initializing the ApiManager
        ├── resources/
        │   └── userData.properties       # Properties file containing Google Places API key (TOKEN)
        └── tests/google_places/
            ├── positive/
            │   └── SearchTestPositive.java # Positive search tests using TestNG DataProviders
            └── negative/
                └── SearchTestNegative.java # Negative search tests (invalid key, missing key, invalid inputtype)
```

---

## 🛠️ Key Features

1. **Model-Based Request Execution**:
   In [GooglePlacesModel.java](src/main/java/api/models/google_places/GooglePlacesModel.java), we define a strongly-typed nested builder `RequestModel`:
   ```java
   public static class RequestModel {
       private String key;
       private String input;
       private String inputtype;
   }
   ```
   This model allows tests to construct request payloads dynamically using Lombok's `@Builder` pattern, which maps variables directly into endpoint query parameters.

2. **Network Core Abstraction**:
   [NetworkCore.java](src/main/java/api/utils/NetworkCore.java) acts as the underlying client runner, configuring logs (for both requests and responses), asserting response status codes, and parsing response bodies into `org.json.JSONObject` objects for easy parsing.

3. **Complete Search API Test Coverage**:
   - **Positive Tests**: Validates Google Places Find Place from Text searches using valid API keys, querying locations (e.g. New York) via TestNG `@DataProvider`.
   - **Negative Tests**: Verifies Google API responses when encountering invalid authentication tokens, missing keys, or unsupported query types.

---

## 🚀 How to Run the Tests

### Prerequisites
- **Java Development Kit (JDK)** version 11 or higher.
- **Apache Maven** installed and configured on your system's PATH.

### Configuration
Update your API Token inside the property file located at:
`src/test/resources/userData.properties`
```properties
TOKEN=your_actual_google_api_key
```

### Execution
Run the following Maven command in the directory containing `pom.xml`:
```bash
mvn clean test
```
