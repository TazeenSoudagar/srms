# SRMS - Service Request Management System

## Overview

Four-tier service request management system:
1. **srms-backend** — Laravel 12 API + Filament Admin Panel
2. **srms-frontend** — React 19 SPA (internal/admin)
3. **srms-customer** — Next.js 15 App (customer-facing, port 3000)
4. **srms-engineer** — Next.js 15 App (engineer portal, port 3001)

## User Roles
- **Admin (role name: "Admin")** — Full access, user management, admin panel
- **Support Engineer (role name: "Support Engineer")** — Handle assigned requests, update status, Filament access, engineer portal
- **Client (role name: "Client")** — Submit requests, track status, rate services

> **Important**: Always check roles by `$user->role?->name`, never by `role_id` — IDs may change across environments.

## Tech Stack

### Backend
- Laravel 12, PHP 8.2+, Sanctum (OTP passwordless + password), Filament 4.0, PestPHP, Hashids (vinkla/hashids), MySQL/SQLite

### Frontend (srms-frontend)
- React 19, Vite 7, TypeScript strict, Tailwind CSS 4, React Router DOM 7, React Hook Form + Zod, Axios

### Customer App (srms-customer)
- Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, Axios, Sonner

### Engineer App (srms-engineer)
- Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, Axios, Sonner
- Auth token stored in `localStorage` as `engineer_token` / `engineer_user`

## Architecture Patterns

### Backend
- **API Resources** for response transformation
- **Form Requests** for all validation
- **Policies** for authorization — never skip these
- **Hashids** — all external IDs are obfuscated; never expose raw DB IDs
- **Enums** for status/priority: `RequestStatus` (open, in_progress, closed, cancelled), `RequestPriority` (low, medium, high)
- **Scopes** on models: `ServiceRequest::forUser($user)` auto-filters by role
- **ActivityLog** for auditing — call after every state-changing action
- **Jobs** for async tasks (OTP emails via queue): `SendOtpJob`, `SendServiceCompletionOtpJob`
- **Observers** for model lifecycle (e.g., EngineerRatingAggregate updates on rating change)
- **Media model** — polymorphic, uses `collection` field to distinguish types:
  - `collection = 'avatar'` — profile picture (morphOne on User)
  - `collection = 'documents'` — engineer verification documents (morphMany on User)
  - `collection = 'default'` — service request attachments

### Frontend / Customer App / Engineer App
- Feature-based folder structure
- Context API for global state (`AuthContext`)
- Service layer in `lib/api/` abstracts all API calls
- Zod schemas for runtime validation of forms

## Authentication Flows

### OTP Login (passwordless) — Engineers & Customers
1. POST `/api/auth/send-otp` → generates OTP, dispatches email job
   - Engineer gate: blocked if `role = "Support Engineer"` and no documents uploaded
2. POST `/api/auth/verify-otp` → validates OTP, returns Sanctum token + user

### Registration (new customers only — no engineer self-registration)
1. POST `/api/auth/register` → creates User (role="Client", is_active=false), sends OTP
2. POST `/api/auth/verify-registration-otp` → sets email_verified_at
3. POST `/api/auth/set-password` → hashes password, sets is_active=true, returns token

### Password Login
- POST `/api/auth/login-password` → validates credentials + is_active, returns token

### Service Completion OTP
1. Engineer: POST `/api/service-requests/{id}/request-completion` → sends OTP to customer email
2. Customer: POST `/api/service-requests/{id}/verify-completion` → validates OTP → status set to `closed`
- Uses OTP type `service_completion`, separate mail (`ServiceCompletionOtpMail`)

**Dev override**: `ADMIN_BYPASS_OTP=true` returns OTP in response body. Set false in production.

## Key API Routes

All authenticated routes require `Authorization: Bearer {token}`.

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/auth/*` | None | Rate-limited: 5-10 req/min |
| `GET /api/public/*` | None | Categories, services, search |
| `GET /api/dashboard/stats` | Required | Role-aware counts |
| `GET/POST /api/service-requests` | Required | Role-scoped (forUser) |
| `PATCH /api/service-requests/{id}/status` | Required | Engineer/Admin; notifies customer + admin |
| `POST /api/service-requests/{id}/assign` | Admin | Creates ServiceSchedule, notifies customer |
| `POST /api/service-requests/{id}/cancel` | Client | Only if status=open |
| `POST /api/service-requests/{id}/request-completion` | Engineer/Admin | Sends completion OTP to customer |
| `POST /api/service-requests/{id}/verify-completion` | Client | Validates OTP, closes request |
| `GET/POST /api/service-requests/{id}/comments` | Required | Notifies engineer↔customer↔admin |
| `GET/POST /api/service-requests/{id}/media` | Required | Multipart upload |
| `GET/POST /api/schedules` | Required | |
| `GET /api/activity-logs` | Admin | |
| `GET/PUT /api/profile` | Required | Engineers: contact fields read-only from portal |
| `GET/POST/PUT/DELETE /api/users` | Admin | |
| `GET/POST/PUT/DELETE /api/services` | Admin write | Public read |
| `GET /api/notifications` | Required | Paginated, role-scoped |
| `POST /api/notifications/{id}/read` | Required | |
| `POST /api/notifications/read-all` | Required | |

## Notification Rules

| Event | Notified parties |
|-------|-----------------|
| New service request created | Admin |
| Request assigned to engineer | Customer (schedule created), Engineer |
| Status changed | Customer, assigned engineers, admins |
| Request closed/completed | Customer, assigned engineers, admins |
| Customer adds comment | Assigned engineers, admins |
| Engineer/Admin adds comment | Customer; if engineer → also admins |
| Rating submitted | Engineer |

All notifications use `database` channel. Filament panel polls every 30s (`databaseNotificationsPolling`).

## Filament Admin Panel

**URL**: `http://localhost:8000/admin`
**Access**: role "Admin" or "Support Engineer"

Resources: ServiceRequest, Service, User, Category, Rating, ServiceSchedule, ActivityLog
All resources support Excel/CSV export via bulk actions.

**Engineer document upload**: In User edit/create — documents section visible only when role = Support Engineer. Engineers cannot log in without at least one document uploaded here.

## Engineer Portal (srms-engineer)

**URL**: `http://localhost:3001`
**Login**: OTP only — no self-registration. Account created by admin in Filament.
**Login screen**: Role selector — "Support Engineer" (OTP login) or "Customer" (redirects to `:3000`)

Pages:
- `/dashboard` — active requests, upcoming schedules, recently closed
- `/requests` — assigned requests list with status tab filters
- `/requests/[id]` — detail: customer chat (10s poll), mark in-progress, request completion
- `/schedules` — service appointments with status filters
- `/profile` — editable name/bio/availability; email/phone read-only
- `/notifications` — paginated, mark as read

## Coding Standards

### PHP
- PSR-12 (enforced by Laravel Pint: `./vendor/bin/pint`)
- `declare(strict_types=1)` where possible
- Form Requests for validation, Policies for authorization, API Resources for responses
- **Never check roles by ID** — use `$user->role?->name === 'Support Engineer'`

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

# Engineer App
cd srms-engineer && npm install && npm run dev  # http://localhost:3001
```

**Required .env values**:
- `HASHIDS_SALT` — random string, keep consistent across environments
- `ADMIN_BYPASS_OTP=true` — dev only, false in production
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,localhost:3001`
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

# Frontend / Customer App / Engineer App
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
| Engineer login blocked | Admin must upload at least one document for the engineer in Filament |
| Completion OTP not received | Check queue worker is running; OTP type must be `service_completion` |
