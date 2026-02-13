# Roadmap: InvoiceNest

## Overview

InvoiceNest delivers a self-hosted invoicing workspace for small businesses, built as a Next.js 15 monolith with PostgreSQL. The roadmap follows the natural data dependency chain: authentication and workspaces form the foundation, customer management enables invoice creation, invoices enable payments and PDF generation, and the dashboard aggregates everything. Docker deployment seals the application for self-hosting. Six phases take the project from zero to a Docker-ready v1.

## Phases

- [x] **Phase 1: Auth, Workspaces & UI Foundation** - Users can sign up, create workspaces, invite members, and operate within a role-based multi-tenant environment
- [ ] **Phase 2: Customer Management** - Users can manage their customer directory with full CRUD, search, filtering, and status tracking
- [ ] **Phase 3: Invoice Creation** - Users can create, edit, and manage invoices with line items, tax, discounts, and status workflows
- [ ] **Phase 4: Payments & PDF Generation** - Users can record payments against invoices and generate professional PDF documents
- [ ] **Phase 5: Dashboard, Settings & Polish** - Users see a financial overview dashboard and can configure workspace settings, clone invoices, and export data
- [ ] **Phase 6: Docker Deployment** - Application runs via `docker compose up` with persistent data and production-ready configuration

## Phase Details

### Phase 1: Auth, Workspaces & UI Foundation
**Goal**: Users can securely access their accounts, create and manage team workspaces with role-based permissions, and interact with a professional responsive UI built on a consistent design system
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password, log in, log out, and remain logged in across browser refreshes
  2. User can create a workspace with company name and details, and land inside that workspace after creation
  3. Workspace owner can invite members by email, assign owner/member roles, and remove members
  4. Members see only data belonging to their workspace -- no cross-workspace data leakage
  5. Application renders with Radix + Tailwind component library, responsive layout works on desktop and mobile, and all pages share consistent navigation, form, and table patterns
**Plans:** 5 plans

Plans:
- [ ] 01-01-PLAN.md -- Project scaffolding: Next.js, PostgreSQL, Drizzle, better-auth, shadcn/ui
- [ ] 01-02-PLAN.md -- Auth UI: sign-up, sign-in, sign-out, route protection middleware
- [ ] 01-03-PLAN.md -- Dashboard shell: sidebar, header, responsive layout, user menu
- [ ] 01-04-PLAN.md -- Workspace creation, dashboard landing, workspace settings
- [ ] 01-05-PLAN.md -- Member management: invite, accept, roles, removal, permissions

### Phase 2: Customer Management
**Goal**: Users can build and maintain their customer directory within their workspace, with full search, filtering, and status management
**Depends on**: Phase 1
**Requirements**: CUST-01, CUST-02, CUST-03, CUST-04, CUST-05, CUST-06, CUST-07
**Success Criteria** (what must be TRUE):
  1. User can add a new customer with name, email, phone, and address, and edit those details later
  2. User can search customers by name or email and filter the customer list by active/inactive status
  3. User can view a customer detail page showing contact information, outstanding balance, and invoice history (empty until Phase 3)
  4. User can deactivate and reactivate customers without losing their data
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Invoice Creation
**Goal**: Users can create professional invoices with line items, tax, and discounts, manage invoice lifecycle through status transitions, and view/filter their invoice list
**Depends on**: Phase 2
**Requirements**: INV-01, INV-02, INV-03, INV-04, INV-05, INV-06, INV-07, INV-08, INV-09, INV-10, INV-11, INV-12, INV-13, INV-14
**Success Criteria** (what must be TRUE):
  1. User can create an invoice for a customer with line items (description, quantity, unit price), apply a discount (percentage or fixed), and apply a tax rate -- with totals calculated server-side in integer cents
  2. User can save an invoice as draft, edit it freely, then mark it as sent -- at which point it becomes read-only
  3. Each invoice receives an auto-incrementing number unique to the workspace, and overdue invoices are automatically flagged when past their due date
  4. User can view an invoice list with status/customer/amount/due date columns, filter by status and date range, and open any invoice to see full line item detail
  5. Invoice status transitions follow explicit rules (draft to sent, sent to void, etc.) and are enforced by the system
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Payments & PDF Generation
**Goal**: Users can record full and partial payments against invoices and generate downloadable PDF documents with professional branding
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Success Criteria** (what must be TRUE):
  1. User can record a manual payment against an invoice (amount, date, method, notes), including multiple partial payments, and payment amount cannot exceed the remaining balance
  2. Invoice automatically transitions to "paid" status when the full balance is received, and financial fields lock once any payment exists
  3. User can view payment history on the invoice detail page and see the remaining balance after partial payments
  4. User can generate and download a PDF for any invoice that includes company branding, customer info, all line items, tax, discount, total, and due date
  5. PDF renders correctly with both small (1 line item) and large (50+ line items) invoices, with proper page breaks
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Dashboard, Settings & Polish
**Goal**: Users see a financial overview of their workspace at a glance and can configure workspace-level settings, clone invoices, and export data
**Depends on**: Phase 4
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, SET-01, SET-02, SET-03, SET-04, SET-05
**Success Criteria** (what must be TRUE):
  1. Dashboard displays total outstanding amount, count of overdue invoices, revenue received in the current period, and a list of recent invoices with status indicators -- all scoped to the active workspace
  2. Workspace owner can configure company details (name, address, logo) for PDF branding, set default currency, and create reusable tax rate presets
  3. User can clone an existing invoice as a new draft with one action
  4. User can export invoice and payment data as CSV
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Docker Deployment
**Goal**: Application is containerized and runnable with a single `docker compose up` command, with persistent data and production-ready configuration
**Depends on**: Phase 5
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05
**Success Criteria** (what must be TRUE):
  1. Running `docker compose up` starts the application and PostgreSQL containers, and the app is accessible in a browser
  2. Database migrations run automatically on container startup without manual intervention
  3. All configuration is handled via environment variables (database URL, session secret, etc.) with validation on startup
  4. Data persists across container restarts via Docker volumes, and a health check endpoint is available for monitoring
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Auth, Workspaces & UI Foundation | 5/5 | ✓ Complete | 2026-02-13 |
| 2. Customer Management | 0/TBD | Not started | - |
| 3. Invoice Creation | 0/TBD | Not started | - |
| 4. Payments & PDF Generation | 0/TBD | Not started | - |
| 5. Dashboard, Settings & Polish | 0/TBD | Not started | - |
| 6. Docker Deployment | 0/TBD | Not started | - |
