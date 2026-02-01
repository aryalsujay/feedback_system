const Feedback = require('../models/Feedback');

const departments = [
    'global_pagoda',
    'food_court',
    'souvenir_shop',
    'dhamma_alaya',
    'dpvc'
];

// Helper to get random int between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to get a random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const suggestions = [
    "Great experience!",
    "Could be cleaner.",
    "Staff was very helpful.",
    "Lines were too long.",
    "Peaceful environment.",
    "Food was delicious.",
    "Will come again.",
    "Need more signage.",
    "Bathrooms need attention.",
    "Excellent service."
];

const categories = ['Service', 'Cleanliness', 'Food', 'Ambience', 'Other'];
const sentiments = ['Positive', 'Neutral', 'Negative'];

const generateAnswers = (dept) => {
    const commonAnswers = {
        overall_experience: getRandomInt(3, 5),
        suggestion: getRandomItem(suggestions)
    };

    switch (dept) {
        case 'global_pagoda':
            return {
                ...commonAnswers,
                peaceful: getRandomInt(4, 5),
                vipassana_understanding: getRandomInt(3, 5),
                course_interest: getRandomInt(2, 5),
                cleanliness: getRandomInt(3, 5),
                staff_behavior: getRandomInt(4, 5)
            };
        case 'food_court':
            return {
                ...commonAnswers,
                food_taste: getRandomInt(3, 5),
                service_counters: getRandomInt(2, 5),
                service_speed: getRandomInt(3, 5),
                cleanliness: getRandomInt(3, 5),
                food_quality: getRandomInt(3, 5)
            };
        case 'souvenir_shop':
            return {
                ...commonAnswers,
                product_search: getRandomInt(3, 5),
                product_quality: getRandomInt(4, 5),
                price_reasonableness: getRandomInt(3, 5),
                staff_knowledge: getRandomInt(4, 5),
                recommendation_likelihood: getRandomInt(4, 5)
            };
        case 'dhamma_alaya':
            return {
                ...commonAnswers,
                room_comfort: getRandomInt(3, 5),
                cleanliness: getRandomInt(4, 5),
                food_quality: getRandomInt(3, 5),
                staff_support: getRandomInt(4, 5),
                rates_reasonableness: getRandomInt(3, 5),
                recommendation_likelihood: getRandomInt(4, 5)
            };
        case 'dpvc':
            return {
                ...commonAnswers,
                accommodation: getRandomInt(4, 5),
                food_dining: getRandomInt(3, 5),
                meditation_facilities: getRandomInt(5, 5),
                course_management: getRandomInt(4, 5),
                guidance_support: getRandomInt(4, 5),
                recommendation_likelihood: getRandomInt(5, 5)
            };
        default:
            return {};
    }
};

const seedFeedback = async () => {
    console.log('🌱 Seeding Feedback Data...');

    try {
        // Clear existing data to ensure a clean slate
        await Feedback.remove({}, { multi: true });
        console.log('🧹 Cleared existing feedback data.');

        const entries = [];

        for (const dept of departments) {
            console.log(`Generating data for ${dept}...`);
            for (let i = 0; i < 5; i++) {
                const answers = generateAnswers(dept);

                // Random date within the last 7 days
                const date = new Date();
                date.setDate(date.getDate() - getRandomInt(0, 6));

                // Determine implicit fields based on answers or random if not inferable
                // reusing the suggestion as the main "feedback" text
                const feedbackText = answers.suggestion || getRandomItem(suggestions);

                // Simple sentiment logic just for seeding (random for now to ensure variety)
                const sentiment = getRandomItem(sentiments);
                const category = getRandomItem(categories);

                entries.push({
                    department: dept,
                    answers: answers,
                    // Top-level fields required by Frontend Dashboard
                    feedback: feedbackText,
                    category: category,
                    sentiment: sentiment,
                    createdAt: date,
                    updatedAt: date
                });
            }
        }

        await Feedback.insert(entries);
        console.log(`✅ Successfully added ${entries.length} feedback entries.`);

        const count = await Feedback.count({});
        console.log(`📊 Total feedbacks in DB: ${count}`);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
    }
};

// Execute if run directly
if (require.main === module) {
    seedFeedback();
}

module.exports = seedFeedback;
