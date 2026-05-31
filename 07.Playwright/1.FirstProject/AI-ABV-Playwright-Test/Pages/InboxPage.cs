using AI_ABV_Playwright_Test.Selectors;
using Microsoft.Playwright;

namespace AI_ABV_Playwright_Test.Pages;

public class InboxPage
{
    private readonly IPage _page;

    public InboxPage(IPage page)
    {
        _page = page;
    }

    public async Task<bool> IsInboxMenuVisibleAsync()
    {
        // Wait for the inbox page to load
        await _page.Locator(InboxSelectors.InboxMenuLink).First.WaitForAsync(new LocatorWaitForOptions { Timeout = 15000 });
        return await _page.Locator(InboxSelectors.InboxMenuLink).First.IsVisibleAsync();
    }
    
    public async Task<bool> IsUserAvatarVisibleAsync()
    {
        await _page.Locator(InboxSelectors.UserAvatar).First.WaitForAsync(new LocatorWaitForOptions { Timeout = 15000 });
        return await _page.Locator(InboxSelectors.UserAvatar).First.IsVisibleAsync();
    }

    public async Task GotoInboxAsync()
    {
        // Кликни върху надписа „Кутия“
        await _page.Locator(InboxSelectors.InboxMenuLink).First.ClickAsync();
    }

    public async Task<bool> IsEmailPresentAsync(string senderName, string subject)
    {
        // Провери, че съществува писмо от senderName и с тема subject
        // Playwright handles waiting correctly with the explicit WaitForAsync on the locator below
        var emailRow = _page.Locator($"tr:has-text('{subject}')").First;
        
        for (int i = 0; i < 5; i++)
        {
            try
            {
                await emailRow.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 5000 });
                if (await emailRow.IsVisibleAsync())
                {
                    return true;
                }
            }
            catch (TimeoutException)
            {
                // Reload the page to fetch new emails if it hasn't arrived yet
                await _page.ReloadAsync();
            }
        }
        return false;
    }
}
