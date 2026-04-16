#!/bin/bash

# backup.sh - Automated backup script for SRMS
# Usage: ./backup.sh
# Recommended: Run daily via cron

set -e

# Configuration
PROJECT_DIR="/opt/srms"
BACKUP_DIR="/backup/srms"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== SRMS Backup Script ===${NC}"
echo "Backup directory: $BACKUP_DIR"
echo "Retention: $RETENTION_DAYS days"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/storage"

# Timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Change to project directory
cd "$PROJECT_DIR" || { echo -e "${RED}Project directory not found${NC}"; exit 1; }

# Load environment variables
if [ -f docker/.env.backend ]; then
    export $(cat docker/.env.backend | grep -v '^#' | xargs)
fi

# Step 1: Backup database
echo "Backing up database..."
DB_BACKUP_FILE="$BACKUP_DIR/database/srms-db-$TIMESTAMP.sql"

docker compose exec -T mysql mysqldump \
    -u root \
    -p"${DB_ROOT_PASSWORD:-root_password_change_me}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    srms_backend > "$DB_BACKUP_FILE"

if [ -f "$DB_BACKUP_FILE" ]; then
    gzip "$DB_BACKUP_FILE"
    DB_SIZE=$(du -h "${DB_BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}✓${NC} Database backup complete: ${DB_BACKUP_FILE}.gz ($DB_SIZE)"
else
    echo -e "${RED}✗${NC} Database backup failed"
fi

# Step 2: Backup storage files
echo "Backing up storage files..."
STORAGE_BACKUP_DIR="$BACKUP_DIR/storage/srms-storage-$TIMESTAMP"

rsync -az \
    --exclude='framework/cache/*' \
    --exclude='framework/sessions/*' \
    --exclude='framework/views/*' \
    --exclude='logs/*' \
    srms-backend/storage/app/public/ \
    "$STORAGE_BACKUP_DIR/"

if [ -d "$STORAGE_BACKUP_DIR" ]; then
    STORAGE_SIZE=$(du -sh "$STORAGE_BACKUP_DIR" | cut -f1)
    echo -e "${GREEN}✓${NC} Storage backup complete: $STORAGE_BACKUP_DIR ($STORAGE_SIZE)"
else
    echo -e "${RED}✗${NC} Storage backup failed"
fi

# Step 3: Backup .env files (encrypted)
echo "Backing up environment files..."
ENV_BACKUP_FILE="$BACKUP_DIR/env-backup-$TIMESTAMP.tar.gz"

tar -czf "$ENV_BACKUP_FILE" \
    docker/.env.backend \
    docker/.env.customer \
    srms-backend/.env 2>/dev/null || true

if [ -f "$ENV_BACKUP_FILE" ]; then
    chmod 600 "$ENV_BACKUP_FILE"
    echo -e "${GREEN}✓${NC} Environment files backed up: $ENV_BACKUP_FILE"
fi

# Step 4: Clean old backups
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."

# Database backups
find "$BACKUP_DIR/database" -name "srms-db-*.sql.gz" -mtime +$RETENTION_DAYS -delete
DB_COUNT=$(find "$BACKUP_DIR/database" -name "srms-db-*.sql.gz" | wc -l)

# Storage backups
find "$BACKUP_DIR/storage" -maxdepth 1 -type d -name "srms-storage-*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;
STORAGE_COUNT=$(find "$BACKUP_DIR/storage" -maxdepth 1 -type d -name "srms-storage-*" | wc -l)

# Env backups
find "$BACKUP_DIR" -name "env-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
ENV_COUNT=$(find "$BACKUP_DIR" -name "env-backup-*.tar.gz" | wc -l)

echo -e "${GREEN}✓${NC} Cleanup complete"
echo "  Database backups retained: $DB_COUNT"
echo "  Storage backups retained: $STORAGE_COUNT"
echo "  Environment backups retained: $ENV_COUNT"

# Step 5: Backup summary
echo ""
echo -e "${GREEN}=== Backup Summary ===${NC}"
echo "Backup timestamp: $TIMESTAMP"
echo "Total backup size: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "Files created:"
echo "  - ${DB_BACKUP_FILE}.gz"
echo "  - $STORAGE_BACKUP_DIR"
echo "  - $ENV_BACKUP_FILE"
echo ""

# Optional: Upload to remote storage (uncomment if using)
# echo "Uploading to remote storage..."
# rclone sync "$BACKUP_DIR" remote:srms-backups/

echo -e "${GREEN}Backup complete!${NC}"

# Exit with success
exit 0
