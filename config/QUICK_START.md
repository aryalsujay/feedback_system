# Quick Start Guide - Configuration Management

## After Changing Passwords in .env

**IMPORTANT**: Always wrap passwords in quotes, especially if they contain `#` symbol:
```
SUPER_ADMIN_PASSWORD="your_password_here"
```

When you update passwords in `server/.env`, run:

```bash
cd config
node sync-passwords.js
./restart-server.sh
```

**IMPORTANT:** After syncing passwords, you MUST restart the server!

This will sync all admin passwords from `.env` to the database.

## After Changing Emails

When you update email recipients in `config/emails.json`, validate with:

```bash
cd config
node validate-emails.js
```

No server restart needed - changes take effect immediately!

## After Changing Questions

When you update feedback questions in `config/questions.json`, validate with:

```bash
cd config
node validate-questions.js
```

No server restart needed - changes take effect immediately!

## Admin Login Credentials

Use these usernames with passwords from `server/.env`:

| Username | Department | Password Variable |
|----------|-----------|------------------|
| `admin` | Super Admin | `SUPER_ADMIN_PASSWORD` |
| `gvp` | Global Pagoda | `ADMIN_GVP_PASSWORD` |
| `fc` | Food Court | `ADMIN_FC_PASSWORD` |
| `svct` | Souvenir Shop | `ADMIN_SVCT_PASSWORD` |
| `dlaya` | Dhamma Alaya | `ADMIN_DLAYA_PASSWORD` |
| `dpvc` | DPVC | `ADMIN_DPVC_PASSWORD` |

## Troubleshooting

**Login not working?**
1. Update password in `server/.env`
2. Run `node sync-passwords.js` from config folder
3. Try logging in again

**Emails not valid?**
- Run `node validate-emails.js` to see specific issues
- Fix the JSON syntax or email formats
- Run validation again to confirm

**Questions not displaying?**
- Run `node validate-questions.js` to see specific issues
- Ensure all rating questions have labels 1-5
- Run validation again to confirm
