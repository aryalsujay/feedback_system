#!/usr/bin/env node

import svg2png from 'svg2png';
import fs from 'fs';
import path from 'path';

const files = [
    '/tmp/01-home-page.svg',
    '/tmp/02-feedback-global_pagoda.svg',
    '/tmp/03-feedback-food_court.svg',
    '/tmp/04-feedback-souvenir_shop.svg',
    '/tmp/05-feedback-dhamma_alaya.svg',
    '/tmp/06-feedback-dpvc.svg'
];

async function convertSvgToPng() {
    console.log('🖼️  Converting SVG files to PNG...\n');

    for (const svgFile of files) {
        if (!fs.existsSync(svgFile)) {
            console.log(`⏭️  Skipping ${path.basename(svgFile)} (not found)`);
            continue;
        }

        const pngFile = svgFile.replace('.svg', '.png');

        try {
            const svg = fs.readFileSync(svgFile);
            const png = await svg2png({ width: 1280, height: 2000 }).render(Buffer.from(svg));
            fs.writeFileSync(pngFile, png);
            console.log(`✓ Converted: ${path.basename(svgFile)} → ${path.basename(pngFile)}`);
        } catch (error) {
            console.error(`✗ Error converting ${path.basename(svgFile)}: ${error.message}`);
        }
    }

    console.log('\n✅ Conversion completed!');
    console.log('\nPNG files saved in /tmp/:');
    for (const svgFile of files) {
        const pngFile = svgFile.replace('.svg', '.png');
        if (fs.existsSync(pngFile)) {
            console.log(`  - ${path.basename(pngFile)}`);
        }
    }
}

convertSvgToPng().catch(console.error);
