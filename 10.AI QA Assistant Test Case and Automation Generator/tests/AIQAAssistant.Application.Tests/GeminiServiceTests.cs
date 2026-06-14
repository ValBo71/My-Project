using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Domain.Entities;
using AIQAAssistant.Infrastructure.External;

namespace AIQAAssistant.Application.Tests;

[TestFixture]
public class GeminiServiceTests
{
    private MockHistoryRepository _historyRepo = null!;
    private MockHttpMessageHandler _httpHandler = null!;
    private HttpClient _httpClient = null!;
    private IConfiguration _configuration = null!;

    [SetUp]
    public void SetUp()
    {
        _historyRepo = new MockHistoryRepository();
        _httpHandler = new MockHttpMessageHandler();
        _httpClient = new HttpClient(_httpHandler);
        
        var configSource = new Dictionary<string, string?>
        {
            { "Gemini:ApiKey", "test-api-key" },
            { "Gemini:Model", "gemini-test-model" }
        };
        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configSource)
            .Build();
    }

    [TearDown]
    public void TearDown()
    {
        _httpClient.Dispose();
        _httpHandler.Dispose();
    }

    [Test]
    public async Task GenerateTestCasesAsync_SendsCorrectHttpRequestAndSavesToHistory()
    {
        // Arrange
        var mockGeminiResponse = new
        {
            candidates = new[]
            {
                new
                {
                    content = new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = "{\n  \"feature\": \"Login\",\n  \"summary\": \"Test summary\",\n  \"testCases\": []\n}"
                            }
                        }
                    }
                }
            }
        };

        _httpHandler.SendAsyncFunc = request =>
        {
            Assert.That(request.RequestUri?.ToString(), Is.EqualTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent?key=test-api-key"));
            Assert.That(request.Method, Is.EqualTo(HttpMethod.Post));

            var responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(mockGeminiResponse))
            };
            return Task.FromResult(responseMessage);
        };

        var service = new GeminiClient(_httpClient, _configuration, _historyRepo);

        // Act
        var result = await service.GenerateTestCasesAsync("Requirement payload");

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Feature, Is.EqualTo("Login"));
        Assert.That(_historyRepo.SavedRecords.Count, Is.EqualTo(1));
        Assert.That(_historyRepo.SavedRecords[0].InputData, Is.EqualTo("Requirement payload"));
    }

    private class MockHistoryRepository : IHistoryRepository
    {
        public List<HistoryRecord> SavedRecords { get; } = new();

        public Task<IEnumerable<HistoryRecord>> GetAllAsync() => Task.FromResult<IEnumerable<HistoryRecord>>(SavedRecords);

        public Task<HistoryRecord?> GetByIdAsync(Guid id) => Task.FromResult(SavedRecords.Find(r => r.Id == id));

        public Task<HistoryRecord> AddAsync(HistoryRecord record)
        {
            record.Id = Guid.NewGuid();
            SavedRecords.Add(record);
            return Task.FromResult(record);
        }

        public Task<bool> DeleteAsync(Guid id)
        {
            int removed = SavedRecords.RemoveAll(r => r.Id == id);
            return Task.FromResult(removed > 0);
        }
    }

    private class MockHttpMessageHandler : HttpMessageHandler
    {
        public Func<HttpRequestMessage, Task<HttpResponseMessage>> SendAsyncFunc { get; set; } = null!;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return SendAsyncFunc(request);
        }
    }
}
