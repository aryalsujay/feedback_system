/**
 * Test Script for Email Consolidation Feature
 *
 * This script tests 3 scenarios:
 * 1. Scheduled Report Mode (consolidates based on emails.json config)
 * 2. Admin-only Report
 * 3. Custom Report Mode (all recipients get all selected departments)
 */

require('dotenv').config();
const { generateAndSendReports } = require('../services/reportGenerator');
const Feedback = require('../models/Feedback');

async function runTests() {
    console.log('\n=================================================================');
    console.log('EMAIL CONSOLIDATION TEST SUITE');
    console.log('=================================================================\n');

    try {
        // Check if we have feedback data
        const feedbackCount = await Feedback.count({});
        console.log(`✓ Found ${feedbackCount} feedback entries in database\n`);

        if (feedbackCount === 0) {
            console.log('⚠️  WARNING: No feedback data found. Results may be empty PDFs.');
            console.log('   Consider running /api/admin/create-sample-data first.\n');
        }

        // TEST 1: Scheduled Report Mode (Cron-like behavior)
        // This simulates weekly cron job that consolidates emails based on emails.json
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 1: Scheduled Report Mode (5 departments)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Description: Simulates weekly cron job');
        console.log('Expected: Recipients in emails.json get consolidated emails');
        console.log('Example: lokesh@goenkasons.com appears in 5 depts → gets 1 email with 5 PDFs\n');

        const allDepts = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc'];

        console.log('Sending scheduled reports for all 5 departments...');
        await generateAndSendReports(null, null, allDepts, null);
        console.log('✓ TEST 1 COMPLETE - Check aryalsujay@gmail.com (BCC)\n');

        // Wait 3 seconds between tests to avoid rate limiting
        console.log('⏱  Waiting 3 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // TEST 2: Admin-only Report
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 2: Admin-Only Report');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Description: Send report only to admin email');
        console.log('Expected: Only aryalsujay@gmail.com receives email with all dept PDFs\n');

        const adminRecipient = ['aryalsujay@gmail.com'];

        console.log('Sending admin-only report for all departments...');
        await generateAndSendReports(null, null, allDepts, adminRecipient);
        console.log('✓ TEST 2 COMPLETE - Check aryalsujay@gmail.com (direct recipient)\n');

        // Wait 3 seconds before next test
        console.log('⏱  Waiting 3 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // TEST 3: Custom Report Mode
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST 3: Custom Report Mode (3 departments, 1 recipient)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Description: Admin panel custom report simulation');
        console.log('Expected: Recipient gets 1 email with 3 PDFs');
        console.log('Subject: "Weekly Feedback Report - Global Vipassana Pagoda" (multiple depts)\n');

        const customDepts = ['food_court', 'souvenir_shop', 'dpvc'];
        const customRecipients = ['aryalsujay@gmail.com'];

        console.log('Sending custom report...');
        console.log('Departments:', customDepts.join(', '));
        console.log('Recipients:', customRecipients.join(', '));
        await generateAndSendReports(null, null, customDepts, customRecipients);
        console.log('✓ TEST 3 COMPLETE - Check aryalsujay@gmail.com (direct recipient + BCC)\n');

        console.log('=================================================================');
        console.log('ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
        console.log('=================================================================');
        console.log('\nNext Steps:');
        console.log('1. Check aryalsujay@gmail.com inbox');
        console.log('2. You should see 3 emails total:');
        console.log('   - TEST 1: Consolidated email with 5 PDFs (BCC)');
        console.log('   - TEST 2: Admin-only email with 5 PDFs (direct)');
        console.log('   - TEST 3: Custom report with 3 PDFs (direct + BCC)');
        console.log('3. Verify each email has multiple PDF attachments');
        console.log('4. Verify subject lines are correct');
        console.log('5. Verify email body lists all departments\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the tests
runTests();
