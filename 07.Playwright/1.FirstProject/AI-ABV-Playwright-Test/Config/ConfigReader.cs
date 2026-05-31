using Microsoft.Extensions.Configuration;

namespace AI_ABV_Playwright_Test.Config;

public static class ConfigReader
{
    public static TestSettings GetTestSettings()
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();

        var settings = new TestSettings();
        config.GetSection("TestSettings").Bind(settings);

        return settings;
    }
}
