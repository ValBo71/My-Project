package pages;

import org.openqa.selenium.WebDriver;

public class RegistrationPage extends BasePage {

    public RegistrationPage(WebDriver driver) {
        super(driver, "baseUrl");
    }

    public void fillUsernameField(String username) {
        actions.waitForElementVisibleUntilTimeout("registerPage.username", 30);
        actions.typeValueInField(username, "registerPage.username");
    }

    public void fillEmailField(String email) {
        actions.waitForElementVisible("registerPage.email");
        actions.typeValueInField(email, "registerPage.email");
    }

    public void fillPasswordField(String password) {
        actions.waitForElementVisible("registerPage.password");
        actions.typeValueInField(password, "registerPage.password");
    }

    public void fillConfirmationPasswordField(String confirmationPassword) {
        actions.waitForElementVisible("registerPage.confirmationPassword");
        actions.typeValueInField(confirmationPassword, "registerPage.confirmationPassword");
    }

    public void clickRegisterButton() {
        actions.waitForElementVisible("registerPage.registerButton");
        actions.clickElement("registerPage.registerButton");
    }
}
