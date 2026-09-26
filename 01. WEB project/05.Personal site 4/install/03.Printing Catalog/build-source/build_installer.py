"""Builds the Printing Catalog installers from the project source.

The payload contains ONLY program files. The working database, secret key,
uploads, sample data and virtual environment are never included - a fresh
install starts with an empty database and the admin / admin account.

Output (in %TEMP%/catalog-build/output):
  payload.zip                                 - the app files (for tests)
  setup.ps1                                   - Windows installer script (embedded into the EXE)
  Install Printing Catalog.command            - macOS installer script
  PrintingCatalog-macOS-Install.zip           - the .command with its executable bit

The Windows EXE is then compiled from setup.cs with setup.ps1 as a resource:
  csc.exe -nologo -target:exe -optimize+ -resource:setup.ps1,setup.ps1
          -out:PrintingCatalog-Windows-Setup.exe setup.cs
"""
from pathlib import Path
import base64, io, os, zipfile

HERE = Path(__file__).parent
SOURCE = Path(r'E:\Programing\My_project\GitHub\MyProject\09. Other tools\02.Printing\03.Catalog')
OUT = Path(os.environ['TEMP']) / 'catalog-build' / 'output'
OUT.mkdir(parents=True, exist_ok=True)

FILES = ['app.py', 'README.md', 'static/js/qrcode.min.js', 'assets/icon.ico', 'assets/icon.png',
         'templates/index.html', 'templates/admin.html', 'templates/account.html', 'templates/login.html']
# Pinned direct dependencies for the installed runtime (waitress serves the app)
REQUIREMENTS = 'flask==3.1.2\npymupdf==1.26.4\nwaitress==3.0.2\n'
FORBIDDEN = ('.db', '.db-wal', '.db-shm', '.sqlite', '.flask_secret_key', '.log')

payload = io.BytesIO()
with zipfile.ZipFile(payload, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in FILES:
        z.write(SOURCE / name, name)
    z.write(HERE / 'desktop.py', 'desktop.py')
    z.writestr('requirements.txt', REQUIREMENTS)
    names = z.namelist()
assert not any(n.endswith(FORBIDDEN) or n.startswith(('database/', 'uploads/')) for n in names), names
(OUT / 'payload.zip').write_bytes(payload.getvalue())
blob = base64.b64encode(payload.getvalue()).decode()

ps = (HERE / 'setup.template.ps1').read_text(encoding='utf-8-sig').replace('__PAYLOAD__', blob)
(OUT / 'setup.ps1').write_text(ps, encoding='utf-8-sig', newline='')

mac = (HERE / 'Install Printing Catalog.template.command').read_text(encoding='utf-8').replace('__PAYLOAD__', blob)
(OUT / 'Install Printing Catalog.command').write_text(mac, encoding='utf-8', newline='\n')
with zipfile.ZipFile(OUT / 'PrintingCatalog-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('Install Printing Catalog.command')
    info.create_system = 3
    info.external_attr = 0o100755 << 16
    info.compress_type = zipfile.ZIP_DEFLATED  # a bare ZipInfo would be stored uncompressed
    z.writestr(info, mac)

print(OUT)
print('payload files:', names)
