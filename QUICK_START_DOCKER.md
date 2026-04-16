# SRMS Docker Quick Start Guide

Get SRMS running in production with Docker in under 30 minutes.

## Prerequisites

- Ubuntu 20.04+ server
- Domain name pointed to server IP
- Ports 80 and 443 open

## One-Command Setup (Copy & Paste)

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && \
sudo apt install -y docker-compose-plugin && \
sudo usermod -aG docker $USER && \
newgrp docker

# Verify installation
docker --version && docker compose version
```

## Clone and Configure

```bash
# Clone repository
sudo mkdir -p /opt/srms && \
sudo chown $USER:$USER /opt/srms && \
cd /opt/srms && \
git clone https://github.com/YOUR_USERNAME/srms.git . || git clone YOUR_REPO_URL .

# Configure backend environment
cp docker/.env.production.template docker/.env.backend && \
nano docker/.env.backend
```

**Edit these values in `docker/.env.backend`:**
```bash
DOMAIN=yourdomain.com
DB_PASSWORD=$(openssl rand -base64 32)           # Copy generated password
DB_ROOT_PASSWORD=$(openssl rand -base64 32)     # Copy generated password
HASHIDS_SALT=$(openssl rand -base64 32)         # Copy generated string
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
ADMIN_BYPASS_OTP=false
```

**Configure customer environment:**
```bash
cp docker/.env.production.template docker/.env.customer && \
nano docker/.env.customer
```

**Edit these values in `docker/.env.customer`:**
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Configure Laravel environment:**
```bash
cp srms-backend/.env.example srms-backend/.env && \
nano srms-backend/.env
```

**Match database credentials from `docker/.env.backend`**

## Generate SSL Certificates

```bash
chmod +x docker/scripts/*.sh && \
sudo ./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

Wait for certificate generation to complete (~2 minutes).

## Build and Deploy

```bash
# Build images (15-20 minutes first time)
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start database services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d mysql redis && \
sleep 30

# Generate application key
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan key:generate

# Copy the generated key and update both .env files:
# - srms-backend/.env
# - docker/.env.backend

# Run database migrations and seeds
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan migrate --force && \
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan db:seed --force && \
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan storage:link

# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Verify Deployment

```bash
# Check all services are running
docker compose ps

# Test API
curl https://yourdomain.com/api/public/categories

# Check logs
docker compose logs -f backend queue nginx
```

## Access Your Application

- **Admin Panel**: https://yourdomain.com/admin
  - Email: admin@gmail.com
  - Password: test1234

- **React Frontend**: https://yourdomain.com/app
- **Customer App**: https://yourdomain.com/

## Configure Automated Backups

```bash
# Add daily backup to crontab
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /opt/srms/docker/scripts/backup.sh >> /var/log/srms-backup.log 2>&1
```

## Configure Firewall

```bash
sudo ufw allow ssh && \
sudo ufw allow 80/tcp && \
sudo ufw allow 443/tcp && \
sudo ufw --force enable
```

## Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

### Restart Service
```bash
docker compose restart backend
```

### Run Laravel Commands
```bash
# Artisan
docker compose exec backend php artisan migrate

# Tinker
docker compose exec backend php artisan tinker
```

### Database Backup
```bash
docker compose exec mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" srms_backend > backup.sql
```

### Update Application
```bash
cd /opt/srms && \
./docker/scripts/deploy.sh
```

## Troubleshooting

### 502 Bad Gateway
```bash
docker compose logs backend
docker compose restart backend
```

### Database Connection Error
```bash
docker compose exec mysql mysqladmin ping
docker compose logs mysql
```

### SSL Certificate Error
```bash
sudo ./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

### Queue Not Processing
```bash
docker compose logs queue
docker compose restart queue
```

## Performance Check

```bash
# Resource usage
docker stats

# Service health
docker compose ps
```

## Next Steps

1. Change admin password in the admin panel
2. Configure SMTP for email notifications (in `.env` files)
3. Set up monitoring (optional)
4. Test all functionality
5. Document your credentials securely

## Need Help?

- **Full Guide**: See `DOCKER_DEPLOYMENT.md`
- **Checklist**: See `docker/DEPLOYMENT_CHECKLIST.md`
- **Configuration**: See `docker/README.md`
- **Logs**: `docker compose logs -f`

## Success Checklist

- [ ] All services showing as "Up" and "healthy"
- [ ] HTTPS working (no browser warnings)
- [ ] Admin panel accessible
- [ ] Customer app accessible
- [ ] API returning valid JSON
- [ ] File uploads working
- [ ] Backups configured
- [ ] Firewall enabled
- [ ] Admin password changed

---

**Deployment Time**: ~30-40 minutes
**Stack Size**: ~750 MB
**Services**: 7 (nginx, backend, queue, frontend, customer, mysql, redis)
