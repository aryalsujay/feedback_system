const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const ReportSettings = require('../models/ReportSettings');
const { refreshDepartmentSchedule } = require('../services/scheduler');
const { generateAndSendReports } = require('../services/reportGenerator');
const { sendDepartmentReport } = require('../services/reportGenerator');

// @route   GET /api/admin/submissions
// @desc    Get all feedback submissions (filtered by role)
// @access  Private (Admin/Super Admin)
router.get('/submissions', auth, async (req, res) => {
    try {
        const { role, department } = req.user;
        let query = {};

        // If user is basic admin with specific department, force filter by their department
        if (role === 'admin' && department !== 'global') {
            query.department = department;
        }
        // If super_admin OR admin with global department, they CAN filter by query param, or see all
        else if (role === 'super_admin' || (role === 'admin' && department === 'global')) {
            if (req.query.department && req.query.department !== 'global') {
                query.department = req.query.department;
            }
        }

        const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private
router.get('/analytics', auth, async (req, res) => {
    try {
        const { role, department } = req.user;
        let matchStage = {};

        if (role === 'admin' && department !== 'global') {
            matchStage.department = department;
        } else if (role === 'super_admin' || (role === 'admin' && department === 'global')) {
            if (req.query.department && req.query.department !== 'global') {
                matchStage.department = req.query.department;
            }
        }

        const feedbacks = await Feedback.find(matchStage).sort({ createdAt: 1 });

        // --- derived analytics ---
        const total = feedbacks.length;
        const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0 };
        const departmentCounts = {};
        const timelineMap = {};

        // Accumulators for averages
        let totalRating = 0;
        let ratingCount = 0;

        // NEW: Category & Question stats
        const categoryStats = {}; // { 'Cleanliness': { total: 0, count: 0 }, ... }
        const questionStats = {}; // { 'food_taste': { total: 0, count: 0 }, ... }

        // NEW: Satisfaction Score Calculation (0-100)
        // Formula: (Average Rating / 5) * 100
        // We will calculate overall average of ALL questions across all feedbacks
        let globalTotalScore = 0;
        let globalQuestionCount = 0;

        feedbacks.forEach(f => {
            // Sentiment
            if (sentimentCounts[f.sentiment] !== undefined) {
                sentimentCounts[f.sentiment]++;
            }

            // Department
            departmentCounts[f.department] = (departmentCounts[f.department] || 0) + 1;

            // Timeline
            const date = new Date(f.createdAt).toISOString().split('T')[0];
            timelineMap[date] = (timelineMap[date] || 0) + 1;

            // Processing Answers
            if (f.answers) {
                // Overall Rating for average display
                if (f.answers.overall_experience) {
                    const val = Number(f.answers.overall_experience);
                    if (!isNaN(val)) {
                        totalRating += val;
                        ratingCount++;
                    }
                }

                // Question & Category Level Stats
                for (const [key, value] of Object.entries(f.answers)) {
                    // Safe conversion to number
                    const numValue = Number(value);

                    // Only count valid 1-5 ratings
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {

                        // Global Accumulators
                        globalTotalScore += numValue;
                        globalQuestionCount++;

                        // 1. Question Stats
                        if (!questionStats[key]) questionStats[key] = { total: 0, count: 0 };
                        questionStats[key].total += numValue;
                        questionStats[key].count++;

                        // 2. Category Stats (simplistic derived category mapping)
                        let cat = 'Other';
                        if (key.includes('clean') || key.includes('hygiene')) cat = 'Cleanliness';
                        else if (key.includes('food') || key.includes('taste')) cat = 'Food';
                        else if (key.includes('staff') || key.includes('service') || key.includes('guidance')) cat = 'Service';
                        else if (key.includes('peace') || key.includes('comf') || key.includes('accom') || key.includes('meditation')) cat = 'Ambience';
                        else if (key.includes('price') || key.includes('rate') || key.includes('value')) cat = 'Value for Money';

                        if (cat !== 'Other') {
                            if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 };
                            categoryStats[cat].total += numValue;
                            categoryStats[cat].count++;
                        }
                    }
                }
            }
        });

        // Format derived data
        const timeline = Object.keys(timelineMap).sort().map(date => ({
            date,
            count: timelineMap[date]
        }));

        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

        // Final Satisfaction Score (0-100)
        // Average of ALL questions normalized to 100
        const globalAverage = globalQuestionCount > 0 ? (globalTotalScore / globalQuestionCount) : 0;
        const satisfactionScore = ((globalAverage / 5) * 100).toFixed(0);

        // Format Question Stats
        const questionPerformance = Object.entries(questionStats).map(([key, data]) => ({
            questionId: key,
            average: (data.total / data.count).toFixed(1),
            count: data.count
        })).sort((a, b) => a.average - b.average); // Low scores first (pain points)

        // Format Category Stats
        const categoryPerformance = Object.entries(categoryStats).map(([key, data]) => ({
            category: key,
            average: (data.total / data.count).toFixed(1)
        })).sort((a, b) => b.average - a.average);

        // Get recent Critical Feedback (Negative sentiment)
        const criticalAlerts = feedbacks
            .filter(f => f.sentiment === 'Negative')
            .map(f => {
                // Calculate score for this specific feedback to show context
                let s = 0; let c = 0;
                if (f.answers) {
                    Object.values(f.answers).forEach(v => {
                        const n = Number(v);
                        if (!isNaN(n) && n >= 1 && n <= 5) { s += n; c++; }
                    });
                }
                const score = c > 0 ? (s / c).toFixed(1) : 'N/A';
                return { ...f, score };
            })
            .slice(-5)
            .reverse(); // Newest first

        res.json({
            total,
            sentimentCounts,
            departmentCounts,
            timeline,
            averageRating,
            satisfactionScore,
            questionPerformance,
            categoryPerformance,
            criticalAlerts,
            recentFeedbacks: feedbacks.slice(-5).reverse()
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/report-settings
// @desc    Get report schedule settings for the department
// @access  Private (Admin/Super Admin)
router.get('/report-settings', auth, async (req, res) => {
    try {
        const { role, department } = req.user;

        // Admins can only view their own department settings
        const deptToQuery = role === 'admin' ? department : (req.query.department || department);

        let settings = await ReportSettings.findOne({ department: deptToQuery });

        // If no settings exist, return defaults
        if (!settings) {
            settings = {
                department: deptToQuery,
                dayOfWeek: 0, // Sunday
                hour: 9,
                minute: 0,
                enabled: true
            };
        }

        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/report-settings
// @desc    Update report schedule settings for the department
// @access  Private (Admin/Super Admin)
router.put('/report-settings', auth, async (req, res) => {
    try {
        const { role, department } = req.user;
        const { dayOfWeek, hour, minute, enabled } = req.body;

        // Validation
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({ msg: 'Invalid day of week (0-6)' });
        }
        if (hour < 0 || hour > 23) {
            return res.status(400).json({ msg: 'Invalid hour (0-23)' });
        }
        if (minute < 0 || minute > 59) {
            return res.status(400).json({ msg: 'Invalid minute (0-59)' });
        }

        // Admins can only update their own department settings
        const deptToUpdate = role === 'admin' ? department : (req.body.department || department);

        const settingsData = {
            department: deptToUpdate,
            dayOfWeek,
            hour,
            minute,
            enabled: enabled !== undefined ? enabled : true,
            updatedAt: new Date()
        };

        // Upsert: Update if exists, insert if doesn't
        const numReplaced = await ReportSettings.update(
            { department: deptToUpdate },
            settingsData,
            { upsert: true }
        );

        const updatedSettings = await ReportSettings.findOne({ department: deptToUpdate });

        // Refresh the scheduler for this department
        await refreshDepartmentSchedule(deptToUpdate);

        res.json(updatedSettings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/send-report-now
// @desc    Trigger immediate report generation and sending for all departments
// @access  Private (Super Admin only)
router.post('/send-report-now', auth, async (req, res) => {
    try {
        const { role } = req.user;

        // Only super_admin can trigger reports for all departments
        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        console.log('Manual report trigger initiated by:', req.user.department);

        // Send reports for the current week (last 7 days) for all departments
        await generateAndSendReports();

        res.json({
            success: true,
            message: 'Reports are being generated and sent to all departments. Check your email inbox (including BCC: aryalsujay@gmail.com).'
        });
    } catch (err) {
        console.error('Error triggering report:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger reports. Check server logs for details.'
        });
    }
});

// @route   POST /api/admin/create-sample-data
// @desc    Create 5 sample feedback entries for selected departments
// @access  Private (Super Admin only)
router.post('/create-sample-data', auth, async (req, res) => {
    try {
        const { role } = req.user;

        // Only super_admin can create sample data
        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { departments } = req.body;

        if (!departments || !Array.isArray(departments) || departments.length === 0) {
            return res.status(400).json({ msg: 'Please select at least one department' });
        }

        const validDepartments = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc'];
        const selectedDepts = departments.filter(d => validDepartments.includes(d));

        if (selectedDepts.length === 0) {
            return res.status(400).json({ msg: 'No valid departments selected' });
        }

        // Helper functions for sample data generation
        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const suggestions = [
            "Great experience!",
            "Could be cleaner.",
            "Staff was very helpful.",
            "Lines were too long.",
            "Peaceful environment.",
            "Food was delicious.",
            "Will come again.",
            "Need more signage.",
            "Bathrooms need attention.",
            "Excellent service."
        ];

        const categories = ['Service', 'Cleanliness', 'Food', 'Ambience', 'Other'];
        const sentiments = ['Positive', 'Neutral', 'Negative'];

        const generateAnswers = (dept) => {
            const commonAnswers = {
                overall_experience: getRandomInt(3, 5),
                suggestion: getRandomItem(suggestions)
            };

            switch (dept) {
                case 'global_pagoda':
                    return {
                        ...commonAnswers,
                        peaceful: getRandomInt(4, 5),
                        vipassana_understanding: getRandomInt(3, 5),
                        course_interest: getRandomInt(2, 5),
                        cleanliness: getRandomInt(3, 5),
                        staff_behavior: getRandomInt(4, 5)
                    };
                case 'food_court':
                    return {
                        ...commonAnswers,
                        food_taste: getRandomInt(3, 5),
                        service_counters: getRandomInt(2, 5),
                        service_speed: getRandomInt(3, 5),
                        cleanliness: getRandomInt(3, 5),
                        food_quality: getRandomInt(3, 5)
                    };
                case 'souvenir_shop':
                    return {
                        ...commonAnswers,
                        product_search: getRandomInt(3, 5),
                        product_quality: getRandomInt(4, 5),
                        price_reasonableness: getRandomInt(3, 5),
                        staff_knowledge: getRandomInt(4, 5),
                        recommendation_likelihood: getRandomInt(4, 5)
                    };
                case 'dhamma_alaya':
                    return {
                        ...commonAnswers,
                        room_comfort: getRandomInt(3, 5),
                        cleanliness: getRandomInt(4, 5),
                        food_quality: getRandomInt(3, 5),
                        staff_support: getRandomInt(4, 5),
                        rates_reasonableness: getRandomInt(3, 5),
                        recommendation_likelihood: getRandomInt(4, 5)
                    };
                case 'dpvc':
                    return {
                        ...commonAnswers,
                        accommodation: getRandomInt(4, 5),
                        food_dining: getRandomInt(3, 5),
                        meditation_facilities: getRandomInt(5, 5),
                        course_management: getRandomInt(4, 5),
                        guidance_support: getRandomInt(4, 5),
                        recommendation_likelihood: getRandomInt(5, 5)
                    };
                default:
                    return commonAnswers;
            }
        };

        const entries = [];

        for (const dept of selectedDepts) {
            for (let i = 0; i < 5; i++) {
                const answers = generateAnswers(dept);

                // Random date within the last 7 days
                const date = new Date();
                date.setDate(date.getDate() - getRandomInt(0, 6));

                const feedbackText = answers.suggestion || getRandomItem(suggestions);
                const sentiment = getRandomItem(sentiments);
                const category = getRandomItem(categories);

                entries.push({
                    department: dept,
                    answers: answers,
                    feedback: feedbackText,
                    category: category,
                    sentiment: sentiment,
                    name: `Sample User ${i + 1}`,
                    email: `sample${i + 1}@example.com`,
                    createdAt: date,
                    updatedAt: date
                });
            }
        }

        await Feedback.insert(entries);

        res.json({
            success: true,
            message: `Successfully created ${entries.length} sample feedback entries for ${selectedDepts.length} department(s).`,
            count: entries.length,
            departments: selectedDepts
        });
    } catch (err) {
        console.error('Error creating sample data:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create sample data. Check server logs for details.'
        });
    }
});

// Test report endpoint removed - use custom report with specific recipients instead

// @route   POST /api/admin/clear-all-feedback
// @desc    Clear all feedback data from database
// @access  Private (Super Admin only)
router.post('/clear-all-feedback', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const numRemoved = await Feedback.remove({}, { multi: true });

        res.json({
            success: true,
            message: `Successfully deleted ${numRemoved} feedback entries.`,
            count: numRemoved
        });
    } catch (err) {
        console.error('Error clearing feedback:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to clear feedback data.'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Super Admin only)
router.get('/users', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const User = require('../models/User');
        const users = await User.find({}, { password: 0 }); // Exclude password field

        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Super Admin only)
router.post('/users', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { username, password, role: userRole, department } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        if (password.length < 4) {
            return res.status(400).json({ msg: 'Password must be at least 4 characters' });
        }

        const User = require('../models/User');
        const bcrypt = require('bcryptjs');

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.insert({
            username,
            password: hashedPassword,
            role: userRole || 'admin',
            department: department || 'global',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                department: newUser.department
            }
        });
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user role and department
// @access  Private (Super Admin only)
router.put('/users/:id', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { role: userRole, department } = req.body;
        const userId = req.params.id;

        const User = require('../models/User');

        // Find user
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update user
        const numReplaced = await User.update(
            { _id: userId },
            {
                $set: {
                    role: userRole || user.role,
                    department: department || user.department,
                    updatedAt: new Date()
                }
            }
        );

        const updatedUser = await User.findOne({ _id: userId }, { password: 0 });

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Super Admin only)
router.delete('/users/:id', auth, async (req, res) => {
    try {
        const { role, id: currentUserId } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const userId = req.params.id;

        // Prevent deleting self
        if (userId === currentUserId) {
            return res.status(400).json({ msg: 'Cannot delete your own account' });
        }

        const User = require('../models/User');

        // Find user
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Delete user
        const numRemoved = await User.remove({ _id: userId });

        res.json({
            success: true,
            message: `User ${user.username} deleted successfully`
        });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// @route   PUT /api/admin/users/:id/password
// @desc    Reset user password
// @access  Private (Super Admin only)
router.put('/users/:id/password', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { password } = req.body;
        const userId = req.params.id;

        if (!password || password.length < 4) {
            return res.status(400).json({ msg: 'Password must be at least 4 characters' });
        }

        const User = require('../models/User');
        const bcrypt = require('bcryptjs');

        // Find user
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await User.update(
            { _id: userId },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: `Password reset successfully for user ${user.username}`
        });
    } catch (err) {
        console.error('Error resetting password:', err.message);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});

// @route   POST /api/admin/restart-server
// @desc    Restart the server (triggers systemd restart)
// @access  Private (Super Admin only)
router.post('/restart-server', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        res.json({
            success: true,
            message: 'Server restart initiated. The service will restart automatically in a few seconds.'
        });

        // Delay the exit to allow response to be sent
        setTimeout(() => {
            process.exit(0); // systemd will automatically restart the service
        }, 1000);
    } catch (err) {
        console.error('Error restarting server:', err.message);
        res.status(500).json({ error: 'Failed to restart server.' });
    }
});

// @route   GET /api/admin/logs
// @desc    Get recent server logs
// @access  Private (Super Admin only)
router.get('/logs', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        // Get last 100 lines of systemd logs
        const { stdout } = await execPromise('journalctl -u feedback-system.service -n 100 --no-pager 2>/dev/null || echo "Logs not available via systemd"');

        res.json({
            success: true,
            logs: stdout || 'No logs available'
        });
    } catch (err) {
        console.error('Error fetching logs:', err.message);
        res.json({
            success: true,
            logs: 'Unable to fetch systemd logs. Logs are available via: journalctl -u feedback-system.service -f'
        });
    }
});

// @route   GET /api/admin/email-config
// @desc    Get email configuration
// @access  Private (Super Admin only)
router.get('/email-config', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const fs = require('fs');
        const path = require('path');
        const emailsPath = path.join(__dirname, '../../config/emails.json');
        const emailsConfig = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));

        res.json({ success: true, config: emailsConfig });
    } catch (err) {
        console.error('Error reading email config:', err.message);
        res.status(500).json({ error: 'Failed to read email configuration.' });
    }
});

// @route   PUT /api/admin/email-config
// @desc    Update email configuration
// @access  Private (Super Admin only)
router.put('/email-config', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { config } = req.body;

        if (!config) {
            return res.status(400).json({ msg: 'Email configuration is required' });
        }

        const fs = require('fs');
        const path = require('path');
        const emailsPath = path.join(__dirname, '../../config/emails.json');

        // Backup current config
        const backupPath = path.join(__dirname, '../../config/emails.json.backup');
        fs.copyFileSync(emailsPath, backupPath);

        // Write new config
        fs.writeFileSync(emailsPath, JSON.stringify(config, null, 2));

        res.json({ success: true, message: 'Email configuration updated successfully' });
    } catch (err) {
        console.error('Error updating email config:', err.message);
        res.status(500).json({ error: 'Failed to update email configuration.' });
    }
});

// @route   POST /api/admin/backup-database
// @desc    Create database backup
// @access  Private (Super Admin only)
router.post('/backup-database', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const fs = require('fs');
        const path = require('path');
        const archiver = require('archiver');

        const backupDir = path.join(__dirname, '../../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupFileName = `backup_${timestamp}.zip`;
        const backupPath = path.join(backupDir, backupFileName);

        const output = fs.createWriteStream(backupPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`Backup created: ${backupFileName} (${archive.pointer()} bytes)`);
            res.json({
                success: true,
                message: 'Database backup created successfully',
                filename: backupFileName,
                size: archive.pointer()
            });
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        // Add database files
        const dbPath = path.join(__dirname, '../../data');
        if (fs.existsSync(dbPath)) {
            archive.directory(dbPath, 'data');
        }

        // Add config files
        const configPath = path.join(__dirname, '../../config');
        if (fs.existsSync(configPath)) {
            archive.directory(configPath, 'config');
        }

        await archive.finalize();
    } catch (err) {
        console.error('Error creating backup:', err.message);
        res.status(500).json({ error: 'Failed to create backup.' });
    }
});

// @route   GET /api/admin/backups
// @desc    List all backups
// @access  Private (Super Admin only)
router.get('/backups', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const fs = require('fs');
        const path = require('path');
        const backupDir = path.join(__dirname, '../../backups');

        if (!fs.existsSync(backupDir)) {
            return res.json({ success: true, backups: [] });
        }

        const files = fs.readdirSync(backupDir);
        const backups = files
            .filter(f => f.endsWith('.zip'))
            .map(f => {
                const stats = fs.statSync(path.join(backupDir, f));
                return {
                    filename: f,
                    size: stats.size,
                    created: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json({ success: true, backups });
    } catch (err) {
        console.error('Error listing backups:', err.message);
        res.status(500).json({ error: 'Failed to list backups.' });
    }
});

// @route   GET /api/admin/download-backup/:filename
// @desc    Download a backup file
// @access  Private (Super Admin only)
router.get('/download-backup/:filename', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const path = require('path');
        const filename = req.params.filename;
        const backupPath = path.join(__dirname, '../../backups', filename);

        if (!require('fs').existsSync(backupPath)) {
            return res.status(404).json({ msg: 'Backup file not found' });
        }

        res.download(backupPath, filename);
    } catch (err) {
        console.error('Error downloading backup:', err.message);
        res.status(500).json({ error: 'Failed to download backup.' });
    }
});

