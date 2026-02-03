#!/usr/bin/env node

/**
 * Questions Configuration Validator
 *
 * This script validates the questions.json configuration file.
 * Run this after making changes to questions.json to ensure it's properly formatted.
 *
 * Usage: node validate-questions.js
 */

const fs = require('fs');
const path = require('path');

const validateQuestions = () => {
    console.log('\n' + '='.repeat(60));
    console.log('❓ QUESTIONS CONFIGURATION VALIDATOR');
    console.log('='.repeat(60) + '\n');

    const questionsPath = path.join(__dirname, 'questions.json');

    try {
        // Check if file exists
        if (!fs.existsSync(questionsPath)) {
            console.error('❌ questions.json not found!');
            return false;
        }

        // Read and parse JSON
        const content = fs.readFileSync(questionsPath, 'utf8');
        const config = JSON.parse(content);

        console.log('✅ JSON is valid and parseable\n');

        // Expected departments
        const expectedDepts = ['global_pagoda', 'food_court', 'souvenir_shop', 'dhamma_alaya', 'dpvc'];
        const validTypes = ['smiley', 'number_rating', 'rating_5', 'text'];

        let totalQuestions = 0;
        let hasErrors = false;

        for (const dept of expectedDepts) {
            if (!config[dept]) {
                console.log(`⚠️  Department missing: ${dept}`);
                hasErrors = true;
                continue;
            }

            const deptConfig = config[dept];

            if (!deptConfig.name) {
                console.log(`❌ ${dept}: Missing 'name' field`);
                hasErrors = true;
            }

            if (!Array.isArray(deptConfig.questions)) {
                console.log(`❌ ${dept}: 'questions' is not an array`);
                hasErrors = true;
                continue;
            }

            console.log(`\n📋 ${deptConfig.name || dept}:`);
            console.log('-'.repeat(60));

            deptConfig.questions.forEach((q, idx) => {
                totalQuestions++;

                // Validate required fields
                const errors = [];

                if (!q.id) errors.push('Missing id');
                if (!q.text) errors.push('Missing text');
                if (!q.type) errors.push('Missing type');

                if (q.type && !validTypes.includes(q.type)) {
                    errors.push(`Invalid type '${q.type}' (must be: ${validTypes.join(', ')})`);
                }

                // Check labels for rating types
                if (['smiley', 'number_rating', 'rating_5'].includes(q.type)) {
                    if (!q.labels || typeof q.labels !== 'object') {
                        errors.push('Missing or invalid labels for rating type');
                    } else {
                        // Check if labels has 1-5
                        const labelKeys = Object.keys(q.labels).sort();
                        const expectedKeys = ['1', '2', '3', '4', '5'];
                        if (JSON.stringify(labelKeys) !== JSON.stringify(expectedKeys)) {
                            errors.push(`Labels should have keys 1-5, found: ${labelKeys.join(',')}`);
                        }
                    }
                }

                const status = errors.length === 0 ? '✅' : '❌';
                console.log(`  ${idx + 1}. ${status} ${q.id || 'NO_ID'} (${q.type || 'NO_TYPE'})`);

                if (errors.length > 0) {
                    errors.forEach(err => console.log(`      ⚠️  ${err}`));
                    hasErrors = true;
                } else {
                    console.log(`      "${q.text}"`);
                }
            });
        }

        // Check for unexpected departments
        const extraDepts = Object.keys(config).filter(d => !expectedDepts.includes(d));
        if (extraDepts.length > 0) {
            console.log('\n⚠️  Unexpected departments found:');
            extraDepts.forEach(dept => console.log(`   - ${dept}`));
        }

        console.log('\n' + '='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   Total departments: ${expectedDepts.length}`);
        console.log(`   Total questions: ${totalQuestions}`);
        console.log('='.repeat(60) + '\n');

        if (!hasErrors) {
            console.log('✨ All questions are valid!');
            console.log('💡 Changes will take effect immediately (no server restart needed)\n');
            return true;
        } else {
            console.log('⚠️  Please fix the errors above.\n');
            return false;
        }

    } catch (error) {
        console.error('❌ Error validating questions.json:');
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
    const isValid = validateQuestions();
    process.exit(isValid ? 0 : 1);
}

module.exports = validateQuestions;
