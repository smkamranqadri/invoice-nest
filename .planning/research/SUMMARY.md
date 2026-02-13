# Project Research Summary

**Project:** InvoiceNest
**Domain:** Open-source invoicing workspace for small businesses (self-hosted)
**Researched:** 2026-02-13
**Confidence:** MEDIUM

## Executive Summary

InvoiceNest is a self-hosted invoicing tool for small businesses, a domain with mature, well-understood patterns. Every successful open-source invoicing product (Invoice Ninja, Crater, SolidInvoice) ships as a monolithic full-stack application with a relational database, workspace-based multi-tenancy, and server-side PDF generation. The recommended approach follows this proven path: a Next.js 15 App Router monolith with PostgreSQL, Drizzle ORM, session-based auth via better-auth, and @react-pdf/renderer for PDF output. The stack is modern but grounded -- every choice has a clear rationale tied to the self-hosted deployment model (small Docker images, no external service dependencies, single `docker compose up`).

The core technical risk is deceptive simplicity. Invoicing looks like CRUD but is actually a financial document system with strict rules: money must be stored as integer cents (never floating-point), invoices must become immutable after sending, partial payments introduce rounding edge cases, and every database query must be workspace-scoped to prevent data leakage. These are not theoretical concerns -- they are the top issues in every open-source invoicing project's issue tracker. The research strongly recommends locking down the database schema design first, because retrofitting integer-cents storage, snapshot fields, and soft-delete patterns after data exists is exponentially harder than getting them right initially.

The feature set follows a clear dependency chain: authentication and workspaces form the foundation, customer management enables invoice creation, invoices enable payments and PDF generation, and the dashboard aggregates everything. The MVP is well-scoped: 9 table-stakes features covering auth, customers, invoices, payments, PDF, dashboard, and Docker deployment. High-value differentiators like invoice cloning and tax presets are low-complexity additions for post-MVP polish. High-complexity features (recurring invoices, email delivery, client portal) should be deferred to v2.

## Key Findings

### Recommended Stack

The stack centers on Next.js 15 with App Router as a full-stack framework, chosen because it collapses frontend and backend into a single deployable container -- critical for the self-hosted Docker model. Drizzle ORM over Prisma eliminates the Rust engine binary (50-100MB smaller Docker images) and provides transparent SQL for financial calculations. better-auth provides first-class session-based authentication with a built-in organizations plugin that maps directly to the workspace model. @react-pdf/renderer generates PDFs without a headless browser, keeping Docker images under 200MB.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack React framework -- single container deployment, Server Components for data-heavy pages, Server Actions for mutations
- **PostgreSQL 16+:** Relational database for financial data -- ACID transactions, excellent aggregation queries, rock-solid Docker support
- **Drizzle ORM:** Type-safe SQL with no binary engine -- transparent queries for financial calculations, smaller Docker images than Prisma
- **better-auth:** Session-based auth with organizations plugin -- database-stored sessions, built-in RBAC, no external auth service dependency
- **@react-pdf/renderer:** React-to-PDF rendering -- no headless browser, pure Node.js, JSX templates for invoice PDFs
- **React Hook Form + Zod:** Form handling and validation -- minimal re-renders for complex invoice forms, shared validation schemas client/server
- **decimal.js:** Arbitrary-precision arithmetic for money -- prevents floating-point errors in financial calculations
- **TanStack Query:** Server state caching -- background refetching and optimistic updates for invoice lists and dashboard
- **shadcn/ui (Radix + Tailwind):** Pre-built accessible component patterns -- professional look for a financial tool, fully customizable

**Critical version note:** Tailwind CSS v4 has LOW confidence due to significant configuration changes. Verify shadcn/ui compatibility before committing; fall back to v3.4 if needed.

### Expected Features

