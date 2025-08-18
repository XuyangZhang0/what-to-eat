#!/bin/bash

# Restore Script for What to Eat App

set -e

BACKUP_DIR="backups"

if [ $# -eq 0 ]; then
    echo "📦 Restore Script for What to Eat App"
    echo ""
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backup files found"
    else
        echo "No backup directory found"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try looking in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "❌ Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

echo "🔄 Starting restore process..."
echo "📁 Restoring from: $BACKUP_FILE"

# Stop services before restore
echo "🛑 Stopping services..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Create backup of current state
if [ -d "data" ] || [ -f ".env.production" ]; then
    echo "💾 Creating backup of current state..."
    CURRENT_BACKUP="current-state-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$BACKUP_DIR/$CURRENT_BACKUP" data/ .env* nginx/ssl/ logs/ 2>/dev/null || true
    echo "✅ Current state backed up to: $BACKUP_DIR/$CURRENT_BACKUP"
fi

# Extract backup
echo "📦 Extracting backup..."
TEMP_RESTORE="/tmp/restore-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TEMP_RESTORE"
tar -xzf "$BACKUP_FILE" -C "$TEMP_RESTORE"

# Find the backup directory (should be the only directory in temp)
BACKUP_CONTENT=$(find "$TEMP_RESTORE" -mindepth 1 -maxdepth 1 -type d | head -1)
if [ -z "$BACKUP_CONTENT" ]; then
    echo "❌ Invalid backup file format"
    rm -rf "$TEMP_RESTORE"
    exit 1
fi

# Restore database
echo "💾 Restoring database..."
if [ -f "$BACKUP_CONTENT/database.db" ]; then
    mkdir -p data
    cp "$BACKUP_CONTENT/database.db" "data/"
    echo "✅ Database restored"
fi

# Restore environment files
echo "⚙️  Restoring configuration..."
for env_file in .env.production .env.development server/.env.production server/.env.development; do
    if [ -f "$BACKUP_CONTENT/$(basename $env_file)" ]; then
        mkdir -p "$(dirname $env_file)"
        cp "$BACKUP_CONTENT/$(basename $env_file)" "$env_file"
        echo "✅ Restored $env_file"
    fi
done

# Restore SSL certificates
echo "🔐 Restoring SSL certificates..."
if [ -d "$BACKUP_CONTENT/ssl" ]; then
    mkdir -p nginx
    cp -r "$BACKUP_CONTENT/ssl" "nginx/"
    echo "✅ SSL certificates restored"
fi

# Restore logs
echo "📝 Restoring logs..."
if [ -d "$BACKUP_CONTENT/logs" ]; then
    cp -r "$BACKUP_CONTENT/logs" "."
    echo "✅ Logs restored"
fi

# Cleanup
rm -rf "$TEMP_RESTORE"

echo ""
echo "✅ Restore completed successfully!"
echo ""
echo "🚀 To start the application:"
echo "  Development: ./scripts/deploy-dev.sh"
echo "  Production:  ./scripts/deploy-prod.sh"
echo ""
echo "⚠️  Please verify the restored configuration before starting services"