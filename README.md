# InvoiceNest

InvoiceNest is a self-hostable invoicing workspace for small teams.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Set local env values in `.env.local`:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

3. Run the dev server:

```bash
npm run dev
```

## Docker Deployment

Phase 6 ships a Docker Compose contract with three services:
- `db` (PostgreSQL)
- `migrate` (one-shot Drizzle migration runner)
- `app` (Next.js standalone runtime)

Quick start:

```bash
cp .env.example .env
docker compose up --build
```

Health endpoint:
- `GET /health` (app + DB status)

Detailed operator runbook:
- `docs/docker-deployment.md`

## Useful Commands

```bash
npm run lint
npm run build
npm run db:migrate
```
