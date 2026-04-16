#!/bin/bash

# deploy.sh - Automated deployment script for SRMS
# Usage: ./deploy.sh [--skip-backup] [--skip-build]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/srms"
BACKUP_DIR="/backup/srms"
SKIP_BACKUP=0
SKIP_BUILD=0

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-backup)
            SKIP_BACKUP=1
            shift
            ;;
        --skip-build)
            SKIP_BUILD=1
            shift
            ;;
    esac
done

echo -e "${GREEN}=== SRMS Deployment Script ===${NC}"
echo "Project directory: $PROJECT_DIR"
echo ""

# Function to print step
step() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Function to print warning
warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root or with docker permissions
if ! docker ps > /dev/null 2>&1; then
    error "Docker is not accessible. Run with sudo or add user to docker group."
fi

# Change to project directory
cd "$PROJECT_DIR" || error "Project directory not found: $PROJECT_DIR"

# Step 1: Pull latest code
step "Pulling latest code from Git..."
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
git pull origin "$CURRENT_BRANCH" || error "Failed to pull latest code"

# Step 2: Backup database
if [ $SKIP_BACKUP -eq 0 ]; then
    step "Creating database backup..."
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"

    docker compose exec -T mysql mysqldump \
        -u root \
        -p"${DB_ROOT_PASSWORD:-root_password_change_me}" \
        srms_backend > "$BACKUP_FILE" || warn "Database backup failed"

    if [ -f "$BACKUP_FILE" ]; then
        gzip "$BACKUP_FILE"
        echo "Backup saved: ${BACKUP_FILE}.gz"
    fi

    # Keep only last 7 backups
    find "$BACKUP_DIR" -name "db-backup-*.sql.gz" -mtime +7 -delete
else
    warn "Skipping database backup (--skip-backup)"
fi

# Step 3: Build Docker images
if [ $SKIP_BUILD -eq 0 ]; then
    step "Building Docker images..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache || error "Build failed"
else
    warn "Skipping image build (--skip-build)"
fi

# Step 4: Update services with zero downtime
step "Updating services (zero downtime)..."

# Update backend
step "Updating backend service..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build backend

# Wait for backend to be healthy
step "Waiting for backend to be healthy..."
for i in {1..30}; do
    if docker compose exec backend php artisan --version > /dev/null 2>&1; then
        echo "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Backend failed to become healthy"
    fi
    sleep 2
done

# Update queue worker
step "Updating queue worker..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build queue

# Update frontend
step "Updating frontend service..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build frontend

# Update customer app
step "Updating customer service..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build customer

# Step 5: Run database migrations
step "Running database migrations..."
docker compose exec backend php artisan migrate --force || error "Migration failed"

# Step 6: Clear and optimize caches
step "Optimizing application..."
docker compose exec backend php artisan optimize:clear
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache

# Step 7: Restart nginx to pick up any config changes
step "Reloading nginx..."
docker compose exec nginx nginx -s reload

# Step 8: Health check
step "Running health checks..."

# Check backend
if docker compose exec backend php artisan --version > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is healthy"
else
    error "Backend health check failed"
fi

# Check MySQL
if docker compose exec mysql mysqladmin ping -h localhost -u root -p"${DB_ROOT_PASSWORD:-root_password_change_me}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MySQL is healthy"
else
    error "MySQL health check failed"
fi

# Check Redis
if docker compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis is healthy"
else
    error "Redis health check failed"
fi

# Step 9: Display status
step "Deployment summary:"
echo ""
docker compose ps
echo ""

# Show recent logs
step "Recent logs (last 20 lines):"
docker compose logs --tail=20 backend queue

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "Git branch: $CURRENT_BRANCH"
echo "Deployment time: $(date +'%Y-%m-%d %H:%M:%S')"
echo ""
echo "Verify deployment at:"
echo "  Backend API: https://yourdomain.com/api/public/categories"
echo "  Admin Panel: https://yourdomain.com/admin"
echo "  Frontend: https://yourdomain.com/app"
echo "  Customer App: https://yourdomain.com/"
