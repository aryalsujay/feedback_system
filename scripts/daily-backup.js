#!/usr/bin/env node

// Daily Feedback Backup Script
// Runs at 4am daily to backup feedback database

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(PROJECT_DIR, 'backups');
const DATA_DIR = path.join(PROJECT_DIR, 'server', 'data');
const DATE = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const BACKUP_FILE = `daily_backup_${DATE}.db`;

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const feedbacksDb = path.join(DATA_DIR, 'feedbacks.db');
const backupPath = path.join(BACKUP_DIR, BACKUP_FILE);

if (!fs.existsSync(feedbacksDb)) {
    console.error('feedbacks.db not found!');
    process.exit(1);
}

// Copy feedbacks.db to backup directory
fs.copyFileSync(feedbacksDb, backupPath);
const stats = fs.statSync(backupPath);

console.log(`Daily backup created: ${BACKUP_FILE} (${(stats.size / 1024).toFixed(2)} KB)`);

// Keep only last 30 days of daily backups
const files = fs.readdirSync(BACKUP_DIR);
const now = Date.now();
const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
let deletedCount = 0;

files.forEach(file => {
    if (file.startsWith('daily_backup_') && file.endsWith('.db')) {
        const filePath = path.join(BACKUP_DIR, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.mtime.getTime() < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            deletedCount++;
        }
    }
});

if (deletedCount > 0) {
    console.log(`Deleted ${deletedCount} old backup(s) (kept last 30 days)`);
}

console.log('Backup complete!');
