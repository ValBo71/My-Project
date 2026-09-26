#!/bin/bash
set -euo pipefail
trap 'echo "Installation failed. Check your connection and try again."; read -r -p "Press Enter to close..."' ERR
ROOT="$HOME/Library/Application Support/SpineCreepCalculator"
mkdir -p "$ROOT"
STAGE=$(mktemp -d "$ROOT/setup.XXXXXX")
echo "Installing Spine and Creep Calculator. Internet is required; please wait..."
case "$(uname -m)" in
 arm64) ARCH=aarch64; HASH=3f61099e261e449527141dbf125629fab33ad696468c8c90cebbac40185a306c;;
 x86_64) ARCH=x86_64; HASH=76638fdcfa91357858771551a1c88de1f7c3b270b33ab1866f8a0618d9e442d8;;
 *) echo 'Unsupported Mac architecture'; exit 1;;
esac
curl --fail --location --retry 3 "https://github.com/astral-sh/uv/releases/download/0.8.22/uv-$ARCH-apple-darwin.tar.gz" -o "$STAGE/uv.tar.gz"
echo "$HASH  $STAGE/uv.tar.gz" | shasum -a 256 -c -
tar -xzf "$STAGE/uv.tar.gz" -C "$STAGE"
UV="$STAGE/uv-$ARCH-apple-darwin/uv"
export UV_PYTHON_INSTALL_DIR="$ROOT/python"
export UV_CACHE_DIR="$ROOT/cache"
if [ ! -x "$ROOT/runtime/bin/python" ]; then "$UV" venv --python 3.12 --managed-python "$ROOT/runtime"; fi
base64 -D > "$STAGE/app.zip" <<'PAYLOAD'
__PAYLOAD__
PAYLOAD
mkdir -p "$STAGE/app"
unzip -q "$STAGE/app.zip" -d "$STAGE/app"
mkdir -p "$ROOT/app" "$HOME/Applications/Spine and Creep Calculator.app/Contents/MacOS"
cp -R "$STAGE/app/." "$ROOT/app/"
cat > "$ROOT/SpineCreepCalculator.command" <<'LAUNCH'
#!/bin/bash
ROOT="$HOME/Library/Application Support/SpineCreepCalculator"
"$ROOT/runtime/bin/python" "$ROOT/app/desktop.py"
LAUNCH
chmod +x "$ROOT/SpineCreepCalculator.command"
cat > "$HOME/Applications/Spine and Creep Calculator.app/Contents/MacOS/SpineCreepCalculator" <<'APP'
#!/bin/bash
open -a Terminal "$HOME/Library/Application Support/SpineCreepCalculator/SpineCreepCalculator.command"
APP
chmod +x "$HOME/Applications/Spine and Creep Calculator.app/Contents/MacOS/SpineCreepCalculator"
cat > "$HOME/Applications/Spine and Creep Calculator.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleExecutable</key><string>SpineCreepCalculator</string><key>CFBundleIdentifier</key><string>local.spinecreepcalculator</string><key>CFBundleName</key><string>Spine and Creep Calculator</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleVersion</key><string>1.0.0</string></dict></plist>
PLIST
echo 'Installation complete.'
open "$HOME/Applications/Spine and Creep Calculator.app"
