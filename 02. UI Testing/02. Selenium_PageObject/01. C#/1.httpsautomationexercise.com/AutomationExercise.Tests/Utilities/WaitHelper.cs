using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace AutomationExercise.Tests.Utilities
{
    public static class WaitHelper
    {
        private static TimeSpan GetTimeout(int? timeoutInSeconds)
        {
            return TimeSpan.FromSeconds(timeoutInSeconds ?? ConfigReader.DefaultTimeout);
        }

        public static IWebElement WaitUntilElementExists(IWebDriver driver, By locator, int? timeoutInSeconds = null)
        {
            var wait = new WebDriverWait(driver, GetTimeout(timeoutInSeconds));
            return wait.Until(d => d.FindElement(locator));
        }

        public static IWebElement WaitUntilElementVisible(IWebDriver driver, By locator, int? timeoutInSeconds = null)
        {
            var wait = new WebDriverWait(driver, GetTimeout(timeoutInSeconds));
            return wait.Until(d =>
            {
                try
                {
                    var element = d.FindElement(locator);
                    return element.Displayed ? element : null;
                }
                catch (NoSuchElementException)
                {
                    return null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            })!;
        }

        public static IWebElement WaitUntilElementClickable(IWebDriver driver, By locator, int? timeoutInSeconds = null)
        {
            var wait = new WebDriverWait(driver, GetTimeout(timeoutInSeconds));
            return wait.Until(d =>
            {
                try
                {
                    var element = d.FindElement(locator);
                    return (element.Displayed && element.Enabled) ? element : null;
                }
                catch (NoSuchElementException)
                {
                    return null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            })!;
        }

        public static bool WaitUntilElementInvisible(IWebDriver driver, By locator, int? timeoutInSeconds = null)
        {
            var wait = new WebDriverWait(driver, GetTimeout(timeoutInSeconds));
            return wait.Until(d =>
            {
                try
                {
                    var element = d.FindElement(locator);
                    return !element.Displayed;
                }
                catch (NoSuchElementException)
                {
                    return true;
                }
                catch (StaleElementReferenceException)
                {
                    return true;
                }
            });
        }
    }
}
