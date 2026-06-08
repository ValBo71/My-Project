using OpenQA.Selenium;
using AutomationExercise.Tests.Selectors;
using AutomationExercise.Tests.Utilities;

namespace AutomationExercise.Tests.Pages
{
    public class HomePage : BasePage
    {
        public HomePage(IWebDriver driver) : base(driver) { }

        public HomePage NavigateToHome()
        {
            NavigateTo(ConfigReader.BaseUrl);
            return this;
        }

        public LoginPage ClickSignupLogin()
        {
            Click(HomePageSelectors.SignupLoginLink);
            return new LoginPage(Driver);
        }

        public ContactUsPage ClickContactUs()
        {
            Click(HomePageSelectors.ContactUsLink);
            return new ContactUsPage(Driver);
        }

        public ProductsPage ClickProducts()
        {
            Click(HomePageSelectors.ProductsLink);
            return new ProductsPage(Driver);
        }

        public CartPage ClickCart()
        {
            Click(HomePageSelectors.CartLink);
            return new CartPage(Driver);
        }

        public HomePage ClickLogout()
        {
            Click(HomePageSelectors.LogoutLink);
            return this;
        }

        public SignupPage ClickDeleteAccount()
        {
            Click(HomePageSelectors.DeleteAccountLink);
            return new SignupPage(Driver);
        }

        public HomePage ClickTestCases()
        {
            Click(HomePageSelectors.TestCasesLink);
            return this;
        }

        public string GetLoggedInUserText()
        {
            return GetElementText(HomePageSelectors.LoggedInUserText);
        }

        public bool IsLoggedInUserVisible()
        {
            return IsElementDisplayed(HomePageSelectors.LoggedInUserText);
        }
        
        public bool IsLogoutButtonVisible()
        {
            return IsElementDisplayed(HomePageSelectors.LogoutLink);
        }

        public HomePage ScrollToSubscription()
        {
            ScrollToElement(HomePageSelectors.SubscriptionHeader);
            return this;
        }

        public HomePage EnterSubscriptionEmail(string email)
        {
            EnterText(HomePageSelectors.SubscriptionEmailInput, email);
            return this;
        }

        public HomePage ClickSubscribe()
        {
            Click(HomePageSelectors.SubscriptionSubmitButton);
            return this;
        }

        public string GetSubscriptionSuccessText()
        {
            return GetElementText(HomePageSelectors.SubscriptionSuccessAlert);
        }

        public HomePage ClickWomenCategory()
        {
            Click(HomePageSelectors.WomenCategoryLink);
            return this;
        }

        public ProductsPage ClickDressSubCategory()
        {
            Click(HomePageSelectors.DressSubCategoryLink);
            return new ProductsPage(Driver);
        }

        public ProductsPage ClickPoloBrand()
        {
            Click(HomePageSelectors.PoloBrandLink);
            return new ProductsPage(Driver);
        }
    }
}
