#!/bin/bash

# Feedback System Deployment Script
# This script handles the complete deployment process
# CONTAINS SUDO PASSWORD - NEVER COMMIT TO GIT!

set -e  # Exit on any error

# Sudo password for automated deployment
SUDO_PASS="Pagoda@999"

echo "================================================"
echo "   Global Pagoda Feedback System Deployment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_info "Working directory: $SCRIPT_DIR"
echo ""

# Step 0: Kill Vite dev server processes (if running)
print_warning "Checking for Vite dev server processes..."
VITE_PIDS=$(ps aux | grep -E "vite|npm run dev" | grep -v grep | awk '{print $2}' || true)
if [ ! -z "$VITE_PIDS" ]; then
    print_warning "Killing Vite dev server processes..."
    echo "$SUDO_PASS" | sudo -S kill -9 $VITE_PIDS 2>/dev/null || true
    sleep 2
    print_status "Vite dev server processes killed"
else
    print_status "No Vite dev server processes found"
fi
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
    # Show bundle size
    BUNDLE_SIZE=$(ls -lh dist/assets/*.js 2>/dev/null | awk '{print $5}' | head -1)
    print_info "Bundle size: $BUNDLE_SIZE"
else
    print_error "Client build failed!"
    exit 1
fi
cd ..
echo ""

# Step 4: Restart Nginx (with sudo password)
print_warning "Restarting Nginx..."
echo "$SUDO_PASS" | sudo -S systemctl restart nginx
if [ $? -eq 0 ]; then
    print_status "Nginx restarted successfully"
    sleep 2
else
    print_error "Failed to restart Nginx!"
    exit 1
fi
echo ""

# Step 5: Restart the backend server
print_warning "Restarting backend server..."

# Check if using systemd service
if systemctl list-units --type=service --all | grep -q "feedback-system.service"; then
    print_info "Using systemd service..."
    echo "$SUDO_PASS" | sudo -S systemctl restart feedback-system.service
    sleep 3

    if systemctl is-active --quiet feedback-system.service; then
        print_status "Service restarted successfully"
    else
        print_error "Service failed to start!"
        echo ""
        echo "Checking logs..."
        echo "$SUDO_PASS" | sudo -S journalctl -u feedback-system.service -n 20 --no-pager
        exit 1
    fi
else
    # Manual restart if no systemd service
    print_info "No systemd service found, restarting manually..."

    # Kill existing backend process
    BACKEND_PID=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}' | head -1)
    if [ ! -z "$BACKEND_PID" ]; then
        print_warning "Killing existing backend process ($BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
    fi

    # Start new backend process
    cd server
    nohup node index.js > /tmp/feedback-backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..

    sleep 3

    if ps -p $BACKEND_PID > /dev/null; then
        print_status "Backend started successfully (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start!"
        cat /tmp/feedback-backend.log
        exit 1
    fi
fi
echo ""

# Step 6: Verify everything is running
print_warning "Verifying deployment..."

# Wait for backend to be ready
sleep 2

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
    print_error "Nginx is not running"
    exit 1
fi
echo ""

# Step 7: Run automated tests
print_warning "Running deployment tests..."

# Test 1: Homepage
TEST_COUNT=0
PASS_COUNT=0

TEST_COUNT=$((TEST_COUNT + 1))
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/ | grep -q "200"; then
    print_status "Test 1/6: Homepage loads"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 1/6: Homepage failed"
fi

# Test 2: Food Court form
TEST_COUNT=$((TEST_COUNT + 1))
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/fc | grep -q "200"; then
    print_status "Test 2/6: Food Court form loads"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 2/6: Food Court form failed"
fi

# Test 3: API Config
TEST_COUNT=$((TEST_COUNT + 1))
if curl -s http://localhost:5001/api/config/questions | grep -q "global_pagoda"; then
    print_status "Test 3/6: Config API works"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 3/6: Config API failed"
fi

# Test 4: Authentication
TEST_COUNT=$((TEST_COUNT + 1))
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/department-login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin977"}')
if echo "$AUTH_RESPONSE" | grep -q '"success":true'; then
    print_status "Test 4/6: Authentication works"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 4/6: Authentication failed"
fi

# Test 5: Feedback submission
TEST_COUNT=$((TEST_COUNT + 1))
SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/feedback \
    -H "Content-Type: application/json" \
    -d '{
        "departmentId":"food_court",
        "answers":{
            "food_taste":"5",
            "overall_experience":"4",
            "service_counters":"5",
            "service_speed":"4",
            "cleanliness":"5",
            "food_quality":"5",
            "suggestion":"Deployment test"
        },
        "name":"Deploy Test"
    }')
if echo "$SUBMIT_RESPONSE" | grep -q '"message":"Feedback submitted successfully"'; then
    print_status "Test 5/6: Feedback submission works"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 5/6: Feedback submission failed"
fi

# Test 6: All department URLs
TEST_COUNT=$((TEST_COUNT + 1))
ALL_DEPT_OK=true
for dept in pr fc dpvc dlaya ss; do
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/$dept | grep -q "200"; then
        ALL_DEPT_OK=false
        break
    fi
done
if [ "$ALL_DEPT_OK" = true ]; then
    print_status "Test 6/6: All department URLs work"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    print_error "Test 6/6: Some department URLs failed"
fi

echo ""
print_info "Tests passed: $PASS_COUNT/$TEST_COUNT"
echo ""

if [ $PASS_COUNT -eq $TEST_COUNT ]; then
    echo "================================================"
    echo "        ✅ Deployment Successful! ✅"
    echo "================================================"
else
    echo "================================================"
    echo "     ⚠️  Deployment Complete with Warnings ⚠️"
    echo "================================================"
fi
echo ""

# Step 8: Display access information
echo "📱 ACCESS URLS:"
echo "================================================"
echo ""
echo "🏠 HOMEPAGE (Feedback Admin Login):"
echo "  External: http://feedback.globalpagoda.org:8888/"
echo "  Internal: http://172.12.0.28/"
echo "  Login: admin / admin977"
echo ""
echo "📋 DEPARTMENT FORMS (No Login Required):"
echo "  External URLs:"
echo "    • GVP:        http://feedback.globalpagoda.org:8888/pr"
echo "    • Food Court: http://feedback.globalpagoda.org:8888/fc"
echo "    • DPVC:       http://feedback.globalpagoda.org:8888/dpvc"
echo "    • Dhammalaya: http://feedback.globalpagoda.org:8888/dlaya"
echo "    • Souvenir:   http://feedback.globalpagoda.org:8888/ss"
echo ""
echo "  Internal URLs:"
echo "    • GVP:        http://172.12.0.28/pr"
echo "    • Food Court: http://172.12.0.28/fc"
echo "    • DPVC:       http://172.12.0.28/dpvc"
echo "    • Dhammalaya: http://172.12.0.28/dlaya"
echo "    • Souvenir:   http://172.12.0.28/ss"
echo ""
echo "📊 ANALYTICS ADMIN (Hidden - Direct URL Only):"
echo "  External: http://feedback.globalpagoda.org:8888/admin/login"
echo "  Internal: http://172.12.0.28/admin/login"
echo "  Login: admin / admin123"
echo ""
echo "================================================"
echo ""
echo "⚠️  IMPORTANT: Users must clear browser cache!"
echo "   • Computer: Ctrl+Shift+R (hard refresh)"
echo "   • Mobile: Clear browsing data"
echo "   • Or test in incognito/private mode"
echo ""
echo "📝 View logs:"
echo "   journalctl -u feedback-system.service -f"
echo "   or: tail -f /tmp/feedback-backend.log"
echo ""
echo "🔄 To redeploy: ./deploy.sh"
echo ""
