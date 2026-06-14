using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Application.Models;
using AIQAAssistant.Application.Helpers;
using AIQAAssistant.Domain.Enums;
using AIQAAssistant.Domain.Entities;

namespace AIQAAssistant.Infrastructure.External;

public class GeminiClient : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly IHistoryRepository _historyRepository;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiClient(HttpClient httpClient, IConfiguration configuration, IHistoryRepository historyRepository)
    {
        _httpClient = httpClient;
        _historyRepository = historyRepository;
        _apiKey = configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
        _model = configuration["Gemini:Model"] ?? "gemini-2.5-flash";
    }

    public async Task<TestCaseResponse> GenerateTestCasesAsync(string requirement)
    {
        string rawJson = await CallGeminiApiAsync(QueryType.TestCase, requirement);
        return ResponseParser.Parse<TestCaseResponse>(rawJson);
    }

    public async Task<List<EdgeCase>> GenerateEdgeCasesAsync(string requirement)
    {
        string rawJson = await CallGeminiApiAsync(QueryType.EdgeCase, requirement);
        return ResponseParser.Parse<List<EdgeCase>>(rawJson);
    }

    public async Task<List<ApiTestScenario>> GenerateApiScenariosAsync(string endpoint, string payload)
    {
        string rawJson = await CallGeminiApiAsync(QueryType.ApiTest, endpoint, payload);
        return ResponseParser.Parse<List<ApiTestScenario>>(rawJson);
    }

    public async Task<AutomationSkeleton> GenerateAutomationSkeletonAsync(string requirement)
    {
        string rawJson = await CallGeminiApiAsync(QueryType.Automation, requirement);
        return ResponseParser.Parse<AutomationSkeleton>(rawJson);
    }

    public async Task<BugReport> GenerateBugReportAsync(string description)
    {
        string rawJson = await CallGeminiApiAsync(QueryType.BugReport, description);
        return ResponseParser.Parse<BugReport>(rawJson);
    }

    private async Task<string> CallGeminiApiAsync(QueryType type, string input, string? payload = null)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException("Gemini API key is not configured. Please add 'Gemini:ApiKey' in appsettings.json or set the 'GEMINI_API_KEY' environment variable.");
        }

        var (systemPrompt, userPrompt) = PromptBuilder.Build(type, input, payload);

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new[]
                    {
                        new { text = userPrompt }
                    }
                }
            },
            systemInstruction = new
            {
                parts = new[]
                {
                    new { text = systemPrompt }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json"
              }
        };

        string url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        var response = await _httpClient.PostAsJsonAsync(url, requestBody);
        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Gemini API request failed with status {response.StatusCode}. Details: {errorContent}");
        }

        var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
        string resultText = jsonResponse
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? throw new Exception("Response text is null");

        // Save execution to database history
        var historyRecord = new HistoryRecord
        {
            Type = type,
            InputData = type == QueryType.ApiTest ? JsonSerializer.Serialize(new { endpoint = input, payload }) : input,
            OutputResult = resultText
        };
        await _historyRepository.AddAsync(historyRecord);

        return resultText;
    }
}
