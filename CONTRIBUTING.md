# Contributing to InvoiceNest

Thanks for your interest in improving InvoiceNest.

## Getting set up

Follow **Local Development** in the [README](README.md). You will need Node.js and a
PostgreSQL database; the quickest route to both is `docker compose up --build`.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Keep each pull request focused on one change.
3. Before opening the pull request, make sure these pass:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. If you change the database schema, include the generated Drizzle migration.
5. Describe what changed and why in the pull request.

## Code style

- TypeScript throughout; avoid `any`.
- Match the structure that is already there: data access in `src/lib/queries`,
  mutations in `src/lib/actions`, UI primitives in `src/components/ui`.
- Every query and mutation must be scoped to the current workspace.

## Reporting bugs and requesting features

Open a GitHub issue. For bugs, include steps to reproduce, what you expected and what
happened. For security problems, follow [SECURITY.md](SECURITY.md) instead — please do
not open a public issue.
