using System.Collections.Generic;

namespace AIQAAssistant.Application.Models;

public class BugReport
{
    public string Title { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public List<string> Preconditions { get; set; } = new();
    public List<string> StepsToReproduce { get; set; } = new();
    public string ActualResult { get; set; } = string.Empty;
    public string ExpectedResult { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string PossibleRootCause { get; set; } = string.Empty;
    public List<string> SuggestedAdditionalTests { get; set; } = new();
}
