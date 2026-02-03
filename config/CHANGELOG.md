# Configuration Management - What Was Fixed

## Date: 2026-02-03

## Problem
- Admin login was not working
- Passwords in `.env` file were not synced to the database
- No easy way to sync passwords after changing them
- No validation tools for emails and questions

## Solution Implemented

### 1. Password Synchronization Fixed ✅
- All admin passwords have been synced from `server/.env` to the database
- Admin login now works with the passwords set in `.env`

### 2. Created Management Scripts

All scripts are located in the `config/` folder:

#### `sync-passwords.js`
- Syncs all admin passwords from `.env` to database
- Run this after changing any password in `server/.env`
- Usage: `node sync-passwords.js`

#### `validate-emails.js`
- Validates `emails.json` configuration
- Checks JSON syntax and email formats
- Usage: `node validate-emails.js`

#### `validate-questions.js`
- Validates `questions.json` configuration
- Checks question structure, types, and labels
- Usage: `node validate-questions.js`

### 3. Fixed Questions Configuration
- Added missing labels to smiley-type questions in:
  - Souvenir Shop (overall_experience)
  - Dhamma Alaya (overall_experience)
  - DPVC (overall_experience)

### 4. Documentation Created
- `README.md` - Comprehensive guide to all scripts
- `QUICK_START.md` - Quick reference guide
- `CHANGELOG.md` - This file

## Current Admin Credentials

All users are configured and working:

| Username | Department | Password Location |
|----------|-----------|------------------|
| admin | Super Admin (All departments) | SUPER_ADMIN_PASSWORD in .env |
| gvp | Global Vipassana Pagoda | ADMIN_GVP_PASSWORD in .env |
| fc | Food Court | ADMIN_FC_PASSWORD in .env |
| svct | Souvenir Shop | ADMIN_SVCT_PASSWORD in .env |
| dlaya | Dhamma Alaya | ADMIN_DLAYA_PASSWORD in .env |
| dpvc | DPVC | ADMIN_DPVC_PASSWORD in .env |

## How to Use

### Change a Password
1. Edit `server/.env` and update the password
2. Run: `cd config && node sync-passwords.js`
3. Login with new password

### Change Email Recipients
1. Edit `config/emails.json`
2. Run: `cd config && node validate-emails.js`
3. No server restart needed!

### Change Questions
1. Edit `config/questions.json`
2. Run: `cd config && node validate-questions.js`
3. No server restart needed!

## Technical Details

- Backend: Using NeDB embedded database
- Passwords: Hashed with bcrypt (10 rounds)
- Authentication: JWT tokens with 1-day expiration
- Email config: Loaded dynamically (no restart needed)
- Questions config: Loaded dynamically (no restart needed)

## Verified Working
- ✅ Password sync from .env to database
- ✅ Admin login with .env passwords
- ✅ Email configuration validation
- ✅ Questions configuration validation
- ✅ All 6 admin users properly configured
