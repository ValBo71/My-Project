package testCases;

import org.junit.Before;
import org.junit.Test;

public class D_PostsTests extends BaseTest {
    private static final String MESSAGE = "This is new post";

    @Before
    public void Authenticate() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.REGULAR_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
    }

    @Test
    public void TC_C_03_UserSuccessfullyCreatePost_When_AllRequiredFieldsAreFilledWithValidData() {
        basePage.clickAddNewPostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.CREATE_NEW_TOPIC_HEADER_TEXT);
        postPage.scrollDownToThePostSection();
        postPage.choosePostVisibilityFromDropdownMenu();
        postPage.enterMessage(MESSAGE);
        postPage.clickSavePostButton();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.CREATE_POST_SUCCESSFUL);
        actions.waitForElementPresentUntilTimeout("createdTopic.author", 30);
        actions.assertValue("createdTopic.author", DataConstants.REGULAR_USERNAME);
        actions.assertValue("createdTopic.message", MESSAGE);
    }
}
