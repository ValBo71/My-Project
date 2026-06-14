using System.Collections.Generic;

namespace AIQAAssistant.Application.Models;

public class TestCaseResponse
{
    public string Feature { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<TestCase> TestCases { get; set; } = new();
}
