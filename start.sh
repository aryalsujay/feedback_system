#!/bin/bash

# Global Pagoda Feedback System - Startup Script

echo "=========================================="
echo "☸️  Starting Global Pagoda Feedback System"
echo "=========================================="

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down server..."
    if [ -n "$SERVER_PID" ]; then
        kill $SERVER_PID
    fi
    exit
}

# Trap SIGINT (Ctrl+C) to run cleanup
trap cleanup SIGINT

# --------------------------------------------
# 1. Server Setup & Start
# --------------------------------------------
echo "🔹 Checking Backend (Server)..."
cd server

if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
else
    echo "✅ Server dependencies found."
fi

echo "🚀 Starting Server on port 5001..."
# Run node directly
node index.js &
SERVER_PID=$!

# Wait a moment for server to initialize
sleep 2

# --------------------------------------------
# 2. Client Setup & Start
# --------------------------------------------
cd ../client
echo ""
echo "🔹 Checking Frontend (Client)..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
else
    echo "✅ Client dependencies found."
fi

echo "🚀 Starting Frontend Dashboard..."
echo "👉 Application will be available at: http://localhost:5173"
echo "   (Press Ctrl+C to stop both server and client)"
echo "------------------------------------------"

npm run dev
