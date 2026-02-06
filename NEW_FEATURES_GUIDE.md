# New Features Visual Guide

## 🎉 What's New?

### 1. Trust User Can Now Filter All Departments! ✅

**Before:** Trust user could only see global department data
**Now:** Trust user can filter and view ANY department!

**How to use:**
1. Login as `trust` / `trustee557`
2. Go to Dashboard or Analytics
3. Look at the top right - you'll now see a filter dropdown!
4. Click it and select any department:
   - Global Pagoda
   - Food Court
   - Souvenir Shop
   - Dhamma Alaya
   - DPVC
   - All Departments
5. The page instantly updates with that department's data

**Benefits:**
- Monitor all departments without switching accounts
- Compare data across departments
- Better oversight capability
- No restrictions on viewing

---

### 2. Beautiful New Settings with Tabs! ✨

**Before:** Long scrolling page with everything mixed together
**Now:** Clean organized tabs - no scrolling needed!

## For Super Admin (admin/admin123)

When you open Settings, you'll see 6 beautiful tabs at the top:

### 📅 Tab 1: Report Schedule
**What you see:**
- Enable/disable weekly reports toggle
- Day of week dropdown
- Hour and minute inputs
- Schedule preview box (shows your settings in plain English)
- Save and Reset buttons
- Important info section

**What you can do:**
- Set when reports should be sent
- Turn reports on or off
- See preview of schedule
- Save changes instantly

---

### 📤 Tab 2: Send Reports
**What you see:**

**Section 1 - Send to All Departments (Green):**
- Description of what it does
- List of what happens
- Big green "Send Report Now to All" button
- Warning: This sends to production emails!

**Section 2 - Send Test Report (Blue):**
- Checkboxes for each department
- "Select All" and "Clear All" buttons
- Description: Only sends to aryalsujay@gmail.com
- Blue "Send Test Report" button
- Safe for testing message

**What you can do:**
- Send production reports to all departments
- Send test reports to BCC only
- Select specific departments for testing
- Never accidentally spam department emails

---

### 📊 Tab 3: Sample Data
**What you see:**

**Section 1 - Create Sample Data (Purple):**
- 5 checkboxes for departments
- "Select All" and "Clear All" buttons
- Purple "Create 5 Sample Entries" button
- Shows count of selected departments

**Section 2 - Clear All Data (Red):**
- Red warning box
- List of what will be deleted
- Big red "Clear All Feedback Data" button
- Requires confirmation

**What you can do:**
- Create test feedback data for any department
- Test the dashboard with realistic data
- Clear all feedback when starting fresh
- Perfect for development and testing

---

### 👥 Tab 4: User Management
**What you see:**
- Clean table with columns:
  - Username
  - Role
  - Department
- List of all admin users
- Coming soon note about adding features

**What you can do:**
- View all admin users at a glance
- See who has what role
- Check which department each admin manages

**Coming soon:**
- Add new users
- Edit user details
- Reset passwords
- Delete users

---

### ⚙️ Tab 5: System
**What you see:**

**Restart Server Section:**
- Description of what happens
- Orange "Restart Server" button
- Warning about brief interruption
- Coming soon features note

**What you can do:**
- Restart the backend server with one click
- No need for SSH or terminal access
- Server automatically comes back online
- Useful after configuration changes

**How it works:**
1. Click "Restart Server"
2. Confirm the action
3. Server gracefully shuts down
4. Systemd automatically restarts it
5. Back online in 5-10 seconds

---

### 📝 Tab 6: Logs
**What you see:**
- Auto-refresh checkbox
- Blue "Refresh" button
- Black terminal-style box
- Green text showing logs
- Last 100 lines of system logs

**What you can do:**
- View real-time server logs
- Enable auto-refresh for live monitoring
- Manually refresh anytime
- Debug issues without SSH
- Monitor login attempts
- See API requests
- Track errors

**How to use:**
1. Check "Auto-refresh" for live logs (updates every 5 seconds)
2. Or click "Refresh" button manually
3. Scroll through logs to find what you need
4. Look for errors, warnings, or specific events

---

## For Trust User (trust/trustee557)

When you open Settings, you'll see only 1 tab:

### 📅 Tab 1: Report Schedule
**What you see:**
- Same as super admin
- Enable/disable toggle
- Day, hour, minute settings
- Schedule preview
- Save and reset buttons

**What you can do:**
- Configure report schedule
- Enable or disable weekly reports
- View schedule preview

**What you CANNOT see:**
- Send Reports tab
- Sample Data tab
- User Management tab
- System tab
- Logs tab

These are hidden because trust user doesn't have permission for those features.

---

## 🎯 Quick Task Guide

### Task 1: Create Test Data
1. Login as admin
2. Go to Settings
3. Click "Sample Data" tab
4. Check "Food Court" and "Global Pagoda"
5. Click "Create 5 Sample Entries (2 dept)"
6. Success message appears
7. Go to Dashboard to see new data

### Task 2: Send Test Report
1. Login as admin
2. Go to Settings
3. Click "Send Reports" tab
4. Scroll to "Send Test Report" section
5. Click "Select All"
6. Click "Send Test Report (5 dept)"
7. Check aryalsujay@gmail.com for emails

### Task 3: View Live Logs
1. Login as admin
2. Go to Settings
3. Click "Logs" tab
4. Check "Auto-refresh"
5. Watch logs update in real-time
6. Open another browser and login
7. See login appear in logs!

### Task 4: Restart Server
1. Login as admin
2. Go to Settings
3. Click "System" tab
4. Click "Restart Server"
5. Confirm the action
6. Wait 10 seconds
7. Refresh page - server is back!

