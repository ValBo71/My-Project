using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium;
using System;
using Allure.NUnit;
using AutomationExercise.Tests.Drivers;
using AutomationExercise.Tests.Pages;
using AutomationExercise.Tests.Utilities;

namespace AutomationExercise.Tests.Tests
{
    [AllureNUnit]
    public abstract class BaseTest
    {
        protected IWebDriver Driver = null!;
        
        protected HomePage HomePage = null!;
        protected LoginPage LoginPage = null!;
        protected SignupPage SignupPage = null!;
        protected ProductsPage ProductsPage = null!;
        protected CartPage CartPage = null!;
        protected CheckoutPage CheckoutPage = null!;
        protected ContactUsPage ContactUsPage = null!;

        [SetUp]
        public void Setup()
        {
            Driver = DriverFactory.CreateDriver();
            
            HomePage = new HomePage(Driver);
            LoginPage = new LoginPage(Driver);
            SignupPage = new SignupPage(Driver);
            ProductsPage = new ProductsPage(Driver);
            CartPage = new CartPage(Driver);
            CheckoutPage = new CheckoutPage(Driver);
            ContactUsPage = new ContactUsPage(Driver);
        }

        [TearDown]
        public void TearDown()
        {
            try
            {
                var context = TestContext.CurrentContext;
                if (context.Result.Outcome.Status == TestStatus.Failed)
                {
                    string screenshotPath = ScreenshotHelper.CaptureScreenshot(Driver, context.Test.Name);
                    if (!string.IsNullOrEmpty(screenshotPath))
                    {
                        TestContext.AddTestAttachment(screenshotPath, "Error Screenshot");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during test cleanup: {ex.Message}");
            }
            finally
            {
                if (Driver != null)
                {
                    Driver.Quit();
                    Driver.Dispose();
                }
            }
        }
    }
}
