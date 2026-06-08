using OpenQA.Selenium;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class ProductsPage : BasePage
    {
        public ProductsPage(IWebDriver driver) : base(driver) { }

        public bool IsAllProductsHeaderVisible()
        {
            return IsElementDisplayed(ProductsPageSelectors.AllProductsHeader);
        }

        public ProductsPage SearchProduct(string text)
        {
            EnterText(ProductsPageSelectors.SearchInput, text);
            Click(ProductsPageSelectors.SearchSubmitButton);
            return this;
        }

        public bool IsSearchedProductsHeaderVisible()
        {
            return IsElementDisplayed(ProductsPageSelectors.SearchedProductsHeader);
        }

        public int GetProductCardsCount()
        {
            return Driver.FindElements(ProductsPageSelectors.ProductCards).Count;
        }

        public ProductsPage AddToCart(string productId)
        {
            var locator = ProductsPageSelectors.AddToCartButtonById(productId);
            ScrollToElement(locator);
            Click(locator);
            return this;
        }

        public ProductsPage ViewProduct(string productId)
        {
            var locator = ProductsPageSelectors.ViewProductLinkById(productId);
            ScrollToElement(locator);
            Click(locator);
            return this;
        }

        public string GetProductName() => GetElementText(ProductsPageSelectors.ProductName);
        public string GetProductCategory() => GetElementText(ProductsPageSelectors.ProductCategory);
        public string GetProductPrice() => GetElementText(ProductsPageSelectors.ProductPrice);
        public string GetProductAvailability() => GetElementText(ProductsPageSelectors.ProductAvailability);
        public string GetProductCondition() => GetElementText(ProductsPageSelectors.ProductCondition);
        public string GetProductBrand() => GetElementText(ProductsPageSelectors.ProductBrand);

        public ProductsPage SetProductQuantity(int quantity)
        {
            EnterText(ProductsPageSelectors.ProductQuantityInput, quantity.ToString());
            return this;
        }

        public ProductsPage ClickAddToCartDetails()
        {
            Click(ProductsPageSelectors.AddToCartDetailsButton);
            return this;
        }

        public bool IsModalSuccessMessageVisible()
        {
            return IsElementDisplayed(ProductsPageSelectors.ModalSuccessMessage);
        }

        public ProductsPage ClickModalContinueShopping()
        {
            Click(ProductsPageSelectors.ModalContinueShoppingButton);
            return this;
        }

        public CartPage ClickModalViewCart()
        {
            Click(ProductsPageSelectors.ModalViewCartLink);
            return new CartPage(Driver);
        }
    }
}
