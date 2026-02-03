require('../config/init');
const Feedback = require('../models/Feedback');

const names = ['Rajesh Kumar', 'Priya Sharma', 'John Smith', 'Maria Garcia', 'David Lee'];
const emails = ['rajesh@example.com', 'priya@example.com', 'john@example.com', 'maria@example.com', 'david@example.com'];

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

const createSamples = async () => {
    console.log('\n========================================');
    console.log('Creating Food Court Sample Feedbacks');
    console.log('========================================\n');

    const feedbackIds = [];

    try {
        console.log('Creating 5 sample feedbacks for Food Court...\n');

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
            console.log(`  ✅ Feedback #${i + 1}: ${ratingType} - ${names[i]} (${daysAgo} days ago)`);
        }

        console.log('\n========================================');
        console.log('✅ Successfully Created 5 Sample Feedbacks!');
        console.log('========================================\n');
        console.log('📊 Dashboard: http://localhost:5001/admin/dashboard');
        console.log('📈 Analytics: http://localhost:5001/admin/analytics');
        console.log('\nYou can now view these feedbacks in your dashboard and analytics!\n');

    } catch (error) {
        console.error('\n❌ Error creating feedbacks:', error.message);
    }

    process.exit(0);
};

createSamples();
