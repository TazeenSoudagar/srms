### SRMS Global Development Rules

These rules apply to **all** SRMS repositories (`srms-backend`, `srms-front-end`, `srms-node-js`). They are derived from the overall 3‑month PIP and will be treated as authoritative.

---

## 3-Month Performance Improvement Plan (PIP) Context

### Overview
This project is part of a structured 3-month Performance Improvement Plan designed to enhance full-stack development skills through building a complete Service Request Management System (SRMS). The plan progresses from backend fundamentals to frontend development, and finally to microservices integration.

### Current Status
- **Start Date**: December 8, 2025
- **Current Week**: Week 1 (December 8-14, 2025)
- **Current Month**: Month 1 - Backend & Frontend Foundation
- **Progress Tracking**: See `docs/pip-progress.md` for detailed status

### Learning Objectives by Phase

**Month 1 - Backend (Laravel) & Frontend (React) Foundation**
- Master Laravel API development with proper structure and conventions
- Understand database design, migrations, and Eloquent relationships
- Implement authentication and role-based access control
- Learn React fundamentals and component architecture
- Build core service request management features

**Month 2 - Advanced Features & Integration**
- Implement comments, file attachments, and activity logging
- Integrate frontend with backend APIs
- Write comprehensive tests (PestPHP)
- Polish UI/UX and error handling
- Prepare API documentation

**Month 3 - Microservices & Finalization**
- Learn Node.js/Express fundamentals
- Build a microservice (reporting/export/notifications)
- Integrate microservice with Laravel backend
- Final cleanup, documentation, and demo preparation

### Success Metrics
- ✅ All weekly goals completed on schedule
- ✅ Code follows all established rules and conventions
- ✅ Tests written for all major features
- ✅ Documentation complete and up-to-date
- ✅ Code reviewed and improved based on feedback
- ✅ Skills demonstrated through working features

---

## Mentoring Guidelines

### Approach
- Proactive code reviews with learning-focused feedback
- Constructive suggestions with explanations
- Progressive complexity as skills improve

### Review Focus
- Code structure and Laravel conventions
- Security and performance
- Test coverage and documentation

### Tracking
- Daily logs in `docs/logs/`
- Weekly reviews using templates
- Monthly skills assessment

---

## Progress Tracking

### Weekly Goal Checklist
Each week, track completion of:
- [ ] All planned tasks completed
- [ ] Code follows all rules in this document
- [ ] Tests written for new features
- [ ] Documentation updated
- [ ] Code reviewed and improved
- [ ] Daily logs maintained
- [ ] Learning objectives met

### Monthly Milestone Tracking
- **Month 1**: Backend APIs complete, React fundamentals learned, core features working
- **Month 2**: Advanced features implemented, integration complete, tests comprehensive
- **Month 3**: Microservice built and integrated, project finalized, demo ready

### Skills Assessment Framework
Track skill levels (Beginner → Intermediate → Advanced) for:
- Laravel/PHP development
- Database design and SQL
- React/TypeScript
- Node.js/Express
- Testing (PestPHP, Jest)
- API design
- Git/GitHub workflows

### Code Review Metrics
- Test coverage percentage
- Code quality (PSR-12 compliance, type hints, documentation)
- Security best practices adherence
- Performance optimizations applied

---

### Tech Stack & References

- **Backend**: Laravel 12.x (API only), PHP 8.2+, PestPHP 4.x.
- **Admin Panel**: FilamentPHP 4.x (for Laravel 12).
- **Frontend**: React 18+ with TypeScript 5+ (SPA).
- **Microservice**: Node.js 20+ with Express (reporting/utility services).
- **Database**: MySQL 8.0+.

Always follow the latest official documentation:

- **Laravel**: https://laravel.com/docs/12.x  
- **Filament**: https://filamentphp.com/docs (v4.x)  
- **PestPHP**: https://pestphp.com (v4.x)  
- **React**: https://react.dev  
- **TypeScript**: https://www.typescriptlang.org/docs  
- **Node.js**: https://nodejs.org/docs  
- **Express**: https://expressjs.com  
- **Laravel Excel**: https://docs.laravel-excel.com/3.1/getting-started/  
- **DOMPDF for Laravel**: https://github.com/barryvdh/laravel-dompdf

