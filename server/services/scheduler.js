const cron = require('node-cron');
const { generateAndSendReports } = require('./reportGenerator');
const ReportSettings = require('../models/ReportSettings');
const fs = require('fs');
const path = require('path');

const scheduledTasks = new Map();

const getDepartments = () => {
    const emailsPath = path.join(__dirname, '../../config/emails.json');
    const emailsConfig = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
    return Object.keys(emailsConfig).filter(dept => dept !== 'admin');
};

const scheduleDepartmentReport = async (department) => {
    // Get settings for this department
    let settings = await ReportSettings.findOne({ department });

    // If no settings exist, use defaults
    if (!settings) {
        settings = {
            department,
            dayOfWeek: 0, // Sunday
            hour: 9,
            minute: 0,
            enabled: true
        };
        // Save default settings
        await ReportSettings.insert(settings);
    }

    if (!settings.enabled) {
        console.log(`Reports disabled for ${department}`);
        return;
    }

    // Cancel existing task if any
    if (scheduledTasks.has(department)) {
        scheduledTasks.get(department).stop();
        scheduledTasks.delete(department);
    }

    // Create cron expression: minute hour * * dayOfWeek
    const cronExpression = `${settings.minute} ${settings.hour} * * ${settings.dayOfWeek}`;

    const task = cron.schedule(cronExpression, async () => {
        console.log(`Running scheduled weekly report for ${department}...`);
        await generateAndSendReports(null, null, [department]);
    });

    scheduledTasks.set(department, task);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`Scheduled report for ${department}: ${days[settings.dayOfWeek]} at ${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`);
};

const initScheduler = async () => {
    console.log('Initializing report scheduler...');

    const departments = getDepartments();

    for (const dept of departments) {
        await scheduleDepartmentReport(dept);
    }

    console.log(`Scheduler initialized: ${departments.length} department(s) configured.`);
};

// Function to refresh a specific department's schedule (called when settings are updated)
const refreshDepartmentSchedule = async (department) => {
    console.log(`Refreshing schedule for ${department}...`);
    await scheduleDepartmentReport(department);
};

module.exports = { initScheduler, refreshDepartmentSchedule };
