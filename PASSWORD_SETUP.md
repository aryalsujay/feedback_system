# Admin Password Configuration Guide

This guide explains how to configure and sync admin passwords for the Feedback System.

## Overview

All admin passwords are now centrally managed through environment variables in the `.env` file. This makes it easy to:
- Change passwords in one place
- Use different passwords for each environment (Linux server, Mac, etc.)
- Keep passwords secure and out of version control

## Password Configuration File

**Location:** `/server/.env`

This file contains all admin passwords and sensitive configuration. **This file is NOT committed to Git for security.**

## Admin Accounts

The system has 6 admin accounts:

| Username | Role          | Department     | Environment Variable      |
|----------|---------------|----------------|---------------------------|
| `admin`  | super_admin   | global         | `SUPER_ADMIN_PASSWORD`    |
| `gvp`    | admin         | global_pagoda  | `ADMIN_GVP_PASSWORD`      |
| `fc`     | admin         | food_court     | `ADMIN_FC_PASSWORD`       |
| `svct`   | admin         | souvenir_shop  | `ADMIN_SVCT_PASSWORD`     |
| `dlaya`  | admin         | dhamma_alaya   | `ADMIN_DLAYA_PASSWORD`    |
| `dpvc`   | admin         | dpvc           | `ADMIN_DPVC_PASSWORD`     |

## How to Change Passwords

### Step 1: Edit the .env file

Open `/server/.env` and update the password values:

```bash
# Example - Change passwords to your desired values
SUPER_ADMIN_PASSWORD=MyStr0ngP@ssw0rd!
ADMIN_GVP_PASSWORD=Gvp$ecure2024
ADMIN_FC_PASSWORD=F00dC0urt#Pass
ADMIN_SVCT_PASSWORD=Souv3nir!2024
ADMIN_DLAYA_PASSWORD=Alaya@S3cure
ADMIN_DPVC_PASSWORD=Dpvc#Str0ng!
```

**Important:** Use strong passwords with:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Different password for each account

### Step 2: Sync Passwords to Database

After updating `.env`, run the sync script:

```bash
cd server
node scripts/syncPasswords.js
```

This will update all admin passwords in the database without deleting any users or feedback data.

**Output:**
```
🔄 Starting password synchronization...

✅ Updated password for: gvp (admin)
✅ Updated password for: fc (admin)
✅ Updated password for: svct (admin)
✅ Updated password for: dlaya (admin)
✅ Updated password for: dpvc (admin)
✅ Updated password for: admin (super_admin)

==================================================
✨ Password sync complete!
   ✅ Successfully updated: 6
   ❌ Failed: 0
==================================================

📊 Total users in database: 6
```

### Step 3: Test Login

1. Start the server: `npm start`
2. Go to `http://localhost:5001/admin/login`
3. Test login with updated credentials

## First Time Setup (New Installation)

If you're setting up the system for the first time or want to recreate all users:

```bash
cd server
node scripts/seedAdmins.js
```

This will:
1. Delete all existing users
2. Create fresh admin accounts with passwords from `.env`

## Setting Up on Multiple Machines

### Moving from Linux to Mac (or vice versa)

1. **On your Linux server:**
   ```bash
   # Your .env file stays on the server (not committed to Git)
   # Just push your code changes
   git add .
   git commit -m "your changes"
   git push
   ```

2. **On your Mac:**
   ```bash
   # Clone or pull the repository
   git clone <your-repo-url>
   # or
   git pull

   # Copy the .env.example to create your own .env
   cd server
   cp .env.example .env

   # Edit .env with your Mac-specific passwords
   nano .env
   # or
   code .env

   # Run the seed script to create users
   node scripts/seedAdmins.js

   # Install dependencies and start
   npm install
   npm start
   ```

3. **Different passwords for different environments:**
   - Your Linux server can have one set of passwords in its `.env`
   - Your Mac can have different passwords in its `.env`
   - Each `.env` file stays on that machine only

## Scripts Reference

### `seedAdmins.js`
- **Purpose:** Initial setup - creates all admin users from scratch
- **Usage:** `node scripts/seedAdmins.js`
- **Warning:** Deletes existing users!
- **When to use:** First installation or complete reset

### `syncPasswords.js`
- **Purpose:** Update passwords for existing users
- **Usage:** `node scripts/syncPasswords.js`
- **Safe:** Does NOT delete users or data
- **When to use:** When you need to change passwords

### `verifyUsers.js`
- **Purpose:** Check what users exist in the database
- **Usage:** `node scripts/verifyUsers.js`
- **When to use:** Debugging or verification

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Already configured in `.gitignore`
   - Always use `.env.example` as a template

2. **Use strong passwords**
   - At least 12 characters
   - Mix of character types
   - Unique for each account

3. **Change default passwords immediately**
   - Current default is `1234` (very weak!)
   - Change before deployment

4. **Keep `.env` files secure**
   - Don't share in chat/email
   - Don't upload to public locations
   - Use secure file transfer if needed

5. **Different passwords per environment**
   - Production server: Strong unique passwords
   - Development/Mac: Can be simpler but still secure
   - Never reuse production passwords in development

## Troubleshooting

### "User not found" when syncing
**Solution:** Run `seedAdmins.js` first to create users

### Password not updating
**Solution:**
1. Check `.env` has the correct variable names
2. Ensure no typos in environment variable names
3. Restart the sync script

### Can't login after password change
**Solution:**
1. Verify `.env` has the new password
2. Run `syncPasswords.js` again
3. Check script output for errors

### Forgot password
**Solution:**
1. Edit password in `.env`
2. Run `syncPasswords.js`
3. Login with new password

## Quick Reference Commands

```bash
# Change passwords
cd server
nano .env                           # Edit passwords
node scripts/syncPasswords.js       # Apply changes

# First time setup
cd server
cp .env.example .env               # Create config file
nano .env                          # Set passwords
node scripts/seedAdmins.js         # Create users
npm install && npm start           # Start server

# Verify users
cd server
node scripts/verifyUsers.js        # Check database

# Reset everything (CAUTION!)
cd server
node scripts/seedAdmins.js         # Recreates all users
```

## File Locations

```
feedback_system/
├── server/
│   ├── .env                    # Your passwords (NOT in Git)
│   ├── .env.example            # Template (in Git)
│   └── scripts/
│       ├── seedAdmins.js       # Create users script
│       ├── syncPasswords.js    # Update passwords script
│       └── verifyUsers.js      # Check users script
└── PASSWORD_SETUP.md           # This guide
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify `.env` file format matches `.env.example`
3. Check console output for specific error messages
4. Ensure database file exists: `server/data/users.db`
