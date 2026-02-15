# Requirements: InvoiceNest

**Defined:** 2026-02-15  
**Milestone:** v2.0 Rebrand & UX Overhaul  
**Core Value:** Teams can create invoices, send them to customers, and know exactly who owes what -- without spreadsheets or expensive SaaS tools.

## v2.0 Requirements

Requirements for milestone v2.0. Each maps to exactly one roadmap phase (Phase 9-15).

### Discovery and Information Architecture

- [ ] **DISC-01**: User can identify two primary paths (self-host operator path and product evaluator path) from the homepage without ambiguous navigation.
- [ ] **DISC-02**: User can understand what InvoiceNest does and who it is for from hero messaging before interacting with secondary sections.
- [ ] **DISC-03**: User can find trust signals (deployment transparency, product maturity, security posture) in the initial discovery journey.
- [ ] **DISC-04**: User can reach a phase-appropriate next action from every primary landing page without dead-end routes.

### Brand Identity

- [ ] **BRAND-01**: User can recognize one cohesive brand identity across marketing pages and authenticated app shell surfaces.
- [ ] **BRAND-02**: User can read content using a standardized typography scale with consistent heading/body hierarchy.
- [ ] **BRAND-03**: User can distinguish primary, secondary, and destructive actions through consistent visual treatment.

### Marketing and Positioning

- [ ] **MKTG-01**: User can compare InvoiceNest's self-hosted value against SaaS alternatives through explicit positioning content.
- [ ] **MKTG-02**: User can act on a clear CTA hierarchy (one primary, one secondary) on each core conversion page.
- [ ] **MKTG-03**: User can access licensing/pricing expectations before committing to signup or deployment.
- [ ] **MKTG-04**: User can find objection-handling content addressing setup effort, data ownership, and security concerns.

### SEO and Discoverability

- [ ] **SEO-01**: User can access crawlable marketing routes that are linked via primary navigation and sitemap.
- [ ] **SEO-02**: User can see unique, intent-aligned titles and meta descriptions on each priority page.
- [ ] **SEO-03**: User can access canonical URLs for primary pages without duplicate indexable variants.
- [ ] **SEO-04**: User can access eligible pages that publish structured data (`SoftwareApplication`, `FAQPage`) where relevant.
- [ ] **SEO-05**: User can load key pages within agreed performance budgets without major layout shift.

### Content System

- [ ] **CONT-01**: User can consume audience-specific messaging for freelancer, small-team, and self-host operator personas.
- [ ] **CONT-02**: User can access conversion pages that follow consistent narrative structure (problem -> solution -> proof -> CTA).
- [ ] **CONT-03**: User can access deployment quickstart content from marketing conversion paths.
- [ ] **CONT-04**: User can access at least one decision-stage comparison page and one implementation-stage guide.

### Application UX Rework

- [ ] **UX-01**: User can navigate the app shell immediately after sign-in without missing sidebar/header state.
- [ ] **UX-02**: User can use consistent navigation patterns across desktop, tablet, and mobile breakpoints.
- [ ] **UX-03**: User can complete invoice creation with aligned form controls and predictable totals summary placement.
- [ ] **UX-04**: User can record a payment and download a PDF from invoice detail using clear action hierarchy.
- [ ] **UX-05**: User can create and edit customers through a unified form layout with consistent validation feedback.
- [ ] **UX-06**: User can interpret dashboard metrics and recent activity from a clear visual hierarchy.

### Design System Consistency

- [ ] **DS-01**: User can experience consistent spacing, radius, elevation, and semantic colors across redesigned components.
- [ ] **DS-02**: User can see standardized interaction states (default, hover, focus, disabled, loading) on key controls.
- [ ] **DS-03**: User can interpret empty, loading, and error states through shared visual patterns.
- [ ] **DS-04**: User can interpret invoice/customer/payment statuses through a consistent semantic badge system.

### Accessibility Baseline

- [ ] **A11Y-01**: User can complete global navigation and top-level actions using keyboard-only interaction.
- [ ] **A11Y-02**: User can read text and controls that meet WCAG 2.1 AA contrast thresholds.
- [ ] **A11Y-03**: User can complete forms with programmatic labels, clear error text, and assistive-technology-friendly hints.
- [ ] **A11Y-04**: User can use motion-sensitive settings with `prefers-reduced-motion` respected on animated surfaces.

### Quality Assurance Hardening

- [ ] **QA-01**: Operator can run visual regression checks on critical marketing and app routes before release.
- [ ] **QA-02**: Operator can run responsive regression checks across desktop, tablet, and mobile breakpoints.
- [ ] **QA-03**: Operator can run smoke tests for core journeys (sign-in, workspace entry, invoice create, payment record).
- [ ] **QA-04**: Operator can run accessibility checks on critical routes and receive actionable failure output.

