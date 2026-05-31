using AI_ABV_Playwright_Test.Config;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace AI_ABV_Playwright_Test.Core;

public class BaseTest : PageTest
{
    private static TestSettings? _settings;
    protected static TestSettings Settings => _settings ??= ConfigReader.GetTestSettings();

    static BaseTest()
    {
        // Playwright reads these environment variables when launching the browser
        Environment.SetEnvironmentVariable("HEADED", Settings.Headed ? "1" : "0");
        if (Settings.SlowMo > 0)
            Environment.SetEnvironmentVariable("PW_SLOWMO", Settings.SlowMo.ToString());
    }

    [SetUp]
    public void SetupBase()
    {
        TestContext.Progress.WriteLine($"Starting test: {TestContext.CurrentContext.Test.Name}");
        TestContext.Progress.WriteLine($"Headed mode: {Settings.Headed}");
    }

    public override BrowserNewContextOptions ContextOptions()
    {
        return new BrowserNewContextOptions
        {
            BaseURL = Settings.BaseUrl,
            ViewportSize = new ViewportSize { Width = 1920, Height = 1080 }
        };
    }

    [TearDown]
    public async Task TearDownBase()
    {
        TestContext.Progress.WriteLine($"Finished test: {TestContext.CurrentContext.Test.Name}");

        if (TestContext.CurrentContext.Result.Outcome.Status == NUnit.Framework.Interfaces.TestStatus.Failed)
        {
            TestContext.Progress.WriteLine("Test failed! Taking screenshot...");
            var screenshotPath = Path.Combine(
                TestContext.CurrentContext.WorkDirectory, 
                "Screenshots", 
                $"{TestContext.CurrentContext.Test.Name}_{DateTime.Now:yyyyMMdd_HHmmss}.png");

            var screenshotDir = Path.GetDirectoryName(screenshotPath);
            if (!Directory.Exists(screenshotDir))
            {
                Directory.CreateDirectory(screenshotDir!);
            }

            await Page.ScreenshotAsync(new PageScreenshotOptions 
            { 
                Path = screenshotPath, 
                FullPage = true 
            });

            TestContext.AddTestAttachment(screenshotPath, "Failed Test Screenshot");
        }
    }
}
