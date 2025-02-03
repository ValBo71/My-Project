package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class JiraBugReport_Page_Factory {

    private WebDriver driver;
    public WebDriverWait wait;

    public JiraBugReport_Page_Factory(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(xpath="//a[@title = 'View recent projects and browse a list of projects']")
    public WebElement ProjectButton;


    @FindBy(id="project_template_create_link_lnk")
    public WebElement createProjectButton;

    @FindBy(xpath="//div[@title = 'Optimise development flow with a board. Connects with source and build tools.']")
    public WebElement kanbanField;

    @FindBy(xpath="//button[@class = 'create-project-dialog-create-button pt-submit-button aui-button aui-button-primary']")
    public WebElement nextButton;

    @FindBy(xpath="//button[@class = 'template-info-dialog-create-button pt-submit-button aui-button aui-button-primary']")
    public WebElement selectButton;

    @FindBy(id="name")
    public WebElement nameField;

    @FindBy(xpath="//input [@class='text']")
    public WebElement keyField;

    @FindBy(xpath="//button[@class = 'add-project-dialog-create-button pt-submit-button aui-button aui-button-primary']")
    public WebElement submitButton;

    @FindBy(xpath ="//a[@id='create_link']")
    public WebElement newIssueButton;

    @FindBy(id="summary")
    public WebElement summaryField;

    @FindBy(xpath ="//iframe[@title='Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help']")
    public WebElement descriptionField;

    @FindBy(id ="create-issue-submit")
    public WebElement newBugReportButton;


    public void clickProjectButton(){
        wait.until(ExpectedConditions.visibilityOf(ProjectButton));
        ProjectButton.click();
    }

    public void clickCreateProjectButton(){
        wait.until(ExpectedConditions.visibilityOf(createProjectButton));
        createProjectButton.click();
    }
    public void clickKanbanField(){
        wait.until(ExpectedConditions.visibilityOf(kanbanField));
        kanbanField.click();
    }

    public void clickNextButton(){
        wait.until(ExpectedConditions.visibilityOf(nextButton));
        nextButton.click();
    }

    public void clickSelectButton(){
        wait.until(ExpectedConditions.visibilityOf(selectButton));
        selectButton.click();
    }

    public void enterNameProject() {
        wait.until(ExpectedConditions.visibilityOf(nameField));
        nameField.sendKeys("P" + randomNumber());

    }

    public void enterKeyProject() {
        wait.until(ExpectedConditions.visibilityOf(keyField));
        keyField.sendKeys("N" + randomNumber());
    }

    public void clickSubmitButton(){
        wait.until(ExpectedConditions.visibilityOf(submitButton));
        submitButton.click();
    }

    public void clickNewIssueButton(){
        wait.until(ExpectedConditions.visibilityOf(newIssueButton));
        newIssueButton.click();
    }

    public void enterSummary(){
        wait.until(ExpectedConditions.visibilityOf(summaryField));
        summaryField.sendKeys("When you change the language, the currencies used in the specific countries do not change automatically");
    }

    public void enterContent(){
        wait.until(ExpectedConditions.visibilityOf(descriptionField));
        descriptionField.click();
        descriptionField.sendKeys("*Summary:*\n\n" +
                "When you change the language, the currencies used in the specific countries do not change automatically\n\n" +
                "*Prerequisites:*\n\n" +
                "Go to url: https://phptravels.net\n\n" +
                "*Steps to reproduce:*\n\n" +
                "1. Click on the dropdown menu *English* on the top right corner of the page;\n\n" +
                "2. Select any of the language lists;\n\n" +
                "*Expected result:*\n\n" +
                "The currency should automatically change to the one used in the country\n\n" +
                "*Actual result:*\n\n" +
                "When choosing the Russian language, the currency remains usd\n\n" +
                "*Severity:*\n\n" +
                "High\n\n" +
                "*Additional info:*\n\n" +
                "Mozilla Firefox 88.0 (64-bit), Windows 10 version 20H2");
    }

    public void clickCreateBugReportButton(){
        wait.until(ExpectedConditions.visibilityOf(newBugReportButton));
        newBugReportButton.click();
    }

    public long randomNumber(){
        long min = 10000000000L;
        long max = 20000000000L;
        long randomNumber = (long)Math.floor(Math.random()*(max-min+1)+min)/1000000;
        return randomNumber;
    }



}
