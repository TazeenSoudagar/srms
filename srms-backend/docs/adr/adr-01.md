## Architecture Decision Records (ADR)

This file tracks key architecture decisions for the SRMS project. Each ADR is numbered and kept stable over time. New decisions are appended, old ones are never deleted—only superseded.

---

### ADR-001: Monorepo Structure and Core Tech Stack

**Status:** Accepted  
**Date:** 2025-12-08

#### Context

SRMS is a 3‑month performance improvement project targeting full‑stack skills across Laravel, Filament, React, TypeScript, SQL, and Node.js. The system consists of:

- A Laravel API backend.
- A React SPA frontend.
- A Node.js microservice (for reporting/auxiliary features).
- Shared documentation and learning logs.

A consistent structure is needed so that all parts of the system evolve together, share standards, and are easy to manage from a single GitHub project.

#### Decision

1. **Monorepo**
   - Use a single GitHub repository named `srms` containing:
     - `srms-backend/` – Laravel API (PSR‑12, `declare(strict_types=1);`, Pest tests, Filament admin).
     - `srms-front-end/` – React + TypeScript SPA.
     - `srms-node-js/` – Node.js + Express microservices.
     - `docs/` – ERD diagrams, API docs, ADRs, and daily learning logs.

2. **Core Tech Stack**
   - **Backend:** Laravel (latest stable; reference: https://laravel.com/docs/12.x) with:
     - Sanctum for SPA authentication.
     - PestPHP for tests.
     - Feature‑based folder structure (e.g. `Users`, `ServiceRequests`, `Comments`).
   - **Admin Panel:** FilamentPHP 3.x for internal/admin management.
   - **Frontend:** React + TypeScript SPA consuming Laravel APIs.
   - **Microservice:** Node.js + Express, initially for reporting/aggregations.
   - **Database:** MySQL with an ERD‑first design and explicit migrations/factories/seeders.

3. **Documentation & Learning**
   - All architectural decisions are recorded in `docs/adr.md`.
   - Daily logs, mistakes, and learnings are recorded under `docs/logs/`.
   - Global development rules are centralized in `docs/global-dev-rules.md`.

#### Consequences

- **Pros**
  - Single repo simplifies issue tracking, GitHub board usage, and cross‑cutting refactors.
  - Shared `docs/` ensures backend, frontend, and Node services follow the same conventions.
  - Encourages consistent, feature-based organization and clear separation of concerns.
  - Makes it easier to review progress against the 3‑month PIP.

- **Cons**
  - The monorepo can become large; requires discipline in tooling and CI configuration.
  - Tight coupling of backend/frontend/microservice release cycles.
  - Requires careful documentation so that new contributors understand the structure.

- **Next Steps**
  - Keep adding ADRs when making significant decisions, for example:
    - ADR‑002: Authentication strategy (Sanctum, guards, token format).
    - ADR‑003: Service Request status/priority enums and workflow design.
    - ADR‑004: Node.js reporting microservice responsibility boundaries.

---

*(Future ADRs will be appended below this line.)*