#!/usr/bin/env node

/**
 * Password Sync Script (Wrapper)
 *
 * This script syncs admin passwords from the .env file to the database.
 * Run this script whenever you change passwords in server/.env
 *
 * Usage: node sync-passwords.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔐 PASSWORD SYNCHRONIZATION TOOL');
console.log('='.repeat(60) + '\n');

const serverDir = path.join(__dirname, '../server');
const scriptPath = path.join(serverDir, 'scripts/syncPasswords.js');

try {
    console.log('Running password sync...\n');

    // Run the sync script from the server directory
    execSync(`node "${scriptPath}"`, {
        cwd: serverDir,
        stdio: 'inherit'
    });

} catch (error) {
    console.error('\n❌ Error running password sync script');
    process.exit(1);
}
