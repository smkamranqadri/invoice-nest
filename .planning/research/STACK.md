# Technology Stack

**Project:** InvoiceNest
**Researched:** 2026-02-13
**Overall Confidence:** MEDIUM (versions need npm verification -- external tools were unavailable during research)

---

## Version Verification Note

All versions below are based on training data through May 2025. Before initializing the project, run the following to get verified current versions:

```bash
npm view next drizzle-orm better-auth @react-pdf/renderer @radix-ui/react-dialog tailwindcss zod react-hook-form @tanstack/react-query typescript @paralleldrive/cuid2 postgres drizzle-kit @t3-oss/env-nextjs --json | jq 'to_entries[] | "\(.key): \(.value.version)"'
```

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | ^15.1 | Full-stack React framework | App Router is stable and mature. Server Components reduce client bundle for dashboard-heavy app. API routes handle backend logic without a separate server. Single deployable unit simplifies Docker setup. Dominant React framework with largest ecosystem. | MEDIUM |
| React | ^19.0 | UI library | Ships with Next.js 15. Server Components are the default, which is ideal for data-heavy dashboards and invoice views. | MEDIUM |
| TypeScript | ^5.7 | Type safety | Non-negotiable for a financial application. Catches calculation bugs at compile time. Drizzle ORM provides end-to-end type safety from DB schema to API response. | MEDIUM |

**Why Next.js over alternatives:**
- Over a dedicated backend (Express/Fastify + separate React SPA): Next.js collapses frontend + backend into one deployable. For a self-hosted Docker app, one container is simpler than two. Server Actions replace most API routes for mutations.
- Over Remix: Next.js has a larger ecosystem, more deployment flexibility, and better documentation. Remix is strong but Next.js App Router has caught up on data loading patterns.
- Over SvelteKit/Nuxt: The user already specified Radix UI + Tailwind, which is React-native. Changing frameworks would mean losing Radix.

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL | 16+ | Primary database | Relational data (invoices, line items, payments) maps naturally to SQL. JSONB for flexible metadata. Rock-solid for financial data. Excellent Docker support. Free and open-source. | HIGH |
| Drizzle ORM | ^0.38 | Database ORM / query builder | Type-safe SQL that maps 1:1 to actual queries -- you see what SQL runs. Lighter than Prisma (no separate engine binary, smaller Docker image). Schema-as-code with TypeScript. Migrations via drizzle-kit. Relational query API handles joins cleanly. | MEDIUM |
| drizzle-kit | ^0.30 | Migration tooling | Companion to Drizzle ORM. Generates SQL migrations from schema changes. `drizzle-kit push` for development, `drizzle-kit generate` + `drizzle-kit migrate` for production. | MEDIUM |
| postgres (porsager/postgres) | ^3.4 | PostgreSQL driver | The `postgres` package (aka postgres.js) is the fastest and most modern PostgreSQL driver for Node.js. Native ESM, no binary dependencies, connection pooling built-in. Used as the underlying driver for Drizzle. | MEDIUM |

**Why Drizzle over Prisma:**
- No Rust engine binary means Docker images are 50-100MB smaller -- matters for self-hosted deployments where users pull images.
- Drizzle queries map transparently to SQL. For financial calculations (sums, aggregations on invoice line items), you need to know exactly what query runs.
- Prisma's query engine adds a layer of abstraction that can produce unexpected N+1 queries. Drizzle's relational API is explicit.
- Drizzle's schema is plain TypeScript -- no `.prisma` file, no code generation step, no `prisma generate` in Docker build.

**Why PostgreSQL over SQLite:**
- Multi-user workspaces with concurrent access. SQLite has write-locking limitations that become painful with multiple team members editing invoices simultaneously.
- Financial data benefits from PostgreSQL's transaction isolation levels and ACID guarantees.
- PostgreSQL runs as a separate Docker service, making backups straightforward (`pg_dump`).
- Aggregation queries for the dashboard (SUM, GROUP BY across invoices/payments) are significantly faster in PostgreSQL.

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| better-auth | ^1.2 | Authentication library | Session-based auth out of the box (matches project constraint). Framework-agnostic with first-class Next.js support. Stores sessions in the database (PostgreSQL) -- no external Redis needed. Built-in support for organizations/teams which maps to the workspace model. Email + password auth without requiring email providers. Open source (MIT). | MEDIUM |

