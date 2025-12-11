#!/bin/bash

# R3SN Integrated Server Startup Script
# Starts the fully integrated server with all engines connected

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 Starting R3SN Integrated Server                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  MongoDB is not running on localhost:27017"
    echo "   Please start MongoDB first:"
    echo "   - macOS: brew services start mongodb-community"
    echo "   - Linux: sudo systemctl start mongod"
    echo "   - Windows: net start MongoDB"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to backend directory
cd backend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created. Please configure it with your settings."
        echo ""
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Start the integrated server
echo "🚀 Starting integrated server..."
echo ""

# Use NODE_ENV from argument or default to development
NODE_ENV=${1:-development}

if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting in PRODUCTION mode..."
    NODE_ENV=production node server-integrated.js
else
    echo "🔧 Starting in DEVELOPMENT mode..."
    NODE_ENV=development node server-integrated.js
fi
