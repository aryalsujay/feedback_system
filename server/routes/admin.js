const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const ReportSettings = require('../models/ReportSettings');
const { refreshDepartmentSchedule } = require('../services/scheduler');

// @route   GET /api/admin/submissions
// @desc    Get all feedback submissions (filtered by role)
// @access  Private (Admin/Super Admin)
router.get('/submissions', auth, async (req, res) => {
    try {
        const { role, department } = req.user;
        let query = {};

        // If user is basic admin, force filter by their department
        if (role === 'admin') {
            query.department = department;
        }
        // If super_admin, they CAN filter by query param, or see all
        else if (role === 'super_admin') {
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

        if (role === 'admin') {
            matchStage.department = department;
        } else if (role === 'super_admin') {
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

module.exports = router;
