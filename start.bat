@echo off
REM R3SN Workflow Engine - Quick Start Script (Windows)

echo 🚀 Starting R3SN Workflow Engine...
echo.

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js ^>= 18.0.0
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Check if .env exists
if not exist ".env" (
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)

echo.
echo 🎉 Starting server...
echo.

REM Start the server
call npm start
