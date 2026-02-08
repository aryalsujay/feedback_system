const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Debug logging
    console.log('Login attempt:', {
        username,
        passwordLength: password?.length,
        passwordChars: password?.split('').map(c => c.charCodeAt(0))
    });

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch, 'for user:', username);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: user._id,
            username: user.username,
            role: user.role,
            department: user.department,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({ token, user: payload });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const auth = require('../middleware/authMiddleware');

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id }, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/department-login
// @desc    Authenticate department user for feedback form
// @access  Public
router.post('/department-login', (req, res) => {
    const { username, password } = req.body;

    console.log('Department login attempt:', { username });

    try {
        // Load department credentials from config
        const configPath = path.join(__dirname, '../../config/feedback_login.json');
        const departmentLogins = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Find matching department or admin
        let matchedCredentials = null;
        for (const [deptId, credentials] of Object.entries(departmentLogins)) {
            if (credentials.username === username && credentials.password === password) {
                matchedCredentials = {
                    id: deptId,
                    name: credentials.name,
                    isAdmin: credentials.isAdmin || false
                };
                break;
            }
        }

        if (!matchedCredentials) {
            console.log('Login failed for:', username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create session data based on user type
        const sessionData = matchedCredentials.isAdmin ? {
            type: 'admin',
            username: username,
            name: matchedCredentials.name
        } : {
            type: 'department',
            departmentId: matchedCredentials.id,
            departmentName: matchedCredentials.name,
            username: username
        };

        console.log('Login successful:', matchedCredentials);
        res.json({ success: true, session: sessionData });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
