# Feature Landscape

**Domain:** Open-source invoicing workspace for small businesses
**Researched:** 2026-02-13
**Overall confidence:** MEDIUM (based on training data knowledge of Invoice Ninja, FreshBooks, Wave, Zoho Invoice, Crater, SolidInvoice, and broader invoicing SaaS landscape; web verification unavailable)

## Table Stakes

Features users expect from any invoicing tool. Missing any of these and users will leave for a competitor -- even a spreadsheet.

### Core Invoicing

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Invoice CRUD with line items (description, qty, rate) | Fundamental purpose of the product. Every competitor has this. | Med | Line items need flexible add/remove/reorder. Must handle decimal precision for currency. |
| Tax calculation (per-line and/or invoice-level) | Businesses must charge tax. FreshBooks, Wave, Invoice Ninja all support this. | Med | Start with single tax rate per invoice. Multi-tax (compound, per-line) is differentiator territory. |
| Discount support (percentage and flat amount) | Standard in FreshBooks, Wave, Invoice Ninja. Users expect it on quotes and invoices. | Low | Percentage and fixed-amount at invoice level. Per-line discounts are a differentiator. |
| Invoice numbering (auto-incrementing, customizable prefix) | Professional invoices need sequential numbers. Legal requirement in many jurisdictions. | Low | Format like `INV-0001`. Must be unique per workspace. Allow prefix customization. |
| Invoice status workflow (Draft -> Sent -> Paid) | Every invoicing tool tracks this. Users need to know invoice state at a glance. | Med | Status transitions must be enforced (no going from Paid back to Draft without explicit reversal). |
| Due date and payment terms | Standard field. Users need to set "Net 30", "Due on receipt", etc. | Low | Store as due date. Optionally derive from payment terms (Net 15/30/60/90). |
| Invoice notes / terms text | Every competitor allows free-text notes and terms on invoices. | Low | Two fields: notes (visible to client, e.g. "Thank you") and terms (payment terms, late fees). |
| Currency display | Invoices must show currency symbol. Users billing in USD/EUR/GBP expect correct formatting. | Low | Single currency per workspace for v1. Display formatting (symbol, decimal places, thousand separator). |

### PDF and Output

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| PDF generation and download | Non-negotiable. Users email PDFs to clients. Every competitor has this. | High | Server-side PDF rendering. Must look professional -- this IS the product's output. |
| Professional invoice template | The PDF must look good. Ugly invoices erode trust in the tool. | Med | One clean, professional template for v1. Company logo, colors, structured layout. |
| Company branding on invoices (logo, name, address) | Users need their business identity on invoices. All competitors support this. | Low | Upload logo, set company name/address/phone/email. Stored at workspace level. |

### Customer/Client Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Customer CRUD (name, email, address, phone) | Cannot invoice without customers. Every tool has a client/customer module. | Med | Contact info, billing address. One-to-many relationship with invoices. |
| Customer search and filtering | With 50+ customers, search is essential. Wave and FreshBooks both have this. | Low | Search by name/email. Filter by status (active/archived). |
| Customer invoice history | Users need to see all invoices for a customer in one place. | Low | List view of invoices filtered by customer. Already implicit if data model is correct. |
| Customer balance tracking | "How much does this client owe me?" is a fundamental question. | Low | Computed from unpaid invoices. Display on customer detail page. |

### Payment Tracking

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Manual payment recording | Users record payments received via check, bank transfer, cash. Core workflow. | Med | Record amount, date, method (cash/check/bank/other), optional note. |
| Partial payment support | Real-world invoices get paid in installments. Invoice Ninja, FreshBooks support this. | Med | Track multiple payments against one invoice. Update balance remaining. Auto-mark paid when balance hits zero. |
| Payment history per invoice | Users need audit trail of payments received. | Low | List of payments with date, amount, method. Tied to invoice detail view. |
| Overdue detection | Invoices past due date must be flagged automatically. | Low | Cron or on-read check: if due_date < today AND status != paid, mark overdue. |

### Dashboard and Reporting

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dashboard with key metrics | Users open the app and need to see business health immediately. FreshBooks, Wave, Invoice Ninja all have dashboards. | Med | Total outstanding, overdue count, revenue this period, recent invoices. |
| Outstanding invoices summary | "How much am I owed?" -- the single most important number. | Low | Sum of all unpaid invoice balances. |
| Overdue invoices list | Users need to chase late payments. Must be immediately visible. | Low | Filtered list of invoices past due date, sorted by how overdue. |

