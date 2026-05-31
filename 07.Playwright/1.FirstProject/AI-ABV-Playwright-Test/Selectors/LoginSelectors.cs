namespace AI_ABV_Playwright_Test.Selectors;

public static class LoginSelectors
{
    // The id and names of ABV.bg login elements
    public const string UsernameInput = "input#username";
    public const string PasswordInput = "input#password";
    public const string LoginButton = "input#loginBut";
    public const string GdprAcceptButton = "button.fc-primary-button, .fc-button.fc-cta-consent, button.didomi-components-button--color-first-action"; // Added Google consent buttons
    
    // An alternative if the ID is different
    // abv.bg specific iframe or standard login
    // ABV uses a main form
}
