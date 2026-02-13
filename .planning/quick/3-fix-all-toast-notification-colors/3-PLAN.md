---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified: [src/components/ui/sonner.tsx]
autonomous: true

must_haves:
  truths:
    - "Toast notifications display with correct background colors"
    - "Toast text is readable with correct foreground colors"
    - "Success, error, and warning toasts have distinct visual styles"
  artifacts:
    - path: "src/components/ui/sonner.tsx"
      provides: "Corrected toast styling with valid OKLCH color variables"
      min_lines: 45
  key_links:
    - from: "src/components/ui/sonner.tsx"
      to: "src/app/globals.css"
      via: "CSS variables in sonner style object"
      pattern: "var\\(--success\\)|var\\(--destructive\\)|var\\(--warning\\)"
---

<objective>
Fix all toast notification colors by removing invalid hsl() wrappers from sonner.tsx. The component currently wraps OKLCH color variables in hsl() function, making them invalid. Global CSS variables contain complete OKLCH values like oklch(0.55 0.18 145), not HSL channels.

Purpose: Toast notifications will render with correct colors instead of rendering incorrectly due to invalid CSS
Output: Updated sonner.tsx with valid CSS color references
</objective>

<execution_context>
Quick plan execution — single focused task to fix toast colors
</execution_context>

<context>
@src/components/ui/sonner.tsx
@src/app/globals.css

The sonner.tsx component currently has invalid CSS:
- `"hsl(var(--success))"` — should be `"var(--success)"`
- `"hsl(var(--success-foreground))"` — should be `"var(--success-foreground)"`
- `"hsl(var(--destructive))"` — should be `"var(--destructive)"`
- `"hsl(var(--destructive-foreground))"` — `--destructive-foreground` doesn't exist in globals.css, use `"oklch(0.985 0 0)"` (white)
- `"hsl(var(--warning))"` — should be `"var(--warning)"`
- `"hsl(var(--warning-foreground))"` — should be `"var(--warning-foreground)"`

The normal toast style already uses `"var(--popover)"` without hsl() wrapper, confirming correct approach.
</context>

<tasks>

<task type="auto">
  <name>Remove hsl() wrappers from all toast color variables in sonner.tsx</name>
  <files>src/components/ui/sonner.tsx</files>
  <action>
    Update the style object in src/components/ui/sonner.tsx (lines 27-43):

    1. Change line 32: `"--success-bg": "hsl(var(--success))"` → `"--success-bg": "var(--success)"`
    2. Change line 33: `"--success-text": "hsl(var(--success-foreground))"` → `"--success-text": "var(--success-foreground)"`
    3. Change line 34: `"--success-border": "hsl(var(--success))"` → `"--success-border": "var(--success)"`
    4. Change line 35: `"--error-bg": "hsl(var(--destructive))"` → `"--error-bg": "var(--destructive)"`
    5. Change line 36: `"--error-text": "hsl(var(--destructive-foreground))"` → `"--error-text": "oklch(0.985 0 0)"` (white, since --destructive-foreground doesn't exist)
    6. Change line 37: `"--error-border": "hsl(var(--destructive))"` → `"--error-border": "var(--destructive)"`
    7. Change line 38: `"--warning-bg": "hsl(var(--warning))"` → `"--warning-bg": "var(--warning)"`
    8. Change line 39: `"--warning-text": "hsl(var(--warning-foreground))"` → `"--warning-text": "var(--warning-foreground)"`
    9. Change line 40: `"--warning-border": "hsl(var(--warning))"` → `"--warning-border": "var(--warning)"`

    All other lines in the style object should remain unchanged (lines 29-31, 41).
  </action>
  <verify>
    1. Visually inspect src/components/ui/sonner.tsx lines 32-40 to confirm all hsl() wrappers are removed
    2. Verify that success, error, and warning toast color variables now use direct var() references or hardcoded OKLCH values
    3. Confirm no hsl() function remains in the style object
  </verify>
  <done>
    All 9 toast color variable lines updated:
    - Success colors: bg uses var(--success), text uses var(--success-foreground), border uses var(--success)
    - Error colors: bg uses var(--destructive), text uses white, border uses var(--destructive)
    - Warning colors: bg uses var(--warning), text uses var(--warning-foreground), border uses var(--warning)
    - No hsl() wrappers remain in the style object
  </done>
</task>

</tasks>

<verification>
After task completion:
1. Open src/components/ui/sonner.tsx and verify the style object (lines 27-43)
2. Confirm all hsl() wrappers have been removed
3. Verify colors reference OKLCH variables correctly
4. No syntax errors in the file
</verification>

<success_criteria>
Toast notification colors are fixed and will render correctly:
- Success toasts: oklch(0.55 0.18 145) background with white text
- Error toasts: oklch(0.577 0.245 27.325) background with white text
- Warning toasts: oklch(0.70 0.15 70) background with dark text
- All color values in sonner.tsx use valid CSS syntax without hsl() wrappers
</success_criteria>

<output>
After completion, update .planning/quick/3-fix-all-toast-notification-colors/3-SUMMARY.md with execution results
</output>
