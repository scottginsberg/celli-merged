@echo off
echo ================================================
echo    Starting Pockit Development Server (Node.js)
echo ================================================
echo.
echo Server starting on http://localhost:8000
echo.
echo Opening in browser:
echo   - Scale Ultra: http://localhost:8000/scale-ultra.html
echo   - Story Engine: http://localhost:8000/story.html
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Open browser tabs after a short delay
start /B cmd /c "timeout /t 3 /nobreak > nul && start http://localhost:8000/scale-ultra.html && timeout /t 1 /nobreak > nul && start http://localhost:8000/story.html"

REM Start Node.js server (this keeps running)
call npx --yes http-server -p 8000 -c-1

