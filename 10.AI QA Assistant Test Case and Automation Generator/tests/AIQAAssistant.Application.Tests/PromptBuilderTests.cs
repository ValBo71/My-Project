using NUnit.Framework;
using AIQAAssistant.Application.Helpers;
using AIQAAssistant.Domain.Enums;

namespace AIQAAssistant.Application.Tests;

[TestFixture]
public class PromptBuilderTests
{
    [Test]
    public void Build_TestCase_ReturnsExpectedSystemAndUserPrompts()
    {
        var (system, user) = PromptBuilder.Build(QueryType.TestCase, "As a user I want to login");
        
        Assert.That(system, Contains.Substring("You are an expert Senior QA Engineer"));
        Assert.That(user, Contains.Substring("As a user I want to login"));
    }

    [Test]
    public void Build_EdgeCase_ReturnsExpectedPrompts()
    {
        var (system, user) = PromptBuilder.Build(QueryType.EdgeCase, "Requirement text");

        Assert.That(system, Contains.Substring("identify hidden edge cases"));
        Assert.That(user, Contains.Substring("Requirement text"));
    }

    [Test]
    public void Build_ApiTest_ReturnsExpectedPrompts()
    {
        var (system, user) = PromptBuilder.Build(QueryType.ApiTest, "POST /api/users", "{ \"name\": \"test\" }");

        Assert.That(system, Contains.Substring("specializing in API testing"));
        Assert.That(user, Contains.Substring("POST /api/users"));
        Assert.That(user, Contains.Substring("{ \"name\": \"test\" }"));
    }
}
