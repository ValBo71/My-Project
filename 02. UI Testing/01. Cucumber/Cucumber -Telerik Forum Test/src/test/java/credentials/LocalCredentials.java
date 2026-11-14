package credentials;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

/**
 * Reads login data from local.credentials.properties in the project root.
 * That file is git-ignored; local.credentials.example.properties lists the keys.
 */
public final class LocalCredentials {

    private static final String FILE = "local.credentials.properties";
    private static final Properties PROPERTIES = load();

    private LocalCredentials() {
    }

    public static String get(String key) {
        String value = PROPERTIES.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("'" + key + "' is not set. Copy local.credentials.example.properties to "
                    + FILE + " and fill it in.");
        }
        return value.trim();
    }

    private static Properties load() {
        Properties properties = new Properties();
        try (FileInputStream input = new FileInputStream(FILE)) {
            properties.load(input);
        } catch (IOException e) {
            // No local file yet: get() reports which key is missing.
        }
        return properties;
    }
}
