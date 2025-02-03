package testCases;

import org.junit.Before;
import org.junit.Test;
import testCases.BaseTest;
import testCases.DataConstants;
import testCases.PageHeaderText;

public class E_ExplorePostsTests extends BaseTest {

    @Before
    public void AuthenticateAndFindLatestPost() {
        basePage.clickSignInLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LOGIN_PAGE_HEADER);
        loginPage.authenticate(DataConstants.ADMIN_USERNAME, DataConstants.PASSWORD);
        loginPage.clickSignInButton();
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.GOTOAdminZoneButton", 30);
        actions.assertElementPresent("mainPage.navigationBar.GOTOAdminZoneButton");
        basePage.clickLatestPostsLink();
        actions.waitForElementVisibleUntilTimeout("page.header", 30);
        actions.assertValue("page.header", PageHeaderText.LATEST_POSTS_HEADER);
        explorePostsPage.scrollDownToBrowsePublicPostsSection();
        explorePostsPage.clickBrowseButtonUnderBrowsePublicPostsSection();
        explorePostsPage.scrollDownToTheLatestPost();
    }


    @Test
    public void TC_PP_07_UserSuccessfullyLikeComment_When_ItIsNotLikedYet() {
        actions.assertElementAttribute("explorePostsPage.latestPost.likeButton", "value", "Like");
        explorePostsPage.clickLikeButton();
        actions.assertElementAttribute("explorePostsPage.latestPost.likeButton", "value", "Dislike");
    }

    @Test
    public void TC_PP_07_UserSuccessfullyDislikeComment_When_ItIsAlreadyLiked() {
        actions.assertElementAttribute("explorePostsPage.latestPost.likeButton", "value", "Dislike");
        explorePostsPage.clickDislikeButton();
        actions.assertElementAttribute("explorePostsPage.latestPost.likeButton", "value", "Like");
    }


}
