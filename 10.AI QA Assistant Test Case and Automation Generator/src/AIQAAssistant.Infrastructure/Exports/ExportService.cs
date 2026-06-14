using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Application.Models;
using AIQAAssistant.Application.Helpers;
using AIQAAssistant.Domain.Entities;
using AIQAAssistant.Domain.Enums;
using Xceed.Words.NET;
using Xceed.Document.NET;

namespace AIQAAssistant.Infrastructure.Exports;

public class ExportService : IExportService
{
    public Task<byte[]> ExportAsync(HistoryRecord record, string format)
    {
        return format.ToLowerInvariant() switch
        {
            "json" => Task.FromResult(ExportToJson(record)),
            "markdown" => Task.FromResult(ExportToMarkdown(record)),
            "csv" => Task.FromResult(ExportToCsv(record)),
            "docx" => Task.FromResult(ExportToDocx(record)),
            _ => throw new ArgumentException($"Unsupported export format: {format}", nameof(format))
        };
    }

    private byte[] ExportToJson(HistoryRecord record)
    {
        // Pretty print the JSON
        using var jsonDoc = JsonDocument.Parse(record.OutputResult);
        var bytes = JsonSerializer.SerializeToUtf8Bytes(jsonDoc, new JsonSerializerOptions { WriteIndented = true });
        return bytes;
    }

