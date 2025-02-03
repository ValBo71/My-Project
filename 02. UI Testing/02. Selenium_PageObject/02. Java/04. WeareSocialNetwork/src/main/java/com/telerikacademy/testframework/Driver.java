package com.telerikacademy.testframework;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;
import java.util.Set;

public class Driver implements WebDriver {
    private WebDriver webDriver;
    private WebDriverWait webDriverWait;

    public Driver(WebDriver driver){
        webDriver = driver;
        webDriverWait = new WebDriverWait(driver, 10);
    }

    public WebDriver getWebDriver() {
        return this.webDriver;
    }

    @Override
    public void get(String s) {
        Utils.LOG.info("Navigating to page: " + s);
        webDriver.get(s);
    }

    @Override
    public String getCurrentUrl() {
        String currentUrl = webDriver.getCurrentUrl();
        Utils.LOG.info("GEtting current URL: " + currentUrl);
        return currentUrl;
    }

    @Override
    public String getTitle() {
        String currentTitle = webDriver.getTitle();
        Utils.LOG.info("Getting Title: " + currentTitle);
        return currentTitle;
    }

    @Override
    public List<WebElement> findElements(By by) {
        Utils.LOG.info("Finding element with locator: " + by.toString());
        return webDriver.findElements(by);
    }

    @Override
    public WebElement findElement(By by) {
        Utils.LOG.info("Finding all elements with locator: " + by.toString());
        WebElement elementFound = webDriver.findElement(by);
        return webDriverWait.until(ExpectedConditions.visibilityOf(elementFound));
    }

    @Override
    public String getPageSource() {
        Utils.LOG.info("Getting page source...");
        return webDriver.getPageSource();
    }

    @Override
    public void close() {
        Utils.LOG.info("Closing Browser...");
        webDriver.close();
    }

    @Override
    public void quit() {
        Utils.LOG.info("Quiting driver...");
        webDriver.quit();
    }

    @Override
    public Set<String> getWindowHandles() {
        Utils.LOG.info("Getting Window handles...");
        return webDriver.getWindowHandles();
    }

    @Override
    public String getWindowHandle() {
        return webDriver.getWindowHandle();
    }

    @Override
    public TargetLocator switchTo() {
        return webDriver.switchTo();
    }

    @Override
    public Navigation navigate() {
        return webDriver.navigate();
    }

    @Override
    public Options manage() {
        return webDriver.manage();
    }
}
