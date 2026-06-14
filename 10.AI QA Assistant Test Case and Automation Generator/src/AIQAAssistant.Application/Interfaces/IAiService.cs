using System.Collections.Generic;
using System.Threading.Tasks;
using AIQAAssistant.Application.Models;

namespace AIQAAssistant.Application.Interfaces;

public interface IAiService
{
    Task<TestCaseResponse> GenerateTestCasesAsync(string requirement);
    Task<List<EdgeCase>> GenerateEdgeCasesAsync(string requirement);
    Task<List<ApiTestScenario>> GenerateApiScenariosAsync(string endpoint, string payload);
    Task<AutomationSkeleton> GenerateAutomationSkeletonAsync(string requirement);
    Task<BugReport> GenerateBugReportAsync(string description);
}
