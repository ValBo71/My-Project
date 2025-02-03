import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.Assert.assertEquals;

class PersonTests {
    private Person testPerson;

    @BeforeEach
    void setup() {
        this.testPerson = new Person("Valentin", "Bogdanov", "Shumen", "Sofia", ColorEyes.BROWN, "woodworking", "Martial Arts ", "History", 185, 120, 10000 );
    }

    @Test
    public void test() {


        final int steps = 10000;
        final int additionalPeriod = 30;
        final int expectedResult = 300000;

        final int actualResult = testPerson.addPeriod(additionalPeriod);


        assertEquals(expectedResult, actualResult);
    }


}

