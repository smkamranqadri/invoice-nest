# InvoiceNest

## What This Is

An open-source, self-hosted invoicing workspace for small businesses to manage customers, create invoices, track payments, and operate role-based teams.

## Core Value

Teams can create invoices, send them to customers, and know exactly who owes what -- without spreadsheets or expensive SaaS tools.

## Current State

- Milestone `v1` shipped on **2026-02-15**.
- Core product scope is complete across auth/workspaces, customers, invoices, payments/PDF, dashboard/settings, and Docker deployment.
- Post-audit closure work is complete (verification evidence closure and hardening tests/observability).
- Milestone archives are stored in `.planning/milestones/`.

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

- [ ] Define v1.1 milestone goals and requirement set.
- [ ] Prioritize roadmap based on first operator/user feedback after v1 shipment.

### Out of Scope (unchanged)

- Advanced analytics/custom reporting
- Automated email reminders/notifications
- Multi-language/i18n
- Native mobile apps
- Third-party accounting/CRM/payment gateway integrations
- Online payment processing (Stripe/PayPal)

## Context

- **Target users:** freelancers, solo professionals, small service businesses/agencies, small nonprofits, small teams using spreadsheets/manual billing.
- **Deployment model:** self-hosted Docker Compose.
- **Tech stack:** Next.js 15, PostgreSQL, Drizzle ORM, better-auth, shadcn/ui, @react-pdf/renderer.
- **Codebase size snapshot:** ~13k lines TypeScript/TSX under `src/`.
- **Known non-blocking debt:** none blocking v1 shipment; next milestone priorities should come from usage feedback.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Radix + Tailwind for UI | User preference for composable primitives + utility styling | ✅ Shipped in v1 |
| Session-based auth over JWT | Simpler self-hosted mental model | ✅ Shipped in v1 |
| Team workspaces with owner/member roles | Multi-user from day one | ✅ Shipped in v1 |
| Partial payments support | Real invoicing workflows need it | ✅ Shipped in v1 |
| PDF generation for invoices | Users need downloadable invoice docs | ✅ Shipped in v1 |
| Docker-ready as v1 done criterion | Self-host deployment target | ✅ Shipped in v1 |
| Post-audit hardening phase | Close test/observability debt before milestone close | ✅ Shipped in v1 |

## Next Milestone Goals

1. Define v1.1 theme and success criteria.
2. Establish new requirements file for v1.1 scope.
3. Build updated roadmap phases after requirements lock.

---
*Last updated: 2026-02-15 after v1 milestone completion*
