const Feedback = require('../models/Feedback');

// Sample data for realistic feedbacks
const names = ['Rajesh Kumar', 'Priya Sharma', 'John Smith', 'Maria Garcia', 'Anonymous', 'David Lee', 'Anita Patel', 'Michael Brown'];
const emails = ['rajesh@example.com', 'priya@example.com', 'john@example.com', 'maria@example.com', '', 'david@example.com', 'anita@example.com', 'michael@example.com'];

const suggestions = {
    positive: [
        "Excellent experience! Will definitely recommend to friends.",
        "Very peaceful and well-maintained. Staff was very helpful.",
        "Wonderful ambience. Everything was perfect.",
        "Great service and beautiful environment. Thank you!",
        "Exceeded my expectations in every way."
    ],
    neutral: [
        "Good overall, but could improve cleanliness in some areas.",
        "Decent experience. Average service.",
        "It was okay. Nothing exceptional but nothing bad either.",
        "Fair experience. Room for improvement in certain areas.",
        "Good but could be better with some minor improvements."
    ],
    negative: [
        "Not satisfied with the service quality. Need improvement.",
        "Cleanliness was below expectations. Staff seemed rushed.",
        "Disappointed with the overall experience.",
        "Long waiting times and inadequate facilities.",
        "Several areas need urgent attention and improvement."
    ]
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateFeedbacks = async () => {
    console.log('🌱 Generating sample feedbacks for all departments...\n');

    const departments = [
        { id: 'global_pagoda', name: 'Global Vipassana Pagoda' },
        { id: 'food_court', name: 'Food Court' },
        { id: 'souvenir_shop', name: 'Souvenir Shop' },
        { id: 'dhamma_alaya', name: 'Dhammalaya' },
        { id: 'dpvc', name: 'DPVC' }
    ];

    let totalCreated = 0;

    for (const dept of departments) {
        console.log(`📝 Creating 5 feedbacks for ${dept.name}...`);

        for (let i = 0; i < 5; i++) {
            // Mix of ratings: 2 excellent, 2 good, 1 needs improvement
            let ratingType;
            if (i < 2) ratingType = 'excellent'; // 5s and 4s
            else if (i < 4) ratingType = 'good'; // 4s and 3s
            else ratingType = 'needsWork'; // 2s and 3s

            let answers, sentiment, category, suggestionText;

            // Generate department-specific answers
            switch (dept.id) {
                case 'global_pagoda':
                    if (ratingType === 'excellent') {
                        answers = {
                            peaceful: '5',
                            vipassana_understanding: '5',
                            course_interest: '5',
                            cleanliness: '5',
                            staff_behavior: '5',
                            overall_experience: '5',
                            suggestion: getRandomItem(suggestions.positive)
                        };
                        sentiment = 'Positive';
                        category = 'Ambience';
                    } else if (ratingType === 'good') {
                        answers = {
                            peaceful: '4',
                            vipassana_understanding: '4',
                            course_interest: '3',
                            cleanliness: '4',
                            staff_behavior: '4',
                            overall_experience: '4',
                            suggestion: getRandomItem(suggestions.neutral)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else {
                        answers = {
                            peaceful: '3',
                            vipassana_understanding: '3',
                            course_interest: '2',
                            cleanliness: '2',
                            staff_behavior: '3',
                            overall_experience: '2',
                            suggestion: getRandomItem(suggestions.negative)
                        };
                        sentiment = 'Negative';
                        category = 'Cleanliness';
                    }
                    break;

                case 'food_court':
                    if (ratingType === 'excellent') {
                        answers = {
                            food_taste: '5',
                            overall_experience: '5',
                            service_counters: '5',
                            service_speed: '5',
                            cleanliness: '5',
                            food_quality: '5',
                            suggestion: getRandomItem(suggestions.positive)
                        };
                        sentiment = 'Positive';
                        category = 'Food';
                    } else if (ratingType === 'good') {
                        answers = {
                            food_taste: '4',
                            overall_experience: '4',
                            service_counters: '4',
                            service_speed: '3',
                            cleanliness: '4',
                            food_quality: '4',
                            suggestion: getRandomItem(suggestions.neutral)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else {
                        answers = {
                            food_taste: '2',
                            overall_experience: '2',
                            service_counters: '3',
                            service_speed: '2',
                            cleanliness: '2',
                            food_quality: '2',
                            suggestion: getRandomItem(suggestions.negative)
                        };
                        sentiment = 'Negative';
                        category = 'Food';
                    }
                    break;

                case 'souvenir_shop':
                    if (ratingType === 'excellent') {
                        answers = {
                            overall_experience: '5',
                            product_search: '5',
                            product_quality: '5',
                            price_reasonableness: '5',
                            staff_knowledge: '5',
                            recommendation_likelihood: '5',
                            suggestion: getRandomItem(suggestions.positive)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else if (ratingType === 'good') {
                        answers = {
                            overall_experience: '4',
                            product_search: '4',
                            product_quality: '4',
                            price_reasonableness: '3',
                            staff_knowledge: '4',
                            recommendation_likelihood: '4',
                            suggestion: getRandomItem(suggestions.neutral)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else {
                        answers = {
                            overall_experience: '2',
                            product_search: '3',
                            product_quality: '2',
                            price_reasonableness: '2',
                            staff_knowledge: '3',
                            recommendation_likelihood: '2',
                            suggestion: getRandomItem(suggestions.negative)
                        };
                        sentiment = 'Negative';
                        category = 'Service';
                    }
                    break;

                case 'dhamma_alaya':
                    if (ratingType === 'excellent') {
                        answers = {
                            overall_experience: '5',
                            room_comfort: '5',
                            cleanliness: '5',
                            food_quality: '5',
                            staff_support: '5',
                            rates_reasonableness: '5',
                            recommendation_likelihood: '5',
                            suggestion: getRandomItem(suggestions.positive)
                        };
                        sentiment = 'Positive';
                        category = 'Ambience';
                    } else if (ratingType === 'good') {
                        answers = {
                            overall_experience: '4',
                            room_comfort: '4',
                            cleanliness: '4',
                            food_quality: '3',
                            staff_support: '4',
                            rates_reasonableness: '4',
                            recommendation_likelihood: '4',
                            suggestion: getRandomItem(suggestions.neutral)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else {
                        answers = {
                            overall_experience: '2',
                            room_comfort: '2',
                            cleanliness: '2',
                            food_quality: '3',
                            staff_support: '3',
                            rates_reasonableness: '2',
                            recommendation_likelihood: '2',
                            suggestion: getRandomItem(suggestions.negative)
                        };
                        sentiment = 'Negative';
                        category = 'Cleanliness';
                    }
                    break;

                case 'dpvc':
                    if (ratingType === 'excellent') {
                        answers = {
                            overall_experience: '5',
                            accommodation: '5',
                            food_dining: '5',
                            meditation_facilities: '5',
                            course_management: '5',
                            guidance_support: '5',
                            recommendation_likelihood: '5',
                            suggestion: getRandomItem(suggestions.positive)
                        };
                        sentiment = 'Positive';
                        category = 'Ambience';
                    } else if (ratingType === 'good') {
                        answers = {
                            overall_experience: '4',
                            accommodation: '4',
                            food_dining: '4',
                            meditation_facilities: '4',
                            course_management: '4',
                            guidance_support: '3',
                            recommendation_likelihood: '4',
                            suggestion: getRandomItem(suggestions.neutral)
                        };
                        sentiment = 'Positive';
                        category = 'Service';
                    } else {
                        answers = {
                            overall_experience: '2',
                            accommodation: '2',
                            food_dining: '3',
                            meditation_facilities: '3',
                            course_management: '2',
                            guidance_support: '2',
                            recommendation_likelihood: '2',
                            suggestion: getRandomItem(suggestions.negative)
                        };
                        sentiment = 'Negative';
                        category = 'Ambience';
                    }
                    break;
            }

            suggestionText = answers.suggestion;

            // Random name and email
            const nameIdx = getRandomInt(0, names.length - 1);
            const name = names[nameIdx];
            const email = emails[nameIdx];

            // Create feedback with date in the last 7 days for weekly report
            const daysAgo = getRandomInt(0, 6);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            await Feedback.insert({
                department: dept.id,
                answers: answers,
                name: name,
                email: email,
                feedback: suggestionText,
                sentiment: sentiment,
                category: category,
                createdAt: date,
                updatedAt: date
            });

            totalCreated++;
            console.log(`  ✅ Created ${ratingType} feedback #${i + 1} (${sentiment}, ${Math.floor(daysAgo)} days ago)`);
        }
        console.log('');
    }

    console.log(`\n✨ Successfully created ${totalCreated} sample feedbacks!`);
    console.log('📊 Distribution: 10 Excellent, 10 Good, 5 Needs Improvement\n');
};

// Execute if run directly
if (require.main === module) {
    generateFeedbacks().then(() => {
        console.log('✅ Done!');
        process.exit(0);
    }).catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
}

module.exports = generateFeedbacks;
