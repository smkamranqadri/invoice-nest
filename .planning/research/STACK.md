# Technology Stack - v2.0 Rebrand & UX Overhaul

**Project:** InvoiceNest  
**Milestone:** v2.0 Rebrand & UX Overhaul  
**Researched:** 2026-02-15  
**Overall Confidence:** MEDIUM-HIGH

## Milestone Scope Reminder

This research is for a shipped product (`v1`) entering a major redesign milestone. The goal is UX, brand, marketing, SEO, and operability hardening without introducing new invoice/payment domain features.

## Baseline (Already in Production)

| Layer | Current Stack | Keep/Change | Notes |
|------|----------------|-------------|-------|
| App framework | Next.js 15 App Router | Keep | Existing deployment and route model remain valid for redesign work. |
| Data | PostgreSQL + Drizzle ORM | Keep | No schema migration required for core invoice domain in this milestone. |
| Auth | better-auth session model | Keep | Rebrand does not change auth architecture. |
| UI base | Tailwind + shadcn/ui + Radix | Keep and extend | Build v2.0 design system on top of existing primitives. |
| Deployment | Docker Compose + health checks | Keep | Preserve self-hostable contract and verify no regression. |

## Recommended Additions for v2.0

| Area | Tooling / Approach | Why | Confidence |
|------|---------------------|-----|------------|
| Design tokens | CSS variables + Tailwind token mapping (`:root` semantic tokens) | Allows full rebrand across marketing and app surfaces with one source of truth. | HIGH |
| Component standardization | Harden shared component API in `src/components/ui` and app-specific wrappers | Prevents visual drift during large UI rewrite. | HIGH |
| Motion | CSS-first motion + selective JS animation for high-impact sections | Meets brand goals while controlling performance and reduced-motion compliance. | MEDIUM-HIGH |
| Visual regression | Playwright screenshot baselines for critical pages/components | Required to protect redesign quality and prevent silent regressions. | HIGH |
| Accessibility checks | axe + keyboard-flow validation in CI/manual checklist | Required for WCAG 2.1 AA baseline. | HIGH |
| SEO metadata discipline | Route-level metadata ownership and canonical policy | Prevents duplicate/weak SERP pages during content expansion. | HIGH |
| Structured data | JSON-LD for Product/SoftwareApplication/FAQ surfaces | Improves machine readability and search result quality. | MEDIUM-HIGH |
| Privacy-first analytics | First-party event schema with minimal funnel events and opt-out support | Gives conversion insight without surveillance-style tracking. | MEDIUM-HIGH |
| Content ops | Topic-cluster content model with reusable page templates | Enables consistent launch-ready marketing content production. | MEDIUM |

## Stack Rules from Installed Skill Guidance

### UI/UX (`ui-ux-pro-max`, `frontend-design`)
- Enforce WCAG-level contrast and visible keyboard focus states.
- Maintain minimum 44x44 interaction targets for touch/mobile controls.
- Use explicit responsive behavior for desktop/tablet/mobile and avoid layout shift.
- Choose a deliberate visual direction (trust baseline with bold accents) and avoid generic component styling.

### Implementation (`implement-design`)
- Treat design definitions as source of truth and translate into project token/component conventions.
- Reuse shared components before creating one-off variants.
- Validate design parity with screenshot/checklist before acceptance.

### Content/Marketing (`content-strategy`, `copywriting`, `marketing-psychology`)
- Keep messaging clear, specific, and benefit-driven.
- Structure content by funnel stage (awareness, consideration, decision).
- Use ethical persuasion: social proof, objection handling, and risk reduction without manipulative patterns.

### SEO/Framework (`seo-audit`, `next-best-practices`)
- Keep crawlability/indexation healthy (canonical, sitemap, metadata ownership).
- Preserve Next.js App Router best practices for metadata, error boundaries, and performance-sensitive rendering.
- Protect Core Web Vitals as content and motion complexity increase.

## What Not to Add in v2.0

| Do Not Add | Reason |
|-----------|--------|
| New billing capabilities (recurring invoices, gateways, accounting modules) | Out of milestone scope; v2.0 is redesign/repositioning, not domain expansion. |
| Heavy third-party tracking suites by default | Conflicts with privacy-first analytics decision. |
| Parallel design systems | Increases drift risk; single token/component system is required. |
| Deployment model changes requiring orchestrators | Milestone remains Docker Compose self-host first. |

## Validation Commands for Phase Work

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Docker non-regression checks:

```bash
docker compose up --build
docker compose ps
curl -i http://localhost:3000/health
```

Port override coverage:

```bash
APP_PORT=3001 docker compose up --build
curl -i http://localhost:3001/health
```

---
*Stack research completed: 2026-02-15*
