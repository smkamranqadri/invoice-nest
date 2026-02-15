---
phase: quick
plan: 5
subsystem: onboarding
tags: [workspace, sidebar, layout-refresh, active-organization]

requires:
  - phase: 01-auth-workspaces-ui-foundation
    provides: "create workspace flow and dashboard layout gating by activeOrganizationId"
provides:
  - "First-workspace creation now activates org explicitly before dashboard navigation"
  - "Dashboard navigation after workspace creation now uses full reload for layout re-evaluation"
affects: [auth, dashboard-layout, onboarding]

tech-stack:
  added: []
  patterns:
    - "Hard navigation after active-org changes to refresh server layout state"
    - "Best-effort org id fallback via organization.list() when create response omits id"

key-files:
  modified:
    - src/components/workspace/create-workspace-form.tsx

key-decisions:
  - "Use window.location.assign('/dashboard') to avoid stale preserved layout state"
  - "Call organization.setActive after create to guarantee active org before dashboard render"

duration: 3min
completed: 2026-02-15
---

# Quick Task 5: Fix Sidebar Missing After First Workspace Creation Summary

**Sidebar now appears immediately after first workspace creation without requiring manual browser refresh.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-15T10:31:00Z
- **Completed:** 2026-02-15T10:33:58Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Updated workspace creation flow to capture created organization id and explicitly set it active.
- Added fallback org lookup using `organization.list()` when create response does not include id.
- Replaced client-side dashboard transition with full navigation (`window.location.assign("/dashboard")`) so server layout re-evaluates immediately and sidebar state is correct.

## Task Commits

Each task was committed atomically:

1. **Task 1: Activate created org and hard-navigate dashboard after first workspace creation** - `37ff91b` (fix)

## Files Created/Modified
- `src/components/workspace/create-workspace-form.tsx` - Active-org activation and hard navigation to resolve stale layout/sidebar state

## Decisions Made
- Kept the fix scoped to onboarding flow only.
- Matched existing workspace-switch behavior that already relies on hard reload to update server-rendered org state.

## Deviations from Plan

None.

## Issues Encountered

None.

## User Setup Required

None.

---
*Quick Task: 5-fix-sidebar-after-first-workspace-create*
*Completed: 2026-02-15*