**Why better-auth over alternatives:**
- Over NextAuth/Auth.js v5: NextAuth is primarily designed for OAuth providers. Email/password (credentials provider) is treated as a second-class citizen -- sessions are JWT-based by default with credentials, and the library explicitly discourages it. better-auth treats email/password as a first-class flow with real database sessions.
- Over Lucia Auth: Lucia was deprecated in early 2025. The author recommended moving to custom implementations or better-auth. Using Lucia now means adopting abandoned software.
- Over custom auth: Rolling your own session management is error-prone (timing attacks, session fixation, CSRF). better-auth handles these correctly and is actively maintained.
- Over Clerk/Auth0: These are SaaS services. Self-hosted app cannot depend on external auth providers -- defeats the purpose.

**better-auth workspace/organization feature:**
better-auth has an organizations plugin that provides team/workspace functionality with roles (owner, member, admin). This maps directly to InvoiceNest's workspace model and avoids building custom RBAC from scratch.

### PDF Generation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @react-pdf/renderer | ^4.1 | PDF generation | Renders React components to PDF. Write invoice templates as JSX -- same mental model as the rest of the app. No headless browser required (unlike Puppeteer). Runs on the server via Node.js. Produces small, clean PDFs. Open source. | MEDIUM |

**Why @react-pdf/renderer over alternatives:**
- Over Puppeteer/Playwright: Headless browsers add 200-400MB to Docker images. They are fragile in containerized environments (Chrome sandboxing issues, missing system fonts). @react-pdf/renderer is a pure Node.js solution -- no browser binary needed.
- Over PDFKit: PDFKit is low-level (imperative coordinate-based drawing). @react-pdf/renderer uses declarative JSX with flexbox layout -- dramatically faster to build and maintain invoice templates.
- Over jsPDF: jsPDF is client-side oriented and also low-level. Server-side PDF generation with React components is the better pattern.
- Over wkhtmltopdf: Deprecated, security issues, binary dependency headaches in Docker.

**Important note:** @react-pdf/renderer has some limitations with complex CSS (no CSS Grid, limited text wrapping edge cases). Invoice PDFs are primarily tabular data with headers/footers, which is well within its capabilities.

### UI Layer

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Radix UI Primitives | latest | Accessible UI primitives | User-specified constraint. Unstyled, accessible components (dialogs, dropdowns, tabs, tooltips). WAI-ARIA compliant out of the box. Composable with Tailwind. | MEDIUM |
| Tailwind CSS | ^4.0 | Utility-first CSS | User-specified constraint. Tailwind v4 uses a CSS-first configuration (no more `tailwind.config.js`). Faster builds via Oxide engine. | LOW |
| shadcn/ui | N/A (copy-paste) | Pre-built component patterns | Not a dependency -- components are copied into the project. Built on Radix + Tailwind. Provides well-designed patterns for tables, forms, cards, dialogs. Saves weeks of component design while remaining fully customizable. Use `npx shadcn@latest init` and add components as needed. | MEDIUM |
| Lucide React | ^0.460 | Icons | Default icon set for shadcn/ui. Consistent, clean, extensive set. Tree-shakeable. | MEDIUM |

**Why shadcn/ui as a component pattern layer:**
- Not an npm dependency -- source code lives in the project. Full control, no version lock-in.
- Built on exactly the stack InvoiceNest uses (Radix + Tailwind).
- Provides a professional look immediately -- critical for a financial tool that needs to feel trustworthy.
- Table component handles invoice line item tables. Form components handle invoice creation forms. Dialog components handle confirmations and modals.

**Tailwind v4 note (LOW confidence):**
Tailwind v4 was released in early 2025 with significant configuration changes. The CSS-first approach (`@theme` in CSS instead of `tailwind.config.js`) may have ecosystem compatibility gaps with some tools. If issues arise, falling back to Tailwind v3.4 is straightforward. Verify shadcn/ui compatibility with Tailwind v4 before committing.

