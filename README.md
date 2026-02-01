# Global Pagoda Feedback System

Feedback system built with React (Vite) and Node.js (Express), using NeDB for embedded data storage.

## Features
- **Dynamic Questions**: Configurable per department (Global Pagoda, Food Court, etc.) via `config/questions.json`.
- **Weekly Reports**: Automated PDF generation with feedback analytics (sent via Email).
- **Interactive UI**: Glassmorphism design with smiley and star ratings.

## 🚀 Deployment Instructions (Ubuntu Server)

Follow these steps to deploy on your local Ubuntu server.

### 1. clone the repository
```bash
git clone https://github.com/aryalsujay/feedback_system.git
cd feedback_system
```

### 2. Configure Environment
Create a `.env` file in the `server` directory. You can copy the example:
```bash
cp server/.env.example server/.env
```
Edit the `.env` file to add your Gmail App Password for sending reports:
```bash
nano server/.env
```
_Ensure `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set._

### 3. Start the System
Run the startup script. This will install dependencies (Client  & Server) and start the application.
```bash
chmod +x start.sh
./start.sh
```

- **Frontend**: Accessible at `http://<YOUR_SERVER_IP>:5173`
- **Backend**: Running at `http://<YOUR_SERVER_IP>:5001`

### 4. Stopping
Press `Ctrl+C` to stop both services.

## 📧 Email Configuration
- Emails recipients are configured in `config/emails.json`.
- Report generation logic is in `server/services/reportGenerator.js`.

## 🗄️ Database
- Uses embedded file-based database (NeDB) located at `server/data/feedbacks.db`.
- No MongoDB installation required.

## Troubleshooting
- If emails fail, check `server/reports/` for locally saved PDF copies.
- Ensure ports 5173 and 5001 are open/allowed on your server firewall if accessing remotely.
