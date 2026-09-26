$ErrorActionPreference = 'Stop'
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $root = Join-Path $env:LOCALAPPDATA 'PrintingCatalog'
  New-Item -ItemType Directory -Force -Path $root | Out-Null
  $stage = Join-Path $root ('setup-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $stage | Out-Null
  Write-Host 'Installing Printing Catalog. Internet is required; please wait...'
  $archive = Join-Path $stage 'uv.zip'
  Invoke-WebRequest -UseBasicParsing 'https://github.com/astral-sh/uv/releases/download/0.8.22/uv-x86_64-pc-windows-msvc.zip' -OutFile $archive
  if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne '5049375AA2A5162F132B2C1CB992E25D42D47D934CAB8C174DBE6F60973DCC12') { throw 'Download checksum mismatch' }
  Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $stage 'tools')
  $uv = (Get-ChildItem (Join-Path $stage 'tools') -Filter uv.exe -Recurse | Select-Object -First 1).FullName
  $env:UV_PYTHON_INSTALL_DIR = Join-Path $root 'python'
  $env:UV_CACHE_DIR = Join-Path $root 'cache'
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
  $live = Join-Path $root 'app'
  New-Item -ItemType Directory -Force -Path $live | Out-Null
  Copy-Item -Path (Join-Path $appDir '*') -Destination $live -Recurse -Force
  $run = Join-Path $root 'PrintingCatalog.cmd'
  @('@echo off', '"%~dp0runtime\Scripts\python.exe" "%~dp0app\desktop.py"', 'if errorlevel 1 pause') | Set-Content -LiteralPath $run -Encoding ASCII
  $shell = New-Object -ComObject WScript.Shell
  foreach ($shortcutFolder in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    $shortcut = $shell.CreateShortcut((Join-Path $shortcutFolder 'Printing Catalog.lnk'))
    $shortcut.TargetPath = $run
    $shortcut.WorkingDirectory = $root
    $shortcut.IconLocation = Join-Path $live 'assets\icon.ico'
    $shortcut.Save()
  }
  Write-Host 'Installation complete.'
  Start-Process -FilePath $run
} catch {
  Write-Host ('Installation failed: ' + $_.Exception.Message) -ForegroundColor Red
  Read-Host 'Press Enter to close'
  $failed = $true
} finally {
  # The staging folder (uv, extracted payload) is only needed during setup
  if ($stage -and (Test-Path -LiteralPath $stage)) { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue }
}
if ($failed) { exit 1 }
