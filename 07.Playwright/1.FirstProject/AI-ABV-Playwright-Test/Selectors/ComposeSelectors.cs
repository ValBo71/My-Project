namespace AI_ABV_Playwright_Test.Selectors;

public static class ComposeSelectors
{
    // Write message button is accessible from Inbox (top/left menu)
    public const string WriteMessageButton = "text='Напиши'";
    
    // Elements in the compose area
    public const string FromLabel = "text=От:";
    
    // Identifying the exact fields can be tricky. Using CSS/Placeholder where possible.
    public const string ToInput = "input[placeholder*='До'], input.select2-search__field, input[type='text'], .addressField input"; // We will refine this. Usually GetByPlaceholder is best.
    
    // Or we rely on playwright's powerful text locators
    public const string SubjectInput = "input[name='subject'], input.subject, .subjectField input";
    
    // Body is usually an iframe or a specific textarea
    // ABV uses an iframe for the Rich Text Editor but also has a textarea fallback
    public const string BodyIframe = "iframe.cke_wysiwyg_frame, iframe[title*='editor']";
    public const string BodyTextarea = "textarea[name='body'], .editorField textarea";
    
    // Send button
    public const string SendButton = "text='Изпрати'";
}
