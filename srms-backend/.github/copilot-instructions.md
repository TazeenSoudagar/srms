<!-- Copilot instructions for SRMS backend (concise, actionable) -->
# SRMS — Copilot Instructions (backend)

Purpose: Give AI coding assistants the essential, repo-specific knowledge to be immediately productive.

- Project root: backend Laravel app (PSR‑4 autoload `App\` => `app/`). Key files: `composer.json`, `artisan`, `phpunit.xml`.
- Docs: `docs/global-dev-rules.md`, `docs/adr/*.md`, and daily logs in `docs/logs/` are authoritative—use them first.

Workflows & commands (Windows PowerShell)
- Quick setup (developer machine):
  - `composer install` 
  - `php -r "file_exists('.env') || copy('.env.example', '.env');"`
  - `php artisan key:generate`
  - `php artisan migrate`
  - `npm install`
  - `npm run build`
  (There is a `composer` `setup` script that runs these steps; prefer it when available: `composer run setup`.)
- Dev mode (concurrent): `composer run dev` runs `php artisan serve`, queue listener, and `npm run dev` as configured in `composer.json`.
- Run tests: `composer run test` (invokes `@php artisan test`). Note: test env uses in‑memory sqlite (see `phpunit.xml`).

Architecture / big picture
- Monorepo pattern (see `docs/adr/adr-01.md`). This backend is the Laravel API: authentication (Sanctum), feature APIs (ServiceRequests, Comments), and Filament admin.
- Feature-based structure: models/controllers/requests/resources should be grouped by feature (see `docs/global-dev-rules.md`). Example paths to expect:
  - `app/Models/ServiceRequests/ServiceRequest.php`
  - `app/Http/Controllers/Api/ServiceRequests/ServiceRequestController.php`

Project-specific conventions (must follow)
- PHP files: use `declare(strict_types=1);` and PSR‑12 style.
- Controllers: each action must use a Form Request (validation) and a Resource (response) where applicable.
- Policies: use Laravel Policies for authorization (e.g. `ServiceRequestPolicy`). Prefer `role:<name>` middleware on route groups.
- Activity logging: important events must write to `activity_logs` (see `docs/global-dev-rules.md`).
- Migrations & DB: ERD is authoritative—check `docs/erd/` (ERD‑first). Primary key is `id` on all tables.

Testing & CI notes
- Tests use PestPHP (see `composer.json` require‑dev). PHPUnit config forces test env vars (sqlite in memory). Write Pest tests for happy and negative paths.
- Before changing DB schema, add/adjust factories and seeders; CI expects factories for non-user tables.

Integration points & external deps
- Authentication: Laravel Sanctum (session/cookie SPA flow). See `docs/adr/adr-02-auth-and-rbac.md`.
- Filament admin: install after base APIs stabilized; Filament resources generated via `php artisan make:filament-resource`.
- Node microservice: communicates via HTTP APIs; microservice code lives in sibling monorepo folder (`srms-node-js`).

Examples to reference when implementing features
- User model: `app/Models/User.php` (HasFactory, Notifiable, password casting). Use similar patterns for other models.
- Routes: group API routes in `routes/api.php`; example public web route in `routes/web.php`.
- Composer scripts: use `composer.json` scripts (`setup`, `dev`, `test`) for consistent developer experience.

When editing code — checklist for PRs
- Follow PSR‑12 and `declare(strict_types=1);`.
- Add/adjust migration, model, factory, and seeder for schema changes.
- Add Form Request + Resource + Policy for new APIs.
- Add Pest test(s): at least one happy path and relevant negative case(s).
- Update `docs/api/` with the new endpoint and acceptance criteria.

If something is missing or unclear
- Consult `docs/global-dev-rules.md` and the ADRs in `docs/adr/` for the intended design.
- Ask the maintainer for ERD updates when a schema change is proposed.

Keep this file short — prefer concrete examples and authoritative docs in `docs/`.

— End
