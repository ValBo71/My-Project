using Allure.Net.Commons;
using System;
using System.Text;
using System.Threading.Tasks;

namespace AutomationExercise.ApiTests.Helpers
{
    public static class AllureHelper
    {
        public static void AttachRequest(string method, string url, string? headers = null, string? body = null)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Method: {method}");
            sb.AppendLine($"URL: {url}");
            if (!string.IsNullOrEmpty(headers))
            {
                sb.AppendLine("Headers:");
                sb.AppendLine(headers);
            }
            if (!string.IsNullOrEmpty(body))
            {
                sb.AppendLine("Body / Parameters:");
                sb.AppendLine(body);
            }

            AllureApi.AddAttachment("API Request Details", "text/plain", sb.ToString());
        }

        public static void AttachResponse(int statusCode, string? headers = null, string? body = null)
        {
            AllureApi.AddAttachment("API Response Details", "application/json", body ?? string.Empty);
        }

        public static void LogStep(string stepName, Action action)
        {
            AllureApi.Step(stepName, action);
        }

        public static async Task LogStepAsync(string stepName, Func<Task> action)
        {
            await AllureApi.Step(stepName, action);
        }
    }
}
