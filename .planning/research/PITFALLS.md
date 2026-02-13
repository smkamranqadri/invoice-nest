# Domain Pitfalls

**Domain:** Open-source invoicing workspace (self-hosted, multi-tenant)
**Project:** InvoiceNest
**Researched:** 2026-02-13
**Research basis:** Training data from open-source invoicing projects (Invoice Ninja, Crater, SolidInvoice, InvoicePlane), financial software engineering patterns, currency handling standards. Web verification was unavailable during this research session.
**Overall confidence:** MEDIUM (training-data-driven; recommend validating critical pitfalls against Invoice Ninja and Crater issue trackers)

---

## Critical Pitfalls

Mistakes that cause data corruption, financial inaccuracies, or forced rewrites.

---

### Pitfall 1: Floating-Point Currency Arithmetic

**What goes wrong:** Using JavaScript `Number` (IEEE 754 float) for money calculations. `0.1 + 0.2 = 0.30000000000000004`. In invoicing, this compounds across line items, tax calculations, and partial payments, producing invoices where line item totals do not sum to the invoice total. Users lose trust immediately when numbers do not add up on a financial document.

**Why it happens:** JavaScript has no native decimal type. Developers use `Number` by default and only discover rounding drift after shipping, often through user bug reports about 1-cent discrepancies.

**Consequences:**
- Invoice totals off by pennies (destroys credibility)
- Partial payment balances that never reach zero (e.g., $0.01 remaining forever)
- PDF totals not matching database totals if calculated independently
- Tax calculations that disagree with what accountants expect
- Cascading errors in dashboard financial metrics

**Prevention:**
- Store all monetary values as **integers in the smallest currency unit** (cents for USD). Store `$49.99` as `4999`. This is the Stripe pattern and the industry standard.
- Perform ALL arithmetic on integers. Only convert to display format at the presentation layer.
- Use a library like `dinero.js` (v2) or a simple utility module that enforces integer-cents throughout.
- Define a `Money` type or value object that prevents raw number arithmetic.
- Never store prices as floats in the database. Use `INTEGER` or `BIGINT` columns, not `DECIMAL`/`NUMERIC` (those still allow fractional cents in some ORMs).

**Detection (warning signs):**
- Any `parseFloat` or `Number()` used on monetary values
- Database columns typed as `FLOAT`, `DOUBLE`, or `REAL` for money
- Arithmetic operations (`+`, `*`) on money values without a cents-based wrapper
- Tests that use `toBeCloseTo` instead of exact equality for money

**Phase relevance:** Must be decided in Phase 1 (database schema design). Retrofitting cents-based storage after data exists requires a migration that touches every row.

**Confidence:** HIGH -- this is the single most well-documented pitfall in financial software engineering.

---

### Pitfall 2: Tax Calculation Order-of-Operations Ambiguity

**What goes wrong:** Tax and discount interact in ways that produce different totals depending on calculation order. Consider: 3 line items, 10% tax, $20 discount. Does tax apply before or after discount? Does discount apply to individual items or the subtotal? Is tax calculated per-line-item then summed, or calculated on the subtotal? Each approach yields a different total, and all are "correct" in different jurisdictions.

**Why it happens:** Developers pick one calculation method and hardcode it. Users in different regions or with different accounting practices expect a different method. The difference is often only a few cents, so it passes QA -- but accountants notice.

**Consequences:**
- Tax amounts that disagree with users' accounting software
- Invoices that fail tax authority audits
- Bug reports that are impossible to "fix" without making other users' invoices wrong
- Forced introduction of a "calculation mode" setting late in development

**Prevention:**
- Define and document the **invoice calculation formula explicitly** before writing any code:
  ```
  subtotal = SUM(line_qty * line_unit_price)  -- integer cents
  discount_amount = apply_discount(subtotal, discount)
  taxable_amount = subtotal - discount_amount
  tax_amount = ROUND(taxable_amount * tax_rate)
  total = taxable_amount + tax_amount
  ```
