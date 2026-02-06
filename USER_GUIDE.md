# User Guide - Admin Access Levels

## Quick Login Reference

### Super Admin (Full Access)
```
URL:      http://172.12.0.28/admin
Username: admin
Password: admin123
```

### Trust Admin (Limited Access)
```
URL:      http://172.12.0.28/admin
Username: trust
Password: trustee557
```

---

## Feature Comparison

| Feature                        | Super Admin (admin) | Admin (trust) | Department Admins |
|--------------------------------|---------------------|---------------|-------------------|
| **Dashboard Access**           | ✅ All Departments  | ✅ All Depts  | ✅ Own Dept Only  |
| **Analytics Access**           | ✅ All Departments  | ✅ All Depts  | ✅ Own Dept Only  |
| **Report Settings**            | ✅ All Departments  | ✅ Global     | ✅ Own Dept Only  |
| **Send Report Now**            | ✅ YES              | ❌ NO         | ❌ NO             |
| **Create Sample Data**         | ✅ YES              | ❌ NO         | ❌ NO             |
| **Send Test Report**           | ✅ YES              | ❌ NO         | ❌ NO             |

---

## What Each User Can See

### Super Admin (admin) - Settings Page

When you login as **admin**, you will see THREE sections:

#### 1. 🟢 Send Report Now (Green Box)
- Sends reports to ALL department emails
- Also sends BCC to aryalsujay@gmail.com
- Use this for production

#### 2. 🟣 Create Sample Data (Purple Box)
- Select departments (checkboxes)
- Creates 5 test feedback entries per department
- Use this for testing the system

#### 3. 🔵 Send Test Report (Blue Box)
- Select departments (checkboxes)
- Sends reports ONLY to aryalsujay@gmail.com
- Department emails will NOT receive these
- Use this to test email delivery

---

### Trust Admin (trust) - Settings Page

When you login as **trust**, you will see:

#### 1. ⚙️ Weekly Report Schedule
- Can configure report schedule
- Can enable/disable reports
- **CANNOT** send reports immediately

#### 2. ℹ️ Important Information Box
- Shows default schedule info

**You will NOT see:**
- ❌ Send Report Now section
- ❌ Create Sample Data section
- ❌ Send Test Report section

---

## Common Tasks

### As Super Admin (admin)

#### To Create Test Data:
1. Login as admin (admin123)
2. Go to Settings
3. Scroll to "Create Sample Data" (purple section)
4. Check the departments you want (e.g., Food Court, Global Pagoda)
5. Click "Create 5 Sample Data"
6. Go to Dashboard to see the new entries

#### To Send Test Report:
1. Login as admin (admin123)
2. Go to Settings
3. Scroll to "Send Test Report" (blue section)
4. Check the departments
5. Click "Send Test Report"
6. Check aryalsujay@gmail.com for the report

#### To Send Production Reports:
1. Login as admin (admin123)
2. Go to Settings
3. Scroll to "Send Report Now" (green section)
4. Click "Send Report Now"
5. Reports will be sent to all department emails + BCC

---

### As Trust Admin (trust)

#### To View Feedback:
1. Login as trust (trustee557)
2. Go to Dashboard
3. Use the filter dropdown to view different departments
4. Click on any row to see full details

#### To View Analytics:
1. Login as trust (trustee557)
2. Go to Analytics
3. Use the filter dropdown to view different departments
4. See satisfaction scores, trends, and insights

#### To Configure Report Schedule:
1. Login as trust (trustee557)
2. Go to Settings
3. Adjust the schedule settings
4. Click "Save Settings"

**Note:** You cannot send reports immediately - only the super admin can do that.

---

## Department Admin Accounts

| Department       | Username | Access Level                          |
|------------------|----------|---------------------------------------|
| Global Pagoda    | gvp      | Only Global Pagoda data               |
| Food Court       | fc       | Only Food Court data                  |
| Souvenir Shop    | svct     | Only Souvenir Shop data               |
| Dhamma Alaya     | dlaya    | Only Dhamma Alaya data                |
| DPVC             | dpvc     | Only DPVC data                        |

*Passwords are stored in environment variables*

---

## Troubleshooting

### "I can't see the Send Report button"
- This is normal if you're logged in as "trust" or department admin
- Only the super admin (username: admin) can see this button

### "I can't see the Create Sample Data section"
- This is normal if you're logged in as "trust" or department admin
- Only the super admin (username: admin) can see this section

### "I forgot my password"
- Super Admin: Check `/home/feedback/feedback_system/server/.env` for SUPER_ADMIN_PASSWORD
- Trust: Password is "trustee557" (hardcoded)
- Department Admins: Check `.env` file for department-specific passwords

---

## Best Practices

### For Testing (Super Admin)
1. ✅ Use "Create Sample Data" to generate test feedback
2. ✅ Use "Send Test Report" to test email delivery
3. ✅ Always verify test emails before using "Send Report Now"
4. ✅ Create sample data in non-production departments first

### For Production (Super Admin)
1. ⚠️ Only use "Send Report Now" when you want to send to actual department emails
2. ⚠️ Remember that department emails will receive these reports
3. ✅ Check that report settings are correct before sending
4. ✅ Verify the date range in the report

### For Trust Admin
1. ✅ You can safely view all data without affecting anything
2. ✅ You can configure report schedules
3. ✅ You cannot accidentally send reports
4. ✅ Use this account for viewing and monitoring

---

## Questions?

Check the detailed documentation:
- **RBAC_IMPLEMENTATION.md** - Technical implementation details
- **DEPLOYMENT_SUMMARY.md** - Deployment and testing results
- **DEPLOYMENT_GUIDE.md** - How to deploy changes

---

**Last Updated:** February 6, 2026
