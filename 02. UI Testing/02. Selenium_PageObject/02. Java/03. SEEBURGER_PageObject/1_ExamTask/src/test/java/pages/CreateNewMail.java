package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CreateNewMail {

    private WebDriver driver;
    public WebDriverWait wait;

    public CreateNewMail(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(xpath="//strong[contains(text(),'Регистрирай се!')]")
    public WebElement ButtonRegister;

    @FindBy(xpath="//input[@id='regformUsername']")
    public WebElement enterNewUserName;

    @FindBy(xpath="//input[@id='password']")
    public WebElement enterNewPassword;

    @FindBy(xpath="//input[@id='password2']")
    public WebElement repeatPassword;

    @FindBy(xpath="//input[@id='phoneRecovery1']")
    public WebElement uncheckPhone;

    @FindBy(xpath="//input[@id='altemail']")
    public WebElement enterAlternativeMail;

    @FindBy(xpath="//input[@id='question']")
    public WebElement secretQuestion;

    @FindBy(xpath="//input[@id='answer']")
    public WebElement secretAnswer;

    @FindBy(xpath="//input[@id='fname']")
    public WebElement enterFirstName;

    @FindBy(xpath="//input[@id='lname']")
    public WebElement enterLastName;

    @FindBy(xpath="//label[contains(text(),'Мъж')]")
    public WebElement chooseGender;

    @FindBy(xpath="//li[normalize-space()='1']")
    public WebElement enterDayField;

    @FindBy(xpath="//li[contains(text(),'Януари')]")
    public WebElement enterMount;

    @FindBy(xpath="//li[normalize-space()='2008']")
    public WebElement enterYear;

    @FindBy(xpath="//div[@class='recaptcha-checkbox-border']")
    public WebElement robotCheck;

    @FindBy(xpath="//input[@value='Създай АБВ Профил']")
    public WebElement createProfileButton;

    @FindBy(xpath="//input[@value='Влез в пощата си']")
    public WebElement logMailButton;




    public void clickButtonRegister(){
        wait.until(ExpectedConditions.visibilityOf(ButtonRegister));
        ButtonRegister.click();
    }

    public void enterNewUserName() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterNewUserName));
        this.enterNewUserName.sendKeys("penchopenchev20082008");
    }
    public void enterNewPassword() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterNewPassword));
        this.enterNewPassword.sendKeys("PP123456789");
    }
    public void repeatNewPassword() {
        this.wait.until(ExpectedConditions.visibilityOf(this.repeatPassword));
        this.repeatPassword.sendKeys("PP123456789");
    }

    public void clickUncheckPhone(){
        wait.until(ExpectedConditions.visibilityOf(uncheckPhone));
        uncheckPhone.click();
    }

    public void enterAlternativeMail() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterAlternativeMail));
        this.enterAlternativeMail.sendKeys("pencho@abv.bg");
    }

    public void enterSecretQuestion() {
        this.wait.until(ExpectedConditions.visibilityOf(this.secretQuestion));
        this.secretQuestion.sendKeys("Who are you?");
    }
    public void enterSecretAnswer() {
        this.wait.until(ExpectedConditions.visibilityOf(this.secretAnswer));
        this.secretAnswer.sendKeys("I am the one who is trying to remember what the question is");
    }

    public void enterFirstName() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterFirstName));
        this.enterFirstName.sendKeys("Pencho");
    }

    public void enterLastName() {
        this.wait.until(ExpectedConditions.visibilityOf(this.enterLastName));
        this.enterLastName.sendKeys("Penchev");
    }


    public void clickChooseGender(){
        wait.until(ExpectedConditions.visibilityOf(chooseGender));
        chooseGender.click();
    }

    public void clickEnterDayField(){
        wait.until(ExpectedConditions.visibilityOf(enterDayField));
        enterDayField.click();
    }

    public void enterBirthMount() {
        wait.until(ExpectedConditions.visibilityOf(enterMount));
        enterMount.click();
    }
    public void clickEnterYear(){
        wait.until(ExpectedConditions.visibilityOf(enterYear));
        enterYear.click();
    }

    public void clickRobotCheck(){
        wait.until(ExpectedConditions.visibilityOf(robotCheck));
        robotCheck.click();
    }

    public void clickCreateProfileButton(){
        wait.until(ExpectedConditions.visibilityOf(createProfileButton));
        createProfileButton.click();
    }

    public void clickLogMailButton() {
        wait.until(ExpectedConditions.visibilityOf(logMailButton));
        logMailButton.click();

    }

}
