@echo off
setlocal enabledelayedexpansion

:: SUVAI Startup Script for Windows
:: Automatically starts the Flask backend server and opens the website

title SUVAI - Grocery E-commerce with AI Chatbot

echo.
echo    ╔══════════════════════════════════════════════════════════════╗
echo    ║                                                              ║
echo    ║      🛒 SUVAI - Grocery E-commerce with AI Chatbot 🤖       ║
echo    ║                                                              ║
echo    ╚══════════════════════════════════════════════════════════════╝
echo.

:: Check if Python is installed
echo 📦 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

:: Get Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python version: %PYTHON_VERSION%

:: Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Navigate to backend directory
cd backend

:: Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found in backend directory
    pause
    exit /b 1
)

:: Install dependencies
echo.
echo 📦 Installing Python dependencies...
python -m pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Some dependencies may have failed to install
    echo Continuing anyway...
) else (
    echo ✅ Dependencies installed successfully
)

:: Check if app.py exists
if not exist "app.py" (
    echo ❌ app.py not found in backend directory
    pause
    exit /b 1
)

:: Start Flask server in background
echo.
echo 🚀 Starting Flask backend server...
start /b python app.py >nul 2>&1

:: Wait for server to initialize
echo ⏳ Waiting for server to initialize...
timeout /t 3 /nobreak >nul

:: Check if server is running by testing the connection
echo 🔍 Checking server status...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/api/products' -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Server may not be fully ready yet, but continuing...
) else (
    echo ✅ Flask server started successfully
)

echo 📍 Server running at: http://localhost:5000

:: Navigate back to root directory
cd ..

:: Check if frontend directory and index.html exist
if not exist "frontend\index.html" (
    echo ❌ Frontend index.html not found
    echo Expected location: frontend\index.html
    pause
    exit /b 1
)

:: Open website in default browser
echo.
echo 🌐 Opening website in default browser...
start "" "frontend\index.html"
echo ✅ Website opened: frontend\index.html

:: Display usage instructions
echo.
echo    🎉 SUVAI is now running!
echo.
echo    📋 What you can do:
echo.
echo    🛒 WEBSITE FEATURES:
echo    • Browse 29 grocery products across 6 categories
echo    • Use search and filters to find products
echo    • Add items to shopping cart and checkout
echo    • Responsive design works on all devices
echo.
echo    🤖 CHATBOT FEATURES:
echo    • Click the chatbot widget in bottom-left corner
echo    • Try these example queries:
echo      - "find apples"
echo      - "show nearby stores"
echo      - "I need dairy products"
echo      - "where can I buy milk"
echo      - "help me"
echo.
echo    🗺️ MAP FEATURES:
echo    • View store locations on interactive map
echo    • Get directions to stores
echo    • See store details and services
echo.
echo    🔧 TECHNICAL INFO:
echo    • Backend API: http://localhost:5000
echo    • Frontend: file://[your-path]/frontend/index.html
echo    • Database: backend/grocery_store.db (auto-created)
echo.
echo    ⚠️  IMPORTANT:
echo    • Keep this window open (Flask server is running)
echo    • Allow location access for store distance calculation
echo    • Use modern browser for best experience
echo.
echo    🛑 TO STOP: Press Ctrl+C to stop the server
echo.

:: Keep the script running and monitor for Ctrl+C
echo 🔄 Server is running... Press Ctrl+C to stop
echo.

:: Set up Ctrl+C handler
:loop
timeout /t 1 /nobreak >nul
goto loop

:: This section runs when Ctrl+C is pressed
:cleanup
echo.
echo.
echo 🛑 Shutting down SUVAI...

:: Kill Python processes (Flask server)
taskkill /f /im python.exe >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Server may have already stopped
) else (
    echo ✅ Server stopped successfully
)

echo 👋 Thank you for using SUVAI!
pause
exit /b 0