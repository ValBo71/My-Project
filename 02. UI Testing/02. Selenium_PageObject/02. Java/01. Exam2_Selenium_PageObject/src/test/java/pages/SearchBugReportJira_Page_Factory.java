package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SearchBugReportJira_Page_Factory {

    private WebDriver driver;
    public WebDriverWait wait;

    public SearchBugReportJira_Page_Factory(WebDriver webDriver){
        driver = webDriver;
        PageFactory.initElements(webDriver, this);
        wait = new WebDriverWait(webDriver, Duration.ofSeconds(20));
    }

    @FindBy(id="find_link")
    public WebElement NewSearchIssueMenue;

    @FindBy(id="issues_new_search_link_lnk")
    public WebElement NewSearchIssue;

    @FindBy(id="jira.top.navigation.bar:issues_drop_current_lnk")
    public WebElement searchIssue;

    @FindBy(id="searcher-query")
    public WebElement searchField;

    @FindBy(xpath="//button[@class='aui-button aui-button-primary search-button']")
    public WebElement searchFieldButton;

    public void clickNewSearchMenue(){
        wait.until(ExpectedConditions.visibilityOf(NewSearchIssueMenue));
        NewSearchIssueMenue.click();
    }

    public void clickSearchMenue(){
        wait.until(ExpectedConditions.visibilityOf(NewSearchIssue));
        NewSearchIssue.click();
    }
    public void enterSearchField(){
        wait.until(ExpectedConditions.visibilityOf(searchField));
        searchField.sendKeys("When you change the language");
    }
    public void clickSearchButton(){
        searchFieldButton.click();
    }
}
