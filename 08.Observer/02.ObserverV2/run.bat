@echo off
title Jobs Tracker V2
cd /d "%~dp0"

:: Create a Desktop shortcut with the app icon on first run
if not exist "%USERPROFILE%\Desktop\Jobs Tracker V2.lnk" (
    if exist "%~dp0static\favicon.ico" (
        echo Creating Desktop shortcut...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\Jobs Tracker V2.lnk'); $s.TargetPath = '%~f0'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0static\favicon.ico'; $s.Save()"
    )
)

echo [1/3] Checking and installing required Python libraries...
python -m pip install flask beautifulsoup4 lxml playwright --quiet
if errorlevel 1 (
    echo [Error] Failed to install the Python libraries.
    echo Make sure Python is installed and added to PATH.
    pause
    exit /b 1
)

echo [2/3] Checking and installing the Playwright browser (Chromium)...
echo This is required for scraping LinkedIn and jobs.bg.
python -m playwright install chromium
if errorlevel 1 (
    echo [Error] Failed to install the Playwright Chromium browser.
    echo LinkedIn and jobs.bg scraping will not work until this is fixed.
    pause
    exit /b 1
)

echo [3/3] Starting the server...
echo Your browser will open automatically in a few seconds.
echo NOTE: the first page load takes a bit longer, since the app
echo refreshes listings from dev.bg/LinkedIn/jobs.bg live.
echo To stop the server, close this window or press CTRL+C.
echo -------------------------------------------------------------------
start "" cmd /c "timeout /t 4 /nobreak > nul & start http://127.0.0.1:5001"
python app.py
pause