- Store the **computed tax amount and discount amount** on the invoice record, not just the rate/percentage. This preserves the exact numbers even if calculation logic changes later.
- Round tax to the nearest cent ONCE at the invoice level, not per line item. Per-line-item rounding causes cumulative drift.
- Consider making the calculation engine a single pure function with unit tests covering edge cases (zero tax, 100% discount, single item, many items).

**Detection:**
- No explicit documentation of calculation order
- Tax percentage stored but tax amount not stored
- Different code paths calculating totals (e.g., frontend vs. backend vs. PDF generator)

**Phase relevance:** Must be locked down in the invoice creation phase. This is a design decision, not a bug fix.

**Confidence:** HIGH -- Invoice Ninja has dozens of issues related to tax calculation order, and it is the most debated topic in invoicing software forums.

---

### Pitfall 3: Partial Payment Balance Drift

**What goes wrong:** The invoice "amount due" is calculated as `total - SUM(payments)` dynamically. Over multiple partial payments with rounding, the remaining balance drifts. Users record a "final" payment but $0.01 remains. Or worse, overpayment is silently allowed, producing a negative balance.

**Why it happens:** Each partial payment amount is independently rounded, and the sum of rounded values does not equal the rounded total. Additionally, there is no validation that a payment does not exceed the remaining balance.

**Consequences:**
- Invoices stuck in "partially paid" status forever
- Dashboard metrics showing perpetual outstanding amounts of a few cents
- Users manually editing payment amounts to force-close invoices
- Overpayments corrupting financial reports

**Prevention:**
- Store `amount_due` as a **derived field** recalculated from stored payment records, but also store a `balance_remaining` that is decremented on each payment as an integrity check.
- When recording a payment: if the remaining balance after this payment is less than the smallest currency unit (1 cent), automatically treat the invoice as fully paid. This is the "penny rounding" rule.
- Validate: `payment_amount <= balance_remaining`. Reject or warn on overpayment.
- On the "final" payment, offer a "pay remaining balance" button that auto-fills the exact remaining amount rather than requiring manual entry.
- Write integration tests specifically for: 3 equal payments on an amount not divisible by 3 (e.g., $100 split into 3 payments of $33.33, $33.33, $33.34).

**Detection:**
- No test for "three equal payments on indivisible amount"
- No minimum-balance auto-close logic
- Payment form allows entering amounts greater than balance due
- `amount_due` calculated differently in different places

**Phase relevance:** Payment tracking phase. Design the payment model with this in mind from day one.

**Confidence:** HIGH -- this is a variant of the floating-point pitfall but specific to the multi-payment workflow. Every invoicing app eventually encounters this.

---

### Pitfall 4: Invoice Mutability After Sending

**What goes wrong:** Invoices are editable after being marked as "sent" or after payments have been recorded against them. A user edits a sent invoice's line items, changing the total, but the PDF already sent to the customer shows the old total. Or worse, a payment was recorded against the old total, so the balance is now wrong.

**Why it happens:** Developers treat invoices like any other CRUD entity. Edit, save, done. But invoices are **financial documents** -- once sent, they become a contract between parties.

**Consequences:**
- Sent PDF and database disagree on amounts
- Payments recorded against a total that no longer exists
- Audit trail broken -- no way to know what the customer actually received
- Legal/tax compliance issues (in many jurisdictions, modifying a sent invoice is not allowed; you must issue a credit note)

**Prevention:**
- Implement **invoice status as a state machine** with strict transition rules:
  ```
  draft -> sent -> partially_paid -> paid
                -> overdue
  draft -> void
  sent -> void (creates credit note)
  ```
- **Drafts are fully editable.** Once status is `sent` or beyond, the invoice is immutable (or editable only through a "revise" action that creates a new version and voids the old one).
- At minimum: lock line items, tax, and discount once any payment exists. The total must not change after money is recorded against it.
- Store a `locked_at` timestamp. Once locked, reject mutations to financial fields.
- For v1, the simplest approach: invoices with status != `draft` are read-only. If you need to change something, void and create a new invoice.

**Detection:**
- No status-based field protection on the invoice edit API
- Invoice update endpoint does not check current status before allowing changes
- No audit log or version history on invoices

**Phase relevance:** Invoice CRUD phase. The state machine must be designed with immutability rules from the start. Retrofitting immutability onto a mutable CRUD model is painful.