// @route   POST /api/admin/restore-backup
// @desc    Restore database from backup
// @access  Private (Super Admin only)
router.post('/restore-backup', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ msg: 'Backup filename is required' });
        }

        const fs = require('fs');
        const path = require('path');
        const AdmZip = require('adm-zip');

        const backupPath = path.join(__dirname, '../../backups', filename);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ msg: 'Backup file not found' });
        }

        // Create backup of current state before restore
        const currentBackupName = `pre-restore-backup_${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.zip`;
        const currentBackupPath = path.join(__dirname, '../../backups', currentBackupName);

        const currentArchive = require('archiver')('zip', { zlib: { level: 9 } });
        const currentOutput = fs.createWriteStream(currentBackupPath);
        currentArchive.pipe(currentOutput);

        const dbPath = path.join(__dirname, '../../data');
        if (fs.existsSync(dbPath)) {
            currentArchive.directory(dbPath, 'data');
        }

        await new Promise((resolve, reject) => {
            currentOutput.on('close', resolve);
            currentArchive.on('error', reject);
            currentArchive.finalize();
        });

        // Extract backup
        const zip = new AdmZip(backupPath);
        const extractPath = path.join(__dirname, '../..');
        zip.extractAllTo(extractPath, true);

        res.json({
            success: true,
            message: 'Database restored successfully. Server will restart automatically.',
            backupCreated: currentBackupName
        });

        // Restart server after restore
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    } catch (err) {
        console.error('Error restoring backup:', err.message);
        res.status(500).json({ error: 'Failed to restore backup.' });
    }
});

