package pages;

import com.telerikacademy.testframework.Utils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class PostPage extends BasePage {
    public PostPage(WebDriver driver) {
        super(driver, "baseUrl");
    }

    public void scrollDownToThePostSection() {
        actions.waitForElementVisibleUntilTimeout("createNewPostPage.topicCreationForm", 30);
        actions.scrollDownUntilElementVisible("createNewPostPage.topicCreationForm");
    }

    public void choosePostVisibilityFromDropdownMenu() {
        Select postVisibility = new Select(driver.findElement(By.xpath(Utils.getUIMappingByKey("createNewPostPage.visibilityDropDownMenu"))));
        postVisibility.selectByVisibleText("Public post");
    }

    public void enterMessage(String message) {
        actions.waitForElementVisibleUntilTimeout("createNewPostPage.message", 30);
        actions.typeValueInField(message, "createNewPostPage.message");
    }

    public void clickSavePostButton() {
        actions.waitForElementVisible("createNewPostPage.savePostButton", 30);
        actions.clickElement("createNewPostPage.savePostButton");
    }
}
