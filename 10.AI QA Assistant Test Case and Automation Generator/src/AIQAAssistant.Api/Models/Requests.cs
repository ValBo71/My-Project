namespace AIQAAssistant.Api.Models;

public record TestCaseRequest(string Requirement);

public record EdgeCaseRequest(string Requirement);

public record ApiTestRequest(string Endpoint, string Payload);

public record AutomationRequest(string Requirement);

public record BugReportRequest(string Description);

public record ExportRequest(string Format);
