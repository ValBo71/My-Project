package com.telerikacademy.testframework;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class PropertiesManager {
	public enum PropertiesManagerEnum {
		INSTANCE;
		private Properties configProperties = null;
		private Properties uiMappings = null;
		private static final String UI_MAP = "src/test/resources/mappings/ui_map.properties";
		private static final String CONFIG_PROPERTIES = "src/test/resources/config.properties";


		private static Properties loadProperties(String url) {
			Properties props = new Properties();
			try {
				props.load(new FileInputStream(url));
			} catch (IOException ex){
				Utils.LOG.error("Loading properties failed!");
			}
			return props;
		}

		public Properties getConfigProperties() {
			return configProperties = loadProperties(CONFIG_PROPERTIES);
		}

		public Properties getUiMappings() {
			return uiMappings = loadProperties(UI_MAP);
		}
	}
}
