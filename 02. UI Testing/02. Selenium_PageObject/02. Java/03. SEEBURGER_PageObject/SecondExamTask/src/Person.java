public class Person {


    private String firstName;
    private String lastName;
    private String homeTown;
    private String city;
    private ColorEyes colorEyes;
    private String hobbyOne;
    private String hobbyTwo;
    private String hobbyThree;
    private int height;
    private int weight;
    private int steps;
    private int stepsForPeriod;


    public Person(String firstName, String lastName, String homeTown, String city, ColorEyes colorEyes, String hobbyOne, String hobbyTwo, String hobbyThree, int height, int weight, int steps) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.homeTown = homeTown;
        this.city = city;
        this.colorEyes = colorEyes;
        this.hobbyOne = hobbyOne;
        this.hobbyTwo = hobbyTwo;
        this.hobbyThree = hobbyThree;
        this.height = height;
        this.weight = weight;
        this.steps = steps;
    }

        public int addPeriod(int additionalPeriod){

       return stepsForPeriod = steps * additionalPeriod;
    }

    public int getStepsForPeriod() {
        return stepsForPeriod;
    }



    @Override
    public String toString() {
        return "Hello! " +
                "My first name is " + firstName + '\'' +
                ", my last name is " + lastName + '\'' +
                ". I was born in  " + homeTown + '\'' +
                ", but I live in " + city + '\'' +
                ". The color of my eyes is " + colorEyes + '\'' +
                ". Naturally, I have my hobbies: " + hobbyOne + '\'' +
                ", " + hobbyTwo + '\'' +
                " and " + hobbyThree + '\'' +
                ". I am " + height +
                "cm tall and weight " + weight +
                "kg. I walk " + steps +
                " steps every day. I pass in total  " + stepsForPeriod + "steps";
    }
}