**Must have (table stakes -- without these it is not an invoicing product):**
- Authentication with session-based auth, team workspaces, and owner/member roles
- Customer management (CRUD, search, filtering, invoice history, balance tracking)
- Invoice CRUD with line items, tax, discounts, auto-numbering, and status workflow (draft/sent/paid/overdue)
- PDF generation with company branding (logo, name, address)
- Manual payment recording with partial payment support and payment history
- Overdue detection (automatic)
- Dashboard with key metrics (total outstanding, overdue count, period revenue)
- Docker Compose deployment with data persistence

**Should have (ship soon after MVP, low complexity, high impact):**
- Invoice cloning/duplication (one-click copy for repeat billing)
- Tax presets (saved tax rates per workspace)
- Data export (CSV/JSON -- builds trust for self-hosted positioning)
- Bulk actions (multi-select for efficiency)

**Defer (v2+, high complexity):**
- Recurring invoices (requires background job scheduler)
- Email delivery (requires SMTP infrastructure)
- Estimates/quotes with convert-to-invoice
- Client portal (view-only shareable links)
- Multiple invoice templates
- Expense tracking
- Credit notes

**Anti-features (explicitly do not build):**
- Online payment processing (Stripe/PayPal) -- PCI complexity, not feasible for self-hosted v1
- Full accounting / double-entry bookkeeping -- different product category
- Time tracking, CRM, inventory management -- separate domains
- Real-time collaboration -- CRDT complexity for minimal value

### Architecture Approach

The architecture is a monolithic full-stack application with clear internal module boundaries, following the proven pattern of every successful open-source invoicing tool. Data is tightly coupled (invoices reference customers, workspaces, users, payments), making microservices pure overhead. The monolith deploys as a single Docker container alongside PostgreSQL, with workspace-scoped foreign keys providing multi-tenancy isolation. A three-layer internal structure (route handlers for HTTP concerns, service layer for business logic, repository layer for data access) keeps the codebase testable and maintainable.

**Major components:**
1. **Auth Module** -- User registration, login, logout, session management, RBAC middleware. Owns users and sessions tables.
2. **Workspace Module** -- Workspace CRUD, member invitations, role assignment. Provides workspace_id context to all other modules via middleware.
3. **Customer Module** -- Customer CRUD, search, filtering. Owned by workspace, referenced by invoices.
4. **Invoice Module** -- Invoice CRUD, line items, tax/discount calculation, status state machine. Central domain entity with the most business logic.
5. **Payment Module** -- Payment recording (full and partial), balance calculation, payment history. Calls back to Invoice Module for status transitions.
6. **PDF Module** -- Stateless service that renders invoice data to PDF using @react-pdf/renderer. Reads from Invoice, Customer, and Settings modules.
7. **Dashboard Module** -- Read-only aggregation layer over Invoice and Payment data. No own tables.
8. **Settings Module** -- Workspace preferences (currency, tax defaults, invoice numbering, company info). Provides defaults to Invoice Module.

**Key patterns to follow:**
- Workspace-scoped middleware on every authenticated request (prevents data leakage)
- Invoice status state machine with explicit valid transitions
- Computed fields with recalculation (store totals but recalculate from line items on every mutation)
- Repository pattern for data access (testability, centralized workspace scoping)
- Database-level atomic counter for invoice number generation

### Critical Pitfalls

1. **Floating-point currency arithmetic** -- Store ALL money as integer cents in the database. Use decimal.js for calculations. Use Intl.NumberFormat for display only. This must be decided at schema design time; retrofitting is a nightmare. (Phase: schema design)

2. **Tax calculation order-of-operations ambiguity** -- Document the exact calculation formula before writing code: subtotal -> discount -> taxable amount -> tax -> total. Store computed amounts on the invoice record, not just rates. Use a single pure function for all calculations. (Phase: invoice creation)

3. **Partial payment balance drift** -- Integer-cents arithmetic plus a "penny rounding" auto-close rule: if remaining balance < 1 cent after payment, treat as fully paid. Validate that payment amount does not exceed balance. Offer a "pay remaining balance" button. Write integration tests for 3 equal payments on an indivisible amount. (Phase: payment tracking)

