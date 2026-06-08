package tests.google_places.negative;

import api.models.google_places.GooglePlacesModel;
import base.BaseTest;
import io.restassured.http.Method;
import org.testng.Assert;
import org.testng.annotations.Test;

import static constants.Constants.API_TOKEN;

public class SearchTestNegative extends BaseTest {

    @Test(description = "Verify search request fails gracefully with an invalid API Key")
    public void searchWithInvalidKey() {
        GooglePlacesModel.RequestModel requestModel = GooglePlacesModel.RequestModel.builder()
                .key("invalid_key_value_12345")
                .input("Paris")
                .inputtype("textquery")
                .build();

        GooglePlacesModel model = apiManager.getGooglePlacesModel();
        String status = model.search(requestModel, Method.GET, 200)
                .responseBody.getString("status");
        Assert.assertEquals(status, "REQUEST_DENIED", "Search with invalid key should return REQUEST_DENIED status.");
    }

    @Test(description = "Verify search request fails gracefully when API Key is missing")
    public void searchWithMissingKey() {
        GooglePlacesModel.RequestModel requestModel = GooglePlacesModel.RequestModel.builder()
                .key("")
                .input("London")
                .inputtype("textquery")
                .build();

        GooglePlacesModel model = apiManager.getGooglePlacesModel();
        String status = model.search(requestModel, Method.GET, 200)
                .responseBody.getString("status");
        Assert.assertEquals(status, "REQUEST_DENIED", "Search with missing key should return REQUEST_DENIED status.");
    }

    @Test(description = "Verify search request returns error status when inputtype is invalid")
    public void searchWithInvalidInputType() {
        GooglePlacesModel.RequestModel requestModel = GooglePlacesModel.RequestModel.builder()
                .key(API_TOKEN)
                .input("Tokyo")
                .inputtype("invalid_type_param")
                .build();

        GooglePlacesModel model = apiManager.getGooglePlacesModel();
        String status = model.search(requestModel, Method.GET, 200)
                .responseBody.getString("status");
        Assert.assertEquals(status, "INVALID_REQUEST", "Search with invalid inputtype should return INVALID_REQUEST status.");
    }
}
