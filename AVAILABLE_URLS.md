# All Available Access URLs

## ✅ Working URLs (After Configuration)

### 🌐 Primary URLs (Recommended for QR Code)

**Domain with Port 8888:**
```
http://feedback.globalpagoda.org:8888
```
- ✅ Works from internal Pagoda WiFi
- ✅ Works from external mobile data/internet
- ✅ **RECOMMENDED for QR Code**

**IP Address with Port 8888:**
```
http://172.12.0.28:8888
```
- ✅ Works from internal Pagoda WiFi
- ✅ Alternative URL for internal users
- ✅ Good for backup/troubleshooting

---

### 📱 All Feedback Form URLs

#### Using Domain (Recommended)
- Global Pagoda: `http://feedback.globalpagoda.org:8888/feedback/global_pagoda`
- Souvenir Shop: `http://feedback.globalpagoda.org:8888/feedback/souvenir_shop`
- Dhamma Alaya: `http://feedback.globalpagoda.org:8888/feedback/dhamma_alaya`
- Food Court: `http://feedback.globalpagoda.org:8888/feedback/food_court`
- DPVC: `http://feedback.globalpagoda.org:8888/feedback/dpvc`

#### Using IP Address (Alternative)
- Global Pagoda: `http://172.12.0.28:8888/feedback/global_pagoda`
- Souvenir Shop: `http://172.12.0.28:8888/feedback/souvenir_shop`
- Dhamma Alaya: `http://172.12.0.28:8888/feedback/dhamma_alaya`
- Food Court: `http://172.12.0.28:8888/feedback/food_court`
- DPVC: `http://172.12.0.28:8888/feedback/dpvc`

---

### 🔐 Admin Panel URLs

#### Using Domain (Recommended)
- Login: `http://feedback.globalpagoda.org:8888/admin/login`
- Dashboard: `http://feedback.globalpagoda.org:8888/admin`
- Analytics: `http://feedback.globalpagoda.org:8888/admin/analytics`
- Settings: `http://feedback.globalpagoda.org:8888/admin/settings`

#### Using IP Address (Alternative)
- Login: `http://172.12.0.28:8888/admin/login`
- Dashboard: `http://172.12.0.28:8888/admin`
- Analytics: `http://172.12.0.28:8888/admin/analytics`
- Settings: `http://172.12.0.28:8888/admin/settings`

---

### 🔧 Legacy URLs (Still Work)

**Domain without port (Port 80):**
```
http://feedback.globalpagoda.org
```
- ✅ Works from internal WiFi
- ⚠️ External access depends on Sophos forwarding

**IP without port (Port 80):**
```
http://172.12.0.28
```
- ✅ Works from internal WiFi only
- ❌ Does NOT work from external internet

---

## 🎯 Recommendation

### For QR Code - Use This:
```
http://feedback.globalpagoda.org:8888
```

**Why?**
- ✅ Single URL works everywhere
- ✅ Professional domain name
- ✅ Easy to remember
- ✅ Works from internal WiFi
- ✅ Works from external mobile data

### For Troubleshooting - Use This:
```
http://172.12.0.28:8888
```

**Why?**
- ✅ Direct IP access
- ✅ Bypasses DNS issues
- ✅ Good for debugging
- ✅ Works from internal network

---

## 🧪 Testing Matrix

| URL | Internal WiFi | External Mobile | Status |
|-----|---------------|-----------------|--------|
| feedback.globalpagoda.org:8888 | ✅ | ✅ | **Recommended** |
| 172.12.0.28:8888 | ✅ | ❌ | Internal only |
| feedback.globalpagoda.org | ✅ | ⚠️ | Depends on Sophos |
| 172.12.0.28 | ✅ | ❌ | Internal only |

---

## 🔍 How to Test

### Test from Internal WiFi

**Test 1: Domain with Port**
```bash
# Open browser and go to:
http://feedback.globalpagoda.org:8888

# Expected: Feedback system home page loads
# Status: ✅ Should work
```

