#!/bin/bash

# Server Restart Script
# Use this to restart the server after syncing passwords or making changes

echo ""
echo "========================================"
echo "  Restarting Feedback Server"
echo "========================================"
echo ""

# Restart systemd service
echo "🛑 Restarting systemd service..."

# Try to restart with sudo (works if passwordless sudo is configured)
if sudo -n systemctl restart feedback-system.service 2>/dev/null; then
    echo "✅ Service restart initiated"
    sleep 3
elif systemctl --user restart feedback-system.service 2>/dev/null; then
    echo "✅ Service restart initiated (user mode)"
    sleep 3
else
    echo "⚠️  Automatic restart failed. Please manually restart:"
    echo "   sudo systemctl restart feedback-system.service"
    echo ""
    echo "To enable automatic restart, see SUDO_SETUP.md"
    read -p "Press Enter after restarting the service..."
fi

# Check if server is running
if systemctl is-active --quiet feedback-system.service; then
    echo "✅ Service is running"
else
    echo "⚠️  Service may not be running. Checking status..."
    systemctl status feedback-system.service --no-pager -l | head -15
fi

# Check if port 5001 is listening
if lsof -i:5001 > /dev/null 2>&1; then
    PID=$(lsof -ti:5001)
    echo "✅ Server is listening on port 5001 (PID: $PID)"
    echo "🔗 Server running at: http://localhost:5001"
    echo ""
    echo "📊 You can now login with your updated password!"
    echo ""
else
    echo "❌ Server is not listening on port 5001"
    echo "   Check logs: journalctl -u feedback-system -n 50"
    exit 1
fi
