package test.cases;

import pages.JiraBugReport_Page_Factory;
import pages.LoginJira_Page_Factory;
import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import pages.SearchBugReportJira_Page_Factory;


public class JiraBugReportTest extends BaseTest {

    private final String URL = "https://sandbox.xpand-it.com/secure/Dashboard.jspa";



    @Test
    public void logInJiraHomePage(){

        LoginJira_Page_Factory loginPage = new LoginJira_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createProject = new JiraBugReport_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createIssue = new JiraBugReport_Page_Factory(webdriver);

        //Arrange
        webdriver.get(URL);

        //Act

        loginPage.enterEmail();
        loginPage.enterPassword();
        loginPage.clickLogInButton();


        //Assert
        WebElement createdTopicForAssertion = webdriver.findElement(By.xpath("//div[@class='aui-page-header-main']/h1"));
        Assert.assertTrue("You are not logged in.",createdTopicForAssertion.isDisplayed());

    }

    @Test
    public void creteNewProject() throws InterruptedException {
        LoginJira_Page_Factory loginPage = new LoginJira_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createProject = new JiraBugReport_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createIssue = new JiraBugReport_Page_Factory(webdriver);

        //Arrange
        webdriver.get(URL);

        //Act
        loginPage.enterEmail();
        loginPage.enterPassword();
        loginPage.clickLogInButton();

        createProject.clickProjectButton();
        createProject.clickCreateProjectButton();
        createProject.clickKanbanField();
        createProject.clickNextButton();
        createProject.clickSelectButton();
        createProject.enterNameProject();
        Thread.sleep (2000);
        createProject.enterKeyProject();
        Thread.sleep (2000);
        createProject.clickSubmitButton();

        //Assert
        WebElement createdTopicForAssertion = webdriver.findElement(By.xpath("//*[@id='subnav-title']/span"));
        Assert.assertTrue("New project not created.",createdTopicForAssertion.isDisplayed());

    }
    @Test
    public void creteNewProject_withNewIssue() throws InterruptedException {

        LoginJira_Page_Factory loginPage = new LoginJira_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createProject = new JiraBugReport_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createIssue = new JiraBugReport_Page_Factory(webdriver);

        //Arrange
        webdriver.get(URL);

        //Act
        loginPage.enterEmail();
        loginPage.enterPassword();
        loginPage.clickLogInButton();

        createProject.clickProjectButton();
        createProject.clickCreateProjectButton();
        createProject.clickKanbanField();
        createProject.clickNextButton();
        createProject.clickSelectButton();
        createProject.enterNameProject();
        Thread.sleep (2000);
        createProject.enterKeyProject();
        Thread.sleep (2000);
        createProject.clickSubmitButton();

        Thread.sleep (2000);
        createIssue.clickNewIssueButton();
        Thread.sleep (2000);
        createIssue.enterSummary();
        Thread.sleep (2000);
        createIssue.enterContent();
        Thread.sleep (2000);
        createIssue.clickCreateBugReportButton();


        //Assert
        WebElement createdTopicForAssertion = webdriver.findElement(By.xpath("//*[@id='ghx-column-headers']/li[1]/div/div[1]/h6"));
        Assert.assertTrue("No new Bug Report has been created",createdTopicForAssertion.isDisplayed());


    }
    @Test
    public void creteNewProject_withNewIssue_AndSearch() throws InterruptedException {
        LoginJira_Page_Factory loginPage = new LoginJira_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createProject = new JiraBugReport_Page_Factory(webdriver);
        JiraBugReport_Page_Factory createIssue = new JiraBugReport_Page_Factory(webdriver);
        SearchBugReportJira_Page_Factory searchIssue = new SearchBugReportJira_Page_Factory(webdriver);

        //Arrange
        webdriver.get(URL);

        //Act
        loginPage.enterEmail();
        loginPage.enterPassword();
        loginPage.clickLogInButton();


        Thread.sleep (2000);
        searchIssue.clickNewSearchMenue();
        Thread.sleep (2000);
        searchIssue.clickSearchMenue();
        Thread.sleep (2000);
        searchIssue.enterSearchField();
        Thread.sleep (2000);
        searchIssue.clickSearchButton();


        //Assert
        WebElement createdTopicForAssertion = webdriver.findElement(By.id("issue_summary_reporter_user11"));
        Assert.assertTrue("BugReport not found ",createdTopicForAssertion.isDisplayed());

    }
}