### Forms and Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zod | ^3.24 | Schema validation | Validates on both client (forms) and server (API/Server Actions). Single source of truth for data shapes. Integrates with Drizzle (drizzle-zod generates schemas from DB tables). TypeScript-first. | MEDIUM |
| React Hook Form | ^7.54 | Form state management | Minimal re-renders (critical for invoice forms with many line items). Built-in Zod resolver (`@hookform/resolvers`). Handles dynamic field arrays (adding/removing invoice line items) via `useFieldArray`. | MEDIUM |
| @hookform/resolvers | ^3.9 | Zod-to-RHF bridge | Connects Zod schemas to React Hook Form validation. | MEDIUM |
| drizzle-zod | ^0.7 | Schema generation | Generates Zod schemas from Drizzle table definitions. Single source of truth: DB schema -> Zod validation -> TypeScript types. | MEDIUM |

**Why React Hook Form over alternatives:**
- Over Formik: React Hook Form has better performance (uncontrolled inputs by default), smaller bundle, and is more actively maintained. Formik development has stalled.
- Over conform: conform is designed for progressive enhancement with server actions. While compelling, React Hook Form's ecosystem (resolvers, field arrays) is more mature for complex forms like invoice creation with dynamic line items.

### Data Fetching and State

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| TanStack Query | ^5.62 | Server state management | Caching, background refetching, optimistic updates for invoice lists and dashboard data. Handles loading/error states. Pairs with Server Actions for mutations. | MEDIUM |
| nuqs | ^2.3 | URL search params state | Type-safe URL query parameters for filters (invoice status, date ranges, search). Keeps UI state in the URL -- shareable, bookmarkable. | MEDIUM |

**Data fetching strategy:**
- Server Components for initial page loads (dashboard, invoice lists) -- data fetched on the server, zero client JS for data fetching.
- TanStack Query for client-side interactions that need caching/refetching (e.g., after creating an invoice, the list updates).
- Server Actions for mutations (create invoice, record payment, update customer). Validated with Zod on the server side.
- This hybrid approach minimizes client JavaScript while keeping interactions snappy.

### Date and Currency Handling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| date-fns | ^4.1 | Date manipulation | Tree-shakeable (only import functions you use). Handles invoice due dates, overdue calculations, date formatting. Lighter than dayjs for the operations needed. | MEDIUM |
| Intl.NumberFormat | (browser API) | Currency formatting | Built-in browser API. Handles currency symbols, decimal places, thousand separators for any locale. No library needed. | HIGH |
| decimal.js | ^10.4 | Precise arithmetic | Financial calculations MUST NOT use floating point. decimal.js provides arbitrary-precision decimals for line item totals, tax calculations, payment amounts. Store as integers (cents) in the database, use decimal.js for calculations. | MEDIUM |

**Critical: Money handling strategy:**
- Store all monetary values as integers in the database (cents/pence). A $150.00 invoice is stored as `15000`.
- Use `decimal.js` for all arithmetic operations (subtotals, tax, discounts, payment balance).
- Use `Intl.NumberFormat` for display formatting only.
- NEVER use JavaScript floating-point arithmetic for money. `0.1 + 0.2 !== 0.3` is a real bug in invoicing software.

### Utility and Infrastructure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @paralleldrive/cuid2 | ^2.2 | ID generation | Collision-resistant, URL-safe, non-sequential IDs. Better than UUID for primary keys (shorter, sortable-ish). Better than auto-increment (no information leakage about invoice counts). | MEDIUM |
| @t3-oss/env-nextjs | ^0.11 | Environment variable validation | Validates env vars at build time with Zod. Catches missing DATABASE_URL before runtime. Essential for self-hosted app where users configure their own env. | MEDIUM |
| clsx + tailwind-merge | ^2.1 / ^2.6 | Class name utility | `clsx` for conditional classes, `tailwind-merge` for deduplication. Standard pattern with shadcn/ui. Often wrapped in a `cn()` utility function. | MEDIUM |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^9.15 | Linting | Flat config format in v9. Use `@eslint/js` + `typescript-eslint`. Next.js provides `eslint-config-next`. | MEDIUM |
| Prettier | ^3.4 | Code formatting | Consistent formatting. Use `prettier-plugin-tailwindcss` for automatic class sorting. | MEDIUM |
| Vitest | ^2.1 | Unit/integration testing | Fast, ESM-native, TypeScript-first. Compatible with Jest API but faster. Works well with Next.js. | MEDIUM |
| Playwright | ^1.49 | E2E testing | Recommended over Cypress for modern apps. Multi-browser, fast, reliable. Good Docker support for CI. | MEDIUM |

