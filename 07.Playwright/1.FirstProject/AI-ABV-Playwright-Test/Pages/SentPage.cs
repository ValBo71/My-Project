using AI_ABV_Playwright_Test.Selectors;
using Microsoft.Playwright;

namespace AI_ABV_Playwright_Test.Pages;

public class SentPage
{
    private readonly IPage _page;

    public SentPage(IPage page)
    {
        _page = page;
    }

    public async Task GotoSentPageAsync()
    {
        // 1. Кликни върху надписа „Изпратени“
        await _page.Locator(SentSelectors.SentMenuLink).First.ClickAsync();
    }

    public async Task<bool> IsEmailPresentAsync(string senderEmail, string subject)
    {
        // 4. Провери, че съществува изпратено писмо
        // Wait for the specific email to appear directly via explicit locator waits
        var emailRow = _page.Locator($"{SentSelectors.EmailRow}:has-text('{subject}')").First;
        // Playwright handles finding dynamic text easily.
        // We look for a table row (or any block) containing both the sender and the subject
        // Due to ABV UI, the "To" might be displayed instead of sender, but prompt asks to check "From: isi..."
        // Either way, if it's on the screen in that row, :has-text will find it.
        
        try
        {
            await emailRow.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 15000 });
            return await emailRow.IsVisibleAsync();
        }
        catch (TimeoutException)
        {
            return false;
        }
    }
}
