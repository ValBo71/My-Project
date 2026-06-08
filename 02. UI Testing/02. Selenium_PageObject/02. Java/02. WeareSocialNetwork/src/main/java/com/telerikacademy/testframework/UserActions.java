package com.telerikacademy.testframework;
import org.junit.Assert;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class UserActions {

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

    public WebDriver getDriver() {
        return driver;
    }

    public void clickElement(String key, Object... arguments) {
        String locator = getLocatorValueByKey(key, arguments);
        Utils.LOG.info("Clicking on element " + key);
        WebElement element = driver.findElement(By.xpath(locator));
        element.click();
    }

    public void typeValueInField(String value, String field, Object... arguments) {
        String locator = getLocatorValueByKey(field, arguments);
        WebElement element = driver.findElement(By.xpath(locator));
        element.sendKeys(value);
    }

    public void waitForElementVisible(String locatorKey, Object... arguments) {
        Integer defaultTimeout = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        waitForElementVisibleUntilTimeout(locatorKey, defaultTimeout, arguments);
    }

    public void waitForElementVisibleUntilTimeout(String locator, int seconds, Object... locatorArguments) {
        Integer defaultTimeout  = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        WebDriverWait wait = new WebDriverWait(driver, defaultTimeout);
        waitForElementPresent(locator, locatorArguments);
        String xpath = getLocatorValueByKey(locator, locatorArguments);
        try {
            isElementVisible(locator);
        } catch (Exception exception) {
            Assert.fail("Element with locator: '" + xpath + "' was not found.");
        }
    }

    public void waitForElementPresent(String locator, Object... arguments) {
        Integer defaultTimeout = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        WebDriverWait wait = new WebDriverWait(driver, defaultTimeout);
        try {
            isElementPresent(locator, arguments);
        } catch (Exception exception) {
            Assert.fail("Element with locator: '" + locator + "' was not found.");
        }
    }

    public boolean isElementPresent(String locator, Object... arguments) {
        Integer defaultTimeout = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
        return isElementPresentUntilTimeout(locator, defaultTimeout, arguments);
    }

    public boolean isElementPresentUntilTimeout(String locator, int timeout, Object... arguments) {
        try {
            String xpath = getLocatorValueByKey(locator, arguments);
            Integer defaultTimeout = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
            WebDriverWait wait = new WebDriverWait(driver, timeout);
            wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.xpath(xpath)));
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public boolean isElementVisible(String locator, Object... arguments) {
        try {
            Integer defaultTimeout = Integer.parseInt(Utils.getConfigPropertyByKey("config.defaultTimeoutSeconds"));
            WebDriverWait wait = new WebDriverWait(driver, defaultTimeout);
            wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.xpath(getLocatorValueByKey(locator, arguments))));
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public void waitForElementPresentUntilTimeout(String locator, int seconds, String... locatorArguments) {
        locator = String.format(locator, locatorArguments);
        WebDriverWait wait = new WebDriverWait(driver, seconds);
        try {
            isElementPresent(locator, locatorArguments);

        } catch (Exception exception) {
            Assert.fail("Element with locator: '" + locator + "' was not found.");
        }
    }

    public void waitFor(long timeOutMilliseconds) {
        try {
            Thread.sleep(timeOutMilliseconds);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void scrollDownUntilElementVisible(String locator) {
        waitForElementPresentUntilTimeout(locator, 30);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        WebElement webElement = driver.findElement(By.xpath(Utils.getUIMappingByKey(locator)));
        js.executeScript("arguments[0].scrollIntoView();", webElement);
    }

    public void assertElementPresent(String locator) {
        Assert.assertNotNull(driver.findElement(By.xpath(Utils.getUIMappingByKey(locator))));
    }

    public void assertElementVisible(String locator){
        Assert.assertTrue(isElementVisible(locator));
    }

    public void assertValue(String locator, String expectedValue) {
        String actualResult = driver.findElement(By.xpath(Utils.getUIMappingByKey(locator))).getText();
        Assert.assertEquals(expectedValue, actualResult);
    }

    public void assertElementAttribute(String locator, String attributeName, String attributeValue) {
        waitFor(400);
        WebElement element = driver.findElement(By.xpath(Utils.getUIMappingByKey(locator)));
        Assert.assertNotNull("Element was not found.", element);
        Assert.assertEquals("Attribute " + attributeName + " was not as expected.", attributeValue, element.getAttribute(attributeName));
    }

    private String getLocatorValueByKey(String locator, Object[] arguments) {
        return String.format(Utils.getUIMappingByKey(locator), arguments);
    }

}
