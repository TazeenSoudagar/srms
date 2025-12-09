### SRMS Global Development Rules

These rules apply to **all** SRMS repositories (`srms-backend`, `srms-front-end`, `srms-node-js`). They are derived from the overall 3‑month PIP and will be treated as authoritative.

---

### Tech Stack & References

- **Backend**: Laravel (API only), PHP 8.2+, PestPHP.
- **Admin Panel**: FilamentPHP (Laravel 10+).
- **Frontend**: React + TypeScript (SPA).
- **Microservice**: Node.js + Express (reporting/utility services).
- **Database**: MySQL.

Always follow the latest official documentation:

- **Laravel**: https://laravel.com/docs/12.x  
- **Filament**: https://filamentphp.com/docs  
- **PestPHP**: https://pestphp.com  
- **Laravel Excel**: https://docs.laravel-excel.com/3.1/getting-started/  
- **DOMPDF for Laravel**: https://github.com/barryvdh/laravel-dompdf  

---

### General Coding Standards

- **PHP**
  - Use `declare(strict_types=1);` in all PHP files.
  - Follow **PSR‑12** coding style.
  - Prefer **dependency injection** and service container usage.
  - Use **typed properties**, **return types**, and **enums** (PHP 8.2) where appropriate.
- **Structure**
  - Use **feature-based folders** for Models, Controllers, Requests, Resources, Jobs, Services, etc.
  - Example: `app/Models/ServiceRequests/ServiceRequest.php`, `app/Http/Controllers/Api/ServiceRequests/ServiceRequestController.php`.
- **Naming**
  - Use expressive, descriptive names for classes, methods, and variables.
  - Use Laravel’s standard naming for migrations, tables and Eloquent models.

---

### Database & ERD Rules

- **ERD‑First**: All tables/relationships must be reflected in an ERD under `docs/erd/`.
- **Primary Keys**: Use `id` as the primary key for all tables.
- **Migrations**
  - New tables: use Artisan commands that create **Model + Migration + Factory + Seeder**.
  - All tables (except `users`) must have **seeders and factories** with realistic faker data.
  - Before adding a new table or altering a table, check existing migrations for overlaps.
- **Indexes & Keys**
  - Always think through **indexes, foreign keys, unique constraints, and composite indexes** for performance.
  - Avoid cascading deletes **unless explicitly required**.
- **Caching**
  - Use Laravel cache where appropriate.
  - In model `booted()`/observers, clear/rebuild relevant cache entries on create/update/delete.

---

### Activity Logs

- Maintain a central `activity_logs` table with:
  - `user_id`, `action`, `loggable_id`, `loggable_type`, `details` (JSON), timestamps.
- Log **all important events** (create, update, delete, status changes, comments, assignments, etc.).
- Implement pruning via a **scheduled command** (e.g. monthly cleanup of old logs).

---

### Laravel API Rules

- **Routing**
  - Use **API Resource Controllers** and **RESTful nested resources** wherever possible.
  - Group routes by feature in `routes/api.php`.
  - Apply authentication middleware to all APIs except login/registration/password flows.
  - Use **route model binding** for single-resource endpoints.
- **Controllers**
  - Each action:
    - Has its own **Form Request** class.
    - Has its own **Resource** class for responses when appropriate.
  - `index` actions:
    - Must support **pagination** (`page`, `count`) and filtering via **query scopes**.
  - Enforce permissions with policies/guards; use `abort()` helpers for invalid states.
- **Requests (Form Requests)**
  - Stored in feature-based folders mirroring controllers.
  - Include **custom validation messages** and stricter rules (regex, date, timestamp, etc.).
- **Resources**
  - Use nested resources for relations where helpful.
  - For `show` responses, include links to `store`/`update` where it makes sense.
  - For `store`/`update`, include a link to the corresponding `show` endpoint.

---

### Filament Admin Panel Rules

- Install Filament only after base APIs stabilize.
- Use `php artisan make:filament-resource <Model>` for all resources.
- Requirements:
  - Listing pages: proper columns, filters, and search.
  - Create/Edit: two‑column layout, toggles for booleans, full‑width for editors/uploaders.
  - Relation managers: slide‑over UI, with search and filters.
- Imports/Exports:
  - Use **Laravel Excel** for CSV/XLSX, **DOMPDF** for PDFs.
  - Implement imports/exports using **Jobs & batches**, with proper validation and notifications.

---

### Frontend (React + TS) Rules

- Use **TypeScript** with strict typing where possible.
- Organize code by **feature modules** (e.g. `features/auth`, `features/serviceRequests`).
- Use:
  - A dedicated **API client** layer for talking to Laravel APIs.
  - Centralized **error handling** and loading states.
- Ensure:
  - Pagination, filtering, and search are implemented for list pages.
  - The UI is responsive and accessible where feasible.

---

### Node.js Microservice Rules

- Use **Express** with feature-based routing.
- Keep microservices **small and focused** (e.g. reporting, exports, notifications).
- Communicate with Laravel via **HTTP APIs** initially.
- Add basic tests (Jest or similar) and documentation for each microservice endpoint.

---

### Testing Rules

- Use **PestPHP** for all Laravel tests.
- Every API endpoint must have:
  - At least one **happy-path test**.
  - Relevant **negative tests** (validation errors, unauthorized, forbidden, not found).
- Add comments in tests to clarify intent.
- For Filament and React, add feature tests progressively once backend coverage is stable.

---

### Documentation Rules

- Maintain:
  - **API docs** in `docs/api/` (one file per feature).
  - **Architecture Decisions** in `docs/decisions/` (ADR style).
  - **Daily logs** in `docs/logs/` with:
    - Tasks completed, pending, blockers, learnings, mistakes, and best practices.
- Maintain a detailed **README** per project (backend, frontend, node-service):
  - Setup steps, running tests, key commands, and known issues.
- Document admin panel pages (listing, create/edit/view, relation managers) with short text and, later, screenshots.

---

### Workflow, Git & GitHub Board

- Use a **GitHub Project board** to manage work:
  - Columns: `Backlog`, `This Week`, `In Progress`, `Review`, `Done` (or similar).
- Each task/issue must have:
  - Clear **title**, detailed **description**, and **acceptance criteria**.
  - Links to related PRs.
- Pull Requests:
  - One feature/change per PR when possible.
  - Follow best practices: small, focused, with description, tests, and screenshots/log snippets when relevant.
- Always:
  - Run tests before merging.
  - Keep commits clean and meaningful.