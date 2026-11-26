@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   正在启动 宜兴休元 · 外贸 LTC 管理系统...
echo.
"C:\Users\Administrator\AppData\Local\Programs\Python\Python312\python.exe" -X utf8 "ltc_server.py"
if errorlevel 1 (
  echo.
  echo   启动失败。请确认已安装 Python 3。
  pause
)