### Task 5: Filter Departments (Trust User)
1. Login as trust
2. Go to Dashboard
3. Click filter dropdown (top right)
4. Select "Food Court"
5. See only food court feedback
6. Switch to Analytics
7. Filter works there too!

---

## 💡 Pro Tips

### For Super Admin:

**Tip 1: Use Test Reports Before Production**
- Always send test reports first
- Verify email format looks good
- Check that data is correct
- Then use "Send Report Now"

**Tip 2: Create Sample Data for Testing**
- Before making changes, create sample data
- Test your changes with sample data
- Clear sample data when done
- Never mix with real feedback

**Tip 3: Monitor Logs Regularly**
- Enable auto-refresh in Logs tab
- Look for errors or warnings
- Check login attempts
- Monitor API response times

**Tip 4: Organize Your Workflow**
- Report Schedule tab: Set it and forget it
- Send Reports tab: Weekly production use
- Sample Data tab: Development only
- System tab: When things go wrong
- Logs tab: For debugging

### For Trust User:

**Tip 1: Use Department Filter Effectively**
- Start with "All Departments" overview
- Drill down to specific departments
- Compare feedback across departments
- Look for patterns

**Tip 2: Configure Report Schedule**
- Set appropriate times for your timezone
- Consider department email habits
- Test with "Send Test Report" (ask super admin)
- Adjust based on feedback

---

## 🚨 Common Scenarios

### Scenario 1: "I need to test the email system"
**Solution:**
1. Login as admin
2. Settings → Send Reports tab
3. Use "Send Test Report"
4. Select departments to test
5. Check BCC email
6. Department emails NOT affected!

### Scenario 2: "Dashboard looks cluttered with test data"
**Solution:**
1. Login as admin
2. Settings → Sample Data tab
3. Scroll to "Clear All Feedback Data"
4. Click the red button
5. Confirm deletion
6. All data cleared!

### Scenario 3: "Server is acting weird"
**Solution:**
1. Login as admin
2. Settings → Logs tab
3. Look for errors
4. If needed: System tab → Restart Server
5. Check logs again after restart

### Scenario 4: "Trust user says they can't see Food Court"
**Solution:**
1. Trust user should see filter dropdown
2. Click filter (top right of Dashboard/Analytics)
3. Select "Food Court"
4. If still not visible, contact super admin

### Scenario 5: "Need to add new admin user"
**Current:** Manual process (run scripts)
**Coming Soon:** User Management tab will have "Add User" button

---

## 📱 Mobile Experience

**Good News:** All features work on mobile!

**On Small Screens:**
- Tabs scroll horizontally (swipe left/right)
- Tables become card layout
- Buttons stack vertically
- Filters are touch-friendly
- Everything is responsive

**Tips for Mobile:**
- Use landscape mode for better view
- Swipe tabs horizontally
- Tap and hold for detailed info
- Use "Select All" for quick selection

---

## 🎨 Visual Cues

### Color Coding:
- **Blue** = Test/Safe features (Test Reports, Logs)
- **Green** = Production features (Send Reports)
- **Purple** = Development features (Sample Data)
- **Red** = Destructive features (Clear Data, Restart)
- **Orange** = System features (Restart Server)

### Icons:
- 📅 Clock = Scheduling
- 📤 Send = Sending reports
- 📊 Database = Data management
- 👥 Users = User management
- ⚙️ Settings = System configuration
- 📝 File = Logs and documentation

### Status Indicators:
- ✅ Green checkmark = Success
- ❌ Red X = Error
- ⚠️ Warning triangle = Caution required
- 🔄 Loading spinner = Processing

---

## ❓ FAQ

**Q: Can trust user create sample data?**
A: No, only super admin can create/delete sample data.

**Q: Can trust user restart the server?**
A: No, only super admin has system access.

**Q: Can trust user view logs?**
A: No, logs are super admin only for security.

**Q: Can trust user send test reports?**
A: No, but they can configure the report schedule.

**Q: What happens if I click "Clear All Data" by mistake?**
A: It asks for confirmation first! But once confirmed, data is permanently deleted.

**Q: Does restarting server affect user sessions?**
A: Yes, users will need to refresh their browser after restart.

**Q: How do I switch back to old Settings?**
A: The old Settings page has been replaced. All features are now in tabs.

**Q: Can I see logs from yesterday?**
A: Currently shows last 100 lines. For historical logs, use SSH and journalctl.

**Q: Why can't I see some tabs?**
A: Your role determines which tabs you see. Trust users see only Report Schedule.

---

## 🎯 Success Metrics

**You'll know it's working when:**

✅ Trust user sees filter dropdown in Dashboard
✅ Trust user can switch between departments
✅ Super admin sees 6 tabs in Settings
✅ Tabs switch instantly without page reload
✅ Sample data appears in Dashboard after creation
✅ Test reports arrive at BCC email only
✅ Logs display in terminal-style view
✅ Server restarts successfully and comes back
✅ No scrolling needed in Settings

---

## 🔗 Quick Links

- **Admin Login:** http://172.12.0.28/admin
- **Dashboard:** http://172.12.0.28/admin/dashboard
- **Analytics:** http://172.12.0.28/admin/analytics
- **Settings:** http://172.12.0.28/admin/settings

---

## 📞 Need Help?

**For Technical Issues:**
- Check Logs tab first
- Try restarting server
- Contact system administrator

**For Feature Requests:**
- Document what you need
- Contact development team
- Check "Coming Soon" sections

**For Access Issues:**
- Verify your username/password
- Check your role (admin vs super_admin)
- Contact super admin for permission changes

---

**Last Updated:** February 6, 2026
**Version:** 2.0 - Enhanced Features
**Status:** ✅ Live and Working

Enjoy your enhanced admin experience! 🎉
