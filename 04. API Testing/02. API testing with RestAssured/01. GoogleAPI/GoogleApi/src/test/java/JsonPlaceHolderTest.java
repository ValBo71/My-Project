import config.TestConfig;
import org.testng.annotations.Test;

import static constants.Constants.Actions.*;
import static io.restassured.RestAssured.given;

public class JsonPlaceHolderTest extends TestConfig {
@Test
    public void GET(){
     given().queryParam("postId", 1).log().uri().
             when().get(JSON_PLACEHOLDER_GET).then().log().body().statusCode(200);

}
@Test
    public void Put(){
    String putBodyJson = "{\n" +
            "    \"id\": 1,\n" +
            "    \"title\": \"foo\",\n" +
            "    \"body\": \"bar\",\n" +
            "    \"userId\": 1,\n" +
            "  }";

    given().body(putBodyJson).log().uri().
            when().put(JSON_PLACEHOLDER_PUT).
            then().log().body().statusCode(200);

}

@Test
    public void Delete(){
            given().log().uri().
            when().delete(JSON_PLACEHOLDER_DELETE).
            then().log().body().statusCode(200);

}

@Test
    public void PostWhithJson() {
    String postBodyJson = "{\n" +
            "    \"title\": \"foo\",\n" +
            "    \"body\": \"bar\",\n" +
            "    \"userId\": 1,\n" +
            "  }";

    given().body(postBodyJson).log().all().
            when().post(JSON_PLACEHOLDER_POST).
            then().spec(responseSpecificationForPost).log().body().statusCode(201);


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

    given().spec(requestSpecificationXML).body(postXMLbody).log().all().
            when().post("").
            then().spec(responseSpecificationForGet).log().body().statusCode(200);


}

}