    private byte[] ExportToMarkdown(HistoryRecord record)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"# AI QA Assistant - {record.Type} Export");
        sb.AppendLine($"*Generated on: {record.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC*\n");

        switch (record.Type)
        {
            case QueryType.TestCase:
                var testCasesObj = ResponseParser.Parse<TestCaseResponse>(record.OutputResult);
                sb.AppendLine($"## Feature: {testCasesObj.Feature}");
                sb.AppendLine($"{testCasesObj.Summary}\n");
                foreach (var tc in testCasesObj.TestCases)
                {
                    sb.AppendLine($"### [{tc.Id}] {tc.Title}");
                    sb.AppendLine($"- **Type:** {tc.Type}");
                    sb.AppendLine($"- **Priority:** {tc.Priority}");
                    sb.AppendLine($"- **Preconditions:**");
                    foreach (var p in tc.Preconditions) sb.AppendLine($"  - {p}");
                    sb.AppendLine($"- **Steps:**");
                    for (int i = 0; i < tc.Steps.Count; i++) sb.AppendLine($"  {i + 1}. {tc.Steps[i]}");
                    sb.AppendLine($"- **Expected Result:** {tc.ExpectedResult}");
                    sb.AppendLine($"- **Test Data:**");
                    foreach (var td in tc.TestData) sb.AppendLine($"  - `{td.Key}`: {td.Value}");
                    sb.AppendLine();
                }
                break;

            case QueryType.EdgeCase:
                var edgeCases = ResponseParser.Parse<List<EdgeCase>>(record.OutputResult);
                foreach (var ec in edgeCases)
                {
                    sb.AppendLine($"### [{ec.Id}] {ec.Scenario}");
                    sb.AppendLine($"- **Priority:** {ec.Priority}");
                    sb.AppendLine($"- **Description:** {ec.Description}");
                    sb.AppendLine($"- **Impact:** {ec.Impact}\n");
                }
                break;

            case QueryType.ApiTest:
                var apiScenarios = ResponseParser.Parse<List<ApiTestScenario>>(record.OutputResult);
                sb.AppendLine("| Category | Scenario | Request Verification | Response Verification | Expected Status |");
                sb.AppendLine("|---|---|---|---|---|");
                foreach (var scenario in apiScenarios)
                {
                    sb.AppendLine($"| {scenario.Category} | {scenario.Scenario} | {scenario.RequestVerification} | {scenario.ResponseVerification} | {scenario.ExpectedStatusCode} |");
                }
                break;

            case QueryType.Automation:
                var skeleton = ResponseParser.Parse<AutomationSkeleton>(record.OutputResult);
                sb.AppendLine("## Explanation");
                sb.AppendLine($"{skeleton.Explanation}\n");
                sb.AppendLine("## Test Class");
                sb.AppendLine("```csharp");
                sb.AppendLine(skeleton.TestClass);
                sb.AppendLine("```\n");
                sb.AppendLine("## Page Object");
                sb.AppendLine("```csharp");
                sb.AppendLine(skeleton.PageObjectClass);
                sb.AppendLine("```\n");
                sb.AppendLine("## Selectors JSON");
                sb.AppendLine("```json");
                sb.AppendLine(skeleton.SelectorsFile);
                sb.AppendLine("```\n");
                sb.AppendLine("## Test Data");
                sb.AppendLine("```csharp");
                sb.AppendLine(skeleton.TestDataFile);
                sb.AppendLine("```");
                break;

            case QueryType.BugReport:
                var bug = ResponseParser.Parse<BugReport>(record.OutputResult);
                sb.AppendLine($"## Bug: {bug.Title}");
                sb.AppendLine($"- **Severity:** {bug.Severity}");
                sb.AppendLine($"- **Priority:** {bug.Priority}");
                sb.AppendLine($"- **Environment:** {bug.Environment}\n");
                sb.AppendLine("### Preconditions");
                foreach (var p in bug.Preconditions) sb.AppendLine($"- {p}");
                sb.AppendLine("\n### Steps to Reproduce");
                for (int i = 0; i < bug.StepsToReproduce.Count; i++) sb.AppendLine($"{i + 1}. {bug.StepsToReproduce[i]}");
                sb.AppendLine($"\n**Actual Result:** {bug.ActualResult}");
                sb.AppendLine($"**Expected Result:** {bug.ExpectedResult}\n");
                sb.AppendLine($"### Possible Root Cause");
                sb.AppendLine(bug.PossibleRootCause);
                sb.AppendLine("\n### Suggested Additional Tests");
                foreach (var t in bug.SuggestedAdditionalTests) sb.AppendLine($"- {t}");
                break;
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private byte[] ExportToCsv(HistoryRecord record)
    {
        var sb = new StringBuilder();

        switch (record.Type)
        {
            case QueryType.TestCase:
                sb.AppendLine("ID,Title,Type,Priority,Preconditions,Steps,ExpectedResult,TestData");
                var testCasesObj = ResponseParser.Parse<TestCaseResponse>(record.OutputResult);
                foreach (var tc in testCasesObj.TestCases)
                {
                    string preconditions = EscapeCsvField(string.Join("\n", tc.Preconditions));
                    string steps = EscapeCsvField(string.Join("\n", tc.Steps));
                    var testDataList = new List<string>();
                    foreach (var td in tc.TestData) testDataList.Add($"{td.Key}: {td.Value}");
                    string testData = EscapeCsvField(string.Join("; ", testDataList));

                    sb.AppendLine($"{EscapeCsvField(tc.Id)},{EscapeCsvField(tc.Title)},{EscapeCsvField(tc.Type)},{EscapeCsvField(tc.Priority)},{preconditions},{steps},{EscapeCsvField(tc.ExpectedResult)},{testData}");
                }
                break;

            case QueryType.EdgeCase:
                sb.AppendLine("ID,Scenario,Description,Impact,Priority");
                var edgeCases = ResponseParser.Parse<List<EdgeCase>>(record.OutputResult);
                foreach (var ec in edgeCases)
                {
                    sb.AppendLine($"{EscapeCsvField(ec.Id)},{EscapeCsvField(ec.Scenario)},{EscapeCsvField(ec.Description)},{EscapeCsvField(ec.Impact)},{EscapeCsvField(ec.Priority)}");
                }
                break;

            case QueryType.ApiTest:
                sb.AppendLine("Category,Scenario,RequestVerification,ResponseVerification,ExpectedStatusCode");
                var apiScenarios = ResponseParser.Parse<List<ApiTestScenario>>(record.OutputResult);
                foreach (var scenario in apiScenarios)
                {
                    sb.AppendLine($"{EscapeCsvField(scenario.Category)},{EscapeCsvField(scenario.Scenario)},{EscapeCsvField(scenario.RequestVerification)},{EscapeCsvField(scenario.ResponseVerification)},{scenario.ExpectedStatusCode}");
                }
                break;

            case QueryType.Automation:
                sb.AppendLine("Component,Code");
                var skeleton = ResponseParser.Parse<AutomationSkeleton>(record.OutputResult);
                sb.AppendLine($"Explanation,{EscapeCsvField(skeleton.Explanation)}");
                sb.AppendLine($"TestClass,{EscapeCsvField(skeleton.TestClass)}");
                sb.AppendLine($"PageObjectClass,{EscapeCsvField(skeleton.PageObjectClass)}");
                sb.AppendLine($"SelectorsFile,{EscapeCsvField(skeleton.SelectorsFile)}");
                sb.AppendLine($"TestDataFile,{EscapeCsvField(skeleton.TestDataFile)}");
                break;

            case QueryType.BugReport:
                sb.AppendLine("Field,Value");
                var bug = ResponseParser.Parse<BugReport>(record.OutputResult);
                sb.AppendLine($"Title,{EscapeCsvField(bug.Title)}");
                sb.AppendLine($"Environment,{EscapeCsvField(bug.Environment)}");
                sb.AppendLine($"Severity,{EscapeCsvField(bug.Severity)}");
                sb.AppendLine($"Priority,{EscapeCsvField(bug.Priority)}");
                sb.AppendLine($"Preconditions,{EscapeCsvField(string.Join("\n", bug.Preconditions))}");
                sb.AppendLine($"StepsToReproduce,{EscapeCsvField(string.Join("\n", bug.StepsToReproduce))}");
                sb.AppendLine($"ActualResult,{EscapeCsvField(bug.ActualResult)}");
                sb.AppendLine($"ExpectedResult,{EscapeCsvField(bug.ExpectedResult)}");
                sb.AppendLine($"PossibleRootCause,{EscapeCsvField(bug.PossibleRootCause)}");
                sb.AppendLine($"SuggestedAdditionalTests,{EscapeCsvField(string.Join("\n", bug.SuggestedAdditionalTests))}");
                break;
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private byte[] ExportToDocx(HistoryRecord record)
    {
        using var stream = new MemoryStream();
        using var doc = DocX.Create(stream);

        // Add a beautiful Title
        var pTitle = doc.InsertParagraph($"AI QA Assistant - {record.Type} Report");
        pTitle.FontSize(20).Bold().Color(Xceed.Drawing.Color.DarkSlateBlue).Alignment = Alignment.center;
        
        var pDate = doc.InsertParagraph($"Generated on: {record.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC\n");
        pDate.Alignment = Alignment.center;

        switch (record.Type)
        {
            case QueryType.TestCase:
                var testCasesObj = ResponseParser.Parse<TestCaseResponse>(record.OutputResult);
                
                var pFeature = doc.InsertParagraph($"Feature: {testCasesObj.Feature}");
                pFeature.FontSize(14).Bold().SpacingBefore(10);
                doc.InsertParagraph(testCasesObj.Summary).SpacingAfter(15);

                foreach (var tc in testCasesObj.TestCases)
                {
                    var pTcTitle = doc.InsertParagraph($"[{tc.Id}] {tc.Title}");
                    pTcTitle.FontSize(12).Bold().SpacingBefore(10);
                    
                    var table = doc.AddTable(6, 2);
                    table.Alignment = Alignment.center;
                    
                    table.Rows[0].Cells[0].Paragraphs[0].Append("Type").Bold();
                    table.Rows[0].Cells[1].Paragraphs[0].Append(tc.Type);
                    
                    table.Rows[1].Cells[0].Paragraphs[0].Append("Priority").Bold();
                    table.Rows[1].Cells[1].Paragraphs[0].Append(tc.Priority);

                    table.Rows[2].Cells[0].Paragraphs[0].Append("Preconditions").Bold();
                    table.Rows[2].Cells[1].Paragraphs[0].Append(string.Join("\n", tc.Preconditions));

                    table.Rows[3].Cells[0].Paragraphs[0].Append("Steps").Bold();
                    table.Rows[3].Cells[1].Paragraphs[0].Append(string.Join("\n", tc.Steps));

                    table.Rows[4].Cells[0].Paragraphs[0].Append("Expected Result").Bold();
                    table.Rows[4].Cells[1].Paragraphs[0].Append(tc.ExpectedResult);

                    var testDataStr = new List<string>();
                    foreach (var td in tc.TestData) testDataStr.Add($"{td.Key}: {td.Value}");
                    table.Rows[5].Cells[0].Paragraphs[0].Append("Test Data").Bold();
                    table.Rows[5].Cells[1].Paragraphs[0].Append(string.Join("\n", testDataStr));

                    doc.InsertTable(table);
                    doc.InsertParagraph().SpacingAfter(10);
                }
                break;

            case QueryType.EdgeCase:
                var edgeCases = ResponseParser.Parse<List<EdgeCase>>(record.OutputResult);
                foreach (var ec in edgeCases)
                {
                    var pEcTitle = doc.InsertParagraph($"[{ec.Id}] {ec.Scenario}");
                    pEcTitle.FontSize(12).Bold().SpacingBefore(10);
                    
                    var table = doc.AddTable(3, 2);
                    table.Rows[0].Cells[0].Paragraphs[0].Append("Priority").Bold();
                    table.Rows[0].Cells[1].Paragraphs[0].Append(ec.Priority);

                    table.Rows[1].Cells[0].Paragraphs[0].Append("Description").Bold();
                    table.Rows[1].Cells[1].Paragraphs[0].Append(ec.Description);

                    table.Rows[2].Cells[0].Paragraphs[0].Append("Impact").Bold();
                    table.Rows[2].Cells[1].Paragraphs[0].Append(ec.Impact);

                    doc.InsertTable(table);
                    doc.InsertParagraph().SpacingAfter(10);
                }
                break;

            case QueryType.ApiTest:
                var apiScenarios = ResponseParser.Parse<List<ApiTestScenario>>(record.OutputResult);
                var apiTable = doc.AddTable(apiScenarios.Count + 1, 5);
                
                apiTable.Rows[0].Cells[0].Paragraphs[0].Append("Category").Bold();
                apiTable.Rows[0].Cells[1].Paragraphs[0].Append("Scenario").Bold();
                apiTable.Rows[0].Cells[2].Paragraphs[0].Append("Request Verification").Bold();
                apiTable.Rows[0].Cells[3].Paragraphs[0].Append("Response Verification").Bold();
                apiTable.Rows[0].Cells[4].Paragraphs[0].Append("Expected Status").Bold();

                for (int i = 0; i < apiScenarios.Count; i++)
                {
                    var scenario = apiScenarios[i];
                    apiTable.Rows[i + 1].Cells[0].Paragraphs[0].Append(scenario.Category);
                    apiTable.Rows[i + 1].Cells[1].Paragraphs[0].Append(scenario.Scenario);
                    apiTable.Rows[i + 1].Cells[2].Paragraphs[0].Append(scenario.RequestVerification);
                    apiTable.Rows[i + 1].Cells[3].Paragraphs[0].Append(scenario.ResponseVerification);
                    apiTable.Rows[i + 1].Cells[4].Paragraphs[0].Append(scenario.ExpectedStatusCode.ToString());
                }

                doc.InsertTable(apiTable);
                break;

            case QueryType.Automation:
                var skeleton = ResponseParser.Parse<AutomationSkeleton>(record.OutputResult);
                
                var pExpTitle = doc.InsertParagraph("Explanation");
                pExpTitle.FontSize(14).Bold().SpacingBefore(10);
                doc.InsertParagraph(skeleton.Explanation);

                var pTestTitle = doc.InsertParagraph("Test Class");
                pTestTitle.FontSize(14).Bold().SpacingBefore(15);
                doc.InsertParagraph(skeleton.TestClass).Font("Courier New").FontSize(10);

                var pPoTitle = doc.InsertParagraph("Page Object Class");
                pPoTitle.FontSize(14).Bold().SpacingBefore(15);
                doc.InsertParagraph(skeleton.PageObjectClass).Font("Courier New").FontSize(10);

                var pSelTitle = doc.InsertParagraph("Selectors (JSON)");
                pSelTitle.FontSize(14).Bold().SpacingBefore(15);
                doc.InsertParagraph(skeleton.SelectorsFile).Font("Courier New").FontSize(10);

                var pDataTitle = doc.InsertParagraph("Test Data File");
                pDataTitle.FontSize(14).Bold().SpacingBefore(15);
                doc.InsertParagraph(skeleton.TestDataFile).Font("Courier New").FontSize(10);
                break;

            case QueryType.BugReport:
                var bug = ResponseParser.Parse<BugReport>(record.OutputResult);
                
                var pBugTitle = doc.InsertParagraph($"Bug: {bug.Title}");
                pBugTitle.FontSize(14).Bold().SpacingBefore(10);
                
                var bugTable = doc.AddTable(9, 2);
                bugTable.Rows[0].Cells[0].Paragraphs[0].Append("Severity").Bold();
                bugTable.Rows[0].Cells[1].Paragraphs[0].Append(bug.Severity);

                bugTable.Rows[1].Cells[0].Paragraphs[0].Append("Priority").Bold();
                bugTable.Rows[1].Cells[1].Paragraphs[0].Append(bug.Priority);

                bugTable.Rows[2].Cells[0].Paragraphs[0].Append("Environment").Bold();
                bugTable.Rows[2].Cells[1].Paragraphs[0].Append(bug.Environment);

                bugTable.Rows[3].Cells[0].Paragraphs[0].Append("Preconditions").Bold();
                bugTable.Rows[3].Cells[1].Paragraphs[0].Append(string.Join("\n", bug.Preconditions));

                bugTable.Rows[4].Cells[0].Paragraphs[0].Append("Steps to Reproduce").Bold();
                bugTable.Rows[4].Cells[1].Paragraphs[0].Append(string.Join("\n", bug.StepsToReproduce));

                bugTable.Rows[5].Cells[0].Paragraphs[0].Append("Actual Result").Bold();
                bugTable.Rows[5].Cells[1].Paragraphs[0].Append(bug.ActualResult);

                bugTable.Rows[6].Cells[0].Paragraphs[0].Append("Expected Result").Bold();
                bugTable.Rows[6].Cells[1].Paragraphs[0].Append(bug.ExpectedResult);

                bugTable.Rows[7].Cells[0].Paragraphs[0].Append("Possible Root Cause").Bold();
                bugTable.Rows[7].Cells[1].Paragraphs[0].Append(bug.PossibleRootCause);

                bugTable.Rows[8].Cells[0].Paragraphs[0].Append("Suggested Additional Tests").Bold();
                bugTable.Rows[8].Cells[1].Paragraphs[0].Append(string.Join("\n", bug.SuggestedAdditionalTests));

                doc.InsertTable(bugTable);
                break;
        }

        doc.Save();
        return stream.ToArray();
    }

    private string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field)) return "\"\"";
        
        // Replace double quotes with double-double quotes
        string escaped = field.Replace("\"", "\"\"");
        
        // Wrap in quotes if it contains commas, quotes, or newlines
        if (escaped.Contains(",") || escaped.Contains("\"") || escaped.Contains("\n") || escaped.Contains("\r"))
        {
            return $"\"{escaped}\"";
        }
        return escaped;
    }
}
