package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AOneVignette {

    private WebDriver driver;
    public WebDriverWait wait;

    public AOneVignette(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(xpath="//img[@alt='е-Винетка']")
    public WebElement ButtonVignette;

    @FindBy(xpath="//div[@class='cell text-right']//a[@class='button arrow-next'][contains(text(),'Купи тук')]")
    public WebElement buyHereButton;

    @FindBy(xpath="//img[@id='ico1']")
    public WebElement categoryVignette;

    @FindBy(xpath="//img[@id='priceTag-4']")
    public WebElement priceTagButton;

    @FindBy(xpath="//input[@id='plate']")
    public WebElement numberField;

    @FindBy(xpath="//input[@id='startFrom2']")
    public WebElement dateField;

    @FindBy(xpath="//a[@class='ui-state-default ui-state-highlight ui-state-hover']")
    public WebElement enterDateField;

    @FindBy(xpath="//input[@id='email']")
    public WebElement enterEmailField;

    @FindBy(xpath="//label[@for='tos_accept']//var[1]")
    public WebElement checkBox;

    @FindBy(xpath="//button[contains(text(),'Продължи')] ")
    public WebElement continueButton;

    @FindBy(xpath="//button[contains(text(),'Потвърди')]")
    public WebElement confirmButton;

    @FindBy(xpath="//td[contains(text(),'CA1234BТ')]")
    public WebElement numberCar;

    @FindBy(xpath="//td[contains(text(),'уикенд')]")
    public WebElement vignetteDuration;

    @FindBy(xpath="//td[contains(text(),'10.00 лв.')]")
    public WebElement paymentAmount;

    @FindBy(xpath="//td[normalize-space()='BG']")
    public WebElement country;

    @FindBy(xpath="//td[normalize-space()='K3']//td[normalize-space()='K3']")
    public WebElement carCategory;

    @FindBy(xpath="//td[contains(text(),'Лек автомобил до 3,5 тона')]")
    public WebElement carType;

    @FindBy(xpath="//button[@id='i_btn_submit']")
    public WebElement payButton;

    @FindBy(xpath="//img[@class='footer-borica-logo']")
    public WebElement logoBorica;




    public void clickVignetteButton(){
        wait.until(ExpectedConditions.visibilityOf(ButtonVignette));
        ButtonVignette.click();
    }

    public void clickBuyHereButton(){
        wait.until(ExpectedConditions.visibilityOf(buyHereButton));
        buyHereButton.click();
    }
    public void clickCategoryVignette(){
        wait.until(ExpectedConditions.visibilityOf(categoryVignette));
        categoryVignette.click();
    }

    public void clickPriceTagButton(){
        wait.until(ExpectedConditions.visibilityOf(priceTagButton));
        priceTagButton.click();
    }

    public void enterNumberField() {
        wait.until(ExpectedConditions.visibilityOf(numberField));
        numberField.sendKeys("CA1234BТ");
    }
    public void clickDateField(){
        wait.until(ExpectedConditions.visibilityOf(dateField));
        dateField.click();
    }

    public void enterDateField(){
        wait.until(ExpectedConditions.visibilityOf(enterDateField));
        enterDateField.click();
    }

    public void clickContinueButton(){
        wait.until(ExpectedConditions.visibilityOf(continueButton));
        continueButton.click();
    }

    public void enterEmailName() {
        wait.until(ExpectedConditions.visibilityOf(enterEmailField));
        enterEmailField.sendKeys("test@a1.bg");

    }

    public void clickCheckBox(){
        wait.until(ExpectedConditions.visibilityOf(checkBox));
        checkBox.click();
    }

    public void clickConfirmButton(){
        wait.until(ExpectedConditions.visibilityOf(confirmButton));
        confirmButton.click();
    }

}
