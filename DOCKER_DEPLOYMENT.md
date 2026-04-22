# Docker Deployment Guide for SRMS

This guide covers deploying the SRMS monorepo (Laravel backend + React frontend + Next.js customer app) using Docker on an Ubuntu server.

## Architecture Overview

```
Internet → Nginx Proxy (:80/:443, SSL) → Backend (PHP-FPM) → MySQL
                                      → Frontend (Static)    → Redis
                                      → Customer (Next.js)
                                      → Queue Worker
```

**7 Docker Services:**
1. **nginx** - Reverse proxy with SSL termination (Let's Encrypt)
2. **backend** - Laravel 12 API + Filament (PHP 8.2 FPM + Nginx)
3. **queue** - Background job processor (shares backend image)
4. **frontend** - React 19 SPA (static files on Nginx)
5. **customer** - Next.js 15 App (Node.js runtime)
6. **mysql** - MySQL 8.0 database
7. **redis** - Cache and queue driver

## Prerequisites

- Ubuntu 20.04+ server with root access
- Docker 24.0+ and Docker Compose v2
- Domain name pointed to server IP
- Ports 80 and 443 open

## Quick Start

### 1. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose V2
sudo apt install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
sudo mkdir -p /opt/srms
sudo chown $USER:$USER /opt/srms
cd /opt/srms
git clone <your-repo-url> .
```

### 3. Configure Environment

```bash
# Copy environment template
cp docker/.env.production.template docker/.env.backend
cp docker/.env.production.template docker/.env.customer

# Edit backend environment
nano docker/.env.backend
# Update: DB_PASSWORD, DB_ROOT_PASSWORD, HASHIDS_SALT, DOMAIN

# Edit customer environment
nano docker/.env.customer
# Update: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL

# Copy Laravel .env
cp srms-backend/.env.example srms-backend/.env
nano srms-backend/.env
# Configure database, Redis, mail settings
```

**Required Environment Variables:**

```bash
# Backend (.env.backend)
APP_KEY=                     # Generate with: php artisan key:generate
DB_PASSWORD=                 # Strong random password
DB_ROOT_PASSWORD=            # Strong random password
HASHIDS_SALT=                # Random 32-char string
DOMAIN=yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
ADMIN_BYPASS_OTP=false

# Customer (.env.customer)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Generate SSL Certificates

```bash
# Make script executable
chmod +x docker/scripts/init-letsencrypt.sh

# Run SSL initialization
sudo ./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

This script will:
- Create dummy certificates for initial nginx start
- Request real certificates from Let's Encrypt
- Configure automatic renewal

### 5. Build and Start Services

```bash
# Build Docker images (15-20 minutes first time)
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start database services first
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d mysql redis

# Wait for MySQL to be healthy
sleep 30

# Generate Laravel application key
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan key:generate

# Run migrations and seeders
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan migrate --force --seed

# Create storage symlink
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan storage:link

# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps
```

### 6. Verify Deployment

```bash
# Check all services are running
docker compose ps

# Check logs
docker compose logs -f nginx backend queue

# Test endpoints
curl https://yourdomain.com/api/public/categories
curl https://yourdomain.com/api/public/services

# Access in browser:
# - Admin Panel: https://yourdomain.com/admin
# - React Frontend: https://yourdomain.com/app
# - Customer App: https://yourdomain.com/
```

## Development Setup

For local development with hot reload:

```bash
# Start development environment
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Services available at:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:5173
# - Customer: http://localhost:3000
# - MySQL: localhost:3306
# - Redis: localhost:6379
```

## Deployment Updates

Use the automated deployment script:

```bash
cd /opt/srms
./docker/scripts/deploy.sh
```

This script will:
1. Pull latest code from Git
2. Backup database
3. Build Docker images
4. Update services with zero downtime
5. Run migrations
6. Clear and optimize caches
7. Run health checks

**Manual update process:**

```bash
cd /opt/srms
git pull origin main

# Rebuild images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Update services (zero downtime)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build backend frontend customer queue

# Run migrations
docker compose exec backend php artisan migrate --force

# Clear caches
docker compose exec backend php artisan optimize
```

## Backup & Restore

### Automated Backups

Set up daily backups with cron:

```bash
# Make backup script executable
chmod +x docker/scripts/backup.sh

# Add to crontab
crontab -e

# Add line (runs daily at 2 AM):
0 2 * * * /opt/srms/docker/scripts/backup.sh >> /var/log/srms-backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
docker compose exec mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" srms_backend > backup-$(date +%Y%m%d).sql
gzip backup-$(date +%Y%m%d).sql

# Backup storage files
tar -czf storage-backup-$(date +%Y%m%d).tar.gz srms-backend/storage/app/public/
```

### Restore from Backup

```bash
# Restore database
gunzip backup-20260416.sql.gz
docker compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD" srms_backend < backup-20260416.sql

# Restore storage
tar -xzf storage-backup-20260416.tar.gz -C srms-backend/storage/app/
docker compose exec backend chown -R www-data:www-data /var/www/html/storage
```

## Common Commands

### Service Management

```bash
# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Stop all services
docker compose down

# Restart a specific service
docker compose restart backend

# View logs
docker compose logs -f backend
docker compose logs -f --tail=100 queue

# Check service status
docker compose ps
```

### Laravel Commands

```bash
# Run artisan commands
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:list

# Access Laravel Tinker
docker compose exec backend php artisan tinker

# Run tests
docker compose exec backend php artisan test
```

### Database Management

```bash
# Access MySQL console
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" srms_backend

# Check database connections
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW PROCESSLIST;"

# Database dump
docker compose exec mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" srms_backend > dump.sql
```

### Storage Management

```bash
# Fix storage permissions
docker compose exec backend chown -R www-data:www-data /var/www/html/storage
docker compose exec backend chmod -R 775 /var/www/html/storage

# Clear old logs
docker compose exec backend find storage/logs -name "*.log" -mtime +7 -delete

# List uploaded files
docker compose exec backend ls -lh /var/www/html/storage/app/public/
```

## Monitoring

### Health Checks

```bash
# Check all service health
docker compose ps

# Backend health
docker compose exec backend php artisan --version

# MySQL health
docker compose exec mysql mysqladmin ping -h localhost

# Redis health
docker compose exec redis redis-cli ping

# Queue worker status
docker compose logs --tail=50 queue
```

### Resource Usage

```bash
# Monitor container resources
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Troubleshooting

### 502 Bad Gateway

```bash
# Check backend logs
docker compose logs backend

# Verify PHP-FPM is running
docker compose exec backend ps aux | grep php-fpm

# Restart backend
docker compose restart backend
```

### Database Connection Errors

```bash
# Check MySQL status
docker compose exec mysql mysqladmin ping

# Verify credentials
docker compose exec backend cat .env | grep DB_

# Check MySQL logs
docker compose logs mysql
```

### Queue Not Processing

```bash
# Check queue worker logs
docker compose logs queue

# Verify Redis connection
docker compose exec backend php artisan queue:monitor

# Restart queue worker
docker compose restart queue
```

### SSL Certificate Issues

```bash
# Check certificate expiry
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Manually renew certificate
docker compose run --rm certbot renew

# Check certbot logs
docker compose logs certbot
```

### Storage/Upload Issues

```bash
# Recreate storage link
docker compose exec backend php artisan storage:link

# Fix permissions
docker compose exec backend chown -R www-data:www-data /var/www/html/storage
docker compose exec backend chmod -R 775 /var/www/html/storage

# Check disk space
df -h
```

## Security Best Practices

1. **Change default passwords** - Update all passwords in .env files
2. **Firewall configuration** - Only allow ports 80, 443, and SSH
3. **Regular updates** - Keep Docker images and packages updated
4. **Backup encryption** - Encrypt backup files before remote storage
5. **Log monitoring** - Set up log alerts for errors
6. **SSL certificates** - Verify auto-renewal is working
7. **Environment files** - Never commit .env files to Git

### Firewall Setup

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

## Performance Optimization

### Database Optimization

```bash
# Optimize tables
docker compose exec mysql mysqlcheck -u root -p"$DB_ROOT_PASSWORD" --optimize srms_backend

# Analyze slow queries
docker compose exec mysql mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW FULL PROCESSLIST;"
```

### Laravel Optimization

```bash
# Cache configuration
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache

# OPcache status
docker compose exec backend php -i | grep opcache
```

### Resource Limits

Edit `docker-compose.prod.yml` to adjust resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
```

## Scaling

### Horizontal Scaling

To scale queue workers:

```bash
# Scale queue workers to 3 instances
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale queue=3
```

### Load Balancing

For multiple backend instances, use nginx upstream load balancing:

```nginx
upstream backend {
    least_conn;
    server backend1:9000;
    server backend2:9000;
    server backend3:9000;
}
```

## Maintenance Mode

```bash
# Enable maintenance mode
docker compose exec backend php artisan down --render="errors::503"

# Disable maintenance mode
docker compose exec backend php artisan up
```

## Migration from Development

1. Export development database
2. Update production .env files
3. Build production images
4. Import database
5. Update file paths in database if needed
6. Clear all caches
7. Test all functionality

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review error messages in `storage/logs/laravel.log`
- Verify environment configuration
- Test API endpoints individually

## License

This deployment configuration is part of the SRMS project.
