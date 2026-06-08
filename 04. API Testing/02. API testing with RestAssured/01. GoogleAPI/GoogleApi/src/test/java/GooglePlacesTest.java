import config.TestConfig;
import io.restassured.path.json.JsonPath;
import org.testng.Assert;
import org.testng.annotations.Test;

import static constants.Constants.Actions.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class GooglePlacesTest extends TestConfig {

    private static String placeId;
    private static final String originalAddress = "29, side layout, cohen 09";
    private static final String updatedAddress = "70 Summer walk, USA";
    private static final String placeName = "Frontline house";

    @Test
    public void addPlaceTest() {
        String requestBody = "{\n" +
                "  \"location\": {\n" +
                "    \"lat\": -38.383494,\n" +
                "    \"lng\": 33.427362\n" +
                "  },\n" +
                "  \"accuracy\": 50,\n" +
                "  \"name\": \"" + placeName + "\",\n" +
                "  \"phone_number\": \"(+91) 983 893 3937\",\n" +
                "  \"address\": \"" + originalAddress + "\",\n" +
                "  \"types\": [\n" +
                "    \"shoe park\",\n" +
                "    \"shop\"\n" +
                "  ],\n" +
                "  \"website\": \"http://google.com\",\n" +
                "  \"language\": \"French-IN\"\n" +
                "}";

        String response = given().spec(requestSpecGooglePlaces)
                .body(requestBody)
                .log().all()
                .when().post(GOOGLE_PLACE_ADD)
                .then().spec(responseSpec200)
                .body("status", equalTo("OK"))
                .body("place_id", notNullValue())
                .log().body()
                .extract().response().asString();

        JsonPath json = new JsonPath(response);
        placeId = json.getString("place_id");
        Assert.assertNotNull(placeId, "Place ID should not be null after creation.");
    }

    @Test(dependsOnMethods = "addPlaceTest")
    public void getPlaceTest() {
        given().spec(requestSpecGooglePlaces)
                .queryParam("place_id", placeId)
                .log().uri()
                .when().get(GOOGLE_PLACE_GET)
                .then().spec(responseSpec200)
                .body("name", equalTo(placeName))
                .body("address", equalTo(originalAddress))
                .log().body();
    }

    @Test(dependsOnMethods = "getPlaceTest")
    public void updatePlaceTest() {
        String updateBody = "{\n" +
                "  \"place_id\": \"" + placeId + "\",\n" +
                "  \"address\": \"" + updatedAddress + "\",\n" +
                "  \"key\": \"" + GOOGLE_PLACES_KEY + "\"\n" +
                "}";

        given().spec(requestSpecGooglePlaces)
                .body(updateBody)
                .log().all()
                .when().put(GOOGLE_PLACE_UPDATE)
                .then().spec(responseSpec200)
                .body("msg", equalTo("Address successfully updated"))
                .log().body();
    }

    @Test(dependsOnMethods = "updatePlaceTest")
    public void getUpdatedPlaceTest() {
        given().spec(requestSpecGooglePlaces)
                .queryParam("place_id", placeId)
                .log().uri()
                .when().get(GOOGLE_PLACE_GET)
                .then().spec(responseSpec200)
                .body("name", equalTo(placeName))
                .body("address", equalTo(updatedAddress))
                .log().body();
    }

    @Test(dependsOnMethods = "getUpdatedPlaceTest")
    public void deletePlaceTest() {
        String deleteBody = "{\n" +
                "  \"place_id\": \"" + placeId + "\"\n" +
                "}";

        given().spec(requestSpecGooglePlaces)
                .body(deleteBody)
                .log().all()
                .when().post(GOOGLE_PLACE_DELETE)
                .then().spec(responseSpec200)
                .body("status", equalTo("OK"))
                .log().body();
    }

    @Test(dependsOnMethods = "deletePlaceTest")
    public void getDeletedPlaceTest() {
        // Assert that fetching a deleted place returns 404 (as per sandbox API implementation)
        given().spec(requestSpecGooglePlaces)
                .queryParam("place_id", placeId)
                .log().uri()
                .when().get(GOOGLE_PLACE_GET)
                .then().statusCode(404)
                .body("msg", containsString("doesn't exists"))
                .log().body();
    }
}
