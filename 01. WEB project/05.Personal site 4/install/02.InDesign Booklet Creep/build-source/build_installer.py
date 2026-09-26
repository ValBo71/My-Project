"""Builds the InDesign Booklet Creep installers from the committed script.

The script is taken from git HEAD (09. Other tools/02.Printing/02.InDesign Booklet Creep),
so uncommitted local edits never get in.

Output (in %TEMP%/bookletcreep-build/output):
  script.jsx                                  - the embedded script (for checks)
  InDesignBookletCreep-Windows-Setup.exe      - setup.cs compiled with script.jsx as a resource
  InDesignBookletCreep-macOS-Install.zip      - the .command (base64 payload) with its executable bit
"""
from pathlib import Path
import base64, os, shutil, subprocess, zipfile

HERE = Path(__file__).resolve().parent
REPO = Path(r'E:\Programing\My_project\GitHub\MyProject')
SCRIPT = '09. Other tools/02.Printing/02.InDesign Booklet Creep/InDesignBookletCreep.jsx'
OUT = Path(os.environ['TEMP']) / 'bookletcreep-build' / 'output'
CSC = r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'

shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir(parents=True)

script = subprocess.run(['git', '-C', str(REPO), 'show', 'HEAD:' + SCRIPT], check=True, capture_output=True).stdout
(OUT / 'script.jsx').write_bytes(script)

# Windows
shutil.copyfile(HERE / 'setup.cs', OUT / 'setup.cs')
subprocess.run([CSC, '-nologo', '-target:winexe', '-optimize+', '-resource:script.jsx,script.jsx',
                '-r:System.Windows.Forms.dll', '-out:InDesignBookletCreep-Windows-Setup.exe', 'setup.cs'],
               cwd=OUT, check=True)

# macOS
template = (HERE / 'Install InDesign Booklet Creep.template.command').read_bytes()
command = template.replace(b'__PAYLOAD__', base64.b64encode(script))
(OUT / 'Install InDesign Booklet Creep.command').write_bytes(command)
with zipfile.ZipFile(OUT / 'InDesignBookletCreep-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('Install InDesign Booklet Creep.command', date_time=(1980, 1, 1, 0, 0, 0))
    info.create_system = 3
    info.external_attr = 0o100755 << 16
    info.compress_type = zipfile.ZIP_DEFLATED  # a bare ZipInfo would be stored uncompressed
    z.writestr(info, command)

print(OUT)
