using AIQAAssistant.Domain.Enums;

namespace AIQAAssistant.Application.Helpers;

public static class PromptBuilder
{
    public static (string SystemPrompt, string UserPrompt) Build(QueryType type, string input, string? payload = null)
    {
        return type switch
        {
            QueryType.TestCase => (GetTestCaseSystemPrompt(), GetTestCaseUserPrompt(input)),
            QueryType.EdgeCase => (GetEdgeCaseSystemPrompt(), GetEdgeCaseUserPrompt(input)),
            QueryType.ApiTest => (GetApiTestSystemPrompt(), GetApiTestUserPrompt(input, payload ?? string.Empty)),
            QueryType.Automation => (GetAutomationSystemPrompt(), GetAutomationUserPrompt(input)),
            QueryType.BugReport => (GetBugReportSystemPrompt(), GetBugReportUserPrompt(input)),
            _ => throw new System.ArgumentOutOfRangeException(nameof(type), type, null)
        };
    }

    private static string GetTestCaseSystemPrompt() =>
        "You are an expert Senior QA Engineer. Your task is to analyze the provided user story/requirement and generate structured test cases.\n" +
        "You MUST respond ONLY with a valid JSON object matching the schema below. Do not wrap the JSON in ```json markdown blocks, and do not include any other conversational text.\n\n" +
        "JSON Schema:\n" +
        "{\n" +
        "  \"feature\": \"Name of the feature\",\n" +
        "  \"summary\": \"Brief summary of the requirement\",\n" +
        "  \"testCases\": [\n" +
        "    {\n" +
        "      \"id\": \"TC-001\",\n" +
        "      \"title\": \"Clear description of the test case\",\n" +
        "      \"type\": \"Positive | Negative | Boundary | Security | UI | API | Regression\",\n" +
        "      \"priority\": \"High | Medium | Low\",\n" +
        "      \"preconditions\": [\"List of preconditions required to execute this test\"],\n" +
        "      \"steps\": [\"Step 1\", \"Step 2\", \"Step 3\"],\n" +
        "      \"testData\": {\n" +
        "        \"key1\": \"value1\",\n" +
        "        \"key2\": \"value2\"\n" +
        "      },\n" +
        "      \"expectedResult\": \"Detailed description of the expected outcome\"\n" +
        "    }\n" +
        "  ]\n" +
        "}";

    private static string GetTestCaseUserPrompt(string input) =>
        $"Generate test cases for the following requirement:\n\"{input}\"";

    private static string GetEdgeCaseSystemPrompt() =>
        "You are an expert Senior QA Engineer. Your task is to analyze the provided requirement and identify hidden edge cases, corner cases, and unusual usage scenarios that are often missed.\n" +
        "You MUST respond ONLY with a valid JSON array matching the schema below. Do not wrap the JSON in markdown blocks, and do not include any other text.\n\n" +
        "JSON Schema:\n" +
        "[\n" +
        "  {\n" +
        "    \"id\": \"EC-001\",\n" +
        "    \"scenario\": \"Short name of the edge case\",\n" +
        "    \"description\": \"Detailed explanation of what happens and why it is an edge case\",\n" +
        "    \"impact\": \"What is the consequence on the system/user experience if this is not handled\",\n" +
        "    \"priority\": \"High | Medium | Low\"\n" +
        "  }\n" +
        "]";

    private static string GetEdgeCaseUserPrompt(string input) =>
        $"Analyze the following requirement for edge cases:\n\"{input}\"";

    private static string GetApiTestSystemPrompt() =>
        "You are an expert Senior QA Engineer specializing in API testing. Your task is to analyze the API endpoint and example payload, then generate comprehensive API test scenarios.\n" +
        "You MUST respond ONLY with a valid JSON array matching the schema below. Do not wrap the JSON in markdown blocks, and do not include any other text.\n\n" +
        "JSON Schema:\n" +
        "[\n" +
        "  {\n" +
        "    \"category\": \"Valid request | Missing required fields | Invalid field formats | Duplicate data | Unauthorized request | Forbidden request | Invalid HTTP method | Invalid payload | Boundary values | Security (SQL injection / XSS) | Response schema verification | Status code validation\",\n" +
        "    \"scenario\": \"Describe the test scenario\",\n" +
        "    \"requestVerification\": \"What to send or check in the request headers/body/params\",\n" +
        "    \"responseVerification\": \"What to verify in the response body or headers\",\n" +
        "    \"expectedStatusCode\": 200\n" +
        "  }\n" +
        "]";

    private static string GetApiTestUserPrompt(string endpoint, string payload) =>
        $"Endpoint: {endpoint}\nPayload:\n{payload}";

    private static string GetAutomationSystemPrompt() =>
        "You are a Senior QA Automation Engineer. Your task is to generate a clean Playwright C# + NUnit automation skeleton for the given requirement, following the Page Object Model (POM) pattern.\n" +
        "You must split the output into: Test Class, Page Object Class, Selectors, and Test Data.\n" +
        "All selectors must be separated into a clean JSON structure to allow easy maintenance.\n" +
        "You MUST respond ONLY with a valid JSON object matching the schema below. Do not wrap the JSON in markdown blocks, and do not include any other text.\n\n" +
        "JSON Schema:\n" +
        "{\n" +
        "  \"testClass\": \"C# NUnit Test Class code as string\",\n" +
        "  \"pageObjectClass\": \"C# Playwright Page Object Class code as string\",\n" +
        "  \"selectorsFile\": \"JSON representation of selectors as string (e.g. { \\\"loginButton\\\": \\\"#login-btn\\\" })\",\n" +
        "  \"testDataFile\": \"JSON or Class representation of test data as string\",\n" +
        "  \"explanation\": \"Brief explanation of the setup and instructions on how to use it\"\n" +
        "}";

    private static string GetAutomationUserPrompt(string input) =>
        $"Generate the Playwright + C# + NUnit POM skeleton for:\nRequirement: \"{input}\"";

    private static string GetBugReportSystemPrompt() =>
        "You are a Senior QA Engineer. Your task is to turn the provided informal bug description into a structured, highly professional Bug Report template.\n" +
        "You MUST respond ONLY with a valid JSON object matching the schema below. Do not wrap the JSON in markdown blocks, and do not include any other text.\n\n" +
        "JSON Schema:\n" +
        "{\n" +
        "  \"title\": \"Structured bug title (e.g. [Component] Action - Defect)\",\n" +
        "  \"environment\": \"Recommended environment for reproducing (OS, Browser, etc.)\",\n" +
        "  \"preconditions\": [\"List of preconditions\"],\n" +
        "  \"stepsToReproduce\": [\"Step 1\", \"Step 2\", \"Step 3\"],\n" +
        "  \"actualResult\": \"Description of the actual incorrect behavior\",\n" +
        "  \"expectedResult\": \"Description of the expected correct behavior\",\n" +
        "  \"severity\": \"Blocker | Critical | Major | Minor\",\n" +
        "  \"priority\": \"High | Medium | Low\",\n" +
        "  \"possibleRootCause\": \"Technical analysis of what might be causing the issue\",\n" +
        "  \"suggestedAdditionalTests\": [\"Additional test cases that should be executed to verify related areas\"]\n" +
        "}";

    private static string GetBugReportUserPrompt(string input) =>
        $"Bug description: \"{input}\"";
}
