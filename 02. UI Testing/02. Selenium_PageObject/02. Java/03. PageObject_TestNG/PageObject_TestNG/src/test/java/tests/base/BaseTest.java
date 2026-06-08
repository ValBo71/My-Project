package tests.base;

import common.CommonAction;
import org.openqa.selenium.WebDriver;
import pages.baze.BasePage;
import pages.listing.RealListingPage;
import pages.realhome.RealHomePage;

public class BaseTest {
    protected WebDriver driver = CommonAction.creatorDriver();
    protected BasePage basePage = new BasePage(driver);
    protected RealHomePage realHomePage = new RealHomePage(driver);
    protected RealListingPage realListingPage = new RealListingPage(driver);

}
