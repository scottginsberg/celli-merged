@echo off
REM Cell.real - Quick Start Server
REM Starts local server and opens browser

echo ========================================
echo CELL.REAL - QUICK START
echo ========================================
echo.
echo Starting local server...
echo.

REM Check if node/npx is available
where npx >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npx not found!
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Start server in background and open browser
echo Server starting on http://localhost:3000/
echo.
echo Opening browser...
echo.

REM Open browser (will open when server is ready)
start http://localhost:3000/

REM Start server (this will block - keep window open)
echo ========================================
echo SERVER RUNNING
echo ========================================
echo.
echo Application: http://localhost:3000/
echo.
echo Scenes available:
echo - Intro sequence (Play button)
echo - CELLI.REAL (Scene Select ^> Debug ^> CELLI.REAL)
echo - EXEC.ENV (Scene Select ^> Debug ^> EXEC.ENV)
echo   - Choose Sequence or Debug mode!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npx serve -p 3000

REM Server stopped
echo.
echo Server stopped.
pause

