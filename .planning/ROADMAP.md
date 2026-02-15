# Roadmap: InvoiceNest

## Overview

InvoiceNest v1 is shipped and archived. v2.0 is an active major milestone focused on full redesign, rebrand, conversion and SEO hardening, and launch-quality evidence gates, while preserving v1 domain behavior.

## Milestones

- ✅ **v1 MVP** -- shipped 2026-02-15. Archive: `.planning/milestones/v1-ROADMAP.md`
- 🚧 **v2.0 Rebrand & UX Overhaul** -- initialized 2026-02-15 (active)

## Phases

<details>
<summary>✅ v1 MVP (Phases 1-8) -- SHIPPED 2026-02-15</summary>

- [x] Phase 1: Auth, Workspaces & UI Foundation
- [x] Phase 2: Customer Management
- [x] Phase 3: Invoice Creation
- [x] Phase 4: Payments & PDF Generation
- [x] Phase 5: Dashboard, Settings & Polish
- [x] Phase 6: Docker Deployment
- [x] Phase 7: Verification Evidence Closure
- [x] Phase 8: Hardening Tests & Observability

</details>

### 🚧 v2.0 Rebrand & UX Overhaul (Phases 9-15)

- [ ] **Phase 9: Discovery & IA Blueprint** - Lock audience pathways, conversion architecture, and acceptance checklist for redesign execution
- [ ] **Phase 10: Rebrand System (Visual + Tokens + Typography)** - Build the shared brand and component system used by both marketing and app surfaces
- [ ] **Phase 11: Marketing Site + Conversion Path** - Deliver conversion-focused public pages and primary SEO metadata foundation
- [ ] **Phase 12: App Shell Redesign** - Rework authenticated shell/navigation/dashboard framing with responsive consistency
- [ ] **Phase 13: Core Workflow UX Rework** - Redesign customer, invoice, and payment workflow interfaces while preserving business semantics
- [ ] **Phase 14: Content + SEO Production Hardening** - Finalize content depth, canonical/structured data coverage, and performance-safe page quality
- [ ] **Phase 15: QA, A11Y, Analytics, and Launch Gate** - Close visual/accessibility/deployment evidence and launch readiness for big-bang release

## Phase Details

### Phase 9: Discovery & IA Blueprint
**Goal:** Lock decision-complete discovery structure and user pathways before visual implementation.
**Depends on:** Phase 8 complete (baseline)
**Requirements:** DISC-01, DISC-02, DISC-03, DISC-04
**Success Criteria** (what must be TRUE):
1. Primary audience paths and page map are documented and approved.
2. Each key entry page has a defined primary CTA and secondary path.
3. Trust and objection topics are mapped to specific surfaces.
4. No unresolved IA ambiguity remains for Phase 10+ implementation.
**Plans:** TBD (`/gsd:plan-phase 9`)

### Phase 10: Rebrand System (Visual + Tokens + Typography)
**Goal:** Establish the shared design system and brand contract that all redesigned surfaces consume.
**Depends on:** Phase 9
**Requirements:** BRAND-01, BRAND-02, BRAND-03, DS-01, DS-02, DS-03, DS-04
**Success Criteria** (what must be TRUE):
1. Semantic token system is defined and applied to shared components.
2. Typography scale and action hierarchy are consistent across key templates.
3. Empty/loading/error/status patterns are standardized and reusable.
4. Marketing and app shell consume the same token/component primitives.
**Plans:** TBD (`/gsd:plan-phase 10`)

### Phase 11: Marketing Site + Conversion Path
**Goal:** Deliver public-facing conversion surfaces with clear positioning and search-ready metadata baseline.
**Depends on:** Phase 10
**Requirements:** MKTG-01, MKTG-02, MKTG-03, MKTG-04, CONT-01, CONT-02, SEO-01, SEO-02
**Success Criteria** (what must be TRUE):
1. Core marketing pages ship with clear positioning and CTA hierarchy.
2. Audience-specific messaging paths are present and internally linked.
3. Priority pages have unique title/description metadata and crawlable IA placement.
4. Pricing/licensing and objection-handling content are accessible before signup/deploy decisions.
**Plans:** TBD (`/gsd:plan-phase 11`)

