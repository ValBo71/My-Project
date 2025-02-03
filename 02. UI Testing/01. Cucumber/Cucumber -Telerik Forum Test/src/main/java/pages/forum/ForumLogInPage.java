package pages.forum;

import com.telerikacademy.forumframework.pages.BasePage;
import org.openqa.selenium.WebDriver;

public class ForumLogInPage extends BasePage {

    public ForumLogInPage(WebDriver driver) {
        super(driver, "forum.logInPage");
    }

    public void fillInCredentials(String email, String password){
        actions.typeValueInField(email, "forum.logInPage.emailInput");
        actions.typeValueInField(password, "forum.logInPage.passwordInput");
        actions.clickElement("forum.logInPage.signInButton");
    }
}
