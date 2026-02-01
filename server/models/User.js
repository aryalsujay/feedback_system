const Datastore = require('nedb-promises');
const path = require('path');

const dbPath = path.join(__dirname, '../data/users.db');

const User = Datastore.create({
    filename: dbPath,
    autoload: true,
    timestampData: true
});

User.ensureIndex({ fieldName: 'username', unique: true });

console.log(`Embedded User Database initialized at ${dbPath}`);

module.exports = User;
