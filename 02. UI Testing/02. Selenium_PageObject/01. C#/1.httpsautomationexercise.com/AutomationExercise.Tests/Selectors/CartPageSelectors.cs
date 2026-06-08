using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class CartPageSelectors
    {
        public static readonly By CartRows = By.XPath("//table[@id='cart_info_table']/tbody/tr");
        
        public static By ProductRowById(string productId) => By.Id($"product-{productId}");
        public static By ProductPriceById(string productId) => By.XPath($"//tr[@id='product-{productId}']//td[@class='cart_price']/p");
        public static By ProductQuantityById(string productId) => By.XPath($"//tr[@id='product-{productId}']//td[@class='cart_quantity']/button");
        public static By ProductTotalPriceById(string productId) => By.XPath($"//tr[@id='product-{productId}']//p[@class='cart_total_price']");
        public static By ProductDeleteButtonById(string productId) => By.XPath($"//tr[@id='product-{productId}']//a[@class='cart_quantity_delete']");
        
        public static readonly By ProceedToCheckoutButton = By.XPath("//a[contains(text(), 'Proceed To Checkout')]");
        public static readonly By ModalRegisterLoginLink = By.XPath("//div[@class='modal-content']//a[contains(., 'Register / Login')]");
        public static readonly By CartEmptyMessage = By.Id("empty_cart");
    }
}
