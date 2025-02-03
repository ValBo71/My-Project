package stepDefinitions;

import org.jbehave.core.annotations.*;
import org.junit.Assert;

public class StepDefinitions extends BaseStepDefinitions {

    private final String EMAIL = "pencho@bogdanovi.com";
    private final String PASSWORD = "123456";

    @BeforeScenario
    public void authenticateRegisteredUser(){
        home.authenticateRegisteredUser(EMAIL, PASSWORD);
    }

    @AfterScenario
    public void goToHomePage(){
        actions.clickElement("forum.homePage.logo");
    }

    @Given("user is logged in topic creation button is visible")
    public void searchNewTopicButtonVisible(){
        actions.waitForElementVisible("forum.homePage.newTopicButton");
        home.clearDraft();
    }

    @When("new topic button is clicked")
    public void clickNewTopicButton(){
        actions.clickElement("forum.homePage.newTopicButton");
    }

    @When("$title is entered in title field")
    public void fillTitleField(String title){
        actions.typeValueInField(title, "forum.homePage.titleField");
    }

    @When("$description is entered in description field")
    public void fillDescriptionField(String description){
        actions.typeValueInField(description, "forum.homePage.descriptionField");
    }

    @When("create topic button is clicked")
    public void clickCreateTopicButton(){
        actions.clickElement("forum.homePage.createTopicButton");
    }

    @Then("the new topic is posted")
    public void assertNewTopicPosted(){
        Assert.assertTrue(actions.isElementVisible("forum.newTopicPage.newTopicTitle"));
    }

    @Then("the reply to topic button is visible")
    public void assertReplyButtonVisible(){
        Assert.assertTrue(actions.isElementVisible("forum.newTopicPage.topicReplyButton"));
    }

    @Then("title validation pop up is triggered")
    public void assertTitleValidationPopUpVisible(){
        Assert.assertTrue(actions.isElementVisible("forum.homePage.titlePopup"));
    }

    @Then("description validation pop up is triggered")
    public void assertDescriptionValidationPopUpVisible(){
        Assert.assertTrue(actions.isElementVisible("forum.homePage.descriptionPopup"));
    }
}
