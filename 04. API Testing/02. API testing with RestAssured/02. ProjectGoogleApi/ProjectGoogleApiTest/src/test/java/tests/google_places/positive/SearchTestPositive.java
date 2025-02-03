package tests.google_places.positive;

import api.models.google_places.GooglePlacesModel;
import base.BaseTest;
import io.restassured.http.Method;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import static constants.Constans.API_TOKEN;

public class SearchTestPositive extends BaseTest {

    @Test(description = "Search some object", dataProvider = "searchText")
    public void SearchPlaceModelWhitText(String key, String input, String inputtype){
        GooglePlacesModel.RequestModel requestModel = GooglePlacesModel.RequestModel.builder()
                .key(key)
                .input(input)
                .inputtype(inputtype)
                .build();
        apiManager.getGooglePlacesModel().search(requestModel, Method.GET, 200);
    }

    @DataProvider
    public Object[] [] searchText(){
        return  new Object[][]{
        {API_TOKEN, "New York", "textquery"}
        };


    }

}