**Confidence:** HIGH -- this is a fundamental domain rule that generic CRUD thinking misses.

---

### Pitfall 5: PDF Generation as an Afterthought

**What goes wrong:** PDF generation is treated as a "just slap the data into a template" task. In practice, it is one of the hardest parts of an invoicing app. Problems include: inconsistent rendering across environments, memory exhaustion on server-side rendering, slow generation blocking the request, templates that break with long company names or many line items, and PDFs that look different from the web preview.

**Why it happens:** PDF generation libraries in Node.js are all imperfect. Puppeteer/Playwright (headless Chrome) produce beautiful PDFs but consume 200+ MB RAM per instance and are slow. Libraries like `pdfkit` or `jsPDF` are lightweight but require manual layout (no HTML/CSS). `react-pdf` (@react-pdf/renderer) uses its own layout engine that does not support all CSS.

**Consequences:**
- Docker containers OOM-killed during PDF generation
- 10-second+ response times for generating a single invoice PDF
- PDFs that overflow pages, clip text, or misalign columns
- Web preview and PDF looking completely different
- Self-hosted users on low-memory machines unable to generate PDFs at all

**Prevention:**
- Choose a PDF strategy early and prototype it before building the invoice UI:
  - **Recommended for self-hosted:** Use `@react-pdf/renderer` or a similar non-browser approach. Avoid headless Chrome for a self-hosted product -- the memory overhead is unacceptable for users running on a $5 VPS.
  - Alternative: Generate PDFs from HTML using `gotenberg` (a Docker microservice wrapping LibreOffice/Chromium). This offloads the memory cost to a separate container with defined resource limits.
- Design the invoice template with PDF constraints in mind from the start:
  - Fixed-width columns, not fluid layouts
  - Explicit page break logic for invoices with many line items
  - Test with: 1 line item, 50 line items, very long item descriptions, very long company names
- Generate PDFs **asynchronously**. Never block an API response on PDF generation. Generate in background, store the file, return a download URL.
- Cache generated PDFs. Regenerate only when invoice data changes (which should be never after sending -- see Pitfall 4).

**Detection:**
- PDF generation happening synchronously in an API route handler
- No testing with large invoices (50+ line items)
- Using Puppeteer/headless Chrome in the main application container
- No defined resource limits for PDF generation

**Phase relevance:** PDF generation phase. But the invoice data model (Pitfall 2, calculation order) and template design should be PDF-aware from the invoice creation phase.

**Confidence:** HIGH -- PDF generation is the most common "harder than expected" feature in every invoicing project. Invoice Ninja, Crater, and InvoicePlane all have extensive issue histories around PDF rendering.

---

### Pitfall 6: Invoice Number Generation Race Conditions

**What goes wrong:** Invoice numbers must be unique and sequential (e.g., INV-001, INV-002). Two users creating invoices simultaneously get the same number. Or, a voided invoice leaves a gap in the sequence, which some jurisdictions consider a compliance violation.

**Why it happens:** Developers use `SELECT MAX(number) + 1` or application-level counters without proper concurrency control. In a multi-user workspace, two requests can read the same max and produce a duplicate.

**Consequences:**
- Duplicate invoice numbers (confuses customers, breaks accounting imports)
- Gaps in sequences (compliance issues in some regions)
- Race conditions that only appear under concurrent usage, not in development

**Prevention:**
- Use a **database-level sequence or counter table with row-level locking**:
  ```sql
  -- Counter table approach
  UPDATE workspace_counters SET next_invoice_number = next_invoice_number + 1
  WHERE workspace_id = ? RETURNING next_invoice_number;
  ```
  This is atomic at the database level. No application-level race condition.
- Format the number in the application layer: `INV-${String(number).padStart(4, '0')}`
- Store the counter per-workspace (each workspace has its own sequence).
- For v1, do not worry about gaps from voided invoices. Sequential-with-gaps is acceptable in most jurisdictions. Flag gap-free numbering as a v2 concern.
- Add a UNIQUE constraint on `(workspace_id, invoice_number)` as a safety net.

