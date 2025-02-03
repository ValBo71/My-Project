package pages.realhome;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import pages.baze.BasePage;

public class RealHomePage extends BasePage {

    public RealHomePage(WebDriver driver) {
        super(driver);
    }

    By countRooms = By.xpath("//select[@id='rooms']");
    By option2Rooms = By.xpath("//select[@id='rooms']/option[@value='2']");
    By findBtn = By.xpath("//div[@id='residentialInputs']//a[@class='common-search-submit btn btn-primary'][contains(text(),'Найти')]");


    public RealHomePage enterCountRooms() {
        driver.findElement(countRooms).click();
        driver.findElement(option2Rooms).click();
        return this;
    }

    public RealHomePage clickBntFind() {
        driver.findElement(findBtn).click();
        return this;
    }
}
