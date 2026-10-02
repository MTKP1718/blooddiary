# BloodConnect Full-Stack PowerShell Launcher
Write-Host "===================================================================" -ForegroundColor Red
Write-Host "          BLOODCONNECT HEALTHCARE SYSTEM INITIALIZATION            " -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Starting services:" -ForegroundColor Yellow
Write-Host "1. Backend REST API on http://localhost:5000" -ForegroundColor Cyan
Write-Host "2. Donor Web Application on http://localhost:5173" -ForegroundColor Green
Write-Host "3. Admin Web Portal on http://localhost:5174" -ForegroundColor Magenta
Write-Host ""

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm.cmd start"
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\donor-web'; npm.cmd run dev"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\admin-web'; npm.cmd run dev"
Start-Sleep -Seconds 2

Start-Process "http://localhost:5173"
Start-Process "http://localhost:5174"

Write-Host "All applications are running! Check your browser." -ForegroundColor Green
