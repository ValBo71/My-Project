namespace AI_ABV_Playwright_Test.Config;

public class TestSettings
{
    public string BaseUrl { get; set; } = string.Empty;
    public bool Headed { get; set; } = false;
    public int SlowMo { get; set; } = 0;
    public int TimeoutMs { get; set; } = 30000;
}
