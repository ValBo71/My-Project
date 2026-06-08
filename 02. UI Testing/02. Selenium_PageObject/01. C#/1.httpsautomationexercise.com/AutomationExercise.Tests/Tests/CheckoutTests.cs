using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using AutomationExercise.Tests.TestData;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class CheckoutTests : BaseTest
    {
        private string _registerEmail = null!;
        private string _registerName = null!;

        [SetUp]
        public void InitTestData()
        {
            _registerName = TestUsers.DefaultName;
            _registerEmail = "checkout_" + TestUsers.GenerateRandomEmail();
        }

        private void RegisterUserDuringFlow()
        {
            var loginPage = HomePage.ClickSignupLogin();
            var signupPage = loginPage.Signup(_registerName, _registerEmail);
            signupPage.FillAccountDetails(TestUsers.DefaultPassword, "10", "12", "1995")
                .FillAddressDetails(
                    TestUsers.FirstName,
                    TestUsers.LastName,
                    TestUsers.Company,
                    TestUsers.Address1,
                    TestUsers.Address2,
                    TestUsers.Country,
                    TestUsers.State,
                    TestUsers.City,
                    TestUsers.Zipcode,
                    TestUsers.MobileNumber
                )
                .ClickCreateAccount()
                .ClickContinue();
        }

        [Test]
        public void TestCase14_PlaceOrderRegisterWhileCheckout()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            productsPage.AddToCart("1");
            var cartPage = productsPage.ClickModalViewCart();
            Assert.That(cartPage.IsProductInCart("1"), Is.True);

            cartPage.ClickProceedToCheckout();
            var loginPage = cartPage.ClickModalRegisterLogin();
            
            var signupPage = loginPage.Signup(_registerName, _registerEmail);
            signupPage.FillAccountDetails(TestUsers.DefaultPassword, "10", "12", "1995")
                .FillAddressDetails(TestUsers.FirstName, TestUsers.LastName, TestUsers.Company, TestUsers.Address1, TestUsers.Address2, TestUsers.Country, TestUsers.State, TestUsers.City, TestUsers.Zipcode, TestUsers.MobileNumber)
                .ClickCreateAccount()
                .ClickContinue();

            Assert.That(HomePage.IsLoggedInUserVisible(), Is.True);

            HomePage.ClickCart();
            cartPage.ClickProceedToCheckout();

            var deliveryDetails = CheckoutPage.GetDeliveryAddressDetails();
            var invoiceDetails = CheckoutPage.GetInvoiceAddressDetails();
            Assert.That(deliveryDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Delivery address does not contain user name.");
            Assert.That(invoiceDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Invoice address does not contain user name.");

            CheckoutPage.EnterComment("Deliver after 5 PM please.")
                .ClickPlaceOrder()
                .FillPaymentDetails(TestUsers.CardHolderName, TestUsers.CardNumber, TestUsers.CardCvc, TestUsers.ExpiryMonth, TestUsers.ExpiryYear)
                .ClickPayAndConfirmOrder();

            Assert.That(CheckoutPage.IsOrderPlacedVisible(), Is.True);

            var deletePage = CheckoutPage.ClickContinue().ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
        }

        [Test]
        public void TestCase15_PlaceOrderRegisterBeforeCheckout()
        {
            HomePage.NavigateToHome();
            RegisterUserDuringFlow();

            var productsPage = HomePage.ClickProducts();
            productsPage.AddToCart("2");
            var cartPage = productsPage.ClickModalViewCart();
            
            cartPage.ClickProceedToCheckout();

            var deliveryDetails = CheckoutPage.GetDeliveryAddressDetails();
            var invoiceDetails = CheckoutPage.GetInvoiceAddressDetails();
            Assert.That(deliveryDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Delivery address does not contain user name.");
            Assert.That(invoiceDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Invoice address does not contain user name.");
            
            CheckoutPage.EnterComment("Automated order comments.")
                .ClickPlaceOrder()
                .FillPaymentDetails(TestUsers.CardHolderName, TestUsers.CardNumber, TestUsers.CardCvc, TestUsers.ExpiryMonth, TestUsers.ExpiryYear)
                .ClickPayAndConfirmOrder();

            Assert.That(CheckoutPage.IsOrderPlacedVisible(), Is.True);

            var deletePage = CheckoutPage.ClickContinue().ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
        }

        [Test]
        public void TestCase16_PlaceOrderLoginBeforeCheckout()
        {
            HomePage.NavigateToHome();
            RegisterUserDuringFlow();
            HomePage.ClickLogout();

            var loginPage = HomePage.ClickSignupLogin();
            loginPage.Login(_registerEmail, TestUsers.DefaultPassword);

            var productsPage = HomePage.ClickProducts();
            productsPage.AddToCart("3");
            var cartPage = productsPage.ClickModalViewCart();
            
            cartPage.ClickProceedToCheckout();

            var deliveryDetails = CheckoutPage.GetDeliveryAddressDetails();
            var invoiceDetails = CheckoutPage.GetInvoiceAddressDetails();
            Assert.That(deliveryDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Delivery address does not contain user name.");
            Assert.That(invoiceDetails.Any(line => line.Contains(TestUsers.FirstName) && line.Contains(TestUsers.LastName)), Is.True, "Invoice address does not contain user name.");
            
            CheckoutPage.EnterComment("Another automated comment.")
                .ClickPlaceOrder()
                .FillPaymentDetails(TestUsers.CardHolderName, TestUsers.CardNumber, TestUsers.CardCvc, TestUsers.ExpiryMonth, TestUsers.ExpiryYear)
                .ClickPayAndConfirmOrder();

            Assert.That(CheckoutPage.IsOrderPlacedVisible(), Is.True);

            var deletePage = CheckoutPage.ClickContinue().ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
        }

        [Test]
        public void TestCase18_ViewCategoryProducts()
        {
            HomePage.NavigateToHome();

            HomePage.ClickWomenCategory();
            var productsPage = HomePage.ClickDressSubCategory();
            
            Assert.That(Driver.Url, Contains.Substring("category_products/1"));
        }

        [Test]
        public void TestCase19_ViewAndCartBrandProducts()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            
            productsPage = HomePage.ClickPoloBrand();
            Assert.That(Driver.Url, Contains.Substring("brand_products/Polo"));
        }

        [Test]
        public void TestCase20_SearchProductsAndVerifyCartAfterLogin()
        {
            HomePage.NavigateToHome();
            RegisterUserDuringFlow();
            HomePage.ClickLogout();

            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            productsPage.SearchProduct("t-shirt");
            Assert.That(productsPage.IsSearchedProductsHeaderVisible(), Is.True, "Searched products header not visible.");
            productsPage.AddToCart("28");
            var cartPage = productsPage.ClickModalViewCart();
            
            Assert.That(cartPage.IsProductInCart("28"), Is.True);

            var loginPage = HomePage.ClickSignupLogin();
            loginPage.Login(_registerEmail, TestUsers.DefaultPassword);

            HomePage.ClickCart();
            Assert.That(cartPage.IsProductInCart("28"), Is.True);

            var deletePage = HomePage.ClickDeleteAccount();
            Assert.That(deletePage.IsAccountDeletedVisible(), Is.True);
        }
    }
}
