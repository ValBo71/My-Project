using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class ContactUsPageSelectors
    {
        public static readonly By ContactHeader = By.XPath("//h2[text()='Get In Touch']");
        public static readonly By NameInput = By.XPath("//input[@data-qa='name']");
        public static readonly By EmailInput = By.XPath("//input[@data-qa='email']");
        public static readonly By SubjectInput = By.XPath("//input[@data-qa='subject']");
        public static readonly By MessageTextArea = By.XPath("//textarea[@data-qa='message']");
        public static readonly By FileInput = By.XPath("//input[@name='upload_file']");
        public static readonly By SubmitButton = By.XPath("//input[@data-qa='submit-button']");
        public static readonly By SuccessAlert = By.XPath("//div[contains(@class, 'status alert alert-success')]");
        public static readonly By HomeButton = By.XPath("//a[contains(@class, 'btn-success') and contains(., 'Home')]");
    }
}
