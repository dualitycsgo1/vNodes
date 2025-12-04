@echo off
title Building vNodes
echo.
echo ===============================================
echo    Building vNodes Distribution
echo ===============================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Building executable...
call npm run build:win

echo.
echo Copying additional files...
if not exist "dist" mkdir dist
if exist "dist\public" rmdir /s /q "dist\public"
if exist "dist\presets" rmdir /s /q "dist\presets"
xcopy "public" "dist\public\" /E /I /Y >nul
if not exist "dist\presets" mkdir "dist\presets"
if exist "presets\*.json" xcopy "presets\*.json" "dist\presets\" /Y >nul
copy "gamestate_integration_cstrigger.cfg" "dist\" >nul
copy "DISTRIBUTION-README.md" "dist\README.md" >nul
copy "run-cstrigger.bat" "dist\run-vnodes.bat" >nul

echo.
echo ===============================================
echo    Build Complete!
echo ===============================================
echo.
echo Your standalone vNodes application is ready in the 'dist' folder:
echo   - vnodes.exe (main application)
echo   - public/ (web interface files)
echo   - presets/ (preset storage folder)
echo   - run-vnodes.bat (easy launcher)
echo   - gamestate_integration_cstrigger.cfg (CS:GO config file)
echo   - README.md (documentation)
echo.
echo To distribute: Simply copy the entire 'dist' folder to any Windows machine.
echo To run: Double-click 'run-vnodes.bat' in the dist folder.
echo.
pause