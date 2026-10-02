@echo off
TITLE BloodConnect Full-Stack Launcher
echo ===================================================================
echo           BLOODCONNECT HEALTHCARE SYSTEM INITIALIZATION
echo ===================================================================
echo.
echo Starting 3 core services:
echo 1. Backend REST API on http://localhost:5000
echo 2. Donor Web Application on http://localhost:5173
echo 3. Admin Web Portal on http://localhost:5174
echo.

cd /d "%~dp0"

start "BloodConnect Backend API [Port 5000]" cmd /k "cd backend && npm.cmd start"
timeout /t 3 /nobreak >nul

start "BloodConnect Donor Web [Port 5173]" cmd /k "cd donor-web && npm.cmd run dev"
timeout /t 2 /nobreak >nul

start "BloodConnect Admin Web [Port 5174]" cmd /k "cd admin-web && npm.cmd run dev"
timeout /t 3 /nobreak >nul

echo.
echo Opening browser applications...
start http://localhost:5173
start http://localhost:5174

echo ===================================================================
echo All services launched! Keep the terminal windows open.
echo ===================================================================
pause
