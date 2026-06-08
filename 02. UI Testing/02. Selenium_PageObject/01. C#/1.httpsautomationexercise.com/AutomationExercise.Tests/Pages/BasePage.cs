using OpenQA.Selenium;
using System;
using AutomationExercise.Tests.Utilities;

namespace AutomationExercise.Tests.Pages
{
    public abstract class BasePage
    {
        protected readonly IWebDriver Driver;

        protected BasePage(IWebDriver driver)
        {
            Driver = driver;
        }

        protected void NavigateTo(string url)
        {
            Driver.Navigate().GoToUrl(url);
            DismissGdprConsentIfPresent();
            BypassVignetteAd();
        }

        private void DismissGdprConsentIfPresent()
        {
            try
            {
                var wait = new OpenQA.Selenium.Support.UI.WebDriverWait(Driver, TimeSpan.FromSeconds(3));
                var consentButton = wait.Until(d => 
                {
                    var elements = d.FindElements(By.CssSelector("button.fc-cta-consent"));
                    if (elements.Count > 0 && elements[0].Displayed && elements[0].Enabled)
                    {
                        return elements[0];
                    }
                    return null;
                });
                consentButton?.Click();
            }
            catch (WebDriverTimeoutException)
            {
                // Normal case: GDPR dialog didn't show up
            }
            catch (Exception)
            {
                // Ignore other issues
            }
        }

        protected void BypassVignetteAd()
        {
            try
            {
                if (Driver.Url.Contains("#google_vignette"))
                {
                    // 1. Try to dismiss via iframe close button
                    DismissGoogleAdIframe();
                    
                    // 2. If still present and it's safe, fall back to re-navigation
                    if (Driver.Url.Contains("#google_vignette"))
                    {
                        bool isFormPage = Driver.Url.Contains("/signup") || 
                                         Driver.Url.Contains("/checkout") || 
                                         Driver.Url.Contains("/payment");
                        if (!isFormPage)
                        {
                            string cleanUrl = Driver.Url.Split('#')[0];
                            Driver.Navigate().GoToUrl(cleanUrl);
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Ignore driver exceptions
            }
        }

        private void DismissGoogleAdIframe()
        {
            try
            {
                var iframes = Driver.FindElements(By.XPath("//iframe[contains(@id, 'aswift') or contains(@id, 'google_ads')]"));
                foreach (var iframe in iframes)
                {
                    try
                    {
                        Driver.SwitchTo().Frame(iframe);
                        
                        var innerIframes = Driver.FindElements(By.Id("ad_iframe"));
                        if (innerIframes.Count > 0)
                        {
                            Driver.SwitchTo().Frame(innerIframes[0]);
                        }
                        
                        var dismissButton = Driver.FindElements(By.Id("dismiss-button"));
                        if (dismissButton.Count == 0)
                        {
                            dismissButton = Driver.FindElements(By.XPath("//div[@id='dismiss-button']"));
                        }
                        
                        if (dismissButton.Count > 0 && dismissButton[0].Displayed && dismissButton[0].Enabled)
                        {
                            dismissButton[0].Click();
                            Driver.SwitchTo().DefaultContent();
                            return;
                        }
                    }
                    catch (Exception)
                    {
                        // Try next iframe
                    }
                    finally
                    {
                        Driver.SwitchTo().DefaultContent();
                    }
                }
            }
            catch (Exception)
            {
                // Ignore
            }
        }

        protected IWebElement FindElement(By locator)
        {
            BypassVignetteAd();
            return WaitHelper.WaitUntilElementVisible(Driver, locator);
        }

        protected void Click(By locator)
        {
            BypassVignetteAd();
            int attempts = 0;
            while (attempts < 3)
            {
                try
                {
                    WaitHelper.WaitUntilElementClickable(Driver, locator).Click();
                    return;
                }
                catch (StaleElementReferenceException)
                {
                    attempts++;
                }
                catch (ElementClickInterceptedException)
                {
                    BypassVignetteAd();
                    attempts++;
                }
            }
            WaitHelper.WaitUntilElementClickable(Driver, locator).Click();
        }

        protected void EnterText(By locator, string text)
        {
            int attempts = 0;
            while (attempts < 3)
            {
                try
                {
                    var element = FindElement(locator);
                    element.Clear();
                    element.SendKeys(text);
                    return;
                }
                catch (StaleElementReferenceException)
                {
                    attempts++;
                }
            }
            var el = FindElement(locator);
            el.Clear();
            el.SendKeys(text);
        }

        protected string GetElementText(By locator)
        {
            return FindElement(locator).Text;
        }

        protected bool IsElementDisplayed(By locator)
        {
            try
            {
                return FindElement(locator).Displayed;
            }
            catch (Exception)
            {
                return false;
            }
        }

        protected void ScrollToElement(By locator)
        {
            var element = FindElement(locator);
            ((IJavaScriptExecutor)Driver).ExecuteScript("arguments[0].scrollIntoView(true);", element);
        }
    }
}
