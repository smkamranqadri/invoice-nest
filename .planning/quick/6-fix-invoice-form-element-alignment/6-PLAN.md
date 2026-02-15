---
phase: quick
plan: 6
type: execute
files_modified:
  - src/components/invoices/invoice-form.tsx
autonomous: true
---

<objective>
Fix invoice draft form control alignment in the discount/tax row.

Purpose: Ensure Discount Type, Discount Value, Tax Preset, and Tax % controls align consistently in one row on desktop without visual offset.
Output: Updated layout classes in invoice form so row items anchor to the top and keep consistent placement.
</objective>

<execution_context>
Quick task focused on UI alignment in invoice form.
</execution_context>

<context>
- Reported issue shows discount/tax row controls appearing misaligned.
- This row uses a 4-column grid with mixed control types and helper text.
- Fix should stay scoped to layout/alignment classes only.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Normalize discount/tax row alignment</name>
  <files>src/components/invoices/invoice-form.tsx</files>
  <action>
1. Update the discount/tax row grid container to align children at row start.
2. Add explicit self-alignment on each grid item wrapper so controls do not stretch/misalign.
3. Keep existing field behavior and validation unchanged.
  </action>
  <verify>
1. Inspect invoice form row: Discount Type, Discount Value, Tax Preset, Tax % render with consistent vertical alignment.
2. Run `npm run lint` and `npm run build`.
  </verify>
  <done>
- Invoice row elements are visually aligned.
- No behavior regression in invoice form fields.
- Lint and build pass.
  </done>
</task>

</tasks>

<verification>
- Static checks pass and alignment classes are updated in row layout.
</verification>

<success_criteria>
- Alignment issue is resolved in invoice form.
- Changes remain scoped to quick task.
</success_criteria>

<output>
After completion, create `.planning/quick/6-fix-invoice-form-element-alignment/6-SUMMARY.md`.
</output>
