# InvoiceNest

## What This Is

An open-source invoicing workspace for small businesses to manage customers, create professional invoices with line items, and track payments — all in one place. Built for freelancers, small agencies, nonprofits, and teams currently stuck with spreadsheets. Self-host friendly and Docker-ready.

## Core Value

Teams can create invoices, send them to customers, and know exactly who owes what — without spreadsheets or expensive SaaS tools.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Secure session-based authentication (signup, login, logout)
- [ ] Team workspaces with owner + member roles
- [ ] Customer management (add, edit, search, filter, status tracking)
- [ ] Invoice creation with line items (description, qty, unit price), tax, and discounts
- [ ] PDF generation and download for invoices
- [ ] Internal invoice tracking (draft, sent, paid, overdue statuses)
- [ ] Partial payment recording against invoices
- [ ] Dashboard with total outstanding, overdue count, recent invoices, and period revenue
- [ ] UI designed with Radix + Tailwind CSS — clean, professional look appropriate for financial tools
- [ ] Docker-ready deployment for self-hosting

### Out of Scope

- Advanced analytics / custom reporting — v2 feature, keep v1 focused
- Automated email reminders / notifications — adds email infrastructure complexity
- Multi-language / i18n support — English-only for v1
- Native mobile apps — web-first, responsive design covers mobile browsers
- Third-party integrations (accounting, CRM, payment gateways) — keep v1 self-contained
- Online payment processing (Stripe, PayPal) — manual payment recording for v1

## Context

- **Target users:** Freelancers, solo professionals, small service businesses/agencies, small nonprofits, teams currently using spreadsheets or manual billing
- **Product positioning:** Simple, free, open-source alternative to FreshBooks/Wave for teams that want control over their data
- **Deployment model:** Self-hosted via Docker — users run it on their own infrastructure
- **Team model:** Workspaces with role-based access — owner manages workspace settings and members, members can create/edit invoices and customers but have limited admin capabilities
- **Invoice workflow:** Create invoice → add line items (qty × rate) → apply tax/discounts → save as draft → mark sent → track payments (supports partial) → mark paid. Users can generate PDF at any point to send manually.
- **UI direction:** Radix primitives + Tailwind CSS. Visual style to be determined by research — should feel professional and trustworthy for a financial tool. UI screens to be designed before implementation in each phase.
- **Tech stack:** Open — research will determine best stack for this type of application. Must be self-host friendly and Docker-deployable.

## Constraints

- **Open source**: MIT or similar license — community-friendly
- **Self-hosting**: Must run via Docker Compose with minimal configuration
- **Authentication**: Session-based auth (not JWT) — simpler mental model for self-hosted deployments
- **UI components**: Radix UI primitives + Tailwind CSS
- **"Done" for v1**: Docker-ready, containerized, runnable with `docker compose up`
- **UI design**: Each phase should include UI/UX design before implementation — screens designed to match the invoicing product

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Radix + Tailwind for UI | User preference — composable primitives with utility CSS | — Pending |
| Session-based auth over JWT | Simpler for self-hosted, no token refresh complexity | — Pending |
| Team workspaces with roles | Multi-user from day one — owner + member model | — Pending |
| Partial payments support | Real invoicing needs partial payment tracking | — Pending |
| PDF generation for invoices | Users need downloadable invoices to send manually | — Pending |
| Docker-ready as v1 "done" | Self-host friendly deployment target | — Pending |
| Tech stack open to research | No strong preference — let domain research decide best fit | — Pending |
| UI design per phase | Design screens before building — ensures cohesive product | — Pending |

---
*Last updated: 2026-02-13 after initialization*
