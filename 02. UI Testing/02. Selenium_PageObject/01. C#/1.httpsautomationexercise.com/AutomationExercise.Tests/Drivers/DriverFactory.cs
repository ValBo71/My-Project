using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Edge;
using System;
using AutomationExercise.Tests.Utilities;

namespace AutomationExercise.Tests.Drivers
{
    public static class DriverFactory
    {
        public static IWebDriver CreateDriver()
        {
            string browser = ConfigReader.Browser.ToLower();
            bool headless = ConfigReader.Headless;

            IWebDriver driver;

            switch (browser)
            {
                case "chrome":
                    var chromeOptions = new ChromeOptions();
                    chromeOptions.PageLoadStrategy = PageLoadStrategy.Eager;
                    chromeOptions.AddArgument("--start-maximized");
                    chromeOptions.AddArgument("--no-sandbox");
                    chromeOptions.AddArgument("--disable-dev-shm-usage");
                    chromeOptions.AddArgument("--disable-search-engine-choice-screen");
                    if (headless)
                    {
                        chromeOptions.AddArgument("--headless=new");
                        chromeOptions.AddArgument("--window-size=1920,1080");
                    }
                    driver = new ChromeDriver(chromeOptions);
                    break;

                case "firefox":
                    var firefoxOptions = new FirefoxOptions();
                    firefoxOptions.PageLoadStrategy = PageLoadStrategy.Eager;
                    if (headless)
                    {
                        firefoxOptions.AddArgument("-headless");
                        firefoxOptions.AddArgument("--window-size=1920,1080");
                    }
                    driver = new FirefoxDriver(firefoxOptions);
                    break;

                case "edge":
                    var edgeOptions = new EdgeOptions();
                    edgeOptions.PageLoadStrategy = PageLoadStrategy.Eager;
                    edgeOptions.AddArgument("--start-maximized");
                    if (headless)
                    {
                        edgeOptions.AddArgument("headless");
                        edgeOptions.AddArgument("--window-size=1920,1080");
                    }
                    driver = new EdgeDriver(edgeOptions);
                    break;

                default:
                    throw new ArgumentException($"Browser '{browser}' is not supported.");
            }

            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(ConfigReader.DefaultTimeout);
            return driver;
        }
    }
}
