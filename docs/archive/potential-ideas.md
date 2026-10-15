# Potential ideas from earlier prototypes

> **These are not planned.** Nothing here is on the roadmap or committed to. This is a list
> of things the earlier InvoiceNest prototypes (v1–v4, July–November 2025) did or sketched
> that the current app does not do — kept so they are not lost when those codebases were
> retired. The roadmap lives in `.planning/`.
>
> In every case the **idea** is worth keeping, not the old code: the prototypes used other
> stacks (Prisma, SQLite) and their implementations had problems noted below.

## Customers

- **Structured billing and shipping addresses.** Separate street / city / state / postal code
  / country fields, two addresses per customer, and a "same as billing" checkbox. The current
  app stores one free-text `address`. Would make invoice PDFs and tax reporting cleaner.
  *Seen in v1, v2 (plan), v4.* A country list is archived in `v1/countries.ts`.
- **Customer numbers** such as `CUST-001`. If built, use a per-workspace counter — v4's version
  scanned every row and was not safe when two customers were created at once. *v4.*
- **More customer fields:** contact person, website, and an *archived* status alongside
  active/inactive. *v1.*
- **Duplicate-name check** when creating a customer in the same workspace. *v1 (TODO), v4.*
- **Export the customer list.** The app already exports invoices but not customers. *v1 (TODO).*

## Errors and validation

- **Field-level validation errors from the server.** Server actions currently return a single
  generic "Invalid customer data"; returning each field's error would help API clients. *v4.*
- **Friendlier auth error messages.** Sign-in shows "Invalid email or password" for every
  failure, including rate limiting and network errors. v2 mapped better-auth error codes to
  specific messages. If built, keep "invalid email *or* password" deliberately vague — saying
  which one was wrong tells an attacker whether an account exists. *v2.*

## Invoicing and tax

- **Compound taxes** (a tax applied on top of another tax). v1 modelled a flag for this but
  never implemented it; supporting it would change how totals are calculated. *v1.*
- **Invoice "Viewed" status**, so you know a customer opened it. *v2 (plan).*
- **Attachments on invoices** — purchase orders, agreements, receipts. *v2 (plan).*
- **Custom fields** such as a PO number. *v2 (plan).*
- **Late-fee rules** and **scheduled sending**. *v2 (plan).*

## Teams and reporting

- **More roles:** Accountant and Viewer, beyond owner and member. *v2 (plan).*
- **Activity log / audit trail** across the app; today only payments are audited. *v2 (plan).*
- **Receivables aging report.** *v2 (plan).*
- **Dashboard extras:** revenue charts, date-range filters. *v4 (plan).*

## Platform

- Webhooks, a public API, SMS notifications, PWA support. *v2 (plan).*
