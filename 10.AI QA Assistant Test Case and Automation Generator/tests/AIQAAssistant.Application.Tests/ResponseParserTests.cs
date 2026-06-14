using System;
using NUnit.Framework;
using AIQAAssistant.Application.Helpers;
using AIQAAssistant.Application.Models;

namespace AIQAAssistant.Application.Tests;

[TestFixture]
public class ResponseParserTests
{
    [Test]
    public void Parse_ValidJson_ReturnsDeserializedObject()
    {
        string raw = "{ \"feature\": \"Login\", \"summary\": \"Desc\", \"testCases\": [] }";
        var result = ResponseParser.Parse<TestCaseResponse>(raw);
        
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Feature, Is.EqualTo("Login"));
        Assert.That(result.Summary, Is.EqualTo("Desc"));
    }

    [Test]
    public void Parse_MarkdownWrappedJson_CleansAndDeserializes()
    {
        string raw = "```json\n{ \"feature\": \"Login\", \"summary\": \"Desc\", \"testCases\": [] }\n```";
        var result = ResponseParser.Parse<TestCaseResponse>(raw);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Feature, Is.EqualTo("Login"));
    }

    [Test]
    public void Parse_MarkdownWrappedNoLanguageJson_CleansAndDeserializes()
    {
        string raw = "```\n{ \"feature\": \"Login\", \"summary\": \"Desc\", \"testCases\": [] }\n```";
        var result = ResponseParser.Parse<TestCaseResponse>(raw);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Feature, Is.EqualTo("Login"));
    }

    [Test]
    public void Parse_InvalidJson_ThrowsException()
    {
        string raw = "{ invalid json }";
        Assert.Throws<Exception>(() => ResponseParser.Parse<TestCaseResponse>(raw));
    }
}
