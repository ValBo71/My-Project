@echo off
title Printing Catalog Server
echo Starting Setup...

python --version >nul 2>&1
if errorlevel 1 goto nopython

if exist .venv goto activate
echo Creating virtual environment...
python -m venv .venv

:activate
echo Activating virtual environment...
call .venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

if not exist database mkdir database
if not exist uploads mkdir uploads

echo Server is starting...

python app.py
goto end

:nopython
echo Error: Python is not installed or not in PATH!
pause

:end
pause
