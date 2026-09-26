$ErrorActionPreference = 'Stop'

# Copies the built site (dist\client) and the editable source into the site folder.
# Run it from a working copy of site-source after "npm run build" - not from the
# site-source folder inside the target itself.
$target = 'E:\Programing\My_project\GitHub\MyProject\01. WEB project\05.Personal site 4'
$sourceRoot = Split-Path -Parent $PSScriptRoot
$built = Join-Path $sourceRoot 'dist\client'
$editable = Join-Path $target 'site-source'

if (!(Test-Path -LiteralPath (Join-Path $target 'install'))) {
    throw "Expected install folder is missing: $target\install"
}
if (!(Test-Path -LiteralPath (Join-Path $built 'index.html'))) {
    throw 'Run npm run build before copying the site.'
}
if ((Resolve-Path -LiteralPath $sourceRoot).Path.TrimEnd('\') -ieq $editable.TrimEnd('\')) {
    throw "Run this script from a working copy of site-source, not from $editable itself."
}

# Replace a folder with a fresh copy. Copy-Item onto an existing folder would put the
# copy INSIDE it (app\app, data\data, ...) and would keep files that no longer exist.
function Copy-Folder([string]$from, [string]$to) {
    if (Test-Path -LiteralPath $to) {
        Remove-Item -LiteralPath $to -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $to) | Out-Null
    Copy-Item -LiteralPath $from -Destination $to -Recurse -Force
}

# Built site: folders are replaced (old hashed files in _next are dropped), files overwritten.
Get-ChildItem -LiteralPath $built -Force | Where-Object Name -ne 'install' | ForEach-Object {
    $to = Join-Path $target $_.Name
    if ($_.PSIsContainer) {
        Copy-Folder $_.FullName $to
    } else {
        Copy-Item -LiteralPath $_.FullName -Destination $to -Force
    }
}

# The build writes its own .assetsignore; add what must never be published: the editable
# source, the site README and the installer build scripts (they contain local paths).
$assetsIgnore = Join-Path $target '.assetsignore'
$keepPrivate = @('site-source', 'README-SITE-BG.md', 'install/*/build-source')
$ignored = @()
if (Test-Path -LiteralPath $assetsIgnore) { $ignored = @(Get-Content -LiteralPath $assetsIgnore) }
$missing = @($keepPrivate | Where-Object { $ignored -notcontains $_ })
if ($missing.Count -gt 0) {
    [IO.File]::WriteAllText($assetsIgnore, ((@($ignored | Where-Object { $_ -ne '' }) + $missing) -join "`n") + "`n")
}

New-Item -ItemType Directory -Force -Path $editable | Out-Null
$folders = @('app', 'components', 'data', 'public\images', 'public\manuals', 'public\fonts', 'scripts', '.openai')
foreach ($folder in $folders) {
    Copy-Folder (Join-Path $sourceRoot $folder) (Join-Path $editable $folder)
}
$files = @('.gitignore', '.oxfmtrc.json', '.oxlintrc.json', 'next-env.d.ts', 'next.config.ts', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'README-BG.md', 'PRODUCT.md')
foreach ($file in $files) {
    Copy-Item -LiteralPath (Join-Path $sourceRoot $file) -Destination (Join-Path $editable $file) -Force
}
Copy-Item -LiteralPath (Join-Path $sourceRoot 'README-BG.md') -Destination (Join-Path $target 'README-SITE-BG.md') -Force

Write-Host "Site copied to $target"
