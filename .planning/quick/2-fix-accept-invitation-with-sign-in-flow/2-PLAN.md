---
phase: quick
plan: 2
type: execute
files_modified:
  - src/components/auth/sign-in-form.tsx
  - src/components/auth/sign-up-form.tsx
autonomous: true
---

<objective>
Fix accept invitation flow by preserving callbackUrl through sign-in page.

Currently, when user clicks "Already have an account? Sign in" on the sign-up page, the callbackUrl (which points to /accept-invitation/{id}) is lost. Both forms must preserve and pass this parameter through navigation and form submission.

Purpose: Users invited to join workspaces can complete sign-in flow and be redirected to accept invitation, instead of being sent to dashboard.

Output: Both sign-in and sign-up forms preserve callbackUrl throughout navigation and redirect to it after successful auth.
</objective>

<execution_context>
Quick task targeting single concern: callbackUrl preservation through auth flow.
</execution_context>

<context>
Sign-up form already supports callbackUrl (line 61-62 in sign-up-form.tsx).
Sign-in form does NOT support it - always redirects to /dashboard (line 65 in sign-in-form.tsx).
Both forms have navigation links to the other form that don't pass callbackUrl through.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add callbackUrl support to sign-in form and fix navigation links</name>
  <files>src/components/auth/sign-in-form.tsx, src/components/auth/sign-up-form.tsx</files>
  <action>
1. In sign-in-form.tsx:
   - Add `import { useSearchParams } from "next/navigation";` (already imported in sign-up-form.tsx)
   - Add `const searchParams = useSearchParams();` after `const router = useRouter();`
   - In onSubmit (around line 65), replace `router.push("/dashboard");` with:
     ```
     const callbackUrl = searchParams.get("callbackUrl");
     router.push(callbackUrl || "/dashboard");
     ```
   - Update the "Sign up" link (line 112) from `href="/sign-up"` to use dynamic URL that preserves callbackUrl:
     ```
     href={callbackUrl ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-up"}
     ```

2. In sign-up-form.tsx:
   - Update the "Sign in" link (line 123) from `href="/sign-in"` to use dynamic URL that preserves callbackUrl:
     ```
     href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
     ```
     Note: callbackUrl variable already exists from searchParams.get("callbackUrl") (line 61)

Both forms now preserve callbackUrl through navigation and final redirect.
  </action>
  <verify>
1. Visual inspection: Both form files have useSearchParams import and callbackUrl handling
2. Test flow manually:
   - Visit /accept-invitation/{id} (with valid invitation)
   - Should redirect to /sign-up?callbackUrl=/accept-invitation/{id}
   - Click "Sign in" link
   - Should redirect to /sign-in?callbackUrl=/accept-invitation/{id}
   - Fill in sign-in form and submit
   - Should redirect back to /accept-invitation/{id} (not /dashboard)
3. Also test reverse: /sign-in -> "Sign up" -> /sign-up -> should preserve callbackUrl
  </verify>
  <done>
- sign-in-form.tsx reads callbackUrl from searchParams and redirects to it after successful sign-in (fallback: /dashboard)
- sign-up-form.tsx "Sign in" link passes callbackUrl to sign-in page via query param
- sign-in-form.tsx "Sign up" link passes callbackUrl to sign-up page via query param
- Complete invitation flow: /accept-invitation/{id} -> /sign-up?callbackUrl=... -> /sign-in?callbackUrl=... -> back to /accept-invitation/{id}
  </done>
</task>

</tasks>

<verification>
After completing this task, the invitation flow should work end-to-end:
1. Unauthenticated user visits /accept-invitation/{id}
2. Redirected to /sign-up?callbackUrl=/accept-invitation/{id}
3. User can toggle to sign-in while preserving callbackUrl
4. After sign-in/sign-up, user is redirected back to /accept-invitation/{id} to complete the flow
</verification>

<success_criteria>
- callbackUrl preserved through all navigation between sign-in and sign-up pages
- Sign-in form redirects to callbackUrl instead of always going to /dashboard
- Accept invitation flow works end-to-end for both new and existing users
</success_criteria>

<output>
After completion, update: .planning/quick/2-fix-accept-invitation-with-sign-in-flow/2-SUMMARY.md
</output>
