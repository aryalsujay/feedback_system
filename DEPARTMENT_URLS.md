# Department Feedback URLs

## Overview
Direct access URLs for department feedback forms (No login required)

## External URLs (via Sophos)
Access from outside the network using the domain name:

1. **GVP - Public Relations**
   - URL: `http://feedback.globalpagoda.org:8888/pr`
   - Department ID: `global_pagoda`

2. **Food Court**
   - URL: `http://feedback.globalpagoda.org:8888/fc`
   - Department ID: `food_court`

3. **DPVC (Dhamma Pattana Vipassana Centre)**
   - URL: `http://feedback.globalpagoda.org:8888/dpvc`
   - Department ID: `dpvc`

4. **Dhammalaya**
   - URL: `http://feedback.globalpagoda.org:8888/dlaya`
   - Department ID: `dhamma_alaya`

5. **Souvenir Shop**
   - URL: `http://feedback.globalpagoda.org:8888/ss`
   - Department ID: `souvenir_shop`

## Internal URLs (Local Network)
Access from within the local network using the server IP:

1. **GVP - Public Relations**
   - URL: `http://172.12.0.28/pr`

2. **Food Court**
   - URL: `http://172.12.0.28/fc`

3. **DPVC (Dhamma Pattana Vipassana Centre)**
   - URL: `http://172.12.0.28/dpvc`

4. **Dhammalaya**
   - URL: `http://172.12.0.28/dlaya`

5. **Souvenir Shop**
   - URL: `http://172.12.0.28/ss`

## Admin Access
- **Admin Login**: `http://feedback.globalpagoda.org:8888/admin/login`
- **Internal Admin Login**: `http://172.12.0.28/admin/login`
- **Username**: `admin`
- **Password**: `admin977`

## QR Code Generation
Generate QR codes for the external URLs listed above to allow easy access via mobile devices.

## Notes
- External URLs are configured via Sophos firewall by IT team
- Internal URLs work within the local network without port 8888
- No user login required for feedback forms - only admin login for admin panel
- All feedbacks are accessible via admin panel regardless of submission method
