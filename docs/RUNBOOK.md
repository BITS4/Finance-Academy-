# API Operations Runbook

## Readiness

`GET /health` must return HTTP 200 and `{ "status": "ok" }`. Container and Compose healthchecks poll this endpoint. `GET /metrics` must return Prometheus text with request and assessment counters.

## Common incidents

### API will not start

1. Read the structured startup error.
2. Validate `PORT`, `ALLOWED_ORIGINS`, and Sentry sample rate against `.env.example`.
3. Blank optional secrets are allowed; malformed non-blank values are rejected intentionally.
4. Reproduce with the same immutable release image and `NODE_ENV=production`.

### Assessment returns 503

1. Find `assessment failed` by `requestId` in Pino logs and Sentry.
2. Check provider status, outbound network access, model name, and server-held credential validity.
3. Remove `ANTHROPIC_API_KEY` to confirm deterministic offline mode and restore core availability.
4. Never paste the key or complete learner prompt into an issue or log.

### Assessment returns 429

Honor `retry-after`. Sustained volume from one source may be abuse or a shared network. Change limits only with tests and monitoring evidence; do not bypass the boundary in the client.

### Metrics endpoint is exposed publicly

Restrict it at the load balancer or private network. The endpoint contains aggregate operational labels but should not be internet-facing by default.

## Release and rollback

1. Confirm CI and CodeQL are green on the release commit.
2. Update versions and `CHANGELOG.md`, then create an annotated SemVer tag.
3. The Release workflow repeats `npm run check` before publishing a tagged and `latest` GHCR image with provenance and SBOM.
4. Roll back by deploying the preceding immutable SemVer image. Do not move or overwrite tags.

## Data and secrets

The API has no database and stores no learner records. Progress remains in device AsyncStorage. Rotate a provider key through the deployment secret manager; it must never enter Expo public variables, Git history, screenshots, or support artifacts.
