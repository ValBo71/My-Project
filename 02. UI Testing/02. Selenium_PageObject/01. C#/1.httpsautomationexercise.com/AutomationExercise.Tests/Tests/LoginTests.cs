using NUnit.Framework;
using AutomationExercise.Tests.TestData;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class LoginTests : BaseTest
    {
        private string _registerEmail = null!;
        private string _registerName = null!;

        [SetUp]
        public void RegisterTestUser()
        {
            _registerName = TestUsers.DefaultName;
            _registerEmail = "login_" + TestUsers.GenerateRandomEmail();

            HomePage.NavigateToHome();
            var loginPage = HomePage.ClickSignupLogin();
            var signupPage = loginPage.Signup(_registerName, _registerEmail);
            signupPage.FillAccountDetails(TestUsers.DefaultPassword, "10", "5", "1995")
                .FillAddressDetails(TestUsers.FirstName, TestUsers.LastName, TestUsers.Company, TestUsers.Address1, TestUsers.Address2, TestUsers.Country, TestUsers.State, TestUsers.City, TestUsers.Zipcode, TestUsers.MobileNumber)
                .ClickCreateAccount()
                .ClickContinue()
                .ClickLogout();
        }

        [Test]
        public void TestCase2_LoginUserWithCorrectCredentials()
        {
            HomePage.NavigateToHome();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));

            var loginPage = HomePage.ClickSignupLogin();
            Assert.That(loginPage.IsLoginHeaderVisible(), Is.True);

            var homePage = loginPage.Login(_registerEmail, TestUsers.DefaultPassword);
            Assert.That(homePage.IsLoggedInUserVisible(), Is.True);
            Assert.That(homePage.GetLoggedInUserText(), Contains.Substring(_registerName));

            var deletePage = homePage.ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
        }

        [Test]
        public void TestCase3_LoginUserWithIncorrectCredentials()
        {
            HomePage.NavigateToHome();
            var loginPage = HomePage.ClickSignupLogin();
            Assert.That(loginPage.IsLoginHeaderVisible(), Is.True);

            loginPage.Login("invalid_email_1234567@example.com", "WrongPassword123!");

            Assert.That(loginPage.IsLoginErrorVisible(), Is.True);
            Assert.That(loginPage.GetLoginErrorText(), Contains.Substring("incorrect").Or.Contains("wrong").Or.Contains("exist"));
        }

        [Test]
        public void TestCase4_LogoutUser()
        {
            HomePage.NavigateToHome();
            var loginPage = HomePage.ClickSignupLogin();

            var homePage = loginPage.Login(_registerEmail, TestUsers.DefaultPassword);
            Assert.That(homePage.IsLoggedInUserVisible(), Is.True);

            loginPage = homePage.ClickLogout().ClickSignupLogin();
            Assert.That(loginPage.IsLoginHeaderVisible(), Is.True);
        }
    }
}
