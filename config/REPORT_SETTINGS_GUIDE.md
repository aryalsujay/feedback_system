# Weekly Report Settings Guide

## Overview

The feedback system now supports **customizable weekly report schedules** for each department. Department admins can configure when they want to receive their weekly feedback reports through the Admin Panel Settings page.

## Features

### 1. **Timezone Configuration**
- System is properly configured for Mumbai timezone (Asia/Kolkata, IST +05:30)
- Verified using `timedatectl` command
- All scheduled reports will run according to IST

### 2. **Default Schedule**
- **Day**: Sunday
- **Time**: 9:00 AM IST
- **Status**: Enabled

### 3. **Customizable Settings**

Each department admin can customize:
- **Day of Week**: Choose any day (Monday-Sunday)
- **Hour**: 0-23 (24-hour format)
- **Minute**: 0-59
- **Enable/Disable**: Toggle weekly reports on or off

## How to Access

1. Log in to the Admin Panel
2. Navigate to **Settings** in the sidebar
3. Configure your preferred schedule
4. Click **Save Settings**

## Implementation Details

### Database
- New `ReportSettings` model created
- Stores per-department schedule configurations
- Uses embedded NeDB database at `server/data/reportSettings.db`

### API Endpoints

#### GET /api/admin/report-settings
- Fetches current report settings for the user's department
- Returns default values if no settings exist

#### PUT /api/admin/report-settings
- Updates report schedule settings
- Validates input parameters
- Automatically refreshes the scheduler
- Body parameters:
  ```json
  {
    "dayOfWeek": 0-6,
    "hour": 0-23,
    "minute": 0-59,
    "enabled": true/false
  }
  ```

### Scheduler
- Updated `server/services/scheduler.js` to support per-department schedules
- Each department gets its own cron job
- Dynamic schedule updates without server restart
- Logs schedule information on startup

### UI Components
- New **Settings** page at `/admin/settings`
- Interactive form with validation
- Real-time preview of schedule
- Success/error notifications
- Reset to defaults option

## Schedule Management

### How It Works

1. On server startup, the scheduler reads settings for all departments
2. Creates individual cron jobs for each department
3. When settings are updated via API, the scheduler automatically refreshes
4. No server restart needed for schedule changes

### Cron Expression Format

The system uses standard cron format:
```
minute hour * * dayOfWeek
```

Example:
- Sunday 9:00 AM = `0 9 * * 0`
- Friday 5:30 PM = `30 17 * * 5`
- Monday 8:00 AM = `0 8 * * 1`

## Example Usage

### Scenario 1: Change report day to Friday
1. Go to Settings page
2. Select "Friday" from Day of Week dropdown
3. Keep time as 9:00 AM
4. Click Save Settings
5. Reports will now be sent every Friday at 9:00 AM

### Scenario 2: Change time to evening
1. Go to Settings page
2. Keep day as Sunday
3. Change Hour to 17 (5 PM)
4. Change Minute to 30
5. Click Save Settings
6. Reports will now be sent every Sunday at 5:30 PM

### Scenario 3: Temporarily disable reports
1. Go to Settings page
2. Toggle "Enable Weekly Reports" to OFF
3. Click Save Settings
4. Reports will stop until re-enabled

## Technical Notes

- Settings are stored per-department
- Admin users can only modify their own department's settings
- Super admins can potentially modify any department's settings
- All times are in IST (Mumbai timezone)
- Reports include feedback from the past 7 days
- Changes take effect immediately

## Files Modified

1. `server/models/ReportSettings.js` - New model for settings
2. `server/routes/admin.js` - Added GET/PUT endpoints
3. `server/services/scheduler.js` - Updated scheduler logic
4. `server/index.js` - Updated initialization to async
5. `client/src/pages/admin/Settings.jsx` - New settings UI
6. `client/src/layouts/AdminLayout.jsx` - Added Settings nav item
7. `client/src/App.jsx` - Added Settings route

## Troubleshooting

### Reports not being sent
- Check if reports are enabled in Settings
- Verify system timezone: `timedatectl`
- Check server logs for scheduler messages
- Verify email configuration in `config/emails.json`

### Settings not saving
- Check browser console for errors
- Verify authentication token is valid
- Check server logs for API errors

### Wrong timezone
- System should be set to Asia/Kolkata
- Run `sudo timedatectl set-timezone Asia/Kolkata` if needed
- Restart server after timezone change

## Future Enhancements

Potential improvements:
- Multiple schedule times per week
- Different schedules for different report types
- Email notification test feature
- Report history view
- Custom date ranges for reports
