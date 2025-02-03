package com.telerikacademy.forumframework;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;


public class CustomWebDriverManager {
	public enum CustomWebDriverManagerEnum {
		INSTANCE;
		private WebDriver driver = setupBrowser();

		private WebDriver setupBrowser(){
			WebDriverManager.chromedriver().setup();
			WebDriver chromeDriver = new ChromeDriver();
			chromeDriver.manage().window().maximize();
			driver = chromeDriver;
			return chromeDriver;
		}

		public void quitDriver() {
			if (driver != null) {
				driver.quit();
				driver = null;
			}
		}

		public WebDriver getDriver() {
			if (driver == null){
				setupBrowser();
			}
			return driver;
		}


	}
}
