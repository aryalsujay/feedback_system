const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/config/questions
router.get('/questions', (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const fileName = lang === 'hi' ? 'questions_hi.json' : 'questions.json';
        const configPath = path.join(__dirname, '../../config', fileName);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);
    } catch (error) {
        console.error('Error reading config:', error);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

module.exports = router;