**Detection:**
- Invoice number generated with `SELECT MAX` + application-level increment
- No unique constraint on invoice number in the database
- No concurrency test for simultaneous invoice creation

**Phase relevance:** Invoice creation phase. The numbering scheme should be designed alongside the invoice model.

**Confidence:** HIGH -- classic concurrency pitfall. Well-documented in database engineering literature and specific to invoicing because sequential numbering is a domain requirement.

---

## Moderate Pitfalls

Mistakes that cause significant rework or user frustration but are recoverable.

---

### Pitfall 7: Multi-Tenant Data Leakage

**What goes wrong:** A user in Workspace A can see or modify data belonging to Workspace B. This happens through missing `WHERE workspace_id = ?` clauses, IDOR vulnerabilities on API endpoints, or ORM queries that do not scope to the current workspace.

**Why it happens:** Every database query must be workspace-scoped. With dozens of endpoints, it is easy to miss one. The bug is invisible in development (single workspace) and only appears when multiple workspaces exist.

**Prevention:**
- Implement workspace scoping at the **data access layer**, not at each individual query. Use middleware or a repository pattern that automatically injects `workspace_id` into every query.
- Example: a `scopedQuery` helper that wraps all database access:
  ```typescript
  function scopedQuery(table: string, workspaceId: string) {
    return db.select().from(table).where('workspace_id', workspaceId);
  }
  ```
- Add **integration tests with two workspaces** from the very first feature. Every API endpoint test should verify that Workspace B's data is not returned for Workspace A's user.
- Add a database-level Row Level Security (RLS) policy if using PostgreSQL. This provides defense-in-depth even if the application layer misses a scope.

**Detection:**
- API endpoints that accept entity IDs without verifying workspace ownership
- Database queries without `workspace_id` in the WHERE clause
- No multi-tenant integration tests
- Tests only using a single workspace

**Phase relevance:** Workspace/auth phase (Phase 1). The scoping pattern must be established before any business entities are created. Every subsequent phase inherits it.

**Confidence:** HIGH -- standard multi-tenant security concern. Well-documented in OWASP and SaaS security literature.

---

### Pitfall 8: Dashboard Metrics Calculated on the Fly from Raw Data

**What goes wrong:** The dashboard shows "Total Outstanding," "Revenue This Month," "Overdue Count." These are calculated by scanning all invoices on every dashboard load. With 1,000+ invoices, the dashboard becomes slow. With complex payment/status logic, the calculations are bug-prone and inconsistent with what individual invoice pages show.

**Why it happens:** It is the simplest implementation: `SELECT SUM(total - paid) FROM invoices WHERE status != 'paid'`. But this query gets complex quickly (partial payments, overdue detection, date ranges) and slow at scale.

**Consequences:**
- Dashboard load times growing linearly with invoice count
- Metrics disagreeing with individual invoice detail pages
- Complex aggregation queries that are hard to optimize and easy to get wrong
- Database load spikes on dashboard visits

**Prevention:**
- For v1 with small data volumes, live queries are acceptable -- but write them as **dedicated, tested query functions**, not inline SQL in route handlers.
- Structure the queries so they can be replaced with materialized views or pre-computed aggregates later without changing the API contract.
- Compute "overdue" status via a scheduled job or on-access check (`due_date < NOW() AND status = 'sent'`), not by storing it as a static field that can become stale.
- Index the columns used in dashboard queries: `(workspace_id, status)`, `(workspace_id, due_date)`, `(workspace_id, created_at)`.
- Set a performance budget: dashboard must load in < 500ms. Test with 1,000 invoices.

**Detection:**
- Dashboard queries scattered across multiple files
- No database indexes on status/date columns
- No performance testing with realistic data volumes
- "Overdue" status stored as a static field that is not updated automatically

**Phase relevance:** Dashboard phase. But the invoice and payment models must be queryable for aggregation, which is a schema design concern from Phase 1.

**Confidence:** MEDIUM -- the severity depends on expected data volumes. For a self-hosted tool used by small businesses, this may not become a problem until hundreds of invoices. But the prevention cost is low.

---

### Pitfall 9: Session Authentication Without Proper Security Hardening

