public class Main {
    public static void main(String[] args) {

    Person userOne = new Person("Valentin", "Bogdanov", "Shumen", "Sofia", ColorEyes.BROWN, "woodworking", "Martial Arts ", "History", 185, 120, 10000 );
   MyPersonality userTwo = new MyPersonality("Pencho", "Penchev", "Samokov", "Plovdiv", ColorEyes.BLUE,"cycling", "travel","mountain climbing ", 178, 80, 20000);


    userOne.addPeriod(30);

        System.out.println(userOne);
        System.out.println(userTwo);


    }


}
