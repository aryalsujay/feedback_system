# 🚀 Quick Access Guide - Updated Routing

**Last Updated:** 2026-02-13
**Status:** ✅ DEPLOYED & TESTED

---

## 📱 Access URLs

### **Public Department Forms** (No Login Required)

**Internal WiFi** (without port):
```
GVP:         http://172.12.0.28/pr
Food Court:  http://172.12.0.28/fc
DPVC:        http://172.12.0.28/dpvc
Dhammalaya:  http://172.12.0.28/dlaya
Souvenir:    http://172.12.0.28/ss
```

**External WiFi / Mobile Data** (with port 8888):
```
GVP:         http://feedback.globalpagoda.org:8888/pr
Food Court:  http://feedback.globalpagoda.org:8888/fc
DPVC:        http://feedback.globalpagoda.org:8888/dpvc
Dhammalaya:  http://feedback.globalpagoda.org:8888/dlaya
Souvenir:    http://feedback.globalpagoda.org:8888/ss
```

**Homepage** (redirects to GVP form):
```
Internal:  http://172.12.0.28/
External:  http://feedback.globalpagoda.org:8888/
```

---

### **Feedback Admin** (Fill Forms) - admin/admin977

**Login Page:**
```
Internal:  http://172.12.0.28/feedback-admin/login
External:  http://feedback.globalpagoda.org:8888/feedback-admin/login

Username: admin
Password: admin977
```

**After Login:**
- See all 5 department cards
- Click any department to fill feedback
- After submitting, returns to department cards

---

### **Analytics Admin** (View Data) - admin/admin123

**Login Page** (Hidden - Direct URL Only):
```
Internal:  http://172.12.0.28/admin/login
External:  http://feedback.globalpagoda.org:8888/admin/login

Username: admin
Password: admin123
```

**After Login:**
- View analytics dashboard
- Download reports (PDF/Excel)
- Manage settings

---

## 🔄 How Redirect Works Now

### **Public User Flow:**
```
1. User visits /fc (Food Court form)
2. User fills form
3. User clicks Submit → Thank You page
4. User clicks "Go Home" → RETURNS to /fc ✅
   (Previously went to login page ❌)
```

### **Each Department is Isolated:**
```
/pr   → Submit → Success → Back to /pr
/fc   → Submit → Success → Back to /fc
/dpvc → Submit → Success → Back to /dpvc
/dlaya → Submit → Success → Back to /dlaya
/ss   → Submit → Success → Back to /ss
```

### **Feedback Admin Flow:**
```
1. Admin logs in at /feedback-admin/login
2. Admin sees all department cards
3. Admin clicks "Food Court" → Fills form
4. Admin clicks Submit → Thank You page
5. Auto-redirects → Back to all department cards ✅
```

---

## 📋 For QR Code Generation

Use these URLs for QR codes:

| Department | Internal QR | External QR |
|------------|-------------|-------------|
| GVP | `http://172.12.0.28/pr` | `http://feedback.globalpagoda.org:8888/pr` |
| Food Court | `http://172.12.0.28/fc` | `http://feedback.globalpagoda.org:8888/fc` |
| DPVC | `http://172.12.0.28/dpvc` | `http://feedback.globalpagoda.org:8888/dpvc` |
| Dhammalaya | `http://172.12.0.28/dlaya` | `http://feedback.globalpagoda.org:8888/dlaya` |
| Souvenir Shop | `http://172.12.0.28/ss` | `http://feedback.globalpagoda.org:8888/ss` |

**Recommendation:**
- Internal staff: Use internal URLs (without port)
- Public visitors: Use external URLs (with port 8888)

---

## 🎯 What Changed

**Before:**
- Homepage showed feedback admin login
- After submitting feedback, "Go Home" → Error (login page)
- Confusing for public users

**Now:**
- Homepage redirects to GVP form
- After submitting feedback, "Go Home" → Same department form
- Feedback admin has separate URL: `/feedback-admin/login`
- Each department form is isolated

---

## ⚠️ Important Notes

### **Clear Browser Cache!**
```
Computer: Ctrl+Shift+R (hard refresh)
Mobile:   Clear browsing data
Or:       Use incognito/private mode
```

### **Share with Team:**
- Feedback Admin URL changed to: `/feedback-admin/login`
- Update any saved bookmarks
- Old URL `/` now redirects to GVP form

---

## 🔧 Quick Commands

```bash
# Deploy
./deploy.sh

# View logs
journalctl -u feedback-system.service -f

# Check status
systemctl status feedback-system.service
systemctl status nginx

# Test submission
curl -X POST http://172.12.0.28/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"departmentId":"food_court","answers":{"q1":"5"}}'
```

---

## ✅ Status

- ✅ Routing fix deployed
- ✅ All department forms working
- ✅ Submissions successful
- ✅ Redirect logic fixed
- ✅ No more login page errors for public users
- ✅ Tested and verified

**Ready for Production:** YES 🚀

---

**For Support:** Check ROUTING_FIX_COMPLETE.md for detailed documentation