**What goes wrong:** Session-based auth is implemented but without: CSRF protection, secure cookie flags, session expiration, rate limiting on login, or proper session invalidation on logout. Self-hosted users expose the app to the internet without these protections.

**Why it happens:** Session auth "works" in development without any of these. The security features are invisible to the developer and only matter in production. Self-hosted users may not have reverse proxies or firewalls configured.

**Consequences:**
- CSRF attacks allowing invoice creation/modification on behalf of logged-in users
- Session hijacking via cookie theft on non-HTTPS connections
- Brute force attacks against the login endpoint
- Sessions persisting after "logout" due to improper server-side invalidation

**Prevention:**
- Use an established session library (e.g., `better-auth`, `lucia`, or framework-provided session management) rather than rolling your own.
- Security checklist for session auth:
  - `HttpOnly` cookie flag (prevents JS access)
  - `Secure` cookie flag (HTTPS only) -- make configurable for local development
  - `SameSite=Lax` or `Strict` (CSRF mitigation)
  - Server-side session storage (database or Redis), not just signed cookies
  - Session expiration (absolute timeout + idle timeout)
  - Rate limiting on `/login` (e.g., 5 attempts per minute per IP)
  - Full session destruction on logout (delete server-side record)
- Document security configuration in the self-hosting guide. Recommend HTTPS via reverse proxy (Caddy/Traefik).

**Detection:**
- Cookies without `HttpOnly`, `Secure`, or `SameSite` flags
- No rate limiting on authentication endpoints
- Session data stored only in a signed cookie (no server-side record)
- No session expiration configured

**Phase relevance:** Authentication phase (Phase 1). Security hardening must ship with the initial auth implementation, not be bolted on later.

**Confidence:** HIGH -- standard web security concerns, amplified by the self-hosted deployment model where users control (and often misconfigure) their infrastructure.

---

### Pitfall 10: Workspace Deletion and Data Cascade Complexity

**What goes wrong:** Deleting a workspace (or a customer with invoices, or an invoice with payments) triggers cascading deletes that are hard to reason about. Foreign key cascades silently delete payment records. Or conversely, deletion is blocked by foreign key constraints, and the error message is cryptic.

**Why it happens:** The entity relationships in invoicing are deep: Workspace -> Customers -> Invoices -> Line Items -> Payments. Cascade rules must be explicitly designed for each relationship.

**Consequences:**
- Accidentally deleting all invoices when a customer is deleted
- Unable to delete anything due to constraint violations
- Orphaned records (payments without invoices) corrupting reports
- No soft-delete means accidental deletions are irrecoverable

**Prevention:**
- Use **soft deletes** for all financial entities (invoices, payments, customers). Add a `deleted_at` timestamp column. Never hard-delete financial records.
- Design explicit cascade rules:
  - Workspace deletion: soft-delete all children (or require workspace to be empty first)
  - Customer deletion: block if customer has non-draft invoices. Soft-delete otherwise.
  - Invoice deletion: only allow for draft invoices. Sent/paid invoices can only be voided.
  - Payment deletion: should require explicit "void payment" action with audit trail
- Add `ON DELETE RESTRICT` (not `CASCADE`) for most foreign keys. Let the application layer handle the business logic of what can be deleted and when.

**Detection:**
- `ON DELETE CASCADE` on invoice or payment foreign keys
- No `deleted_at` column on financial entities
- Delete endpoints without status-based guards
- No tests for "delete customer who has paid invoices"

**Phase relevance:** Database schema design (Phase 1) and each entity phase. The soft-delete pattern should be established in the schema from the start.

**Confidence:** HIGH -- data integrity concern inherent to any system with financial records.

---

## Minor Pitfalls

Mistakes that cause friction but are straightforward to fix.

---

### Pitfall 11: Date and Timezone Confusion

**What goes wrong:** Invoice dates, due dates, and "overdue" calculations behave inconsistently across timezones. An invoice created on January 31 at 11 PM in US Pacific is February 1 in UTC. "Overdue" status flips depending on where the server is located. Users in different timezones see different dates.

