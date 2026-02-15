# Feature Landscape - v2.0 Rebrand & UX Overhaul

**Domain:** Self-hosted invoicing product redesign (post-v1 shipment)  
**Researched:** 2026-02-15  
**Overall confidence:** MEDIUM-HIGH

## Scope Boundary

v2.0 is a full redesign and market-facing repositioning milestone. It upgrades discovery, brand expression, UX consistency, SEO coverage, and validation quality.

This milestone does not add new invoice/payment capability domains.

## In-Scope Feature Categories

### 1. Discovery and Information Architecture (`DISC-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| Audience-pathway homepage IA | New visitors must immediately self-select path (self-host operator vs buyer evaluator). | Medium |
| Value proposition clarity | Conversion and trust depend on immediate comprehension. | Medium |
| Trust proof architecture | Financial software adoption depends on credibility and risk reduction. | Medium |
| Conversion path mapping | Every key page needs deterministic next actions. | Medium |

### 2. Brand and Design System (`BRAND-*`, `DS-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| Full visual identity refresh | Current v1 visuals are functional but not repositioned for v2 growth goals. | High |
| Unified token system across marketing + app | Prevents divergence and enables scalable redesign execution. | High |
| Component behavior/state standardization | Required for consistency and reduced UI defects. | Medium |
| Semantic status visuals | Critical in finance UI to avoid interpretation errors. | Medium |

### 3. Marketing and Conversion Surfaces (`MKTG-*`, `CONT-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| Conversion-led hero and CTA system | Must guide first-time visitors into actionable paths. | Medium |
| Differentiation narrative vs SaaS alternatives | Repositioning goal requires clear market contrast. | Medium |
| Audience-specific content pathways | Supports multi-path funnel strategy locked in decisions. | Medium |
| Objection-handling FAQ and trust content | Reduces friction for self-host and adoption concerns. | Low-Medium |

### 4. SEO Foundation and Content Production (`SEO-*`, `CONT-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| Crawlable page architecture | Required for discoverability and indexing health. | Medium |
| Metadata and canonical discipline | Prevents duplicate/weak SERP footprint during expansion. | Medium |
| Structured data rollout | Improves machine readability and rich result eligibility. | Medium |
| Core Web Vitals-conscious content templates | Avoids ranking and UX regressions from redesign assets/motion. | Medium |

### 5. Application UX Rework (`UX-*`, `A11Y-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| App shell redesign (sidebar/header/nav consistency) | Prior user issue history shows shell reliability and alignment are sensitive. | High |
| Core workflow visual hierarchy overhaul | Invoice/customer/payment workflows need clearer, faster completion UX. | High |
| Responsive and interaction consistency | Must hold desktop/tablet/mobile quality in one release. | High |
| Accessibility baseline compliance | Required quality gate (WCAG 2.1 AA). | Medium-High |

### 6. Validation, Analytics, and Operability (`QA-*`, `DATA-*`, `OPS-*`)

| Feature | Why It Matters | Complexity |
|---------|----------------|------------|
| Visual regression gates | Redesign without visual baselines is high risk. | Medium |
| Privacy-first funnel event schema | Measures conversion without violating privacy stance. | Medium |
| Docker host-level non-regression evidence | Must preserve self-host deploy confidence. | Medium |
| Launch/rollback runbook quality | Big-bang launch requires deterministic failure handling. | Medium |

## Table Stakes for v2.0 Success

The milestone should be considered incomplete if any item below is missing:

1. Unified rebrand applied across marketing and app shell surfaces.
2. Deterministic conversion pathways with clear CTA hierarchy.
3. SEO technical baseline (metadata, canonical, sitemap quality) on all primary pages.
4. Responsive + accessibility pass on critical flows.
5. Visual regression + smoke checks protecting release quality.
6. Docker deployment and `/health` host checks passing for default and override ports.

## Differentiators to Emphasize in Messaging

1. Open-source and self-host ownership position.
2. Team workflow and role-based collaboration without SaaS lock-in.
3. Clear deployment operability story (`docker compose up` and health visibility).
4. Professional UX and trustworthy financial UI polish despite self-host model.

## Explicitly Deferred from v2.0

| Deferred Capability | Reason |
|---------------------|--------|
| Recurring invoices | New product capability, not redesign evidence closure. |
| Native email delivery/reminders | Requires additional infra and domain expansion. |
| Online payment gateway integrations | High compliance and external dependency scope. |
| Accounting/ledger modules | Distinct product expansion beyond milestone intent. |
| Mobile-native applications | Web redesign + responsive quality are the current boundary. |

---
*Feature research completed: 2026-02-15*
