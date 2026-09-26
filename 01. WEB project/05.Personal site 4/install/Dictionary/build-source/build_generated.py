from pathlib import Path
import base64, io, zipfile, os, hashlib, json

SOURCE = Path(r'E:\Programing\My_project\GitHub\MyProject\09. Other tools\03.Dictionary')
OUT = Path(os.environ['TEMP']) / 'dictionary-build' / 'output'
OUT.mkdir(parents=True, exist_ok=True)
launcher = 'import functools, http.server, urllib.request, webbrowser\nfrom pathlib import Path\nPORT = 18763\nURL = f"http://127.0.0.1:{PORT}"\nMARKER = b"Dictionary-desktop-v1"\nclass Handler(http.server.SimpleHTTPRequestHandler):\n    def do_GET(self):\n        if self.path == \'/__dictionary_health\':\n            self.send_response(200)\n            self.end_headers()\n            self.wfile.write(MARKER)\n        else:\n            super().do_GET()\n    def list_directory(self, path):\n        self.send_error(403)\ndef main():\n    handler = functools.partial(Handler, directory=str(Path(__file__).parent))\n    try:\n        server = http.server.ThreadingHTTPServer((\'127.0.0.1\', PORT), handler)\n    except OSError:\n        try:\n            with urllib.request.urlopen(URL + \'/__dictionary_health\', timeout=2) as r:\n                if r.read() != MARKER: raise RuntimeError(\'Port belongs to another application\')\n            webbrowser.open(URL)\n            return\n        except Exception:\n            input(\'Dictionary port 18763 is occupied. Close the other application and retry. Press Enter.\')\n            raise SystemExit(1)\n    print(\'Dictionary: \' + URL + \' — close this window to stop.\', flush=True)\n    webbrowser.open(URL)\n    try:\n        server.serve_forever()\n    except KeyboardInterrupt:\n        pass\n    finally:\n        server.server_close()\nif __name__ == \'__main__\': main()\n'
payload = io.BytesIO()
with zipfile.ZipFile(payload, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['app.js','speech-practice.js','index.html','styles.css']:
        content = (SOURCE/name).read_text(encoding='utf-8')
        if name == 'index.html':
            links = '<details><summary>Включени речници за импорт</summary><p>Изтеглете речник и го изберете във формата за импорт.</p><ul>'
            for p in sorted(SOURCE.glob('*.xlsx')):
                links += '<li><a download href="' + p.name + '">' + p.name + '</a></li>'
            links += '</ul></details>'
            content = content.replace('<div class="import-layout">', '<div class="import-layout">' + links)
        z.writestr(name, content)
    for p in (SOURCE/'lib').rglob('*'):
        if p.is_file(): z.write(p, p.relative_to(SOURCE).as_posix())
    for p in SOURCE.glob('*.xlsx'): z.write(p, p.name)
    z.writestr('desktop.py', launcher)
blob = base64.b64encode(payload.getvalue()).decode()
(OUT/'payload.zip').write_bytes(payload.getvalue())
ps = r'''$ErrorActionPreference = 'Stop'
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $root = Join-Path $env:LOCALAPPDATA 'Dictionary'
  New-Item -ItemType Directory -Force -Path $root | Out-Null
  $stage = Join-Path $root ('setup-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $stage | Out-Null
  Write-Host 'Installing Dictionary. Internet is required; please wait...'
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
  $live = Join-Path $root 'app'
  New-Item -ItemType Directory -Force -Path $live | Out-Null
  Copy-Item -Path (Join-Path $appDir '*') -Destination $live -Recurse -Force
  $run = Join-Path $root 'Dictionary.cmd'
  @('@echo off', 'set "PLAYWRIGHT_BROWSERS_PATH=%~dp0browsers"', '"%~dp0runtime\Scripts\python.exe" "%~dp0app\desktop.py"', 'if errorlevel 1 pause') | Set-Content -LiteralPath $run -Encoding ASCII
  $shell = New-Object -ComObject WScript.Shell
  foreach ($folder in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    $shortcut = $shell.CreateShortcut((Join-Path $folder 'Dictionary.lnk'))
    $shortcut.TargetPath = $run
    $shortcut.WorkingDirectory = $root
    $shortcut.Save()
  }
  Write-Host 'Installation complete. Use the Dictionary desktop shortcut.'
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
ROOT="$HOME/Library/Application Support/Dictionary"
mkdir -p "$ROOT"
STAGE=$(mktemp -d "$ROOT/setup.XXXXXX")
echo "Installing Dictionary. Internet is required; please wait..."
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
mkdir -p "$ROOT/app" "$HOME/Applications/Dictionary.app/Contents/MacOS"
cp -R "$STAGE/app/." "$ROOT/app/"
cat > "$ROOT/Dictionary.command" <<'LAUNCH'
#!/bin/bash
ROOT="$HOME/Library/Application Support/Dictionary"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/browsers"
"$ROOT/runtime/bin/python" "$ROOT/app/desktop.py"
LAUNCH
chmod +x "$ROOT/Dictionary.command"
cat > "$HOME/Applications/Dictionary.app/Contents/MacOS/Dictionary" <<'APP'
#!/bin/bash
open -a Terminal "$HOME/Library/Application Support/Dictionary/Dictionary.command"
APP
chmod +x "$HOME/Applications/Dictionary.app/Contents/MacOS/Dictionary"
cat > "$HOME/Applications/Dictionary.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleExecutable</key><string>Dictionary</string><key>CFBundleIdentifier</key><string>local.dictionary.desktop</string><key>CFBundleName</key><string>Dictionary</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleVersion</key><string>2.0.0</string></dict></plist>
PLIST
echo 'Installation complete. Dictionary is in your Applications folder.'
open "$HOME/Applications/Dictionary.app"
'''.replace('__PAYLOAD__', blob)
with zipfile.ZipFile(OUT/'Dictionary-macOS-Install.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    info = zipfile.ZipInfo('Install Dictionary.command')
    info.create_system = 3
    info.external_attr = 0o100755 << 16
    z.writestr(info, mac)
(OUT/'Install Dictionary.command').write_text(mac, encoding='utf-8', newline='\n')
print(OUT)
