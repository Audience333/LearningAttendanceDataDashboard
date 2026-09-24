@echo off
setlocal
PowerShell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dashboard.ps1"
if errorlevel 1 (
  echo.
  echo 启动失败，请查看上面的提示。
  pause
)
endlocal
