using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using AIQAAssistant.Domain.Entities;
using AIQAAssistant.Domain.Enums;
using AIQAAssistant.Infrastructure.Exports;

namespace AIQAAssistant.Application.Tests;

[TestFixture]
public class ExportServiceTests
{
    private ExportService _exportService = null!;

    [SetUp]
    public void SetUp()
    {
        _exportService = new ExportService();
    }

    [Test]
    public async Task ExportAsync_JsonFormat_ReturnsValidBytes()
    {
        // Arrange
        var record = new HistoryRecord
        {
            Type = QueryType.TestCase,
            InputData = "Login",
            OutputResult = "{ \"feature\": \"Login\", \"summary\": \"Test summary\", \"testCases\": [] }"
        };

        // Act
        var result = await _exportService.ExportAsync(record, "json");

        // Assert
        Assert.That(result, Is.Not.Null);
        var jsonStr = Encoding.UTF8.GetString(result);
        Assert.That(jsonStr, Contains.Substring("\"feature\": \"Login\""));
    }

    [Test]
    public async Task ExportAsync_MarkdownFormat_ReturnsValidBytes()
    {
        // Arrange
        var record = new HistoryRecord
        {
            Type = QueryType.TestCase,
            InputData = "Login",
            OutputResult = "{ \"feature\": \"Login\", \"summary\": \"Test summary\", \"testCases\": [] }"
        };

        // Act
        var result = await _exportService.ExportAsync(record, "markdown");

        // Assert
        Assert.That(result, Is.Not.Null);
        var mdStr = Encoding.UTF8.GetString(result);
        Assert.That(mdStr, Contains.Substring("# AI QA Assistant"));
        Assert.That(mdStr, Contains.Substring("Feature: Login"));
    }
}
