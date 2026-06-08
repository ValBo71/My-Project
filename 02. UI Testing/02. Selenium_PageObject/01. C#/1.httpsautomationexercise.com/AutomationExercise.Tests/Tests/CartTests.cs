using NUnit.Framework;
using AutomationExercise.Tests.TestData;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class CartTests : BaseTest
    {
        [Test]
        public void TestCase10_VerifySubscriptionInHomePage()
        {
            HomePage.NavigateToHome()
                .ScrollToSubscription()
                .EnterSubscriptionEmail(TestUsers.GenerateRandomEmail())
                .ClickSubscribe();

            Assert.That(HomePage.GetSubscriptionSuccessText(), Contains.Substring("successfully subscribed"));
        }

        [Test]
        public void TestCase11_VerifySubscriptionInCartPage()
        {
            HomePage.NavigateToHome();
            var cartPage = HomePage.ClickCart();
            
            HomePage.ScrollToSubscription()
                .EnterSubscriptionEmail(TestUsers.GenerateRandomEmail())
                .ClickSubscribe();

            Assert.That(HomePage.GetSubscriptionSuccessText(), Contains.Substring("successfully subscribed"));
        }

        [Test]
        public void TestCase12_AddProductsInCart()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            
            productsPage.AddToCart("1");
            Assert.That(productsPage.IsModalSuccessMessageVisible(), Is.True);
            productsPage.ClickModalContinueShopping();

            productsPage.AddToCart("2");
            Assert.That(productsPage.IsModalSuccessMessageVisible(), Is.True);
            
            var cartPage = productsPage.ClickModalViewCart();
            
            Assert.That(cartPage.GetCartRowsCount(), Is.EqualTo(2));
            Assert.That(cartPage.IsProductInCart("1"), Is.True);
            Assert.That(cartPage.IsProductInCart("2"), Is.True);

            Assert.That(cartPage.GetProductPrice("1"), Is.Not.Null.And.Not.Empty);
            Assert.That(cartPage.GetProductQuantity("1"), Is.EqualTo("1"));
            Assert.That(cartPage.GetProductTotalPrice("1"), Is.Not.Null.And.Not.Empty);
        }

        [Test]
        public void TestCase13_VerifyProductQuantityInCart()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            
            productsPage.ViewProduct("3");
            productsPage.SetProductQuantity(4)
                .ClickAddToCartDetails();
            
            Assert.That(productsPage.IsModalSuccessMessageVisible(), Is.True);
            
            var cartPage = productsPage.ClickModalViewCart();
            Assert.That(cartPage.IsProductInCart("3"), Is.True);
            Assert.That(cartPage.GetProductQuantity("3"), Is.EqualTo("4"));
        }

        [Test]
        public void TestCase17_RemoveProductsFromCart()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            
            productsPage.AddToCart("1");
            var cartPage = productsPage.ClickModalViewCart();
            Assert.That(cartPage.IsProductInCart("1"), Is.True);

            cartPage.DeleteProduct("1");
            System.Threading.Thread.Sleep(1000);
            
            Assert.That(cartPage.IsProductInCart("1"), Is.False);
        }
    }
}
