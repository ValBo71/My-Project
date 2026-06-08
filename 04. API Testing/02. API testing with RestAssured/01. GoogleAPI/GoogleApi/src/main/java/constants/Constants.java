package constants;

public class Constants {

    public static class RunVariable {
        public static String server = Servers.JSON_PLACEHOLDER_URL;
        public static String path = "";
    }

    public static class Servers {
        // Swapi
        public static String SWAPI_URL = "https://swapi.dev/";
        public static String JSON_PLACEHOLDER_URL = "https://jsonplaceholder.typicode.com";
        public static String REQUESTBIN_URL = "https://httpbin.org"; // Redirect temporary RequestBin to stable httpbin

        // Google
        public static String GOOGLE_PLACES_URL = "https://rahulshettyacademy.com";
    }

    public static class Path {
        // Swapi
        public static String SWAPI_PATH = "api/";
        // Google
        public static String GOOGLE_PLACES_PATH = "maps/api/place";
    }

    public static class Actions {
        // Swapi
        public static String SWAPI_GET_PEOPLE = "people/";
        
        // Google
        public static String GOOGLE_PLACES_KEY = "qaclick123";
        public static String GOOGLE_PLACE_ADD = "add/json";
        public static String GOOGLE_PLACE_GET = "get/json";
        public static String GOOGLE_PLACE_UPDATE = "update/json";
        public static String GOOGLE_PLACE_DELETE = "delete/json";
        
        // JSONPlaceholder
        public static String JSON_PLACEHOLDER_GET = "comments/";
        public static String JSON_PLACEHOLDER_PUT = "posts/1";
        public static String JSON_PLACEHOLDER_DELETE = "posts/1";
        public static String JSON_PLACEHOLDER_POST = "posts";
    }
}
