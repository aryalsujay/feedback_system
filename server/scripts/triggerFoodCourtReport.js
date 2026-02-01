require('../config/init');
const { generateAndSendReports } = require('../services/reportGenerator');

const run = async () => {
    try {
        console.log('Generating Food Court report...');
        // Pass null for dates to use default (last 7 days)
        // Pass ['food_court'] for filtering
        await generateAndSendReports(null, null, ['food_court']);
        console.log('Food Court report generation complete.');
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
};

run();
