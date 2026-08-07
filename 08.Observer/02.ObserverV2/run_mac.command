#!/bin/bash
# Jobs Tracker V2 (Observer) - macOS launcher (self-installing)
# Double-click this file in Finder (or run `./run_mac.command` in Terminal).

set -e
cd "$(dirname "$0")"

echo "Checking environment..."

PORTABLE_DIR="python_portable"
PORTABLE_BIN="$PORTABLE_DIR/bin/python3"
USE_VENV=1

# 1. Prefer a system Python 3 interpreter
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN=python3
    echo "System Python found. Using system Python..."
elif [ -x "$PORTABLE_BIN" ]; then
    # 2. Reuse a previously downloaded portable Python
    PYTHON_BIN="$(pwd)/$PORTABLE_BIN"
    USE_VENV=0
    echo "Portable Python found. Using portable Python..."
else
    # 3. No system Python -> download a self-contained build (no admin rights needed)
    echo "System Python not found. Installing portable Python environment..."

    case "$(uname -m)" in
        arm64)  PBS_ARCH=aarch64 ;;
        x86_64) PBS_ARCH=x86_64 ;;
        *)
            echo "Error: Unsupported Mac architecture: $(uname -m)"
            read -p "Press Enter to close..."
            exit 1
            ;;
    esac

    echo "Looking up latest portable Python 3.11 build for macOS ($PBS_ARCH)..."
    RELEASE_JSON=$(curl -fsSL "https://api.github.com/repos/astral-sh/python-build-standalone/releases/latest") || {
        echo "Error: Could not reach GitHub to look up the Python build. Check your internet connection."
        read -p "Press Enter to close..."
        exit 1
    }

    DOWNLOAD_URL=$(printf '%s' "$RELEASE_JSON" \
        | grep -o '"browser_download_url": *"[^"]*"' \
        | sed -E 's/"browser_download_url": *"([^"]*)"/\1/' \
        | grep "cpython-3\.11\." \
        | grep "${PBS_ARCH}-apple-darwin-install_only\.tar\.gz" \
        | head -n1)

    if [ -z "$DOWNLOAD_URL" ]; then
        echo "Error: Could not find a matching portable Python build."
        echo "Please install Python manually: brew install python"
        echo "or download it from https://www.python.org/downloads/macos/"
        read -p "Press Enter to close..."
        exit 1
    fi

    echo "Downloading portable Python..."
    curl -fsSL "$DOWNLOAD_URL" -o python_embed.tar.gz || {
        echo "Error: Failed to download portable Python!"
        read -p "Press Enter to close..."
        exit 1
    }

    echo "Extracting Python..."
    mkdir -p "$PORTABLE_DIR"
    tar -xzf python_embed.tar.gz -C "$PORTABLE_DIR" --strip-components=1
    rm -f python_embed.tar.gz

    PYTHON_BIN="$(pwd)/$PORTABLE_BIN"
    USE_VENV=0
fi
echo "Using $("$PYTHON_BIN" --version)"

# 4. Set up an isolated environment
if [ "$USE_VENV" -eq 1 ]; then
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        "$PYTHON_BIN" -m venv .venv
    fi
    echo "Activating virtual environment..."
    source .venv/bin/activate
    PYTHON_BIN=python
fi

# 5. Install/verify dependencies
echo "Installing/verifying dependencies..."
"$PYTHON_BIN" -m pip install --quiet --upgrade pip
"$PYTHON_BIN" -m pip install --quiet flask beautifulsoup4 lxml playwright

# 6. Install the Chromium browser Playwright needs for LinkedIn/jobs.bg scraping
echo "Installing browser for LinkedIn/jobs.bg scraping (first run only, may take a minute)..."
"$PYTHON_BIN" -m playwright install chromium

# 7. Start the server and open the browser
echo "Server is starting on http://127.0.0.1:5001 ..."
( sleep 4 && open "http://127.0.0.1:5001" ) &
"$PYTHON_BIN" app.py

read -p "Server stopped. Press Enter to close..."
