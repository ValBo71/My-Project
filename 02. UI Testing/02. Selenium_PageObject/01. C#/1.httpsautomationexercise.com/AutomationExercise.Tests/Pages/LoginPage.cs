using OpenQA.Selenium;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class LoginPage : BasePage
    {
        public LoginPage(IWebDriver driver) : base(driver) { }

        public bool IsLoginHeaderVisible()
        {
            return IsElementDisplayed(LoginPageSelectors.LoginHeader);
        }

        public HomePage Login(string email, string password)
        {
            EnterText(LoginPageSelectors.LoginEmailInput, email);
            EnterText(LoginPageSelectors.LoginPasswordInput, password);
            Click(LoginPageSelectors.LoginButton);
            return new HomePage(Driver);
        }

        public string GetLoginErrorText()
        {
            return GetElementText(LoginPageSelectors.LoginErrorText);
        }

        public bool IsLoginErrorVisible()
        {
            return IsElementDisplayed(LoginPageSelectors.LoginErrorText);
        }

        public bool IsSignupHeaderVisible()
        {
            return IsElementDisplayed(LoginPageSelectors.SignupHeader);
        }

        public SignupPage Signup(string name, string email)
        {
            EnterText(LoginPageSelectors.SignupNameInput, name);
            EnterText(LoginPageSelectors.SignupEmailInput, email);
            Click(LoginPageSelectors.SignupButton);
            return new SignupPage(Driver);
        }

        public string GetSignupErrorText()
        {
            return GetElementText(LoginPageSelectors.SignupErrorText);
        }

        public bool IsSignupErrorVisible()
        {
            return IsElementDisplayed(LoginPageSelectors.SignupErrorText);
        }
    }
}