// @route   DELETE /api/admin/backups/:filename
// @desc    Delete a backup file
// @access  Private (Super Admin only)
router.delete('/backups/:filename', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const fs = require('fs');
        const path = require('path');
        const filename = req.params.filename;
        const backupPath = path.join(__dirname, '../../backups', filename);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ msg: 'Backup file not found' });
        }

        fs.unlinkSync(backupPath);

        res.json({
            success: true,
            message: 'Backup deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting backup:', err.message);
        res.status(500).json({ error: 'Failed to delete backup.' });
    }
});

// @route   POST /api/admin/deploy
// @desc    Run deployment script
// @access  Private (Super Admin only)
router.post('/deploy', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { exec } = require('child_process');
        const path = require('path');
        const deployScript = path.join(__dirname, '../../deploy.sh');

        // Check if deploy.sh exists
        if (!require('fs').existsSync(deployScript)) {
            return res.status(404).json({ msg: 'Deploy script not found' });
        }

        // Execute deploy script in background
        const process = exec(`bash ${deployScript}`, {
            cwd: path.join(__dirname, '../..')
        });

        let output = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
            output += data;
            console.log(data);
        });

        process.stderr.on('data', (data) => {
            errorOutput += data;
            console.error(data);
        });

        process.on('close', (code) => {
            console.log(`Deploy script exited with code ${code}`);
        });

        res.json({
            success: true,
            message: 'Deployment started. The server will restart automatically when complete.'
        });
    } catch (err) {
        console.error('Error running deploy script:', err.message);
        res.status(500).json({ error: 'Failed to run deploy script.' });
    }
});

