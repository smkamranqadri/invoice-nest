# Security Policy

## Reporting a vulnerability

Please **do not** report security vulnerabilities through public GitHub issues.

Report them privately through GitHub's
[private vulnerability reporting](https://github.com/smkamranqadri/invoice-nest/security/advisories/new)
on this repository. Include a description of the issue, the steps to reproduce it, and
the impact you expect it to have.

You should get an acknowledgement within a few days. Please give us reasonable time to
release a fix before disclosing the issue publicly.

## Self-hosting

InvoiceNest is self-hosted, so the security of a deployment also depends on its
operator. At minimum:

- set a long, random `BETTER_AUTH_SECRET` and never reuse the value from `.env.example`;
- serve the app over HTTPS;
- keep the PostgreSQL port off the public internet;
- keep dependencies up to date.
