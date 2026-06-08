using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class SignupPageSelectors
    {
        public static readonly By SignupFormHeader = By.XPath("//b[text()='Enter Account Information']");
        public static readonly By TitleMr = By.Id("id_gender1");
        public static readonly By TitleMs = By.Id("id_gender2");
        public static readonly By PasswordInput = By.Id("password");
        public static readonly By DayOfBirthSelect = By.Id("days");
        public static readonly By MonthOfBirthSelect = By.Id("months");
        public static readonly By YearOfBirthSelect = By.Id("years");
        public static readonly By NewsletterCheckbox = By.Id("newsletter");
        public static readonly By SpecialOffersCheckbox = By.Id("optin");
        
        public static readonly By FirstNameInput = By.Id("first_name");
        public static readonly By LastNameInput = By.Id("last_name");
        public static readonly By CompanyInput = By.Id("company");
        public static readonly By Address1Input = By.Id("address1");
        public static readonly By Address2Input = By.Id("address2");
        public static readonly By CountrySelect = By.Id("country");
        public static readonly By StateInput = By.Id("state");
        public static readonly By CityInput = By.Id("city");
        public static readonly By ZipcodeInput = By.Id("zipcode");
        public static readonly By MobileNumberInput = By.Id("mobile_number");
        
        public static readonly By CreateAccountButton = By.XPath("//button[@data-qa='create-account']");
        public static readonly By AccountCreatedHeader = By.XPath("//b[text()='Account Created!']");
        public static readonly By AccountDeletedHeader = By.XPath("//b[text()='Account Deleted!']");
        public static readonly By ContinueButton = By.XPath("//a[@data-qa='continue-button']");
    }
}
