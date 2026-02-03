const Datastore = require('nedb-promises');
const path = require('path');

const dbPath = path.join(__dirname, '../data/reportSettings.db');

const ReportSettings = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true
});

ReportSettings.ensureIndex({ fieldName: 'department', unique: true });

console.log(`Report Settings Database initialized at ${dbPath}`);

module.exports = ReportSettings;
