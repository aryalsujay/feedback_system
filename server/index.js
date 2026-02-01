const initEnv = require('./config/init');
const express = require('express');
const cors = require('cors');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/config', require('./routes/config'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Database Connection (Embedded NeDB handled in models)
console.log('Using Embedded Database');

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    require('./services/scheduler').initScheduler();
});
