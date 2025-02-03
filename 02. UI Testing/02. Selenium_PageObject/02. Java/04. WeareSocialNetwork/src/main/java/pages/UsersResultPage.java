package pages;

import org.openqa.selenium.WebDriver;

public class UsersResultPage extends BasePage {
    public UsersResultPage(WebDriver driver) {
        super(driver, "baseUrl");
    }

    public void scrollDownToUser(String locator) {
        actions.scrollDownUntilElementVisible(locator);
    }

    public void clickSeeProfileButton() {
        actions.clickElement("adminPage.viewUsers.userSeeProfileButton");
    }
}
