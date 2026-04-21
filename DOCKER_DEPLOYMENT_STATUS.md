# Docker Deployment Setup - Status & Next Steps

**Date:** 2024-04-21
**Status:** Ready for local testing
**Current Branch:** dev

---

## What Has Been Completed

### ✅ 1. Docker Configuration Created

**Architecture: 3 Applications**
- `srms-backend` → Laravel 12 API + Filament Admin Panel (port 8000)
- `srms-customer` → Next.js 15 customer portal (port 3000)
- `srms-engineer` → Next.js 15 engineer portal (port 3001)

**Files Created/Updated:**

1. **`docker-compose.yml`** - Updated for 3-app setup
   - Removed `frontend` service (React admin not used)
   - Removed separate `queue` service (now runs in backend via supervisor)
   - Added `engineer` service
   - Services: mysql, redis, backend, customer, engineer, nginx, certbot

2. **`docker/engineer/Dockerfile`** - New file
   - Next.js 15 standalone build
   - Runs on port 3001
   - Multi-stage build for optimization

3. **`docker/nginx/default.conf`** - Completely rewritten
   - 3 separate HTTPS server blocks:
     - `api.yourdomain.com` → Backend API + Filament
     - `yourdomain.com` → Customer portal
     - `engineer.yourdomain.com` → Engineer portal
   - Proper CORS headers for Sanctum
   - SSL/TLS configuration
   - Static asset caching
   - WebSocket support for Next.js

4. **`srms-engineer/next.config.ts`** - Updated
   - Added `output: 'standalone'` for Docker deployment

5. **`.env.local`** - Local development environment
   - Pre-configured for Docker with localhost domains
   - Database credentials set
   - ADMIN_BYPASS_OTP=true for local testing
   - MAIL_MAILER=log for local email testing

6. **`srms-backend/.env`** - Backend environment
   - Copied from `.env.local`
   - APP_KEY generated: `base64:faAbuTZZT9qbCGuKKbpGClLEXp7aa8HPLfMhrCVvVus=`

7. **`.env.production.example`** - Production template
   - Complete production environment template
   - Includes all required variables
   - Security settings for production

