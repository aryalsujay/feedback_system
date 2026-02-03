#!/usr/bin/env node

/**
 * Email Configuration Validator
 *
 * This script validates the emails.json configuration file.
 * Run this after making changes to emails.json to ensure it's properly formatted.
 *
 * Usage: node validate-emails.js
 */

const fs = require('fs');
const path = require('path');

const validateEmails = () => {
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL CONFIGURATION VALIDATOR');
    console.log('='.repeat(60) + '\n');

    const emailsPath = path.join(__dirname, 'emails.json');

    try {
        // Check if file exists
        if (!fs.existsSync(emailsPath)) {
            console.error('❌ emails.json not found!');
            return false;
        }

        // Read and parse JSON
        const content = fs.readFileSync(emailsPath, 'utf8');
        const emails = JSON.parse(content);

        console.log('✅ JSON is valid and parseable\n');
        console.log('📋 Configuration Summary:');
        console.log('-'.repeat(60));

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let totalEmails = 0;
        let invalidEmails = 0;

        // Expected departments
        const expectedDepts = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc', 'admin'];

        for (const dept of expectedDepts) {
            if (!emails[dept]) {
                console.log(`⚠️  ${dept.padEnd(20)} - MISSING`);
                continue;
            }

            if (!Array.isArray(emails[dept])) {
                console.log(`❌ ${dept.padEnd(20)} - ERROR: Not an array`);
                continue;
            }

            const recipients = emails[dept];
            totalEmails += recipients.length;

            console.log(`\n${dept}:`);
            recipients.forEach((email, idx) => {
                const isValid = emailRegex.test(email);
                const status = isValid ? '✅' : '❌';
                console.log(`  ${idx + 1}. ${status} ${email}`);
                if (!isValid) invalidEmails++;
            });
        }

        // Check for unexpected departments
        const extraDepts = Object.keys(emails).filter(d => !expectedDepts.includes(d));
        if (extraDepts.length > 0) {
            console.log('\n⚠️  Unexpected departments found:');
            extraDepts.forEach(dept => console.log(`   - ${dept}`));
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   Total email addresses: ${totalEmails}`);
        console.log(`   Valid emails: ${totalEmails - invalidEmails}`);
        console.log(`   Invalid emails: ${invalidEmails}`);
        console.log('='.repeat(60) + '\n');

        if (invalidEmails === 0) {
            console.log('✨ All email addresses are valid!');
            console.log('💡 Changes will take effect immediately (no server restart needed)\n');
            return true;
        } else {
            console.log('⚠️  Please fix invalid email addresses above.\n');
            return false;
        }

    } catch (error) {
        console.error('❌ Error validating emails.json:');
        console.error('   ' + error.message);

        if (error instanceof SyntaxError) {
            console.error('\n💡 This is likely a JSON syntax error. Check for:');
            console.error('   - Missing or extra commas');
            console.error('   - Missing quotes around strings');
            console.error('   - Mismatched brackets [ ] or braces { }');
        }
        console.error('');
        return false;
    }
};

// Execute
if (require.main === module) {
    const isValid = validateEmails();
    process.exit(isValid ? 0 : 1);
}

module.exports = validateEmails;
