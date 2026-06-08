package constants;

import api.utils.UtilsMethod;

public class Constants {

    // Domain name
    public static class ServerName {
        public static final String GOOGLE_PLACES_SERVER = "https://maps.googleapis.com";
    }

    // Path
    public static class Path {
        public static final String GOOGLE_PLACES_PATH = "maps/api/place/";
    }

    // Endpoint
    public static class Endpoint {
        public static final String GOOGLE_PLACES_ENDPOINT_SEARCH = "findplacefromtext/json";
    }

    public static final String API_TOKEN = UtilsMethod.getValue("TOKEN");
}
