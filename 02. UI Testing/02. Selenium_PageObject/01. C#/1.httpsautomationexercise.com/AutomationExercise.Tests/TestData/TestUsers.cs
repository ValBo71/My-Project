using System;

namespace AutomationExercise.Tests.TestData
{
    public static class TestUsers
    {
        public static string GenerateRandomEmail() => $"user_{Guid.NewGuid().ToString().Substring(0, 8)}@example.com";

        public static readonly string DefaultName = "QA Tester";
        public static readonly string DefaultPassword = "Password123!";
        
        // Address details
        public static readonly string FirstName = "John";
        public static readonly string LastName = "Doe";
        public static readonly string Company = "QA Corp";
        public static readonly string Address1 = "123 Test Street";
        public static readonly string Address2 = "Suite 400";
        public static readonly string Country = "United States";
        public static readonly string State = "California";
        public static readonly string City = "Los Angeles";
        public static readonly string Zipcode = "90001";
        public static readonly string MobileNumber = "1234567890";

        // Payment details
        public static readonly string CardHolderName = "John Doe";
        public static readonly string CardNumber = "1111222233334444";
        public static readonly string CardCvc = "311";
        public static readonly string ExpiryMonth = "12";
        public static readonly string ExpiryYear = "2028";
    }
}
