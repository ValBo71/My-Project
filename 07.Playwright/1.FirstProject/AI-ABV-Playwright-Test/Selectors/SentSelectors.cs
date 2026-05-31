namespace AI_ABV_Playwright_Test.Selectors;

public static class SentSelectors
{
    // The "Sent" (Изпратени) link in the side menu
    public const string SentMenuLink = "text=Изпратени";
    
    // We will use Playwright's :has-text() pseudo-class in the Page Object 
    // to dynamically locate the row in the table, but we can define the table row here:
    public const string EmailRow = "tr"; // Generic table row or "div.messageline" depending on ABV's DOM
    // ABV uses tr elements inside a table for emails.
}
