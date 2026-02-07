#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const departments = [
    'global_pagoda',
    'food_court',
    'souvenir_shop',
    'dhamma_alaya',
    'dpvc'
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capturePages() {
    try {
        console.log('📸 Capturing pages as HTML...\n');

        // Capture home page
        console.log('1. Capturing Home Page...');
        try {
            const homeResponse = await fetch(`${BASE_URL}/`);
            if (!homeResponse.ok) throw new Error(`HTTP ${homeResponse.status}`);

            let homeHTML = await homeResponse.text();
            // Create a full-page capture by injecting CSS for full viewport
            homeHTML = homeHTML.replace('</head>', `
                <style>
                    html, body { width: 100% !important; height: auto !important; }
                    * { max-width: 100% !important; }
                </style>
                </head>
            `);

            fs.writeFileSync('/tmp/01-home-page.html', homeHTML);
            console.log('   ✓ Saved: /tmp/01-home-page.html');
        } catch (error) {
            console.error('   ✗ Error:', error.message);
        }

        // Capture feedback forms
        for (let i = 0; i < departments.length; i++) {
            const dept = departments[i];
            console.log(`\n${i + 2}. Capturing ${dept}...`);
            try {
                const response = await fetch(`${BASE_URL}/feedback/${dept}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                let html = await response.text();
                // Inject CSS to show full page and hide scrollbars
                html = html.replace('</head>', `
                    <style>
                        html, body { width: 100% !important; height: auto !important; }
                        * { max-width: 100% !important; }
                        ::-webkit-scrollbar { display: none; }
                        body { -ms-overflow-style: none; scrollbar-width: none; }
                    </style>
                    </head>
                `);

                const filename = `/tmp/${String(i + 2).padStart(2, '0')}-feedback-${dept}.html`;
                fs.writeFileSync(filename, html);
                console.log(`   ✓ Saved: ${filename}`);
            } catch (error) {
                console.error('   ✗ Error:', error.message);
            }
        }

        console.log('\n✅ Capture completed!');
        console.log('HTML files saved in /tmp/');
        console.log('\nTo view the pages, open the HTML files in a web browser.');
        console.log('For full-page screenshots, use your browser\'s developer tools or a tool like:');
        console.log('  - Full Page Screen Capture (Firefox extension)');
        console.log('  - GoFullPage (Chrome extension)');
        console.log('  - Or use: google-chrome --headless --disable-gpu --screenshot --window-size=1280,1920 file:///tmp/01-home-page.html');
    } catch (error) {
        console.error('Unexpected error:', error);
        process.exit(1);
    }
}

capturePages();
