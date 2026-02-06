#!/bin/bash

# Feedback System Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "================================================"
echo "   Global Pagoda Feedback System Deployment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo ""

# Step 1: Kill any manually running processes on port 5001
print_warning "Checking for processes on port 5001..."
if lsof -ti:5001 >/dev/null 2>&1; then
    PIDS=$(lsof -ti:5001)
    for PID in $PIDS; do
        # Check if it's NOT the systemd service
        if ! ps -p $PID -o cmd= | grep -q "systemd"; then
            print_warning "Killing manual process $PID on port 5001..."
            kill $PID 2>/dev/null || true
            sleep 2
        fi
    done
    print_status "Cleaned up manual processes"
else
    print_status "No manual processes found on port 5001"
fi
echo ""

# Step 2: Install/Update dependencies (if needed)
print_warning "Checking dependencies..."
if [ -f "server/package.json" ]; then
    cd server
    if [ ! -d "node_modules" ]; then
        print_warning "Installing server dependencies..."
        npm install
    else
        print_status "Server dependencies OK"
    fi
    cd ..
fi

if [ -f "client/package.json" ]; then
    cd client
    if [ ! -d "node_modules" ]; then
        print_warning "Installing client dependencies..."
        npm install
    else
        print_status "Client dependencies OK"
    fi
    cd ..
fi
echo ""

# Step 3: Build the client
print_warning "Building client application..."
cd client
rm -rf dist  # Clean old build
npm run build
if [ $? -eq 0 ]; then
    print_status "Client built successfully"
else
    print_error "Client build failed!"
    exit 1
fi
cd ..
echo ""

# Step 4: Restart the systemd service
print_warning "Waiting for service to auto-restart..."
echo "  (The systemd service will restart automatically in ~10 seconds)"
sleep 12

# Check if service started successfully
if systemctl is-active --quiet feedback-system.service; then
    print_status "Service restarted successfully"
else
    print_error "Service failed to start!"
    echo ""
    echo "Checking logs..."
    journalctl -u feedback-system.service -n 20 --no-pager 2>/dev/null || echo "Run: sudo journalctl -u feedback-system.service -n 20"
    exit 1
fi
echo ""

# Step 5: Verify everything is running
print_warning "Verifying deployment..."

# Check if port 5001 is listening
if lsof -ti:5001 >/dev/null 2>&1; then
    print_status "Backend server is listening on port 5001"
else
    print_error "Backend is not listening on port 5001"
    exit 1
fi

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_warning "Nginx is not running"
fi

echo ""
echo "================================================"
echo "           Deployment Complete! ✓"
echo "================================================"
echo ""
echo "Service Status:"
systemctl status feedback-system.service --no-pager -l 2>/dev/null | head -15 || echo "Service is running (run 'sudo systemctl status feedback-system' for details)"
echo ""
echo "Access your application at:"
echo "  → http://172.12.0.28/feedback/global_pagoda"
echo "  → http://172.12.0.28/feedback/souvenir_shop"
echo "  → http://172.12.0.28/feedback/dhamma_alaya"
echo "  → http://172.12.0.28/feedback/food_court"
echo "  → http://172.12.0.28/feedback/dpvc"
echo ""
echo "View logs: journalctl -u feedback-system.service -f"
echo "           (or with sudo for full access)"
echo ""
