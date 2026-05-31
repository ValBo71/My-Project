using AI_ABV_Playwright_Test.Selectors;
using Microsoft.Playwright;

namespace AI_ABV_Playwright_Test.Pages;

public class LoginPage
{
    private readonly IPage _page;

    public LoginPage(IPage page)
    {
        _page = page;
    }

    public async Task GotoAsync()
    {
        await _page.GotoAsync("/");
        await AcceptGdprIfPresentAsync();
    }

    public async Task AcceptGdprIfPresentAsync()
    {
        try
        {
            var btn = _page.Locator(LoginSelectors.GdprAcceptButton).First;
            await btn.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 5000 });
            await btn.ClickAsync();
        }
        catch 
        {
            // Ignore if GDPR does not appear
        }
    }

    public async Task LoginAsync(string username, string password)
    {
        await _page.FillAsync(LoginSelectors.UsernameInput, username);
        await _page.FillAsync(LoginSelectors.PasswordInput, password);
        await _page.ClickAsync(LoginSelectors.LoginButton);

        try 
        {
            var fwdBtn = _page.GetByText("Напред", new() { Exact = true }).First;
            await fwdBtn.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 5000 });
            await fwdBtn.ClickAsync();
            await Task.Delay(2000);
        }
        catch 
        { 
            // Interstitial may not appear
        }

        try 
        {
            var mailBtn = _page.Locator("text='АБВ поща'").First;
            await mailBtn.ClickAsync(new LocatorClickOptions { Timeout = 3000 });
        }
        catch 
        { 
            // May already be navigating to mail
        }
        
        await _page.WaitForLoadStateAsync(LoadState.DOMContentLoaded);
    }
}