### Docker and Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Docker | N/A | Containerization | Multi-stage build: deps -> build -> runtime. Use `node:22-alpine` base for small images. Next.js `output: 'standalone'` produces a minimal self-contained build. | HIGH |
| Docker Compose | N/A | Service orchestration | Defines app + PostgreSQL as services. Single `docker compose up` to run everything. Volume for PostgreSQL data persistence. | HIGH |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Remix | Smaller ecosystem, Radix integration is identical but fewer community examples |
| Framework | Next.js 15 | Express + React SPA | Two deployable units complicates Docker setup, more infrastructure code |
| ORM | Drizzle | Prisma | Larger Docker images (engine binary), opaque query generation, heavier |
| ORM | Drizzle | Knex.js | No type safety from schema, manual type definitions, less DX |
| Database | PostgreSQL | SQLite | Write-locking issues with concurrent multi-user access |
| Database | PostgreSQL | MySQL | PostgreSQL has better JSON support, CTEs, and is more common in OSS |
| Auth | better-auth | NextAuth/Auth.js | Poor credentials/session support, designed for OAuth flows |
| Auth | better-auth | Lucia | Deprecated in 2025, author recommends alternatives |
| Auth | better-auth | Custom | Error-prone, security risks, time-consuming |
| PDF | @react-pdf/renderer | Puppeteer | 200-400MB Docker image increase, fragile in containers |
| PDF | @react-pdf/renderer | PDFKit | Low-level imperative API, slow to build templates |
| Forms | React Hook Form | Formik | Stalled development, worse performance |
| State | TanStack Query | SWR | TanStack Query has more features (mutations, optimistic updates, devtools) |
| Testing | Vitest | Jest | Vitest is faster, ESM-native, better DX with TypeScript |
| IDs | cuid2 | UUID v4 | cuid2 is shorter, URL-safe, has monotonic ordering for DB performance |
| Money | decimal.js | dinero.js | decimal.js is simpler and more general, dinero.js adds currency-specific abstractions that are overkill for v1 |
| CSS | Tailwind v4 | Tailwind v3 | v4 is current, faster builds, but fallback to v3 if ecosystem issues arise |

---

## What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| JWT for auth sessions | Project constraint: session-based auth. JWTs cannot be revoked without a blocklist (which is just a session store with extra steps). |
| Prisma | Binary engine adds Docker complexity. For a self-hosted app, image size matters. Drizzle is lighter and more transparent. |
| Puppeteer/Playwright for PDF | Adds hundreds of MB to Docker image. Fragile Chrome sandboxing in containers. Overkill for structured invoice documents. |
| tRPC | Adds complexity for an app that is not a separate frontend/backend. Next.js Server Actions + Server Components cover the same use case with less boilerplate. |
| Redux/Zustand | No complex client state to manage. Server state is handled by TanStack Query. Form state by React Hook Form. URL state by nuqs. No remaining use case for a global state library. |
| Mongoose/MongoDB | Invoices, line items, payments, and customers are relational data. MongoDB would require manual joins and denormalization that PostgreSQL handles natively. |
| Clerk/Auth0/Supabase Auth | External SaaS dependencies. Self-hosted app must not depend on third-party auth services. |
| CSS Modules / styled-components | Project constraint: Tailwind CSS. These approaches conflict with the utility-first philosophy. |
| Moment.js | Deprecated. Use date-fns instead. |