**Test 2: IP with Port**
```bash
# Open browser and go to:
http://172.12.0.28:8888

# Expected: Feedback system home page loads
# Status: ✅ Should work
```

### Test from External Mobile Data

**Test 1: Domain with Port**
```bash
# Disconnect from WiFi, use mobile data
# Open browser and go to:
http://feedback.globalpagoda.org:8888

# Expected: Feedback system home page loads
# Status: ✅ Should work
```

**Test 2: IP with Port**
```bash
# Disconnect from WiFi, use mobile data
# Open browser and go to:
http://172.12.0.28:8888

# Expected: Will NOT work (private IP)
# Status: ❌ Expected to fail
```

---

## 🛡️ Chrome "Continue to Site" Issue

If you see "Continue to site" warning in Chrome on internal WiFi:

### Possible Causes:
1. Chrome thinks it's a captive portal
2. DNS resolution delays
3. Mixed content warnings

### Solutions:

**Option 1: Click "Continue to Site"**
- The warning appears once
- After clicking, it should work normally
- Chrome will remember your choice

**Option 2: Use IP Address Instead**
```
http://172.12.0.28:8888
```
- Direct IP access
- Bypasses DNS/captive portal detection
- Should work without warning

**Option 3: Clear Chrome Flags**
```
chrome://flags/#treat-unsafe-downloads-as-active-content
Set to: Disabled
```

**Option 4: Use Different Browser**
- Try Firefox, Safari, or Edge
- May not show the same warning

---

## 📊 Network Flow

### Internal WiFi User → Domain URL
```
User Browser
  ↓
http://feedback.globalpagoda.org:8888
  ↓
DNS (/etc/hosts): feedback.globalpagoda.org → 172.12.0.28
  ↓
Server: 172.12.0.28:8888
  ↓
Nginx (listening on 8888)
  ↓
Backend (port 5001)
  ↓
Response
```

### Internal WiFi User → IP URL
```
User Browser
  ↓
http://172.12.0.28:8888
  ↓
Server: 172.12.0.28:8888
  ↓
Nginx (listening on 8888)
  ↓
Backend (port 5001)
  ↓
Response
```

### External User → Domain URL
```
User Browser (Mobile Data)
  ↓
http://feedback.globalpagoda.org:8888
  ↓
Internet DNS: feedback.globalpagoda.org → Public IP
  ↓
Sophos Firewall (forwards :8888 → :80 or :8888)
  ↓
Server: Nginx (port 80 or 8888)
  ↓
Backend (port 5001)
  ↓
Response
```

---

## 🎯 QR Code Configuration

### Primary QR Code (Main Entrance)
```
URL: http://feedback.globalpagoda.org:8888
Title: "Vipassana Meditation Centre Feedback"
Description: "Share your experience with us"
```

### Backup QR Code (Reception/Help Desk)
```
URL: http://172.12.0.28:8888
Title: "Feedback (Internal WiFi)"
Note: "Use this if the main link doesn't work"
```

---

## 💡 Pro Tips

1. **For QR Codes**: Always use the domain URL with port 8888
2. **For Staff/Testing**: Keep IP:8888 as backup
3. **For External Users**: Domain:8888 is the only option
4. **For Troubleshooting**: Try IP:8888 to isolate DNS issues

---

## 🚨 Troubleshooting

### "Continue to Site" Warning on Chrome
- **Solution**: Click "Continue to Site" - it's safe
- **Alternative**: Use http://172.12.0.28:8888 instead
- **Reason**: Chrome's captive portal detection

### Page Not Loading
1. Check connection: WiFi or mobile data?
2. Try IP address: http://172.12.0.28:8888
3. Check port: Make sure :8888 is included
4. Test on different device/browser

### Admin Panel Not Accessible
- Make sure you're using :8888 in the URL
- Try: http://172.12.0.28:8888/admin/login
- Clear browser cache and cookies

---

**Last Updated:** 2026-02-11
**Configuration:** Nginx listening on ports 80 and 8888
**Server Names:** feedback.globalpagoda.org, 172.12.0.28