// @route   POST /api/admin/send-custom-report
// @desc    Send report to specific email recipients (uses shared report generation code)
// @access  Private (Super Admin only)
router.post('/send-custom-report', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const { departments, recipients } = req.body;

        if (!departments || !Array.isArray(departments) || departments.length === 0) {
            return res.status(400).json({ msg: 'Please select at least one department' });
        }

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ msg: 'Please select at least one recipient' });
        }

        const { generateAndSendReports } = require('../services/reportGenerator');

        console.log(`Custom report requested for: ${departments.join(', ')}`);
        console.log(`Recipients: ${recipients.join(', ')}`);

        // Use the same report generation function as weekly cron
        // Pass custom recipients to override config
        await generateAndSendReports(null, null, departments, recipients);

        res.json({
            success: true,
            message: `Reports sent successfully to ${recipients.length} recipient(s) for ${departments.length} department(s).`,
            departments,
            recipients
        });
    } catch (err) {
        console.error('Error sending custom report:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to send custom report.'
        });
    }
});

// @route   GET /api/admin/system-stats
// @desc    Get system performance statistics
// @access  Private (Super Admin only)
router.get('/system-stats', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const os = require('os');
        const fs = require('fs');
        const path = require('path');
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        // Database size
        const dbPath = path.join(__dirname, '../../data');
        let dbSize = 0;
        if (fs.existsSync(dbPath)) {
            const files = fs.readdirSync(dbPath);
            files.forEach(file => {
                const stats = fs.statSync(path.join(dbPath, file));
                dbSize += stats.size;
            });
        }

        // Disk space
        let diskStats = { total: 0, used: 0, free: 0, usagePercent: '0.00' };
        try {
            const { stdout } = await execPromise('df -B1 /home 2>/dev/null || df /home');
            const lines = stdout.trim().split('\n');
            if (lines.length > 1) {
                const parts = lines[1].split(/\s+/);
                if (parts.length >= 5) {
                    diskStats.total = parseInt(parts[1]) || 0;
                    diskStats.used = parseInt(parts[2]) || 0;
                    diskStats.free = parseInt(parts[3]) || 0;
                    diskStats.usagePercent = parts[4].replace('%', '');
                }
            }
        } catch (err) {
            console.error('Error getting disk stats:', err.message);
        }

        // System stats
        const stats = {
            cpu: {
                model: os.cpus()[0].model,
                cores: os.cpus().length,
                usage: os.loadavg()
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
                usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
            },
            disk: {
                total: diskStats.total,
                used: diskStats.used,
                free: diskStats.free,
                usagePercent: diskStats.usagePercent,
                totalGB: (diskStats.total / 1024 / 1024 / 1024).toFixed(2),
                usedGB: (diskStats.used / 1024 / 1024 / 1024).toFixed(2),
                freeGB: (diskStats.free / 1024 / 1024 / 1024).toFixed(2)
            },
            database: {
                size: dbSize,
                sizeMB: (dbSize / 1024 / 1024).toFixed(2)
            },
            uptime: os.uptime(),
            platform: os.platform(),
            nodeVersion: process.version
        };

        // Feedback count
        const feedbackCount = await Feedback.count({});
        stats.feedbackCount = feedbackCount;

        res.json({ success: true, stats });
    } catch (err) {
        console.error('Error fetching system stats:', err.message);
        res.status(500).json({ error: 'Failed to fetch system statistics.' });
    }
});

