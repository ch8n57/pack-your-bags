@echo off
REM Pack Your Bags - Quick Setup Script for Windows
REM This script helps set up the development environment

echo 🚀 Pack Your Bags - Quick Setup
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if PostgreSQL is available
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL is not installed. Please install PostgreSQL.
    echo    You can continue with the setup, but you'll need PostgreSQL to run the application.
) else (
    echo ✅ PostgreSQL is installed
)

echo.
echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "package.json" (
    echo ❌ package.json not found in backend directory
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
if not exist "package.json" (
    echo ❌ package.json not found in frontend directory
    pause
    exit /b 1
)

call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed

REM Create environment files if they don't exist
echo.
echo 🔧 Setting up environment files...

cd ..\backend
if not exist ".env" (
    if exist "env.example" (
        copy env.example .env
        echo ✅ Created backend\.env from env.example
        echo ⚠️  Please update backend\.env with your database credentials
    ) else (
        echo ⚠️  No env.example found. Please create backend\.env manually
    )
) else (
    echo ✅ Backend .env file already exists
)

cd ..\frontend
if not exist ".env" (
    if exist "env.example" (
        copy env.example .env
        echo ✅ Created frontend\.env from env.example
        echo ⚠️  Please update frontend\.env with your API URL and Stripe keys
    ) else (
        echo ⚠️  No env.example found. Please create frontend\.env manually
    )
) else (
    echo ✅ Frontend .env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your database credentials
echo 2. Update frontend\.env with your API URL and Stripe keys (optional)
echo 3. Start PostgreSQL database
echo 4. Run 'npm run dev' in the backend directory
echo 5. Run 'npm run dev' in the frontend directory
echo 6. Open http://localhost:5173 in your browser
echo.
echo 💡 For Stripe integration:
echo    - Get your keys from https://dashboard.stripe.com/apikeys
echo    - Add them to your .env files
echo    - The app works without Stripe using auto payment mode
echo.
echo 🧪 To test the payment system:
echo    - Run 'node test-payment.js' after starting the servers
echo.
echo 📖 For more information, see README.md
echo.
pause
