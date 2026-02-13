# Architecture Patterns

**Domain:** Open-source invoicing workspace (self-hosted, multi-tenant)
**Researched:** 2026-02-13
**Overall Confidence:** MEDIUM (based on established patterns from Invoice Ninja, Crater, SolidInvoice, and standard financial SaaS architecture; no live source verification available)

## Recommended Architecture

**Monolithic full-stack application with clear internal module boundaries.**

InvoiceNest is a self-hosted product aimed at small businesses. A monolith is the correct architecture because:

1. **Single `docker compose up` deployment** -- microservices add orchestration complexity that directly contradicts the "minimal configuration" constraint.
2. **Small team / solo maintainer** -- a monolith with clean module boundaries is easier to reason about, test, and deploy than distributed services.
3. **Data is tightly coupled** -- invoices reference customers, workspaces, users, and payments. Cross-service queries would add latency and complexity for zero benefit at this scale.
4. **Proven pattern** -- Invoice Ninja (Laravel monolith), Crater (Laravel + Vue monolith), and SolidInvoice (Symfony monolith) all ship as monoliths. No major open-source invoicing tool uses microservices.

```
+------------------------------------------------------------------+
|                        BROWSER (SPA)                             |
|  [Auth Pages] [Dashboard] [Customers] [Invoices] [Settings]     |
+------------------------------+-----------------------------------+
                               |
                          HTTP / REST API
                               |
+------------------------------v-----------------------------------+
|                        API SERVER                                |
|                                                                  |
|  +------------------+  +------------------+  +----------------+  |
|  |   Auth Module    |  | Workspace Module |  | Customer Module|  |
|  | - signup/login   |  | - CRUD workspace |  | - CRUD customer|  |
|  | - sessions       |  | - invite members |  | - search/filter|  |
|  | - RBAC middleware |  | - role mgmt      |  | - status track |  |
|  +------------------+  +------------------+  +----------------+  |
|                                                                  |
|  +------------------+  +------------------+  +----------------+  |
|  | Invoice Module   |  | Payment Module   |  | PDF Module     |  |
|  | - CRUD invoice   |  | - record payment |  | - render HTML  |  |
|  | - line items     |  | - partial payment|  | - convert PDF  |  |
|  | - tax/discount   |  | - balance calc   |  | - serve file   |  |
|  | - status machine |  | - payment history|  |                |  |
|  +------------------+  +------------------+  +----------------+  |
|                                                                  |
|  +------------------+  +------------------+                      |
|  | Dashboard Module |  | Settings Module  |                      |
|  | - aggregations   |  | - workspace prefs|                      |
|  | - period queries |  | - user profile   |                      |
|  | - metric calcs   |  | - invoice config |                      |
|  +------------------+  +------------------+                      |
|                                                                  |
+------------------------------+-----------------------------------+
                               |
                    +----------v-----------+
                    |     PostgreSQL        |
                    |  (single database,    |
                    |   workspace-scoped    |
                    |   via foreign keys)   |
                    +----------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Boundary Rule |
|-----------|---------------|-------------------|---------------|
| **Auth Module** | User registration, login, logout, session management, RBAC middleware | All modules (middleware), Workspace Module (user-workspace association) | Owns `users` and `sessions` tables. Other modules receive `userId` and `role` from middleware -- never query auth tables directly. |
| **Workspace Module** | Workspace CRUD, member invitations, role assignment, workspace-scoped data isolation | Auth Module (user identity), all other modules (workspace context) | Owns `workspaces` and `workspace_members` tables. Every data-bearing module receives `workspaceId` from middleware. |
| **Customer Module** | Customer CRUD, search, filtering, status tracking | Invoice Module (customer referenced on invoices), Workspace Module (scoping) | Owns `customers` table. Exposes customer data to Invoice Module via service layer, not direct table access. |
| **Invoice Module** | Invoice CRUD, line item management, tax/discount calculation, status state machine (draft -> sent -> paid/overdue) | Customer Module (customer association), Payment Module (balance tracking triggers status transitions), PDF Module (render source) | Owns `invoices` and `invoice_line_items` tables. Central domain entity. Status transitions are explicit methods, not raw updates. |
| **Payment Module** | Record payments (full or partial), calculate remaining balance, payment history | Invoice Module (updates invoice balance and status) | Owns `payments` table. When a payment is recorded, it calls back to Invoice Module to recalculate balance and potentially transition status to "paid". |
| **PDF Module** | Render invoice data to HTML template, convert HTML to PDF, serve PDF files | Invoice Module (reads invoice data), Customer Module (reads customer data for address block) | Stateless service -- no tables. Reads from Invoice and Customer modules, produces binary PDF output. |
| **Dashboard Module** | Aggregate financial metrics: total outstanding, overdue count, recent invoices, period revenue | Invoice Module (query invoices), Payment Module (query payments) | No own tables. Read-only aggregation layer over Invoice and Payment data. |
| **Settings Module** | Workspace preferences (currency, tax defaults, invoice numbering, company info), user profile | Workspace Module (workspace-level settings), Auth Module (user-level settings) | Owns `workspace_settings` table. Provides defaults that Invoice Module reads when creating new invoices. |

### Data Flow

#### Invoice Creation Flow (primary flow)

```
User action: "Create Invoice"
     |
     v
