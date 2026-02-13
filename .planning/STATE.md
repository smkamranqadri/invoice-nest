# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Teams can create invoices, send them to customers, and know exactly who owes what -- without spreadsheets or expensive SaaS tools.
**Current focus:** Phase 4 - Payments & PDF Generation (Verification)

## Current Position

Phase: 4 of 6 (Payments & PDF Generation) -- Verification In Progress
Plan: Verification artifacts created for implemented Phase 4 scope (no standalone PLAN.md existed)
Status: Automated checks passed; manual UAT 11/12 passed, UAT-11 targeted re-confirmation pending after latest UI/PDF visibility fixes
Last activity: 2026-02-13 -- Applied patch for sticky edit-modal save, discount row overlap fix, and visible PDF page markers during /gsd:verify-work 4

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 9 min
- Total execution time: 1.21 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-auth-workspaces-ui-foundation | 5 | 67 min | 13 min |
| 02-customer-management | 3 | 6 min | 2 min |

**Recent Trend:**
- Last 5 plans: 01-04 (2 min), 01-05 (45 min), 02-01 (2 min), 02-02 (2 min), 02-03 (2 min)
- Trend: 02-03 fast -- detail page assembly from existing data layer and components

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 6-phase structure following data dependency chain (auth -> customers -> invoices -> payments/PDF -> dashboard -> deployment)
- [Roadmap]: UI requirements (UI-01 through UI-05) assigned to Phase 1 where design system is established; subsequent phases maintain standards
- [Research]: Stack confirmed as Next.js 15, PostgreSQL, Drizzle ORM, better-auth, @react-pdf/renderer, shadcn/ui (Radix + Tailwind)
- [01-01]: Used sonner instead of deprecated toast component per shadcn/ui guidance
- [01-01]: Used Zod 4.3.6 (not v3) since @t3-oss/env-nextjs supports it
- [01-01]: Docker PostgreSQL 16 for local development database
- [01-02]: Optimistic middleware cookie check (getSessionCookie) for speed; full session validation in server components
- [01-02]: Generic error message on sign-in failure to avoid revealing which field is wrong
- [01-03]: Server-side getFullOrganization call for sidebar org display rather than client-side fetch
- [01-03]: window.location.reload after org switch to ensure server components re-evaluate
- [01-03]: Single-org users see display-only workspace header; multi-org users get dropdown
- [01-04]: Dashboard layout renders without sidebar when no activeOrganizationId (clean create-workspace page)
- [01-04]: Owner-only settings access enforced via auth.api.getActiveMember() role check
- [01-04]: Slug auto-generated from workspace name with manual override capability
- [01-05]: Disabled session cookieCache for v1 to avoid stale activeOrganizationId after org switching
- [01-05]: Accept-invitation page placed outside dashboard route group (public route for unauthenticated invitees)
- [01-05]: Sign-in calls organization.setActive() for returning users with existing workspaces
- [01-05]: Sign-up form supports callbackUrl for invitation flow redirect
- [02-01]: Conditions array pattern for composable Drizzle query filters
- [02-01]: Empty strings from form inputs converted to null in server actions
- [02-02]: URL-based search/filter state for shareable and browser-back-compatible customer list filtering
- [02-02]: Debounced search (300ms) to avoid excessive server re-fetches on keystroke
- [02-02]: Emerald green badge for active customer status matching primary color theme
- [03-01]: Invoice numbers use per-workspace sequence (`INV-0001`) with transactional increment and unique constraint
- [03-01]: Invoice totals are canonical server-calculated integer cents with half-up rounding
- [03-02]: Sent invoices are read-only except due date edit; void action is owner-only
- [03-03]: Overdue is derived from `sent` + past due date in workspace timezone; list defaults to `updatedAt desc`
- [03-VERIFY]: Manual UAT for Phase 3 passed on 2026-02-13; remaining gaps (focused tests, timezone fallback warning log) are tracked as non-blocking follow-ups
- [04-DECISION]: Payments are mutable for owners (edit/delete with required reason and audit logging)
- [04-DECISION]: Members can record payments and download PDFs; payment corrections are owner-only
- [04-DECISION]: `partially_paid` is a display status (persisted statuses remain `draft/sent/paid/void`)
- [04-DECISION]: Payment on draft auto-sends invoice before recording payment
- [04-DECISION]: PDF supports `draft/sent/paid/void` and uses optional logo with text fallback

