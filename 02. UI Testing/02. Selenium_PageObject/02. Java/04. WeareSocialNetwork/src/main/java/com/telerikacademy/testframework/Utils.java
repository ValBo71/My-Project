package com.telerikacademy.testframework;

import org.openqa.selenium.WebDriver;

import java.util.Properties;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Utils {

	private static Properties uiMappings =  PropertiesManager.PropertiesManagerEnum.INSTANCE.getUiMappings();
	private static Properties configProperties =  PropertiesManager.PropertiesManagerEnum.INSTANCE.getConfigProperties();
	public static final Logger LOG = LogManager.getRootLogger();

	public static WebDriver getWebDriver() {
		LOG.info("Initializing WebDriver");
		return CustomWebDriverManager.CustomWebDriverManagerEnum.INSTANCE.getDriver();
	}

	public static void tearDownWebDriver() {
		LOG.info("Quitting WebDriver");
		CustomWebDriverManager.CustomWebDriverManagerEnum.INSTANCE.quitDriver();
	}

	public static String getUIMappingByKey(String key) {
		String value = uiMappings.getProperty(key);
		return value != null ? value : key;
	}

	public static Properties getConfigProperties() {
		return PropertiesManager.PropertiesManagerEnum.INSTANCE.getConfigProperties();
	}

	public static String getConfigPropertyByKey(String key){
		return configProperties.getProperty(key);
	}

}
