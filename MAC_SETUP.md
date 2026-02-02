# Mac Setup Guide

Quick guide to set up the Feedback System on your Mac after pushing to GitHub.

## Prerequisites

- Node.js (v14 or higher)
- Git
- Terminal access

## Setup Steps

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/aryalsujay/feedback_system.git
cd feedback_system
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp server/.env.example server/.env

# Edit with your preferred editor
nano server/.env
# or
code server/.env
```

**Required Configuration in `.env`:**

```bash
# Server Port
PORT=5001

# JWT Secret - CHANGE THIS!
JWT_SECRET=your_secure_random_jwt_secret_here

# Email Configuration (for sending reports)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Admin Passwords - SET STRONG PASSWORDS!
SUPER_ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_GVP_PASSWORD=AnotherStrongPassword456!
ADMIN_FC_PASSWORD=SecurePassword789!
ADMIN_SVCT_PASSWORD=StrongPass012!
ADMIN_DLAYA_PASSWORD=SecurePass345!
ADMIN_DPVC_PASSWORD=GoodPassword678!
```

### 3. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 4. Initialize Admin Users

```bash
cd server
node scripts/seedAdmins.js
cd ..
```

This will create all admin users with the passwords you set in `.env`.

### 5. Start the Application

**Option A: Using the startup script (Linux/Mac)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual start (recommended for Mac)**

Terminal 1 (Server):
```bash
cd server
npm start
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

### 6. Access the Application

- **User Feedback Form**: http://localhost:5173
- **Admin Panel**: http://localhost:5001/admin/login
- **API**: http://localhost:5001/api

## Admin Login

Use these usernames with the passwords you set in `.env`:

| Username | Role          | Department     |
|----------|---------------|----------------|
| `admin`  | Super Admin   | Global access  |
| `gvp`    | Admin         | Global Pagoda  |
| `fc`     | Admin         | Food Court     |
| `svct`   | Admin         | Souvenir Shop  |
| `dlaya`  | Admin         | Dhamma Alaya   |
| `dpvc`   | Admin         | DPVC           |

## Changing Passwords Later

If you need to update passwords:

1. Edit `server/.env` and change password values
2. Run the sync script:
   ```bash
   cd server
   node scripts/syncPasswords.js
   ```

See [PASSWORD_SETUP.md](./PASSWORD_SETUP.md) for detailed password management.

## Troubleshooting

### Port Already in Use

If port 5001 or 5173 is already in use:

```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

Or change the port in `server/.env`:
```bash
PORT=5002
```

### Database Issues

The database files are created automatically in `server/data/`. If you have issues:

```bash
# Remove and recreate
rm -rf server/data/*.db
cd server
node scripts/seedAdmins.js
```

### Node Modules Issues

```bash
# Clean install
rm -rf server/node_modules client/node_modules
cd server && npm install
cd ../client && npm install
```

### Gmail App Password

To get a Gmail App Password:

1. Go to Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App passwords
4. Generate new app password for "Mail"
5. Use this 16-character password in `.env`

## Differences from Linux Server

| Feature           | Linux Server       | Mac Development    |
|-------------------|--------------------|--------------------|
| Passwords         | Production secure  | Can be simpler     |
| Email             | Production Gmail   | Test account OK    |
| Access            | Network IP         | localhost          |
| Data              | Persistent         | Development data   |

## Keeping in Sync with Linux

### Pushing Changes from Mac to GitHub

```bash
# After making changes on Mac
git add .
git commit -m "description of changes"
git push
```

### Pulling Changes on Linux Server

```bash
# On your Linux server
cd feedback_system
git pull

# If dependencies changed
cd server && npm install
cd ../client && npm install

# Restart the application
./start.sh
```

## Development Workflow

1. **Make changes on Mac** - edit code, test locally
2. **Commit to Git** - `git commit -m "your changes"`
3. **Push to GitHub** - `git push`
4. **Pull on Linux** - `git pull` on the server
5. **Restart server** - `./start.sh` if needed

## Important Notes

- `.env` files are **never** committed to Git (security)
- Each environment (Mac, Linux) has its own `.env` file
- Database files (`server/data/*.db`) are also not committed
- You can use different passwords on Mac vs Linux server

## Quick Commands Reference

```bash
# Start application
./start.sh

# Recreate admin users
cd server && node scripts/seedAdmins.js

# Update passwords
cd server && node scripts/syncPasswords.js

# Verify users exist
cd server && node scripts/verifyUsers.js

# View logs (if running with start.sh)
# Logs are shown in the terminal

# Stop servers
# Press Ctrl+C in each terminal
```

## Need Help?

Check these files:
- [PASSWORD_SETUP.md](./PASSWORD_SETUP.md) - Detailed password management
- [README.md](./README.md) - General project documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Linux deployment guide
