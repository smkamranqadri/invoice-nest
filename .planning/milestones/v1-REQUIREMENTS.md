# Milestone v1: Requirements Archive

**Status:** ✅ SHIPPED 2026-02-15
**Version:** v1

## Outcome Notes

- Validated: Core v1 invoicing workflow, role-based multi-tenant access, deployment contract, and hardening/observability follow-up coverage.
- Adjusted: `UI-04` retained as process-evidence requirement with Phase 7 traceability closure.
- Dropped: None.

## Archived REQUIREMENTS Snapshot (marked complete for shipped milestone)

# Requirements: InvoiceNest

**Defined:** 2026-02-13
**Core Value:** Teams can create invoices, send them to customers, and know exactly who owes what — without spreadsheets or expensive SaaS tools.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Workspaces

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and log out with session-based auth
- [x] **AUTH-03**: User session persists across browser refresh
- [x] **AUTH-04**: User can create a workspace with name and company details
- [x] **AUTH-05**: Workspace owner can invite members by email
- [x] **AUTH-06**: Workspace owner can assign roles (owner/member)
- [x] **AUTH-07**: Members can only access data within their workspace (multi-tenant isolation)
- [x] **AUTH-08**: Owner can remove members from workspace
- [x] **AUTH-09**: Role-based permissions enforced (owner: full access; member: limited admin actions)

### Customer Management

- [x] **CUST-01**: User can add a customer with name, email, phone, and address
- [x] **CUST-02**: User can edit customer details
- [x] **CUST-03**: User can search customers by name or email
- [x] **CUST-04**: User can filter customers by status (active/inactive)
- [x] **CUST-05**: User can view a customer detail page showing contact info and invoice history
- [x] **CUST-06**: Customer records display outstanding balance (sum of unpaid invoices)
- [x] **CUST-07**: User can deactivate/reactivate a customer (soft status toggle, no hard delete)

### Invoice Management

- [x] **INV-01**: User can create an invoice with a selected customer, due date, and notes/terms
- [x] **INV-02**: Invoice has line items with description, quantity, and unit price
- [x] **INV-03**: User can add, edit, and remove line items on a draft invoice
- [x] **INV-04**: Invoice supports a discount (percentage or fixed amount)
- [x] **INV-05**: Invoice supports a tax rate applied to the taxable subtotal
- [x] **INV-06**: Invoice totals are calculated server-side: subtotal → discount → tax → total (integer cents)
- [x] **INV-07**: Invoices are assigned an auto-incrementing number unique per workspace
- [x] **INV-08**: Invoice has statuses: draft, sent, paid, overdue, void
- [x] **INV-09**: Draft invoices are fully editable; sent invoices are read-only
- [x] **INV-10**: User can transition invoice status (draft→sent, sent→void, etc.) via explicit actions
- [x] **INV-11**: User can view an invoice list with status, customer, amount, and due date
- [x] **INV-12**: User can filter invoices by status and date range
- [x] **INV-13**: User can view a single invoice detail page with full line items and payment history
- [x] **INV-14**: Overdue invoices are automatically flagged when past due date

### Payments

- [x] **PAY-01**: User can record a manual payment against an invoice (amount, date, method, notes)
- [x] **PAY-02**: Partial payments are supported — multiple payments can be recorded against one invoice
- [x] **PAY-03**: Payment amount cannot exceed the remaining invoice balance
- [x] **PAY-04**: Invoice status auto-transitions to "paid" when full balance is received
- [x] **PAY-05**: User can view payment history for an invoice
- [x] **PAY-06**: Invoice detail shows remaining balance after partial payments
- [x] **PAY-07**: Financial fields on an invoice are locked once any payment exists

### PDF Generation

- [x] **PDF-01**: User can generate a PDF for any invoice (draft or sent)
- [x] **PDF-02**: PDF includes company branding (name, address, logo)
- [x] **PDF-03**: PDF includes all invoice details: customer info, line items, tax, discount, total, due date
- [x] **PDF-04**: PDF renders correctly with 1 to 50+ line items (proper page breaks)
- [x] **PDF-05**: User can download the generated PDF

### Dashboard

- [x] **DASH-01**: Dashboard shows total outstanding amount (sum of all unpaid/partially paid invoices)
- [x] **DASH-02**: Dashboard shows count of overdue invoices
- [x] **DASH-03**: Dashboard shows recent invoices with status indicators (paid/unpaid/overdue)
- [x] **DASH-04**: Dashboard shows revenue received in the current month/period
- [x] **DASH-05**: Dashboard data is scoped to the active workspace

### Settings & Polish

- [x] **SET-01**: Workspace owner can set company details (name, address, logo) for PDF branding
- [x] **SET-02**: Workspace owner can configure default currency
- [x] **SET-03**: Workspace owner can configure default tax rate(s) as reusable presets
- [x] **SET-04**: User can clone/duplicate an existing invoice as a new draft
- [x] **SET-05**: User can export invoice and payment data as CSV

### Deployment

- [x] **DEP-01**: Application runs via `docker compose up` with app + PostgreSQL containers
- [x] **DEP-02**: Database migrations run automatically on startup
- [x] **DEP-03**: Configuration via environment variables (database URL, session secret, etc.)
- [x] **DEP-04**: Data persists across container restarts via Docker volumes
- [x] **DEP-05**: Health check endpoint available for monitoring

### UI/UX Design