[Frontend] POST /api/invoices
     |
     v
[RBAC Middleware] -- verify user is authenticated, belongs to workspace, has permission
     |
     v
[Invoice Module]
  1. Validate customer exists (call Customer Module)
  2. Create invoice record (status: "draft")
  3. Create line items
  4. Calculate subtotal, apply tax/discount
  5. Set total amount and amount_due
  6. Return invoice with computed fields
     |
     v
[Frontend] -- displays invoice editor
```

#### Payment Recording Flow

```
User action: "Record Payment" on invoice #123
     |
     v
[Frontend] POST /api/invoices/123/payments { amount: 500 }
     |
     v
[RBAC Middleware]
     |
     v
[Payment Module]
  1. Validate amount > 0 and amount <= invoice.amount_due
  2. Create payment record
  3. Call Invoice Module to recalculate:
     - invoice.amount_paid += payment.amount
     - invoice.amount_due = invoice.total - invoice.amount_paid
     - If amount_due == 0: transition status to "paid"
     - If amount_due > 0 and status was "sent": keep "sent" (or "partially_paid" if you add that status)
  4. Return updated invoice + payment record
```

#### PDF Generation Flow

```
User action: "Download PDF" for invoice #123
     |
     v
[Frontend] GET /api/invoices/123/pdf
     |
     v
[RBAC Middleware]
     |
     v
[PDF Module]
  1. Fetch invoice + line items from Invoice Module
  2. Fetch customer details from Customer Module
  3. Fetch workspace settings (company name, logo, address) from Settings Module
  4. Render HTML template with all data
  5. Convert HTML -> PDF (using headless browser or PDF library)
  6. Return PDF as binary response (Content-Type: application/pdf)
```

#### Dashboard Aggregation Flow

```
User navigates to Dashboard
     |
     v
[Frontend] GET /api/dashboard?period=current_month
     |
     v
[RBAC Middleware]
     |
     v
[Dashboard Module]
  1. Query invoices table (scoped to workspace):
     - SUM(amount_due) WHERE status IN ('sent', 'overdue') -> total_outstanding
     - COUNT(*) WHERE status = 'overdue' -> overdue_count
     - SELECT recent invoices ORDER BY created_at DESC LIMIT 10
  2. Query payments table (scoped to workspace + period):
     - SUM(amount) WHERE created_at IN period -> period_revenue
  3. Return aggregated metrics
```

## Data Model (Entity Relationships)

```
workspaces
  |-- workspace_members (junction: workspace + user + role)
  |     |-- users (via user_id)
  |
  |-- customers
  |     |-- invoices (customer_id FK)
  |           |-- invoice_line_items (invoice_id FK)
  |           |-- payments (invoice_id FK)
  |
  |-- workspace_settings (1:1 with workspace)