4. **Invoice mutability after sending** -- Implement a status-based state machine from day one. Drafts are fully editable; sent invoices are read-only. If a sent invoice needs changes, void it and create a new one. Lock financial fields once any payment exists. (Phase: invoice creation)

5. **Multi-tenant data leakage** -- Implement workspace scoping at the data access layer (middleware + repository pattern), not at individual queries. Add integration tests with two workspaces from the very first feature. Consider PostgreSQL Row Level Security as defense-in-depth. (Phase: auth/workspaces)

6. **PDF generation as afterthought** -- Use @react-pdf/renderer (no headless browser). Design the template with PDF constraints in mind: fixed-width columns, explicit page breaks, test with 1 and 50 line items. Generate asynchronously when possible. Cache generated PDFs. (Phase: PDF generation)

## Implications for Roadmap

Based on combined research, the dependency chain, architecture boundaries, and pitfall timing, the following 6-phase structure is recommended.

### Phase 1: Foundation (Auth + Database + Workspaces)
**Rationale:** Everything depends on authentication and workspace scoping. The database schema must be designed with integer-cents money storage, snapshot fields, soft-delete patterns, and workspace foreign keys from the start. This phase has the highest concentration of critical pitfalls -- getting it wrong forces rewrites.
**Delivers:** Working auth flow (signup, login, logout), workspace creation, member invitation, role-based access, database schema for all entities (designed ahead even if tables are not populated yet), workspace-scoped middleware.
**Addresses:** Auth, workspaces, roles (table stakes), data persistence (table stakes)
**Avoids:** Multi-tenant data leakage (Pitfall 7), session security gaps (Pitfall 9), floating-point money storage (Pitfall 1), missing snapshot fields (Pitfall 13), CASCADE delete issues (Pitfall 10), undefined permissions (Pitfall 14)
**Stack focus:** better-auth, Drizzle ORM, PostgreSQL, @paralleldrive/cuid2, @t3-oss/env-nextjs

### Phase 2: Customer Management
**Rationale:** Invoices require customers. This phase establishes the CRUD pattern that all subsequent entity modules will follow, including the repository pattern, workspace scoping enforcement, and the shadcn/ui-based table/form components.
**Delivers:** Customer CRUD, search/filtering, customer detail page with invoice history (empty until Phase 3), workspace-scoped data access patterns proven and tested.
**Addresses:** Customer CRUD, customer search, customer balance tracking (table stakes)
**Avoids:** Shared database access anti-pattern (establishes repository pattern), God controller anti-pattern (establishes three-layer architecture)
**Stack focus:** shadcn/ui (table, form, dialog components), React Hook Form + Zod, TanStack Query, nuqs (URL state for filters)

### Phase 3: Invoice Creation (Core Domain)
**Rationale:** This is the central feature and the most complex phase. It contains the most domain logic: line item management, tax/discount calculations, the status state machine, invoice numbering, and snapshot data. Multiple critical pitfalls converge here.
**Delivers:** Invoice CRUD with line items, tax and discount calculation, auto-incrementing invoice numbers, status workflow (draft/sent/paid/overdue), invoice detail and list views, company branding settings.
**Addresses:** Invoice CRUD, line items, tax, discounts, numbering, status workflow, due dates, notes/terms, currency display, company branding (table stakes)
**Avoids:** Tax calculation order ambiguity (Pitfall 2), invoice number race conditions (Pitfall 6), invoice mutability after sending (Pitfall 4), date/timezone confusion (Pitfall 11), client-side calculation as source of truth (anti-pattern)
**Stack focus:** decimal.js (money arithmetic), Drizzle ORM (complex queries, transactions), React Hook Form useFieldArray (dynamic line items), date-fns

