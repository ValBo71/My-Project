@echo off
echo ===================================================
echo   Generating Allure Report for API Tests...
echo ===================================================
cd /d "%~dp0\AutomationExercise.ApiTests\bin\Debug\net9.0"
allure generate allure-results --clean -o allure-report
echo.
echo Launching Allure Report server...
allure open allure-report
