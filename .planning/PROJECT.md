# InvoiceNest

## What This Is

An open-source, self-hosted invoicing workspace for small businesses to manage customers, create invoices, track payments, and operate role-based teams.

## Core Value

Teams can create invoices, send them to customers, and know exactly who owes what -- without spreadsheets or expensive SaaS tools.

## Current Milestone: v2.0 Rebrand & UX Overhaul

**Goal:** Deliver a full redesign and market-facing repositioning that improves trust, conversion, usability, and release confidence while preserving shipped v1 billing behavior.

**Target feature groups:**
- Discovery and information architecture (`DISC-*`)
- Rebrand and design-system rollout (`BRAND-*`, `DS-*`)
- Marketing conversion and content system (`MKTG-*`, `CONT-*`)
- SEO production baseline (`SEO-*`)
- App UX rework and accessibility (`UX-*`, `A11Y-*`)
- Validation, analytics, and deployment hardening (`QA-*`, `DATA-*`, `OPS-*`)

## Current State

- Milestone `v1` shipped on **2026-02-15** and is archived under `.planning/milestones/`.
- Core domain behavior (auth/workspaces/customers/invoices/payments/pdf/dashboard/settings/docker) is complete.
- v2.0 is initialized as a major redesign/rebrand milestone with phase numbering continuing at **Phase 9**.

## Requirements

### Validated

- ✓ Secure session-based authentication (signup, login, logout) -- v1
- ✓ Team workspaces with owner/member roles -- v1
- ✓ Customer management (add, edit, search, filter, status tracking) -- v1
- ✓ Invoice creation with line items, tax, discounts, and lifecycle actions -- v1
- ✓ PDF generation and download for invoices -- v1
- ✓ Partial payment recording and payment correction controls -- v1
- ✓ Dashboard metrics for outstanding, overdue, recent invoices, and period revenue -- v1
- ✓ Workspace settings for branding, currency, and tax presets -- v1
- ✓ Docker-ready self-host deployment (`docker compose up`) with health checks -- v1
- ✓ Focused hardening coverage for invoice/payment/pdf invariants and timezone fallback observability -- v1

### Active

- [ ] Finalize v2.0 research artifacts for design/SEO/content/operability.
- [ ] Lock v2.0 requirements and traceability mapping (`DISC-*` through `OPS-*`).
- [ ] Execute roadmap phases 9-15 for full redesign and launch gating.

### Out of Scope (v2.0)

- New billing capability domains (recurring invoices, payment gateways, accounting modules)
- Native mobile applications
- Multi-language/i18n rollout
- Orchestrator-specific deployment targets beyond Docker Compose
- Heavy third-party analytics stack that violates privacy-first event policy

## Context

- **Target users:** freelancers, solo professionals, small service businesses/agencies, nonprofits, and small teams currently running invoice workflows manually or via SaaS lock-in.
- **Deployment model:** self-hosted Docker Compose remains baseline.
- **Tech stack:** Next.js 15, PostgreSQL, Drizzle ORM, better-auth, shadcn/ui, @react-pdf/renderer.
- **Milestone strategy:** big-bang launch with strict design + quality gates before closure.
- **Accessibility baseline:** WCAG 2.1 AA.
- **Analytics posture:** privacy-first, minimal first-party funnel events.

## Constraints

- **Scope:** v2.0 introduces no net-new billing capabilities -- only redesign/repositioning and evidence-quality hardening.
- **Compatibility:** Existing domain behavior and data contracts must remain stable unless explicitly planned in future milestones.
- **Deployment:** Docker Compose flow and `/health` operability must remain valid (default and override port checks).
- **Quality gate:** Visual regression, responsive checks, accessibility checks, and host-level deployment verification required before closure.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Move from incremental release plan to major v2.0 milestone | Scope is full redesign + rebrand across marketing and app surfaces | ✅ Locked |
| Use research-first gate before requirements | Reduces large-milestone ambiguity and ordering mistakes | ✅ Locked |
| Keep self-host Docker baseline | Preserves product promise and existing operator workflows | ✅ Locked |
| Privacy-first analytics event model | Need conversion visibility without heavy tracking footprint | ✅ Locked |
| Big-bang launch with strict quality gates | Matches timeline choice and risk tolerance for this redesign | ✅ Locked |

## Next Milestone Goals

1. Execute Phase 9 to lock IA, pathways, and acceptance criteria.
2. Build and enforce shared design system in Phase 10 before broad UI rewrites.
3. Complete roadmap phases 11-15 and close launch evidence gates.

---
*Last updated: 2026-02-15 after v2.0 milestone initialization*
