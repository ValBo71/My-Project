package testCases;

import org.junit.Test;

public class F_FriendRequestTests extends BaseTest {

    @Test
    public void TC_F_01_SendFriendRequest(){
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.GOTOAdminZoneButton", 30);
        actions.assertElementPresent("mainPage.navigationBar.GOTOAdminZoneButton");
        basePage.typeNameInSearchField(DataConstants.SECOND_REGULAR_USERNAME);
        basePage.clickSearchButton();
        usersResultPage.scrollDownToUser("adminPage.viewUsers.secondUser");
        usersResultPage.clickSeeProfileButton();
        actions.assertElementAttribute("friendRequest.connectButton", "value", "connect");
        personalProfilePage.clickConnectButton();
        actions.waitForElementVisibleUntilTimeout("friendRequest.connectMessage", 30);
        actions.assertElementPresent("friendRequest.connectMessage");
    }

    @Test
    public void TC_F_02_AcceptFriendRequest(){
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.SECOND_REGULAR_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        basePage.clickPersonalProfileButton();
        actions.waitForElementVisibleUntilTimeout("personalProfilePage.friendRequest", 30);
        actions.assertElementAttribute("personalProfilePage.friendRequest", "value", "New Friend Requsts");
        personalProfilePage.clickNewFriendRequestButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.FRIEND_REQUEST_HEADER);
        personalProfilePage.approveRequest();
        actions.waitForElementVisibleUntilTimeout("noRequests.page.header", 30);
        actions.assertValue("noRequests.page.header", PageHeaderText.N0_FRIEND_REQUESTS);
    }

    @Test
    public void TC_F_03_Disconnect(){
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.GOTOAdminZoneButton", 30);
        actions.assertElementPresent("mainPage.navigationBar.GOTOAdminZoneButton");
        basePage.typeNameInSearchField(DataConstants.SECOND_USER_FIRST_NAME);
        basePage.clickSearchButton();
        usersResultPage.scrollDownToUser("adminPage.viewUsers.secondUser");
        usersResultPage.clickSeeProfileButton();
        actions.assertElementAttribute("friendRequest.disconnectButton", "value", "disconnect");
        personalProfilePage.clickDisconnectButton();
        actions.waitForElementVisibleUntilTimeout("friendRequest.connectButton", 30);
        actions.assertElementAttribute("friendRequest.connectButton", "value", "connect");
    }
}
