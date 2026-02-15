# Project Research Summary

**Project:** InvoiceNest  
**Domain:** Self-hosted invoicing product redesign and growth repositioning  
**Milestone:** v2.0 Rebrand & UX Overhaul  
**Researched:** 2026-02-15  
**Confidence:** MEDIUM-HIGH

## Executive Summary

InvoiceNest v1 shipped with complete functional coverage for auth, customer/invoice/payment/PDF workflows, dashboard insights, and Docker deployment. v2.0 should treat that behavior as stable and focus on a decision-complete redesign program: unified rebrand system, intentional information architecture, conversion-ready marketing surfaces, SEO production baseline, and strong release gates.

The recommended approach is phased and dependency-aware. Establish discovery and IA first, then build the design system before touching major surface areas. Marketing conversion flows should be rebuilt before internal app shell and workflow rework, followed by content/SEO hardening and a dedicated quality/launch gate phase. This ordering minimizes rework and controls big-bang launch risk.

Primary risks are not technical unknowns in the billing domain; they are execution risks in consistency, accessibility, and release quality. The strongest mitigations are a single token source of truth, deterministic requirement traceability, visual regression baselines, and mandatory host-level deployment checks.

## Key Findings

### Recommended Stack

The existing runtime stack is already suitable for v2.0. Keep Next.js App Router, PostgreSQL, Drizzle, better-auth, and Docker Compose. Add structured design-system governance, SEO metadata discipline, visual regression testing, and privacy-first analytics instrumentation.

**Core technologies and practices for v2.0:**
- **Semantic token layer** over Tailwind/shadcn primitives for full rebrand consistency.
- **Component state standardization** to reduce UX drift across new surfaces.
- **Playwright visual regression checks** for marketing + app critical routes.
- **SEO contracts** for metadata/canonical/structured data ownership.
- **Minimal first-party analytics events** with opt-out/disable-safe behavior.

### Expected Features

**Must have (table stakes for milestone success):**
- Clear multi-path discovery IA and conversion journey.
- Unified rebrand across marketing and authenticated app shell.
- SEO production baseline with crawl/index integrity.
- Responsive and accessibility baseline on critical user flows.
- Docker host-level non-regression evidence on default and override ports.

**Should have (high leverage within milestone):**
- Objection-handling content and trust narratives.
- Strong differentiator messaging versus SaaS lock-in alternatives.
- Deterministic launch/rollback runbook quality.

**Defer (post-v2.0):**
- New billing capabilities (recurring invoices, payment gateways).
- Email delivery infrastructure and broader product-surface expansion.

### Architecture Approach

Use a dual-surface architecture (marketing + authenticated app) backed by one shared design system and one quality-gate framework. Keep domain behavior unchanged, migrate UX in phase order, and enforce release readiness with visual/accessibility/deployment evidence gates.

**Major components:**
1. Experience layers: marketing routes + app routes with shared tokens.
2. Design system core: semantic tokens + standardized component states.
3. Content/SEO system: page model, metadata ownership, canonical policy.
4. Verification layer: visual regression, accessibility checks, analytics schema, deployment validation.

### Critical Pitfalls

1. **Visual fragmentation** between marketing and app surfaces.  
   Mitigation: single token system and shared component APIs.
2. **Navigation regressions** during shell rewrite.  
   Mitigation: first-load/sidebar/state smoke checks.
3. **Accessibility regressions masked by polish.**  
   Mitigation: WCAG checks and keyboard-flow gate.
4. **SEO indexation/canonical regressions** during IA changes.  
   Mitigation: pre-defined metadata/canonical contracts.
5. **Big-bang launch risk without strict validation.**  
   Mitigation: two-pass flaky-check policy + host-level deployment evidence.

## Implications for Roadmap

Suggested phase structure and rationale:

### Phase 9: Discovery & IA Blueprint
**Rationale:** Prevent downstream rework by locking audience pathways and success criteria first.  
**Delivers:** IA map, pathway decisions, acceptance checklist.  
**Addresses:** `DISC-*`.  
**Avoids:** scope ambiguity and SEO structure drift.

