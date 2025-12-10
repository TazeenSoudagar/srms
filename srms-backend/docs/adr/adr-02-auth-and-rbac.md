## ADR-02: Authentication and Role-Based Access Control (RBAC)

**Status:** Accepted  
**Date:** 2025-12-09  

### Context

SRMS is a SPA + API system where:

- Backend: Laravel API (latest, see https://laravel.com/docs/12.x).
- Frontend: React SPA.
- Roles: `Client`, `Support Engineer`, `Admin`.
- Future: Filament admin panel, microservices, and strict permissions per feature.

We need a simple, secure way to authenticate SPA users and enforce role/permission rules across APIs and, later, Filament.

### Decision

1. **Authentication Mechanism**
   - Use **Laravel Sanctum** for SPA authentication.
   - The React SPA will:
     - Log in via `POST /api/auth/login` with email + password.
     - Rely on Sanctum’s **session / cookie-based** SPA authentication (CSRF-protected).
   - Logout is handled via `POST /api/auth/logout`, which invalidates the current session/token.

2. **User Model & Auth Fields**
   - `users` table:
     - Columns: `id`, `first_name`, `last_name`, `email`, `phone`, `password`, `active`, `role_id`, `remember_token`, `email_verified_at`, timestamps.
   - Passwords are always stored as **bcrypt hashes** via Laravel’s `Hash` facade.
   - `active` flag:
     - Disabled users cannot authenticate; login endpoint will reject inactive accounts.

3. **Roles and Permissions Structure**
   - Tables:
     - `roles` – base roles (`Client`, `Support Engineer`, `Admin`).
     - `permissions` – granular feature permissions (e.g. `service_requests.create`, `service_requests.assign`).
     - `role_has_permissions` (or `role_permission`) – pivot between roles and permissions.
   - `users.role_id` is a foreign key to `roles.id`.
   - Access is controlled primarily by **roles**, but the design remains compatible with permission-level checks if/when needed.

4. **Authorization in Code**
   - Use Laravel’s **authorization features**:
     - **Policies** for resource-specific access (e.g. `ServiceRequestPolicy` for viewing/updating/closing).
     - **Gates** or helpers for simple checks when a full policy is unnecessary.
   - Typical rules:
     - Clients:
       - Can create and view **their own** service requests and comments.
       - Cannot assign or close requests.
     - Support Engineers:
       - Can view requests assigned to them.
       - Can update status and add comments on assigned requests.
     - Admins:
       - Full access to all users, roles, and service requests.
   - Add middleware/shortcuts:
     - `role:admin`, `role:support`, `role:client` (or a generic `role:<name>` middleware).
     - Use these on route groups in `routes/api.php`.

5. **Guards and Filament**
   - API + SPA will use the default `web` guard (Sanctum SPA auth).
   - Filament will use its own guard (e.g. `filament`) but still reference the same `users` table and roles.
   - Only users with `Admin` (and optionally certain support roles) will access Filament.

6. **Error Handling & Responses**
   - Login:
     - On invalid credentials or inactive account, return `422` with a generic “invalid credentials” message (no information leakage).
   - Authorization:
     - Unauthorized: `401` (not logged in).
     - Forbidden: `403` (logged in but insufficient role/permission).
   - All auth-related errors are returned as **JSON** with a consistent error structure.

### Consequences

- **Pros**
  - Sanctum provides a secure, well-documented pattern for SPA + Laravel APIs.
  - Roles/permissions tables are explicit and align with the ERD, making behavior easy to reason about.
  - Policies keep authorization logic close to the models, improving readability and testability.
  - Design is compatible with Filament and future microservices.

- **Cons**
  - Slightly more complexity than a role-only system (because of permissions and policies).
  - Requires disciplined testing for all role combinations.

### Next Steps

- Implement migrations, models, factories, and seeders for `roles`, `permissions`, `role_has_permissions`, and `users`.
- Install and configure Sanctum; add `login` and `logout` endpoints under `/api/auth`.
- Create policies for `ServiceRequest` and wire them into controllers and routes.
- Add Pest tests covering:
  - Successful and failed login.
  - Access control for basic resources by role.