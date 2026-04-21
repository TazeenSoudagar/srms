# SRMS Production Deployment Guide

## Architecture Overview

**3 Applications:**
1. **srms-backend** — Laravel 12 API + Filament Admin Panel
2. **srms-customer** — Next.js 15 customer portal
3. **srms-engineer** — Next.js 15 engineer portal

```
┌─────────────────────────────────────────────────────┐
│            On-Premises Server / Cloud VM             │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │        Nginx Reverse Proxy (SSL/TLS)         │  │
│  └────────┬─────────┬─────────┬─────────────────┘  │
│           │         │         │                     │
│  ┌────────▼──┐ ┌────▼───┐ ┌──▼──────┐             │
│  │ Backend   │ │Customer│ │Engineer │             │
│  │ Laravel   │ │ Next.js│ │ Next.js │             │
│  │ + Filament│ │ :3000  │ │ :3001   │             │
│  │ :8000     │ └────────┘ └─────────┘             │
│  └───────┬───┘                                      │
│          │                                          │
│  ┌───────▼─────────┐  ┌──────────────┐            │
│  │ MySQL Container │  │ Redis Cache  │            │
│  │ :3306           │  │ :6379        │            │
│  └─────────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────┘
```

## Domain Strategy

```
https://api.yourdomain.com          → Laravel API + Filament at /admin
https://yourdomain.com              → Next.js customer portal
https://engineer.yourdomain.com     → Next.js engineer portal
```

## Quick Start (Production Deployment)

### Prerequisites
- Ubuntu 22.04+ server (4GB RAM minimum, 8GB recommended)
- Docker & Docker Compose installed
- Domain name with DNS configured
- Root or sudo access

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www/srms
sudo chown $USER:$USER /var/www/srms

# Clone your repository
cd /var/www/srms
git clone <your-repo-url> .
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.production.example .env

# Edit with your actual values
nano .env
```

**Important values to update:**
- `APP_KEY` — Generate with: `openssl rand -base64 32`
- `HASHIDS_SALT` — Generate with: `openssl rand -hex 32`
- `DB_PASSWORD` & `DB_ROOT_PASSWORD` — Strong random passwords
- `MAIL_*` — Your SMTP credentials
- Replace all `yourdomain.com` with your actual domain

### 4. Generate SSL Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt install certbot -y

# Generate certificates (replace yourdomain.com with your domain)
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com \
  -d engineer.yourdomain.com

# Certificates saved to: /etc/letsencrypt/live/yourdomain.com/
```

**Option B: Self-Signed (Development/Testing)**

```bash
mkdir -p docker/certbot/conf/live/DOMAIN_PLACEHOLDER
cd docker/certbot/conf/live/DOMAIN_PLACEHOLDER

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/CN=yourdomain.com"

cp fullchain.pem chain.pem
```

### 5. Update Nginx SSL Paths

```bash
# Edit nginx config to point to your SSL certificates
nano docker/nginx/default.conf

# Replace DOMAIN_PLACEHOLDER with your actual domain name
# Example: yourdomain.com
```

### 6. Build and Deploy

```bash
# Build all Docker images (takes 10-15 minutes first time)
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 7. Initialize Database

```bash
# Run migrations
docker-compose exec backend php artisan migrate --force

# Seed initial data (creates admin user, roles, categories)
docker-compose exec backend php artisan db:seed --force

# Create storage symlink
docker-compose exec backend php artisan storage:link

# Cache configuration
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### 8. Create Admin User (if not seeded)

```bash
docker-compose exec backend php artisan tinker

# Inside Tinker:
$admin = App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@yourdomain.com',
    'password' => bcrypt('SecurePassword123!'),
    'is_active' => true,
    'email_verified_at' => now(),
]);

$adminRole = App\Models\Role::where('name', 'Admin')->first();
$admin->role()->associate($adminRole);
$admin->save();

exit
```

### 9. Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### 10. Verify Deployment

Visit your domains:
- **API**: https://api.yourdomain.com/api
- **Filament Admin**: https://api.yourdomain.com/admin
- **Customer Portal**: https://yourdomain.com
- **Engineer Portal**: https://engineer.yourdomain.com

---

## Local Development (Without Docker)

For local development without Docker, follow the standard Laravel + Next.js setup:

```bash
# Backend
cd srms-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve  # http://localhost:8000

# Customer Portal (in new terminal)
cd srms-customer
npm install
npm run dev  # http://localhost:3000

# Engineer Portal (in new terminal)
cd srms-engineer
npm install
npm run dev  # http://localhost:3001
```

---

## Maintenance Commands

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs customer
docker-compose logs engineer

# Follow logs in real-time
docker-compose logs -f backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart nginx
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations (if any)
docker-compose exec backend php artisan migrate --force

# Clear caches
docker-compose exec backend php artisan optimize
```

### Database Backup

```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} > backup-$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} < backup-20240101.sql
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v
```

---

## Troubleshooting

### CORS Errors

1. Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`
2. Clear Laravel cache: `docker-compose exec backend php artisan config:clear`
3. Restart nginx: `docker-compose restart nginx`

### Database Connection Failed

1. Check MySQL is running: `docker-compose ps mysql`
2. Verify credentials in `.env`
3. Check logs: `docker-compose logs mysql`

### OTP Emails Not Sending

1. Verify SMTP settings in `.env`
2. Check mail logs: `docker-compose logs backend | grep -i mail`
3. Verify queue worker is running in supervisor

### SSL Certificate Errors

```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild specific service
docker-compose build <service-name>
docker-compose up -d <service-name>
```

---

## Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Set `ADMIN_BYPASS_OTP=false` in production
- [ ] Use strong random passwords for database
- [ ] Keep `HASHIDS_SALT` secret and consistent
- [ ] Configure proper SMTP for email delivery
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall (UFW)
- [ ] Set up automated backups
- [ ] Configure proper CORS origins
- [ ] Restrict database access (no external port mapping in production)
- [ ] Set up log rotation
- [ ] Enable fail2ban for brute-force protection

---

## Production Optimization

### Enable OPcache (Already configured in Dockerfile)

Verify: `docker-compose exec backend php -i | grep opcache`

### Database Indexes

```sql
docker-compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE}

CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(notifiable_id, read_at);
```

### Automated Backups

Create `/var/www/srms/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/srms"
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} > $BACKUP_DIR/db_$DATE.sql

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/srms/srms-backend/storage

# Keep last 7 days only
find $BACKUP_DIR -name "db_*" -mtime +7 -delete
find $BACKUP_DIR -name "storage_*" -mtime +7 -delete
```

Schedule with crontab: `0 2 * * * /var/www/srms/backup.sh`

---

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review troubleshooting section above
- Check Laravel logs: `srms-backend/storage/logs/laravel.log`
- Verify environment variables are set correctly
