const ReportSettings = require('../models/ReportSettings');
const fs = require('fs');
const path = require('path');

async function resetDefaultSchedules() {
    console.log('\n========================================');
    console.log('Resetting All Departments to Default Schedule');
    console.log('========================================\n');

    try {
        // Get all departments from emails.json
        const emailsPath = path.join(__dirname, '../../config/emails.json');
        const emailsConfig = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
        const departments = Object.keys(emailsConfig).filter(dept => dept !== 'admin');

        console.log(`Found ${departments.length} departments:\n`);

        // Reset each department to default
        for (const dept of departments) {
            const defaultSettings = {
                department: dept,
                dayOfWeek: 0, // Sunday
                hour: 9,
                minute: 0,
                enabled: true,
                updatedAt: new Date()
            };

            await ReportSettings.update(
                { department: dept },
                defaultSettings,
                { upsert: true }
            );

            console.log(`✅ ${dept.padEnd(20)} - Sunday at 09:00 AM IST (Enabled)`);
        }

        console.log('\n========================================');
        console.log('All departments reset to default schedule');
        console.log('Default: Sunday at 9:00 AM IST');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
}

resetDefaultSchedules();
