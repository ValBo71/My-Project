package pages.realhome;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import pages.baze.BasePage;

public class RealHomePage extends BasePage {

    public RealHomePage(WebDriver driver) {
        super(driver);
    }

    By countRooms = By.xpath("//div[@role='button' and .//span[text()='Кол-во комнат']]");
    By findBtn = By.xpath("//a[contains(., 'Найти') and contains(@class, 'bg-primary')]");

    public RealHomePage selectRooms(String roomsOptionText) {
        driver.findElement(countRooms).click();
        By optionRooms = By.xpath("//div[@role='button' and text()='" + roomsOptionText + "']");
        driver.findElement(optionRooms).click();
        return this;
    }

    public RealHomePage enterCountRooms() {
        return selectRooms("2к квартира");
    }

    public RealHomePage clickBntFind() {
        driver.findElement(findBtn).click();
        return this;
    }
}
