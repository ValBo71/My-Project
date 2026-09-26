#!/bin/bash
set -euo pipefail
trap 'echo "Installation failed."; read -r -p "Press Enter to close..."' ERR
# mktemp on macOS only replaces trailing X characters, so use a unique folder
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/InDesignBookletCreep.XXXXXX")
trap 'rm -rf "$TMP_DIR"' EXIT
TMP_SCRIPT="$TMP_DIR/InDesignBookletCreep.jsx"
base64 -D > "$TMP_SCRIPT" <<'SCRIPT'
__PAYLOAD__
SCRIPT
COUNT=0
shopt -s nullglob
for VERSION in "$HOME/Library/Preferences/Adobe InDesign"/Version\ *; do
  for LOCALE in "$VERSION"/*_*; do
    [ -d "$LOCALE" ] || continue
    TARGET="$LOCALE/Scripts/Scripts Panel/Printing Tools"
    mkdir -p "$TARGET"
    FILE="$TARGET/InDesignBookletCreep.jsx"
    if [ -f "$FILE" ] && ! cmp -s "$FILE" "$TMP_SCRIPT"; then cp "$FILE" "$FILE.$(date +%Y%m%d%H%M%S).bak"; fi
    cp "$TMP_SCRIPT" "$FILE"
    COUNT=$((COUNT+1))
  done
done
if [ "$COUNT" -eq 0 ]; then
  TARGET="$HOME/Documents/Printing Tools"
  mkdir -p "$TARGET"
  cp "$TMP_SCRIPT" "$TARGET/InDesignBookletCreep.jsx"
  echo "No InDesign profile was found. The script was saved in $TARGET. Open InDesign once, then copy it to the User Scripts Panel folder."
  open -R "$TARGET/InDesignBookletCreep.jsx"
else
  echo "Installed in $COUNT InDesign profile(s). Open Window > Utilities > Scripts > User > Printing Tools."
fi
read -r -p "Press Enter to close..."
