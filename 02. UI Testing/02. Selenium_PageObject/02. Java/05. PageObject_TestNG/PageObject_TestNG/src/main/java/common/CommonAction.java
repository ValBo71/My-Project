package common;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;

import java.util.concurrent.TimeUnit;

import static common.Config.IMPLICIT_WAIT;
import static common.Config.PLATFORM_AND_BROWSERS;

public class CommonAction {
    private static WebDriver driver = null;

    private CommonAction() {
    }

    public static  WebDriver creatorDriver() {
        if(driver == null){
            switch (PLATFORM_AND_BROWSERS) {
                case "win_chrome":
                    String setProperty = System.setProperty("webdriver.chrome.driver", "src/main/resources/chromedriver.exe");
                    driver = (WebDriver) new ChromeDriver();
                    break;
                default:
                   Assert.fail("Incorrect platform and browser: "  + PLATFORM_AND_BROWSERS);

            }
            driver.manage().window().maximize();
            driver.manage().timeouts().implicitlyWait(IMPLICIT_WAIT, TimeUnit.SECONDS);
        }
        return  driver;

    }




}
