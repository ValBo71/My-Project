using System.Threading.Tasks;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace AIQAAssistant.E2E.Tests;

[TestFixture]
public class E2eTests : PageTest
{
    private const string BaseUrl = "http://localhost:5173";

    [Test]
    public async Task App_LoadsSuccessfully_AndHasCorrectTitle()
    {
        // Act: Open the application page
        await Page.GotoAsync(BaseUrl);

        // Assert: Verify that the document title is "AI QA Assistant"
        await Expect(Page).ToHaveTitleAsync("AI QA Assistant");

        // Assert: Verify sidebar header contains brand title
        var logoText = Page.Locator(".logo-text");
        await Expect(logoText).ToHaveTextAsync("AI QA Assistant");
    }

    [Test]
    public async Task Navigation_TogglesActiveTabs()
    {
        // Act: Open the application page
        await Page.GotoAsync(BaseUrl);

        // Act: Toggle the Navigation tab to Edge Cases
        var edgeCaseBtn = Page.Locator("button:has-text('Edge Cases')");
        await edgeCaseBtn.ClickAsync();

        // Assert: Verify main display content changes
        var mainHeader = Page.Locator(".main-header h1");
        await Expect(mainHeader).ToHaveTextAsync("Identify Edge Cases");

        // Act: Toggle the Navigation tab to Bug Report
        var bugReportBtn = Page.Locator("button:has-text('Bug Report')");
        await bugReportBtn.ClickAsync();

        // Assert: Verify main display content changes
        await Expect(mainHeader).ToHaveTextAsync("Create Bug Report");
    }
}
