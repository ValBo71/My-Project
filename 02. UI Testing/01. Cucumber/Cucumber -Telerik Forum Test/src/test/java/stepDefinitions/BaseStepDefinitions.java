package stepDefinitions;

import com.telerikacademy.forumframework.UserActions;
import org.jbehave.core.annotations.AfterStory;
import org.jbehave.core.annotations.BeforeStory;
import pages.forum.ForumHomePage;
import pages.forum.ForumLogInPage;
import pages.forum.ForumNewTopicPage;

public class BaseStepDefinitions {

    UserActions actions = new UserActions();
    ForumHomePage home = new ForumHomePage(actions.getDriver());
    ForumLogInPage logInPage = new ForumLogInPage(actions.getDriver());
    ForumNewTopicPage newTopicPage = new ForumNewTopicPage(actions.getDriver());

    @BeforeStory
    public void setUp(){ UserActions.loadBrowser("forum.homePage"); }

    @AfterStory
    public static void tearDown(){
        UserActions.quitDriver();
    }
}
