const ReportSettings = require('../models/ReportSettings');

async function testReportSettings() {
    console.log('\n========================================');
    console.log('Testing Report Settings Feature');
    console.log('========================================\n');

    try {
        // Test 1: Create default settings for a department
        console.log('Test 1: Creating default settings for food_court...');
        const foodCourtSettings = {
            department: 'food_court',
            dayOfWeek: 0,
            hour: 9,
            minute: 0,
            enabled: true
        };

        await ReportSettings.update(
            { department: 'food_court' },
            foodCourtSettings,
            { upsert: true }
        );
        console.log('✅ Default settings created');

        // Test 2: Read settings
        console.log('\nTest 2: Reading settings...');
        const settings = await ReportSettings.findOne({ department: 'food_court' });
        console.log('✅ Settings retrieved:', settings);

        // Test 3: Update settings
        console.log('\nTest 3: Updating settings to Friday 5:30 PM...');
        await ReportSettings.update(
            { department: 'food_court' },
            {
                department: 'food_court',
                dayOfWeek: 5, // Friday
                hour: 17,
                minute: 30,
                enabled: true,
                updatedAt: new Date()
            }
        );

        const updatedSettings = await ReportSettings.findOne({ department: 'food_court' });
        console.log('✅ Settings updated:', updatedSettings);

        // Test 4: List all settings
        console.log('\nTest 4: Listing all department settings...');
        const allSettings = await ReportSettings.find({});
        console.log(`✅ Found ${allSettings.length} department setting(s):`);
        allSettings.forEach(s => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            console.log(`   - ${s.department}: ${days[s.dayOfWeek]} at ${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')} ${s.enabled ? '(Enabled)' : '(Disabled)'}`);
        });

        // Test 5: Disable reports
        console.log('\nTest 5: Disabling reports for food_court...');
        await ReportSettings.update(
            { department: 'food_court' },
            { $set: { enabled: false } }
        );

        const disabledSettings = await ReportSettings.findOne({ department: 'food_court' });
        console.log('✅ Reports disabled:', disabledSettings.enabled);

        console.log('\n========================================');
        console.log('All tests passed successfully! ✅');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }

    process.exit(0);
}

testReportSettings();
