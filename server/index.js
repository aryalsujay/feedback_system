const initEnv = require('./config/init');
const express = require('express');
const cors = require('cors');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/config', require('./routes/config'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Catch-all route to serve React's index.html for any non-API routes
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
});

// Database Connection (Embedded NeDB handled in models)
console.log('Using Embedded Database');

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔗 Local Address: http://localhost:${PORT}`);
    addresses.forEach(addr => console.log(`🔗 Network Address: http://${addr}:${PORT}`));
    console.log('\n');

    require('./services/scheduler').initScheduler();
});
