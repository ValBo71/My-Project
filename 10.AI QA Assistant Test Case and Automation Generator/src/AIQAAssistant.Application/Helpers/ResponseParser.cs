using System;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace AIQAAssistant.Application.Helpers;

public static class ResponseParser
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static T Parse<T>(string rawResponse)
    {
        if (string.IsNullOrWhiteSpace(rawResponse))
        {
            throw new ArgumentException("Response cannot be null or empty", nameof(rawResponse));
        }

        string cleaned = CleanResponse(rawResponse);
        try
        {
            var result = JsonSerializer.Deserialize<T>(cleaned, Options);
            if (result == null)
            {
                throw new Exception("Deserialization returned null.");
            }
            return result;
        }
        catch (JsonException ex)
        {
            throw new Exception($"Failed to parse JSON. Raw output was: {rawResponse}. Error: {ex.Message}", ex);
        }
    }

    private static string CleanResponse(string rawResponse)
    {
        string trimmed = rawResponse.Trim();

        // Matches ```json <content> ``` or ``` <content> ``` case-insensitively
        var match = Regex.Match(trimmed, @"^```(?:json)?\s*(.*?)\s*```$", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups[1].Value.Trim();
        }

        return trimmed;
    }
}
