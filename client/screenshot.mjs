import { firefox } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const departments = [
    'global_pagoda',
    'food_court',
    'souvenir_shop',
    'dhamma_alaya',
    'dpvc'
];

async function takeScreenshots() {
    const browser = await firefox.launch();
    const context = await browser.createContext({
        viewport: { width: 1280, height: 1920 }
    });
    const page = await context.newPage();

    try {
        // Screenshot home page
        console.log('Taking screenshot of home page...');
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Get full page height and take screenshot
        const bodyHandle = await page.$('body');
        const boundingBox = await bodyHandle.boundingBox();

        await page.screenshot({
            path: '/tmp/01-home-page.png',
            fullPage: true
        });
        console.log('✓ Home page screenshot saved: /tmp/01-home-page.png');

        // Screenshot feedback forms for each department
        for (let i = 0; i < departments.length; i++) {
            const dept = departments[i];
            console.log(`\nTaking screenshot for department: ${dept}...`);

            await page.goto(`${BASE_URL}/feedback/${dept}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // Scroll to ensure all content is loaded
            await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
            await page.waitForTimeout(500);

            const filename = `/tmp/${String(i + 2).padStart(2, '0')}-feedback-${dept}.png`;
            await page.screenshot({
                path: filename,
                fullPage: true
            });
            console.log(`✓ Feedback form screenshot saved: ${filename}`);
        }

        console.log('\n✅ All screenshots completed!');
        console.log('Screenshots saved in /tmp/');
    } catch (error) {
        console.error('Error taking screenshots:', error);
    } finally {
        await browser.close();
    }
}

takeScreenshots();
