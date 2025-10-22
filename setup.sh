#!/bin/bash

# Pack Your Bags - Quick Setup Script
# This script helps set up the development environment

echo "🚀 Pack Your Bags - Quick Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL."
    echo "   You can continue with the setup, but you'll need PostgreSQL to run the application."
else
    echo "✅ PostgreSQL is installed"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Create environment files if they don't exist
echo ""
echo "🔧 Setting up environment files..."

cd ../backend
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created backend/.env from env.example"
        echo "⚠️  Please update backend/.env with your database credentials"
    else
        echo "⚠️  No env.example found. Please create backend/.env manually"
    fi
else
    echo "✅ Backend .env file already exists"
fi

cd ../frontend
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created frontend/.env from env.example"
        echo "⚠️  Please update frontend/.env with your API URL and Stripe keys"
    else
        echo "⚠️  No env.example found. Please create frontend/.env manually"
    fi
else
    echo "✅ Frontend .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Update frontend/.env with your API URL and Stripe keys (optional)"
echo "3. Start PostgreSQL database"
echo "4. Run 'npm run dev' in the backend directory"
echo "5. Run 'npm run dev' in the frontend directory"
echo "6. Open http://localhost:5173 in your browser"
echo ""
echo "💡 For Stripe integration:"
echo "   - Get your keys from https://dashboard.stripe.com/apikeys"
echo "   - Add them to your .env files"
echo "   - The app works without Stripe using auto payment mode"
echo ""
echo "🧪 To test the payment system:"
echo "   - Run 'node test-payment.js' after starting the servers"
echo ""
echo "📖 For more information, see README.md"

