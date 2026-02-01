require('../config/init');
const Feedback = require('../models/Feedback');
const { generateAndSendReports } = require('../services/reportGenerator');

const questionsConfig = require('../../config/questions.json');

const sampleComments = [
    "Great experience overall, very peaceful.",
    "The food was delicious but a bit spicy.",
    "Staff was helpful but the lines were long.",
    "Cleanliness could be improved in the restrooms.",
    "Excellent meditation environment, will come again.",
    "Room was comfortable but AC wasn't working well.",
    "Prices in the souvenir shop are reasonable.",
    "The course management was very disciplined.",
    "Loved the environment!",
    "Basic facilities are good."
];

const getRandomRating = (max = 5) => Math.floor(Math.random() * max) + 1;
const getRandomComment = () => sampleComments[Math.floor(Math.random() * sampleComments.length)];

const generateSampleData = async () => {
    try {
        console.log('Using Embedded NeDB...');

        // Clear existing data
        await Feedback.remove({}, { multi: true });
        console.log('Cleared existing feedback data.');

        const feedbacks = [];
        const depts = Object.keys(questionsConfig);

        for (const deptId of depts) {
            console.log(`Generating data for ${deptId}...`);
            const deptConfig = questionsConfig[deptId];

            for (let i = 0; i < 5; i++) {
                const answers = {};
                deptConfig.questions.forEach(q => {
                    if (q.type === 'text') {
                        answers[q.id] = getRandomComment();
                    } else if (q.type === 'smiley') {
                        answers[q.id] = getRandomRating(5);
                    } else {
                        answers[q.id] = getRandomRating(5);
                    }
                });

                feedbacks.push({
                    departmentId: deptId,
                    answers: answers,
                    submittedAt: new Date(), // Now
                    name: `Test User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    phone: '1234567890'
                });
            }
        }

        await Feedback.insert(feedbacks);
        console.log(`Inserted ${feedbacks.length} sample feedbacks.`);

        // Trigger Report
        console.log('Triggering Report Generation...');
        await generateAndSendReports();

        console.log('Done!');
        // process.exit(0); 
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

generateSampleData();