### Data and Analytics

- [ ] **DATA-01**: Operator can capture a minimal funnel event set (`landing_cta_click`, `signup_started`, `workspace_created`, `dashboard_first_view`).
- [ ] **DATA-02**: Operator can access documented analytics event schema with field definitions and privacy notes.
- [ ] **DATA-03**: Operator can disable analytics by environment configuration without breaking user flows.
- [ ] **DATA-04**: Operator can inspect referrer and UTM attribution fields for captured conversion events when present.

### Operations and Deployment

- [ ] **OPS-01**: Operator can deploy v2.0 via Docker Compose with app, db, and migrate contracts intact.
- [ ] **OPS-02**: Operator can validate required environment configuration and receive explicit startup errors for invalid values.
- [ ] **OPS-03**: Operator can verify browser and curl checks for `/health` on default port (`3000`) and one override port (`3001`).
- [ ] **OPS-04**: Operator can execute documented rollback and recovery procedures for big-bang launch failures.

## Future Requirements (Post-v2.0)

Deferred capability expansion; not part of this roadmap.

### Product Capability Expansion

- **CAP-01**: User can configure recurring invoice schedules.
- **CAP-02**: User can send invoices through integrated email delivery.
- **CAP-03**: User can accept online payments through managed gateways.
- **CAP-04**: User can create and convert estimates/quotes into invoices.

### Platform Expansion

- **PLAT-01**: Operator can run orchestrator-targeted deployment presets (k8s/nomad) in addition to Docker Compose.
- **PLAT-02**: User can use native mobile clients.

## Out of Scope (v2.0)

| Feature | Reason |
|---------|--------|
| New billing domain features (recurring, gateways, accounting modules) | v2.0 is redesign/repositioning, not product capability expansion. |
| Third-party ad-tech style analytics stack | Conflicts with privacy-first minimal analytics contract. |
| Multi-language/i18n rollout | Not required for this milestone's success criteria. |
| Orchestrator-specific deployment support | Current milestone keeps Docker Compose as deployment baseline. |
| Native mobile apps | Responsive web quality is the accepted boundary for this release. |

## Traceability

Each v2.0 requirement maps to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISC-01 | Phase 9 | Pending |
| DISC-02 | Phase 9 | Pending |
| DISC-03 | Phase 9 | Pending |
| DISC-04 | Phase 9 | Pending |
| BRAND-01 | Phase 10 | Pending |
| BRAND-02 | Phase 10 | Pending |
| BRAND-03 | Phase 10 | Pending |
| DS-01 | Phase 10 | Pending |
| DS-02 | Phase 10 | Pending |
| DS-03 | Phase 10 | Pending |
| DS-04 | Phase 10 | Pending |
| MKTG-01 | Phase 11 | Pending |
| MKTG-02 | Phase 11 | Pending |
| MKTG-03 | Phase 11 | Pending |
| MKTG-04 | Phase 11 | Pending |
| CONT-01 | Phase 11 | Pending |
| CONT-02 | Phase 11 | Pending |
| SEO-01 | Phase 11 | Pending |
| SEO-02 | Phase 11 | Pending |
| UX-01 | Phase 12 | Pending |
| UX-02 | Phase 12 | Pending |
| UX-06 | Phase 12 | Pending |
| A11Y-01 | Phase 12 | Pending |
| UX-03 | Phase 13 | Pending |
| UX-04 | Phase 13 | Pending |
| UX-05 | Phase 13 | Pending |
| A11Y-03 | Phase 13 | Pending |
| CONT-03 | Phase 14 | Pending |
| CONT-04 | Phase 14 | Pending |
| SEO-03 | Phase 14 | Pending |
| SEO-04 | Phase 14 | Pending |
| SEO-05 | Phase 14 | Pending |
| QA-01 | Phase 15 | Pending |
| QA-02 | Phase 15 | Pending |
| QA-03 | Phase 15 | Pending |
| QA-04 | Phase 15 | Pending |
| A11Y-02 | Phase 15 | Pending |
| A11Y-04 | Phase 15 | Pending |
| DATA-01 | Phase 15 | Pending |
| DATA-02 | Phase 15 | Pending |
| DATA-03 | Phase 15 | Pending |
| DATA-04 | Phase 15 | Pending |
| OPS-01 | Phase 15 | Pending |
| OPS-02 | Phase 15 | Pending |
| OPS-03 | Phase 15 | Pending |
| OPS-04 | Phase 15 | Pending |

**Coverage:**
- v2.0 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-02-15*  
*Last updated: 2026-02-15 after v2.0 milestone initialization*
