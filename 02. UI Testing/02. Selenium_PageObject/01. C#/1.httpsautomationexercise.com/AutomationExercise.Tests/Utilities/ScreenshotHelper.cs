using OpenQA.Selenium;
using System;
using System.IO;

namespace AutomationExercise.Tests.Utilities
{
    public static class ScreenshotHelper
    {
        public static string CaptureScreenshot(IWebDriver driver, string testName)
        {
            try
            {
                if (driver is not ITakesScreenshot takesScreenshot)
                {
                    return string.Empty;
                }

                var screenshot = takesScreenshot.GetScreenshot();
                var directoryPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestResults", "Screenshots");
                
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var cleanTestName = string.Join("_", testName.Split(Path.GetInvalidFileNameChars()));
                var filePath = Path.Combine(directoryPath, $"{cleanTestName}_{timestamp}.png");

                screenshot.SaveAsFile(filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to capture screenshot: {ex.Message}");
                return string.Empty;
            }
        }
    }
}
