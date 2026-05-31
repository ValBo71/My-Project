using AI_ABV_Playwright_Test.Core;
using AI_ABV_Playwright_Test.Pages;
using NUnit.Framework;

namespace AI_ABV_Playwright_Test.Tests;

public class EmailTests : BaseTest
{
    private LoginPage _loginPage = null!;
    private InboxPage _inboxPage = null!;
    private ComposePage _composePage = null!;
    private SentPage _sentPage = null!;

    [SetUp]
    public void TestSetup()
    {
        _loginPage = new LoginPage(Page);
        _inboxPage = new InboxPage(Page);
        _composePage = new ComposePage(Page);
        _sentPage = new SentPage(Page);
    }

    [Test]
    public async Task SendEmail_And_VerifyInInboxAndSent()
    {
        // ============================================
        // 1. Успешен вход (Login)
        // ============================================
        TestContext.Progress.WriteLine("Navigating to ABV.bg login page...");
        await _loginPage.GotoAsync();

        string username = "isi_test_isi";
        string password = ".AZau$Dq*-6_dJ-";

        TestContext.Progress.WriteLine("Logging in...");
        await _loginPage.LoginAsync(username, password);

        // Validate successful login (Wait for an inbox element)
        bool isAvatarVisible = await _inboxPage.IsUserAvatarVisibleAsync();
        Assert.That(isAvatarVisible, Is.True, "Failed to login. User avatar not visible.");

        // ============================================
        // 2. Създаване на ново писмо
        // ============================================
        TestContext.Progress.WriteLine("Opening composer...");
        await _composePage.OpenComposerAsync();

        TestContext.Progress.WriteLine("Waiting for composer to load...");
        await _composePage.WaitForComposerToLoadAsync();

        string targetEmail = "isi_test_isi@abv.bg";
        string timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        string subject = $"AI-ABV-Playwright-Test-{timestamp}";
        string body = "AI-ABV-Playwright-Test";

        TestContext.Progress.WriteLine($"Filling email data (Subject: {subject})...");
        await _composePage.FillEmailDataAsync(targetEmail, subject, body);

        TestContext.Progress.WriteLine("Sending email...");
        await _composePage.SendEmailAsync();

        // Give the system a moment to process the sending
        await Task.Delay(2000); // Playwright handles waiting natively, but sending might have a background delay.

        // ============================================
        // 3. Проверка в „Кутия“ (Inbox)
        // ============================================
        TestContext.Progress.WriteLine("Navigating to Inbox...");
        await _inboxPage.GotoInboxAsync();

        TestContext.Progress.WriteLine("Verifying email in Inbox...");
        string expectedSenderName = "Valentin Bogdanov"; // Expected per requirements
        bool isInInbox = await _inboxPage.IsEmailPresentAsync(expectedSenderName, subject);
        Assert.That(isInInbox, Is.True, $"Email with subject '{subject}' from '{expectedSenderName}' was not found in Inbox.");

        // ============================================
        // 4. Проверка в „Изпратени“ (Sent)
        // ============================================
        TestContext.Progress.WriteLine("Navigating to Sent...");
        await _sentPage.GotoSentPageAsync();

        TestContext.Progress.WriteLine("Verifying email in Sent folder...");
        // Since we sent it, we look for our sent email by recipient/target and subject
        bool isInSent = await _sentPage.IsEmailPresentAsync(targetEmail, subject);
        Assert.That(isInSent, Is.True, $"Email with subject '{subject}' sent to '{targetEmail}' was not found in Sent folder.");
    }
}
