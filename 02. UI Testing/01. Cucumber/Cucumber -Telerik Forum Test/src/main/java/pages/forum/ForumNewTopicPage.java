package pages.forum;

import com.telerikacademy.forumframework.pages.BasePage;
import org.openqa.selenium.WebDriver;

public class ForumNewTopicPage extends BasePage {

    public ForumNewTopicPage(WebDriver driver) {
        super(driver, "forum.newTopicPage");
    }

    public void assertTopicReplyButtonVisible(){
        actions.assertElementPresent("forum.newTopicPage.topicReplyButton");
    }

}
