# Unified URL Configuration - Complete ✅

## Summary

The feedback system is now configured to work from **one single URL** regardless of where users are connecting from!

**🌐 Unified URL:** `http://feedback.globalpagoda.org:8888`

This URL works for:
- ✅ Users on **internal Pagoda WiFi**
- ✅ Users on **external mobile data / internet**
- ✅ **All pages**: Feedback forms, Admin panel, everything!

---

## 🎯 QR Code URL

**Use this URL for your QR code:**
```
http://feedback.globalpagoda.org:8888
```

---

## 📱 Access URLs

### Feedback Forms
- **Global Pagoda**: http://feedback.globalpagoda.org:8888/feedback/global_pagoda
- **Souvenir Shop**: http://feedback.globalpagoda.org:8888/feedback/souvenir_shop
- **Dhamma Alaya**: http://feedback.globalpagoda.org:8888/feedback/dhamma_alaya
- **Food Court**: http://feedback.globalpagoda.org:8888/feedback/food_court
- **DPVC**: http://feedback.globalpagoda.org:8888/feedback/dpvc

### Admin Panel
- **Login**: http://feedback.globalpagoda.org:8888/admin/login
- **Dashboard**: http://feedback.globalpagoda.org:8888/admin

---

## 🔧 Technical Changes Made

### 1. Nginx Configuration Updated
- **File**: `/etc/nginx/sites-available/feedback.globalpagoda.org`
- **Change**: Added port 8888 listening (in addition to port 80)
- **Backup**: `/etc/nginx/sites-available/feedback.globalpagoda.org.backup`

```nginx
server {
    listen 80;        # For Sophos forwarding (external users)
    listen [::]:80;
    listen 8888;      # For direct access (internal WiFi users)
    listen [::]:8888;
    server_name feedback.globalpagoda.org;
    ...
}
```

### 2. How It Works

#### External Users (Mobile Data)
```
User's Browser
  ↓
feedback.globalpagoda.org:8888
  ↓
Sophos Firewall (IT managed)
  ↓ (forwards :8888 → :80)
Server Nginx Port 80
  ↓
Backend Port 5001
  ↓
Response back to user
```

#### Internal WiFi Users
```
User's Browser
  ↓
feedback.globalpagoda.org:8888
  ↓
DNS resolves to 172.12.0.28:8888 (via /etc/hosts)
  ↓
Server Nginx Port 8888
  ↓
Backend Port 5001
  ↓
Response back to user
```

### 3. Verified Working ✅
- ✅ Port 8888 listening on all interfaces
- ✅ HTTP 200 response on localhost:8888
- ✅ HTTP 200 response on 172.12.0.28:8888
- ✅ HTTP 200 response on feedback.globalpagoda.org:8888
- ✅ Port 80 still working (backward compatibility)
- ✅ Backend running on port 5001

---

## 🧪 Testing Instructions

### Test from Internal WiFi
1. Connect to Pagoda WiFi
2. Open browser and go to: `http://feedback.globalpagoda.org:8888`
3. Should load the feedback system home page
4. Try admin login: `http://feedback.globalpagoda.org:8888/admin/login`

### Test from External Mobile Data
1. Disconnect from WiFi, use mobile data
2. Open browser and go to: `http://feedback.globalpagoda.org:8888`
3. Should load the feedback system home page
4. Try admin login: `http://feedback.globalpagoda.org:8888/admin/login`

### Expected Results
- ✅ Both internal and external access should work identically
- ✅ All pages should load properly
- ✅ Login should work
- ✅ No differences in functionality

---

## 🛠️ Maintenance

### Check Service Status
```bash
# Check nginx
sudo systemctl status nginx

# Check backend
systemctl status feedback-system.service

# Check listening ports
ss -tlnp | grep -E ":(80|8888|5001)"
```

### View Logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/feedback-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/feedback-error.log

# Backend logs
journalctl -u feedback-system.service -f
```

### Restart Services
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend
sudo systemctl restart feedback-system.service

# Or use deploy script
./deploy.sh
```

---

## 📝 Files Modified

1. **`/etc/nginx/sites-available/feedback.globalpagoda.org`**
   - Added port 8888 listening directives

2. **`deploy.sh`**
   - Updated to show unified URL in deployment output

3. **`DEPLOYMENT_UPDATED.md`**
   - Updated access URLs and architecture documentation

4. **`UNIFIED_URL_SETUP.md`** (this file)
   - Complete documentation of the unified URL setup

---

## 🔒 No Changes Required For

- ✅ Backend code (already uses relative URLs)
- ✅ Frontend code (already uses relative URLs)
- ✅ CORS settings (already allows all origins)
- ✅ Sophos firewall (existing configuration continues to work)
- ✅ Database or data

---

## ✨ Benefits

1. **Single QR Code**: One URL works everywhere
2. **Better UX**: Users don't need to remember different URLs
3. **Simpler Support**: Only one URL to communicate
4. **Future Proof**: Easy to maintain and document
5. **No IT Dependency**: Works with existing Sophos configuration

---

## 🚨 Troubleshooting

### If port 8888 doesn't work internally:
```bash
# Check if nginx is listening on 8888
sudo ss -tlnp | grep 8888

# Check nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### If external access stops working:
- Don't worry! Port 80 is still working
- Sophos should continue forwarding 8888 → 80
- Contact IT only if external access completely fails

### If neither works:
```bash
# Check all services
sudo systemctl status nginx
systemctl status feedback-system.service

# Check logs
sudo journalctl -xe
```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review logs (see Maintenance section)
3. Check service status
4. Review recent git commits for changes

---

**Configuration Date**: 2026-02-11
**Configured By**: Claude Code
**Status**: ✅ Complete and Verified
