# SRMS - Service Request Management System

## Project Overview

SRMS is a service request management system for tracking and managing client service requests. It enables clients to submit service requests, support engineers to handle them, and administrators to oversee the entire process.

### User Roles
- **Admin**: Full system access, user management, service configuration
- **Support Engineer**: Handle assigned service requests, add comments, update status
- **Client**: Submit service requests, track status, add comments

## Tech Stack

### Backend (`srms-backend/`)
- **Framework**: Laravel 12
- **PHP Version**: 8.2+
- **Authentication**: Laravel Sanctum (OTP-based, passwordless)
- **Admin Panel**: Filament 4.0
- **Testing**: PestPHP
- **ID Obfuscation**: Hashids (vinkla/hashids)
- **Database**: MySQL/SQLite

### Frontend (`srms-frontend/`)
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

## Project Structure

```
srms/
├── srms-backend/           # Laravel API backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/           # API controllers
│   │   │   │   └── Auth/          # Auth controllers
│   │   │   └── Requests/          # Form requests
│   │   ├── Models/                # Eloquent models
│   │   ├── Policies/              # Authorization policies
│   │   └── Filament/              # Admin panel resources
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php               # API routes
│   │   └── web.php               # Web routes (Filament)
│   └── tests/
│       ├── Feature/
│       └── Unit/
│
├── srms-frontend/          # React SPA frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components (Button, Input, Badge)
│   │   │   ├── layout/           # Layout components (Header, Sidebar, Layout)
│   │   │   └── ui/               # UI feedback (Loading, Error, Success)
│   │   ├── contexts/             # React contexts (AuthContext)
│   │   ├── features/             # Feature modules
│   │   │   ├── auth/             # Login/authentication
│   │   │   ├── comments/         # Comment management
│   │   │   ├── media/            # File attachments
│   │   │   ├── serviceRequests/  # Service request CRUD
│   │   │   └── users/            # User management
│   │   ├── routes/               # Routing configuration
│   │   ├── services/             # API service layer
│   │   └── utils/                # Utility functions
│   └── public/
│
└── docs/                   # Project documentation
```

## Architecture Patterns

### Backend
- **API Resources**: RESTful API with Laravel API Resources for response transformation
- **Form Requests**: Validation logic in dedicated request classes
- **Policies**: Authorization through Laravel Policies
- **Hashids**: All external IDs are obfuscated using Hashids
- **OTP Auth**: Passwordless authentication via OTP (phone/email)

### Frontend
- **Feature-based structure**: Code organized by feature/domain
- **Context API**: Global state management via React Context
- **Service layer**: API calls abstracted in service modules
- **Component composition**: Common + UI + Layout component layers

## Development Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm/pnpm

### Backend Setup
```bash
cd srms-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Setup
```bash
cd srms-frontend
npm install
npm run dev
```

## Common Commands

### Backend
```bash
# Development server
php artisan serve

# Run tests
php artisan test

# Run specific test file
php artisan test --filter=ServiceRequestTest

# Database
php artisan migrate
php artisan migrate:fresh --seed

# Clear caches
php artisan optimize:clear

# Route list
php artisan route:list --path=api

# Code formatting
./vendor/bin/pint
```

### Frontend
```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npx tsc --noEmit

# Preview production build
npm run preview
```

## Coding Standards

### PHP (Backend)
- PSR-12 coding style (enforced by Laravel Pint)
- Strict types where possible
- Form Requests for validation
- Policies for authorization
- API Resources for response formatting

### TypeScript (Frontend)
- Strict mode enabled
- Explicit type annotations
- Zod schemas for runtime validation
- Functional components with hooks

## Key Files

### Backend
| File | Purpose |
|------|---------|
| `routes/api.php` | API route definitions |
| `app/Models/User.php` | User model with role relationship |
| `app/Models/ServiceRequest.php` | Core service request model |
| `app/Http/Controllers/Auth/AuthController.php` | OTP authentication |
| `app/Policies/ServiceRequestPolicy.php` | Service request authorization |
| `database/seeders/RoleSeeder.php` | Seeds default roles |

### Frontend
| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/App.tsx` | Root component with providers |
| `src/contexts/AuthContext.tsx` | Authentication state |
| `src/routes/index.tsx` | Route configuration |
| `src/services/api.ts` | Axios instance configuration |
| `src/features/auth/components/LoginForm.tsx` | OTP login flow |

## Testing

### Backend (PestPHP)
```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/ServiceRequestTest.php
```

Test files are in `srms-backend/tests/`:
- `Feature/` - Integration/API tests
- `Unit/` - Unit tests

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| Admin | Full CRUD on all resources, user management, system configuration |
| Support Engineer | View assigned requests, update status, add comments/attachments |
| Client | Create requests, view own requests, add comments to own requests |

## API Authentication

### OTP Flow
1. Client sends phone/email to `/api/auth/send-otp`
2. System sends OTP via SMS/email
3. Client submits OTP to `/api/auth/verify-otp`
4. System returns Sanctum bearer token
5. Client includes token in `Authorization: Bearer {token}` header

### Rate Limiting
- `send-otp`: 5 requests per minute
- `verify-otp`: 10 requests per minute

## Environment Variables

### Backend (.env)
```env
APP_NAME=SRMS
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=srms
DB_USERNAME=root
DB_PASSWORD=

# Hashids salt (required)
HASHIDS_SALT=your-random-salt-here

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Database Models

```
Role (id, name, is_active)
  └── User (id, first_name, last_name, email, phone, role_id, is_active)
        ├── ServiceRequest (id, user_id, service_id, title, description, status, assigned_to)
        │     ├── Comment (id, service_request_id, user_id, content)
        │     └── Media (id, service_request_id, filename, path, mime_type)
        └── OtpVerification (id, user_id, otp, expires_at)

Service (id, name, description, is_active)
  └── ServiceRequest
```

## Common Issues & Solutions

### CORS Errors
Ensure `SANCTUM_STATEFUL_DOMAINS` includes your frontend origin and `config/cors.php` allows the frontend URL.

### 401 Unauthorized
1. Check token is included in request header
2. Verify token hasn't expired
3. Ensure Sanctum middleware is applied to routes

### Hashids Decode Failing
1. Verify `HASHIDS_SALT` is set in `.env`
2. Ensure using the correct model's Hashid connection

### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

### Database Migrations Fail
```bash
# Reset and reseed
php artisan migrate:fresh --seed
```