### Phase 12: App Shell Redesign
**Goal:** Rebuild authenticated shell experience for consistent navigation, hierarchy, and first-load reliability.
**Depends on:** Phase 11
**Requirements:** UX-01, UX-02, UX-06, A11Y-01
**Success Criteria** (what must be TRUE):
1. Sidebar/header/navigation render correctly on first entry without refresh dependency.
2. Desktop/tablet/mobile shell behavior is consistent and route-aware.
3. Dashboard hierarchy improves scanability of key metrics and recent activity.
4. Keyboard-only navigation works for global shell actions.
**Plans:** TBD (`/gsd:plan-phase 12`)

### Phase 13: Core Workflow UX Rework
**Goal:** Redesign high-frequency customer/invoice/payment workflows for clarity and efficiency.
**Depends on:** Phase 12
**Requirements:** UX-03, UX-04, UX-05, A11Y-03
**Success Criteria** (what must be TRUE):
1. Invoice creation flow has aligned controls and predictable totals review area.
2. Payment recording and PDF actions are clear and safely prioritized.
3. Customer create/edit forms follow unified layout and validation behavior.
4. Forms expose accessible labels and actionable errors for assistive technologies.
**Plans:** TBD (`/gsd:plan-phase 13`)

### Phase 14: Content + SEO Production Hardening
**Goal:** Finalize launch-ready content set and close technical SEO quality gaps.
**Depends on:** Phase 13
**Requirements:** CONT-03, CONT-04, SEO-03, SEO-04, SEO-05
**Success Criteria** (what must be TRUE):
1. Deployment quickstart and stage-specific supporting content are published and linked.
2. Canonical URL policy and structured data contracts are implemented on eligible pages.
3. Key routes meet performance and layout-stability thresholds.
4. Internal link structure supports both discovery depth and conversion progression.
**Plans:** TBD (`/gsd:plan-phase 14`)

### Phase 15: QA, A11Y, Analytics, and Launch Gate
**Goal:** Close redesign with deterministic evidence for quality, observability, and host-level deployment confidence.
**Depends on:** Phase 14
**Requirements:** QA-01, QA-02, QA-03, QA-04, A11Y-02, A11Y-04, DATA-01, DATA-02, DATA-03, DATA-04, OPS-01, OPS-02, OPS-03, OPS-04
**Success Criteria** (what must be TRUE):
1. Visual regression, responsive checks, smoke checks, and accessibility checks pass with documented evidence.
2. Minimal analytics event schema is validated, documented, and disable-safe.
3. Docker deployment checks pass on default and override host port with `/health` verification.
4. Big-bang launch runbook and rollback/recovery procedure are validated.
5. Flaky checks satisfy two consecutive passes before milestone closure.
**Plans:** TBD (`/gsd:plan-phase 15`)

## Progress

**Execution Order:**
Phases execute in numeric order: 9 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 9. Discovery & IA Blueprint | 0/TBD | ○ Not started | - |
| 10. Rebrand System | 0/TBD | ○ Not started | - |
| 11. Marketing Site + Conversion Path | 0/TBD | ○ Not started | - |
| 12. App Shell Redesign | 0/TBD | ○ Not started | - |
| 13. Core Workflow UX Rework | 0/TBD | ○ Not started | - |
| 14. Content + SEO Production Hardening | 0/TBD | ○ Not started | - |
| 15. QA, A11Y, Analytics, and Launch Gate | 0/TBD | ○ Not started | - |

## Coverage Check

- v2.0 requirements mapped: 46/46
- Unmapped requirements: 0
- Next planning command: `/gsd:discuss-phase 9`