---

## Installation

```bash
# Core framework
npx create-next-app@latest invoice-nest --typescript --tailwind --eslint --app --src-dir

# Database
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Authentication
npm install better-auth

# PDF generation
npm install @react-pdf/renderer

# UI components (after shadcn init)
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu form input label select separator sheet table tabs toast badge

# Forms and validation
npm install zod react-hook-form @hookform/resolvers
npm install drizzle-zod

# Data fetching
npm install @tanstack/react-query nuqs

# Date and money
npm install date-fns decimal.js

# Utilities
npm install @paralleldrive/cuid2 @t3-oss/env-nextjs clsx tailwind-merge

# Icons
npm install lucide-react

# Dev dependencies
npm install -D vitest @vitejs/plugin-react prettier prettier-plugin-tailwindcss @playwright/test typescript-eslint
```

---

## Project Structure (Recommended)

```
src/
  app/                     # Next.js App Router
    (auth)/                # Auth layout group (login, signup)
    (dashboard)/           # Authenticated layout group
      dashboard/           # Dashboard page
      invoices/            # Invoice CRUD pages
      customers/           # Customer CRUD pages
      settings/            # Workspace settings
    api/                   # API routes (better-auth handler)
  components/
    ui/                    # shadcn/ui components
    invoices/              # Invoice-specific components
    customers/             # Customer-specific components
    dashboard/             # Dashboard widgets
    layout/                # Shell, sidebar, header
  lib/
    db/
      schema/              # Drizzle schema files (per entity)
      migrations/          # Generated SQL migrations
      index.ts             # DB connection
    auth/                  # better-auth configuration
    pdf/                   # Invoice PDF templates (@react-pdf)
    validators/            # Zod schemas (or co-located with schema)
    utils.ts               # cn() helper, formatCurrency, etc.
  hooks/                   # Custom React hooks
  types/                   # Shared TypeScript types
drizzle.config.ts          # Drizzle Kit configuration
docker-compose.yml         # App + PostgreSQL
Dockerfile                 # Multi-stage build
```

---

## Docker Strategy

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://invoicenest:password@db:5432/invoicenest
      - BETTER_AUTH_SECRET=change-me-in-production
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=invoicenest
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=invoicenest
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U invoicenest"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

**Key Docker decisions:**
- `output: 'standalone'` in `next.config.ts` produces a self-contained build (~30-50MB vs ~500MB full node_modules).
- Alpine base image for minimal size.
- PostgreSQL runs as a separate service with a named volume for data persistence.
- Health check ensures the app waits for PostgreSQL to be ready before starting.
- No Puppeteer/Chrome means the Docker image stays small (typically under 200MB).

---

## Sources and Confidence

| Technology | Source | Confidence | Verification Needed |
|------------|--------|------------|---------------------|
| Next.js 15 | Training data (May 2025) | MEDIUM | Verify latest stable version via `npm view next version` |
| React 19 | Training data | MEDIUM | Shipped with Next.js 15, verify compatibility |
| Drizzle ORM | Training data | MEDIUM | Verify latest version, API stability |
| better-auth | Training data | MEDIUM | Verify organizations plugin API, latest version |
| @react-pdf/renderer | Training data | MEDIUM | Verify v4 stability, Next.js App Router compatibility |
| Tailwind CSS v4 | Training data | LOW | Major config changes from v3. Verify shadcn/ui compatibility |
| PostgreSQL 16+ | Widely established | HIGH | Stable, well-known |
| Docker patterns | Widely established | HIGH | Standard Next.js Docker patterns |
| decimal.js for money | Well-established pattern | HIGH | Standard approach for financial apps |
| shadcn/ui | Training data | MEDIUM | Verify Tailwind v4 support |

**Critical items to verify before project init:**
1. Tailwind v4 compatibility with shadcn/ui -- if incompatible, use Tailwind v3.4
2. better-auth organizations plugin API and maturity
3. @react-pdf/renderer compatibility with React 19 and Next.js App Router (server-side rendering)
4. Drizzle ORM current API (the library was evolving rapidly through 2024-2025)
