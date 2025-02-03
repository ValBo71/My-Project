package tests.searchapartment;

import org.testng.annotations.Test;
import tests.base.BaseTest;

public class searchApartmentTest extends BaseTest {
    @Test
    public void checkIsRedirectToListing() {
        basePage.open("https://realt.by/");
        realHomePage
                .enterCountRooms()
                .clickBntFind();

        realListingPage
                .checkCountCards();

    }


}
