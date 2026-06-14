using System.Collections.Generic;

namespace AIQAAssistant.Application.Models;

public class TestCase
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public List<string> Preconditions { get; set; } = new();
    public List<string> Steps { get; set; } = new();
    public Dictionary<string, string> TestData { get; set; } = new();
    public string ExpectedResult { get; set; } = string.Empty;
}
