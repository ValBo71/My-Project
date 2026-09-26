using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
class Setup {
    static int Main() {
        try {
            string dir = Path.Combine(Path.GetTempPath(), "Dictionary-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(dir);
            string script = Path.Combine(dir, "setup.ps1");
            using (var src = Assembly.GetExecutingAssembly().GetManifestResourceStream("setup.ps1"))
            using (var dst = File.Create(script)) { src.CopyTo(dst); }
            var info = new ProcessStartInfo(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), @"WindowsPowerShell\v1.0\powershell.exe"), "-NoProfile -ExecutionPolicy Bypass -File \"" + script + "\"");
            info.UseShellExecute = false;
            using (var process = Process.Start(info)) { process.WaitForExit(); return process.ExitCode; }
        } catch (Exception e) { Console.WriteLine(e.Message); Console.ReadLine(); return 1; }
    }
}
