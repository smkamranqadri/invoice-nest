# Architecture Research - v2.0 Rebrand & UX Overhaul

**Project:** InvoiceNest  
**Milestone:** v2.0 Rebrand & UX Overhaul  
**Researched:** 2026-02-15

## Architectural Intent

v2.0 is a broad presentation-layer and operability hardening milestone. Architecture work focuses on restructuring UI composition, content surfaces, and quality gates while preserving core domain services (auth/workspaces/customers/invoices/payments/PDF).

## Current Baseline

- Next.js App Router monolith, server-first data flow.
- Shared UI primitives via shadcn/ui and Tailwind.
- Domain logic already stable and tested through v1.
- Docker Compose runtime with app, db, and migrate services.

## v2.0 Architectural Components

### 1. Experience Layer Split

| Layer | Responsibility | Notes |
|------|-----------------|-------|
| Marketing surface | Acquisition, education, conversion path routing | New IA and SEO-heavy routes/content. |
| Application surface | Authenticated operational workflows | Reworked shell + core workflow UX. |

Design rule: both surfaces consume the same brand tokens and component grammar.

### 2. Design System Core

| Component | Responsibility | Output |
|----------|----------------|--------|
| Token model | Semantic colors, spacing, typography, radius, shadows, motion duration | Centralized CSS variables + Tailwind mapping |
| Primitive wrappers | Buttons, inputs, selects, tables, dialogs, badges, nav elements | Stable API for consistent states |
| Pattern catalog | Empty/loading/error/list/form sections | Reusable UX structures across modules |

### 3. Content and SEO System

| Component | Responsibility | Output |
|----------|----------------|--------|
| Page model | Page types by funnel stage (awareness/consideration/decision) | Consistent information hierarchy |
| Metadata ownership | Route-level title/description/open graph/canonical rules | Predictable indexation behavior |
| Structured data policy | JSON-LD on applicable pages | Better machine comprehension |
| Internal link strategy | Hub-to-spoke and CTA paths | Crawl depth and conversion flow support |

### 4. Verification and Release Layer

| Component | Responsibility | Output |
|----------|----------------|--------|
| Visual regression harness | Screenshot baselines for critical routes/components | UI regression detection |
| Accessibility gates | Keyboard + contrast + semantic checks | WCAG 2.1 AA baseline evidence |
| Funnel analytics schema | Minimal first-party events with privacy constraints | Conversion observability |
| Deployment validation | Docker up/build + health checks + port override tests | Host-level release confidence |

## Integration Points with Existing Code

1. `src/app` route groups:
- Add/rework route structure for marketing content without breaking authenticated app routes.

2. `src/components` and styling entry points:
- Introduce v2 token layer and migrate components incrementally by phase.

3. Domain query/action surfaces:
- Keep existing business contracts stable while changing visual hierarchy and interaction layout.

4. Testing/tooling:
- Extend current tests with visual and accessibility checks focused on redesigned routes.

5. Deployment docs and runbooks:
- Update operator guidance to reflect revised UI flows and launch verification.

## Data Flow Implications

- Business data flow remains server authoritative and unchanged in semantics.
- New analytics flow should emit only minimal events:
  - `landing_cta_click`
  - `signup_started`
  - `workspace_created`
  - `dashboard_first_view`
- Event capture must support disabled mode without runtime failure.

## Build Order Recommendation (Phase-Aligned)

1. **Phase 9 - Discovery & IA Blueprint**
- Freeze audience journeys, page map, and UX acceptance checklists.

2. **Phase 10 - Rebrand System**
- Establish token/component base before touching many pages.

3. **Phase 11 - Marketing Site + Conversion Path**
- Build external-facing pathways once design system is stable.

4. **Phase 12 - App Shell Redesign**
- Migrate global shell/navigation patterns and dashboard framing.

5. **Phase 13 - Core Workflow UX Rework**
- Apply new interaction patterns to customer/invoice/payment flows.

6. **Phase 14 - Content + SEO Hardening**
- Complete production content and search technical quality.

7. **Phase 15 - QA/A11Y/Observability/Launch**
- Lock quality gates and host deployment evidence before milestone close.

## Architecture Constraints

- No database schema changes required for core billing domain.
- No orchestrator-specific deployment assumptions.
- No hidden dependency on third-party telemetry services.
- Backward compatibility of domain behavior is mandatory.

---
*Architecture research completed: 2026-02-15*
