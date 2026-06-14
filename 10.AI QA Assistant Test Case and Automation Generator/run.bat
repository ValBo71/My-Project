@echo off
title AI QA Assistant Launcher
echo ===================================================
echo             AI QA Assistant Launcher
echo ===================================================
echo.

echo [1/2] Starting C# ASP.NET Core Backend API...
start "AI QA Assistant API Backend" cmd /k "cd src\AIQAAssistant.Api && dotnet run"

echo.
echo [2/2] Starting React + Vite Frontend Web App...
start "AI QA Assistant React Frontend" cmd /k "cd src\AIQAAssistant.Web && npm run dev"

echo.
echo ===================================================
echo  Both services have been launched in separate windows!
echo  - Backend API will run on http://localhost:5131
echo  - Frontend App will run on http://localhost:5173
echo ===================================================
echo.
pause
