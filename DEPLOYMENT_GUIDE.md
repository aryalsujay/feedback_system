# Quick Deployment Guide

## 📦 Simple Deployment (Recommended)

After making any code changes, just run:

```bash
cd /home/feedback/feedback_system
./deploy.sh
```

That's it! The script will:
- ✓ Clean up any conflicting processes
- ✓ Rebuild the client application
- ✓ Restart the backend service
- ✓ Verify everything is running

---

## 🔧 Manual Steps (If Needed)

### 1. Build Client Only
```bash
cd /home/feedback/feedback_system/client
npm run build
```

### 2. Restart Backend Service
```bash
sudo systemctl restart feedback-system.service
```

### 3. Check Service Status
```bash
sudo systemctl status feedback-system.service
```

### 4. View Live Logs
```bash
sudo journalctl -u feedback-system.service -f
```

### 5. Check What's Using Port 5001
```bash
lsof -i :5001
# If you see a manual process, kill it:
kill <PID>
```

---

## 🌐 Access URLs

- **Global Pagoda**: http://172.12.0.28/feedback/global_pagoda
- **Souvenir Shop**: http://172.12.0.28/feedback/souvenir_shop
- **Dhammalaya**: http://172.12.0.28/feedback/dhamma_alaya
- **Food Court**: http://172.12.0.28/feedback/food_court
- **DPVC**: http://172.12.0.28/feedback/dpvc
- **Admin Panel**: http://172.12.0.28/admin

---

## 📧 Email Configuration

All weekly reports are sent to configured department emails with:
- **BCC**: aryalsujay@gmail.com (for monitoring)
- **Schedule**: Every Sunday at 09:00 IST

---

## 🚨 Troubleshooting

### Service won't start - "Port already in use"
```bash
# Find and kill the process
lsof -i :5001
kill <PID>
sudo systemctl restart feedback-system.service
```

### Changes not visible in browser
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Or use Incognito mode
3. Make sure you ran `./deploy.sh`

### Check if service is running
```bash
sudo systemctl status feedback-system.service
```

### View error logs
```bash
sudo journalctl -u feedback-system.service -n 50
```

---

## 📁 Important Files

- **Client Code**: `/home/feedback/feedback_system/client/src/`
- **Server Code**: `/home/feedback/feedback_system/server/`
- **Questions Config**: `/home/feedback/feedback_system/config/questions.json`
- **Email Config**: `/home/feedback/feedback_system/config/emails.json`
- **Service Config**: `/etc/systemd/system/feedback-system.service`
- **Nginx Config**: `/etc/nginx/sites-available/feedback.globalpagoda.org`

---

## 🔄 Common Tasks

### Update feedback questions
1. Edit `/home/feedback/feedback_system/config/questions.json`
2. Run `./deploy.sh`

### Update email recipients
1. Edit `/home/feedback/feedback_system/config/emails.json`
2. Run `./deploy.sh`

### Update form fields
1. Edit `/home/feedback/feedback_system/client/src/pages/FeedbackForm.jsx`
2. Run `./deploy.sh`

---

## ⏰ Weekly Report Schedule

Reports are automatically sent every **Sunday at 09:00 IST** to configured department emails.

To change the schedule:
1. Log in to Admin Panel
2. Go to Settings
3. Adjust the schedule for each department

---

**Need help?** Check the logs: `sudo journalctl -u feedback-system.service -f`
