package pages;

import com.telerikacademy.testframework.UserActions;
import com.telerikacademy.testframework.Utils;
import org.junit.Assert;
import org.openqa.selenium.WebDriver;

public class BasePage {
    protected String url;
    protected WebDriver driver;
    protected UserActions actions;

    public BasePage(WebDriver driver, String urlKey) {
        String pageUrl = Utils.getConfigPropertyByKey(urlKey);
        this.driver = driver;
        this.url = pageUrl;
        actions = new UserActions();
    }

    public void clickRegisterLink() {
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.registerButton", 30);
        actions.clickElement("mainPage.navigationBar.registerButton");
    }

    public void clickSignInLink() {
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.signInButton", 30);
        actions.clickElement("mainPage.navigationBar.signInButton");
    }

    public void clickAddNewPostButton() {
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.addNewPostButton", 30);
        actions.clickElement("mainPage.navigationBar.addNewPostButton");
    }

    public void clickPersonalProfileButton() {
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.personalProfileButton", 30);
        actions.clickElement("mainPage.navigationBar.personalProfileButton");
    }

    public void clickLatestPostsLink() {
        actions.waitForElementVisibleUntilTimeout("mainPage.navigationBar.latestPostsButton", 30);
        actions.clickElement("mainPage.navigationBar.latestPostsButton");
    }

    public void typeNameInSearchField(String firstName) {
        actions.waitForElementVisibleUntilTimeout("mainPage.searchField", 30);
        actions.typeValueInField(firstName, "mainPage.searchField");
    }

    public void clickSearchButton(){
        actions.clickElement("mainPage.searchButton");
    }

}
