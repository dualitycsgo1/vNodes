@echo off
title vNodes - vMix Node Editor
echo.
echo ===============================================
echo    vNodes - Node-Based vMix Integration
echo ===============================================
echo.
echo Starting server on http://localhost:8082
echo Web interface will be available shortly...
echo.
echo Press Ctrl+C to stop the server
echo.

"%~dp0vnodes.exe"

echo.
echo Server stopped. Press any key to exit...
pause >nul