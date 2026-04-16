# SRMS Docker Deployment Checklist

Use this checklist to ensure a successful production deployment.

## Pre-Deployment

### Server Preparation
- [ ] Ubuntu 20.04+ server provisioned
- [ ] Root or sudo access confirmed
- [ ] Server IP address obtained
- [ ] DNS records configured (A record pointing to server IP)
- [ ] Ports 80 and 443 accessible from internet
- [ ] SSH key-based authentication configured

### Domain Setup
- [ ] Domain name purchased and configured
- [ ] A record: `yourdomain.com` → Server IP
- [ ] A record: `www.yourdomain.com` → Server IP
- [ ] DNS propagation verified (use `dig yourdomain.com`)

### Local Preparation
- [ ] Code committed to Git repository
- [ ] All tests passing locally
- [ ] No sensitive data in repository
- [ ] .gitignore properly configured

## Initial Deployment

### Step 1: Install Docker
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin
sudo usermod -aG docker $USER
```
- [ ] Docker installed and running
- [ ] Docker Compose V2 installed
- [ ] User added to docker group
- [ ] Logged out and back in for group changes

### Step 2: Clone Repository
```bash
sudo mkdir -p /opt/srms
sudo chown $USER:$USER /opt/srms
cd /opt/srms
git clone <repo-url> .
```
- [ ] Repository cloned to /opt/srms
- [ ] Ownership set correctly
- [ ] All files present

### Step 3: Environment Configuration

#### Backend Environment
```bash
cp docker/.env.production.template docker/.env.backend
nano docker/.env.backend
```
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `DOMAIN=yourdomain.com` (your actual domain)
- [ ] `DB_PASSWORD` - strong random password generated
- [ ] `DB_ROOT_PASSWORD` - strong random password generated
- [ ] `HASHIDS_SALT` - random 32-char string generated
- [ ] `SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com`
- [ ] `ADMIN_BYPASS_OTP=false`
- [ ] Mail settings configured (SMTP credentials)
- [ ] `FRONTEND_URL=https://yourdomain.com/app`
- [ ] `CUSTOMER_URL=https://yourdomain.com`

#### Customer Environment
```bash
cp docker/.env.production.template docker/.env.customer
nano docker/.env.customer
```
- [ ] `NEXT_PUBLIC_API_URL=https://yourdomain.com/api`
- [ ] `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
- [ ] `NODE_ENV=production`

#### Laravel .env
```bash
cp srms-backend/.env.example srms-backend/.env
nano srms-backend/.env
```
- [ ] Database credentials match docker/.env.backend
- [ ] Redis host set to `redis`
- [ ] Mail configuration completed
- [ ] All other settings configured

### Step 4: SSL Certificate Setup
```bash
chmod +x docker/scripts/init-letsencrypt.sh
sudo ./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```
- [ ] Script executed successfully
- [ ] Certificates generated in `docker/certbot/conf`
- [ ] No errors in certificate request
- [ ] Nginx configuration updated with domain

### Step 5: Build Docker Images
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```
- [ ] All images built successfully
- [ ] No build errors
- [ ] Image sizes reasonable (~750 MB total)

### Step 6: Database Initialization
```bash
# Start database services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d mysql redis

# Wait 30 seconds
sleep 30

# Generate APP_KEY
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan key:generate

# Update .env.backend with generated key
nano docker/.env.backend
nano srms-backend/.env

# Run migrations
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan migrate --force

# Seed database
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan db:seed --force

# Create storage link
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend php artisan storage:link
```
- [ ] MySQL started and healthy
- [ ] Redis started successfully
- [ ] APP_KEY generated and saved
- [ ] Migrations ran without errors
- [ ] Database seeded successfully
- [ ] Storage link created

### Step 7: Start All Services
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
- [ ] All 7 services started
- [ ] No container crashes
- [ ] All services showing as healthy

### Step 8: Verification

#### Service Health
```bash
docker compose ps
```
- [ ] nginx: Up and healthy
- [ ] backend: Up and healthy
- [ ] queue: Up and running
- [ ] frontend: Up and healthy
- [ ] customer: Up and healthy
- [ ] mysql: Up and healthy
- [ ] redis: Up and healthy

#### API Endpoints
```bash
curl https://yourdomain.com/api/public/categories
curl https://yourdomain.com/api/public/services
```
- [ ] API returns valid JSON responses
- [ ] No SSL errors
- [ ] No 500 errors

#### Web Access
- [ ] Admin panel accessible: `https://yourdomain.com/admin`
- [ ] React frontend accessible: `https://yourdomain.com/app`
- [ ] Customer app accessible: `https://yourdomain.com/`
- [ ] HTTPS working (no browser warnings)
- [ ] HTTP redirects to HTTPS