8. **`DEPLOYMENT.md`** - Production deployment guide
   - Complete step-by-step production deployment
   - SSL certificate setup (Let's Encrypt)
   - Server configuration
   - Troubleshooting guide
   - Security best practices

9. **`LOCAL_TESTING.md`** - Local testing guide
   - Step-by-step local Docker testing
   - Troubleshooting tips
   - Useful commands
   - Default credentials

### ✅ 2. Docker Images Built

All three application images have been successfully built:
- ✅ Backend (Laravel + Filament + PHP-FPM + Supervisor)
- ✅ Customer (Next.js standalone)
- ✅ Engineer (Next.js standalone)

Build completed with exit code 0 (success).

---

## What Needs to Be Done Next

### Step 1: Start Docker Desktop
1. Restart your laptop
2. Start Docker Desktop
3. Wait for it to fully start (green whale icon in system tray)
4. Verify: `docker ps` in terminal

### Step 2: Start Services

```bash
cd D:\Learning\srms

# Start all services
docker-compose up -d

# Check status (should see 7 containers)
docker-compose ps
```

Expected containers:
- srms-mysql (port 3306)
- srms-redis (port 6379)
- srms-backend (internal)
- srms-customer (internal)
- srms-engineer (internal)
- srms-nginx (ports 80, 443)
- srms-certbot (for SSL renewal)

### Step 3: Initialize Database

```bash
# Wait for MySQL to be ready
timeout /t 30

# Run migrations
docker-compose exec backend php artisan migrate --force

# Seed database (creates admin, roles, categories)
docker-compose exec backend php artisan db:seed --force

# Setup storage and caching
docker-compose exec backend php artisan storage:link
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### Step 4: Add Hosts Entries

Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator):

```
127.0.0.1 api.localhost
127.0.0.1 engineer.localhost
```

### Step 5: Test Applications

Open browser and test:

1. **Customer Portal**: http://localhost
   - Should show Next.js customer landing page

2. **Backend API**: http://localhost/api/public/categories
   - Should return JSON (empty array or categories list)

3. **Filament Admin**: http://localhost/admin
   - Login: admin@localhost.com / password123
   - Should show Filament dashboard

4. **Engineer Portal**: http://engineer.localhost
   - Should show Next.js engineer login page

---

## Domain Strategy

### Local Testing
```
http://localhost              → Customer portal
http://localhost/api          → Backend API
http://localhost/admin        → Filament admin panel
http://engineer.localhost     → Engineer portal
```

### Production
```
https://yourdomain.com              → Customer portal
https://api.yourdomain.com/api      → Backend API
https://api.yourdomain.com/admin    → Filament admin panel
https://engineer.yourdomain.com     → Engineer portal
```

---

## Environment Configuration

### Local (.env.local)
- `APP_DEBUG=true`
- `ADMIN_BYPASS_OTP=true` (OTPs shown in logs)
- `MAIL_MAILER=log` (emails logged, not sent)
- Database: srms_backend / srms_user / local_password_123

### Production (.env.production.example)
- `APP_DEBUG=false`
- `ADMIN_BYPASS_OTP=false` (require real OTPs)
- `MAIL_MAILER=smtp` (real SMTP required)
- Strong random passwords
- SSL certificates required
- Update all `yourdomain.com` references

---

## Troubleshooting Quick Reference

### Containers won't start
```bash
docker-compose logs <service-name>
docker-compose restart <service-name>
```

### Database connection error
```bash
docker-compose logs mysql
docker-compose restart mysql
# Wait 30 seconds, then retry migrations
```

### Nginx 502 Bad Gateway
```bash
docker-compose logs backend
docker-compose restart backend nginx
```

### Port conflicts
- Check if ports 80, 443, 3306, 6379 are in use
- Stop IIS, XAMPP, WAMP, or other web servers
- Or change ports in docker-compose.yml

### See all logs
```bash
docker-compose logs -f
```

---

## Useful Commands

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f customer
docker-compose logs -f engineer
docker-compose logs mysql
```

### Restart Services
```bash
docker-compose restart
docker-compose restart backend
docker-compose restart nginx
```

### Access Containers
```bash
docker-compose exec backend sh
docker-compose exec backend php artisan tinker
docker-compose exec mysql mysql -u root -proot_password_123
docker-compose exec redis redis-cli
```

### Stop Everything
```bash
docker-compose down          # Stop (keep data)
docker-compose down -v       # Stop and delete data
```

### Rebuild After Changes
```bash
docker-compose build backend
docker-compose up -d backend
docker-compose exec backend php artisan config:clear
```

---

## Default Credentials

**Admin User (created by seeder):**
- Email: admin@localhost.com
- Password: password123

**Database:**
- Database: srms_backend
- Username: srms_user
- Password: local_password_123
- Root Password: root_password_123

**OTP Bypass:**
- Enabled locally (ADMIN_BYPASS_OTP=true)
- OTPs appear in: `docker-compose logs backend`

---

## File Structure Reference

```
srms/
├── docker-compose.yml                    # Main orchestration file
├── .env                                  # Root environment (copied from .env.local)
├── .env.local                            # Local dev environment
├── .env.production.example               # Production template
├── DEPLOYMENT.md                         # Production deployment guide
├── LOCAL_TESTING.md                      # Local testing guide
├── DOCKER_DEPLOYMENT_STATUS.md           # This file
│
├── docker/
│   ├── backend/
│   │   ├── Dockerfile                    # Laravel + PHP-FPM + Supervisor
│   │   ├── entrypoint.sh                 # Startup script
│   │   ├── supervisord.conf              # Queue worker config
│   │   ├── nginx.conf                    # Internal nginx config
│   │   └── php.ini                       # PHP configuration
│   │
│   ├── customer/
│   │   └── Dockerfile                    # Next.js standalone build
│   │
│   ├── engineer/
│   │   └── Dockerfile                    # Next.js standalone build (NEW)
│   │
│   └── nginx/
│       ├── default.conf                  # Reverse proxy config (UPDATED)
│       └── ssl.conf                      # SSL/TLS settings
│
├── srms-backend/
│   ├── .env                              # Backend environment (configured)
│   └── ...
│
├── srms-customer/
│   ├── next.config.ts                    # Standalone mode enabled
│   └── ...
│
└── srms-engineer/
    ├── next.config.ts                    # Standalone mode enabled (UPDATED)
    └── ...
```

---

## Production Deployment Checklist

When ready to deploy to production:

- [ ] Update `.env.production.example` with actual domain names
- [ ] Generate strong random passwords
- [ ] Set `APP_DEBUG=false`
- [ ] Set `ADMIN_BYPASS_OTP=false`
- [ ] Configure real SMTP mail server
- [ ] Set up DNS A records for all domains
- [ ] Generate SSL certificates (Let's Encrypt)
- [ ] Update nginx SSL certificate paths
- [ ] Review security settings
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Test all authentication flows
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Monitor logs for errors

See `DEPLOYMENT.md` for complete production deployment guide.

---

## Next Session - Tell Claude:

> "I need to continue setting up the Docker deployment for SRMS. I've restarted my laptop and Docker Desktop is now running. The Docker images have been built (backend, customer, engineer). Please help me start the services and test the local deployment. Reference DOCKER_DEPLOYMENT_STATUS.md for context."

Then Claude can continue from Step 2 (Start Services) above.

---

## Quick Start After Restart

```bash
# 1. Verify Docker is running
docker ps

# 2. Navigate to project
cd D:\Learning\srms

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Initialize database
docker-compose exec backend php artisan migrate --seed --force
docker-compose exec backend php artisan storage:link
docker-compose exec backend php artisan config:cache

# 6. Test in browser
# http://localhost
# http://localhost/admin
# http://engineer.localhost
```

---

## Support Files

- **Complete guides**: `DEPLOYMENT.md`, `LOCAL_TESTING.md`
- **Environment templates**: `.env.local`, `.env.production.example`
- **Architecture reference**: See "What Has Been Completed" section above
- **Laravel docs**: `CLAUDE.md` (project instructions)

---

**Status**: ✅ Ready to start services and test locally
**Next Action**: Start Docker Desktop → Run services → Test applications
