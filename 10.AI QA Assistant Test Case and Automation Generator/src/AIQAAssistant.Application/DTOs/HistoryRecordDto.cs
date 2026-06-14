using System;
using AIQAAssistant.Domain.Enums;

namespace AIQAAssistant.Application.DTOs;

public class HistoryRecordDto
{
    public Guid Id { get; set; }
    public QueryType Type { get; set; }
    public string InputData { get; set; } = string.Empty;
    public string OutputResult { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
