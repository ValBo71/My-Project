package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class EnterWrongCredentials {

    private WebDriver driver;
    public WebDriverWait wait;

    public EnterWrongCredentials(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(xpath="//input[@id='username']")
    public WebElement enterUser;

    @FindBy(xpath="//input[@id='password']")
    public WebElement enterPassword;

    @FindBy(xpath="//input[@id='loginBut']")
    public WebElement buttonEnter;


    @FindBy(xpath="//*[@id='save']")
    public WebElement buttonCookies;



    public void enterName() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterUser));
        this.enterUser.sendKeys(new CharSequence[]{"P" + this.randomNumber()});

    }

    public void enterPassword() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterPassword));
        this.enterPassword.sendKeys(new CharSequence[]{"P" + this.randomNumber()});

    }

    public long randomNumber() {
        long min = 10000000000L;
        long max = 20000000000L;
        long randomNumber = (long)Math.floor(Math.random() * (double)(max - min + 1L) + (double)min) / 1000000L;
        return randomNumber;
    }



    public void clickEnter(){
        wait.until(ExpectedConditions.visibilityOf(buttonEnter));
        buttonEnter.click();

    }
    public void clickCookies(){
        wait.until(ExpectedConditions.visibilityOf(buttonCookies));
        buttonCookies.click();

    }


}
