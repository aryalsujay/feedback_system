#!/bin/bash

# Server Restart Script
# Use this to restart the server after syncing passwords or making changes

echo ""
echo "========================================"
echo "  Restarting Feedback Server"
echo "========================================"
echo ""

# Stop all node processes on port 5001
echo "🛑 Stopping existing server..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 2

# Verify port is free
if lsof -i:5001 > /dev/null 2>&1; then
    echo "❌ Port 5001 is still in use. Please run: sudo systemctl stop feedback-system"
    exit 1
fi

echo "✅ Port 5001 is free"
echo ""

# Navigate to server directory
cd "$(dirname "$0")/../server" || exit 1

# Start server
echo "🚀 Starting server..."
nohup node index.js > /dev/null 2>&1 &
SERVER_PID=$!

sleep 3

# Check if server is running
if lsof -i:5001 > /dev/null 2>&1; then
    echo "✅ Server started successfully (PID: $SERVER_PID)"
    echo "🔗 Server running at: http://localhost:5001"
    echo ""
    echo "📊 You can now login with your updated password!"
    echo ""
else
    echo "❌ Server failed to start. Check logs with:"
    echo "   journalctl -u feedback-system --no-pager -n 50"
    exit 1
fi
