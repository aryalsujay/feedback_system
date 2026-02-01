const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmins = async () => {
    // Map internal department IDs to the requested usernames
    const deptMapping = {
        'global_pagoda': 'gvp',
        'food_court': 'fc',
        'souvenir_shop': 'svct',
        'dhamma_alaya': 'dlaya',
        'dpvc': 'dpvc'
    };

    const users = [];

    // Create Department Admins
    for (const [deptId, username] of Object.entries(deptMapping)) {
        users.push({
            username: username,
            password: '1234',
            role: 'admin',
            department: deptId
        });
    }

    // Create Super Admin
    users.push({
        username: 'admin',
        password: '1234',
        role: 'super_admin',
        department: 'global'
    });

    console.log('🌱 Seeding Admins...');

    // Clear existing users to ensure clean slate with new credentials
    try {
        await User.remove({}, { multi: true });
        console.log('🧹 Cleared existing users.');
    } catch (e) {
        console.log('⚠️  Could not clear users (might be empty).');
    }

    for (const u of users) {
        try {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            await User.insert({ ...u, password: hashedPassword });
            console.log(`✅ Created user: ${u.username} (Dept: ${u.department})`);
        } catch (e) {
            console.error(`❌ Failed to create user ${u.username}:`, e);
        }
    }

    // Verify DB Connection by counting users
    const count = await User.count({});
    console.log(`✨ Seeding complete. Total users in DB: ${count}`);
    console.log(`🔌 Database connection verified.`);
};

// Execute if run directly
if (require.main === module) {
    seedAdmins();
}

module.exports = seedAdmins;