// @route   GET /api/admin/export-csv/:department
// @desc    Export feedback as CSV for a specific department
// @access  Private (Super Admin only)
router.get('/export-csv/:department', auth, async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'super_admin') {
            return res.status(403).json({ msg: 'Access denied. Super admin only.' });
        }

        const department = req.params.department;
        const feedbacks = await Feedback.find({ department }).sort({ createdAt: -1 });

        if (feedbacks.length === 0) {
            return res.status(404).json({ msg: 'No feedback found for this department' });
        }

        // Create CSV content
        const headers = ['Date', 'Name', 'Email', 'Sentiment', 'Category', 'Feedback'];

        // Get all unique question IDs from all feedbacks
        const allQuestionIds = new Set();
        feedbacks.forEach(fb => {
            if (fb.answers) {
                Object.keys(fb.answers).forEach(key => allQuestionIds.add(key));
            }
        });

        const questionHeaders = Array.from(allQuestionIds);
        const fullHeaders = [...headers, ...questionHeaders];

        // Create CSV rows
        const csvRows = [fullHeaders.join(',')];

        feedbacks.forEach(fb => {
            const row = [
                new Date(fb.createdAt).toLocaleString(),
                `"${(fb.name || 'Anonymous').replace(/"/g, '""')}"`,
                `"${(fb.email || '').replace(/"/g, '""')}"`,
                fb.sentiment || '',
                fb.category || '',
                `"${(fb.feedback || '').replace(/"/g, '""')}"`
            ];

            // Add answer values
            questionHeaders.forEach(qId => {
                const answer = fb.answers && fb.answers[qId] ? fb.answers[qId] : '';
                row.push(`"${String(answer).replace(/"/g, '""')}"`);
            });

            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="feedback_${department}_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
    } catch (err) {
        console.error('Error exporting CSV:', err.message);
        res.status(500).json({ error: 'Failed to export CSV.' });
    }
});

