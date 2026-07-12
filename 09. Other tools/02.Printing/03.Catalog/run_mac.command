#!/bin/bash
# Printing Catalog Server - macOS launcher
# Double-click this file in Finder (or run `./run_mac.command` in Terminal).

set -e
cd "$(dirname "$0")"

echo "Checking environment..."

# 1. Find a usable Python 3 interpreter
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN=python3
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN=python
else
    echo ""
    echo "Error: Python 3 was not found on this Mac."
    echo "Install it first, e.g. with Homebrew:"
    echo "    brew install python"
    echo "or download it from https://www.python.org/downloads/macos/"
    read -p "Press Enter to close..."
    exit 1
fi
echo "Using $($PYTHON_BIN --version)"

# 2. Create the virtual environment if missing
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    "$PYTHON_BIN" -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

# 3. Install/verify dependencies
echo "Installing/verifying dependencies..."
python -m pip install --quiet --upgrade pip
python -m pip install -r requirements.txt

# 4. Ensure required directories exist
mkdir -p database uploads

# 5. Start the server and open the browser
echo "Server is starting on http://localhost:5050 ..."
( sleep 1 && open "http://localhost:5050" ) &
python app.py

read -p "Server stopped. Press Enter to close..."
