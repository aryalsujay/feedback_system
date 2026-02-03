# Configuration Management Scripts

This folder contains configuration files and helper scripts for managing the feedback system.

## Configuration Files

- **emails.json** - Email recipients for each department's weekly reports
- **questions.json** - Feedback questions for each department

## Management Scripts

### 1. Password Synchronization

**Script:** `sync-passwords.js`

Run this script whenever you change admin passwords in `server/.env` file.

```bash
# From the config folder:
node sync-passwords.js

# Or from anywhere:
node config/sync-passwords.js
```

**What it does:**
- Reads passwords from `server/.env` file
- Updates all admin user passwords in the database
- Shows detailed results for each user

**When to run:**
- After changing any password in `server/.env`
- If admin login is not working
- After initial deployment

### 2. Email Configuration Validation

**Script:** `validate-emails.js`

Run this script after modifying `emails.json` to ensure it's valid.

```bash
# From the config folder:
node validate-emails.js

# Or from anywhere:
node config/validate-emails.js
```

**What it does:**
- Validates JSON syntax
- Checks email address formats
- Verifies all departments are configured
- Shows summary of recipients

**Note:** Email changes take effect immediately - no server restart needed!

### 3. Questions Configuration Validation

**Script:** `validate-questions.js`

Run this script after modifying `questions.json` to ensure it's valid.

```bash
# From the config folder:
node validate-questions.js

# Or from anywhere:
node config/validate-questions.js
```

**What it does:**
- Validates JSON syntax
- Checks question structure (id, text, type, labels)
- Verifies rating labels are complete (1-5)
- Shows summary of questions per department

**Note:** Question changes take effect immediately - no server restart needed!

## Quick Reference

### Admin Usernames and Passwords

Configured in `server/.env`:

| Username | Department | Environment Variable |
|----------|-----------|---------------------|
| admin | Super Admin (All) | SUPER_ADMIN_PASSWORD |
| gvp | Global Vipassana Pagoda | ADMIN_GVP_PASSWORD |
| fc | Food Court | ADMIN_FC_PASSWORD |
| svct | Souvenir Shop | ADMIN_SVCT_PASSWORD |
| dlaya | Dhamma Alaya | ADMIN_DLAYA_PASSWORD |
| dpvc | DPVC | ADMIN_DPVC_PASSWORD |

### Email Recipients

Configured in `emails.json`:
- Each department has an array of email addresses
- Reports are sent weekly on Sundays at 9:00 AM
- Changes take effect immediately

### Feedback Questions

Configured in `questions.json`:
- Each department has its own set of questions
- Question types: `smiley`, `number_rating`, `rating_5`, `text`
- Rating questions need labels for values 1-5
- Changes take effect immediately

## Troubleshooting

### Login not working?

1. Check that passwords are set in `server/.env`
2. **IMPORTANT**: If your password contains `#` or other special characters, wrap it in quotes:
   - ❌ Wrong: `SUPER_ADMIN_PASSWORD=admin!@#`
   - ✅ Correct: `SUPER_ADMIN_PASSWORD="admin!@#"`
3. Run `node sync-passwords.js` to sync to database
4. Try logging in again

### Emails not sending?

1. Validate with `node validate-emails.js`
2. Fix any validation errors
3. Check SMTP settings in `server/.env`

### Questions not showing?

1. Validate with `node validate-questions.js`
2. Fix any validation errors
3. Refresh the client application

## Important Notes

- **Passwords require sync:** Changes to `.env` passwords require running `sync-passwords.js`
- **Emails auto-reload:** Changes to `emails.json` take effect immediately
- **Questions auto-reload:** Changes to `questions.json` take effect immediately
- **Always validate:** Run validators before deploying changes to production
