"""Builds the Spine and Creep Calculator installers from the project source.

Output (in %TEMP%/spine-build/output):
  payload.zip                                 - the app files (for tests)
  setup.ps1                                   - Windows installer script (embedded into the EXE)
  Install Spine and Creep Calculator.command  - macOS installer script
  SpineCreepCalculator-macOS-Install.zip      - the .command with its executable bit

The Windows EXE is then compiled from setup.cs with setup.ps1 as a resource:
  csc.exe -nologo -target:exe -optimize+ -resource:setup.ps1,setup.ps1
          -out:SpineCreepCalculator-Windows-Setup.exe setup.cs
"""
from pathlib import Path
import base64, io, os, zipfile

HERE = Path(__file__).parent
SOURCE = Path(r'E:\Programing\My_project\GitHub\MyProject\09. Other tools\02.Printing\01.Spine and Creep Calculator')
OUT = Path(os.environ['TEMP']) / 'spine-build' / 'output'
OUT.mkdir(parents=True, exist_ok=True)

payload = io.BytesIO()
with zipfile.ZipFile(payload, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['index.html', 'README.md', 'script.js', 'style.css']:
        z.write(SOURCE / name, name)
    # Local HTTP launcher on http://127.0.0.1:18765 (a fixed port keeps localStorage stable)
    z.write(HERE / 'desktop.py', 'desktop.py')
(OUT / 'payload.zip').write_bytes(payload.getvalue())
blob = base64.b64encode(payload.getvalue()).decode()

ps = (HERE / 'setup.template.ps1').read_text(encoding='utf-8-sig').replace('__PAYLOAD__', blob)
(OUT / 'setup.ps1').write_text(ps, encoding='utf-8-sig', newline='')

mac = (HERE / 'Install Spine and Creep Calculator.template.command').read_text(encoding='utf-8').replace('__PAYLOAD__', blob)
(OUT / 'Install Spine and Creep Calculator.command').write_text(mac, encoding='utf-8', newline='\n')
with zipfile.ZipFile(OUT / 'SpineCreepCalculator-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('Install Spine and Creep Calculator.command')
    info.create_system = 3
    info.external_attr = 0o100755 << 16
    z.writestr(info, mac)

print(OUT)
