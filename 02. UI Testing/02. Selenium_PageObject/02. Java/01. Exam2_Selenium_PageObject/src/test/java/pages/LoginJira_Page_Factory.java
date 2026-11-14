package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;


public class LoginJira_Page_Factory {

    private WebDriver driver;

    public LoginJira_Page_Factory(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
    }

    @FindBy(id="login-form-username")
    public WebElement emailField;

    @FindBy(id="login-form-password")
    public WebElement passwordField;

    @FindBy(id="login")
    public WebElement logInButton;

    public void enterEmail(String email) {
        emailField.sendKeys(email);
    }

    public void enterEmail() {
        enterEmail(LocalCredentials.get("jira.username"));
    }

    public void enterPassword(String password) {
        passwordField.sendKeys(password);
    }

    public void enterPassword() {
        enterPassword(LocalCredentials.get("jira.password"));
    }

    public void clickLogInButton() {
        logInButton.click();
    }
}
