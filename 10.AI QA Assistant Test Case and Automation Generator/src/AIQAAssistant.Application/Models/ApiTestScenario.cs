namespace AIQAAssistant.Application.Models;

public class ApiTestScenario
{
    public string Category { get; set; } = string.Empty;
    public string Scenario { get; set; } = string.Empty;
    public string RequestVerification { get; set; } = string.Empty;
    public string ResponseVerification { get; set; } = string.Empty;
    public int ExpectedStatusCode { get; set; }
}
