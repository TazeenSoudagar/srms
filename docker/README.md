# SRMS Docker Configuration

Production-ready Docker deployment for SRMS monorepo with optimized multi-stage builds.

## Directory Structure

```
docker/
├── backend/
│   ├── Dockerfile           # Laravel multi-stage build
│   ├── nginx.conf           # PHP-FPM nginx config
│   ├── php.ini              # Production PHP settings
│   ├── supervisord.conf     # Process manager config
│   └── entrypoint.sh        # Container initialization
├── frontend/
│   ├── Dockerfile           # React build → static nginx
│   └── nginx.conf           # SPA routing configuration
├── customer/
│   └── Dockerfile           # Next.js standalone build
├── nginx/
│   ├── default.conf         # Reverse proxy routing
│   └── ssl.conf             # SSL/TLS configuration
├── scripts/
│   ├── init-letsencrypt.sh  # SSL certificate setup
│   ├── deploy.sh            # Automated deployment
│   └── backup.sh            # Backup automation
├── certbot/                 # Let's Encrypt certificates
│   ├── conf/                # Certificate storage
│   └── www/                 # ACME challenge files
└── .env.production.template # Environment template

```

## Image Sizes (Optimized)

- **Backend**: ~80-100 MB (Alpine + PHP-FPM + extensions)
- **Frontend**: ~25-30 MB (Alpine + Nginx + static files)
- **Customer**: ~150-200 MB (Alpine + Node runtime + Next.js)
- **Total Stack**: ~750 MB (vs 2+ GB typical setups)

## Quick Commands

### Production

```bash
# Build all images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f backend queue

# Stop all services
docker compose down
```

### Development

```bash
# Start with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Logs
docker compose logs -f frontend customer
```

## Configuration Files

### docker-compose.yml (Base)
- Service definitions
- Network configuration
- Volume mounts
- Health checks

### docker-compose.prod.yml (Production Overrides)
- Restart policies
- Resource limits
- Logging configuration
- Security hardening

### docker-compose.dev.yml (Development Overrides)
- Hot reload volumes
- Port exposure
- Debug environment
- Development commands

## Services

### nginx (Reverse Proxy)
- Routes traffic to backend/frontend/customer
- SSL termination with Let's Encrypt
- Security headers (HSTS, CSP, etc.)
- Gzip compression

### backend (Laravel API)
- PHP 8.2 FPM + Nginx
- Composer dependencies
- Vite assets
- OPcache enabled
- Redis session driver

### queue (Background Jobs)
- Uses same backend image
- Runs `php artisan queue:work`
- Processes OTP emails
- Auto-restart on failure

### frontend (React SPA)
- Static files served by Nginx
- SPA routing fallback
- Gzip compression
- Asset caching

### customer (Next.js App)
- Node.js runtime
- Standalone output mode
- SSR support
- Health check endpoint

### mysql (Database)
- MySQL 8.0 official image
- Persistent volume
- Health checks
- Backup friendly

### redis (Cache/Queue)
- Redis 7 Alpine
- AOF persistence
- Used for cache, sessions, queue

### certbot (SSL Renewal)
- Automatic certificate renewal
- Runs every 12 hours
- Nginx reload on success

## Environment Variables

See `docker/.env.production.template` for required variables:

**Critical Settings:**
- `APP_KEY` - Laravel encryption key
- `DB_PASSWORD` - Database password
- `HASHIDS_SALT` - ID obfuscation salt
- `DOMAIN` - Your domain name
- `SANCTUM_STATEFUL_DOMAINS` - CORS domains

**Generate Secrets:**
```bash
# APP_KEY
docker compose run --rm backend php artisan key:generate --show

# Strong passwords
openssl rand -base64 32

# HASHIDS_SALT
openssl rand -base64 32
```

## Networking

All services communicate via `srms_network` bridge network:

- **External Access**: nginx:80, nginx:443
- **Internal Communication**:
  - backend:9000 (PHP-FPM)
  - frontend:80 (static files)
  - customer:3000 (Next.js)
  - mysql:3306
  - redis:6379

## Volumes

**Persistent Volumes:**
- `mysql_data` - Database files
- `redis_data` - Redis AOF/RDB
- `nginx_logs` - Access/error logs

**Bind Mounts:**
- `srms-backend/storage` - File uploads
- `srms-backend/.env` - Laravel config
- `docker/certbot/conf` - SSL certificates

## Health Checks

All services include health checks:

```bash
# View health status
docker compose ps

# Check specific service
docker inspect srms-backend --format='{{.State.Health.Status}}'
```

## Scripts

### init-letsencrypt.sh
Generates SSL certificates for production:
```bash
./docker/scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

### deploy.sh
Automated deployment with zero downtime:
```bash
./docker/scripts/deploy.sh [--skip-backup] [--skip-build]
```

### backup.sh
Database and storage backup:
```bash
./docker/scripts/backup.sh
```

## Security Features

1. **Non-root Users**: All containers run as non-root
2. **Internal Networking**: Services not exposed externally
3. **SSL/TLS**: Let's Encrypt with auto-renewal
4. **Security Headers**: HSTS, CSP, X-Frame-Options
5. **Resource Limits**: CPU/memory constraints
6. **Log Rotation**: JSON file driver with size limits
7. **Read-only Mounts**: .env files mounted as read-only

## Troubleshooting

### Build Failures

```bash
# Clear build cache
docker compose build --no-cache

# Check Docker disk space
docker system df

# Prune unused resources
docker system prune -a
```

### Container Crashes

```bash
# Check logs
docker compose logs backend

# Inspect container
docker inspect srms-backend

# Check resource usage
docker stats
```

### Permission Issues

```bash
# Fix storage permissions
docker compose exec backend chown -R www-data:www-data /var/www/html/storage
docker compose exec backend chmod -R 775 /var/www/html/storage
```

## Performance Tuning

### OPcache Settings (php.ini)
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

### Resource Limits (docker-compose.prod.yml)
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
```

### Database Optimization
```bash
# Optimize tables
docker compose exec mysql mysqlcheck --optimize srms_backend
```

## Monitoring

### Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df -v
```

## Maintenance

### Update Images
```bash
# Pull latest base images
docker compose pull

# Rebuild with new base images
docker compose build --pull
```

### Clean Up
```bash
# Remove stopped containers
docker compose down

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ Yes | ❌ No |
| Source Mounts | ✅ Yes | ❌ No |
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Resource Limits | ❌ No | ✅ Yes |
| Restart Policy | No | Always |
| Logging | Console | JSON File |
| Port Exposure | All | Nginx only |
| SSL | Optional | Required |

## Support

For detailed deployment instructions, see `DOCKER_DEPLOYMENT.md` in the root directory.
