---
phase: quick
plan: 5
type: execute
files_modified:
  - src/components/workspace/create-workspace-form.tsx
autonomous: true
---

<objective>
Fix onboarding regression where sidebar is missing after first workspace creation until manual refresh.

Purpose: Ensure new users land on `/dashboard` with active workspace context immediately.
Output: Workspace creation flow sets active organization and performs full page reload navigation so server layout re-evaluates.
</objective>

<execution_context>
Quick task focused on client onboarding flow in create workspace form.
</execution_context>

<context>
- `/create-workspace` renders inside dashboard route group without sidebar when no active organization.
- Client-side `router.push("/dashboard")` preserves current layout instance.
- Sidebar appears after manual refresh, indicating stale layout state.
- Existing workspace switch flow already uses hard reload (`window.location.reload`) to force server re-evaluation.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Activate created organization and hard-navigate to dashboard</name>
  <files>src/components/workspace/create-workspace-form.tsx</files>
  <action>
1. Capture organization data from `authClient.organization.create(...)`.
2. Attempt to determine created organization id:
   - use create response id when available;
   - fallback to matching org from `organization.list()` by slug.
3. If organization id is found, call `authClient.organization.setActive({ organizationId })`.
4. Replace client-side router transition with full page navigation to `/dashboard` via `window.location.assign("/dashboard")`.
5. Keep existing success/error toasts and loading guards.
  </action>
  <verify>
1. Reproduce flow:
   - new user sign up -> create first workspace -> redirected to dashboard.
2. Confirm sidebar is visible immediately (no manual refresh required).
3. Run `npm run lint` and `npm run build`.
  </verify>
  <done>
- First-workspace creation results in active organization context on first dashboard render.
- Sidebar appears immediately after redirect.
- Build and lint pass.
  </done>
</task>

</tasks>

<verification>
- Manual onboarding flow no longer requires refresh.
- Static checks pass.
</verification>

<success_criteria>
- Regression fixed for first-time workspace onboarding.
- No changes outside quick task scope.
</success_criteria>

<output>
After completion, create `.planning/quick/5-fix-sidebar-after-first-workspace-create/5-SUMMARY.md`.
</output>
