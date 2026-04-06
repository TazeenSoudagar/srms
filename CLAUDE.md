# SRMS - Service Request Management System

## Overview

Three-tier service request management system:
1. **srms-backend** — Laravel 12 API + Filament Admin Panel
2. **srms-frontend** — React 19 SPA (internal/admin)
3. **srms-customer** — Next.js 15 App (customer-facing)

## User Roles
- **Admin (role_id: 1)** — Full access, user management, admin panel
- **Support Engineer (role_id: 2)** — Handle assigned requests, update status, Filament access
- **Client (role_id: 3)** — Submit requests, track status, rate services

## Tech Stack

### Backend
- Laravel 12, PHP 8.2+, Sanctum (OTP passwordless + password), Filament 4.0, PestPHP, Hashids (vinkla/hashids), MySQL/SQLite

### Frontend (srms-frontend)
- React 19, Vite 7, TypeScript strict, Tailwind CSS 4, React Router DOM 7, React Hook Form + Zod, Axios

### Customer App (srms-customer)
- Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, Axios, Sonner

## Architecture Patterns

### Backend
- **API Resources** for response transformation
- **Form Requests** for all validation
- **Policies** for authorization — never skip these
- **Hashids** — all external IDs are obfuscated; never expose raw DB IDs
- **Enums** for status/priority: `RequestStatus` (open, in_progress, closed, cancelled), `RequestPriority` (low, medium, high)
- **Scopes** on models: `ServiceRequest::forUser($user)` auto-filters by role
- **ActivityLog::log()** for auditing — call after every state-changing action
- **Jobs** for async tasks (OTP emails via queue)
- **Observers** for model lifecycle (e.g., EngineerRatingAggregate updates on rating change)

### Frontend / Customer App
- Feature-based folder structure
- Context API for global state (AuthContext, NotificationContext)
- Service layer abstracts all API calls
- Zod schemas for runtime validation of forms

## Authentication Flows

### OTP Login (passwordless)
1. POST `/api/auth/send-otp` → generates OTP, dispatches email job
2. POST `/api/auth/verify-otp` → validates OTP, returns Sanctum token + user

### Registration (new customers)
1. POST `/api/auth/register` → creates User (role_id=3, is_active=false), sends OTP
2. POST `/api/auth/verify-registration-otp` → sets email_verified_at
3. POST `/api/auth/set-password` → hashes password, sets is_active=true, returns token

### Password Login
- POST `/api/auth/login-password` → validates credentials + is_active, returns token

**Dev override**: `ADMIN_BYPASS_OTP=true` returns OTP in response body. Set false in production.

## Key API Routes

All authenticated routes require `Authorization: Bearer {token}`.

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/auth/*` | None | Rate-limited: 5-10 req/min |
| `GET /api/public/*` | None | Categories, services, search |
| `GET /api/dashboard/stats` | Required | Role-aware counts |
| `GET/POST /api/service-requests` | Required | Role-scoped (forUser) |
| `PATCH /api/service-requests/{id}/status` | Required | Engineer/Admin |
| `POST /api/service-requests/{id}/assign` | Admin | Sets assigned_to |
| `POST /api/service-requests/{id}/cancel` | Client | Only if status=open |
| `GET/POST /api/service-requests/{id}/comments` | Required | Polymorphic |
| `GET/POST /api/service-requests/{id}/media` | Required | Multipart upload |
| `GET/POST /api/schedules` | Required | |
| `GET /api/activity-logs` | Admin | |
| `GET/PUT /api/profile` | Required | |
| `GET/POST/PUT/DELETE /api/users` | Admin | |
| `GET/POST/PUT/DELETE /api/services` | Admin write | Public read |

## Filament Admin Panel

**URL**: `http://localhost:8000/admin`  
**Access**: role_id = 1 (Admin) or role_id = 2 (Support Engineer)

Resources: ServiceRequest, Service, User, Category, Rating, ServiceSchedule, ActivityLog  
All resources support Excel/CSV export via bulk actions.

## Coding Standards

### PHP
- PSR-12 (enforced by Laravel Pint: `./vendor/bin/pint`)
- `declare(strict_types=1)` where possible
- Form Requests for validation, Policies for authorization, API Resources for responses

### TypeScript
- Strict mode, explicit type annotations, Zod schemas for form validation
- Functional components with custom hooks

## Development Setup

```bash
# Backend
cd srms-backend && composer install
cp .env.example .env && php artisan key:generate
php artisan migrate && php artisan db:seed
php artisan storage:link
php artisan serve  # http://localhost:8000

# Frontend
cd srms-frontend && npm install && npm run dev  # http://localhost:5173

# Customer App
cd srms-customer && npm install && npm run dev  # http://localhost:3000
```

**Required .env values**:
- `HASHIDS_SALT` — random string, keep consistent across environments
- `ADMIN_BYPASS_OTP=true` — dev only, false in production
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000`
- `QUEUE_CONNECTION=database` — run `php artisan queue:work` for OTP emails

## Common Commands

```bash
# Backend
php artisan test
php artisan test --filter=ServiceRequestTest
php artisan migrate:fresh --seed
php artisan optimize:clear
php artisan route:list --path=api
./vendor/bin/pint

# Frontend / Customer App
npm run dev
npm run build
npx tsc --noEmit
npm run lint
```

## Common Issues

| Issue | Fix |
|-------|-----|
| CORS errors | Add origin to `SANCTUM_STATEFUL_DOMAINS`, update `config/cors.php`, `php artisan config:clear` |
| 401 Unauthorized | Check Bearer token header, `is_active=true`, Sanctum middleware on route |
| Hashids decode fails | Verify `HASHIDS_SALT` set, config cache cleared, correct model connection |
| OTP not received | Check mail config, run queue worker, check `failed_jobs` table |
| File upload fails | Run `php artisan storage:link`, check `php.ini` upload limits |
