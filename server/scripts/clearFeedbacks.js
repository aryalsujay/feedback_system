const Feedback = require('../models/Feedback');

async function clearAllFeedbacks() {
    try {
        console.log('Clearing all feedbacks...');

        // Count existing feedbacks
        const count = await Feedback.count({});
        console.log(`Found ${count} feedback(s) to delete`);

        // Remove all feedbacks
        const result = await Feedback.remove({}, { multi: true });

        console.log(`✓ Successfully deleted ${result} feedback(s)`);
        console.log('Database cleared!');

        process.exit(0);
    } catch (error) {
        console.error('Error clearing feedbacks:', error);
        process.exit(1);
    }
}

clearAllFeedbacks();
