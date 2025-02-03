package api.utils;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.Method;
import io.restassured.response.Response;
import org.json.JSONObject;
import org.testng.Assert;

import static io.restassured.RestAssured.given;
import static io.restassured.RestAssured.when;

public class NetworkCore {

    protected Response response;
    protected RequestSpecBuilder requestSpecBuilder = new RequestSpecBuilder();
    protected JSONObject responseBody;

    public void sendRequestAndGetResponse(Method methd, int code){
        response = given().spec(requestSpecBuilder.build()).log().uri().log().parameters()
        .when().request(methd);
        response.then().log().body().assertThat().statusCode(code);
        try {
            responseBody = new JSONObject(response.getBody().asString());
        }catch ( Exception e) {
            Assert.fail("Can't get response body");
        }

    }

}
