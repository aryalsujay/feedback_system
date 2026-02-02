const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const seedAdmins = async () => {
    // Map internal department IDs to the requested usernames with their password env variables
    const deptMapping = {
        'global_pagoda': { username: 'gvp', passwordEnv: 'ADMIN_GVP_PASSWORD' },
        'food_court': { username: 'fc', passwordEnv: 'ADMIN_FC_PASSWORD' },
        'souvenir_shop': { username: 'svct', passwordEnv: 'ADMIN_SVCT_PASSWORD' },
        'dhamma_alaya': { username: 'dlaya', passwordEnv: 'ADMIN_DLAYA_PASSWORD' },
        'dpvc': { username: 'dpvc', passwordEnv: 'ADMIN_DPVC_PASSWORD' }
    };

    const users = [];

    // Create Department Admins
    for (const [deptId, config] of Object.entries(deptMapping)) {
        const password = process.env[config.passwordEnv] || '1234';
        users.push({
            username: config.username,
            password: password,
            role: 'admin',
            department: deptId
        });
    }

    // Create Super Admin
    users.push({
        username: 'admin',
        password: process.env.SUPER_ADMIN_PASSWORD || '1234',
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
