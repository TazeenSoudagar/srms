# SRMS Entity-Relationship Diagram (ERD)

Database schema for Service Request Management System (SRMS).

**Last Updated**: December 11, 2025

---

## Overview

Database supports:
- User management with role-based access control
- Service request lifecycle management
- Comments and file attachments
- Activity logging for audit trails

**Note**: Using role-based authorization (no permissions table for now).

---

## Entities

### 1. users
- `id`, `first_name`, `last_name`, `email`, `phone`, `password`, `is_active`, `role_id`, `email_verified_at`, `remember_token`, timestamps
- **Relationships**: Belongs to `roles`, has many `service_requests` (as creator/assignee), has many `comments`, has many `activity_logs`
- **Indexes**: `email` (unique), `role_id`, composite `[role_id, is_active]`

### 2. roles
- `id`, `name`, `is_active`, timestamps
- **Relationships**: Has many `users`
- **Note**: Roles: Client, Support Engineer, Admin

### 3. services
- `id`, `name`, `description`, `is_active`, timestamps
- **Relationships**: Has many `service_requests`

### 4. service_requests
- `id`, `request_number` (unique), `service_id`, `created_by`, `title`, `description`, `status`, `priority`, `assigned_to`, `due_date`, `closed_at`, `updated_by`, `is_active`, timestamps
- **Relationships**: Belongs to `services`, belongs to `users` (creator/assignee/updater), has many `comments` (polymorphic), has many `media` (polymorphic), has many `activity_logs` (polymorphic)
- **Indexes**: `request_number` (unique), `service_id`, `created_by`, `assigned_to`, `is_active`

### 5. comments
- `id`, `commentable_id`, `commentable_type`, `user_id`, `body`, timestamps
- **Relationships**: Polymorphic to `commentable` (ServiceRequest), belongs to `users`
- **Indexes**: Composite `[commentable_id, commentable_type]`, `user_id`

### 6. media
- `id`, `name`, `url`, `mediaable_id`, `mediaable_type`, timestamps
- **Relationships**: Polymorphic to `mediaable` (ServiceRequest)
- **Indexes**: Composite `[mediaable_id, mediaable_type]`

### 7. activity_logs
- `id`, `user_id`, `action`, `loggable_id`, `loggable_type`, `details` (JSON), timestamps
- **Relationships**: Belongs to `users`, polymorphic to `loggable` (ServiceRequest, User, etc.)
- **Indexes**: `user_id`, composite `[loggable_id, loggable_type]`, `action`, `created_at`

---

## Relationships Summary

- **One-to-Many**: `roles` → `users`, `services` → `service_requests`, `users` → `service_requests` (creator/assignee), `users` → `comments`, `users` → `activity_logs`
- **Polymorphic**: `comments`, `media`, `activity_logs` can attach to multiple entity types

---

## Design Decisions

- **Polymorphic Relationships**: Used for `comments`, `media`, `activity_logs` for extensibility
- **Separate `created_by` and `assigned_to`**: Clear separation for queries and reporting
- **`is_active` Flags**: Soft delete alternative, preserves data
- **Central Activity Logs**: Single table for consistent audit trail

---

## Gap Analysis: ERD vs Implementation

### Field Name Differences
- ERD shows `requestor_id` → Implementation uses `created_by` ✅ (keep `created_by`)
- ERD shows `due_at` → Implementation uses `due_date` ✅ (keep `due_date`)

### Missing Tables
- `activity_logs` table not yet created ⏳ (pending)

### Status
- All other tables align with ERD ✅

---

## Indexes

**Implemented**:
- Unique indexes on `email`, `request_number`
- Foreign key indexes
- Composite indexes on polymorphic relationships

**Recommended**:
- `service_requests.status` + `assigned_to` (for filtering)
- `service_requests.created_at` (for date queries)
- `activity_logs.created_at` (for pruning)

---

## Notes

- ERD is source of truth for database design
- Migrations should align with this document
- Update ERD when adding new features
