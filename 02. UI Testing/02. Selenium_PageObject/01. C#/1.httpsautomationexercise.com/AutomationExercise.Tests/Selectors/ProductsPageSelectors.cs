using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class ProductsPageSelectors
    {
        public static readonly By AllProductsHeader = By.XPath("//h2[text()='All Products']");
        public static readonly By SearchInput = By.Id("search_product");
        public static readonly By SearchSubmitButton = By.Id("submit_search");
        public static readonly By SearchedProductsHeader = By.XPath("//h2[text()='Searched Products']");
        public static readonly By ProductCards = By.XPath("//div[@class='features_items']//div[@class='col-sm-4']");
        
        public static By AddToCartButtonById(string productId) => 
            By.XPath($"//div[@class='productinfo text-center']//a[@data-product-id='{productId}']");

        public static By ViewProductLinkById(string productId) =>
            By.XPath($"//a[@href='/product_details/{productId}']");
            
        // Product Details
        public static readonly By ProductName = By.XPath("//div[@class='product-information']/h2");
        public static readonly By ProductCategory = By.XPath("//div[@class='product-information']/p[contains(text(), 'Category')]");
        public static readonly By ProductPrice = By.XPath("//div[@class='product-information']//span[contains(text(), 'Rs.')]");
        public static readonly By ProductAvailability = By.XPath("//div[@class='product-information']//p[b[text()='Availability:']]");
        public static readonly By ProductCondition = By.XPath("//div[@class='product-information']//p[b[text()='Condition:']]");
        public static readonly By ProductBrand = By.XPath("//div[@class='product-information']//p[b[text()='Brand:']]");
        
        public static readonly By ProductQuantityInput = By.Id("quantity");
        public static readonly By AddToCartDetailsButton = By.XPath("//button[contains(@class, 'cart')]");
        
        // Success Modal
        public static readonly By ModalSuccessMessage = By.XPath("//h4[text()='Added!']");
        public static readonly By ModalViewCartLink = By.XPath("//p[@class='text-center']//a[contains(., 'View Cart')]");
        public static readonly By ModalContinueShoppingButton = By.XPath("//button[text()='Continue Shopping']");
    }
}
