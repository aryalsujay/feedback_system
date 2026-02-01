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

        // NeDB uses .insert(), not new Model() + .save()
        const feedback = await Feedback.insert({
            departmentId,
            answers,
            name: name || 'Anonymous',
            email: email || '',
            submittedAt: new Date() // Explicitly set it, though timestampData option handles it too, this is safer for query consisteny
        });

        res.status(201).json({ message: 'Feedback submitted successfully', id: feedback._id });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
