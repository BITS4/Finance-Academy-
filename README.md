# Finance Academy

[![CI](https://github.com/BITS4/Finance-Academy-/actions/workflows/ci.yml/badge.svg)](https://github.com/BITS4/Finance-Academy-/actions/workflows/ci.yml)
[![CodeQL](https://github.com/BITS4/Finance-Academy-/actions/workflows/codeql.yml/badge.svg)](https://github.com/BITS4/Finance-Academy-/actions/workflows/codeql.yml)

Finance Academy is a production-oriented **Expo/React Native mobile application with a small Hono backend API**. It is not an infrastructure-as-code project or a starter template. The Russian-language learning experience takes a learner through five practical finance levels—from accounting fundamentals to investment-banking interviews—with lessons, simulations, exams, progress persistence, and XP.

The repository is self-contained for development and automated testing. Provider credentials are optional: without an Anthropic key, the API uses deterministic offline feedback, so a fresh clone, CI, and Docker never depend on a paid external account.

## What is included

- Five career-simulation levels with lesson, interview, and gate-exam flows.
- Immutable, validated progress rules for lessons, exams, interviews, and XP.
- Expo targets for Android, iOS, and web.
- A credential-safe assessment proxy with Zod boundary validation and rate limiting.
- Pino structured logs, Sentry error reporting, `/health`, and Prometheus `/metrics`.
- 90% line/statement/function and 85% branch coverage gates.
- Pinned, reproducible npm and Docker builds with CI, CodeQL, audits, and releases.

## Requirements

- Node.js 22.13 or newer (CI and containers use Node 24.16.0).
- npm 10 or newer.
- Expo Go, an Android emulator, or an iOS simulator for native development.
- Docker with Compose only if you prefer the containerized API.

No Firebase, database, provider credential, or cloud account is required for tests.

## Fresh-clone setup

```bash
git clone https://github.com/BITS4/Finance-Academy-.git
cd Finance-Academy-
npm ci
cp .env.example .env
```

Start the API in one terminal and Expo in another:

```bash
npm run server:dev
npm start
```

The app reads `EXPO_PUBLIC_AI_PROXY_URL`. For a physical phone, replace `localhost` with the development computer's LAN address. The rest of the learning experience works locally regardless of provider availability.

## Build and test

The complete buyer/reviewer check is one command:

```bash
npm run check
```

It blocks on formatting, ESLint, the 500-line source limit, strict TypeScript, Expo dependency compatibility, tests with numeric coverage thresholds, a production web export, and high/critical dependency advisories.

Useful focused commands:

| Command              | Purpose                                |
| -------------------- | -------------------------------------- |
| `npm run lint`       | ESLint with zero warnings allowed      |
| `npm run typecheck`  | Strict TypeScript validation           |
| `npm test`           | Vitest suite plus enforced V8 coverage |
| `npm run test:unit`  | Fast tests without coverage reporting  |
| `npm run expo:check` | Expo SDK and dependency compatibility  |
| `npm run build`      | Production Expo web export to `dist/`  |
| `npm run audit`      | Block high/critical npm advisories     |

Current local baseline: 66 tests; 99% statements, 95% branches, 96% functions, and 99% lines across the testable domain, client-service, and server layers. CI applies the committed thresholds rather than relying on this documented snapshot.

## Docker

The API starts without secrets and reports healthy from a clean checkout:

```bash
docker compose up --build --wait
curl http://localhost:8787/health
curl http://localhost:8787/metrics
```

The image runs as the unprivileged `node` user, pins the base image by digest, exposes only port 8787, and includes a container healthcheck. Stop it with `docker compose down`.

## Architecture

```text
App.js                         navigation and modal composition
src/screens/                  page-level mobile experiences
src/components/               focused presentation and interaction components
src/components/lesson/        extracted lesson phases, outcomes, and styles
src/domain/                   pure progress, assessment, and lesson rules
src/services/                 validated outbound client boundaries
src/data/levels/              one bounded module per learning level
src/storage.js                AsyncStorage adapter around pure progress rules
server/app.ts                 Hono routes, middleware, validation, and errors
server/assessment.ts          offline/Anthropic provider abstraction
server/logger.ts              redacted structured logging
server/metrics.ts             Prometheus-compatible operational counters
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for trust boundaries and decision records, and [docs/API.md](docs/API.md) for endpoint contracts.

## API

`POST /v1/assessment` accepts a strict JSON object:

```json
{
  "system": "You are a finance interview coach.",
  "prompt": "Review this structured interview answer."
}
```

Successful responses contain assessment text and a correlation ID. Validation, rate-limit, and provider failures return stable error codes without upstream details. Request bodies are limited to 20 KiB.

## Environment

| Variable                    | Required    | Description                                                  |
| --------------------------- | ----------- | ------------------------------------------------------------ |
| `EXPO_PUBLIC_AI_PROXY_URL`  | Mobile only | Public URL of this repository's API; never a provider key    |
| `ANTHROPIC_API_KEY`         | No          | Server-only credential; offline provider is used when absent |
| `ANTHROPIC_MODEL`           | No          | Server-side model identifier                                 |
| `ALLOWED_ORIGINS`           | No          | Comma-separated API CORS allowlist                           |
| `PORT`                      | No          | API port, default `8787`                                     |
| `NODE_ENV`                  | No          | `development`, `test`, or `production`                       |
| `LOG_LEVEL`                 | No          | Pino log level                                               |
| `SENTRY_DSN`                | No          | Server error-reporting DSN                                   |
| `SENTRY_TRACES_SAMPLE_RATE` | No          | Number from 0 to 1                                           |

Copy `.env.example`; never commit `.env`. Only variables prefixed `EXPO_PUBLIC_` enter the mobile bundle, so secrets must remain server-side.

## CI, security, and releases

Every push and pull request runs separate, blocking format, lint, typecheck/Expo, test/coverage, build, and dependency-audit jobs. Pull requests also receive dependency review. CodeQL analyzes JavaScript and TypeScript on pushes, pull requests, and a weekly schedule. All third-party actions are pinned to immutable SHAs.

Version tags matching `vX.Y.Z` rerun the complete quality pipeline and publish an immutable GHCR API image with provenance and an SBOM. Release notes live in [CHANGELOG.md](CHANGELOG.md). Vulnerabilities follow [SECURITY.md](SECURITY.md), not public issue disclosure.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Keep each feature or fix focused, include its tests in the same commit, use Conventional Commits, and do not mix behavioral work with bulk formatting. This makes every change independently reviewable and reversible.

## License

Copyright BITS4. No open-source license is granted unless a future release explicitly adds one.
