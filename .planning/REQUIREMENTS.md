# Requirements: InvoiceNest

**Defined:** 2026-02-13
**Core Value:** Teams can create invoices, send them to customers, and know exactly who owes what — without spreadsheets or expensive SaaS tools.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Workspaces

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and log out with session-based auth
- [ ] **AUTH-03**: User session persists across browser refresh
- [ ] **AUTH-04**: User can create a workspace with name and company details
- [ ] **AUTH-05**: Workspace owner can invite members by email
- [ ] **AUTH-06**: Workspace owner can assign roles (owner/member)
- [ ] **AUTH-07**: Members can only access data within their workspace (multi-tenant isolation)
- [ ] **AUTH-08**: Owner can remove members from workspace
- [ ] **AUTH-09**: Role-based permissions enforced (owner: full access; member: limited admin actions)

### Customer Management

- [ ] **CUST-01**: User can add a customer with name, email, phone, and address
- [ ] **CUST-02**: User can edit customer details
- [ ] **CUST-03**: User can search customers by name or email
- [ ] **CUST-04**: User can filter customers by status (active/inactive)
- [ ] **CUST-05**: User can view a customer detail page showing contact info and invoice history
- [ ] **CUST-06**: Customer records display outstanding balance (sum of unpaid invoices)
- [ ] **CUST-07**: User can deactivate/reactivate a customer (soft status toggle, no hard delete)

### Invoice Management

- [ ] **INV-01**: User can create an invoice with a selected customer, due date, and notes/terms
- [ ] **INV-02**: Invoice has line items with description, quantity, and unit price
- [ ] **INV-03**: User can add, edit, and remove line items on a draft invoice
- [ ] **INV-04**: Invoice supports a discount (percentage or fixed amount)
- [ ] **INV-05**: Invoice supports a tax rate applied to the taxable subtotal
- [ ] **INV-06**: Invoice totals are calculated server-side: subtotal → discount → tax → total (integer cents)
- [ ] **INV-07**: Invoices are assigned an auto-incrementing number unique per workspace
- [ ] **INV-08**: Invoice has statuses: draft, sent, paid, overdue, void
- [ ] **INV-09**: Draft invoices are fully editable; sent invoices are read-only
- [ ] **INV-10**: User can transition invoice status (draft→sent, sent→void, etc.) via explicit actions
- [ ] **INV-11**: User can view an invoice list with status, customer, amount, and due date
- [ ] **INV-12**: User can filter invoices by status and date range
- [ ] **INV-13**: User can view a single invoice detail page with full line items and payment history
- [ ] **INV-14**: Overdue invoices are automatically flagged when past due date

### Payments

- [ ] **PAY-01**: User can record a manual payment against an invoice (amount, date, method, notes)
- [ ] **PAY-02**: Partial payments are supported — multiple payments can be recorded against one invoice
- [ ] **PAY-03**: Payment amount cannot exceed the remaining invoice balance
- [ ] **PAY-04**: Invoice status auto-transitions to "paid" when full balance is received
- [ ] **PAY-05**: User can view payment history for an invoice
- [ ] **PAY-06**: Invoice detail shows remaining balance after partial payments
- [ ] **PAY-07**: Financial fields on an invoice are locked once any payment exists

### PDF Generation

- [ ] **PDF-01**: User can generate a PDF for any invoice (draft or sent)
- [ ] **PDF-02**: PDF includes company branding (name, address, logo)
- [ ] **PDF-03**: PDF includes all invoice details: customer info, line items, tax, discount, total, due date
- [ ] **PDF-04**: PDF renders correctly with 1 to 50+ line items (proper page breaks)
- [ ] **PDF-05**: User can download the generated PDF

### Dashboard

- [ ] **DASH-01**: Dashboard shows total outstanding amount (sum of all unpaid/partially paid invoices)
- [ ] **DASH-02**: Dashboard shows count of overdue invoices
- [ ] **DASH-03**: Dashboard shows recent invoices with status indicators (paid/unpaid/overdue)
- [ ] **DASH-04**: Dashboard shows revenue received in the current month/period
- [ ] **DASH-05**: Dashboard data is scoped to the active workspace

### Settings & Polish

- [ ] **SET-01**: Workspace owner can set company details (name, address, logo) for PDF branding
- [ ] **SET-02**: Workspace owner can configure default currency
- [ ] **SET-03**: Workspace owner can configure default tax rate(s) as reusable presets
- [ ] **SET-04**: User can clone/duplicate an existing invoice as a new draft
- [ ] **SET-05**: User can export invoice and payment data as CSV

### Deployment

- [ ] **DEP-01**: Application runs via `docker compose up` with app + PostgreSQL containers
- [ ] **DEP-02**: Database migrations run automatically on startup
- [ ] **DEP-03**: Configuration via environment variables (database URL, session secret, etc.)
- [ ] **DEP-04**: Data persists across container restarts via Docker volumes
- [ ] **DEP-05**: Health check endpoint available for monitoring

### UI/UX Design

- [ ] **UI-01**: UI built with Radix UI primitives + Tailwind CSS
- [ ] **UI-02**: Responsive layout works on desktop and mobile browsers
- [ ] **UI-03**: Professional, trustworthy visual design appropriate for a financial tool
- [ ] **UI-04**: UI screens designed before implementation in each phase
- [ ] **UI-05**: Consistent component patterns across all pages (tables, forms, dialogs, navigation)

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
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| AUTH-08 | Phase 1 | Pending |
| AUTH-09 | Phase 1 | Pending |
| CUST-01 | Phase 2 | Pending |
| CUST-02 | Phase 2 | Pending |
| CUST-03 | Phase 2 | Pending |
| CUST-04 | Phase 2 | Pending |
| CUST-05 | Phase 2 | Pending |
| CUST-06 | Phase 2 | Pending |
| CUST-07 | Phase 2 | Pending |
| INV-01 | Phase 3 | Pending |
| INV-02 | Phase 3 | Pending |
| INV-03 | Phase 3 | Pending |
| INV-04 | Phase 3 | Pending |
| INV-05 | Phase 3 | Pending |
| INV-06 | Phase 3 | Pending |
| INV-07 | Phase 3 | Pending |
| INV-08 | Phase 3 | Pending |
| INV-09 | Phase 3 | Pending |
| INV-10 | Phase 3 | Pending |
| INV-11 | Phase 3 | Pending |
| INV-12 | Phase 3 | Pending |
| INV-13 | Phase 3 | Pending |
| INV-14 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| PAY-07 | Phase 4 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| PDF-04 | Phase 4 | Pending |
| PDF-05 | Phase 4 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| DASH-05 | Phase 5 | Pending |
| SET-01 | Phase 5 | Pending |
| SET-02 | Phase 5 | Pending |
| SET-03 | Phase 5 | Pending |
| SET-04 | Phase 5 | Pending |
| SET-05 | Phase 5 | Pending |
| DEP-01 | Phase 6 | Pending |
| DEP-02 | Phase 6 | Pending |
| DEP-03 | Phase 6 | Pending |
| DEP-04 | Phase 6 | Pending |
| DEP-05 | Phase 6 | Pending |
| UI-01 | All Phases | Pending |
| UI-02 | All Phases | Pending |
| UI-03 | All Phases | Pending |
| UI-04 | All Phases | Pending |
| UI-05 | All Phases | Pending |

**Coverage:**
- v1 requirements: 54 total
- Mapped to phases: 54
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after initial definition*
