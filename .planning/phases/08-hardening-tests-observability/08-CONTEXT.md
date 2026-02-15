# Phase 08: Hardening Tests & Observability - Context

**Gathered:** 2026-02-15
**Status:** Ready for execution

<domain>
## Phase Boundary

Close non-blocking hardening debt for `INV-06`, `INV-10`, `PAY-03`, `PDF-04`, plus explicit UTC timezone fallback observability.

This phase is limited to:
- focused automated test coverage for targeted invoice/payment/PDF invariants
- explicit warning behavior for workspace timezone fallback to UTC
- verification evidence quality for closure confidence

This phase does not add new user-facing capabilities or architecture changes.

</domain>

<decisions>
## Implementation Decisions

### Timezone Fallback Observability Contract
- Warning emits on any UTC fallback path.
- Required warning payload:
  - `event: "workspace_timezone_fallback"`
  - `organizationId: string`
  - `reason: "missing" | "invalid" | "workspace_not_found"`
  - `rawTimeZone: string | null`
  - `fallbackTimeZone: "UTC"`
- Warning format is readable text plus structured payload object.
- Required coverage includes:
  - unit-level fallback classification tests
  - targeted path coverage for warning emission and non-emission cases

### Invoice Hardening Contract (`INV-06`, `INV-10`)
- Totals coverage is edge-focused and includes:
  - rounding boundaries for quantity, unit price, and tax calculations
  - percentage/fixed discount behavior
  - discount clamp-to-subtotal behavior
  - tax-after-discount ordering
- Transition guard coverage is full matrix across persisted statuses:
  - `draft`, `sent`, `paid`, `void`
  - includes same-status rejection checks
- Organization-scope hardening must prove:
  - read action path uses active `organizationId`
  - mutation path rejects cross-organization invoice IDs with explicit errors
- Assertions must check both behavior and exact actionable error text for blocked paths.

### Payment + PDF Hardening Contract (`PAY-03`, `PDF-04`)
- Overpayment rejection must be covered for both:
  - payment create path
  - payment update path
- Exact remaining-balance payment is accepted and must settle invoice state correctly.
- PDF pagination coverage must include:
  - threshold-adjacent boundary cases
  - deterministic chunking behavior
  - 50+ line-item stress case
  - visible `Page X of Y` marker rendering behavior

### Closure and Verification Contract
- Phase closure requires all targeted checks to pass.
- Flaky policy requires 2 consecutive passes for affected checks.
- Evidence format requires per-case checklist plus command/test output mapping to:
  - `INV-06`
  - `INV-10`
  - `PAY-03`
  - `PDF-04`
- Authoritative closure record:
  - `.planning/phases/08-hardening-tests-observability/08-VERIFICATION.md`

### Claude's Discretion
- Exact test file layout and grouping as long as requirement mapping is explicit.
- Internal helper extraction to improve testability without behavior changes.
- Verification narrative detail level while preserving evidence traceability.

</decisions>

<specifics>
## Specific Ideas

- Use focused, deterministic unit/action tests instead of broad e2e expansion.
- Keep warning behavior non-fatal and operator-focused.
- Preserve existing domain semantics; hardening validates confidence, not feature changes.

</specifics>

<deferred>
## Deferred Ideas

- External observability stack integration (metrics/log shipping/dashboarding).
- Broader end-to-end automation expansion beyond targeted hardening scope.

</deferred>

---

*Phase: 08-hardening-tests-observability*
*Context gathered: 2026-02-15*
