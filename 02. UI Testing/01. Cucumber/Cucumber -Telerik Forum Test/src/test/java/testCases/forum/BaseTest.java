package testCases.forum;

import com.telerikacademy.forumframework.UserActions;
import org.junit.AfterClass;
import org.junit.BeforeClass;

public class BaseTest {
	UserActions actions = new UserActions();
	@BeforeClass
	public static void setUp(){
		UserActions.loadBrowser("forum.homePage");
	}

	@AfterClass
	public static void tearDown(){
		UserActions.quitDriver();
	}
}
