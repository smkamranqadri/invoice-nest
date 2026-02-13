---
phase: 03-invoice-creation
phase_number: 3
status: ready_for_execution
created: 2026-02-13
depends_on:
  - 02-customer-management
requirements:
  - INV-01
  - INV-02
  - INV-03
  - INV-04
  - INV-05
  - INV-06
  - INV-07
  - INV-08
  - INV-09
  - INV-10
  - INV-11
  - INV-12
  - INV-13
  - INV-14
plan_items:
  - id: 03-01
    title: Invoice data model, calculations, and server domain actions
    wave: 1
    depends_on: []
  - id: 03-02
    title: Invoice draft/detail UI with line-item editing and status transitions
    wave: 2
    depends_on: [03-01]
  - id: 03-03
    title: Invoice list/filter UI, overdue handling, and customer balance integration
    wave: 3
    depends_on: [03-01, 03-02]
verification:
  automated:
    - npm run lint
    - npm run build
  manual:
    - Create/edit/send invoice workflow
    - Status transition and read-only enforcement
    - List filtering and overdue behavior
---

# Phase 03 Plan: Invoice Creation

## Objective

Deliver a complete invoice creation and management workflow scoped to the active workspace: create draft invoices, manage line items and totals server-side, enforce status transitions, render list/detail views, and support filtering by status/date.

## Scope

In scope:
- `INV-01` through `INV-14`
- Replacing Phase 2 placeholders on customer detail with real invoice-linked data where needed for outstanding balance and invoice history

Out of scope for this phase:
- Payment recording and payment-history accounting logic (`PAY-*`, handled in Phase 4)
- PDF generation (`PDF-*`, handled in Phase 4)
- Dashboard financial aggregation (`DASH-*`, handled in Phase 5)

## Implementation Strategy

Sequence is dependency-first: establish invoice domain invariants in the data layer, then implement draft/detail UI, then implement list/filter and customer integration.

### Plan 03-01: Invoice Data Model, Calculations, and Server Domain Actions

Goal:
- Create the durable invoice domain foundation with org-scoped queries/actions and strict server-side total calculation.

Primary files:
- `src/lib/db/schema/invoice.ts` (new)
- `src/lib/db/schema/customer.ts` (update relations)
- `src/lib/db/schema/index.ts` (export invoice schema)
- `src/lib/db/migrations/*` (new migration)
- `src/lib/validations/invoice.ts` (new)
- `src/lib/domain/invoice-totals.ts` (new)
- `src/lib/domain/invoice-status.ts` (new)
- `src/lib/queries/invoice.ts` (new)
- `src/lib/actions/invoice.ts` (new)

Tasks:
1. Add `invoice`, `invoiceLineItem`, and `invoiceSequence` tables with org scoping and indexes.
2. Add foreign-key relations from invoice to organization/customer and invoiceLineItem to invoice.
3. Implement deterministic per-workspace invoice numbering via `invoiceSequence` in a transaction.
4. Implement server-only money calculation utility:
- integer cents end-to-end
- discount type support (`percentage` and `fixed`)
- tax computed after discount
- canonical total fields persisted on invoice rows.
5. Implement status transition guard utility:
- allowed: `draft -> sent`, `draft -> void`, `sent -> void`
- disallow illegal transitions
- keep sent/void read-only at action layer.
6. Implement org-scoped query/action surface for:
- create draft invoice
- update draft invoice
- mark sent
- void invoice
- get invoice by id
- list invoices with filters and overdue-aware display status.

Acceptance checks:
1. `npx drizzle-kit generate` creates expected migration.
2. `npx drizzle-kit migrate` applies successfully.
3. `npx tsc --noEmit` passes for new schema/validation/domain files.
4. Attempting to update a sent invoice returns an explicit error.
5. Invoice numbers are unique per organization (enforced by DB + sequence update).

### Plan 03-02: Invoice Draft/Detail UI with Line-Item Editing and Status Transitions

Goal:
- Ship UI to create, edit, and inspect invoices while preserving server-side authority for totals and transitions.

Primary files:
- `src/app/(dashboard)/invoices/new/page.tsx` (new)
- `src/app/(dashboard)/invoices/[id]/page.tsx` (new)
- `src/components/invoices/invoice-form.tsx` (new)
- `src/components/invoices/line-items-editor.tsx` (new)
- `src/components/invoices/invoice-status-badge.tsx` (new)
- `src/components/invoices/invoice-detail.tsx` (new)

