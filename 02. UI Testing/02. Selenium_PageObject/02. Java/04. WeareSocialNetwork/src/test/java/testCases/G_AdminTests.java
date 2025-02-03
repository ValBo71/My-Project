package testCases;

import org.junit.Before;
import org.junit.Test;
import testCases.BaseTest;
import testCases.DataConstants;
import testCases.PageHeaderText;

public class G_AdminTests extends BaseTest {

    @Before
    public void authenticate() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.GOTOAdminZoneButton", 30);
        actions.assertElementPresent("mainPage.navigationBar.GOTOAdminZoneButton");
    }

    @Test
    public void TC_A_01_AdministratorSuccessfullyDisableUser_When_UserIsEnabled() {
        basePage.typeNameInSearchField(DataConstants.SECOND_USER_FIRST_NAME);
        basePage.clickSearchButton();
        usersResultPage.scrollDownToUser("adminPage.viewUsers.secondUser");
        usersResultPage.clickSeeProfileButton();
        actions.assertElementAttribute("adminPage.viewUsers.user.disable/enableButton", "value", "disable");
        personalProfilePage.clickDisableButton();
        actions.assertElementAttribute("adminPage.viewUsers.user.disable/enableButton", "value", "enable");
    }

    @Test
    public void TC_A_02_AdministratorSuccessfullyEnableUser_When_UserIsDisabled() {
        basePage.typeNameInSearchField(DataConstants.SECOND_USER_FIRST_NAME);
        basePage.clickSearchButton();
        usersResultPage.scrollDownToUser("adminPage.viewUsers.secondUser");
        usersResultPage.clickSeeProfileButton();
        actions.assertElementAttribute("adminPage.viewUsers.user.disable/enableButton", "value", "enable");
        personalProfilePage.clickEnableButton();
        actions.assertElementAttribute("adminPage.viewUsers.user.disable/enableButton", "value", "disable");
    }

    @Test
    public void TC_A_04_AdministratorSuccessfullyEditUserPost_When_RequiredFieldsAreFilledWithValidData() {
        basePage.clickLatestPostsLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LATEST_POSTS_HEADER);
        explorePostsPage.scrollDownToBrowsePublicPostsSection();
        explorePostsPage.clickBrowseButtonUnderBrowsePublicPostsSection();
        explorePostsPage.scrollDownToTheLatestPost();
        explorePostsPage.clickExplorePostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.EXPLORE_POST_HEADER);
        explorePostsPage.clickEditPostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.EDIT_POST_HEADER);
        postPage.scrollDownToThePostSection();
        postPage.choosePostVisibilityFromDropdownMenu();
        postPage.enterMessage("This is your new message");
        postPage.clickSavePostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.EXPLORE_POST_HEADER);
        actions.assertValue("explorePostsPage.latestPost.explorePost.editedPost.editedText", "This is your new message");
    }

    @Test
    public void TC_A_03_AdministratorSuccessfullyDeleteUserPost_When_RequiredStepsAreFollowed() {
        basePage.clickLatestPostsLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LATEST_POSTS_HEADER);
        explorePostsPage.scrollDownToBrowsePublicPostsSection();
        explorePostsPage.clickBrowseButtonUnderBrowsePublicPostsSection();
        explorePostsPage.scrollDownToTheLatestPost();
        explorePostsPage.clickExplorePostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.EXPLORE_POST_HEADER);
        explorePostsPage.clickDeleteButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.DELETE_POST_HEADER);
        explorePostsPage.scrollDownDeletePostDropdown();
        explorePostsPage.submitPostDeletion();
        explorePostsPage.clickSubmitButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.POST_SUCCESSFULLY_DELETED_HEADER);
    }






}
