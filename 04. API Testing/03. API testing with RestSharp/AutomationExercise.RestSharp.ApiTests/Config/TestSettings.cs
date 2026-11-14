using System;
using Microsoft.Extensions.Configuration;

namespace AutomationExercise.RestSharp.ApiTests.Config
{
    public static class TestSettings
    {
        private static readonly IConfiguration Configuration;

        static TestSettings()
        {
            Configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("Config/appsettings.json", optional: false, reloadOnChange: true)
                // The login account is kept out of the repository: appsettings.Local.json is git-ignored.
                .AddJsonFile("Config/appsettings.Local.json", optional: true, reloadOnChange: false)
                .Build();
        }

        public static string BaseUrl => Configuration["BaseUrl"] ?? "https://automationexercise.com";
        public static string DefaultEmail => Required("DefaultUser:Email");
        public static string DefaultPassword => Required("DefaultUser:Password");
        public static int TimeoutMilliseconds => int.TryParse(Configuration["Api:TimeoutMilliseconds"], out var timeout) ? timeout : 30000;

        private static string Required(string key)
        {
            var value = Configuration[key];
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"'{key}' is not set. Copy Config/appsettings.Local.example.json to Config/appsettings.Local.json and fill it in.");
            }

            return value;
        }
    }
}
