#!/bin/bash

# Daily Feedback Backup Script
# Runs at 4am daily to backup feedback database

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
BACKUP_DIR="$PROJECT_DIR/backups"
DATA_DIR="$PROJECT_DIR/server/data"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="daily_backup_$DATE.zip"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup (only feedbacks.db)
cd "$PROJECT_DIR"
zip -j "$BACKUP_DIR/$BACKUP_FILE" "$DATA_DIR/feedbacks.db"

echo "Daily backup created: $BACKUP_FILE"

# Keep only last 30 days of daily backups
find "$BACKUP_DIR" -name "daily_backup_*.zip" -type f -mtime +30 -delete

echo "Old backups cleaned up (kept last 30 days)"
