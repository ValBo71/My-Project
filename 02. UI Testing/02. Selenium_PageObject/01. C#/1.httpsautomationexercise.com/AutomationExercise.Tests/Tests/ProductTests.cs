using NUnit.Framework;

namespace AutomationExercise.Tests.Tests
{
    [TestFixture]
    public class ProductTests : BaseTest
    {
        [Test]
        public void TestCase8_VerifyAllProductsAndProductDetailPage()
        {
            HomePage.NavigateToHome();
            Assert.That(Driver.Title, Contains.Substring("Automation Exercise"));

            var productsPage = HomePage.ClickProducts();
            Assert.That(productsPage.IsAllProductsHeaderVisible(), Is.True);
            Assert.That(productsPage.GetProductCardsCount(), Is.GreaterThan(0));

            productsPage.ViewProduct("1");
            Assert.That(Driver.Url, Contains.Substring("product_details/1"));

            Assert.That(productsPage.GetProductName(), Is.Not.Null.And.Not.Empty);
            Assert.That(productsPage.GetProductCategory(), Contains.Substring("Category"));
            Assert.That(productsPage.GetProductPrice(), Contains.Substring("Rs."));
            Assert.That(productsPage.GetProductAvailability(), Contains.Substring("Availability"));
            Assert.That(productsPage.GetProductCondition(), Contains.Substring("Condition"));
            Assert.That(productsPage.GetProductBrand(), Contains.Substring("Brand"));
        }

        [Test]
        public void TestCase9_SearchProduct()
        {
            HomePage.NavigateToHome();
            var productsPage = HomePage.ClickProducts();
            Assert.That(productsPage.IsAllProductsHeaderVisible(), Is.True);

            productsPage.SearchProduct("t-shirt");
            Assert.That(productsPage.IsSearchedProductsHeaderVisible(), Is.True);
            
            int resultsCount = productsPage.GetProductCardsCount();
            Assert.That(resultsCount, Is.GreaterThan(0), "No products were found for search term 't-shirt'!");
        }
    }
}
