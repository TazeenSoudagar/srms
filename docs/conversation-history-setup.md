## SRMS – Conversation & Setup History (Cursor Mentor Log)

This document summarizes the major prompts, decisions, and implementation steps done with the AI mentor (full‑stack guide & reviewer) so that the project context can be re‑attached easily on a new machine or in a new Cursor workspace.

---

### 1. Global Mentoring Context

- I requested the AI to act as a **long‑term full‑stack mentor** with expertise in:
  - Laravel, Filament, PHP, SQL, Pest, React, TypeScript, Node.js, HTML/CSS, JS, and AI integrations.
- I defined **strict global rules**:
  - Use PSR‑12, `declare(strict_types=1);`, feature‑based structure, Requests/Resources, activity logs, caching, tests for every API, etc.
  - Follow latest Laravel docs and best practices.
- These rules are documented in `docs/global-dev-rules.md` and are treated as **always‑on** constraints for all code and reviews.

---

### 2. Project & ERD Setup

**Prompts / Goals**

- Design a 3‑month Performance Improvement Plan (PIP) around building **Service Request Management System (SRMS)**.
- Create a **monorepo** with backend (Laravel), frontend (React), and Node microservice.
- Design an ERD for:
  - `users`, `roles`, `permissions`, `role_has_permissions`
  - `services`, `service_requests`
  - `comments` (polymorphic), `media` (polymorphic), `activity_logs`.

**Key Steps Implemented**

- Created monorepo structure:
  - `srms-backend/` – Laravel API
  - `srms-front-end/` – React SPA
  - `srms-node-js/` – Node.js microservice
  - `docs/` – ERD, ADRs, logs, global rules.
- Finalized ERD v1 with:
  - Audit columns (`created_by`, `updated_by`, `closed_by`) on `service_requests`.
  - Polymorphic `comments`, `media`, and `activity_logs`.
  - Decision to use **Laravel backed enums** (`RequestStatus`, `RequestPriority`) instead of DB enums.

---

### 3. Architecture Decisions (ADRs)

**Prompts / Goals**

- Capture major design choices formally as ADRs.

**Files & Decisions**

- `docs/adr/adr-01.md` – **Monorepo & Core Tech Stack**
  - Single repo for backend, frontend, node.
  - Stack: Laravel + Sanctum + Pest, Filament 3, React+TS, Node+Express, MySQL.
- `docs/adr/adr-02-auth-and-rbac.md` – **Authentication & RBAC**
  - Use **Laravel Sanctum** for SPA auth.
  - Roles: `Client`, `Support Engineer`, `Admin`.
  - Tables: `roles`, `permissions`, `role_has_permissions`, `users.role_id`.
  - Use policies/middleware (`role:admin`, etc.) for access control.

---

### 4. Backend Foundations – Models & Migrations

**Prompts / Goals**

- Build a clean Laravel data model aligned with the ERD and ADRs.

**Implemented**

- **Models** in `app/Models/`:

  - `User` – `role()` relation, casts (`email_verified_at`, `password`, `is_active`), fillable: `first_name`, `last_name`, `phone`, `role_id`, `email`, `is_active`.
  - `Role` – `users()` relation, `name`, `is_active`.
  - `Service` – `serviceRequests()` relation, `name`, `description`, `is_active`.
  - `ServiceRequest` – relations to `Service` and `User` (`createdBy`, `assignedTo`, `updatedBy`), casts for dates and enums.
  - `Comment` – polymorphic `commentable`, `user()` relation.
  - `Media` – polymorphic `mediaable`.

- **Migrations** in `database/migrations/`:

  - `users` – `first_name`, `last_name`, `phone`, `email` (unique), `role_id` FK, `password`, `is_active`, `email_verified_at`, `remember_token`, indexes on `role_id` and `is_active`.
  - `roles` – `name` (unique), `is_active`.
  - `services` – `name`, `description`, `is_active` + index.
  - `service_requests` – `request_number` (unique), `service_id`, `created_by`, `title`, `description`, `status`, `priority` (later added), `assigned_to`, `due_date`, `closed_at`, `updated_by`, `is_active`, indexes on key FKs and flags.
  - `comments` – `commentable_id`, `commentable_type`, `user_id`, `body`, composite index on polymorphic keys.
  - `media` – `mediaable_id`, `mediaable_type`, `name`, `url`, composite index.

- Discussion and learning about:
  - **Indexes** vs full table scan; when to index; composite indexes and left‑prefix rule.
  - Why **not** index every column.

---

### 5. Enums for Status & Priority

**Prompts / Goals**

- Implement Laravel enums instead of DB enums for flexibility.

**Files**

- `app/Enums/RequestStatus.php`
  - Values: `open`, `in_progress`, `closed`.
  - Helpers: `options()`, `getLabel()`, `getValue()` for mapping values ↔ labels.
- `app/Enums/RequestPriority.php`
  - Values: `low`, `medium`, `high`.
  - Similar helpers.

**Model Integration**

