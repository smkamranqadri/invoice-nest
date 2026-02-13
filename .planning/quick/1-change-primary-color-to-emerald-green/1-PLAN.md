---
phase: quick-1-change-primary-color-to-emerald-green
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/globals.css
autonomous: true

must_haves:
  truths:
    - "Primary buttons use emerald green background"
    - "Links and interactive elements show emerald green"
    - "Sidebar active states highlight in emerald green"
    - "Color changes work in both light and dark modes"
  artifacts:
    - path: "src/app/globals.css"
      provides: "Emerald green primary color definitions in OKLCH"
      contains: "--primary: oklch"
  key_links:
    - from: "src/app/globals.css"
      to: "CSS custom properties"
      via: "--primary variable usage"
      pattern: "var\\(--primary\\)"
---

<objective>
Replace the current zinc/neutral primary color with emerald green (#059669, Tailwind emerald-600) throughout the app.

Purpose: Update the visual brand identity from neutral gray to emerald green for primary UI elements (buttons, links, active states, sidebar highlights).

Output: Updated globals.css with emerald green primary colors in both light and dark modes.
</objective>

<execution_context>
@/Users/mkamran/.claude/get-shit-done/workflows/execute-plan.md
@/Users/mkamran/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/app/globals.css

Current system uses OKLCH color format with zinc/neutral as primary:
- Light mode: `--primary: oklch(0.21 0.006 285.885)` (very desaturated, almost gray)
- Dark mode: `--primary: oklch(0.92 0.004 286.32)` (light gray)
- Also used in sidebar-primary for both modes

Target: Emerald green (#059669, Tailwind emerald-600)
- OKLCH equivalent: approximately `oklch(0.596 0.165 166)` for the base color
</context>

<tasks>

<task type="auto">
  <name>Replace primary color with emerald green in OKLCH</name>
  <files>src/app/globals.css</files>
  <action>
Update primary color variables in src/app/globals.css to use emerald green in OKLCH format:

**Light mode (`:root` section):**
- `--primary`: Change from `oklch(0.21 0.006 285.885)` to `oklch(0.596 0.165 166)` (emerald-600 equivalent)
- `--primary-foreground`: Keep as `oklch(0.985 0 0)` (white text on emerald background)
- `--sidebar-primary`: Change from `oklch(0.21 0.006 285.885)` to `oklch(0.596 0.165 166)` (match primary)
- `--sidebar-primary-foreground`: Keep as `oklch(0.985 0 0)` (white text)

**Dark mode (`.dark` section):**
- `--primary`: Change from `oklch(0.92 0.004 286.32)` to `oklch(0.70 0.18 166)` (lighter emerald for dark mode, better contrast)
- `--primary-foreground`: Change from `oklch(0.21 0.006 285.885)` to `oklch(0.15 0.01 166)` (very dark emerald/near-black for text on light emerald)
- `--sidebar-primary`: Update to match dark mode chart color `oklch(0.488 0.243 264.376)` OR use emerald variant `oklch(0.65 0.18 166)` for consistency
- `--sidebar-primary-foreground`: Keep as `oklch(0.985 0 0)` (white text)

Note: Dark mode primary is intentionally lighter/more vibrant since it appears on dark backgrounds. Adjust chroma (saturation) if needed during verification.
  </action>
  <verify>
Run the dev server and visually inspect:
```bash
npm run dev
```

Check these elements use emerald green:
1. Sign-in/Sign-up button (primary button)
2. Create workspace button
3. Sidebar active navigation item highlight
4. Any links or interactive primary-colored elements
5. Test both light and dark modes (toggle theme if available)

Colors should be clearly emerald green, not gray/zinc.
  </verify>
  <done>
- `src/app/globals.css` updated with emerald OKLCH values for primary colors
- Light mode shows emerald-600 equivalent (`oklch(0.596 0.165 166)`)
- Dark mode shows adjusted emerald for dark backgrounds
- Both `:root` and `.dark` sections updated
- Visual inspection confirms emerald green appears on primary UI elements
  </done>
</task>

</tasks>

<verification>
**Color accuracy check:**
1. Start dev server (`npm run dev`)
2. Navigate to sign-in page - primary button should be emerald green
3. Sign in and check sidebar - active nav items should highlight in emerald
4. Toggle dark mode - emerald should be visible and have good contrast
5. Check any other primary-colored elements (links, badges, etc.)

**Expected outcome:**
- Clear emerald green (#059669 family) replaces all gray/zinc primary colors
- Text remains readable on emerald backgrounds (white in light mode, dark in dark mode)
- No accessibility/contrast issues
</verification>

<success_criteria>
- [x] globals.css `:root` section has emerald primary color in OKLCH
- [x] globals.css `.dark` section has adjusted emerald primary color in OKLCH
- [x] sidebar-primary colors updated to match primary color scheme
- [x] Visual confirmation: emerald green appears on buttons, links, active states
- [x] Visual confirmation: both light and dark modes work correctly
- [x] No console errors or build issues
</success_criteria>

<output>
After completion, create `.planning/quick/1-change-primary-color-to-emerald-green/1-SUMMARY.md`
</output>
