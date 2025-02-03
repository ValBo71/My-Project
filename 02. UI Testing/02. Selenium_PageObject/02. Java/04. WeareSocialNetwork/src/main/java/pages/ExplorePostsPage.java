package pages;

import com.telerikacademy.testframework.Utils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class ExplorePostsPage extends BasePage {
    public ExplorePostsPage(WebDriver driver) {
        super(driver, "baseUrl");
    }

    public void scrollDownToBrowsePublicPostsSection() {
        actions.scrollDownUntilElementVisible("explorePostsPage.postVisibilitySection");
    }

    public void clickBrowseButtonUnderBrowsePublicPostsSection() {
        actions.clickElement("explorePostsPage.postVisibilitySection.browseButton");
    }

    public void scrollDownToTheLatestPost() {
        actions.scrollDownUntilElementVisible("explorePostsPage.latestPost");
    }

    public void clickLikeButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPost.likeButton", 30);
        actions.clickElement("explorePostsPage.latestPost.likeButton");
    }

    public void clickDislikeButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPost.likeButton", 30);
        actions.clickElement("explorePostsPage.latestPost.likeButton");
    }

    public void clickExplorePostButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPost.explorePostButton", 30);
        actions.clickElement("explorePostsPage.latestPost.explorePostButton");
    }

    public void clickEditPostButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPost.exploredPost.editPostButton", 30);
        actions.clickElement("explorePostsPage.latestPost.exploredPost.editPostButton");
    }

    public void clickDeleteButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPosts.exploredPost.deletePostButton", 30);
        actions.clickElement("explorePostsPage.latestPosts.exploredPost.deletePostButton");
    }

    public void scrollDownDeletePostDropdown() {
        actions.scrollDownUntilElementVisible("explorePostsPage.latestPost.exploredPost.deletePost.deletePostSection");
    }

    public void submitPostDeletion() {
        Select postVisibility = new Select(driver.findElement(By.xpath(Utils.getUIMappingByKey("explorePostsPage.latestPost.exploredPost.deletePost.dropdownMenu"))));
        postVisibility.selectByVisibleText("Delete post");
    }

    public void clickSubmitButton() {
        actions.waitForElementVisibleUntilTimeout("explorePostsPage.latestPost.exploredPost.deletePost.submitButton", 30);
        actions.clickElement("explorePostsPage.latestPost.exploredPost.deletePost.submitButton");
    }

}