### Phase 4: Payments + PDF Generation
**Rationale:** These two features are independent of each other but both depend on invoices existing. Payments modify invoice state; PDF reads invoice data. Grouping them allows parallel work streams if there is more than one developer, and they complete the core invoicing workflow end-to-end.
**Delivers:** Manual payment recording, partial payment support, payment history per invoice, auto-mark-paid logic, PDF generation and download, professional invoice template with company branding, overdue detection.
**Addresses:** Payment recording, partial payments, payment history, overdue detection, PDF generation, professional template (table stakes)
**Avoids:** Partial payment balance drift (Pitfall 3), PDF generation performance/memory issues (Pitfall 5), template inflexibility (Pitfall 12)
**Stack focus:** @react-pdf/renderer (PDF), decimal.js (payment balance calculations), Intl.NumberFormat (currency display on PDF)

### Phase 5: Dashboard + Settings + Polish
**Rationale:** The dashboard is a read-only aggregation over all prior data -- it needs invoices, payments, and customers to exist before it can display meaningful metrics. Settings round out the workspace configuration. Polish features (cloning, tax presets, export) are low-complexity, high-impact additions that should ship with the MVP.
**Delivers:** Dashboard with key metrics (total outstanding, overdue count, period revenue, recent invoices), workspace settings page, invoice cloning, tax presets, data export (CSV), bulk actions.
**Addresses:** Dashboard (table stakes), invoice cloning, tax presets, data export, bulk actions (differentiators)
**Avoids:** Dashboard metrics calculated on the fly without proper queries (Pitfall 8)
**Stack focus:** Drizzle ORM (aggregation queries), potentially a charting library for dashboard visualization

### Phase 6: Docker Deployment + Production Readiness
**Rationale:** Docker deployment is the delivery mechanism. Building it last means the application is feature-complete and tested before containerization. This phase also covers production hardening: environment variable validation, health checks, migration runner, and documentation.
**Delivers:** Multi-stage Dockerfile, docker-compose.yml (app + PostgreSQL), environment variable validation, database migration on startup, health checks, self-hosting documentation.
**Addresses:** Docker Compose deployment, data persistence (table stakes)
**Avoids:** Large Docker images (no headless browser, no Prisma engine binary), missing environment configuration for self-hosted users
**Stack focus:** Docker multi-stage build, Next.js standalone output, PostgreSQL Alpine image

### Phase Ordering Rationale

- **Dependency-driven ordering:** Auth -> Customers -> Invoices -> Payments/PDF -> Dashboard follows the hard data dependency chain. Each phase produces data the next phase consumes.
- **Pitfall-front-loaded:** The highest concentration of critical pitfalls falls in Phases 1 and 3 (schema design, money handling, multi-tenancy, state machine). Addressing these early prevents costly rewrites.
- **Architecture-aligned grouping:** Each phase maps cleanly to one or two architecture modules, keeping cognitive scope manageable.
- **Testable increments:** After each phase, the application is in a testable state. After Phase 4, the full invoicing workflow works end-to-end.
- **Docker last, not first:** Building Docker deployment last is intentional. The `next.config.ts` standalone output and Dockerfile are straightforward. Building them early adds build-step overhead to every development iteration without benefit.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** better-auth organizations plugin API needs validation -- the plugin's exact configuration for workspace roles, member invitation flow, and session-workspace association should be prototyped before committing to it.
- **Phase 3 (Invoice Creation):** The tax calculation formula, invoice number generation strategy, and state machine transitions need detailed specification before implementation. This phase has the most domain logic and the most pitfalls.
- **Phase 4 (PDF Generation):** @react-pdf/renderer compatibility with React 19 and Next.js App Router server-side rendering needs verification. Template design constraints (page breaks, column widths) should be prototyped early.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Customer Management):** Standard CRUD with search/filtering. Well-documented patterns with shadcn/ui table + React Hook Form.
- **Phase 5 (Dashboard + Polish):** SQL aggregation queries and UI widgets. Standard patterns, no domain complexity.
- **Phase 6 (Docker Deployment):** Next.js standalone Docker builds are thoroughly documented. Standard multi-stage pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core choices (Next.js, PostgreSQL, Drizzle) are well-established. Version numbers need npm verification. Tailwind v4 + shadcn/ui compatibility is LOW confidence. better-auth organizations plugin maturity is MEDIUM. |
| Features | MEDIUM-HIGH | Invoicing is a mature domain. Table stakes are well-understood and stable. Competitive landscape analysis is based on training data (pre-May 2025) but the domain has not changed significantly. |
| Architecture | MEDIUM-HIGH | Monolith with workspace scoping is the proven pattern for every open-source invoicing tool. Data model and component boundaries are well-established. The specific Next.js App Router patterns (Server Components, Server Actions) are MEDIUM confidence. |
| Pitfalls | HIGH | Financial software pitfalls (floating-point money, tax calculation, partial payments, invoice immutability) are the most thoroughly documented class of software engineering pitfalls. Multi-tenant data leakage is standard security literature. |

