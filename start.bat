@echo off
title Expense Tracker Launcher
echo ===================================================
echo           Starting Expense Tracker
echo ===================================================

echo [1/2] Launching Backend Server on http://localhost:5001...
start "Expense Tracker - Backend (Port 5001)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/2] Launching Frontend Server on http://localhost:5180...
start "Expense Tracker - Frontend (Port 5180)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting up in separate terminal windows.
echo Opening browser at http://localhost:5180 in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:5180

echo.
echo Application launched! You can close this launcher window.
echo Keep the backend and frontend terminal windows open while using the app.

