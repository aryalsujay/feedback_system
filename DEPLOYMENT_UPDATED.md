# Deployment System Updated

## What Was Fixed

### 1. External Access Login Issue
**Problem**: Frontend was hardcoding port 5001 in API calls, which failed for external access.

**Solution**: Changed `client/src/config.js` to use relative URLs:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

Now all API calls use relative URLs (e.g., `/api/auth/login`), which work through nginx proxy for both internal and external access.

### 2. Deployment Scripts Updated

Updated deployment scripts to properly work with systemd service:

#### **deploy.sh**
- Now properly restarts systemd service instead of waiting for auto-restart
- Handles both with/without sudo permissions
- Provides helpful instructions if sudo is not configured

#### **restart-server.sh**
- Now uses systemd service restart instead of manual kill/start
- Handles both with/without sudo permissions
- Safer and more reliable

### 3. Systemd Service Configuration
- Server is now properly managed by systemd
- Auto-restart enabled if service crashes
- Service: `feedback-system.service`

## Current Status

✅ Frontend rebuilt with relative URL configuration
✅ Systemd service running properly (PID: 421378)
✅ Deployment scripts updated
✅ External access should now work

## Usage

### Deploy After Changes (Recommended Method)

#### Option 1: Admin Panel Deploy Button
1. Login to admin panel
2. Go to **Settings** page
3. Click the **Deploy** tab
4. Click **Run Deployment** button

**Note**: For the button to work without manual intervention, you need to set up passwordless sudo (see below).

#### Option 2: Command Line
```bash
cd /home/feedback/feedback_system
./deploy.sh
```

This will:
- Build the client
- Restart the systemd service
- Verify deployment

### Quick Restart (No Build)

If you only need to restart the server without rebuilding:

```bash
cd /home/feedback/feedback_system/config
./restart-server.sh
```

Or directly:
```bash
sudo systemctl restart feedback-system.service
```

### Manual Build + Restart

If you prefer manual control:

```bash
# 1. Build client
cd /home/feedback/feedback_system/client
npm run build

# 2. Restart service
sudo systemctl restart feedback-system.service
```

## Enable Passwordless Deploy Button

To make the admin panel **Deploy** button work automatically:

1. See `SUDO_SETUP.md` for detailed instructions
2. Run the setup commands as root or sudo user
3. This allows the `feedback` user to restart the service without password

## Service Management Commands

```bash
# Check service status
systemctl status feedback-system.service

# View logs (live)
journalctl -u feedback-system.service -f

# View recent logs
journalctl -u feedback-system.service -n 50

# Restart service
sudo systemctl restart feedback-system.service

# Stop service
sudo systemctl stop feedback-system.service

# Start service
sudo systemctl start feedback-system.service
```

## Access URLs

### Internal Access (from local network)
- Feedback Forms: `http://172.12.0.28`
- Admin Panel: `http://172.12.0.28/admin/login`

### External Access (from internet)
- Feedback Forms: `http://feedback.globalpagoda.org:8888`
- Admin Panel: `http://feedback.globalpagoda.org:8888/admin/login`

## Architecture

```
External Users → Port 8888 (IT managed) → Port 80 (Nginx) → Port 5001 (Backend)
Internal Users → Port 80 (Nginx) → Port 5001 (Backend)
```

- Nginx proxies all requests to backend on port 5001
- Backend serves both API (`/api/*`) and static frontend files
- Frontend uses relative URLs, so all requests go through nginx
- Systemd manages the backend server process

## Troubleshooting

### Deploy button doesn't work
- Check if passwordless sudo is configured (see `SUDO_SETUP.md`)
- Or run `./deploy.sh` manually from command line

### Service won't start
```bash
# Check logs
journalctl -u feedback-system.service -n 50

# Common issues:
# 1. Port 5001 already in use (kill other processes)
# 2. Database permission issues
# 3. Missing dependencies
```

### External access not working
1. Verify nginx is running: `systemctl status nginx`
2. Check if port forwarding is active (contact IT)
3. Verify API calls use relative URLs (check browser console)

## Files Modified

- `client/src/config.js` - Changed to use relative URLs
- `deploy.sh` - Updated to restart systemd service
- `config/restart-server.sh` - Updated to use systemd

## New Files Created

- `SUDO_SETUP.md` - Instructions for passwordless sudo setup
- `DEPLOYMENT_UPDATED.md` - This file
