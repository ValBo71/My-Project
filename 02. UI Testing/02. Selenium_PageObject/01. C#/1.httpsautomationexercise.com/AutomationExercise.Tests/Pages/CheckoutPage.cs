using OpenQA.Selenium;
using System.Collections.Generic;
using System.Linq;
using AutomationExercise.Tests.Selectors;

namespace AutomationExercise.Tests.Pages
{
    public class CheckoutPage : BasePage
    {
        public CheckoutPage(IWebDriver driver) : base(driver) { }

        public List<string> GetDeliveryAddressDetails()
        {
            return Driver.FindElements(CheckoutPageSelectors.DeliveryAddressItems)
                .Select(el => el.Text.Trim())
                .Where(text => !string.IsNullOrEmpty(text))
                .ToList();
        }

        public List<string> GetInvoiceAddressDetails()
        {
            return Driver.FindElements(CheckoutPageSelectors.InvoiceAddressItems)
                .Select(el => el.Text.Trim())
                .Where(text => !string.IsNullOrEmpty(text))
                .ToList();
        }

        public CheckoutPage EnterComment(string comment)
        {
            EnterText(CheckoutPageSelectors.CommentTextArea, comment);
            return this;
        }

        public CheckoutPage ClickPlaceOrder()
        {
            Click(CheckoutPageSelectors.PlaceOrderButton);
            return this;
        }

        public CheckoutPage FillPaymentDetails(string nameOnCard, string cardNumber, string cvc, string expiryMonth, string expiryYear)
        {
            EnterText(CheckoutPageSelectors.CardNameInput, nameOnCard);
            EnterText(CheckoutPageSelectors.CardNumberInput, cardNumber);
            EnterText(CheckoutPageSelectors.CardCvcInput, cvc);
            EnterText(CheckoutPageSelectors.CardExpiryMonthInput, expiryMonth);
            EnterText(CheckoutPageSelectors.CardExpiryYearInput, expiryYear);
            return this;
        }

        public CheckoutPage ClickPayAndConfirmOrder()
        {
            Click(CheckoutPageSelectors.PayButton);
            return this;
        }

        public bool IsOrderPlacedVisible()
        {
            return IsElementDisplayed(CheckoutPageSelectors.OrderPlacedSuccessHeader);
        }

        public HomePage ClickContinue()
        {
            Click(CheckoutPageSelectors.ContinueButton);
            return new HomePage(Driver);
        }
    }
}
