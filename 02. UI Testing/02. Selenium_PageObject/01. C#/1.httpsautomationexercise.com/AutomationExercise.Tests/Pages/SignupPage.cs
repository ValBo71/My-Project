using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class SignupPage : BasePage
    {
        public SignupPage(IWebDriver driver) : base(driver) { }

        public bool IsSignupFormHeaderVisible()
        {
            return IsElementDisplayed(SignupPageSelectors.SignupFormHeader);
        }

        public SignupPage FillAccountDetails(string password, string day, string month, string year, bool newsletter = true, bool optin = true)
        {
            Click(SignupPageSelectors.TitleMr);
            EnterText(SignupPageSelectors.PasswordInput, password);
            
            new SelectElement(FindElement(SignupPageSelectors.DayOfBirthSelect)).SelectByValue(day);
            new SelectElement(FindElement(SignupPageSelectors.MonthOfBirthSelect)).SelectByValue(month);
            new SelectElement(FindElement(SignupPageSelectors.YearOfBirthSelect)).SelectByValue(year);

            var newsletterChk = FindElement(SignupPageSelectors.NewsletterCheckbox);
            if (newsletter && !newsletterChk.Selected)
            {
                Click(SignupPageSelectors.NewsletterCheckbox);
            }

            var optinChk = FindElement(SignupPageSelectors.SpecialOffersCheckbox);
            if (optin && !optinChk.Selected)
            {
                Click(SignupPageSelectors.SpecialOffersCheckbox);
            }

            return this;
        }

        public SignupPage FillAddressDetails(string firstName, string lastName, string company, string address1, string address2, string country, string state, string city, string zipcode, string mobileNumber)
        {
            EnterText(SignupPageSelectors.FirstNameInput, firstName);
            EnterText(SignupPageSelectors.LastNameInput, lastName);
            EnterText(SignupPageSelectors.CompanyInput, company);
            EnterText(SignupPageSelectors.Address1Input, address1);
            EnterText(SignupPageSelectors.Address2Input, address2);
            
            new SelectElement(FindElement(SignupPageSelectors.CountrySelect)).SelectByValue(country);
            
            EnterText(SignupPageSelectors.StateInput, state);
            EnterText(SignupPageSelectors.CityInput, city);
            EnterText(SignupPageSelectors.ZipcodeInput, zipcode);
            EnterText(SignupPageSelectors.MobileNumberInput, mobileNumber);

            return this;
        }

        public SignupPage ClickCreateAccount()
        {
            Click(SignupPageSelectors.CreateAccountButton);
            return this;
        }

        public bool IsAccountCreatedVisible()
        {
            return IsElementDisplayed(SignupPageSelectors.AccountCreatedHeader);
        }

        public bool IsAccountDeletedVisible()
        {
            return IsElementDisplayed(SignupPageSelectors.AccountDeletedHeader);
        }

        public HomePage ClickContinue()
        {
            Click(SignupPageSelectors.ContinueButton);
            return new HomePage(Driver);
        }
    }
}
