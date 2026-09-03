# Security Policy

## Supported versions

The latest tagged release and the `main` branch receive security fixes.

## Reporting a vulnerability

Do not open a public issue. Use GitHub private vulnerability reporting for `BITS4/Finance-Academy-`, or contact the repository owner privately with:

- the affected version or commit;
- impact and realistic attack prerequisites;
- minimal reproduction steps;
- a suggested mitigation, if known.

Expect acknowledgement within three business days and a status update within seven. Reports remain private until a fix and advisory are ready.

## Security controls

- Mobile code never receives provider secrets; it calls the assessment API.
- Zod validates environment, persistence, API request, and client response boundaries.
- Assessment requests are size-limited and rate-limited; public errors omit upstream details.
- Pino redacts authentication, cookie, API-key, password, and token fields.
- CI runs npm audit, dependency review, and CodeQL with commit-pinned actions.
- Container releases run as a non-root user and include provenance and an SBOM.

Never include production credentials or personal learner data in reports, logs, tests, screenshots, or fixtures.