### Authentication and Access

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User authentication (signup, login, logout) | Cannot have a multi-user app without auth. | Med | Session-based per project constraints. Email + password. |
| Team workspaces | Multiple people in a business need access. Per project requirements. | High | Workspace isolation is critical -- one user's data must never leak to another workspace. |
| Role-based access (owner, member) | Owner manages settings, members do day-to-day work. Standard in team tools. | Med | Owner: full access + workspace settings + member management. Member: CRUD on invoices/customers, no admin. |

### Self-Hosting

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Docker Compose deployment | Target audience wants `docker compose up` simplicity. Per project constraints. | Med | Single compose file with app + database. Environment variables for config. |
| Data persistence | Self-hosted users need data to survive container restarts. | Low | Volume mounts for database. Documented in compose file. |


## Differentiators

Features that set InvoiceNest apart. Not expected by default, but valued when present. These create competitive advantage against both spreadsheets and existing open-source tools (Invoice Ninja, Crater, SolidInvoice).

### Strong Differentiators (High Impact)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Recurring invoices | Auto-generate invoices on a schedule (weekly/monthly/yearly). FreshBooks and Invoice Ninja have this; Crater does not. Huge time-saver for retainer-based businesses. | High | Requires background job scheduler. Create invoice from template on schedule. Handle edge cases (client deleted, template changed). Defer to v2+. |
| Invoice cloning/duplication | One-click copy of an existing invoice to create a new one. Saves massive time for repeat billing. | Low | Copy all fields except number/date. Simple but high-value UX improvement. |
| Estimates/Quotes with convert-to-invoice | Create quotes, get approval, convert to invoice. FreshBooks, Invoice Ninja, Wave all have this. Natural workflow extension. | Med | Same data model as invoice with different status flow. "Convert to Invoice" creates invoice from quote data. |
| Email delivery of invoices | Send invoices directly from the app instead of downloading PDF and emailing manually. | High | Requires email infrastructure (SMTP config). For self-hosted, user provides SMTP credentials. Significant complexity but huge UX win. Defer to v2+. |
| Multiple invoice templates | Choose from 2-3 professional PDF layouts. Visual differentiation matters to users. | Med | Template engine with switchable layouts. Each template needs its own PDF rendering logic. |
| Expense tracking | Record business expenses. Natural companion to invoicing for freelancers tracking profitability. | Med | Separate module: amount, date, category, vendor, receipt upload. Not connected to invoicing directly but adds product value. |
| Credit notes | Issue credit against an invoice (partial refund, correction). Professional accounting practice. | Med | Negative invoice variant. Reduces customer balance. Important for businesses that need clean books. |

### Moderate Differentiators (Nice to Have)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Client portal (view-only link) | Share a unique URL so clients can view their invoice without logging in. Better than emailing PDFs. | Med | Signed/token-based URL. Read-only invoice view. No auth required for client. |
| Multi-currency support | Bill different clients in different currencies. Important for international freelancers. | Med | Currency per customer or per invoice. Exchange rates are out of scope -- just display formatting. |
| Invoice reminders (manual) | Button to "Send Reminder" for overdue invoices. Less complex than automated reminders. | Med | Requires email infrastructure. Simpler than automated -- user triggers manually. |
| Activity log / audit trail | Track who did what and when. Valuable for team workspaces with multiple members. | Med | Log invoice created, payment recorded, status changed, etc. Per-workspace event log. |
| Bulk actions | Select multiple invoices and mark sent, export, or delete. Efficiency feature for high-volume users. | Low | Multi-select UI + batch API endpoints. |
| Tax presets | Save commonly used tax rates (e.g., "Sales Tax 8.25%", "VAT 20%") for quick selection. | Low | Tax rates table per workspace. Select from dropdown when creating invoices. |
| Custom invoice fields | Add custom fields to invoices (PO number, project name, etc.). Power-user feature. | Med | Key-value pairs stored as JSON. Rendered on PDF. Schema-less for flexibility. |
| Data export (CSV/JSON) | Export invoices, customers, payments for backup or migration. Important for self-hosted trust. | Low | Straightforward database query to CSV/JSON. Builds trust that data is never locked in. |
| Dashboard charts | Visual revenue trends, monthly comparisons. Makes dashboard feel premium. | Med | Chart library integration. Monthly revenue bar chart, outstanding over time. |


## Anti-Features

