package com.telerikacademy.forumframework;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.concurrent.TimeUnit;

public class UserActions {
    public WebDriver getDriver() {
        return driver;
    }

    final WebDriver driver;

    public UserActions() {
        this.driver = Utils.getWebDriver();
    }

    public static void loadBrowser(String baseUrlKey) {
        Utils.getWebDriver().get(Utils.getConfigPropertyByKey(baseUrlKey));
    }

    public static void quitDriver() {
        Utils.tearDownWebDriver();
    }

    public void clickElement(String key, Object... arguments) {
        String locator = getLocatorValueByKey(key, arguments);

        Utils.LOG.info("Clicking on element " + key);
        WebElement element = driver.findElement(By.xpath(locator));
        element.click();
    }

    public void typeValueInField(String value, String field, Object... fieldArguments) {
        String locator = getLocatorValueByKey(field, fieldArguments);

        Utils.LOG.info("Input " + value + " in " + field);
        WebElement element = driver.findElement(By.xpath(locator));
        element.sendKeys(value);
    }

    //############# WAITS #########

    public void waitForElementVisible(String locatorKey, Object... arguments) {
        Assert.assertTrue("Element isn't visible", isElementVisible(locatorKey));
    }


    public void waitForElementVisibleUntilTimeout(String locator, int seconds, Object... locatorArguments) {
        WebDriverWait wait = new WebDriverWait(driver, seconds);

        String key = getLocatorValueByKey(locator, locatorArguments);
        boolean elementIsVisible;

        try{
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(key)));
            elementIsVisible = true;
        } catch(org.openqa.selenium.TimeoutException e){
            elementIsVisible = false;
        }
        Assert.assertTrue("Element isn't visible", elementIsVisible);
    }

    public void waitForElementPresent(String locator, Object... arguments) {
        Assert.assertTrue("Element isn't present", isElementPresent(locator));
    }

    public boolean isElementPresent(String locator, Object... arguments) {
        int timeOutSeconds = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);

        String key = getLocatorValueByKey(locator, arguments);
        try{
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(key)));
            return true;
        } catch(org.openqa.selenium.TimeoutException e){
            return false;
        }
    }

    public boolean isElementVisible(String locator, Object... arguments) {
        int timeOutSeconds = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);

        String key = getLocatorValueByKey(locator, arguments);
        try{
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(key)));
            return true;
        } catch(org.openqa.selenium.TimeoutException e){
            return false;
        }
    }

    public void waitFor(long timeOutMilliseconds) {
        try {
            Thread.sleep(timeOutMilliseconds);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    //############# ASSERTS #########

    public void assertElementPresent(String locator) {
        Assert.assertNotNull(driver.findElement(By.xpath(Utils.getUIMappingByKey(locator))));
    }

    public void assertElementAttribute(String locator, String attributeName, String attributeValue) {
        WebElement element = driver.findElement(By.xpath(locator));

        Assert.assertEquals(element.getAttribute(attributeName), attributeValue);
    }

    public void assertNavigatedUrl(String urlKey) {
        Assert.assertTrue(driver.getCurrentUrl().contains(Utils.getConfigPropertyByKey(urlKey)));
        Utils.LOG.info("URL navigated");
    }

    public void pressKey(Keys key) {
        Actions action = new Actions(driver);
        action.keyDown(key).keyUp(key);
    }

    private String getLocatorValueByKey(String locator, Object[] arguments) {
        return String.format(Utils.getUIMappingByKey(locator), arguments);
    }
}
