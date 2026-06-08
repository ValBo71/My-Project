using OpenQA.Selenium;

namespace AutomationExercise.Tests.Selectors
{
    public static class CheckoutPageSelectors
    {
        public static readonly By DeliveryAddressItems = By.XPath("//ul[@id='address_delivery']/li");
        public static readonly By InvoiceAddressItems = By.XPath("//ul[@id='address_invoice']/li");
        
        public static readonly By CommentTextArea = By.XPath("//textarea[@name='message']");
        public static readonly By PlaceOrderButton = By.XPath("//a[contains(@href, 'payment') and contains(text(), 'Place Order')]");
        
        // Payment
        public static readonly By CardNameInput = By.XPath("//input[@data-qa='name-on-card']");
        public static readonly By CardNumberInput = By.XPath("//input[@data-qa='card-number']");
        public static readonly By CardCvcInput = By.XPath("//input[@data-qa='cvc']");
        public static readonly By CardExpiryMonthInput = By.XPath("//input[@data-qa='expiry-month']");
        public static readonly By CardExpiryYearInput = By.XPath("//input[@data-qa='expiry-year']");
        public static readonly By PayButton = By.XPath("//button[@data-qa='pay-button']");
        
        // Final Confirmation
        public static readonly By OrderPlacedSuccessHeader = By.XPath("//b[text()='Order Placed!']");
        public static readonly By ContinueButton = By.XPath("//a[@data-qa='continue-button']");
    }
}
