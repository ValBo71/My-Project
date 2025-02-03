package test.cases;

import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import pages.CreateNewMail;
import pages.EnterWrongCredentials;


public class SeeburgerTests extends BaseTest {


    private final String URL = "https://www.abv.bg/";




    @Test
    public void enterWrongCredentialsTest() throws InterruptedException {
        EnterWrongCredentials enterCredentials = new EnterWrongCredentials(webdriver);

        webdriver.get(URL);
       webdriver.switchTo().frame("abv-GDPR-frame");
       webdriver.switchTo().frame("gdpr-consent-notice");


        enterCredentials.clickCookies();
        enterCredentials.enterName();
        enterCredentials.enterPassword();
        enterCredentials.clickEnter();

        //Assert
        Thread.sleep(3000);
        WebElement createdTopicForAssertion = this.webdriver.findElement(By.xpath("//p[@id='form.errors']"));
        Assert.assertTrue("Грешен потребител / парола.", createdTopicForAssertion.isDisplayed());

    }

    @Test
    public void createNewMaiTest() throws InterruptedException {
        CreateNewMail createMail = new CreateNewMail(webdriver);
        EnterWrongCredentials enterCredentials = new EnterWrongCredentials(webdriver);

        webdriver.get(URL);
        webdriver.switchTo().frame("abv-GDPR-frame");
        webdriver.switchTo().frame("gdpr-consent-notice");


        enterCredentials.clickCookies();
        createMail.clickButtonRegister();
        createMail.enterNewUserName();
        createMail.enterNewPassword();
        createMail.repeatNewPassword();
        createMail.clickUncheckPhone();
        createMail.enterAlternativeMail();
        createMail.enterSecretQuestion();
        createMail.enterSecretAnswer();
        createMail.enterFirstName();
        createMail.enterLastName();
        createMail.clickChooseGender();
        createMail.clickEnterDayField();
        createMail.enterBirthMount();
        createMail.clickEnterYear();
        createMail.clickRobotCheck();
        createMail.clickCreateProfileButton();
        createMail.clickLogMailButton();

        //Assert
        Thread.sleep(2000);
        WebElement createdTopicForAssertion = this.webdriver.findElement(By.xpath("//td[@id='gwt-uid-2']"));
        Assert.assertTrue("АБВ Поща", createdTopicForAssertion.isDisplayed());

    }



}
