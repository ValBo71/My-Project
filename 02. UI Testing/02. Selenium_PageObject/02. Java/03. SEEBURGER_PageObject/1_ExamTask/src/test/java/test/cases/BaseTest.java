package test.cases;

import io.github.bonigarcia.wdm.WebDriverManager;
import io.opentelemetry.internal.Utils;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.concurrent.TimeUnit;

public class BaseTest {

    WebDriver webdriver;

    @BeforeClass
    public static void classSetup(){
        WebDriverManager.chromedriver().setup();
    }

    @Before
    public void setup(){
        ChromeOptions options = new ChromeOptions();
        webdriver = new ChromeDriver(options);
        webdriver.manage().window().maximize();
        webdriver.manage().timeouts().implicitlyWait(5, TimeUnit.SECONDS);

    }

    @After
    public void tearDown(){
        webdriver.quit();
    }

}
