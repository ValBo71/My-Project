package pages.forum;

import com.telerikacademy.forumframework.Utils;
import com.telerikacademy.forumframework.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ForumHomePage extends BasePage {

    public ForumHomePage(WebDriver driver) {
        super(driver, "forum.homePage");
    }

    public void authenticateRegisteredUser(String email, String password){
        if(actions.isElementVisible("forum.homePage.logInButton")){
            actions.clickElement("forum.homePage.logInButton");
            actions.assertNavigatedUrl("forum.logInPage");

            ForumLogInPage logInPage = new ForumLogInPage(actions.getDriver());
            logInPage.fillInCredentials(email, password);
        }
    }

    public void clearDraft(){
        WebElement element = driver.findElement(By.xpath(Utils.getUIMappingByKey("forum.homePage.newTopicButton")));
        if(element.getAttribute("aria-label").equals("Open Draft")){
            actions.clickElement("forum.homePage.newTopicButton");
            actions.clickElement("forum.homePage.cancelDraftButton");
            actions.clickElement("forum.homePage.confirmCancelDraftButton");
        }
    }

}
