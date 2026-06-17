namespace AI_ABV_Playwright_Test.Selectors;

public static class InboxSelectors
{
    // The "Inbox" (Кутия) link in the side menu
    public const string InboxMenuLink = "text=Кутия";
    
    // The logged in user's email is visible
    public static string UserAvatar(string username) => $"text={username}@abv.bg";
}
