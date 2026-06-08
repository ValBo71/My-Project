using NUnit.Framework;
using System.IO;
using AutomationExercise.Tests.TestData;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class ContactUsTests : BaseTest
    {
        private string _tempFilePath = null!;

        [SetUp]
        public void CreateTempFile()
        {
            _tempFilePath = Path.Combine(Path.GetTempPath(), "test_upload.txt");
            File.WriteAllText(_tempFilePath, "Hello, this is a test file for upload!");
        }

        [TearDown]
        public void DeleteTempFile()
        {
            if (File.Exists(_tempFilePath))
            {
                File.Delete(_tempFilePath);
            }
        }

        [Test]
        public void TestCase6_ContactUsForm()
        {
            HomePage.NavigateToHome();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));

            var contactPage = HomePage.ClickContactUs();
            Assert.That(contactPage.IsContactHeaderVisible(), Is.True);

            contactPage.SubmitContactForm(
                TestUsers.DefaultName,
                "contact_test@example.com",
                "Automation Test Subject",
                "This is an automated test message from C# Selenium.",
                _tempFilePath
            );

            Assert.That(contactPage.GetSuccessAlertText(), Contains.Substring("Success"));

            var homePage = contactPage.ClickHomeButton();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));
        }

        [Test]
        public void TestCase7_VerifyTestCasesPage()
        {
            HomePage.NavigateToHome();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));

            HomePage.ClickTestCases();
            Assert.That(Driver.Url, Contains.Substring("test_cases"));
        }
    }
}
