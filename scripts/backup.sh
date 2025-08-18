#!/bin/bash

# Backup Script for What to Eat App

set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="what-to-eat-backup-$TIMESTAMP"

echo "📦 Starting backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create a temporary directory for this backup
TEMP_BACKUP="/tmp/$BACKUP_NAME"
mkdir -p "$TEMP_BACKUP"

# Backup database
echo "💾 Backing up database..."
if [ -f "data/database.db" ]; then
    cp "data/database.db" "$TEMP_BACKUP/"
    echo "✅ Database backed up"
else
    echo "⚠️  No database found to backup"
fi

# Backup environment files
echo "⚙️  Backing up configuration..."
for env_file in .env.production .env.development server/.env.production server/.env.development; do
    if [ -f "$env_file" ]; then
        cp "$env_file" "$TEMP_BACKUP/"
        echo "✅ Backed up $env_file"
    fi
done

# Backup SSL certificates
echo "🔐 Backing up SSL certificates..."
if [ -d "nginx/ssl" ]; then
    cp -r "nginx/ssl" "$TEMP_BACKUP/"
    echo "✅ SSL certificates backed up"
fi

# Backup logs
echo "📝 Backing up logs..."
if [ -d "logs" ]; then
    cp -r "logs" "$TEMP_BACKUP/"
    echo "✅ Logs backed up"
fi

# Create compressed archive
echo "🗜️  Creating compressed archive..."
cd /tmp
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
cd - > /dev/null

# Move to backup directory
mv "/tmp/$BACKUP_NAME.tar.gz" "$BACKUP_DIR/"

# Cleanup temp directory
rm -rf "$TEMP_BACKUP"

# Display backup info
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
echo ""
echo "✅ Backup completed successfully!"
echo "📁 Backup file: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "📏 Backup size: $BACKUP_SIZE"
echo ""

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "what-to-eat-backup-*.tar.gz" -mtime +7 -delete
echo "✅ Old backups cleaned up"

echo ""
echo "📦 Backup process completed!"