// Windows installer (.NET Framework 4.5+ console app, compiled with csc.exe by build.py).
// It downloads the self-contained app package of one fixed release from GitHub Releases,
// checks its SHA-256 against the value built into this file and installs it.
// build.py fills in the __PLACEHOLDERS__.
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;

internal class Setup
{
    private const string Version = "__TAG__";
    private const string PackageUrl = "__URL__";
    private const string PackageSha256 = "__SHA256__";

    private static int Main()
    {
        Console.Title = "Car Maintenance Installer";
        string temp = null;
        try
        {
            // CAR_MAINTENANCE_INSTALL_ROOT (tests only): install into that folder, no shortcuts, no start.
            string testRoot = Environment.GetEnvironmentVariable("CAR_MAINTENANCE_INSTALL_ROOT");
            bool testMode = !string.IsNullOrEmpty(testRoot);
            string root = testMode ? testRoot : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CarMaintenance");
            string data = Path.Combine(root, "data");
            string app = Path.Combine(root, "app");
            temp = Path.Combine(root, "setup-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(data);
            Directory.CreateDirectory(temp);

            // CAR_MAINTENANCE_PACKAGE_URL (tests only): another source; the SHA-256 check still applies.
            string url = Environment.GetEnvironmentVariable("CAR_MAINTENANCE_PACKAGE_URL");
            if (string.IsNullOrEmpty(url))
            {
                url = PackageUrl;
            }

            Console.WriteLine("Car Maintenance " + Version);
            Console.WriteLine("Downloading " + url);
            string zip = Path.Combine(temp, "app.zip");
            Download(url, zip);

            Console.WriteLine("Checking the download...");
            string actual = Sha256(zip);
            if (!string.Equals(actual, PackageSha256, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("The downloaded file is damaged or not the expected version (SHA-256 mismatch). Nothing was installed.");
            }

            Console.WriteLine("Installing...");
            string extracted = Path.Combine(temp, "app");
            ZipFile.ExtractToDirectory(zip, extracted);
            Directory.CreateDirectory(app);
            CopyTree(extracted, app);

            string launcher = Path.Combine(root, "CarMaintenance.cmd");
            File.WriteAllText(launcher, "@echo off\r\ntitle Car Maintenance\r\nset \"CAR_MAINTENANCE_DATA_DIR=%~dp0data\"\r\ncd /d \"%~dp0data\"\r\nstart \"\" cmd /c \"timeout /t 2 /nobreak > nul & start http://127.0.0.1:18766\"\r\n\"%~dp0app\\CarMaintenance.Web.exe\" --urls http://127.0.0.1:18766\r\nif errorlevel 1 pause\r\n");

            if (testMode)
            {
                Console.WriteLine("Installed (test mode) in " + root);
                return 0;
            }

            string icon = Path.Combine(Path.Combine(app, "wwwroot"), "favicon.ico");
            CreateShortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "Car Maintenance.lnk"), launcher, root, icon);
            CreateShortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Car Maintenance.lnk"), launcher, root, icon);

            Console.WriteLine("Installation complete. The database starts empty on a new installation.");
            ProcessStartInfo start = new ProcessStartInfo(launcher);
            start.UseShellExecute = true;
            Process.Start(start);
            return 0;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Installation failed: " + ex.Message);
            Console.ResetColor();
            Console.WriteLine("Check the internet connection and try again. Press Enter to close.");
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("CAR_MAINTENANCE_INSTALL_ROOT")))
            {
                Console.ReadLine();
            }
            return 1;
        }
        finally
        {
            if (temp != null)
            {
                try { Directory.Delete(temp, true); } catch (IOException) { } catch (UnauthorizedAccessException) { }
            }
        }
    }

    private static void Download(string url, string destination)
    {
        // GitHub requires TLS 1.2, which .NET Framework does not enable by default
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
        request.UserAgent = "CarMaintenance-Installer";
        request.AllowAutoRedirect = true;
        using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
        using (Stream input = response.GetResponseStream())
        using (FileStream output = File.Create(destination))
        {
            long total = response.ContentLength;
            byte[] buffer = new byte[81920];
            long done = 0;
            int lastPercent = -1;
            int read;
            while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
            {
                output.Write(buffer, 0, read);
                done += read;
                if (total > 0)
                {
                    int percent = (int)(done * 100 / total);
                    if (percent != lastPercent)
                    {
                        Console.Write("\r  " + percent + "% of " + (total / 1048576) + " MB");
                        lastPercent = percent;
                    }
                }
            }
            Console.WriteLine();
        }
    }

    private static string Sha256(string path)
    {
        using (SHA256 sha = SHA256.Create())
        using (FileStream stream = File.OpenRead(path))
        {
            return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
        }
    }

    private static void CopyTree(string source, string destination)
    {
        foreach (string dir in Directory.GetDirectories(source, "*", SearchOption.AllDirectories))
        {
            Directory.CreateDirectory(destination + dir.Substring(source.Length));
        }
        foreach (string file in Directory.GetFiles(source, "*", SearchOption.AllDirectories))
        {
            File.Copy(file, destination + file.Substring(source.Length), true);
        }
    }

    private static void CreateShortcut(string path, string target, string workingDirectory, string icon)
    {
        Type shellType = Type.GetTypeFromProgID("WScript.Shell");
        dynamic shell = Activator.CreateInstance(shellType);
        dynamic shortcut = shell.CreateShortcut(path);
        shortcut.TargetPath = target;
        shortcut.WorkingDirectory = workingDirectory;
        shortcut.IconLocation = icon;
        shortcut.Save();
    }
}
