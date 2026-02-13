# 🚀 Deployment Guide

## Quick Deploy

Simply run:
```bash
cd /home/feedback/feedback_system
./deploy.sh
```

That's it! The script handles everything automatically.

---

## What deploy.sh Does

✅ **Step 0:** Kills any Vite dev server processes (prevents interference)
✅ **Step 1:** Cleans up manual processes on port 5001
✅ **Step 2:** Checks/installs dependencies if needed
✅ **Step 3:** Builds client application (fresh build)
✅ **Step 4:** Restarts Nginx (clears cache)
✅ **Step 5:** Restarts backend server (systemd or manual)
✅ **Step 6:** Verifies services are running
✅ **Step 7:** Runs 6 automated tests
✅ **Step 8:** Displays access URLs and instructions

---

## Automated Tests

The script runs 6 tests automatically:

1. ✓ Homepage loads
2. ✓ Food Court form loads
3. ✓ Config API works
4. ✓ Authentication works (admin977)
5. ✓ Feedback submission works
6. ✓ All department URLs work

**Output:** "Tests passed: 6/6" = All good!

---

## After Deployment

### ⚠️ IMPORTANT: Clear Browser Cache

Users MUST clear cache after deployment:

**Computer:**
- Chrome/Edge: `Ctrl+Shift+R` (hard refresh)
- Or: `Ctrl+Shift+Delete` → Clear cached images

**Mobile:**
- Chrome Android: Settings → Privacy → Clear cache
- Safari iOS: Settings → Safari → Clear history

**Or test in Incognito/Private mode first!**

---

## Access URLs (After Deploy)

### 🏠 Homepage (Auto-redirects to GVP Form)
```
External: http://feedback.globalpagoda.org:8888/ → /pr
Internal: http://172.12.0.28/ → /pr
```

### 👤 Feedback Admin Login (Fill Feedback Forms)
```
External: http://feedback.globalpagoda.org:8888/feedback-admin/login
Internal: http://172.12.0.28/feedback-admin/login
Login: admin / admin977
```

### 📋 Department Forms (Public - No Login)
```
External:
  • http://feedback.globalpagoda.org:8888/pr
  • http://feedback.globalpagoda.org:8888/fc
  • http://feedback.globalpagoda.org:8888/dpvc
  • http://feedback.globalpagoda.org:8888/dlaya
  • http://feedback.globalpagoda.org:8888/ss

Internal:
  • http://172.12.0.28/pr
  • http://172.12.0.28/fc
  • http://172.12.0.28/dpvc
  • http://172.12.0.28/dlaya
  • http://172.12.0.28/ss
```

### 📊 Analytics Admin (Hidden)
```
External: http://feedback.globalpagoda.org:8888/admin/login
Internal: http://172.12.0.28/admin/login
Login: admin / admin123
```

---

## Troubleshooting

### If deployment fails:

**Check logs:**
```bash
# If using systemd service:
sudo journalctl -u feedback-system.service -f

# If manual start:
tail -f /tmp/feedback-backend.log
```

**Common issues:**

1. **Port 5001 already in use**
   - Script automatically kills manual processes
   - May need manual cleanup: `sudo kill -9 $(lsof -ti:5001)`

2. **Nginx not restarting**
   - Check nginx config: `sudo nginx -t`
   - Restart manually: `sudo systemctl restart nginx`

3. **Client build fails**
   - Check node version: `node -v` (should be 18+)
   - Clear node_modules: `rm -rf client/node_modules && npm install`

4. **Tests fail**
   - Check which test failed
   - Wait 10 seconds and try accessing URLs manually
   - Backend may need more time to start

---

## Security Notes

### 🔒 deploy.sh Contains Sudo Password!

- ✅ Added to `.gitignore` - Won't be committed to Git
- ✅ Only readable by you
- ⚠️ NEVER share deploy.sh file
- ⚠️ NEVER commit deploy.sh to Git (already gitignored)

**Verify it's gitignored:**
```bash
git check-ignore deploy.sh
# Should output: deploy.sh ✓
```

---

## Admin Panel Integration

The deploy.sh script can be called from the admin panel.

**To integrate:**

1. Add a "Deploy" button in admin panel
2. Call via API that executes:
   ```bash
   cd /home/feedback/feedback_system && ./deploy.sh
   ```
3. Stream output to admin panel in real-time
4. Show "Deployment Complete" when done

**Example API endpoint (in server):**
```javascript
router.post('/api/admin/deploy', auth, async (req, res) => {
    const { spawn } = require('child_process');
    const deploy = spawn('./deploy.sh', [], {
        cwd: '/home/feedback/feedback_system'
    });

    deploy.stdout.on('data', (data) => {
        res.write(data);
    });

    deploy.on('close', (code) => {
        res.end();
    });
});
```

---

## Maintenance

### Regular Deployment:
```bash
./deploy.sh
```

### View Running Services:
```bash
# Backend status
systemctl status feedback-system.service

# Or check manually
ps aux | grep "node index.js"

# Nginx status
systemctl status nginx
```

### View Logs:
```bash
# Backend logs (systemd)
journalctl -u feedback-system.service -f

# Backend logs (manual)
tail -f /tmp/feedback-backend.log

# Nginx logs
tail -f /var/log/nginx/feedback-error.log
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy | `./deploy.sh` |
| View backend logs | `journalctl -u feedback-system.service -f` |
| View nginx logs | `tail -f /var/log/nginx/feedback-error.log` |
| Restart nginx | `sudo systemctl restart nginx` |
| Restart backend | `sudo systemctl restart feedback-system.service` |
| Check if gitignored | `git check-ignore deploy.sh` |

---

## Summary

✅ Run `./deploy.sh` for complete automated deployment
✅ Script includes sudo password for automation
✅ Script is gitignored (secure)
✅ Runs 6 automated tests
✅ Shows all access URLs at end
✅ Can be integrated with admin panel

**Remember:** Tell users to clear browser cache after deployment!

---

**Created:** 2026-02-13
**Script Location:** `/home/feedback/feedback_system/deploy.sh`
**Status:** Ready to use
