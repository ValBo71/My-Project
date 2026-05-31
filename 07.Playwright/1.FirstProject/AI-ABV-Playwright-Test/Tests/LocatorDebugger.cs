using NUnit.Framework;
using AI_ABV_Playwright_Test.Core;
using AI_ABV_Playwright_Test.Pages;
using Microsoft.Playwright;

namespace AI_ABV_Playwright_Test.Tests;

public class LocatorDebugger : BaseTest
{
    [Test]
    public async Task DumpPostLoginDom()
    {
        var loginPage = new LoginPage(Page);
        await loginPage.GotoAsync();
        await loginPage.LoginAsync("isi_test_isi", ".AZau$Dq*-6_dJ-");

        // Wait a bit for login to complete and dashboard to load
        await Task.Delay(5000);

        try {
            await Page.Locator("text='Напред'").First.ClickAsync(new LocatorClickOptions { Timeout = 5000 });
            await Task.Delay(5000);
        } catch { }

        try {
            await Page.Locator("text='АБВ поща'").First.ClickAsync(new LocatorClickOptions { Timeout = 5000 });
            await Task.Delay(5000);
        } catch { }

        try {
            string rawHtml = await Page.InnerHTMLAsync("body");
            System.IO.File.WriteAllText("post_login_body.html", rawHtml);
        } catch { }

        var outputs = new System.Collections.Generic.List<string>();
        outputs.Add($"=== URL: {Page.Url} ===");
        outputs.Add("=== ALL TEXTS IN ALL FRAMES ===");
        
        foreach (var frame in Page.Frames)
        {
            var url = frame.Url;
            outputs.Add($"--- Frame: {frame.Name} ({url}) ---");
            try {
                var links = await frame.EvaluateAsync<string[]>(@"() => {
                    return Array.from(document.querySelectorAll('a, button, div, span')).map(e => e.innerText ? e.innerText.trim() : '').filter(t => t.length > 0 && t.length < 20);
                }");
                outputs.Add(string.Join("\n", links.Distinct()));
            } catch { outputs.Add("Could not read frame"); }
        }

        System.IO.File.WriteAllText("post_login_dom.txt", string.Join("\n", outputs));
        
        // Take a screenshot to check manually if needed (saving in bin/Debug...)
        await Page.ScreenshotAsync(new PageScreenshotOptions { Path = "post_login.png" });
    }
}