Tasks:
1. Build invoice form supporting:
- customer select (active customers only)
- due date, notes/terms
- dynamic line items (add/edit/remove)
- discount input (percentage/fixed) and tax rate input.
2. Keep client-side totals as preview only; on submit, trust server-calculated totals from action response.
3. Implement create-draft and update-draft flows.
4. Implement detail page actions for `Mark Sent` and `Void`.
5. Enforce read-only UI state when invoice is not draft.
6. Add clear status badges including overdue display behavior from computed status.

Acceptance checks:
1. User can create draft invoice with multiple line items.
2. User can edit draft invoice and persisted totals update correctly.
3. User can mark draft invoice as sent.
4. Sent invoices render as read-only (no editable fields/actions except allowed transitions).
5. Invalid payloads show user-visible errors without corrupting persisted state.

### Plan 03-03: Invoice List/Filter UI, Overdue Handling, and Customer Balance Integration

Goal:
- Deliver invoice management overview and filtering, and connect invoice data back to customer detail screens.

Primary files:
- `src/app/(dashboard)/invoices/page.tsx` (new)
- `src/app/(dashboard)/invoices/invoices-client.tsx` (new)
- `src/components/invoices/invoice-table.tsx` (new)
- `src/lib/queries/invoice.ts` (extend)
- `src/components/customers/customer-detail.tsx` (update placeholder sections)
- `src/lib/queries/customer.ts` (extend with balance/history projections)

Tasks:
1. Build invoice list page with columns: number, customer, status, amount, due date, updated date.
2. Add URL-based filters:
- status (`all`, `draft`, `sent`, `overdue`, `paid`, `void`)
- due date range (`from`, `to`).
3. Implement overdue classification in list/detail:
- overdue when `status = sent` and `dueDate < today` (and not paid/void).
4. Update customer detail data sections:
- replace outstanding balance placeholder with computed outstanding from unpaid/sent/overdue invoices
- replace invoice empty placeholder with customer-specific invoice history list.
5. Ensure list/detail navigation is bidirectional and preserves filter/search state when practical.

Acceptance checks:
1. List page loads and shows created invoices with correct customer/status/amount/due date.
2. Status and date filters change results correctly and are reflected in URL.
3. Overdue invoices are flagged automatically based on due date logic.
4. Customer detail page shows real outstanding balance and linked invoice history.
5. No cross-workspace data leakage in list/detail/filter results.

## Requirement Mapping

| Requirement | Plan Item(s) |
|---|---|
| INV-01, INV-02, INV-03 | 03-01, 03-02 |
| INV-04, INV-05, INV-06 | 03-01, 03-02 |
| INV-07 | 03-01 |
| INV-08, INV-10 | 03-01, 03-02, 03-03 |
| INV-09 | 03-01, 03-02 |
| INV-11, INV-12 | 03-03 |
| INV-13 | 03-02, 03-03 |
| INV-14 | 03-03 |

## Verification Loop

Automated loop (run after each plan item and at phase end):
1. `npm run lint`
2. `npm run build`
3. Re-run focused checks after fixes before moving to next plan item.

Manual UAT loop (phase-level gate):
1. Create draft invoice with 2+ line items, percentage discount, and tax rate.
2. Edit draft and verify totals stay consistent with server response.
3. Mark invoice as sent and confirm read-only lock.
4. Create invoice with past due date, confirm overdue status in list/detail.
5. Filter invoices by status and due-date range.
6. Open invoice detail from list and back.
7. Confirm customer detail outstanding balance and invoice history reflect created invoices.

Exit criteria:
- All `INV-*` requirements mapped to observable behavior.
- No blocking lint/build failures.
- Manual UAT scenarios pass.

## Risks and Mitigations

1. Money calculation drift between client and server.
- Mitigation: server-calculated totals are canonical; client preview is informational only.

2. Invoice-number race conditions under concurrent creation.
- Mitigation: transactional `invoiceSequence` increment and unique `(organizationId, invoiceNumber)` constraint.

3. Overdue behavior inconsistencies due to date boundaries/time zones.
- Mitigation: normalize due-date comparisons in one domain helper and reuse in list/detail queries.

## Ready-to-Execute Command

`/gsd:execute-phase 3`
