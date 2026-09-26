// Windows installer (.NET Framework 4 WinForms, compiled with csc.exe by build_installer.py).
// script.jsx - the InDesign script from the project - is embedded as a resource.
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Forms;

internal class Setup
{
    private static byte[] Resource()
    {
        using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("script.jsx"))
        using (MemoryStream buffer = new MemoryStream())
        {
            stream.CopyTo(buffer);
            return buffer.ToArray();
        }
    }

    private static int Main()
    {
        try
        {
            byte[] script = Resource();
            string root = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Adobe"), "InDesign");
            List<string> installed = new List<string>();
            if (Directory.Exists(root))
            {
                foreach (string version in Directory.GetDirectories(root, "Version *"))
                {
                    foreach (string locale in Directory.GetDirectories(version))
                    {
                        if (!Regex.IsMatch(Path.GetFileName(locale), "^[a-z]{2}_[A-Z]{2}$"))
                        {
                            continue;
                        }
                        string target = Path.Combine(Path.Combine(Path.Combine(locale, "Scripts"), "Scripts Panel"), "Printing Tools");
                        Directory.CreateDirectory(target);
                        string file = Path.Combine(target, "InDesignBookletCreep.jsx");
                        if (File.Exists(file) && !Equal(File.ReadAllBytes(file), script))
                        {
                            File.Copy(file, file + "." + DateTime.Now.ToString("yyyyMMddHHmmss") + ".bak");
                        }
                        File.WriteAllBytes(file, script);
                        installed.Add(file);
                    }
                }
            }
            if (installed.Count > 0)
            {
                MessageBox.Show("InDesign Booklet Creep was installed in " + installed.Count + " InDesign profile(s).\nOpen Window > Utilities > Scripts > User > Printing Tools.", "Installation complete");
            }
            else
            {
                string folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Personal), "Printing Tools");
                Directory.CreateDirectory(folder);
                string file = Path.Combine(folder, "InDesignBookletCreep.jsx");
                File.WriteAllBytes(file, script);
                MessageBox.Show("No InDesign user profile was found. The script was saved to:\n" + file + "\n\nOpen InDesign once, then copy it to the User Scripts Panel folder.", "Script saved");
            }
            return 0;
        }
        catch (Exception ex)
        {
            MessageBox.Show(ex.Message, "Installation failed");
            return 1;
        }
    }

    private static bool Equal(byte[] a, byte[] b)
    {
        if (a.Length != b.Length)
        {
            return false;
        }
        for (int i = 0; i < a.Length; i++)
        {
            if (a[i] != b[i])
            {
                return false;
            }
        }
        return true;
    }
}
