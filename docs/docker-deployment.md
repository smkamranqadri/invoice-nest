# Docker Deployment Runbook

## Scope

Phase 6 deployment contract:
- `docker compose up` auto-builds and starts `db`, `migrate`, and `app`
- migrations run as a dedicated one-shot service
- app starts only after DB health + migration success
- persistent Postgres data via named volume
- app health endpoint at `GET /health`

Out of scope for this phase:
- automated/scheduled backups
- backup retention/rotation automation
- bundled metrics stack

## Prerequisites

- Docker with Compose v2 (`docker compose version`)

## Configuration

1. Copy the env template:

```bash
cp .env.example .env
```

2. Update required values in `.env`:
- `BETTER_AUTH_SECRET` (must be 32+ chars)
- `POSTGRES_PASSWORD` (set a strong password)
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` (set your public URL)
- `APP_PORT` (optional, default `3000`)

## Start the Stack

```bash
docker compose up --build
```

Expected boot order:
1. `db` starts and becomes healthy (`pg_isready`)
2. `migrate` runs `drizzle-kit migrate` and exits `0` on success
3. `app` starts only after `migrate` succeeded

## Verify Health

1. Check service state:

```bash
docker compose ps
```

2. Check app health endpoint:

```bash
curl -f http://localhost:${APP_PORT:-3000}/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "up",
  "timestamp": "..."
}
```

## Logs and Diagnostics

Show all logs:

```bash
docker compose logs -f
```

Focus a specific service:

```bash
docker compose logs -f db
docker compose logs -f migrate
docker compose logs -f app
```

## Migration Recovery

If `migrate` fails:

1. Inspect migration logs:

```bash
docker compose logs migrate
```

2. Fix the underlying issue (env/config/schema/DB state).
3. Re-run the one-shot migration service:

```bash
docker compose run --rm migrate
```

4. Bring app up again:

```bash
docker compose up -d app
```

Migration failures are fail-fast and block app startup by design.

## Manual Backup and Restore

### Backup

```bash
mkdir -p backups
docker compose exec -T db pg_dump \
  -U "${POSTGRES_USER:-invoicenest}" \
  -d "${POSTGRES_DB:-invoicenest}" \
  > "backups/invoice_nest_$(date +%Y%m%d_%H%M%S).sql"
```

### Restore

```bash
cat backups/<backup-file>.sql | docker compose exec -T db psql \
  -U "${POSTGRES_USER:-invoicenest}" \
  -d "${POSTGRES_DB:-invoicenest}"
```

## Data Persistence

Postgres data is stored in named volume `invoice_nest_postgres_data`.

Inspect volume:

```bash
docker volume inspect invoice_nest_postgres_data
```

The volume survives container restarts and `docker compose down`.

## Controlled Shutdown

```bash
docker compose down
```

To remove DB data as well:

```bash
docker compose down -v
```
