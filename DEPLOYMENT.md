# 🚀 Global Pagoda Feedback System - Deployment Guide

This guide provides step-by-step instructions for deploying this system on an Ubuntu server (4GB RAM, 30GB Storage), ensuring it runs 24/7.

## 1️⃣ System Preparation
Run these commands to install Node.js and process management tools:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

## 2️⃣ Clone & Setup
Clone your repository and install dependencies:
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd feedback_system

# Build Frontend
cd client
npm install
npm run build

# Setup Backend
cd ../server
npm install
# CREATE YOUR .env FILE:
# nano .env (Paste your environment variables: SMTP, DB, JWT_SECRET, etc.)
```

## 3️⃣ Firewall Configuration
Allow the application port (default is 5001):
```bash
sudo ufw allow 5001
```

## 4️⃣ Run with PM2 (24/7 Uptime)
PM2 will keep the app running and restart it if the server reboots.
```bash
# Still in the server directory
pm2 start index.js --name "feedback-system"
pm2 save
pm2 startup
# (Run the command PM2 prints to finalize startup)
```

## 5️⃣ Verification
Once running, the server will log its accessible IP addresses:
```bash
pm2 logs feedback-system
```
Look for: `🔗 Network Address: http://<YOUR_SERVER_IP>:5001`
