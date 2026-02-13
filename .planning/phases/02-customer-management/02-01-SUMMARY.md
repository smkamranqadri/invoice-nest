---
phase: 02-customer-management
plan: 01
subsystem: database
tags: [drizzle, postgresql, zod, server-actions, cuid2]

requires:
  - phase: 01-auth-workspaces-ui-foundation
    provides: organization table, getRequiredOrganization helper, Drizzle ORM setup
provides:
  - Customer pgTable with org FK, indexes, and timestamps
  - Zod v4 validation schemas (createCustomerSchema, updateCustomerSchema)
  - Query functions (getCustomers with search/filter, getCustomerById)
  - Server actions (createCustomer, updateCustomer, toggleCustomerStatus)
affects: [02-02, 02-03, 03-invoice-management]

tech-stack:
  added: []
  patterns:
    - "Server actions with Zod validation and org-scoped mutations"
    - "Query functions with search/filter pattern using Drizzle conditions array"
    - "Empty string to null conversion for optional form fields"

key-files:
  created:
    - src/lib/db/schema/customer.ts
    - src/lib/validations/customer.ts
    - src/lib/queries/customer.ts
    - src/lib/actions/customer.ts
    - src/lib/db/migrations/0001_even_warbird.sql
  modified:
    - src/lib/db/schema/index.ts

key-decisions:
  - "Used conditions array pattern for composable query filters"
  - "Empty strings converted to null in server actions for cleaner DB storage"

patterns-established:
  - "Server action pattern: getRequiredOrganization -> safeParse -> mutation -> revalidatePath -> return {data} or {error}"
  - "Query function pattern: build conditions array, spread into and(), return ordered results"
  - "Validation schema pattern: .optional().or(z.literal('')) for form fields that may be empty"

duration: 2min
completed: 2026-02-13
---

# Phase 2 Plan 1: Customer Data Layer Summary

**Customer pgTable with org-scoped CRUD via Drizzle server actions, Zod v4 validation, and composable query filters**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T16:38:19Z
- **Completed:** 2026-02-13T16:40:19Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Customer table created in PostgreSQL with organizationId FK, 3 indexes, and auto-updating timestamps
- Zod v4 validation schemas with empty string support for optional form fields
- Query functions with composable search (name/email ilike) and status filtering
- Server actions for create, update, and toggle status -- all org-scoped with path revalidation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create customer schema, validation, and run migration** - `57ecf3f` (feat)
2. **Task 2: Create customer query functions and server actions** - `47936ac` (feat)

## Files Created/Modified
- `src/lib/db/schema/customer.ts` - Customer pgTable with org FK, indexes, relations
- `src/lib/db/schema/index.ts` - Added customer export
- `src/lib/db/migrations/0001_even_warbird.sql` - Customer table migration
- `src/lib/validations/customer.ts` - Zod v4 create/update schemas with types
- `src/lib/queries/customer.ts` - getCustomers (search/filter) and getCustomerById
- `src/lib/actions/customer.ts` - createCustomer, updateCustomer, toggleCustomerStatus

## Decisions Made
- Used conditions array pattern for composable query filters (push conditions dynamically, spread into `and()`)
- Empty strings from form inputs converted to null in server actions for cleaner database storage
- Non-null assertion on `or()` return (Drizzle typing quirk when combining ilike conditions)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Customer data layer complete, ready for UI plans (02-02 customer list page, 02-03 customer form)
- All query and action functions exported and type-safe
- Migration applied, customer table live in PostgreSQL

## Self-Check: PASSED

All 6 created files verified on disk. Both task commits (57ecf3f, 47936ac) verified in git log.

---
*Phase: 02-customer-management*
*Completed: 2026-02-13*
