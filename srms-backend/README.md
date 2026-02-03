# SRMS Backend

Laravel 12 API backend for the Service Request Management System (SRMS).

## Requirements

- PHP 8.2+
- Composer
- MySQL/SQLite

## Quick Start

```bash
# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations and seed
php artisan migrate
php artisan db:seed

# Start development server
php artisan serve
```

## Tech Stack

- **Framework**: Laravel 12
- **Auth**: Laravel Sanctum with OTP-based authentication
- **Admin Panel**: Filament 4.0
- **Testing**: PestPHP
- **ID Obfuscation**: Hashids

## API Endpoints

All API routes are prefixed with `/api` and require Sanctum authentication (except auth routes).

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone/email
- `POST /api/auth/verify-otp` - Verify OTP and receive token

### Resources
- `GET|POST /api/users` - User management
- `GET|POST /api/services` - Service catalog
- `GET|POST /api/service-requests` - Service requests
- `POST /api/service-requests/{id}/assign` - Assign engineer
- `PATCH /api/service-requests/{id}/status` - Update status
- `POST /api/service-requests/{id}/close` - Close request
- `GET|POST /api/service-requests/{id}/comments` - Comments
- `POST /api/service-requests/{id}/media` - Attachments

## Testing

```bash
php artisan test
```

## Admin Panel

Access the Filament admin panel at `/admin` after creating an admin user.
