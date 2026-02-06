# Role-Based Access Control (RBAC) Implementation

## Summary of Changes

### 1. New User Created: "trust"
- **Username**: `trust`
- **Password**: `trustee557`
- **Role**: `admin` (not super_admin)
- **Department**: `global`
- **Access**: Can view all departments but CANNOT use "Send Report Now" button

### 2. Role Hierarchy
- **super_admin**: Full access (user: `admin`)
  - Can send reports to all departments
  - Can create sample data
  - Can send test reports to BCC only
  - Has access to "Send Report Now" button

- **admin**: Limited access (users: `trust`, `gvp`, `fc`, `svct`, `dlaya`, `dpvc`)
  - Can view dashboard and analytics
  - Can configure report settings for their department
  - CANNOT use "Send Report Now" button
  - CANNOT create sample data
  - CANNOT send test reports

### 3. New Features for Super Admin

#### A. Create Sample Data
- **Location**: Settings page (super_admin only)
- **Functionality**:
  - Select one or more departments
  - Creates 5 sample feedback entries per department
  - Sample data includes realistic ratings and feedback text
  - Data is created with random dates within the last 7 days
- **API Endpoint**: `POST /api/admin/create-sample-data`
- **Request Body**: `{ departments: ['global_pagoda', 'food_court', ...] }`

#### B. Send Test Report
- **Location**: Settings page (super_admin only)
- **Functionality**:
  - Select one or more departments
  - Sends test reports ONLY to `aryalsujay@gmail.com` (BCC)
  - Department emails do NOT receive these test reports
  - Includes feedback data from the last 7 days
- **API Endpoint**: `POST /api/admin/send-test-report`
- **Request Body**: `{ departments: ['global_pagoda', 'food_court', ...] }`

#### C. Send Report Now (existing, clarified)
- **Location**: Settings page (super_admin only)
- **Functionality**:
  - Sends reports to ALL department emails
  - Also sends BCC to `aryalsujay@gmail.com`
  - This is for production use, not testing
- **API Endpoint**: `POST /api/admin/send-report-now`

### 4. Files Modified

#### Backend Files:
1. **server/scripts/seedAdmins.js**
   - Added "trust" user with admin role

2. **server/routes/admin.js**
   - Added `POST /api/admin/create-sample-data` endpoint
   - Added `POST /api/admin/send-test-report` endpoint
   - Both endpoints check for `super_admin` role

#### Frontend Files:
1. **client/src/pages/admin/Settings.jsx**
   - Added UI for "Create Sample Data" with department selection
   - Added UI for "Send Test Report" with department selection
   - Both sections only visible to super_admin
   - Added state management for department selection
   - Added handlers for new API calls

### 5. Testing the Implementation

#### Test 1: Login as "trust" user
```bash
# Login credentials:
Username: trust
Password: trustee557
```
- Should be able to access admin panel
- Should NOT see "Send Report Now" button
- Should NOT see "Create Sample Data" section
- Should NOT see "Send Test Report" section
- Can view analytics and dashboard for global department

#### Test 2: Login as "admin" (super_admin)
```bash
# Login credentials:
Username: admin
Password: [from SUPER_ADMIN_PASSWORD env variable or default "1234"]
```
- Should see all three sections:
  1. Send Report Now
  2. Create Sample Data
  3. Send Test Report

#### Test 3: Create Sample Data
1. Login as admin (super_admin)
2. Go to Settings page
3. Scroll to "Create Sample Data" section
4. Select one or more departments
5. Click "Create 5 Sample Data"
6. Check Dashboard to see new sample entries

#### Test 4: Send Test Report
1. Login as admin (super_admin)
2. Go to Settings page
3. Scroll to "Send Test Report" section
4. Select one or more departments
5. Click "Send Test Report"
6. Check email at aryalsujay@gmail.com for test reports
7. Verify department emails did NOT receive these reports

### 6. Security Considerations

- All new endpoints check for `super_admin` role via middleware
- Returns 403 Forbidden if non-super_admin tries to access
- Frontend hides UI elements for non-super_admin users
- Password for "trust" user is hardcoded (consider using environment variable for production)

### 7. User Accounts Summary

| Username | Password | Role | Department | Access Level |
|----------|----------|------|------------|--------------|
| admin | [ENV] | super_admin | global | Full access |
| trust | trustee557 | admin | global | Limited (no send reports) |
| gvp | [ENV] | admin | global_pagoda | Department only |
| fc | [ENV] | admin | food_court | Department only |
| svct | [ENV] | admin | souvenir_shop | Department only |
| dlaya | [ENV] | admin | dhamma_alaya | Department only |
| dpvc | [ENV] | admin | dpvc | Department only |

### 8. Next Steps (Optional)

1. Consider adding environment variable for "trust" user password
2. Add audit logging for sample data creation
3. Add audit logging for test report sends
4. Consider adding ability to delete sample data
5. Add pagination for large datasets in dashboard

## Deployment

To apply these changes:

1. Run the seed script to create users (already done):
   ```bash
   cd /home/feedback/feedback_system/server
   node scripts/seedAdmins.js
   ```

2. Restart the server:
   ```bash
   # Stop server
   pm2 stop feedback-server

   # Start server
   pm2 start feedback-server

   # Or if not using pm2:
   pkill -f "node server.js"
   cd /home/feedback/feedback_system/server
   node server.js
   ```

3. Rebuild client (if needed):
   ```bash
   cd /home/feedback/feedback_system/client
   npm run build
   ```

## API Documentation

### POST /api/admin/create-sample-data
**Authorization**: Bearer token (super_admin only)

**Request Body**:
```json
{
  "departments": ["global_pagoda", "food_court", "souvenir_shop", "dhamma_alaya", "dpvc"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully created 25 sample feedback entries for 5 department(s).",
  "count": 25,
  "departments": ["global_pagoda", "food_court", "souvenir_shop", "dhamma_alaya", "dpvc"]
}
```

### POST /api/admin/send-test-report
**Authorization**: Bearer token (super_admin only)

**Request Body**:
```json
{
  "departments": ["global_pagoda", "food_court"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Test reports sent to aryalsujay@gmail.com for 2 department(s).",
  "departments": ["global_pagoda", "food_court"]
}
```

---

**Implementation Date**: 2026-02-06
**Implemented By**: Claude Code Assistant
