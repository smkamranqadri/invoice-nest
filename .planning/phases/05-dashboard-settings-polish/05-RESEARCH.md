# Phase 5: Dashboard, Settings & Polish - Research

**Researched:** 2026-02-13
**Domain:** Workspace financial dashboard aggregation, workspace-level billing/profile settings, invoice productivity workflows (clone + CSV export)
**Confidence:** MEDIUM-HIGH

## User Constraints

No `/gsd:discuss-phase 5` context file exists yet (`05-CONTEXT.md` not found), so constraints come from existing roadmap and state decisions.

### Locked constraints from prior phases
- Persisted invoice statuses remain `draft`, `sent`, `paid`, `void`; `overdue` is a derived display status.
- Financial totals are server-canonical integer cents (`subtotal -> discount -> tax -> total`) and must not drift client-side.
- Invoices with payment history keep financial fields locked.
- Members can operate invoice workflows (record payments, download PDFs); payment correction remains owner-only.
- Company branding already flows into PDF generation using workspace organization profile + metadata.
- Phase boundary is fixed to `DASH-*` and `SET-*` requirements only.

### Claude's discretion areas (because no phase context file)
- Dashboard period selector UX (default period + available period options)
- Tax preset UX shape (inline list editor vs structured rows)
- CSV payload shape (single combined export vs separate sections/files)

### Deferred ideas
None recorded.

## Summary

Phase 5 should reuse existing project architecture instead of introducing new infrastructure: server components for data loading, server actions for mutations, and Drizzle query modules for domain-specific reads. The codebase already has clean query/action boundaries (`src/lib/queries/*`, `src/lib/actions/*`) and role guards (`requireOwnerRole`), so this phase can be implemented as additive slices with minimal churn.

For workspace settings, the lowest-risk path is extending typed access to organization metadata rather than introducing new database tables. The existing organization model already stores `name`, `slug`, `logo`, and metadata (address/phone/timezone patterns already used). Adding a typed metadata boundary for currency and tax presets keeps migration overhead low while preserving strict validation.

For dashboard and export capabilities, the key technical focus is data correctness: timezone-aware period boundaries, outstanding/overdue semantics aligned with existing invoice status derivation, and CSV serialization that is consistent and safe. The best implementation path is a dedicated dashboard query module plus an export route that reuses invoice/payment query projections.

**Primary recommendation:** Implement Phase 5 as three plans: (1) settings metadata + owner UI, (2) dashboard aggregation + presentation, (3) clone/export workflows integrated into invoice surfaces.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.12` | App Router pages, server components, route handlers | Already powers all pages and data boundaries |
| `drizzle-orm` | `0.45.1` | SQL-safe query construction and transactions | Existing invoice/customer/payment domain already implemented with Drizzle |
| `better-auth` | `1.4.18` | Workspace org/member identity + roles | Existing owner/member enforcement and active org model |
| `zod` | `4.3.6` | Input and metadata validation | Existing action/form validation baseline |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hook-form` + `@hookform/resolvers` | `7.71.1` / `5.2.2` | Settings and invoice form state + validation | Owner settings forms and preset editors |
| `sonner` | `2.0.7` | Action feedback toasts | Clone/export/settings feedback |
| Existing UI primitives (`shadcn` + Radix wrappers) | current repo set | Consistent cards, tables, forms, dialogs | Dashboard and settings polish without new UI stack |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Organization metadata extension | New dedicated `workspace_settings` + `tax_preset` tables | More normalized but adds schema/migration complexity for v1 |
| Route-based CSV generation | Background export jobs + persisted files | Better for very large datasets, unnecessary for current v1 scope |
| Reusing invoice action layer for clone | Ad-hoc client-side clone composition | Faster initial coding but risks bypassing domain invariants |

