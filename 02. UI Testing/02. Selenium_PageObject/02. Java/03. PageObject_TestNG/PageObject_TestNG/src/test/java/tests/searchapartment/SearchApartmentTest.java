package tests.searchapartment;

import org.testng.annotations.Test;
import tests.base.BaseTest;

public class SearchApartmentTest extends BaseTest {
    @Test
    public void checkIsRedirectToListing() {
        basePage.open("https://realt.by/");
        realHomePage
                .enterCountRooms()
                .clickBntFind();

        realListingPage
                .checkCountCards();
    }

    @Test
    public void checkIsRedirectToListing1Room() {
        basePage.open("https://realt.by/");
        realHomePage
                .selectRooms("1к квартира")
                .clickBntFind();

        realListingPage
                .checkCountCards();
    }

    @Test
    public void checkIsRedirectToListing3Rooms() {
        basePage.open("https://realt.by/");
        realHomePage
                .selectRooms("3к квартира")
                .clickBntFind();

        realListingPage
                .checkCountCards();
    }


}
