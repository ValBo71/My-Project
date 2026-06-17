using AI_ABV_Playwright_Test.Core;
using AI_ABV_Playwright_Test.Pages;
using NUnit.Framework;

namespace AI_ABV_Playwright_Test.Tests;

public class SmokeTests : BaseTest
{
    [Test]
    public async Task Login_WithValidCredentials_ShouldNavigateToInbox()
    {
        // 1. Initialize pages
        var loginPage = new LoginPage(Page);
        var inboxPage = new InboxPage(Page);

        // 2. Navigate to login
        TestContext.Progress.WriteLine("Navigating to ABV.bg login page...");
        await loginPage.GotoAsync();

        // 3. Perform login
        TestContext.Progress.WriteLine("Filling login credentials...");
        
        // Data is loaded from Config
        string username = Settings.Username;
        string password = Settings.Password;
        
        await loginPage.LoginAsync(username, password);

        // 4. Validate successful login (Wait for an inbox element)
        TestContext.Progress.WriteLine("Validating successful login...");
        
        bool isInboxMenuVisible = await inboxPage.IsInboxMenuVisibleAsync();
        Assert.That(isInboxMenuVisible, Is.True, "The 'Кутия' menu link should be visible in the inbox.");
        
        bool isAvatarVisible = await inboxPage.IsUserAvatarVisibleAsync(username);
        Assert.That(isAvatarVisible, Is.True, "User avatar should be visible in the inbox.");
    }
}
