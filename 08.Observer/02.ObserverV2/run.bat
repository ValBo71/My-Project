@echo off
title Jobs Tracker
chcp 65001 > nul

:: Navigate to the script's directory
cd /d "%~dp0"

:: Create a Desktop shortcut with the app icon on first run
if not exist "%USERPROFILE%\Desktop\Jobs Tracker V2.lnk" (
    if exist "%~dp0static\favicon.ico" (
        echo Създаване на икона на работния плот...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\Jobs Tracker V2.lnk'); $s.TargetPath = '%~f0'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0static\favicon.ico'; $s.Save()"
    )
)

echo [1/3] Проверка и инсталиране на необходимите Python библиотеки...
python -m pip install flask beautifulsoup4 lxml playwright --quiet
if errorlevel 1 (
    echo [Грешка] Инсталирането на Python библиотеките се провали.
    echo Уверете се, че Python е инсталиран и е добавен в PATH.
    pause
    exit /b 1
)

echo [2/3] Проверка и инсталиране на Playwright браузър (Chromium)...
echo Това е необходимо за скрапването на LinkedIn и jobs.bg.
python -m playwright install chromium
if errorlevel 1 (
    echo [Грешка] Инсталирането на Playwright Chromium се провали.
    echo LinkedIn и jobs.bg скрапването няма да работи, докато не се коригира.
    pause
    exit /b 1
)

echo [3/3] Стартиране на сървъра...
echo Браузърът ще се отвори автоматично след няколко секунди.
echo ЗАБЕЛЕЖКА: първото зареждане на страницата отнема допълнително време,
echo защото приложението обновява обявите от dev.bg/LinkedIn/jobs.bg в реално време.
echo За да спрете сървъра, затворете този прозорец или натиснете CTRL+C.
echo -------------------------------------------------------------------
start "" cmd /c "timeout /t 4 /nobreak > nul & start http://127.0.0.1:5001"
python app.py
pause