### Phase 10: Rebrand System (Visual + Tokens + Typography)
**Rationale:** Shared system must exist before broad page rewrites.  
**Delivers:** token contract and component state consistency.  
**Addresses:** `BRAND-*`, `DS-*`.  
**Avoids:** design fragmentation.

### Phase 11: Marketing Site + Conversion Path
**Rationale:** Conversion-facing surfaces need early stabilization for positioning and growth.  
**Delivers:** primary funnel pages, CTA hierarchy, core metadata foundation.  
**Addresses:** `MKTG-*`, `CONT-01..02`, `SEO-01..02`.  
**Avoids:** content without buyer intent.

### Phase 12: App Shell Redesign
**Rationale:** Global app navigation and dashboard hierarchy should be stabilized before deep workflow screens.  
**Delivers:** redesigned shell/nav/responsive behavior.  
**Addresses:** `UX-01`, `UX-02`, `UX-06`, `A11Y-01`.  
**Avoids:** route-state regressions.

### Phase 13: Core Workflow UX Rework
**Rationale:** Workflow screens depend on shell patterns and design-system controls.  
**Delivers:** redesigned customer/invoice/payment interaction surfaces.  
**Addresses:** `UX-03..05`, `A11Y-03`.  
**Avoids:** inconsistent form/task completion behavior.

### Phase 14: Content + SEO Production Hardening
**Rationale:** After page structures stabilize, finalize content depth and technical SEO quality.  
**Delivers:** production content set, structured data, canonical integrity, CWV checks.  
**Addresses:** `CONT-03..04`, `SEO-03..05`.  
**Avoids:** launch with thin/duplicated or under-optimized content.

### Phase 15: QA, A11Y, Analytics, and Launch Gate
**Rationale:** Big-bang release needs explicit evidence gates and host-level verification.  
**Delivers:** visual regression, accessibility verification, analytics schema proof, Docker host checks, rollback readiness.  
**Addresses:** `QA-*`, `A11Y-02`, `A11Y-04`, `DATA-*`, `OPS-*`.  
**Avoids:** unstable launch and unverifiable closure.

### Phase Ordering Rationale

- Order follows dependency chain: IA -> design system -> marketing -> shell -> workflows -> hardening -> launch.
- Keeps domain logic stable while replacing presentation and interaction layers.
- Front-loads decisions that reduce expensive late-phase rework.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 10:** typography/color accessibility balancing under full rebrand.
- **Phase 11:** messaging differentiation and conversion CTA experiments.
- **Phase 14:** structured data coverage and canonical strategy verification.

Phases with standard patterns (lower research burden):
- **Phase 12:** shell responsive behavior patterns are established internally.
- **Phase 15:** QA and deployment checks follow existing v1/v6 verification patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack already proven in shipped v1; v2.0 additions are incremental hardening tooling. |
| Features | MEDIUM-HIGH | Scope is broad but decision-complete and bounded away from new domain capabilities. |
| Architecture | MEDIUM-HIGH | Dependency order is clear; risk mainly in execution discipline. |
| Pitfalls | HIGH | Primary failure modes are well understood and have concrete mitigations. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address During Execution

- Need final brand token values and typography pair approval in early phase deliverables.
- Need explicit route inventory for marketing pages before metadata rollout.
- Need baseline screenshot strategy finalized for visual regression coverage.

## Sources

### Primary (HIGH confidence)
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/research/STACK.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/research/FEATURES.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/research/ARCHITECTURE.md`
- `/Users/mkamran/Repositores/side-projects/invoice-nest-v5/.planning/research/PITFALLS.md`

### Secondary (MEDIUM confidence)
- `/Users/mkamran/.agents/skills/ui-ux-pro-max/SKILL.md`
- `/Users/mkamran/.agents/skills/frontend-design/SKILL.md`
- `/Users/mkamran/.agents/skills/content-strategy/SKILL.md`
- `/Users/mkamran/.agents/skills/copywriting/SKILL.md`
- `/Users/mkamran/.agents/skills/seo-audit/SKILL.md`

### Tertiary (LOW confidence)
- `/Users/mkamran/.agents/skills/marketing-psychology/SKILL.md` (framework guidance, requires contextual judgment)

---
*Research completed: 2026-02-15*  
*Ready for roadmap: yes*
