package constants;

import groovy.lang.GString;
import api.utils.UtilsMethod;

public class Constans {

    //https://maps.gougleapis.com/maps/api/place/findplacefromtext/output?parameters

    // domain name
    public static class ServerName{
        public static String GOOGLE_PLEASE_SERVER = "https://maps.gougleapis.com";

    }

    // path

    public static class Path {
        public static String GOOGLE_PLEASE_PATH = "maps/api/place/";
    }
    //endpoint
    public static class Endpint {
        public static String GOOGLE_PLEASE_ENDPOINT_SEARCH = "findplacefromtext/json";
    }

    public static final String API_TOKEN = UtilsMethod.getValue("TOKEN");
}
