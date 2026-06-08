using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class HomePageSelectors
    {
        public static readonly By HomeLink = By.XPath("//a[contains(., 'Home')]");
        public static readonly By SignupLoginLink = By.XPath("//a[contains(., 'Signup / Login')]");
        public static readonly By ContactUsLink = By.XPath("//a[contains(., 'Contact us')]");
        public static readonly By ProductsLink = By.XPath("//a[contains(., 'Products')]");
        public static readonly By CartLink = By.XPath("//a[contains(., 'Cart')]");
        public static readonly By LogoutLink = By.XPath("//a[contains(., 'Logout')]");
        public static readonly By DeleteAccountLink = By.XPath("//a[contains(., 'Delete Account')]");
        public static readonly By TestCasesLink = By.XPath("//a[contains(., 'Test Cases')]");
        public static readonly By LoggedInUserText = By.XPath("//i[@class='fa fa-user']/parent::a");
        public static readonly By SubscriptionHeader = By.XPath("//h2[text()='Subscription']");
        public static readonly By SubscriptionEmailInput = By.Id("susbscribe_email");
        public static readonly By SubscriptionSubmitButton = By.Id("subscribe");
        public static readonly By SubscriptionSuccessAlert = By.Id("success-subscribe");
        
        // Category Sidebar
        public static readonly By CategorySidebarTitle = By.XPath("//h2[text()='Category']");
        public static readonly By WomenCategoryLink = By.XPath("//a[@href='#Women']");
        public static readonly By DressSubCategoryLink = By.XPath("//a[@href='/category_products/1']");
        
        // Brand Sidebar
        public static readonly By BrandSidebarTitle = By.XPath("//h2[text()='Brands']");
        public static readonly By PoloBrandLink = By.XPath("//a[@href='/brand_products/Polo']");
    }
}