#### Authentication
- [ ] Admin login works (admin@gmail.com / test1234)
- [ ] OTP email sending works
- [ ] Registration flow works
- [ ] Password reset works

#### File Uploads
- [ ] File upload through Filament works
- [ ] Uploaded files accessible via URL
- [ ] Storage symlink working correctly

#### Logs
```bash
docker compose logs -f backend queue nginx
```
- [ ] No critical errors in logs
- [ ] Queue processing jobs
- [ ] Nginx routing correctly

## Post-Deployment

### Security Hardening
```bash
# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
- [ ] UFW firewall enabled
- [ ] Only necessary ports open
- [ ] SSH access still working

### Backup Setup
```bash
chmod +x docker/scripts/backup.sh
crontab -e
# Add: 0 2 * * * /opt/srms/docker/scripts/backup.sh >> /var/log/srms-backup.log 2>&1
```
- [ ] Backup script executable
- [ ] Cron job configured
- [ ] Backup directory created (`/backup/srms`)
- [ ] Test backup runs successfully

### Monitoring Setup
- [ ] Server monitoring configured (optional)
- [ ] Application logging verified
- [ ] Error notifications configured (optional)
- [ ] SSL certificate expiry monitoring (optional)

### Documentation
- [ ] Admin credentials documented (in password manager)
- [ ] Database credentials documented
- [ ] Server access details documented
- [ ] Deployment notes saved

## Testing

### Functional Testing
- [ ] Create new service request (as customer)
- [ ] Assign request to engineer (as admin)
- [ ] Update request status (as engineer)
- [ ] Add comments to request
- [ ] Upload attachments
- [ ] View activity logs
- [ ] Export data to Excel
- [ ] Search functionality works
- [ ] Notifications working

### Performance Testing
- [ ] Page load times acceptable (<2s)
- [ ] API response times good (<500ms)
- [ ] File uploads working smoothly
- [ ] No memory leaks (check `docker stats`)

### Security Testing
- [ ] SSL Labs grade A or better
- [ ] Security headers present (HSTS, CSP, etc.)
- [ ] No exposed sensitive data
- [ ] CORS configured correctly
- [ ] Rate limiting working

## Troubleshooting

### If Services Won't Start
```bash
# Check logs
docker compose logs backend

# Verify environment
docker compose exec backend cat .env

# Check MySQL
docker compose exec mysql mysqladmin ping

# Restart services
docker compose restart backend
```

### If SSL Fails
```bash
# Check certificate
docker compose exec nginx ls -la /etc/letsencrypt/live/yourdomain.com/

# Re-run init script
sudo ./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com

# Check nginx config
docker compose exec nginx nginx -t
```

### If Database Connection Fails
```bash
# Check MySQL health
docker compose exec mysql mysqladmin ping -h localhost

# Verify credentials
docker compose exec backend cat .env | grep DB_

# Test connection
docker compose exec backend php artisan tinker
>>> DB::connection()->getPdo();
```

## Rollback Plan

If deployment fails:

1. **Stop services:**
   ```bash
   docker compose down
   ```

2. **Restore from backup:**
   ```bash
   gunzip backup-YYYYMMDD.sql.gz
   docker compose up -d mysql
   docker compose exec -T mysql mysql -u root -p srms_backend < backup-YYYYMMDD.sql
   ```

3. **Revert code:**
   ```bash
   git checkout <previous-commit>
   ```

4. **Rebuild and restart:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Post-Launch Monitoring

### Daily Checks
- [ ] All services running (`docker compose ps`)
- [ ] No errors in logs (`docker compose logs --tail=100`)
- [ ] Disk space adequate (`df -h`)
- [ ] Backups completing successfully

### Weekly Checks
- [ ] Review error logs
- [ ] Check resource usage (`docker stats`)
- [ ] Verify SSL certificate validity
- [ ] Test backup restoration

### Monthly Checks
- [ ] Update Docker images
- [ ] Review and optimize database
- [ ] Clean old logs and backups
- [ ] Security updates

## Success Criteria

Deployment is successful when:
- [ ] All services healthy and running
- [ ] HTTPS working with valid certificate
- [ ] Admin panel accessible and functional
- [ ] Customer app accessible and functional
- [ ] API endpoints responding correctly
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] Queue processing jobs
- [ ] Backups configured and working
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Security headers present

## Contact Information

- **Domain Registrar**: _______________
- **DNS Provider**: _______________
- **Server Provider**: _______________
- **Email Service**: _______________
- **Support Contact**: _______________

## Deployment Date

- **Deployed By**: _______________
- **Deployment Date**: _______________
- **Git Commit**: _______________
- **Notes**: _______________
