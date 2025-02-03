import config.TestConfig;
import io.restassured.RestAssured.*;
import org.testng.annotations.Test;

import static constants.Constants.Actions.SWAPI_GET_PEOPLE;
import static io.restassured.RestAssured.given;


public class FirstTest extends TestConfig {
    @Test
    public void MyFirstTest(){
             given().log().uri().
                when().get( SWAPI_GET_PEOPLE+"1").
                        then().log().body().statusCode(200);



    }

}
