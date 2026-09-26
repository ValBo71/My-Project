from pathlib import Path
import base64, io, zipfile, os, hashlib, json

SOURCE = Path(r'E:\Programing\My_project\GitHub\MyProject\08.Observer\02.ObserverV2')
OUT = Path(os.environ['TEMP']) / 'observer-build' / 'output'
OUT.mkdir(parents=True, exist_ok=True)
launcher = '''import os, sys, threading, webbrowser
from pathlib import Path
data = Path(os.environ.get("LOCALAPPDATA", str(Path.home() / "Library/Application Support"))) / "ObserverV2" / "data"
data.mkdir(parents=True, exist_ok=True)
import config
config.DATABASE_PATH = str(data / "jobs.db")
config.LINKEDIN_SESSION_PATH = str(data / "linkedin_session.json")
import app
from waitress import create_server
try:
    server = create_server(app.app, host="127.0.0.1", port=0, threads=4)
    url = "http://127.0.0.1:" + str(server.effective_port)
    print("Observer V2: " + url + " (close this window to stop)", flush=True)
    threading.Timer(1, lambda: webbrowser.open(url)).start()
    server.run()
except KeyboardInterrupt:
    pass
'''
payload = io.BytesIO()
with zipfile.ZipFile(payload, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['app.py','config.py','database.py','parser.py','scraper.py']:
        text = (SOURCE/name).read_text(encoding='utf-8')
        if name == 'config.py':
            text = text.replace('FLASK_DEBUG = True', 'FLASK_DEBUG = False')
        if name == 'app.py':
            text = text.replace('os.path.join(os.path.abspath(os.path.dirname(__file__)), "app.log")', 'os.path.join(os.path.dirname(__import__("config").DATABASE_PATH), "app.log")')
        z.writestr(name, text)
    for folder in ['static','templates']:
        for p in (SOURCE/folder).rglob('*'):
            if p.is_file(): z.write(p, p.relative_to(SOURCE).as_posix())
    z.writestr('desktop.py', launcher)
    z.writestr('requirements.txt', 'flask==3.1.2\nbeautifulsoup4==4.13.5\nlxml==6.0.2\nplaywright==1.55.0\nwaitress==3.0.2\n')
blob = base64.b64encode(payload.getvalue()).decode()
(OUT/'payload.zip').write_bytes(payload.getvalue())
ps = r'''$ErrorActionPreference = 'Stop'
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $root = Join-Path $env:LOCALAPPDATA 'ObserverV2'
  New-Item -ItemType Directory -Force -Path $root | Out-Null
  $stage = Join-Path $root ('setup-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $stage | Out-Null
  Write-Host 'Installing Observer V2. Internet is required; please wait...'
  $archive = Join-Path $stage 'uv.zip'
  Invoke-WebRequest -UseBasicParsing 'https://github.com/astral-sh/uv/releases/download/0.8.22/uv-x86_64-pc-windows-msvc.zip' -OutFile $archive
  if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne '5049375AA2A5162F132B2C1CB992E25D42D47D934CAB8C174DBE6F60973DCC12') { throw 'Download checksum mismatch' }
  Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $stage 'tools')
  $uv = (Get-ChildItem (Join-Path $stage 'tools') -Filter uv.exe -Recurse | Select-Object -First 1).FullName
  $env:UV_PYTHON_INSTALL_DIR = Join-Path $root 'python'
  $env:UV_CACHE_DIR = Join-Path $root 'cache'
  $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $root 'browsers'
  $venv = Join-Path $root 'runtime'
  if (!(Test-Path (Join-Path $venv 'Scripts\python.exe'))) {
    & $uv venv --python 3.12 --managed-python $venv
    if ($LASTEXITCODE -ne 0) { throw 'Python setup failed' }
  }
  $python = Join-Path $venv 'Scripts\python.exe'
  $zip = Join-Path $stage 'app.zip'
  [IO.File]::WriteAllBytes($zip, [Convert]::FromBase64String('__PAYLOAD__'))
  $appDir = Join-Path $stage 'app'
  Expand-Archive -LiteralPath $zip -DestinationPath $appDir
  & $uv pip install --python $python -r (Join-Path $appDir 'requirements.txt')
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
  & $python -m playwright install chromium
  if ($LASTEXITCODE -ne 0) { throw 'Browser installation failed' }
  $live = Join-Path $root 'app'
  New-Item -ItemType Directory -Force -Path $live | Out-Null
  Copy-Item -Path (Join-Path $appDir '*') -Destination $live -Recurse -Force
  $run = Join-Path $root 'ObserverV2.cmd'
  @('@echo off', 'set "PLAYWRIGHT_BROWSERS_PATH=%~dp0browsers"', '"%~dp0runtime\Scripts\python.exe" "%~dp0app\desktop.py"', 'if errorlevel 1 pause') | Set-Content -LiteralPath $run -Encoding ASCII
  $shell = New-Object -ComObject WScript.Shell
  foreach ($folder in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    $shortcut = $shell.CreateShortcut((Join-Path $folder 'Observer V2.lnk'))
    $shortcut.TargetPath = $run
    $shortcut.WorkingDirectory = $root
    $shortcut.IconLocation = Join-Path $live 'static\favicon.ico'
    $shortcut.Save()
  }
  Write-Host 'Installation complete. Use the Observer V2 desktop shortcut.'
  Start-Process -FilePath $run
} catch {
  Write-Host ('Installation failed: ' + $_.Exception.Message) -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}
'''.replace('__PAYLOAD__', blob)
(OUT/'setup.ps1').write_text(ps, encoding='utf-8-sig')
mac = r'''#!/bin/bash
set -euo pipefail
trap 'echo "Installation failed. Please check your connection and try again."; read -r -p "Press Enter to close..."' ERR
ROOT="$HOME/Library/Application Support/ObserverV2"
mkdir -p "$ROOT"
STAGE=$(mktemp -d "$ROOT/setup.XXXXXX")
echo "Installing Observer V2. Internet is required; please wait..."
case "$(uname -m)" in
 arm64) ARCH=aarch64; HASH=3f61099e261e449527141dbf125629fab33ad696468c8c90cebbac40185a306c;;
 x86_64) ARCH=x86_64; HASH=76638fdcfa91357858771551a1c88de1f7c3b270b33ab1866f8a0618d9e442d8;;
 *) echo 'Unsupported architecture'; exit 1;;
esac
curl --fail --location --retry 3 "https://github.com/astral-sh/uv/releases/download/0.8.22/uv-$ARCH-apple-darwin.tar.gz" -o "$STAGE/uv.tar.gz"
echo "$HASH  $STAGE/uv.tar.gz" | shasum -a 256 -c -
tar -xzf "$STAGE/uv.tar.gz" -C "$STAGE"
UV="$STAGE/uv-$ARCH-apple-darwin/uv"
export UV_PYTHON_INSTALL_DIR="$ROOT/python"
export UV_CACHE_DIR="$ROOT/cache"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/browsers"
if [ ! -x "$ROOT/runtime/bin/python" ]; then
 "$UV" venv --python 3.12 --managed-python "$ROOT/runtime"
fi
base64 -D > "$STAGE/app.zip" <<'PAYLOAD'
__PAYLOAD__
PAYLOAD
mkdir -p "$STAGE/app"
unzip -q "$STAGE/app.zip" -d "$STAGE/app"
"$UV" pip install --python "$ROOT/runtime/bin/python" -r "$STAGE/app/requirements.txt"
"$ROOT/runtime/bin/python" -m playwright install chromium
mkdir -p "$ROOT/app" "$HOME/Applications/Observer V2.app/Contents/MacOS"
cp -R "$STAGE/app/." "$ROOT/app/"
cat > "$ROOT/ObserverV2.command" <<'LAUNCH'
#!/bin/bash
ROOT="$HOME/Library/Application Support/ObserverV2"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/browsers"
"$ROOT/runtime/bin/python" "$ROOT/app/desktop.py"
LAUNCH
chmod +x "$ROOT/ObserverV2.command"
cat > "$HOME/Applications/Observer V2.app/Contents/MacOS/ObserverV2" <<'APP'
#!/bin/bash
open -a Terminal "$HOME/Library/Application Support/ObserverV2/ObserverV2.command"
APP
chmod +x "$HOME/Applications/Observer V2.app/Contents/MacOS/ObserverV2"
cat > "$HOME/Applications/Observer V2.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleExecutable</key><string>ObserverV2</string><key>CFBundleIdentifier</key><string>local.observer.v2</string><key>CFBundleName</key><string>Observer V2</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleVersion</key><string>2.0.0</string></dict></plist>
PLIST
echo 'Installation complete. Observer V2 is in your Applications folder.'
open "$HOME/Applications/Observer V2.app"
'''.replace('__PAYLOAD__', blob)
with zipfile.ZipFile(OUT/'ObserverV2-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('Install Observer V2.command')
    info.create_system = 3
    info.external_attr = 0o100755 << 16
    z.writestr(info, mac)
(OUT/'Install Observer V2.command').write_text(mac, encoding='utf-8', newline='\n')
print(OUT)
