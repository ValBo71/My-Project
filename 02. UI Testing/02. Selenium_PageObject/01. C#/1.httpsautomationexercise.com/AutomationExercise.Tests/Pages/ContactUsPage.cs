using OpenQA.Selenium;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class ContactUsPage : BasePage
    {
        public ContactUsPage(IWebDriver driver) : base(driver) { }

        public bool IsContactHeaderVisible()
        {
            return IsElementDisplayed(ContactUsPageSelectors.ContactHeader);
        }

        public ContactUsPage SubmitContactForm(string name, string email, string subject, string message, string? filePath = null)
        {
            EnterText(ContactUsPageSelectors.NameInput, name);
            EnterText(ContactUsPageSelectors.EmailInput, email);
            EnterText(ContactUsPageSelectors.SubjectInput, subject);
            EnterText(ContactUsPageSelectors.MessageTextArea, message);

            if (!string.IsNullOrEmpty(filePath))
            {
                FindElement(ContactUsPageSelectors.FileInput).SendKeys(filePath);
            }

            Click(ContactUsPageSelectors.SubmitButton);
            
            Driver.SwitchTo().Alert().Accept();
            
            return this;
        }

        public string GetSuccessAlertText()
        {
            return GetElementText(ContactUsPageSelectors.SuccessAlert);
        }

        public HomePage ClickHomeButton()
        {
            Click(ContactUsPageSelectors.HomeButton);
            return new HomePage(Driver);
        }
    }
}
