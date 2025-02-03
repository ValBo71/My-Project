package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AOneTablet {

    private WebDriver driver;
    public WebDriverWait wait;

    public AOneTablet(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(xpath="//figcaption[contains(text(),'Устройства')]")
    public WebElement devicesButton;

    @FindBy(xpath="//a[@id='device_type_name_mobile_3']")
    public WebElement phonesButton;

    @FindBy(xpath="//a[@id='device_type_name_mobile_4']")
    public WebElement tabletsButton;

    @FindBy(xpath="//*[@id='devices_content_4']/div[1]/ul/li[6]/figure/a/img")
    public WebElement iPad;

    @FindBy(xpath="//span[@itemprop='brand']")
    public WebElement iPadText;

    @FindBy(xpath="//button[@class='aui-button aui-button-primary search-button']")
    public WebElement searchFieldButton;

    public void clickDevicesButton(){
        wait.until(ExpectedConditions.visibilityOf(devicesButton));
        devicesButton.click();
    }

    public void clickPhonesButton(){
        wait.until(ExpectedConditions.visibilityOf(phonesButton));
        phonesButton.click();

    }

    public void clickTabletsButton(){
        wait.until(ExpectedConditions.visibilityOf(tabletsButton));
        tabletsButton.click();

    }

    public void choiceIPad(){
        wait.until(ExpectedConditions.visibilityOf(iPad));
        iPad.click();

    }
}
