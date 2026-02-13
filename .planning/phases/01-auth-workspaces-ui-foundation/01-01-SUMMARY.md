---
phase: 01-auth-workspaces-ui-foundation
plan: 01
subsystem: infra
tags: [nextjs, postgresql, drizzle, better-auth, shadcn-ui, tailwind-v4, typescript]

# Dependency graph
requires: []
provides:
  - "Next.js 15.5.12 project scaffold with TypeScript and Tailwind v4"
  - "PostgreSQL database with 7 better-auth tables (user, session, account, verification, organization, member, invitation)"
  - "better-auth server instance with organization plugin and email/password auth"
  - "better-auth client instance with organizationClient plugin"
  - "API route handler at /api/auth/[...all]"
  - "Drizzle ORM connection and migration infrastructure"
  - "18 shadcn/ui components (button, card, dialog, dropdown-menu, form, input, label, select, separator, sheet, sidebar, table, tabs, sonner, badge, avatar, tooltip, skeleton)"
  - "Environment validation via @t3-oss/env-nextjs"
affects: [01-02, 01-03, 01-04, 01-05, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: [next@15.5.12, react@19.1.0, drizzle-orm@0.45.1, drizzle-kit@0.31.9, better-auth@1.4.18, postgres@3.4.8, zod@4.3.6, react-hook-form@7.71.1, "@hookform/resolvers@5.2.2", "@paralleldrive/cuid2@3.3.0", "@t3-oss/env-nextjs@0.13.10", tailwindcss@4, shadcn@3.8.4, lucide-react@0.564.0, sonner@2.0.7, clsx@2.1.1, tailwind-merge@3.4.0, tw-animate-css@1.4.0]
  patterns: [drizzle-adapter-for-better-auth, organization-plugin-workspace-pattern, css-first-tailwind-v4-theme, env-validation-with-t3-env]

key-files:
  created: [src/lib/auth.ts, src/lib/auth-client.ts, src/lib/db/index.ts, src/lib/db/schema/auth.ts, src/lib/db/schema/index.ts, src/lib/env.ts, src/lib/utils.ts, drizzle.config.ts, components.json, src/app/api/auth/[...all]/route.ts]
  modified: [package.json, src/app/globals.css, src/app/layout.tsx]

key-decisions:
  - "Used sonner instead of deprecated toast component per shadcn/ui guidance"
  - "Used Zod 4 (not v3) since @t3-oss/env-nextjs supports it"
  - "Docker PostgreSQL 16 for local development database"

patterns-established:
  - "Drizzle schema generation: better-auth CLI generates schema, then drizzle-kit generates/runs migrations"
  - "Environment validation: all env vars validated via @t3-oss/env-nextjs at build time"
  - "UI component library: shadcn/ui components in src/components/ui/, cn() helper for class merging"
  - "Auth pattern: server instance in auth.ts, client instance in auth-client.ts, API route in [...all]/route.ts"

# Metrics
duration: 14min
completed: 2026-02-13
---

# Phase 1 Plan 1: Project Scaffold Summary

**Next.js 15.5.12 with PostgreSQL/Drizzle ORM, better-auth organization plugin, and 18 shadcn/ui components on Tailwind v4**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-13T13:51:15Z
- **Completed:** 2026-02-13T14:05:21Z
- **Tasks:** 3
- **Files modified:** 49

## Accomplishments

- Full Next.js 15.5.12 project with TypeScript, Tailwind CSS v4, and ESLint
- PostgreSQL database with all 7 better-auth tables created and migrated via Drizzle
- better-auth configured with organization plugin (workspace support), email/password auth, session caching, and cookie-based sessions
- 18 shadcn/ui components installed with OKLCH zinc theme, dark mode support, and Toaster/TooltipProvider in root layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Next.js project and install all dependencies** - `8f9133f` (feat)
2. **Task 2: Configure database, better-auth, and generate schema** - `cd7be83` (feat)
3. **Task 3: Initialize shadcn/ui and install all Phase 1 components** - `630448d` (feat)

## Files Created/Modified

- `package.json` - Project config with all 18+ dependencies
- `tsconfig.json` - TypeScript configuration with path aliases
- `next.config.ts` - Next.js 15 configuration
- `drizzle.config.ts` - Drizzle Kit migration configuration
- `components.json` - shadcn/ui configuration
- `src/lib/env.ts` - Environment variable validation (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
- `src/lib/utils.ts` - cn() class merging utility
- `src/lib/db/index.ts` - Drizzle ORM database connection with postgres.js
- `src/lib/db/schema/auth.ts` - better-auth generated schema (7 tables with relations)
- `src/lib/db/schema/index.ts` - Schema barrel export
- `src/lib/db/migrations/0000_*.sql` - Initial migration creating all auth tables
- `src/lib/auth.ts` - better-auth server instance with organization plugin
- `src/lib/auth-client.ts` - better-auth client with organizationClient plugin
- `src/app/api/auth/[...all]/route.ts` - Auth API route handler (GET, POST)
- `src/app/globals.css` - Tailwind v4 theme with OKLCH colors, dark mode, sidebar vars
- `src/app/layout.tsx` - Root layout with Toaster, TooltipProvider, InvoiceNest metadata
- `src/components/ui/*.tsx` - 18 shadcn/ui component files

## Decisions Made

- Used sonner instead of deprecated toast component (shadcn/ui removed toast in favor of sonner)
- Used Zod 4.3.6 since @t3-oss/env-nextjs explicitly supports it via peerDependencies
- Started Docker Desktop and created PostgreSQL 16 container for local development
- Added TooltipProvider to root layout as recommended by shadcn/ui sidebar component

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app refused non-empty directory**
- **Found during:** Task 1 (project scaffolding)
- **Issue:** create-next-app@15 will not run in a directory containing .planning/ and .claude/
- **Fix:** Created project in /tmp/invoice-nest-temp, then rsync'd files to repo (excluding .git)
- **Files modified:** All project files
- **Verification:** Build passes, all files present
- **Committed in:** 8f9133f (Task 1 commit)

**2. [Rule 1 - Bug] Fixed duplicate @apply rules in globals.css**
- **Found during:** Task 3 (shadcn/ui initialization)
- **Issue:** shadcn init created duplicate @apply border-border and @apply bg-background lines in @layer base
- **Fix:** Removed duplicate lines
- **Files modified:** src/app/globals.css
- **Verification:** Build passes, CSS renders correctly
- **Committed in:** 630448d (Task 3 commit)

**3. [Rule 3 - Blocking] toast component deprecated, replaced with sonner**
- **Found during:** Task 3 (component installation)
- **Issue:** `npx shadcn add toast` fails with "The toast component is deprecated. Use the sonner component instead."
- **Fix:** Replaced toast with sonner in the component list
- **Files modified:** src/components/ui/sonner.tsx (created instead of toast)
- **Verification:** Build passes, Toaster component works in layout
- **Committed in:** 630448d (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for execution. No scope creep. Sonner is the official replacement for toast.

## Issues Encountered

- Docker Desktop was not running; had to start it and wait ~90 seconds for the daemon to be ready before creating the PostgreSQL container.
- better-auth CLI warned about missing BASE_URL but still generated schema correctly (the env var is read at runtime, not by the CLI).

## User Setup Required

PostgreSQL must be running locally via Docker:
```bash
docker start invoice-nest-db
```
If the container doesn't exist:
```bash
docker run --name invoice-nest-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=invoice_nest -p 5432:5432 -d postgres:16
```

## Next Phase Readiness

- Auth foundation complete: better-auth API responds at /api/auth/ok
- Database ready: all 7 tables created and indexed
- UI components ready: 18 shadcn/ui components available for building auth pages
- Ready for Plan 01-02 (auth UI pages: sign-in, sign-up) and all subsequent plans

## Self-Check: PASSED

All 13 key files verified present. All 3 task commits verified in git log.

---
*Phase: 01-auth-workspaces-ui-foundation*
*Completed: 2026-02-13*