**Prevention:**
- Store all dates as **UTC timestamps** in the database.
- Store a `timezone` field on the workspace for display purposes.
- Calculate "overdue" based on the **workspace's timezone**, not the server's timezone. An invoice due "January 31" in the workspace's timezone should become overdue at midnight in that timezone.
- Display dates formatted to the workspace timezone, not the browser timezone.
- Use `date-fns` or `dayjs` with timezone plugins (not `moment.js`, which is in maintenance mode).

**Detection:**
- Date comparisons using `new Date()` without timezone awareness
- No timezone field on workspace settings
- "Overdue" calculation using server-local time

**Phase relevance:** Invoice creation and dashboard phases. The workspace timezone field should be in the schema from Phase 1.

**Confidence:** HIGH -- universal timezone pitfall, extra impactful in invoicing because "overdue" has financial consequences.

---

### Pitfall 12: Invoice Template Inflexibility

**What goes wrong:** The invoice template (both web and PDF) is hardcoded with a specific layout. Users want to add their logo, change colors, reorder fields, add custom fields (PO number, project code), or include payment instructions. None of this is possible without code changes.

**Prevention:**
- For v1, do not build a full template editor (that is a massive feature). Instead:
  - Allow workspace-level customization: logo upload, company name, address, default payment terms/notes.
  - Design the invoice template with **slots** for optional content (notes, terms, payment instructions) rather than a rigid layout.
  - Store these customization fields in the workspace settings table.
- Structure the PDF template code so it can be extended in v2 without rewriting:
  - Separate data fetching from rendering
  - Template receives a typed data object, not raw database rows

**Detection:**
- Company info hardcoded in template rather than pulled from workspace settings
- No "notes" or "terms" text fields on the invoice model
- PDF template directly queries the database

**Phase relevance:** Invoice creation and PDF phases. Add the optional fields to the schema early even if the UI does not expose all of them in v1.

**Confidence:** MEDIUM -- this is more of a "users will request this immediately" issue than a technical pitfall. But planning for it early avoids schema changes later.

---

### Pitfall 13: Not Storing Snapshot Data on Invoices

**What goes wrong:** The invoice references the customer by ID. When the customer's address changes, all historical invoices now show the new address. The sent PDF says "123 Old Street" but the database says "456 New Avenue." Financial records should reflect the state at the time of creation.

**Prevention:**
- **Snapshot customer details onto the invoice at creation time.** Store `customer_name`, `customer_email`, `customer_address` directly on the invoice record (or in a JSON column), in addition to the `customer_id` foreign key.
- Similarly, snapshot the workspace's company details (name, address, logo URL) onto the invoice.
- The foreign key maintains the relationship for navigation; the snapshot preserves historical accuracy.
- This also protects against customer deletion -- the invoice still has the customer's details even if the customer record is soft-deleted.

**Detection:**
- Invoice only stores `customer_id` with no denormalized customer fields
- Invoice only stores `workspace_id` with no company detail snapshot
- Customer detail changes retroactively affect past invoices

**Phase relevance:** Invoice creation phase. The invoice schema must include snapshot fields from the start. Adding them later requires backfilling from customer records (which may have already changed).

**Confidence:** HIGH -- this is a fundamental invoicing domain requirement. Every professional invoicing system does this. Missing it is one of the most common mistakes in first-time invoicing projects.

---

### Pitfall 14: Role-Based Access Without Granular Permissions

**What goes wrong:** The app has "owner" and "member" roles, but the permission boundaries are vague. Can a member delete an invoice? Can a member see all customers or only ones they created? Can a member invite other members? These questions are answered ad-hoc during development, leading to inconsistent enforcement.

**Prevention:**
- Define a **permission matrix** before writing any authorization code:

  | Action | Owner | Member |
  |--------|-------|--------|
  | Manage workspace settings | Yes | No |
  | Invite/remove members | Yes | No |
  | Create invoice | Yes | Yes |
  | Edit draft invoice | Yes | Yes (own or all?) |
  | Void sent invoice | Yes | No |
  | Record payment | Yes | Yes |
  | Delete customer | Yes | No |
  | View dashboard | Yes | Yes |