Features to explicitly NOT build. These add complexity without proportional value for InvoiceNest's target audience, or pull the product away from its core identity.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Online payment processing (Stripe, PayPal) | Massive complexity: PCI compliance concerns, payment gateway integration, webhook handling, refund flows, fee calculations. Invoice Ninja spent years on this. Not feasible for v1 of a self-hosted tool. | Manual payment recording. Users record payments they receive through their own payment channels. |
| Full accounting / double-entry bookkeeping | Turns an invoicing tool into accounting software. Completely different domain. Wave did this and it's a different product category. | Stay focused on invoicing. Users who need accounting use QuickBooks/Xero and can export data from InvoiceNest. |
| Inventory management | Stock tracking, SKUs, warehouse management -- different product entirely. Some invoicing tools bolt this on poorly. | Line items are freeform text descriptions. No product catalog or stock levels. |
| Time tracking | Popular in FreshBooks but it's a separate domain. Building a good time tracker is a full product effort. | Users enter line items manually. They can use dedicated time tracking tools (Toggl, Harvest) and input results. |
| CRM features beyond basic contacts | Pipeline management, deal tracking, lead scoring -- different product. | Customer management stays focused: contact info, invoice history, balance. Not a CRM. |
| Multi-tenant SaaS hosting platform | Building a hosted SaaS platform with billing, subscription management, tenant provisioning is a different business model. | InvoiceNest is self-hosted. One deployment = one organization (with workspaces). No SaaS billing layer. |
| Automated email sequences / drip campaigns | Overdue reminder automation, follow-up sequences -- adds email infrastructure complexity and notification management. | Manual actions only for v1. User decides when to send reminders. Consider manual "send reminder" button before automation. |
| Mobile native apps (iOS/Android) | Massive development cost for relatively simple CRUD operations. | Responsive web design. The app should work well in mobile browsers. |
| AI-powered features (smart suggestions, auto-categorization) | Adds ML infrastructure complexity. Hype-driven, not user-need-driven for an invoicing tool. | Keep it simple. Good UX beats AI gimmicks for data entry. |
| Multi-language / i18n | Significant engineering overhead: string extraction, translation management, RTL support, date/number formatting per locale. | English-only for v1. Architect with i18n in mind (no hardcoded strings) but don't implement the framework yet. |
| Plugin/extension system | Designing a stable plugin API is extremely hard and constrains internal architecture. | Build features directly. If the codebase is clean and open-source, contributors can fork or submit PRs. |
| Real-time collaboration (Google Docs style) | Operational transforms or CRDTs for concurrent invoice editing -- extreme complexity for minimal value. Two people rarely edit the same invoice simultaneously. | Last-write-wins with optimistic locking. Show "edited by X at time" to avoid conflicts. |


## Feature Dependencies

```
Authentication ──> Workspaces ──> All other features (everything is workspace-scoped)
                        │
                        ├──> Customer Management ──> Invoice Creation (invoices need a customer)
                        │         │
                        │         └──> Customer Balance (computed from invoices + payments)
                        │
                        ├──> Invoice Creation ──> Invoice Status Workflow
                        │         │                      │
                        │         │                      └──> Overdue Detection
                        │         │
                        │         ├──> PDF Generation (renders invoice data)
                        │         │         │
                        │         │         └──> Company Branding (logo/address on PDF)
                        │         │
                        │         ├──> Payment Recording ──> Partial Payments
                        │         │         │
                        │         │         └──> Payment History
                        │         │
                        │         └──> Tax & Discount Calculation
                        │
                        ├──> Dashboard (reads from invoices, payments, customers)
                        │
                        └──> Role-Based Access (controls who can do what)

--- Differentiator dependencies ---

Invoice Creation ──> Invoice Cloning (copies existing invoice)
Invoice Creation ──> Estimates/Quotes ──> Convert to Invoice
Invoice Creation ──> Recurring Invoices (template-based generation)
Invoice Creation ──> Credit Notes (negative invoice variant)
Email Infrastructure ──> Email Delivery of Invoices
Email Infrastructure ──> Manual Invoice Reminders
Customer Management ──> Client Portal (view-only access per customer)
```


## MVP Recommendation

### Must Ship (Table Stakes -- without these it is not an invoicing product)

1. **Authentication + Workspaces + Roles** -- Foundation. Everything else depends on this.
2. **Customer Management** -- Cannot create invoices without customers.
3. **Invoice CRUD with line items, tax, discounts** -- The core product.
4. **Invoice numbering and status workflow** -- Professional invoicing requires these.
5. **PDF generation with company branding** -- The tangible output users send to clients. This IS the product.
6. **Manual payment recording with partial payment support** -- Users need to track who has paid.
7. **Overdue detection** -- Automatic, low-effort, high-value.
8. **Dashboard with key metrics** -- First screen users see. Must answer "how is my business doing?"
9. **Docker Compose deployment** -- The delivery mechanism for self-hosted software.

