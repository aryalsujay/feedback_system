const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback
router.post('/', async (req, res) => {
    try {
        const { departmentId, answers, name, email } = req.body;

        if (!departmentId || !answers) {
            return res.status(400).json({ error: 'Missing departmentId or answers' });
        }

        // --- Logic to derived Sentiment & Feedback ---
        let totalScore = 0;
        let count = 0;
        let lowestScore = 6;
        let derivedCategory = 'General';

        for (const [key, value] of Object.entries(answers)) {
            // Safe conversion to number
            const numValue = Number(value);

            // Calculate numeric average if it's a valid number between 1 and 5
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
                totalScore += numValue;
                count++;

                // Determine category based on lowest score
                if (numValue < lowestScore) {
                    lowestScore = numValue;
                    if (key.includes('clean')) derivedCategory = 'Cleanliness';
                    else if (key.includes('food') || key.includes('taste')) derivedCategory = 'Food';
                    else if (key.includes('staff') || key.includes('service')) derivedCategory = 'Service';
                    else if (key.includes('peace') || key.includes('comf') || key.includes('accom')) derivedCategory = 'Ambience';
                }
            }
        }

        const avg = count > 0 ? (totalScore / count) : 3; // Default to 3 (Neutral)

        let sentiment = 'Neutral';
        if (avg >= 4) sentiment = 'Positive';
        else if (avg < 3) sentiment = 'Negative'; // Strict negative (below 3)

        // Extract main feedback text
        const feedbackText = answers.suggestion || 'No written feedback.';

        // NeDB uses .insert()
        const feedback = await Feedback.insert({
            department: departmentId, // Store as 'department' to match dashboard expectation
            answers,
            name: name || 'Anonymous',
            email: email || '',
            feedback: feedbackText,
            sentiment: sentiment,
            category: derivedCategory,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({ message: 'Feedback submitted successfully', id: feedback._id });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