- Implement authorization as **middleware or a policy layer**, not inline checks scattered across route handlers.
- Store the permission matrix as a data structure, not as if/else chains.

**Detection:**
- No written permission matrix
- Authorization checks inline in route handlers (`if (user.role === 'owner')`)
- Inconsistent permission enforcement across similar actions
- No tests for "member tries to do owner-only action"

**Phase relevance:** Auth/workspace phase (Phase 1). The permission model must be defined before building features that depend on it.

**Confidence:** MEDIUM -- the severity depends on how complex the role system gets. For a two-role system (owner/member), it is manageable. But undefined boundaries cause confusion.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| Database/Schema Design | Floating-point money storage (Pitfall 1) | CRITICAL | Use integer cents from day one. No exceptions. |
| Database/Schema Design | Missing snapshot fields on invoices (Pitfall 13) | CRITICAL | Design invoice schema with customer/company snapshot columns. |
| Database/Schema Design | CASCADE deletes on financial entities (Pitfall 10) | HIGH | Use RESTRICT + soft deletes. Design cascade rules explicitly. |
| Auth/Workspaces | Data leakage between workspaces (Pitfall 7) | CRITICAL | Workspace-scoped data access layer + multi-tenant tests. |
| Auth/Workspaces | Session security gaps (Pitfall 9) | HIGH | Use established auth library with secure defaults. |
| Auth/Workspaces | Undefined permission boundaries (Pitfall 14) | MODERATE | Write permission matrix before coding authorization. |
| Invoice Creation | Tax calculation order ambiguity (Pitfall 2) | CRITICAL | Document formula. Store computed amounts. Single calculation function. |
| Invoice Creation | Invoice number race conditions (Pitfall 6) | HIGH | Database-level atomic counter per workspace. |
| Invoice Creation | Mutability after sending (Pitfall 4) | CRITICAL | State machine with immutability rules from the start. |
| Invoice Creation | Date/timezone confusion (Pitfall 11) | MODERATE | UTC storage + workspace timezone + timezone-aware overdue logic. |
| Payment Tracking | Partial payment balance drift (Pitfall 3) | CRITICAL | Integer cents + penny-rounding auto-close + overpayment validation. |
| PDF Generation | Memory/performance issues (Pitfall 5) | HIGH | Non-browser PDF library + async generation + caching. |
| PDF Generation | Template inflexibility (Pitfall 12) | LOW | Workspace-level customization fields + extensible template structure. |
| Dashboard | Slow metric calculations at scale (Pitfall 8) | MODERATE | Dedicated query functions + proper indexes + performance budget. |

## Summary of Domain-Specific Risks

The invoicing domain has a deceptive simplicity. At its core, it is "create a document with line items and send it." But the details are where projects fail:

1. **Money is not a number.** It is a domain type with specific arithmetic rules. Treat it as such from line one of code.
2. **Invoices are not CRUD entities.** They are financial documents with lifecycle rules. Once sent, they are immutable records.
3. **Partial payments are the hardest feature.** The interaction between rounding, multiple payments, and balance tracking is where most bugs hide.
4. **PDF generation is a feature, not a format conversion.** It requires dedicated architecture (memory management, async processing, template design).
5. **Multi-tenancy is a security requirement, not a feature.** Every query, every endpoint, every test must be workspace-aware.

The single highest-risk moment is **schema design**. Getting money storage, snapshot fields, cascade rules, and the invoice state machine right at the database level prevents the majority of critical pitfalls. Fixing these after data exists is exponentially harder.

## Sources

- Training data from analysis of Invoice Ninja (github.com/invoiceninja/invoiceninja), Crater (github.com/crater-invoice/crater), SolidInvoice (github.com/SolidInvoice/SolidInvoice), and InvoicePlane (github.com/InvoicePlane/InvoicePlane) issue trackers and codebases
- Financial software engineering patterns (integer-cents storage, tax calculation standards)
- OWASP multi-tenant security guidelines
- PostgreSQL documentation on sequences and row-level security
- **Note:** Web verification was unavailable during this research session. Recommend validating Pitfalls 2, 5, and 8 against current Issue Ninja and Crater issue trackers before finalizing the roadmap.
