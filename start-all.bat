@echo off
title Fundraiser Platform Launcher
echo ============================================================
echo   Launching KindWave Fundraiser Platform (Backend + Frontend)
echo ============================================================

start "Fundraiser Server (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul
start "Fundraiser Client (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Both servers are launching:
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173
echo.
pause
