const API_URL = 'http://localhost:5001/api';

async function verify() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: '1234'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        // 2. Fetch Analytics
        console.log('Fetching Analytics...');
        const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!analyticsRes.ok) throw new Error(`Analytics fetch failed: ${analyticsRes.status}`);
        const data = await analyticsRes.json();
        console.log('✅ Analytics fetched');

        // 3. Verify Fields
        const checks = {
            'npsScore': data.npsScore !== undefined,
            'questionPerformance': Array.isArray(data.questionPerformance),
            'categoryPerformance': Array.isArray(data.categoryPerformance),
            'criticalAlerts': Array.isArray(data.criticalAlerts)
        };

        console.log('--- Verification Results ---');
        let allPass = true;
        for (const [field, pass] of Object.entries(checks)) {
            if (!pass) allPass = false;
            console.log(`${pass ? '✅' : '❌'} ${field}: ${pass ? 'Present' : 'Missing/Invalid'}`);
        }

        if (allPass) {
            console.log('\n✨ Verification SUCCESS: Analytics endpoint returns enhanced data format.');

            // Print sample data
            console.log('\nSample Question Performance:');
            console.log(JSON.stringify(data.questionPerformance.slice(0, 2), null, 2));
            console.log('\nSample Category Performance:');
            console.log(JSON.stringify(data.categoryPerformance.slice(0, 2), null, 2));
            console.log('\nSample Critical Alerts:');
            console.log(JSON.stringify(data.criticalAlerts.slice(0, 1), null, 2));

        } else {
            console.error('\n❌ Verification FAILED: Some fields are missing.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verify();
