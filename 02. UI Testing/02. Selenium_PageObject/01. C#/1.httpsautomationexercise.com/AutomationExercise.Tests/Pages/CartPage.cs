using OpenQA.Selenium;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class CartPage : BasePage
    {
        public CartPage(IWebDriver driver) : base(driver) { }

        public int GetCartRowsCount()
        {
            return Driver.FindElements(CartPageSelectors.CartRows).Count;
        }

        public bool IsProductInCart(string productId)
        {
            return IsElementDisplayed(CartPageSelectors.ProductRowById(productId));
        }

        public string GetProductPrice(string productId)
        {
            return GetElementText(CartPageSelectors.ProductPriceById(productId));
        }

        public string GetProductQuantity(string productId)
        {
            return GetElementText(CartPageSelectors.ProductQuantityById(productId));
        }

        public string GetProductTotalPrice(string productId)
        {
            return GetElementText(CartPageSelectors.ProductTotalPriceById(productId));
        }

        public CartPage DeleteProduct(string productId)
        {
            Click(CartPageSelectors.ProductDeleteButtonById(productId));
            return this;
        }

        public CartPage ClickProceedToCheckout()
        {
            Click(CartPageSelectors.ProceedToCheckoutButton);
            return this;
        }

        public LoginPage ClickModalRegisterLogin()
        {
            Click(CartPageSelectors.ModalRegisterLoginLink);
            return new LoginPage(Driver);
        }

        public bool IsProceedToCheckoutVisible()
        {
            return IsElementDisplayed(CartPageSelectors.ProceedToCheckoutButton);
        }

        public bool IsCartEmpty()
        {
            return IsElementDisplayed(CartPageSelectors.CartEmptyMessage);
        }
    }
}
