const User = require('../models/User');
const bcrypt = require('bcryptjs');

const verifyUsers = async () => {
    console.log('🔍 Verifying Users in DB...');
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`\nChecking user: ${user.username} (Role: ${user.role})`);
        const isMatch = await bcrypt.compare('1234', user.password);
        console.log(`Password '1234' match: ${isMatch ? '✅ YES' : '❌ NO'}`);
    }
};

verifyUsers();
