package config;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import org.testng.annotations.BeforeClass;
import io.restassured.RestAssured;

import static constants.Constants.Servers.JSON_PLACEHOLDER_URL;
import static constants.Constants.Servers.SWAPI_URL;
import static constants.Constants.Path.SWAPI_PATH;
import static constants.Constants.Servers.GOOGLE_PLACES_URL;
import static constants.Constants.Path.GOOGLE_PLACES_PATH;
import static constants.Constants.Actions.GOOGLE_PLACES_KEY;
import static constants.Constants.Servers.REQUESTBIN_URL;

public class TestConfig {

    // Specifications for SWAPI
    protected RequestSpecification requestSpecSwapi = new RequestSpecBuilder()
            .setBaseUri(SWAPI_URL)
            .setBasePath(SWAPI_PATH)
            .addHeader("Content-Type", "application/json")
            .build();

    // Specifications for JSONPlaceholder
    protected RequestSpecification requestSpecJsonPlaceholder = new RequestSpecBuilder()
            .setBaseUri(JSON_PLACEHOLDER_URL)
            .addHeader("Content-Type", "application/json")
            .build();

    // Specifications for Google Places
    protected RequestSpecification requestSpecGooglePlaces = new RequestSpecBuilder()
            .setBaseUri(GOOGLE_PLACES_URL)
            .setBasePath(GOOGLE_PLACES_PATH)
            .addQueryParam("key", GOOGLE_PLACES_KEY)
            .addHeader("Content-Type", "application/json")
            .build();

    // Specification for XML POST to httpbin
    protected RequestSpecification requestSpecificationXML = new RequestSpecBuilder()
            .setBaseUri(REQUESTBIN_URL)
            .setBasePath("post")
            .addHeader("Content-Type", "application/xml")
            .addCookie("testCookieXML")
            .build();

    // Legacy JSON specification defaulting to JSONPlaceholder
    protected RequestSpecification requestSpecificationJson = new RequestSpecBuilder()
            .setBaseUri(JSON_PLACEHOLDER_URL)
            .addHeader("Content-Type", "application/json")
            .addCookie("testCookieJson")
            .build();

    // Reusable response specifications
    protected ResponseSpecification responseSpec200 = new ResponseSpecBuilder()
            .expectStatusCode(200)
            .build();

    protected ResponseSpecification responseSpec201 = new ResponseSpecBuilder()
            .expectStatusCode(201)
            .build();

    // Legacy response specifications
    protected ResponseSpecification responseSpecificationForGet = responseSpec200;
    protected ResponseSpecification responseSpecificationForPost = responseSpec200;

    @BeforeClass
    public void SetUp() {
        // Set up global RestAssured defaults
        RestAssured.baseURI = JSON_PLACEHOLDER_URL;
        RestAssured.basePath = "";
        RestAssured.requestSpecification = requestSpecificationJson;
    }
}
