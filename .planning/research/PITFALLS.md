# Pitfalls Research - v2.0 Rebrand & UX Overhaul

**Project:** InvoiceNest  
**Milestone:** v2.0 Rebrand & UX Overhaul  
**Researched:** 2026-02-15

## Critical Risks When Adding a Full Redesign to a Shipped Product

## 1. Visual Fragmentation Across Marketing and App

**Risk:** Rebrand is partially applied, creating mismatched typography/color/component behavior between public pages and authenticated surfaces.

**Impact:** Reduced trust and perceived quality; support burden due to inconsistent UX.

**Prevention:**
- Require one token source of truth before page-by-page rewrites.
- Block merge of one-off style overrides that bypass shared primitives.
- Add visual regression snapshots across both route groups.

## 2. Navigation Regression in App Shell

**Risk:** Sidebar/header/nav changes break route awareness or initial-load state (already seen in prior quick-fix history).

**Impact:** Users cannot discover key workflows without refresh/retry.

**Prevention:**
- Add route-state smoke tests for first-load, auth redirect, and workspace creation transitions.
- Validate sidebar visibility and active-state rendering on first navigation.
- Keep shell state deterministic from server-provided workspace context.

## 3. Accessibility Debt Hidden by Visual Polish

**Risk:** New brand styling lowers contrast, removes visible focus states, or introduces motion discomfort.

**Impact:** Fails WCAG 2.1 AA gate; blocks release quality target.

**Prevention:**
- Enforce contrast and focus checks in component-level review.
- Treat keyboard-only flow as a release blocker, not a post-launch item.
- Add reduced-motion behavior verification to acceptance list.

## 4. SEO Regressions During IA Restructure

**Risk:** New page architecture causes duplicate URLs, weak metadata ownership, orphan pages, or canonical conflicts.

**Impact:** Indexation loss and discovery regression during launch.

**Prevention:**
- Define canonical and metadata contract per page type before implementation.
- Keep internal link graph explicit in IA doc.
- Validate sitemap and crawl path before milestone closure.

## 5. Content Volume Without Intent Fit

**Risk:** Producing many pages that do not match buyer intent stages or objection points.

**Impact:** Low conversion and low search value despite high content effort.

**Prevention:**
- Map every page to a target audience stage and primary CTA.
- Apply copy rules: clarity over cleverness, specific outcomes, explicit objections.
- Keep per-page "single primary action" contract.

## 6. Over-Animation and Performance Drift

**Risk:** Aggressive motion/visual effects degrade LCP/INP/CLS and readability.

**Impact:** Poor UX and search performance.

**Prevention:**
- Use CSS-first motion and animate transform/opacity only.
- Reserve space for async content/media to reduce layout shift.
- Measure Core Web Vitals before sign-off.

## 7. Analytics Overreach vs Privacy Commitments

**Risk:** Event instrumentation expands beyond minimal funnel telemetry.

**Impact:** Violates milestone privacy-first decision and increases compliance risk.

**Prevention:**
- Freeze a minimal event schema and reject unapproved event additions.
- Support disabled analytics mode.
- Document each event with purpose and retention rationale.

## 8. Big-Bang Launch Without Deterministic Gates

**Risk:** Redesign ships without robust validation, making rollback and triage chaotic.

**Impact:** Production instability and trust loss.

**Prevention:**
- Require 2 consecutive passes for flaky checks.
- Run host-level Docker validation on default and override ports.
- Keep rollback runbook explicit and tested.

## 9. Scope Creep into New Product Capabilities

**Risk:** Team mixes redesign scope with new billing features (recurring, payment gateways).

**Impact:** Timeline blow-up and diluted milestone outcome.

**Prevention:**
- Keep out-of-scope list visible in requirements and roadmap.
- Route capability expansion to post-v2 milestone backlog.

## 10. Non-Traceable Requirement Coverage

**Risk:** Large milestone proceeds without strict requirement-to-phase mapping.

**Impact:** Blind spots at closure and audit friction.

**Prevention:**
- Maintain one-to-one requirement mapping in `REQUIREMENTS.md` traceability table.
- Validate coverage before roadmap approval and before milestone completion.

## Phase Ownership Recommendations

| Risk Cluster | Phase to Address First |
|-------------|------------------------|
| IA/SEO structure risks | Phase 9 |
| Design drift risks | Phase 10 |
| Conversion/content mismatch | Phase 11 + 14 |
| App-shell regressions | Phase 12 |
| Workflow UX regressions | Phase 13 |
| Quality/launch risks | Phase 15 |

---
*Pitfall research completed: 2026-02-15*
