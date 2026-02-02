const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/**
 * Sync Passwords Script
 * Updates passwords for existing admin users based on .env configuration
 * This script does NOT delete users, only updates their passwords
 */

const syncPasswords = async () => {
    console.log('🔄 Starting password synchronization...\n');

    // Map usernames to their environment variable names
    const passwordMap = {
        'gvp': 'ADMIN_GVP_PASSWORD',
        'fc': 'ADMIN_FC_PASSWORD',
        'svct': 'ADMIN_SVCT_PASSWORD',
        'dlaya': 'ADMIN_DLAYA_PASSWORD',
        'dpvc': 'ADMIN_DPVC_PASSWORD',
        'admin': 'SUPER_ADMIN_PASSWORD'
    };

    let successCount = 0;
    let failCount = 0;

    for (const [username, envVar] of Object.entries(passwordMap)) {
        try {
            // Get password from environment variable
            const newPassword = process.env[envVar];

            if (!newPassword) {
                console.log(`⚠️  Warning: ${envVar} not set in .env, skipping ${username}`);
                continue;
            }

            // Find user in database
            const user = await User.findOne({ username });

            if (!user) {
                console.log(`⚠️  User not found: ${username} (run seedAdmins.js first)`);
                failCount++;
                continue;
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user password
            await User.update(
                { username },
                { $set: { password: hashedPassword } },
                {}
            );

            console.log(`✅ Updated password for: ${username} (${user.role})`);
            successCount++;

        } catch (error) {
            console.error(`❌ Failed to update ${username}:`, error.message);
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Password sync complete!`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('='.repeat(50) + '\n');

    // Verify all users
    const totalUsers = await User.count({});
    console.log(`📊 Total users in database: ${totalUsers}`);
};

// Execute if run directly
if (require.main === module) {
    syncPasswords()
        .then(() => {
            console.log('🏁 Script completed. You can now exit.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = syncPasswords;
