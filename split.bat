@echo off
REM Wrapper to run the PowerShell splitter script
powershell -ExecutionPolicy Bypass -File "%~dp0split.ps1"
