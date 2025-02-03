package api.models.google_places;

import api.utils.NetworkCore;

import io.restassured.http.Method;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;

import static constants.Constans.Endpint.GOOGLE_PLEASE_ENDPOINT_SEARCH;
import static constants.Constans.Path.GOOGLE_PLEASE_PATH;
import static constants.Constans.ServerName.GOOGLE_PLEASE_SERVER;

public class GooglePlacesModel extends NetworkCore {

    @Getter
    @Setter
    @Builder
    public static class  RequestModel{
        private String key;
        private String input;
        private String inputtype;
    }

    public GooglePlacesModel search(RequestModel model, Method method, int StatusCode){
        HashMap requestParams = new HashMap();
        requestParams.put("key",model.getKey());
        requestParams.put("input",model.getInput());
        requestParams.put("inputType",model.getInputtype());
        requestSpecBuilder.setBaseUri(GOOGLE_PLEASE_SERVER+GOOGLE_PLEASE_PATH+GOOGLE_PLEASE_ENDPOINT_SEARCH)
                .addQueryParams(requestParams);
        sendRequestAndGetResponse(method, StatusCode);
        return this;


    }

}
