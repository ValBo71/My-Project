import config.TestConfig;
import org.testng.annotations.Test;

import static constants.Constants.Actions.*;
import static io.restassured.RestAssured.given;

public class JsonPlaceHolderTest extends TestConfig {

    @Test
    public void GET() {
        given().spec(requestSpecJsonPlaceholder)
                .queryParam("postId", 1)
                .log().uri()
                .when().get(JSON_PLACEHOLDER_GET)
                .then().spec(responseSpec200)
                .log().body();
    }

    @Test
    public void Put() {
        String putBodyJson = "{\n" +
                "    \"id\": 1,\n" +
                "    \"title\": \"foo\",\n" +
                "    \"body\": \"bar\",\n" +
                "    \"userId\": 1\n" +
                "}";

        given().spec(requestSpecJsonPlaceholder)
                .body(putBodyJson)
                .log().uri()
                .when().put(JSON_PLACEHOLDER_PUT)
                .then().spec(responseSpec200)
                .log().body();
    }

    @Test
    public void Delete() {
        given().spec(requestSpecJsonPlaceholder)
                .log().uri()
                .when().delete(JSON_PLACEHOLDER_DELETE)
                .then().spec(responseSpec200)
                .log().body();
    }

    @Test
    public void PostWithJson() {
        String postBodyJson = "{\n" +
                "    \"title\": \"foo\",\n" +
                "    \"body\": \"bar\",\n" +
                "    \"userId\": 1\n" +
                "}";

        given().spec(requestSpecJsonPlaceholder)
                .body(postBodyJson)
                .log().all()
                .when().post(JSON_PLACEHOLDER_POST)
                .then().spec(responseSpec201)
                .log().body();
    }

    @Test
    public void PostWithXML() {
        String postXMLbody = "\t\t\t<Company>\n" +
                "\t\t\t  <Employee>\n" +
                "\t\t\t\t  <FirstName>Tanmay</FirstName>\n" +
                "\t\t\t\t  <LastName>Patil</LastName>\n" +
                "\t\t\t\t  <ContactNo>1234567890</ContactNo>\n" +
                "\t\t\t\t  <Email>tanmaypatil@xyz.com</Email>\n" +
                "\t\t\t\t  <Address>\n" +
                "\t\t\t\t\t   <City>Bangalore</City>\n" +
                "\t\t\t\t\t   <State>Karnataka</State>\n" +
                "\t\t\t\t\t   <Zip>560212</Zip>\n" +
                "\t\t\t\t  </Address>\n" +
                "\t\t\t  </Employee>\n" +
                "\t\t\t</Company>\n" +
                "\t\t\t";

        given().spec(requestSpecificationXML)
                .body(postXMLbody)
                .log().all()
                .when().post("")
                .then().spec(responseSpec200)
                .log().body();
    }
}
