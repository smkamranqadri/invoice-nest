# Phase 6: Docker Deployment - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Containerize InvoiceNest so `docker compose up` brings up PostgreSQL, runs pending migrations safely, starts the web app only after dependency gates pass, persists data across restarts, and exposes a health check endpoint for operators.

</domain>

<decisions>
## Implementation Decisions

### Startup contract
- Default operator flow is single-command bootstrap with `docker compose up`.
- Use a dedicated one-shot migration service (`migrate`) before app startup.
- App startup must be gated on DB health and migration success.
- Startup failures (DB unavailable or migration failure) are fail-fast and explicit.
- Long-running services use `unless-stopped` restart policy.
- Host app port is configurable; default remains `3000`.
- No automatic seed data in startup path.

### Env and secret contract
- Use a single `.env` contract for compose + app runtime values.
- Secrets are environment-variable based for Phase 6.
- Missing/invalid required env vars must fail startup with clear errors.
- Auth/session secret is required and user-supplied.

### Persistence and migration safety
- PostgreSQL uses a named Docker volume for durability.
- Migration failure blocks app startup and preserves existing DB state.
- Startup migration checks are idempotent and apply only pending migrations.

### Health and operability
- Expose `GET /health` as JSON with DB connectivity signal.
- Compose health checks are required for both `db` and `app`.
- Default logs are human-readable for Docker operator workflows.
- Provide a deployment runbook for startup, logs, migration recovery, and manual backup/restore.

### Claude's Discretion
- Docker image layering details and stage naming.
- Specific health check timing values (`interval`, `retries`, `start_period`).
- Exact formatting/layout for runbook sections.

</decisions>

<specifics>
## Specific Ideas

No specific product references; prioritize operator clarity and deterministic startup behavior.

</specifics>

<deferred>
## Deferred Ideas

- Automated/scheduled backup orchestration.
- Backup retention and rotation policy implementation.
- Bundled monitoring stack (for example, Prometheus/Grafana).

</deferred>

---

*Phase: 06-docker-deployment*
*Context gathered: 2026-02-15*
