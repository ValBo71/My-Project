using AI_ABV_Playwright_Test.Selectors;
using Microsoft.Playwright;

namespace AI_ABV_Playwright_Test.Pages;

public class ComposePage
{
    private readonly IPage _page;

    public ComposePage(IPage page)
    {
        _page = page;
    }

    public async Task OpenComposerAsync()
    {
        // 1. Натисни бутона „Напиши“
        // (Using InboxSelectors or ComposeSelectors depending on where the button is. In ABV it can be text "Напиши")
        await _page.Locator(ComposeSelectors.WriteMessageButton).First.ClickAsync();
    }

    public async Task WaitForComposerToLoadAsync()
    {
        // 2. Изчакай да се появи елементът с надпис „От:“ (explicit wait)
        var fromLabel = _page.Locator(ComposeSelectors.FromLabel).First;
        await fromLabel.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 15000 });
        
        // Валидирай, че е видим
        if (!await fromLabel.IsVisibleAsync())
        {
            throw new Exception("The 'От:' label is not visible after waiting.");
        }
    }

    public async Task FillEmailDataAsync(string to, string subject, string body)
    {
        // To
        // Identify the exact input next to the 'До:' label. ABV.bg has dynamic DOM, so we use relative XPath.
        var toInput = _page.Locator("xpath=//*[text()='До:']/following-sibling::*//input | //*[text()='До:']/../following-sibling::*//input").First;
        try
        {
            await toInput.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 5000 });
        }
        catch
        {
            // Fallback to commonly used classes/names if the XPath fails
            toInput = _page.Locator("input[name='to'], input.select2-search__field, .addressField input").First;
        }

        // Use PressSequentiallyAsync to trigger JS events, which ABV uses to create the address 'pill'
        await toInput.ClickAsync();
        await toInput.PressSequentiallyAsync(to, new LocatorPressSequentiallyOptions { Delay = 50 });
        await toInput.PressAsync("Enter");
        await _page.WaitForTimeoutAsync(500); // Allow time for the pill to be created in the UI

        // Subject
        var subjectInput = _page.Locator("xpath=//*[text()='Тема:']/following-sibling::*//input | //*[text()='Тема:']/../following-sibling::*//input").First;
        try
        {
            await subjectInput.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 2000 });
        }
        catch
        {
            subjectInput = _page.Locator(ComposeSelectors.SubjectInput).First;
        }
        
        await subjectInput.ClickAsync();
        await subjectInput.FillAsync(subject);

        // Body
        // ABV has an iframe for the message body (usually CKEditor)
        var iframes = _page.Locator("iframe");
        int count = await iframes.CountAsync();
        bool filled = false;

        for (int i = 0; i < count; i++)
        {
            var iframe = iframes.Nth(i);
            if (await iframe.IsVisibleAsync())
            {
                await iframe.ContentFrame.Locator("body").FillAsync(body);
                filled = true;
                break;
            }
        }

        if (!filled)
        {
            // Fallback to textarea
            await _page.Locator(ComposeSelectors.BodyTextarea).First.FillAsync(body);
        }
    }

    public async Task SendEmailAsync()
    {
        var sendBtn = _page.Locator(ComposeSelectors.SendButton).First;
        await sendBtn.ClickAsync();
        
        // Wait up to 15 seconds for the send button to disappear.
        // This confirms the email was sent and the page is transitioning away from the composer.
        await sendBtn.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Hidden, Timeout = 15000 });
    }
}
