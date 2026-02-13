# Phase 4 Discovery: Payments & PDF Generation

**Phase:** 04-payments-pdf-generation  
**Date:** 2026-02-13  
**Status:** Discussion in progress (awaiting user confirmations)

## Objective

Clarify scope, constraints, and definition of done for Phase 4 so `/gsd:plan-phase 4` can produce an execution-ready plan.

## In-Scope Requirements

- Payments: `PAY-01`, `PAY-02`, `PAY-03`, `PAY-04`, `PAY-05`, `PAY-06`, `PAY-07`
- PDF: `PDF-01`, `PDF-02`, `PDF-03`, `PDF-04`, `PDF-05`

## Context Carried Forward

- Phase 3 is verified complete, including invoice domain logic and invoice detail/list screens.
- Invoice status model currently persists `draft`, `sent`, `paid`, `void`; `overdue` is computed display status.
- Sent invoices are already read-only except due date edits (current Phase 3 behavior).
- Known Phase 4 risk from state: `@react-pdf/renderer` + React 19 compatibility should be prototyped early.

## Working Assumptions (Proposed Defaults)

1. Payments remain manual-only (no Stripe/PayPal integration in v1).
2. Payment records are append-only for v1 (no delete/edit UI after creation).
3. Overpayment is blocked at server action level with integer-cents validation.
4. Once an invoice has any payment, line items, discount, tax, and total-driving fields are locked.
5. PDF is generated on demand from current invoice data and downloaded directly (no stored PDF file versioning in v1).
6. Both owner and member can record payments and download PDFs unless role constraints are explicitly requested.
7. PDF rendering supports large invoices (50+ line items) with tested page-break behavior as a release gate.

## Decisions Needed Before Planning

1. Should payments be immutable in v1, or should owner-only delete/edit be allowed?
2. Which non-financial fields remain editable after first payment (for example due date and notes/terms)?
3. Do we want a visible "partially paid" display state in UI, or keep status as `sent` until fully paid?
4. Should PDF generation be allowed for `void` invoices, or only draft/sent/paid?
5. For branding in PDFs, is logo required when available and optional otherwise, or optional always?
6. Should members have full payment/PDF access, or should any of these actions be owner-only?

## Draft Definition Of Done

Phase 4 is done when all items below are true:

1. Payments can be recorded with amount/date/method/notes, including multiple partial payments.
2. Remaining balance is always correct and overpayment attempts are rejected.
3. Invoice automatically becomes `paid` when balance reaches zero.
4. Invoice detail shows payment history and current remaining balance.
5. Financial edit locks are enforced after first payment.
6. PDF download works for supported invoice statuses with complete invoice details and branding fields.
7. PDF output is verified on both small and large invoices, including page-break correctness.
8. Lint/build pass and manual UAT scenarios for payments + PDF succeed.

## Next Step

After confirming the open decisions, run `/gsd:plan-phase 4`.
