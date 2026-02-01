const { generateAndSendReports } = require('../services/reportGenerator');

const run = async () => {
    try {
        console.log('Generating report via Embedded DB...');
        await generateAndSendReports();
        console.log('Manual report generation complete.');
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
