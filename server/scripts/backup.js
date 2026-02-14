#!/usr/bin/env node

/**
 * Automated Backup Script for Feedback System
 * Creates daily backups of all feedback data
 * Keeps last 30 days of backups
 */

const path = require('path');
const fs = require('fs');
const Feedback = require('../models/Feedback');

// Configuration
const BACKUP_DIR = path.join(__dirname, '../../backups');
const RETENTION_DAYS = 30;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
}

// Generate backup filename with timestamp
const getBackupFilename = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `feedback_backup_${year}-${month}-${day}_${hours}-${minutes}.json`;
};

// Create backup
const createBackup = async () => {
    try {
        console.log('Starting backup...');

        // Fetch all feedback data (using nedb-promises)
        const feedbacks = await Feedback.find({});

        const backupData = {
            timestamp: new Date().toISOString(),
            count: feedbacks.length,
            data: feedbacks
        };

        const filename = getBackupFilename();
        const filepath = path.join(BACKUP_DIR, filename);

        // Write backup file
        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');

        console.log(`✓ Backup created successfully: ${filename}`);
        console.log(`  Total entries: ${feedbacks.length}`);
        console.log(`  File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

        // Clean old backups
        cleanOldBackups();
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
};

// Remove backups older than RETENTION_DAYS
const cleanOldBackups = () => {
    try {
        const files = fs.readdirSync(BACKUP_DIR);
        const now = Date.now();
        const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

        let deletedCount = 0;

        files.forEach(file => {
            if (!file.startsWith('feedback_backup_')) return;

            const filepath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filepath);
            const age = now - stats.mtimeMs;

            if (age > retentionMs) {
                fs.unlinkSync(filepath);
                deletedCount++;
                console.log(`  Deleted old backup: ${file}`);
            }
        });

        if (deletedCount > 0) {
            console.log(`✓ Cleaned ${deletedCount} old backup(s)`);
        } else {
            console.log('✓ No old backups to clean');
        }

        console.log(`✓ Total backups: ${files.filter(f => f.startsWith('feedback_backup_')).length - deletedCount}`);
    } catch (error) {
        console.error('Error cleaning old backups:', error);
    }
};

// Run backup
createBackup();
