const mongoose = require('mongoose');
const Feedback = require('../models/Feedback'); // Adjust path as needed
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback_system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const globalPagodaQuestions = [
    { id: 'peaceful', type: 'smiley', max: 5 },
    { id: 'vipassana_understanding', type: 'number', max: 5 },
    { id: 'cleanliness', type: 'number', max: 5 },
    { id: 'staff_behavior', type: 'number', max: 5 },
    { id: 'overall_experience', type: 'rating_5', max: 5 }
];

const optionQuestion = {
    id: 'course_interest',
    options: ["No!", "Maybe not", "Perhaps later", "Yes! But not now!", "Yes! definitely"]
};

// Start dates for 4 weeks of Jan 2026
const weeks = [
    { start: new Date('2026-01-01'), end: new Date('2026-01-07') },
    { start: new Date('2026-01-08'), end: new Date('2026-01-14') },
    { start: new Date('2026-01-15'), end: new Date('2026-01-21') },
    { start: new Date('2026-01-22'), end: new Date('2026-01-28') }
];

const generateRandomFeedback = (date) => {
    const answers = {};

    // Numeric/Smiley answers (weighted towards 4/5)
    globalPagodaQuestions.forEach(q => {
        const rand = Math.random();
        let val;
        if (rand < 0.1) val = 1;
        else if (rand < 0.2) val = 2;
        else if (rand < 0.3) val = 3;
        else if (rand < 0.6) val = 4;
        else val = 5;
        answers[q.id] = val;
    });

    // Option select
    const optRand = Math.floor(Math.random() * optionQuestion.options.length);
    answers[optionQuestion.id] = optionQuestion.options[optRand];

    // Optional text
    if (Math.random() > 0.7) {
        answers['suggestion'] = "Great experience, very peaceful!";
    }

    return {
        departmentId: 'global_pagoda',
        answers,
        submittedAt: date,
        isAnonymous: Math.random() > 0.5,
        user: (Math.random() > 0.5) ? { name: "Test User", email: "test@example.com" } : undefined
    };
};

const seedData = async () => {
    try {
        const feedbacks = [];

        // Clear existing data for Global Pagoda in Jan 2026
        const startDate = new Date('2026-01-01');
        const endDate = new Date('2026-01-31');

        await Feedback.deleteMany({
            departmentId: 'global_pagoda',
            submittedAt: { $gte: startDate, $lte: endDate }
        });
        console.log('Cleared existing Global Pagoda data for January 2026.');

        for (const week of weeks) {
            console.log(`Generating data for week: ${week.start.toDateString()} - ${week.end.toDateString()}`);
            // Generate EXACTLY 5 feedbacks per week
            for (let i = 0; i < 5; i++) {
                // Random time within the week
                const time = new Date(week.start.getTime() + Math.random() * (week.end.getTime() - week.start.getTime()));
                feedbacks.push(generateRandomFeedback(time));
            }
        }

        await Feedback.insertMany(feedbacks);
        console.log(`Successfully inserted ${feedbacks.length} feedback entries.`);
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedData();
