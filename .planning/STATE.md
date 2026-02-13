# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Teams can create invoices, send them to customers, and know exactly who owes what -- without spreadsheets or expensive SaaS tools.
**Current focus:** Phase 1 - Auth, Workspaces & UI Foundation

## Current Position

Phase: 1 of 6 (Auth, Workspaces & UI Foundation)
Plan: 5 of 5 in current phase
Status: Phase Complete
Last activity: 2026-02-13 -- Completed quick task 2: Fix accept invitation with sign-in flow

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 13 min
- Total execution time: 1.12 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-auth-workspaces-ui-foundation | 5 | 67 min | 13 min |

**Recent Trend:**
- Last 5 plans: 01-01 (14 min), 01-02 (3 min), 01-03 (3 min), 01-04 (2 min), 01-05 (45 min)
- Trend: 01-05 longer due to human verification + 6 bug fixes found during testing

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

### Pending Todos

None yet.

### Blockers/Concerns

- ~~[Research]: Tailwind CSS v4 + shadcn/ui compatibility needs verification before Phase 1 implementation~~ RESOLVED: Tailwind v4 + shadcn/ui works perfectly (verified in 01-01)
- ~~[Research]: better-auth organizations plugin API needs hands-on validation during Phase 1 planning~~ RESOLVED: better-auth org plugin schema generated and tables migrated successfully (verified in 01-01)
- [Research]: @react-pdf/renderer + React 19 compatibility needs prototype during Phase 4 planning

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Change primary color to emerald green | 2026-02-13 | 7decaf0 | [1-change-primary-color-to-emerald-green](./quick/1-change-primary-color-to-emerald-green/) |
| 2 | Fix accept invitation with sign-in flow | 2026-02-13 | f091366 | [2-fix-accept-invitation-with-sign-in-flow](./quick/2-fix-accept-invitation-with-sign-in-flow/) |

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed quick-2: Fix accept invitation with sign-in flow
Resume file: .planning/quick/2-fix-accept-invitation-with-sign-in-flow/2-SUMMARY.md
