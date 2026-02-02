// Send test weekly report with current sample data
require('../config/init');

const { generateAndSendReports } = require('../services/reportGenerator');

const sendReport = async () => {
    console.log('📧 Generating and sending weekly report...\n');

    try {
        // Generate report for the last 7 days (will include all our sample data)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        console.log(`📅 Report period: ${startDate.toDateString()} to ${endDate.toDateString()}\n`);

        await generateAndSendReports(startDate, endDate);

        console.log('\n✅ Report generation complete!');
        console.log('📬 Email sent to: tod@vridhamma.org');
        console.log('📊 Check inbox for weekly reports from all 5 departments\n');

        setTimeout(() => process.exit(0), 2000);
    } catch (error) {
        console.error('❌ Error:', error);
        setTimeout(() => process.exit(1), 2000);
    }
};

sendReport();
