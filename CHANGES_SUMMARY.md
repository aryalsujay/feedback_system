# Password Management System - Changes Summary

This document summarizes the changes made to implement centralized password management.

## What Was Changed

### 1. Environment Configuration

**Files Modified:**
- `server/.env` - Added admin password environment variables
- `server/.env.example` - Added password template with examples

**New Variables:**
```bash
SUPER_ADMIN_PASSWORD=     # Password for 'admin' user
ADMIN_GVP_PASSWORD=       # Password for 'gvp' user
ADMIN_FC_PASSWORD=        # Password for 'fc' user
ADMIN_SVCT_PASSWORD=      # Password for 'svct' user
ADMIN_DLAYA_PASSWORD=     # Password for 'dlaya' user
ADMIN_DPVC_PASSWORD=      # Password for 'dpvc' user
```

### 2. Seed Script Enhancement

**File Modified:** `server/scripts/seedAdmins.js`

**Changes:**
- Now reads passwords from environment variables
- Falls back to default '1234' if env var not set
- Added dotenv configuration
- Maps each admin account to its environment variable

**Before:**
```javascript
password: '1234'  // Hardcoded for all users
```

**After:**
```javascript
password: process.env.ADMIN_GVP_PASSWORD || '1234'  // From .env file
```

### 3. New Password Sync Script

**File Created:** `server/scripts/syncPasswords.js`

**Purpose:** Update existing user passwords without deleting accounts

**Features:**
- Updates passwords for existing users
- Does NOT delete users or feedback data
- Reads from .env file
- Shows detailed progress and results
- Safe to run multiple times

**Usage:**
```bash
cd server
node scripts/syncPasswords.js
```

### 4. Documentation

**New Files Created:**

1. **PASSWORD_SETUP.md** - Complete password management guide
   - How to change passwords
   - Script usage instructions
   - Security best practices
   - Troubleshooting

2. **MAC_SETUP.md** - Mac-specific setup guide
   - Installation steps for Mac
   - Differences from Linux setup
   - Development workflow
   - Troubleshooting

3. **CHANGES_SUMMARY.md** - This file
   - Overview of all changes
   - What's safe to commit
   - Next steps

**Files Updated:**

1. **README.md** - Enhanced with:
   - Password setup section
   - Admin access information
   - References to new guides
   - Clarified deployment steps

## What's Safe to Commit to GitHub

✅ **SAFE** - These should be committed:
- `server/.env.example` (template only, no real passwords)
- `server/scripts/seedAdmins.js` (reads from env, no hardcoded passwords)
- `server/scripts/syncPasswords.js` (new script)
- `PASSWORD_SETUP.md` (documentation)
- `MAC_SETUP.md` (documentation)
- `README.md` (updated docs)
- `CHANGES_SUMMARY.md` (this file)

❌ **NEVER COMMIT** - These are already in .gitignore:
- `server/.env` (contains real passwords!)
- `server/data/*.db` (database files)
- Any PDF reports

## Security Improvements

### Before
- All passwords hardcoded as '1234' in source code
- Same password committed to Git
- No way to use different passwords per environment
- Passwords visible in version control history

### After
- Passwords stored in `.env` (not in Git)
- Each environment has its own `.env` file
- Easy to use strong, unique passwords
- Can have different passwords for Mac vs Linux server
- Template provided in `.env.example`

## How Password System Works Now

### On Linux Server:
1. Edit `server/.env` with production passwords
2. Run `node scripts/seedAdmins.js` to create users
3. Or run `node scripts/syncPasswords.js` to update existing users
4. `.env` stays on server (never committed to Git)

### On Mac:
1. Clone from GitHub
2. Copy `server/.env.example` to `server/.env`
3. Set your own development passwords
4. Run `node scripts/seedAdmins.js`
5. Your `.env` is separate from Linux server

### Syncing Code:
- Push code changes from Mac to GitHub
- Pull on Linux server
- Each machine keeps its own `.env` file
- No password conflicts!

## Migration Path

### If You Have Existing Users:

**Option 1: Update Passwords (Recommended)**
```bash
cd server
# Edit .env with new passwords
nano .env
# Sync passwords to database
node scripts/syncPasswords.js
```

**Option 2: Recreate Users (DELETES ALL USERS)**
```bash
cd server
# Edit .env with new passwords
nano .env
# Recreate all users (WARNING: deletes existing)
node scripts/seedAdmins.js
```

### If Fresh Install:
```bash
cd server
# Copy and edit .env
cp .env.example .env
nano .env
# Create users
node scripts/seedAdmins.js
```

## Admin Accounts Overview

| Username | Role        | Department    | Env Variable            | Default |
|----------|-------------|---------------|-------------------------|---------|
| admin    | super_admin | global        | SUPER_ADMIN_PASSWORD    | 1234    |
| gvp      | admin       | global_pagoda | ADMIN_GVP_PASSWORD      | 1234    |
| fc       | admin       | food_court    | ADMIN_FC_PASSWORD       | 1234    |
| svct     | admin       | souvenir_shop | ADMIN_SVCT_PASSWORD     | 1234    |
| dlaya    | admin       | dhamma_alaya  | ADMIN_DLAYA_PASSWORD    | 1234    |
| dpvc     | admin       | dpvc          | ADMIN_DPVC_PASSWORD     | 1234    |

## Testing the Changes

### 1. Test Password Update
```bash
cd server

# Edit .env and change SUPER_ADMIN_PASSWORD
nano .env

# Sync the change
node scripts/syncPasswords.js

# Try logging in with new password
# Open http://localhost:5001/admin/login
# Username: admin
# Password: <your new password>
```

### 2. Test Fresh Install (on Mac)
```bash
# Clone repo
git clone https://github.com/aryalsujay/feedback_system.git
cd feedback_system

# Setup
cp server/.env.example server/.env
nano server/.env  # Set passwords
cd server
npm install
node scripts/seedAdmins.js

# Test login
npm start
# Open http://localhost:5001/admin/login
```

## Rollback Plan

If you need to go back to the old system:

```bash
# Revert the commits
git log --oneline  # Find the commit before these changes
git revert <commit-hash>

# Or restore old file
git checkout HEAD~1 server/scripts/seedAdmins.js
```

## Next Steps

1. ✅ Review all changes above
2. ✅ Verify `.env` is in `.gitignore` (already confirmed)
3. ✅ Update passwords in `server/.env`
4. ✅ Run `syncPasswords.js` to apply new passwords
5. ✅ Test login with new passwords
6. ✅ Commit changes to Git
7. ✅ Push to GitHub
8. ✅ Pull on Mac and follow MAC_SETUP.md

## Questions?

Refer to these guides:
- Password management: [PASSWORD_SETUP.md](./PASSWORD_SETUP.md)
- Mac setup: [MAC_SETUP.md](./MAC_SETUP.md)
- General info: [README.md](./README.md)