- `ServiceRequest`:
  - Casts: `'status' => RequestStatus::class`, `'priority' => RequestPriority::class`.

---

### 6. Seeders & Factories

**Prompts / Goals**

- Seed realistic data; create known admin account.

**Files**

- `database/seeders/RoleSeeder.php`
  - Seeds `Admin`, `Support Engineer`, `Client` roles.
- `database/factories/UserFactory.php`
  - Uses Faker for names, phone, email, random `role_id`, hashed default password.
- `database/seeders/UserSeeder.php`
  - Creates specific admin user: `admin@gmail.com` / `test1234`.
  - Creates multiple support and client users using the factory.
- `database/seeders/DatabaseSeeder.php`
  - Calls `RoleSeeder`, then `UserSeeder`.

---

### 7. Auth – Login API (First Iteration)

**Prompts / Goals**

- Implement basic login/logout APIs and debug 403 issue.

**Files**

- `app/Http/Requests/LoginRequest.php`
  - `authorize()` originally `false`, causing 403 “This action is unauthorized.”
  - Changed to `true`.
  - Rules: `email` (required|email), `password` (required).
- `app/Http/Controllers/Auth/AuthController.php` (login part)

  - `login(LoginRequest $request)`:
    - Looks up user by email.
    - Uses `Hash::check` to verify password.
    - Returns `401 Invalid credentials` when mismatch (success response to be extended with Sanctum).

- `routes/api.php`
  - `POST /api/auth/login` mapped to `AuthController@login`.

**Learnings**

- Form Request `authorize()` can block a route _before_ controller runs.
- Importance of structured JSON error responses.

---

### 8. OTP Workflow (First Iteration)

**Prompts / Goals**

- Create `send-otp` and `verify-otp` APIs; for now, hard‑code `123456` for `admin@gmail.com`.

**Files / Design**

- `app/Http/Requests/Auth/SendOtpRequest.php`
  - Initial version had a free closure rule; later refactored to:
    - `email` required, valid, and must exist in `users` table.
- `app/Jobs/Auth/SendOtpJob.php`
  - Sends OTP email using a `SendOtpMail` mailable and the `mail.send-otp-mail` Blade view.
  - Returns no HTTP response; controller handles JSON.
- `resources/views/mail/send-otp-mail.blade.php`
  - Markdown mail template for displaying the OTP (to be customized).
- `app/Http/Controllers/Auth/AuthController.php`

  - `sendOtp(SendOtpRequest $request)`:
    - Finds user by email.
    - Generates random 6‑digit OTP.
    - If email is `admin@gmail.com`, forces OTP to `123456`.
    - Dispatches `SendOtpJob`.
    - Returns JSON: `"OTP sent successfully."`.
  - Planned `verifyOtp(VerifyOtpRequest $request)`:
    - For first iteration, simply checks `email === 'admin@gmail.com' && otp === '123456'`.
    - Returns success or `422 Invalid OTP`.

- `routes/api.php`
  - `POST /api/auth/send-otp` mapped to `AuthController@sendOtp`.
  - `POST /api/auth/verify-otp` planned.

**Notes**

- This is an intentionally simplified OTP workflow for learning; future enhancement is to store hashed OTP + expiry in DB or cache.

---

### 9. Tooling & Environment

**Prompts / Goals**

- Integrate **Laravel Boost** MCP and handle Windows specifics.

**Steps**

- Installed `laravel-boost` MCP.
- Fixed command path in `c:\Users\<user>\.cursor\mcp.json` to:
  - `"command": "php", "args": ["D:/L&D/srms/srms-backend/artisan", "boost:mcp"]`
- Verified: MCP connects and reports available tools.

- Dealt with `php artisan serve` port issue:
  - Learned that “Failed to listen on 127.0.0.1:8000–8010” means ports are busy.
  - Workaround: run on a different port or kill stray `php` processes.

---

### 10. Daily Logs & Reporting

**Prompts / Goals**

- Keep a running learning & task log for PIP and monthly reports.

**Files**

- `docs/logs/8-12-25.md` – first day’s tasks (repo setup, ERD, monorepo).
- `docs/logs/9-12-25.md`, `10-12-25.md` – daily logs including:
  - Tasks completed.
  - Tasks pending.
  - Blockers.
  - Learnings, mistakes, and best practices.

**Usage**

- End of each day: summarize work here and in MS Teams using the same structure.

---

### 11. Mentor Relationship Reminder

- The AI in Cursor is configured to:
  - Act as a **long‑term full‑stack mentor and reviewer** for SRMS.
  - Enforce the rules in `docs/global-dev-rules.md` and ADRs.
  - Help create **weekly and daily plans**, review code, explain concepts (Laravel, SQL, React, Node, indexing, enums, etc.), and refine tests and documentation.
- When moving to a new laptop or workspace:
  - Re‑attach this file and `docs/global-dev-rules.md` + ADRs.
  - Tell the assistant: “Use these docs as global context for the SRMS project and continue mentoring from where we left off.”
