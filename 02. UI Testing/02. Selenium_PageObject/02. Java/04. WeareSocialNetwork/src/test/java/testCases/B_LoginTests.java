package testCases;

import org.junit.Before;
import org.junit.Test;
import testCases.BaseTest;
import testCases.DataConstants;
import testCases.PageHeaderText;

public class B_LoginTests extends BaseTest {
    @Before
    public void navigate() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
    }

    @Test
    public void TC_L_01_UserSuccessfullyAuthenticate_When_ValidCredentialsArePassed() {
        loginPage.authenticate(DataConstants.REGULAR_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.addNewPostButton", 30);
        actions.assertElementVisible("mainPage.navigationBar.addNewPostButton");
    }

    @Test
    public void TC_L_08_AdminUserSuccessfullyAuthenticate_When_ValidCredentialsArePassed() {
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.GOTOAdminZoneButton", 30);
        actions.assertElementVisible("mainPage.navigationBar.GOTOAdminZoneButton");
    }
}
