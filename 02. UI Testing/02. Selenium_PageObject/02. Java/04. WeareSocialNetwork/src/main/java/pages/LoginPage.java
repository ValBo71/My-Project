package pages;

import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
    public LoginPage(WebDriver driver) {
        super(driver, "baseUrl");
    }

    public void authenticate(String username, String password) {
        actions.waitForElementVisibleUntilTimeout("signInPage.username", 30);
        actions.typeValueInField(username, "signInPage.username");
        actions.waitForElementVisible("signInPage.password", 30);
        actions.typeValueInField(password, "signInPage.password");
    }

    public void clickSignInButton() {
        actions.waitForElementVisibleUntilTimeout("signInPage.loginButton", 30);
        actions.clickElement("signInPage.loginButton");
    }
}
