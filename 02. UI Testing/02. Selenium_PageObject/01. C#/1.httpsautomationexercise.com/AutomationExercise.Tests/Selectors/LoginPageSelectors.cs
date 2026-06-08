using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class LoginPageSelectors
    {
        public static readonly By LoginHeader = By.XPath("//h2[text()='Login to your account']");
        public static readonly By LoginEmailInput = By.XPath("//input[@data-qa='login-email']");
        public static readonly By LoginPasswordInput = By.XPath("//input[@data-qa='login-password']");
        public static readonly By LoginButton = By.XPath("//button[@data-qa='login-button']");
        public static readonly By LoginErrorText = By.XPath("//p[contains(text(), 'incorrect') or contains(text(), 'wrong') or contains(text(), 'exist')]");

        public static readonly By SignupHeader = By.XPath("//h2[text()='New User Signup!']");
        public static readonly By SignupNameInput = By.XPath("//input[@data-qa='signup-name']");
        public static readonly By SignupEmailInput = By.XPath("//input[@data-qa='signup-email']");
        public static readonly By SignupButton = By.XPath("//button[@data-qa='signup-button']");
        public static readonly By SignupErrorText = By.XPath("//p[contains(text(), 'already exist') or contains(text(), 'exist')]");
    }
}
