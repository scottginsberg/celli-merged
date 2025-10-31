@echo off
echo ================================================
echo    Starting Pockit Development Server
echo ================================================
echo.
echo Server starting on http://localhost:3000
echo.
echo Opening in browser:
echo   - Tools Hub: http://localhost:3000/index-tools.html
echo   - Asset Evaluator: http://localhost:3000/asset-evaluator.html
echo   - Room Builder: http://localhost:3000/interiors.html
echo   - Scale Ultra: http://localhost:3000/scale-ultra.html
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Open browser tabs after a short delay
start /B cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:3000/index-tools.html"

REM Start Python server (this keeps running)
python -m http.server 3000

