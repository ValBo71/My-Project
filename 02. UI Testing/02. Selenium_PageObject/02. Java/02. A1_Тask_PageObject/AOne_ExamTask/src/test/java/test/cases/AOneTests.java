package test.cases;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.AOneTablet;
import pages.AOneVignette;
import org.junit.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.time.Duration;


public class AOneTests extends BaseTest {


    private final String URL = "https://www.a1.bg/bg";




    @Test
    public void buyingVignetteWithoutCheckingBorica() throws InterruptedException {
        AOneVignette buyingVignette = new AOneVignette(webdriver);

        webdriver.get(URL);


        buyingVignette.clickVignetteButton();
        buyingVignette.clickBuyHereButton();

        String winHandleBefore = webdriver.getWindowHandle();
        for(String winHandle : webdriver.getWindowHandles()){
            webdriver.switchTo().window(winHandle);
        }

        buyingVignette.clickCategoryVignette();
        buyingVignette.clickPriceTagButton();
        buyingVignette.enterNumberField();
        buyingVignette.clickDateField();
        buyingVignette.enterDateField();
        buyingVignette.clickContinueButton();
        buyingVignette.enterEmailName();
        buyingVignette.clickCheckBox();
        buyingVignette.clickContinueButton();

        //Assert
        Thread.sleep(3000);
        WebElement checkRegNumber = webdriver.findElement(By.xpath("//td[contains(text(),'CA1234BТ')]"));
        Assert.assertTrue(checkRegNumber.isDisplayed());
        WebElement checkVignetteType = webdriver.findElement(By.xpath("//td[normalize-space()='K3']"));
        Assert.assertTrue(checkVignetteType.isDisplayed());
    }
        @Test
        public void buyingVignetteWithCheckingBorica() throws InterruptedException {
            AOneVignette buyingVignette = new AOneVignette(webdriver);

            webdriver.get(URL);


            buyingVignette.clickVignetteButton();
            buyingVignette.clickBuyHereButton();

            String winHandleBefore = webdriver.getWindowHandle();
            for(String winHandle : webdriver.getWindowHandles()){
                webdriver.switchTo().window(winHandle);
            }

            buyingVignette.clickCategoryVignette();
            buyingVignette.clickPriceTagButton();
            buyingVignette.enterNumberField();
            buyingVignette.clickDateField();
            buyingVignette.enterDateField();
            buyingVignette.clickContinueButton();
            buyingVignette.enterEmailName();
            buyingVignette.clickCheckBox();
            buyingVignette.clickContinueButton();
            buyingVignette.clickConfirmButton();

            //Assert
            Thread.sleep (3000);
            WebElement checkBorica = webdriver.findElement(By.xpath("//img[@class='footer-borica-logo']"));
            Assert.assertTrue(checkBorica.isDisplayed());
    }
    @Test
    public void buyingTablet() throws InterruptedException {


        AOneTablet buyingTablet = new AOneTablet(webdriver);
        JavascriptExecutor jsx = (JavascriptExecutor)webdriver;

        //Arrange
        webdriver.get(URL);

        //Act
        buyingTablet.clickDevicesButton();
        buyingTablet.clickTabletsButton();
        jsx.executeScript("window.scrollBy(0,450)", "");
        WebElement tabletPhoto = (new WebDriverWait(webdriver, Duration.ofSeconds(10))
                    .until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[@id='devices_content_4']/div[1]/ul/li[6]/figure/a/img"))));
        buyingTablet.choiceIPad();


        //Assert
        WebElement trueImageAssertion = webdriver.findElement(By.xpath("//img[@id='main_image']"));
        Assert.assertTrue(trueImageAssertion.isDisplayed());
        
        WebElement trueBrandAssertion = webdriver.findElement(By.xpath("//span[@itemprop='brand']"));
        Assert.assertTrue("iPad Pro 12,9'' (5th Gen)",trueBrandAssertion.isDisplayed());


    }

}
