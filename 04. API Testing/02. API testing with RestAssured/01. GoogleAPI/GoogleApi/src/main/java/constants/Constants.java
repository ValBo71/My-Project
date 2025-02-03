package constants;

public class Constants {

    public static class RunVariable {
        public static String server = Servers.JSON_PLACEHOLDER_URL ;
        public static String path = "";

    }

    public static class Servers {
//Swapi
        public static String SWAPI_URL = "https://swapi.dev/";
        public static String JSON_PLACEHOLDER_URL = "https://jsonplaceholder.typicode.com";
        public static String REQUESTBIN_URL = "https://eo9h84u92dbzwxx.m.pipedream.net";

//Google
        public static String GOOOGLE_PLACES_URL;
    }

    public static class Path {
//Swapi
        public static String SWAPI_PHAT = "api/";
//Google
        public static String GOOOGLE_PLACES_PHAT;
    }


    public static class Actions{
        //Swapi
        public static String SWAPI_GET_PEOPLE = "people/";
        //Google
        public static String GOOOGLE_PLACES_ACTIONS;
        public static String JSON_PLACEHOLDER_GET = "comments/";
        public static String JSON_PLACEHOLDER_PUT = "posts/1";
        public static String JSON_PLACEHOLDER_DELETE = "posts/1";
        public static String JSON_PLACEHOLDER_POST = "posts";
    }

}
