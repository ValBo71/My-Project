#!/bin/bash
# macOS installer: downloads the app package of one fixed release from GitHub Releases,
# checks its SHA-256 and installs it. build.py fills in the __PLACEHOLDERS__.
set -euo pipefail
trap 'echo "Installation failed. Check the internet connection and try again."; read -r -p "Press Enter to close..."' ERR
VERSION="__TAG__"
ROOT="$HOME/Library/Application Support/CarMaintenance"
APP="$ROOT/app"
DATA="$ROOT/data"
case "$(uname -m)" in
  arm64) URL="__URL_ARM64__"; SHA256="__SHA256_ARM64__" ;;
  x86_64) URL="__URL_X64__"; SHA256="__SHA256_X64__" ;;
  *) echo "Unsupported Mac architecture: $(uname -m)"; exit 1 ;;
esac
TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
echo "Car Maintenance $VERSION"
echo "Downloading $URL"
curl -fL --retry 3 --progress-bar -o "$TMP/app.zip" "$URL"
echo "Checking the download..."
ACTUAL="$(shasum -a 256 "$TMP/app.zip" | awk '{print $1}')"
if [ "$ACTUAL" != "$SHA256" ]; then
  echo "The downloaded file is damaged or not the expected version (SHA-256 mismatch). Nothing was installed."
  false
fi
echo "Installing Car Maintenance..."
mkdir -p "$APP" "$DATA" "$HOME/Applications/Car Maintenance.app/Contents/MacOS"
unzip -q -o "$TMP/app.zip" -d "$APP"
chmod +x "$APP/CarMaintenance.Web"
cat > "$ROOT/CarMaintenance.command" <<'LAUNCH'
#!/bin/bash
ROOT="$HOME/Library/Application Support/CarMaintenance"
export CAR_MAINTENANCE_DATA_DIR="$ROOT/data"
mkdir -p "$ROOT/data"
cd "$ROOT/data"
( sleep 2 && open "http://127.0.0.1:18766" ) &
"$ROOT/app/CarMaintenance.Web" --urls "http://127.0.0.1:18766"
STATUS=$?
if [ "$STATUS" -ne 0 ]; then read -r -p "Application stopped with an error. Press Enter to close..."; fi
exit "$STATUS"
LAUNCH
chmod +x "$ROOT/CarMaintenance.command"
cat > "$HOME/Applications/Car Maintenance.app/Contents/MacOS/CarMaintenance" <<'APPSTART'
#!/bin/bash
open -a Terminal "$HOME/Library/Application Support/CarMaintenance/CarMaintenance.command"
APPSTART
chmod +x "$HOME/Applications/Car Maintenance.app/Contents/MacOS/CarMaintenance"
cat > "$HOME/Applications/Car Maintenance.app/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleExecutable</key><string>CarMaintenance</string><key>CFBundleIdentifier</key><string>local.carmaintenance</string><key>CFBundleName</key><string>Car Maintenance</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleVersion</key><string>1.0.0</string></dict></plist>
PLIST
echo "Installation complete. The database starts empty on a new installation."
open "$HOME/Applications/Car Maintenance.app"
