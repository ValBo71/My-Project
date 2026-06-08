package testCases;

import com.telerikacademy.testframework.UserActions;
import pages.BasePage;
import org.junit.After;
import org.junit.Before;
import pages.*;

public class BaseTest {
    protected UserActions actions = new UserActions();
    protected RegistrationPage registrationPage = new RegistrationPage(actions.getDriver());
    protected LoginPage loginPage = new LoginPage(actions.getDriver());
    protected PostPage postPage = new PostPage(actions.getDriver());
    protected PersonalProfilePage personalProfilePage = new PersonalProfilePage(actions.getDriver());
    protected ExplorePostsPage explorePostsPage = new ExplorePostsPage(actions.getDriver());
    protected BasePage basePage = new BasePage(actions.getDriver(), "baseUrl");
    protected UsersResultPage usersResultPage = new UsersResultPage(actions.getDriver());


    @Before
    public void setUp() {
        UserActions.loadBrowser("baseUrl");
    }

    @After
    public void tearDown() {
        UserActions.quitDriver();
    }
}
