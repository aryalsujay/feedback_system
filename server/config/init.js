const path = require('path');
const dotenv = require('dotenv');

// Resolve to server directory .env from server/config/init.js
// __dirname is server/config
// ../.env is server/.env
const envPath = path.resolve(__dirname, '../.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.warn(`⚠️  Warning: Could not load .env file from ${envPath}`);
} else {
    // console.log(`✅ Loaded environment from ${envPath}`);
}

module.exports = result;
