# Local Docker Testing Guide

## Prerequisites

1. **Start Docker Desktop** - Make sure Docker Desktop is running (check system tray)
2. **Check Docker is working:**
   ```bash
   docker --version
   docker ps
   ```

---

## Step 1: Environment Setup

I've already created the environment files for you:
- ✅ `.env.local` - Local environment template
- ✅ `srms-backend/.env` - Backend environment with generated APP_KEY
- ✅ `.env` - Root environment for docker-compose

**Verify APP_KEY is set:**
```bash
cat srms-backend/.env | grep APP_KEY
# Should show: APP_KEY=base64:faAbuTZZT9qbCGuKKbpGClLEXp7aa8HPLfMhrCVvVus=
```

---

## Step 2: Update Nginx for Local Testing

The nginx config already supports localhost domains:
- `api.localhost` → Backend API
- `localhost` → Customer portal
- `engineer.localhost` → Engineer portal

**Add to your hosts file** (C:\Windows\System32\drivers\etc\hosts):
```
127.0.0.1 api.localhost
127.0.0.1 engineer.localhost
```

---

## Step 3: Build Docker Images

I've already built these for you, but if you need to rebuild:

```bash
cd D:\Learning\srms

# Build all services
docker-compose build

# Or build individually
docker-compose build backend
docker-compose build customer
docker-compose build engineer
```

---

## Step 4: Start All Services

```bash
cd D:\Learning\srms

# Start all services in detached mode
docker-compose up -d

# Check status
docker-compose ps

# You should see:
# - srms-mysql       (Up)
# - srms-redis       (Up)
# - srms-backend     (Up)
# - srms-customer    (Up)
# - srms-engineer    (Up)
# - srms-nginx       (Up)
# - srms-certbot     (Up)
```

---

## Step 5: Initialize Database

```bash
# Wait for MySQL to be ready (30 seconds)
sleep 30

# Run migrations
docker-compose exec backend php artisan migrate --force

# Seed database (creates admin user, roles, categories)
docker-compose exec backend php artisan db:seed --force

# Create storage symlink
docker-compose exec backend php artisan storage:link

# Cache configuration
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

---

## Step 6: Create Admin User (Manual)

If seeding didn't create an admin user:

```bash
docker-compose exec backend php artisan tinker

# Inside Tinker (paste all lines):
$admin = App\Models\User::create(['name' => 'Admin User', 'email' => 'admin@localhost.com', 'password' => bcrypt('password123'), 'is_active' => true, 'email_verified_at' => now()]);
$adminRole = App\Models\Role::where('name', 'Admin')->first();
$admin->role()->associate($adminRole);
$admin->save();
echo "Admin created: admin@localhost.com / password123\n";
exit
```

---

## Step 7: Test Applications

Open your browser and visit:

### 1. **Backend API**
- URL: http://localhost/api
- Test: http://localhost/api/public/categories
- Should return: JSON response (empty array or categories)

### 2. **Filament Admin Panel**
- URL: http://localhost/admin
- Login: admin@localhost.com / password123
- Should see: Filament dashboard

### 3. **Customer Portal**
- URL: http://localhost
- Should see: Next.js customer landing page

### 4. **Engineer Portal**
- URL: http://engineer.localhost
- Should see: Next.js engineer portal login page

---

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs mysql
docker-compose logs customer
docker-compose logs engineer

# Restart specific service
docker-compose restart backend
```

### Database connection error

```bash
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql

# Wait 30 seconds then retry migrations
sleep 30
docker-compose exec backend php artisan migrate --force
```

### Port conflicts

If ports 80, 443, 3306, 6379 are already in use:

```bash
# Stop conflicting services
# On Windows: Stop IIS, XAMPP, WAMP, etc.

# Or edit docker-compose.yml ports:
# Change "80:80" to "8080:80"
# Then access at http://localhost:8080
```

### "Cannot connect to Docker daemon"

1. Open Docker Desktop
2. Wait for it to fully start (whale icon in system tray)
3. Run: `docker ps` to verify it's working

### Nginx shows 502 Bad Gateway

```bash
# Backend might not be ready yet
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Wait 30 seconds then reload browser
```

### Next.js build fails

```bash
# Check Node.js memory
# Rebuild with more memory:
docker-compose build --no-cache customer
docker-compose build --no-cache engineer

# Or check logs:
docker-compose logs customer
docker-compose logs engineer
```

---

## Useful Commands

### View Logs

```bash
# All services
docker-compose logs

# Specific service (follow mode)
docker-compose logs -f backend
docker-compose logs -f customer

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific
docker-compose restart nginx
docker-compose restart backend
```

### Access Containers

```bash
# Backend shell
docker-compose exec backend sh

# MySQL shell
docker-compose exec mysql mysql -u root -p
# Password: root_password_123

# Redis shell
docker-compose exec redis redis-cli
```

### Stop Everything

```bash
# Stop (keeps data)
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v
```

### Rebuild and Restart

```bash
# After code changes
docker-compose build backend
docker-compose up -d backend

# Clear Laravel caches
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan view:clear
```

---

## Default Credentials

**Admin User (after seeding):**
- Email: admin@localhost.com
- Password: password123

**Database:**
- Host: mysql
- Database: srms_backend
- Username: srms_user
- Password: local_password_123
- Root Password: root_password_123

**OTP Bypass:**
- Enabled for local development
- OTPs are logged to: docker-compose logs backend

---

## Next Steps After Testing

1. **Test Authentication**
   - Register as customer at http://localhost
   - Login to Filament at http://localhost/admin
   - Create engineer user in Filament
   - Test engineer login at http://engineer.localhost

2. **Test Service Requests**
   - Create service request as customer
   - Assign to engineer in Filament
   - Update status as engineer
   - Add comments from both sides

3. **Check Logs**
   - Laravel logs: `docker-compose exec backend tail -f storage/logs/laravel.log`
   - Nginx logs: `docker-compose logs -f nginx`
   - Database queries: Check Laravel log

4. **Performance Check**
   - Check loading times
   - Verify caching works (Redis)
   - Test file uploads

---

## When Everything Works

Once local testing is successful, you can:

1. **Commit Docker files**
   ```bash
   git add docker/ docker-compose.yml .env.production.example
   git commit -m "Add Docker deployment configuration"
   ```

2. **Prepare for production** - Follow DEPLOYMENT.md

3. **Set up CI/CD** - Add GitHub Actions workflow

---

## Clean Slate

To start completely fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d

# Re-initialize database
docker-compose exec backend php artisan migrate:fresh --seed --force
```
