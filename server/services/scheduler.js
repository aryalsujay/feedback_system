const cron = require('node-cron');
const { generateAndSendReports } = require('./reportGenerator');

const initScheduler = () => {
    // Schedule for every Sunday at 9:00 AM
    cron.schedule('0 9 * * 0', async () => {
        console.log('Running scheduled weekly report...');
        await generateAndSendReports();
    });

    console.log('Scholar initialized: Weekly report scheduled for Sunday 9:00 AM.');
};

module.exports = { initScheduler };
