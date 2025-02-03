package testCases.forum;

import org.junit.After;
import org.junit.Assert;
import org.junit.Test;
import pages.forum.ForumHomePage;

public class ForumTopicCreationTests extends BaseTest {

    private final String EMAIL = "pencho@bogdanovi.com";
    private final String PASSWORD = "PenCh@";
    private final ForumHomePage homePage = new ForumHomePage(actions.getDriver());

    @After
    public void goToHomePage(){
        actions.clickElement("forum.homePage.logo");
    }

    @Test
    public void createNewTopic_When_ValidTitleAndDescriptionAreProvided(){
        homePage.authenticateRegisteredUser(EMAIL, PASSWORD);
        homePage.clearDraft();

        actions.clickElement("forum.homePage.newTopicButton");
        actions.typeValueInField("Selenium Web Driver Test", "forum.homePage.titleField");
        actions.typeValueInField("Selenium Web Driver Test 1.0", "forum.homePage.descriptionField");
        actions.clickElement("forum.homePage.createTopicButton");

        Assert.assertTrue("New topic isn't posted", actions.isElementVisible("forum.newTopicPage.newTopicTitle"));
        Assert.assertTrue("Reply button isn't displayed", actions.isElementVisible("forum.newTopicPage.topicReplyButton"));
    }

    @Test
    public void validationPopUpsAreTriggered_When_TopicTitleAndDescriptionAreEmpty(){
        homePage.authenticateRegisteredUser(EMAIL, PASSWORD);
        homePage.clearDraft();

        actions.clickElement("forum.homePage.newTopicButton");
        actions.clickElement("forum.homePage.createTopicButton");

        Assert.assertTrue("Title validation popup isn't displayed", actions.isElementVisible("forum.homePage.titlePopup"));
        Assert.assertTrue("Description validation popup isn't displayed", actions.isElementVisible("forum.homePage.descriptionPopup"));
    }
}