**Learning Focus**: As you progress through the PIP, refer to these docs frequently. Bookmark common patterns and solutions.  

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

**Learning Focus (Week 2-4, Month 1)**: Start with React fundamentals, then build screens connecting to backend APIs.

- **TypeScript**
  - Use strict typing where possible (`strict: true` in `tsconfig.json`).
  - Define interfaces/types for API responses and component props.
  - Avoid `any` type; use `unknown` when type is truly unknown.
- **Structure**
  - Organize code by **feature modules** (e.g. `features/auth`, `features/serviceRequests`).
  - Use feature-based folder structure:
    - `components/` - Reusable UI components
    - `hooks/` - Custom React hooks
    - `services/` - API client and business logic
    - `types/` - TypeScript type definitions
    - `utils/` - Helper functions
- **API Integration**
  - Use a dedicated **API client** layer (e.g., Axios or Fetch wrapper) for talking to Laravel APIs.
  - Centralize API base URL configuration.
  - Handle authentication tokens/cookies automatically.
- **State Management**
  - Start with React hooks (`useState`, `useEffect`) for simple state.
  - Consider Context API for shared state (auth, theme).
  - Use libraries (Redux, Zustand) only if complexity requires it.
- **Error Handling**
  - Centralized error handling with user-friendly messages.
  - Show loading states during API calls.
  - Handle network errors gracefully.
- **UI/UX**
  - Implement pagination, filtering, and search for list pages.
  - Ensure UI is responsive (mobile-first approach).
  - Follow accessibility best practices (ARIA labels, keyboard navigation).
- **Common Mistakes to Avoid**
  - ❌ Mixing API calls directly in components (use service layer)
  - ❌ Not handling loading/error states
  - ❌ Ignoring TypeScript errors
  - ❌ Not validating API responses

---

### Node.js Microservice Rules

**Learning Focus (Month 3)**: Learn Node.js/Express fundamentals, then build one focused microservice.

- **Structure**
  - Use **Express** with feature-based routing.
  - Organize by features: `routes/`, `controllers/`, `services/`, `utils/`.
  - Keep entry point (`server.js` or `app.js`) clean and minimal.
- **Microservice Design**
  - Keep microservices **small and focused** (e.g. reporting, exports, notifications).
  - One microservice = one primary responsibility.
  - Communicate with Laravel via **HTTP APIs** (RESTful endpoints).
- **Error Handling**
  - Use try-catch blocks and error middleware.
  - Return consistent error response format.
  - Log errors appropriately.
- **Testing**
  - Add basic tests using **Jest** or similar.
  - Test each endpoint (happy path and error cases).
  - Mock external dependencies (Laravel API calls).
- **Documentation**
  - Document each endpoint (method, path, request/response format).
  - Include example requests/responses.
  - Document environment variables and setup steps.
- **Common Mistakes to Avoid**
  - ❌ Building too complex microservices (start simple)
  - ❌ Not handling errors properly
  - ❌ Missing input validation
  - ❌ Not documenting endpoints

---

### Testing Rules

**Learning Focus (Month 2, Week 3)**: Write comprehensive tests for all backend features. Learn testing best practices.

- **Laravel Testing (PestPHP)**
  - Use **PestPHP 4.x** for all Laravel tests.
  - Write feature tests (test full request/response cycle).
  - Write unit tests for complex business logic.
- **Test Coverage Requirements**
  - Every API endpoint must have:
    - At least one **happy-path test** (successful request).
    - Relevant **negative tests** (validation errors, unauthorized, forbidden, not found).
  - Test authentication and authorization for protected endpoints.
  - Test validation rules in Form Requests.
- **Test Organization**
  - Group related tests using `describe()` blocks.
  - Use descriptive test names that explain what is being tested.
  - Add comments in tests to clarify intent and setup.
- **Test Data**
  - Use factories for creating test data.
  - Use database transactions or RefreshDatabase trait.
  - Avoid hardcoding test data when possible.
- **Progressive Testing**
  - **Month 1**: Focus on backend API tests.
  - **Month 2**: Add Filament admin panel tests.
  - **Month 3**: Add React component tests (if time permits).
- **Common Mistakes to Avoid**
  - ❌ Testing implementation details instead of behavior
  - ❌ Not cleaning up test data
  - ❌ Writing tests that are too complex
  - ❌ Not testing error cases

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