// ============================================
// USER MANAGEMENT ROUTES (Super Admin Only)
// ============================================

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// @route   GET /api/admin/users
// @desc    Get all users (super admin only)
// @access  Private (Super Admin)
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// @route   PUT /api/admin/users/:id/password
// @desc    Change user password (super admin only)
// @access  Private (Super Admin)
router.put('/users/:id/password', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const numUpdated = await User.update(
            { _id: req.params.id },
            { $set: { password: hashedPassword } }
        );

        if (numUpdated === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err.message);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Edit user (super admin only)
// @access  Private (Super Admin)
router.put('/users/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { username, role, department } = req.body;
        const updateData = {};

        if (username) updateData.username = username;
        if (role) updateData.role = role;
        if (department) updateData.department = department;

        const numUpdated = await User.update(
            { _id: req.params.id },
            { $set: updateData }
        );

        if (numUpdated === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (super admin only)
// @access  Private (Super Admin)
router.delete('/users/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Prevent deleting self
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const numRemoved = await User.remove({ _id: req.params.id }, {});

        if (numRemoved === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================
// FEEDBACK LOGIN MANAGEMENT ROUTES (Super Admin Only)
// ============================================

// @route   GET /api/admin/feedback-logins
// @desc    Get all feedback login credentials (super admin only)
// @access  Private (Super Admin)
router.get('/feedback-logins', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const configPath = path.join(__dirname, '../../config/feedback_login.json');
        const logins = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Return logins without passwords for security
        const loginsList = Object.entries(logins).map(([id, data]) => ({
            id,
            username: data.username,
            name: data.name,
            isAdmin: data.isAdmin || false
        }));

        res.json(loginsList);
    } catch (err) {
        console.error('Error fetching feedback logins:', err.message);
        res.status(500).json({ error: 'Failed to fetch feedback logins' });
    }
});

// @route   PUT /api/admin/feedback-logins/:id/password
// @desc    Change feedback login password (super admin only)
// @access  Private (Super Admin)
router.put('/feedback-logins/:id/password', auth, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const configPath = path.join(__dirname, '../../config/feedback_login.json');
        const logins = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        if (!logins[req.params.id]) {
            return res.status(404).json({ message: 'Login not found' });
        }

        // Update password
        logins[req.params.id].password = password;

        // Write back to file
        fs.writeFileSync(configPath, JSON.stringify(logins, null, 2));

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating feedback login password:', err.message);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

module.exports = router;
