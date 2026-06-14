namespace AIQAAssistant.Application.Models;

public class AutomationSkeleton
{
    public string TestClass { get; set; } = string.Empty;
    public string PageObjectClass { get; set; } = string.Empty;
    public string SelectorsFile { get; set; } = string.Empty;
    public string TestDataFile { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}