### Ship Soon After MVP (High-impact, low-to-medium effort)

1. **Invoice cloning/duplication** -- Low complexity, massive time savings for repeat billing. Should be in v1.
2. **Tax presets** -- Low complexity, saves time on every invoice. Should be in v1.
3. **Data export (CSV)** -- Low complexity, builds trust that data is not locked in. Critical for self-hosted positioning.

### Defer (High impact but high complexity)

- **Estimates/Quotes**: Med complexity. Good v1.5 feature. Same data model as invoices makes it natural to add.
- **Recurring invoices**: High complexity (background jobs, scheduling). Clear v2 feature.
- **Email delivery**: High complexity (SMTP infrastructure). Clear v2 feature. Users download PDF and email manually for v1.
- **Multiple invoice templates**: Med complexity. v2 feature. One good template is enough for v1.
- **Client portal**: Med complexity. v2 feature. Unique shareable links are nice but not essential.
- **Expense tracking**: Med complexity. v2 feature. Different domain from core invoicing.
- **Credit notes**: Med complexity. v2 feature. Most small businesses handle corrections informally in v1.

### Phase Mapping Recommendation

| Phase | Focus | Features |
|-------|-------|----------|
| 1 | Foundation | Auth, workspaces, roles, database schema |
| 2 | Core Data | Customer management, invoice CRUD with line items/tax/discounts |
| 3 | Output & Tracking | PDF generation, company branding, invoice status workflow |
| 4 | Payments & Intelligence | Payment recording, partial payments, overdue detection, dashboard |
| 5 | Polish & Quick Wins | Invoice cloning, tax presets, data export, bulk actions |
| 6 | Deployment | Docker Compose, environment config, production readiness |

**Rationale:** This ordering follows the dependency chain. You cannot build invoices without customers, cannot generate PDFs without invoices, cannot track payments without invoices, and cannot deploy without a complete product. Each phase produces a testable increment.


## Competitive Landscape Context

Understanding where InvoiceNest sits relative to existing options informs which features matter most.

| Competitor | Type | Strengths | Weaknesses (InvoiceNest opportunity) |
|------------|------|-----------|--------------------------------------|
| **Invoice Ninja** | Open-source, self-hosted or cloud | Feature-rich (payments, quotes, recurring, time tracking, expenses). Mature. | Complex to self-host. Overwhelming UI. PHP/Laravel stack feels dated to some. |
| **Crater** | Open-source, self-hosted | Clean UI, Laravel-based, good invoicing basics. | Smaller community. Fewer features than Invoice Ninja. Development pace slowed. |
| **SolidInvoice** | Open-source, self-hosted | Solid core invoicing. Symfony-based. | Limited features. Smaller community. Less active development. |
| **FreshBooks** | Commercial SaaS | Excellent UX, time tracking, expenses, payments. | Paid. Not self-hosted. Not open-source. Expensive for small teams. |
| **Wave** | Freemium SaaS | Free invoicing + accounting. | Not self-hosted. Ads. Limited customization. Being sunset/migrated. |
| **Zoho Invoice** | Commercial SaaS | Full-featured, integrates with Zoho ecosystem. | Paid for real usage. Vendor lock-in. Not self-hosted. |

**InvoiceNest's positioning:** Simpler than Invoice Ninja, more modern stack, easier to self-host, focused on invoicing (not trying to be accounting software). The opportunity is in the gap between "spreadsheets" and "Invoice Ninja is too complex" -- a clean, focused, easy-to-deploy invoicing tool.


## Sources

- Training data knowledge of Invoice Ninja (v5), FreshBooks, Wave, Zoho Invoice, Crater, SolidInvoice feature sets (MEDIUM confidence -- based on pre-May 2025 knowledge)
- Project context from `.planning/PROJECT.md` (HIGH confidence -- direct project documentation)
- General domain knowledge of invoicing software patterns and small business billing workflows (MEDIUM confidence)

**Note:** Web search and web fetch tools were unavailable during this research session. All findings are based on training data knowledge of the invoicing software ecosystem. Feature lists for competitors should be verified against their current documentation before making final product decisions. The core feature categorization (table stakes vs differentiators) is high-confidence because the invoicing domain is mature and well-understood -- these patterns have been stable for years.
