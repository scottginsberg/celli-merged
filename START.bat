@echo off
echo ================================================
echo    🚀 POCKIT TOOLS - Quick Start
echo ================================================
echo.
echo Starting development server on PORT 3000...
echo.
echo Available tools:
echo   - Tools Hub:      http://localhost:3000/index-tools.html
echo   - Asset Evaluator: http://localhost:3000/asset-evaluator.html
echo   - Room Builder:    http://localhost:3000/interiors.html
echo   - Scale Ultra:     http://localhost:3000/scale-ultra.html
echo   - Narrative Demo:  http://localhost:3000/narrative-demo.html
echo.
echo Opening Tools Hub in your browser...
echo ================================================
echo.

REM Open browser after a short delay
start /B cmd /c "timeout /t 2 /nobreak > nul && start http://localhost:3000/index-tools.html"

REM Start Python server (this keeps running)
python -m http.server 3000
