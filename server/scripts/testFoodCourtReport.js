require('../config/init'); // Load environment variables
const Feedback = require('../models/Feedback');
const fs = require('fs');
const path = require('path');
const { generateAndSendReports } = require('../services/reportGenerator');

const names = ['Rajesh Kumar', 'Priya Sharma', 'John Smith', 'Maria Garcia', 'Sujay Aryal'];
const emails = ['rajesh@example.com', 'priya@example.com', 'john@example.com', 'maria@example.com', 'aryalsujay@gmail.com'];

const suggestions = {
    positive: [
        "Excellent food quality! The taste was amazing and staff was very helpful.",
        "Very satisfied with the service. Food was fresh and delicious.",
    ],
    neutral: [
        "Good overall experience, but waiting time could be improved.",
        "Decent food quality. Service was average.",
    ],
    negative: [
        "Food was cold and service was slow. Needs improvement.",
    ]
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const testFoodCourtReport = async () => {
    console.log('\n========================================');
    console.log('Food Court Report Test');
    console.log('========================================\n');

    const feedbackIds = [];

    try {
        // Step 1: Generate 5 sample feedbacks for food_court
        console.log('Step 1: Creating 5 sample feedbacks for Food Court...\n');

        for (let i = 0; i < 5; i++) {
            let answers, sentiment, ratingType;

            if (i < 2) {
                // Excellent ratings
                answers = {
                    food_taste: '5',
                    overall_experience: '5',
                    service_counters: '5',
                    service_speed: '5',
                    cleanliness: '5',
                    food_quality: '5',
                    suggestion: suggestions.positive[i % 2]
                };
                sentiment = 'Positive';
                ratingType = 'Excellent';
            } else if (i < 4) {
                // Good ratings
                answers = {
                    food_taste: '4',
                    overall_experience: '4',
                    service_counters: '4',
                    service_speed: '3',
                    cleanliness: '4',
                    food_quality: '4',
                    suggestion: suggestions.neutral[i % 2]
                };
                sentiment = 'Positive';
                ratingType = 'Good';
            } else {
                // Needs improvement
                answers = {
                    food_taste: '2',
                    overall_experience: '2',
                    service_counters: '3',
                    service_speed: '2',
                    cleanliness: '2',
                    food_quality: '2',
                    suggestion: suggestions.negative[0]
                };
                sentiment = 'Negative';
                ratingType = 'Needs Improvement';
            }

            // Create feedback with date in the last 7 days
            const daysAgo = i + 1;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const feedback = await Feedback.insert({
                department: 'food_court',
                answers: answers,
                name: names[i],
                email: emails[i],
                feedback: answers.suggestion,
                sentiment: sentiment,
                category: 'Food',
                createdAt: date,
                updatedAt: date
            });

            feedbackIds.push(feedback._id);
            console.log(`  ✅ Created feedback #${i + 1}: ${ratingType} (${names[i]}, ${daysAgo} days ago)`);
        }

        console.log('\n✅ 5 sample feedbacks created successfully!\n');

        // Step 2: Backup and update emails.json
        console.log('Step 2: Updating email configuration...\n');

        const emailsPath = path.join(__dirname, '../../config/emails.json');
        const emailsBackupPath = path.join(__dirname, '../../config/emails.backup.json');

        // Backup original
        const originalEmails = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
        fs.writeFileSync(emailsBackupPath, JSON.stringify(originalEmails, null, 2));

        // Update with test email
        const updatedEmails = { ...originalEmails };
        updatedEmails.food_court = ['aryalsujay@gmail.com'];
        fs.writeFileSync(emailsPath, JSON.stringify(updatedEmails, null, 2));

        console.log('  ✅ Email configuration updated');
        console.log('  📧 Report will be sent to: aryalsujay@gmail.com\n');

        // Step 3: Generate and send report
        console.log('Step 3: Generating and sending weekly report...\n');

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        console.log(`  📅 Report period: ${startDate.toDateString()} to ${endDate.toDateString()}\n`);

        await generateAndSendReports(startDate, endDate, ['food_court']);

        console.log('\n  ✅ Report sent successfully!\n');

        // Step 4: Restore original emails.json
        console.log('Step 4: Restoring original email configuration...\n');
        fs.writeFileSync(emailsPath, JSON.stringify(originalEmails, null, 2));
        fs.unlinkSync(emailsBackupPath);
        console.log('  ✅ Email configuration restored\n');

        // Step 5: Clean up test feedbacks
        console.log('Step 5: Cleaning up test feedbacks...\n');

        for (const id of feedbackIds) {
            await Feedback.remove({ _id: id });
        }

        console.log(`  ✅ Removed ${feedbackIds.length} test feedbacks\n`);

        console.log('========================================');
        console.log('✅ Test Complete!');
        console.log('========================================\n');
        console.log('📧 Check your email: aryalsujay@gmail.com');
        console.log('📊 You should receive a Food Court weekly report');
        console.log('🗑️  All test data has been cleaned up\n');

    } catch (error) {
        console.error('\n❌ Error occurred:', error);

        // Try to restore emails.json if it exists
        try {
            const emailsPath = path.join(__dirname, '../../config/emails.json');
            const emailsBackupPath = path.join(__dirname, '../../config/emails.backup.json');
            if (fs.existsSync(emailsBackupPath)) {
                const original = fs.readFileSync(emailsBackupPath, 'utf8');
                fs.writeFileSync(emailsPath, original);
                fs.unlinkSync(emailsBackupPath);
                console.log('✅ Email configuration restored after error');
            }
        } catch (restoreError) {
            console.error('⚠️  Could not restore email configuration:', restoreError.message);
        }

        // Try to clean up test feedbacks
        if (feedbackIds.length > 0) {
            try {
                for (const id of feedbackIds) {
                    await Feedback.remove({ _id: id });
                }
                console.log(`✅ Cleaned up ${feedbackIds.length} test feedbacks`);
            } catch (cleanupError) {
                console.error('⚠️  Could not clean up feedbacks:', cleanupError.message);
            }
        }
    }

    process.exit(0);
};

testFoodCourtReport();
