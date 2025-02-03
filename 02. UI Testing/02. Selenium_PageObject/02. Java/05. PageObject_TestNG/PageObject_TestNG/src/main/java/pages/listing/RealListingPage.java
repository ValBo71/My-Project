package pages.listing;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.testng.Assert;
import pages.baze.BasePage;

public class RealListingPage extends BasePage {
    public RealListingPage(WebDriver driver) {
        super(driver);
    }

    private final By card = By.xpath("//div[@aria-label='Карточка объекта в листинге']");

    public RealListingPage checkCountCards() {
        waitElementIsVisible(driver.findElement(card));
        int countCard = driver.findElements(card).size();
        Assert.assertEquals(countCard, 20);
        return this;
    }
}
