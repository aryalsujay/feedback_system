#!/usr/bin/env node

import fs from 'fs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5001/api';

// Default questions structure
const defaultQuestions = {
    'global_pagoda': {
        name: 'Global Vipassana Pagoda',
        questions: [
            { id: '1', text: 'How satisfied are you with your visit?', type: 'smiley' },
            { id: '2', text: 'Would you recommend us to others?', type: 'rating_5' },
            { id: '3', text: 'Additional comments or suggestions', type: 'text' }
        ]
    },
    'food_court': {
        name: 'Food Court',
        questions: [
            { id: '1', text: 'How would you rate the food quality?', type: 'rating_5' },
            { id: '2', text: 'Service speed (1-10)?', type: 'number_rating' },
            { id: '3', text: 'Any feedback on menu or pricing?', type: 'text' }
        ]
    },
    'souvenir_shop': {
        name: 'Souvenir Shop',
        questions: [
            { id: '1', text: 'Satisfied with product variety?', type: 'smiley' },
            { id: '2', text: 'Rate value for money', type: 'rating_5' },
            { id: '3', text: 'Your suggestions', type: 'text' }
        ]
    },
    'dhamma_alaya': {
        name: 'Dhamma Alaya',
        questions: [
            { id: '1', text: 'How was your meditation experience?', type: 'smiley' },
            { id: '2', text: 'Quality of guidance received', type: 'rating_5' },
            { id: '3', text: 'Additional feedback', type: 'text' }
        ]
    },
    'dpvc': {
        name: 'DPVC',
        questions: [
            { id: '1', text: 'Rate the training quality', type: 'rating_5' },
            { id: '2', text: 'Was the instructor helpful?', type: 'smiley' },
            { id: '3', text: 'Suggestions for improvement', type: 'text' }
        ]
    }
};

async function fetchQuestions() {
    try {
        const response = await fetch(`${API_URL}/questions`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('Could not fetch from API, using defaults');
    }
    return defaultQuestions;
}

function createSVG(title, content) {
    const width = 1280;
    const lineHeight = 40;
    const lines = content.split('\n');
    const height = lines.length * lineHeight + 100;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      body { font-family: Arial, sans-serif; }
      .header { fill: #8B4513; font-size: 28px; font-weight: bold; }
      .title { fill: #333; font-size: 20px; font-weight: bold; }
      .text { fill: #555; font-size: 14px; }
      .section { fill: #666; font-size: 16px; font-weight: bold; }
    </style>
  </defs>

  <!-- Header -->
  <rect width="${width}" height="60" fill="#8B4513"/>
  <text x="20" y="40" class="header">${title}</text>

`;

    let y = 100;
    for (const line of lines) {
        if (line.trim() === '') {
            y += lineHeight / 2;
        } else if (line.startsWith('###')) {
            svg += `  <text x="20" y="${y}" class="section">${line.replace('###', '').trim()}</text>\n`;
            y += lineHeight;
        } else if (line.startsWith('**')) {
            svg += `  <text x="40" y="${y}" class="title">${line.replace(/\*\*/g, '').trim()}</text>\n`;
            y += lineHeight;
        } else {
            svg += `  <text x="60" y="${y}" class="text">${line}</text>\n`;
            y += lineHeight;
        }
    }

    svg += `
  <!-- Footer -->
  <rect y="${height - 30}" width="${width}" height="30" fill="#f0f0f0"/>
  <text x="20" y="${height - 10}" class="text">© 2025 Global Vipassana Pagoda. All rights reserved.</text>
</svg>`;

    return svg;
}

function createHomeSVG() {
    let content = `### Global Vipassana Pagoda - Feedback Portal

**Select a Department:**

1. Global Vipassana Pagoda
   Provide feedback about your overall experience

2. Food Court
   Share your thoughts about our dining services

3. Souvenir Shop
   Rate our merchandise and shopping experience

4. Dhamma Alaya
   Feedback on meditation and spiritual services

5. DPVC
   Evaluate our training programs`;

    return createSVG('Home - Department Selection', content);
}

function createFeedbackFormSVG(deptName, questions) {
    let content = `### ${deptName} - Feedback Form

**Your Details (Optional):**
- Name: [Text Input]
- Email: [Text Input]
- Contact Number: [Text Input]
- Location: [Text Input]

**Feedback Questions:**
`;

    questions.forEach((q, i) => {
        content += `\n${i + 1}. ${q.text}\n`;

        switch(q.type) {
            case 'smiley':
                content += '   ☹️ Unsatisfied | 😐 Neutral | 😊 Satisfied | 😄 Very Satisfied\n';
                break;
            case 'rating_5':
                content += '   ★ ★ ★ ★ ★ (5-Star Rating)\n';
                break;
            case 'number_rating':
                content += '   [Scale 1-10]\n';
                break;
            case 'option_select':
                content += '   [Select from options]\n';
                break;
            case 'text':
                content += '   [Text area for comments and suggestions]\n';
                break;
        }
    });

    content += `\n[Submit Feedback Button]`;

    return createSVG(`${deptName} - Feedback Form`, content);
}

async function generateScreenshots() {
    console.log('🎨 Generating feedback form screenshots as SVG...\n');

    try {
        const questions = await fetchQuestions();

        // Home page
        console.log('1. Creating home page...');
        fs.writeFileSync('/tmp/01-home-page.svg', createHomeSVG());
        console.log('   ✓ Saved: /tmp/01-home-page.svg');

        // Department feedback forms
        const departments = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc'];

        departments.forEach((deptId, idx) => {
            if (questions[deptId]) {
                console.log(`\n${idx + 2}. Creating ${deptId} feedback form...`);
                const svg = createFeedbackFormSVG(
                    questions[deptId].name,
                    questions[deptId].questions
                );
                const filename = `/tmp/${String(idx + 2).padStart(2, '0')}-feedback-${deptId}.svg`;
                fs.writeFileSync(filename, svg);
                console.log(`   ✓ Saved: ${filename}`);
            }
        });

        console.log('\n✅ SVG screenshots generated successfully!');
        console.log('\nFiles saved in /tmp/:');
        console.log('  - 01-home-page.svg');
        console.log('  - 02-feedback-global_pagoda.svg');
        console.log('  - 03-feedback-food_court.svg');
        console.log('  - 04-feedback-souvenir_shop.svg');
        console.log('  - 05-feedback-dhamma_alaya.svg');
        console.log('  - 06-feedback-dpvc.svg');
        console.log('\nTo convert SVG to PNG, you can use:');
        console.log('  - Online converters (SVG to PNG)');
        console.log('  - ImageMagick: convert file.svg file.png');
        console.log('  - Inkscape: inkscape file.svg --export-png=file.png');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateScreenshots();
