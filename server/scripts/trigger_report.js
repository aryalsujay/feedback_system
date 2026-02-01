const path = require('path');
// Load env vars FIRST
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { generateAndSendReports } = require('../services/reportGenerator'); // Adjust path
const mongoose = require('mongoose');

const trigger = async () => {
    // Non-blocking connect just in case
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback_system').catch(e => console.log('Mongo Connect Error (ignored if using embedded):', e.message));

    // Dates for Jan 2026 - Triggering only 1 week as requested ("1 email")
    const periods = [
        // { start: '2026-01-01', end: '2026-01-07' },
        // { start: '2026-01-08', end: '2026-01-14' },
        // { start: '2026-01-15', end: '2026-01-21' },
        { start: '2026-01-22', end: '2026-01-28' }
    ];

    try {
        for (const period of periods) {
            console.log(`Generating report for: ${period.start} to ${period.end}`);
            // Assuming generateWeeklyReport accepts (startDate, endDate) or similar.
            await generateAndSendReports(new Date(period.start), new Date(period.end));

            // Wait a bit to avoid rate limits or overlap
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (e) {
        console.error(e);
    } finally {
        // We can't easily disconnect if we didn't await connect, but that's fine for a script.
        // If embedded, it might keep running.
        // Force exit after a buffer
        setTimeout(() => process.exit(0), 1000);
    }
};

trigger();