users
  |-- sessions (user_id FK)
```

**Key design decisions in the data model:**

1. **Workspace scoping via foreign keys** -- every customer, invoice, and payment belongs to a workspace. All queries filter by `workspace_id`. This is simpler and more performant than row-level security or schema-per-tenant for the expected scale (small businesses, not enterprise multi-tenant SaaS).

2. **Denormalized totals on invoices** -- store `subtotal`, `tax_amount`, `discount_amount`, `total`, `amount_paid`, and `amount_due` directly on the invoice record. Recalculate on line item or payment changes. This avoids expensive JOINs for list views and dashboard queries.

3. **Invoice status as explicit enum** -- `draft`, `sent`, `paid`, `overdue`. Transitions are enforced in application logic (state machine pattern), not just string updates. `overdue` is set by a scheduled check or on-access check (invoices past due_date with status "sent" and amount_due > 0).

4. **Soft-delete for financial records** -- invoices and payments should use soft delete (`deleted_at` timestamp) rather than hard delete. Financial records may be needed for auditing.

## Patterns to Follow

### Pattern 1: Workspace-Scoped Middleware

**What:** Every API route (except auth routes) passes through middleware that extracts the workspace context and injects it into the request. All database queries are automatically scoped to that workspace.

**When:** Every authenticated request.

**Why:** Prevents data leaks between workspaces. A single point of enforcement rather than remembering to filter in every query.

```typescript
// Middleware pseudocode
async function workspaceScope(req, res, next) {
  const workspaceId = req.params.workspaceId || req.session.activeWorkspaceId;
  const membership = await db.workspaceMembers.findOne({
    userId: req.session.userId,
    workspaceId,
  });
  if (!membership) return res.status(403).json({ error: "Not a member" });

  req.workspace = { id: workspaceId, role: membership.role };
  next();
}
```

### Pattern 2: Invoice Status State Machine

**What:** Invoice status transitions are explicit and validated. Not every status can transition to every other status.

**When:** Any operation that changes invoice status.

**Why:** Prevents invalid states (e.g., marking a draft as "paid" without it ever being "sent"). Makes business rules explicit and testable.

```typescript
const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["sent"],
  sent: ["paid", "overdue", "draft"],  // Can revert to draft for editing
  overdue: ["paid", "sent"],            // Can be marked sent again (e.g., resent)
  paid: [],                             // Terminal state -- cannot transition out
};