**Installation:**
```bash
# No new dependencies required for planned Phase 5 implementation.
```

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/(dashboard)/dashboard/            # dashboard page + client controls
├── app/(dashboard)/invoices/export/      # CSV route handler
├── components/dashboard/                 # metric cards + recent invoice section
├── components/workspace/                 # settings form updates
├── lib/queries/dashboard.ts              # aggregation queries for DASH-*
├── lib/workspace/settings.ts             # typed metadata parse/serialize helpers
└── lib/actions/invoice.ts                # clone action + existing invoice mutations
```

### Pattern 1: Typed workspace metadata boundary
**What:** Parse and serialize organization metadata through one typed helper module.
**When to use:** Any setting read/write for address, logo URL, currency, tax presets, timezone.
**Example:** Existing timezone parsing pattern already centralizes metadata parsing (`extractTimeZone`).

### Pattern 2: Aggregation query module per feature surface
**What:** Keep dashboard-specific SQL/projections inside `lib/queries/dashboard.ts`.
**When to use:** Metrics that combine invoices + payments + display status semantics.
**Example:** Existing `getInvoices` uses composable conditions and derived display status.

### Pattern 3: Server-driven CSV export route
**What:** Route handler produces CSV bytes from server-fetched data in active workspace scope.
**When to use:** Exporting invoice/payment data with filters/date constraints.
**Example:** Existing PDF route demonstrates server-side document generation + scoped reads.

### Anti-Patterns to Avoid
- Parsing/writing organization metadata ad hoc in each page/action.
- Re-implementing payment/invoice status rules in dashboard/export logic.
- Computing financial totals in client-only clone flows.
- Emitting CSV with naive string joins (no quote escaping/newline handling).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Invoice total and status math | New clone/export-only calculators | Existing domain helpers (`invoice-totals`, `invoice-payments`, `invoice-status`) | Preserves correctness and avoids drift |
| Role/permission checks | Page-local ad hoc role logic | Existing `requireOwnerRole` + `getRequiredOrganization` patterns | Consistent authorization behavior |
| Workspace metadata parsing | Inline JSON parsing in pages | Central typed parse/serialize helpers | Avoids schema drift and runtime null checks everywhere |
| CSV serialization | Manual `array.join(',')` with raw strings | Dedicated CSV escaping utility in export route/module | Prevents malformed CSV and spreadsheet formula injection issues |

**Key insight:** Reusing domain/query/action boundaries already established in phases 1-4 lowers regression risk more than introducing new architecture.

## Common Pitfalls

### Pitfall 1: Revenue period boundaries drift by timezone
**What goes wrong:** Revenue totals differ between dashboard and exported data around midnight.
**Why it happens:** Date filtering done in UTC while app logic is org-timezone aware.
**How to avoid:** Derive period start/end from organization timezone and reuse across dashboard + export queries.
**Warning signs:** Daily/monthly totals change when browser timezone changes.

### Pitfall 2: Outstanding/overdue semantics mismatch
**What goes wrong:** Dashboard overdue count disagrees with invoice list badges.
**Why it happens:** Dashboard filters on persisted status only, ignoring derived overdue logic.
**How to avoid:** Apply the same overdue derivation semantics used by invoice query/display code.
**Warning signs:** Invoices marked overdue in list not counted on dashboard.

### Pitfall 3: Metadata shape fragmentation
**What goes wrong:** Settings write one shape, PDF/dashboard read another shape.
**Why it happens:** Multiple untyped metadata readers/writers.
**How to avoid:** One canonical metadata schema + helpers.
**Warning signs:** Newly saved settings disappear or partially apply.

### Pitfall 4: CSV quality and safety defects
**What goes wrong:** Rows break on commas/newlines or spreadsheet executes formulas.
**Why it happens:** Missing quote-escaping and formula-prefix safeguards.
**How to avoid:** Escape CSV fields and prefix formula-looking cells with `'`.
**Warning signs:** Opened CSV columns shift unpredictably or formulas execute.

## Code Examples

Verified in-repo patterns to extend:

### Scoped conditions pattern for filterable queries
```typescript
const conditions: SQL[] = [eq(invoice.organizationId, organizationId)];
if (options.status === "overdue") {
  conditions.push(eq(invoice.status, "sent"), lt(invoice.dueDate, todayIso));
}
```
Source: `src/lib/queries/invoice.ts`

### Server action + path revalidation pattern
```typescript
revalidatePath("/invoices");
revalidatePath(`/invoices/${invoiceId}`);
revalidatePath("/customers");
```
Source: `src/lib/actions/invoice.ts`, `src/lib/actions/payment.ts`

### Organization metadata extraction pattern
```typescript
const timeZone = extractTimeZone((organization as { metadata?: unknown }).metadata);
return timeZone ?? "UTC";
```
Source: `src/lib/queries/workspace.ts`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic page-level logic | Query/action/domain separation | Phase 2-4 | Better maintainability and safer financial invariants |
| Placeholder dashboard/customer financials | Real invoice/payment-backed derived values | Phase 3-4 | Ready foundation for DASH-* rollout |
| Single-purpose workspace settings (name/slug/address/phone) | Extensible org profile settings surface | Phase 5 target | Enables currency/tax/branding controls for downstream flows |

**Deprecated/outdated for this codebase context:**
- Placeholder dashboard cards and static workspace info should be replaced with live metrics and recent invoices.

## Open Questions

1. **Dashboard period control granularity**
   - What we know: Requirement mandates current period revenue.
   - What's unclear: Month-only default vs selectable period (month/quarter/custom).
   - Recommendation: Default to current month with optional selector (`month`, `quarter`, `year`) and keep URL-driven state.

2. **Tax preset UX depth**
   - What we know: Reusable presets are required.
   - What's unclear: Flat list (name + rate) vs richer metadata (default flag, ordering).
   - Recommendation: Start with flat editable list (`name`, `rate`), single default preset optional.

3. **CSV export surface**
   - What we know: Export invoice + payment data is required.
   - What's unclear: Single merged CSV vs separate datasets.
   - Recommendation: Start with separate endpoint variants (`invoices`, `payments`, `combined`) behind one export UI.

## Sources

### Primary (HIGH confidence)
- `package.json` - stack versions and available dependencies
- `src/lib/actions/invoice.ts` - invoice domain mutation patterns
- `src/lib/actions/payment.ts` - payment mutation + audit patterns
- `src/lib/queries/invoice.ts` - invoice read models and overdue derivation usage
- `src/lib/queries/workspace.ts` - workspace metadata parsing conventions
- `src/app/(dashboard)/invoices/[id]/pdf/route.ts` - server document generation + branding extraction
- `.planning/STATE.md` - locked prior-phase decisions and constraints
- `.planning/ROADMAP.md` - Phase 5 goal, requirement mapping, and success criteria

### Secondary (MEDIUM confidence)
- `.planning/phases/01-auth-workspaces-ui-foundation/01-04-SUMMARY.md` - settings and role-guard patterns
- `.planning/phases/02-customer-management/02-02-SUMMARY.md` - URL-state + list filtering UX pattern
- `.planning/phases/02-customer-management/02-03-SUMMARY.md` - detail page composition pattern

### Tertiary (LOW confidence)
- None (no unverified external sources used).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - directly derived from repository dependencies
- Architecture patterns: MEDIUM-HIGH - based on implemented repo patterns across phases
- Pitfalls: MEDIUM - based on domain constraints and known failure modes, to validate during implementation

**Research date:** 2026-02-13
**Valid until:** 2026-03-15
