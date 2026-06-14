using System;
using AIQAAssistant.Domain.Enums;

namespace AIQAAssistant.Domain.Entities;

public class HistoryRecord
{
    public Guid Id { get; set; }
    public QueryType Type { get; set; }
    public string InputData { get; set; } = string.Empty;
    public string OutputResult { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