- [x] **UI-01**: UI built with Radix UI primitives + Tailwind CSS
- [x] **UI-02**: Responsive layout works on desktop and mobile browsers
- [x] **UI-03**: Professional, trustworthy visual design appropriate for a financial tool
- [x] **UI-04**: UI screens designed before implementation in each phase
- [x] **UI-05**: Consistent component patterns across all pages (tables, forms, dialogs, navigation)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Recurring Invoices

- **REC-01**: User can set an invoice to recur on a schedule (weekly, monthly, yearly)
- **REC-02**: System auto-generates invoices based on schedule

### Email Delivery

- **EMAIL-01**: User can send invoice directly to customer via email
- **EMAIL-02**: User can configure SMTP settings for email delivery
- **EMAIL-03**: Automated overdue payment reminders via email

### Estimates & Quotes

- **EST-01**: User can create estimates/quotes
- **EST-02**: User can convert an estimate to an invoice

### Client Portal

- **PORT-01**: Shareable read-only link for customers to view their invoice
- **PORT-02**: Customer can download PDF from portal

### Advanced Features

- **ADV-01**: Multiple invoice templates/themes
- **ADV-02**: Expense tracking
- **ADV-03**: Credit notes for refunds/adjustments
- **ADV-04**: Bulk invoice actions (multi-select send, void, export)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online payment processing (Stripe/PayPal) | PCI compliance complexity, not feasible for self-hosted v1 |
| Full accounting / double-entry bookkeeping | Different product category entirely |
| Time tracking | Separate domain — use dedicated tools |
| CRM features | Separate domain — customer management is sufficient |
| Inventory management | Not relevant for service-based invoicing |
| Real-time collaboration | CRDT complexity for minimal value in invoicing |
| Native mobile apps | Web-first with responsive design covers mobile |
| Multi-language / i18n | English-only for v1, defer to v2+ |
| OAuth / social login | Email/password with sessions is sufficient for self-hosted |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete (v1) |
| AUTH-02 | Phase 1 | Complete (v1) |
| AUTH-03 | Phase 1 | Complete (v1) |
| AUTH-04 | Phase 1 | Complete (v1) |
| AUTH-05 | Phase 1 | Complete (v1) |
| AUTH-06 | Phase 1 | Complete (v1) |
| AUTH-07 | Phase 1 | Complete (v1) |
| AUTH-08 | Phase 1 | Complete (v1) |
| AUTH-09 | Phase 1 | Complete (v1) |
| CUST-01 | Phase 2 | Complete (v1) |
| CUST-02 | Phase 2 | Complete (v1) |
| CUST-03 | Phase 2 | Complete (v1) |
| CUST-04 | Phase 2 | Complete (v1) |
| CUST-05 | Phase 2 | Complete (v1) |
| CUST-06 | Phase 2 | Complete (v1) |
| CUST-07 | Phase 2 | Complete (v1) |
| INV-01 | Phase 3 | Complete (v1) |
| INV-02 | Phase 3 | Complete (v1) |
| INV-03 | Phase 3 | Complete (v1) |
| INV-04 | Phase 3 | Complete (v1) |
| INV-05 | Phase 3 | Complete (v1) |
| INV-06 | Phase 3 | Complete (v1) |
| INV-07 | Phase 3 | Complete (v1) |
| INV-08 | Phase 3 | Complete (v1) |
| INV-09 | Phase 3 | Complete (v1) |
| INV-10 | Phase 3 | Complete (v1) |
| INV-11 | Phase 3 | Complete (v1) |
| INV-12 | Phase 3 | Complete (v1) |
| INV-13 | Phase 3 | Complete (v1) |
| INV-14 | Phase 3 | Complete (v1) |
| PAY-01 | Phase 4 | Complete (v1) |
| PAY-02 | Phase 4 | Complete (v1) |
| PAY-03 | Phase 4 | Complete (v1) |
| PAY-04 | Phase 4 | Complete (v1) |
| PAY-05 | Phase 4 | Complete (v1) |
| PAY-06 | Phase 4 | Complete (v1) |
| PAY-07 | Phase 4 | Complete (v1) |
| PDF-01 | Phase 4 | Complete (v1) |
| PDF-02 | Phase 4 | Complete (v1) |
| PDF-03 | Phase 4 | Complete (v1) |
| PDF-04 | Phase 4 | Complete (v1) |
| PDF-05 | Phase 4 | Complete (v1) |
| DASH-01 | Phase 5 | Complete (v1) |
| DASH-02 | Phase 5 | Complete (v1) |
| DASH-03 | Phase 5 | Complete (v1) |
| DASH-04 | Phase 5 | Complete (v1) |
| DASH-05 | Phase 5 | Complete (v1) |
| SET-01 | Phase 5 | Complete (v1) |
| SET-02 | Phase 5 | Complete (v1) |
| SET-03 | Phase 5 | Complete (v1) |
| SET-04 | Phase 5 | Complete (v1) |
| SET-05 | Phase 5 | Complete (v1) |
| DEP-01 | Phase 6 | Complete (v1) |
| DEP-02 | Phase 6 | Complete (v1) |
| DEP-03 | Phase 6 | Complete (v1) |
| DEP-04 | Phase 6 | Complete (v1) |
| DEP-05 | Phase 6 | Complete (v1) |
| UI-01 | Phase 1 | Complete (v1) |
| UI-02 | Phase 1 | Complete (v1) |
| UI-03 | Phase 1 | Complete (v1) |
| UI-04 | Phase 1 | Complete (v1) |
| UI-05 | Phase 1 | Complete (v1) |

**Coverage:**
- v1 requirements: 54 total
- Mapped to phases: 54
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after roadmap creation*