function transitionInvoiceStatus(current: InvoiceStatus, target: InvoiceStatus): void {
  if (!VALID_TRANSITIONS[current].includes(target)) {
    throw new Error(`Cannot transition from ${current} to ${target}`);
  }
}
```

### Pattern 3: Computed Fields with Recalculation

**What:** Invoice totals (subtotal, tax, discount, total, amount_due) are stored but recalculated whenever line items or payments change. Never trust the stored value as the source of truth during writes -- recalculate from line items.

**When:** Any mutation to line items, tax rate, discount, or payment recording.

**Why:** Avoids stale data. Stored values are a cache for reads (list views, dashboard), not the canonical source.

```typescript
function recalculateInvoice(invoice: Invoice, lineItems: LineItem[], payments: Payment[]) {
  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const discountAmount = invoice.discountType === "percentage"
    ? subtotal * (invoice.discountValue / 100)
    : invoice.discountValue;
  const total = subtotal + taxAmount - discountAmount;
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountDue = total - amountPaid;

  return { subtotal, taxAmount, discountAmount, total, amountPaid, amountDue };
}
```

### Pattern 4: Repository Pattern for Data Access

**What:** Each module accesses the database through a repository layer (or service layer) rather than writing raw queries in route handlers.

**When:** All database operations.

**Why:** Testability (mock repositories in tests), single place to enforce workspace scoping, and clean separation between HTTP handling and data logic.

```typescript
// invoiceRepository.ts
class InvoiceRepository {
  async findByWorkspace(workspaceId: string, filters: InvoiceFilters) { ... }
  async findById(workspaceId: string, invoiceId: string) { ... }
  async create(workspaceId: string, data: CreateInvoiceInput) { ... }
  async updateStatus(workspaceId: string, invoiceId: string, status: InvoiceStatus) { ... }
}
```

### Pattern 5: Invoice Number Generation

**What:** Auto-generate sequential invoice numbers per workspace (e.g., INV-0001, INV-0002). Use a counter stored in workspace_settings or a dedicated sequence.

**When:** On invoice creation (when moving from unsaved to draft, or on first save).

**Why:** Users expect professional, sequential numbering. Must be unique within a workspace but does not need global uniqueness.

**Important:** Use a database-level mechanism (e.g., `SELECT ... FOR UPDATE` on the workspace counter row, or a PostgreSQL sequence per workspace) to prevent duplicate numbers under concurrent creation.

## Anti-Patterns to Avoid

### Anti-Pattern 1: God Controller / Fat Route Handlers

**What:** Putting all business logic (validation, calculation, status transitions, PDF generation) directly in API route handlers.

**Why bad:** Untestable, unreusable, becomes unmaintainable as features grow. Invoice total calculation logic ends up duplicated across create, update, and payment recording handlers.

**Instead:** Three-layer architecture: Route handlers (HTTP concerns only) -> Service layer (business logic, orchestration) -> Repository layer (data access). Route handlers should be thin -- extract params, call service, return response.

### Anti-Pattern 2: Shared Database Access Across Modules

**What:** The Payment module directly queries and updates the `invoices` table, or the Dashboard module writes to invoice/payment tables.

**Why bad:** Breaks module boundaries. Changes to the invoices table schema ripple unpredictably into payment and dashboard code. Business rules (like status transitions) get bypassed.

**Instead:** Modules interact through service-layer calls. Payment Module calls `invoiceService.applyPayment()` rather than running `UPDATE invoices SET amount_due = ...`.

### Anti-Pattern 3: Client-Side Calculation as Source of Truth

**What:** Calculating invoice totals in the frontend and sending computed values to the API.

**Why bad:** Users can manipulate requests. Floating-point differences between client and server. Two sources of truth that can diverge.

**Instead:** Frontend calculates for display (immediate UX feedback), but the server always recalculates from line items on save. Server response is authoritative.

### Anti-Pattern 4: String-Based Status Without Validation

**What:** Storing invoice status as a free-form string and allowing any value to be set via API.

**Why bad:** Invalid states, no transition validation, typos create ghost statuses, reporting becomes unreliable.

**Instead:** Enum type in database, state machine in application code, validated transitions.

### Anti-Pattern 5: No Workspace Scoping Enforcement

**What:** Relying on individual queries to include `WHERE workspace_id = ?` without a centralized mechanism.

**Why bad:** A single forgotten filter leaks data between workspaces. This is a security vulnerability in a multi-tenant system.

**Instead:** Centralized workspace scoping middleware (Pattern 1 above) plus repository-layer enforcement as defense in depth.

## Scalability Considerations

| Concern | At 10 users (single team) | At 1K users (many teams) | At 10K+ users |
|---------|--------------------------|--------------------------|---------------|
| **Database** | Single PostgreSQL, no optimization needed | Add indexes on `workspace_id` + `status`, `workspace_id` + `customer_id`. Connection pooling. | Consider read replicas for dashboard queries. Partition by workspace_id if needed. |
| **PDF generation** | Synchronous in request handler is fine | Move to background job queue (Bull/BullMQ) to avoid blocking API. Return job ID, poll for completion. | Dedicated PDF worker containers. Cache generated PDFs in object storage. |
| **Dashboard queries** | Direct SQL aggregation | Materialized views or cached aggregations (refresh on payment/invoice change) | Pre-computed metrics table, updated via events/triggers. |
| **Session storage** | Database-backed sessions are fine | Move sessions to Redis for faster lookups | Redis cluster or managed Redis |
| **File storage** | Local filesystem for generated PDFs | Local volume mount in Docker | S3-compatible object storage (MinIO for self-hosted) |

**For InvoiceNest v1:** The "10 users" column is the target. Do not prematurely optimize. The architecture supports growth without rewrites because the module boundaries are clean -- you can add a job queue for PDF generation later without changing the API contract.

## Suggested Build Order

The build order is dictated by hard dependencies between components.

```
Phase 1: Auth + Database Schema
   |  (nothing works without authentication and the database)
   v