**Overall confidence:** MEDIUM

The domain patterns and pitfalls are HIGH confidence. The specific technology versions and integration points (Tailwind v4, better-auth plugin, @react-pdf/renderer + React 19) bring the overall confidence down to MEDIUM because they need runtime verification.

### Gaps to Address

- **Tailwind v4 + shadcn/ui compatibility:** Must verify before project init. If incompatible, fall back to Tailwind v3.4. Run `npx shadcn@latest init` in a test project with Tailwind v4 to confirm.
- **better-auth organizations plugin API:** The plugin's workspace/team management API needs hands-on validation. If the plugin is immature, building custom workspace RBAC on top of better-auth's base session management is a fallback.
- **@react-pdf/renderer + React 19 + App Router:** Server-side PDF rendering in a Next.js App Router context needs a prototype. If incompatible, the fallback is rendering PDFs in an API route (not a Server Component).
- **Drizzle ORM current API surface:** Drizzle was evolving rapidly through 2024-2025. The relational query API, drizzle-zod integration, and migration tooling should be verified against current docs.
- **Invoice calculation formula for target jurisdictions:** The tax calculation order (discount before/after tax) should be validated against the primary target market's accounting practices before locking the formula.
- **Permission matrix for owner/member roles:** The exact permission boundaries need to be defined in Phase 1 planning. The research identifies the need but does not prescribe every permission.

## Sources

### Primary (HIGH confidence)
- PostgreSQL documentation -- ACID transactions, sequences, row-level security, data types
- Docker documentation -- multi-stage builds, Alpine images, compose v2
- Financial software engineering patterns -- integer-cents storage (Stripe pattern), tax calculation standards
- OWASP multi-tenant security guidelines -- workspace isolation, session security

### Secondary (MEDIUM confidence)
- Invoice Ninja architecture and issue patterns (training data, pre-May 2025) -- monolith architecture, tax calculation issues, PDF rendering challenges
- Crater, SolidInvoice, InvoicePlane codebase patterns (training data) -- data models, feature scoping, common bugs
- Next.js 15 App Router patterns (training data) -- Server Components, Server Actions, standalone builds
- Drizzle ORM, better-auth, @react-pdf/renderer APIs (training data) -- need version verification
- FreshBooks, Wave, Zoho Invoice feature sets (training data) -- competitive landscape, table stakes features

### Tertiary (LOW confidence)
- Tailwind CSS v4 configuration and ecosystem compatibility -- major changes from v3, limited ecosystem validation available
- better-auth organizations plugin maturity and API stability -- newer library, plugin ecosystem still developing
- Specific npm package version numbers -- all versions based on training data cutoff, need `npm view` verification

---
*Research completed: 2026-02-13*
*Ready for roadmap: yes*
