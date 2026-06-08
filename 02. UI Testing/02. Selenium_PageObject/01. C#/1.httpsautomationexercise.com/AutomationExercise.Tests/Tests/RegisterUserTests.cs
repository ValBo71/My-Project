using NUnit.Framework;
using AutomationExercise.Tests.TestData;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class RegisterUserTests : BaseTest
    {
        [Test]
        public void TestCase1_RegisterUser()
        {
            HomePage.NavigateToHome();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));

            var loginPage = HomePage.ClickSignupLogin();
            Assert.That(loginPage.IsSignupHeaderVisible(), Is.True);

            string name = TestUsers.DefaultName;
            string email = TestUsers.GenerateRandomEmail();
            var signupPage = loginPage.Signup(name, email);
            Assert.That(signupPage.IsSignupFormHeaderVisible(), Is.True);

            signupPage.FillAccountDetails(TestUsers.DefaultPassword, "25", "12", "1990", newsletter: true, optin: true)
                .FillAddressDetails(
                    TestUsers.FirstName,
                    TestUsers.LastName,
                    TestUsers.Company,
                    TestUsers.Address1,
                    TestUsers.Address2,
                    TestUsers.Country,
                    TestUsers.State,
                    TestUsers.City,
                    TestUsers.Zipcode,
                    TestUsers.MobileNumber
                );

            signupPage.ClickCreateAccount();
            Assert.That(signupPage.IsAccountCreatedVisible(), Is.True);

            var homeAfterSignup = signupPage.ClickContinue();
            Assert.That(homeAfterSignup.IsLoggedInUserVisible(), Is.True);
            Assert.That(homeAfterSignup.GetLoggedInUserText(), Contains.Substring(name));

            var deletePage = homeAfterSignup.ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
            deletePage.ClickContinue();
        }

        [Test]
        public void TestCase5_RegisterUserWithExistingEmail()
        {
            HomePage.NavigateToHome();
            var loginPage = HomePage.ClickSignupLogin();

            string name = TestUsers.DefaultName;
            string email = "existing_" + TestUsers.GenerateRandomEmail();
            
            var signupPage = loginPage.Signup(name, email);
            signupPage.FillAccountDetails(TestUsers.DefaultPassword, "1", "1", "2000")
                .FillAddressDetails(TestUsers.FirstName, TestUsers.LastName, TestUsers.Company, TestUsers.Address1, TestUsers.Address2, TestUsers.Country, TestUsers.State, TestUsers.City, TestUsers.Zipcode, TestUsers.MobileNumber)
                .ClickCreateAccount()
                .ClickContinue()
                .ClickLogout();

            HomePage.ClickSignupLogin();
            loginPage.Signup(name, email);

            Assert.That(loginPage.IsSignupErrorVisible(), Is.True);
            Assert.That(loginPage.GetSignupErrorText(), Contains.Substring("exist"));
        }
    }
}