Phase 2: Workspaces + RBAC
   |  (all data is workspace-scoped, so this must exist before any domain entities)
   v
Phase 3: Customer Management
   |  (invoices reference customers, so customers must exist first)
   v
Phase 4: Invoices + Line Items + Tax/Discount
   |  (core domain entity -- depends on customers and workspaces)
   v
Phase 5: Payments + PDF Generation
   |  (payments reference invoices, PDF renders invoice data)
   |  (these two are independent of each other and can be parallel)
   v
Phase 6: Dashboard + Settings + Polish
   (dashboard aggregates over invoices + payments -- needs both to exist)
   (settings enhance the workflow but nothing depends on them critically)
```

**Why this order:**

1. **Auth first** because every subsequent API endpoint needs authenticated sessions and user identity. You cannot test anything meaningful without login.

2. **Workspaces before domain entities** because workspace_id is a foreign key on customers, invoices, and payments. The workspace scoping middleware must exist before you build any CRUD operations.

3. **Customers before invoices** because an invoice always references a customer. You need at least one customer to create a test invoice.

4. **Invoices as the central phase** because this is the core product. Line items, tax, and discount calculations are part of the invoice entity. This phase has the most domain logic.

5. **Payments and PDF together** because they are independent of each other but both depend on invoices existing. Payments modify invoice state. PDF reads invoice data. Neither depends on the other.

6. **Dashboard last** because it is a read-only aggregation over all other data. It has no dependents. Building it last means you have real test data from all prior phases to validate the metrics.

## Technology Notes (Architecture-Level)

These are architectural preferences, not full stack decisions (see STACK.md for that).

| Architectural Concern | Recommendation | Rationale |
|----------------------|----------------|-----------|
| **API style** | REST with JSON | Standard for CRUD-heavy apps. GraphQL adds complexity for no benefit here -- the data shapes are predictable. |
| **Authentication** | Session cookies + server-side session store | Per project constraints. Simpler than JWT for self-hosted. Session stored in PostgreSQL (or Redis later). |
| **Database** | PostgreSQL | Relational data with strong consistency needed for financial records. Enum types, JSON columns for flexible settings, excellent indexing. |
| **PDF approach** | HTML template -> PDF conversion | Easier to design and maintain than programmatic PDF construction. Use a library that wraps headless Chromium or a native PDF renderer. |
| **Monorepo structure** | Single repo, frontend + backend in subdirectories | Simplifies Docker build, CI/CD, and deployment. `apps/web` + `apps/api` or `client/` + `server/`. |
| **State management** | Server-authoritative | All business logic (calculations, status transitions) lives on the server. Frontend is a presentation layer. |

## Sources

- Architecture patterns derived from analysis of established open-source invoicing systems: Invoice Ninja (Laravel monolith, 10K+ GitHub stars), Crater (Laravel + Vue, 8K+ stars), SolidInvoice (Symfony monolith)
- Multi-tenant workspace patterns from standard SaaS architecture (workspace-scoped foreign keys vs. schema-per-tenant vs. row-level security)
- Invoice domain modeling from common accounting/invoicing domain patterns (line items, tax calculation, partial payments, status state machines)
- **Confidence note:** These patterns are well-established and stable in the invoicing domain. The core architecture (monolith, relational DB, workspace scoping, invoice state machine) has not changed meaningfully in recent years. MEDIUM confidence overall only because live source verification was unavailable -- the patterns themselves are HIGH confidence.