### Pending Todos

None yet.

### Blockers/Concerns

- ~~[Research]: Tailwind CSS v4 + shadcn/ui compatibility needs verification before Phase 1 implementation~~ RESOLVED: Tailwind v4 + shadcn/ui works perfectly (verified in 01-01)
- ~~[Research]: better-auth organizations plugin API needs hands-on validation during Phase 1 planning~~ RESOLVED: better-auth org plugin schema generated and tables migrated successfully (verified in 01-01)
- [Phase 4]: Targeted human retest still needed for large-invoice PDF pagination/readability after deterministic chunking fix
- [Phase 4]: Targeted human retest still needed for sticky draft-edit footer visibility, discount row layout, and long-invoice PDF pagination/readability after latest patch

### Phase 4 Discovery (2026-02-13)

- Discovery file: `.planning/phases/04-payments-pdf-generation/DISCOVERY.md`
- Confirmed scope: `PAY-01` to `PAY-07`, `PDF-01` to `PDF-05`
- Carry-over constraints:
  - Invoice status persists `draft/sent/paid/void`; `overdue` remains derived display state
  - Sent invoices are read-only except due date edit (Phase 3 decision)
  - Financial calculations must stay integer-cents server-canonical
- Proposed defaults captured in discovery doc:
  - Manual payments only (no online gateway)
  - Overpayment blocked server-side
  - Financial fields lock once any payment exists
  - PDF generated on demand from current invoice data
- Implemented decision outcomes:
  - Payments are owner-correctable (edit/delete) with required reason and audit log
  - Sent/paid invoices allow non-financial edits; financial edits lock after payment history exists
  - Visible `partially_paid` display state is active
  - PDF generation supports draft/sent/paid/void
  - Branding uses optional logo with workspace text fallback
  - Members can record payments/download PDFs; corrections remain owner-only

### Phase 4 Verification (2026-02-13)

- Verification file: `.planning/phases/04-payments-pdf-generation/VERIFICATION.md`
- Automated checks: `npm run lint` PASS, `npm run build` PASS, `drizzle-kit generate` PASS, `drizzle-kit migrate` PASS
- Manual UAT status:
  - Passed: tests 1-10 and 12
  - Pending targeted re-confirmation: test 11 (long-invoice PDF pagination/readability and edit-draft modal overflow behavior after fix)
- Applied fixes during verification:
  - Deterministic multi-page PDF line-item chunking with repeated headers and fixed `Page X of Y` footer markers
  - Bounded invoice edit dialog with internal scroll for large draft forms
  - Sticky edit-draft modal save footer to keep submit action visible while scrolling
  - Discount/tax row layout stabilization (`md:grid-cols-3`, full-width select trigger, `min-w-0` controls)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Change primary color to emerald green | 2026-02-13 | 7decaf0 | [1-change-primary-color-to-emerald-green](./quick/1-change-primary-color-to-emerald-green/) |
| 2 | Fix accept invitation with sign-in flow | 2026-02-13 | f091366 | [2-fix-accept-invitation-with-sign-in-flow](./quick/2-fix-accept-invitation-with-sign-in-flow/) |
| 3 | Fix all toast notification colors | 2026-02-13 | acd5e81 | [3-fix-all-toast-notification-colors](./quick/3-fix-all-toast-notification-colors/) |
| 4 | Create landing page for InvoiceNest | 2026-02-13 | 24ab970 | [4-create-landing-page-for-invoicenest](./quick/4-create-landing-page-for-invoicenest/) |

## Session Continuity

Last session: 2026-02-13
Stopped at: Phase 4 verification in progress with targeted UAT-11 re-confirmation pending
Resume file: .planning/phases/04-payments-pdf-generation/VERIFICATION.md
Next recommended command: /gsd:plan-phase 5 (after confirming targeted UAT-11 retest)
