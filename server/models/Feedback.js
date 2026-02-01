const Datastore = require('nedb-promises');
const path = require('path');

const dbPath = path.join(__dirname, '../data/feedbacks.db');

const Feedback = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true // Automatically adds createdAt and updatedAt
});

console.log(`Embedded Database initialized at ${dbPath}`);

module.exports = Feedback;
