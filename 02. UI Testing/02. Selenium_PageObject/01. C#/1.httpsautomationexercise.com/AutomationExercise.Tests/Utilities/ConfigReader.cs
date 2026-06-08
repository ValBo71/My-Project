using Microsoft.Extensions.Configuration;
using System;

namespace AutomationExercise.Tests.Utilities
{
    public static class ConfigReader
    {
        private static readonly IConfigurationRoot Configuration;

        static ConfigReader()
        {
            var basePath = AppContext.BaseDirectory;
            Configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();
        }

        public static string BaseUrl => Configuration["BaseUrl"] ?? "https://automationexercise.com";
        public static string Browser => Configuration["Browser"] ?? "Chrome";
        public static bool Headless => bool.TryParse(Configuration["Headless"], out var headless) && headless;
        public static int DefaultTimeout => int.TryParse(Configuration["DefaultTimeout"], out var timeout) ? timeout : 10;
    }
}
