# Architecture

## System context

Finance Academy is an offline-first Expo mobile application with one optional backend capability: AI-assisted interview feedback. Lessons, exams, progress calculation, and offline assessment do not depend on external services.

```mermaid
flowchart LR
  Learner --> App[Expo mobile/web app]
  App --> Store[Validated AsyncStorage adapter]
  App --> Domain[Pure progress and lesson policies]
  App -->|validated HTTPS| API[Hono assessment API]
  API --> Offline[Deterministic offline provider]
  API -->|only with server key| Anthropic[Anthropic API]
  API --> Logs[Pino structured logs]
  API --> Sentry[Sentry error events]
  Monitor --> Health[/health]
  Monitor --> Metrics[/metrics]
```

## Module boundaries

| Layer            | Responsibility                                        | Must not do                                   |
| ---------------- | ----------------------------------------------------- | --------------------------------------------- |
| `src/screens`    | Compose top-level mobile experiences                  | Calculate XP or call providers directly       |
| `src/components` | Render focused interaction flows                      | Own persistence or credentials                |
| `src/domain`     | Pure scoring, progress, lesson, and validation rules  | Import React Native or perform I/O            |
| `src/storage.js` | Translate AsyncStorage I/O to validated domain values | Reimplement domain rules                      |
| `src/services`   | Validate outbound/inbound API transport               | Contain provider credentials                  |
| `server`         | Validate public requests and own provider access      | Trust client values or expose upstream errors |

## Trust boundaries

1. Persisted values are untrusted because device storage can be corrupted or edited. `parseProgress` validates them before use and deletes invalid records.
2. API JSON is untrusted. A strict Zod object rejects missing, oversized, malformed, and unknown fields.
3. Provider JSON is untrusted. The server accepts only a non-empty text content block.
4. Server responses are untrusted to the app. The client validates both success and error shapes.
5. Forwarded IP and request IDs are operational metadata only; neither grants authorization.

## Reliability behavior

- Domain updates are immutable and idempotent: a lesson, interview, or passed gate awards XP once.
- Provider access has a 20-second abort deadline; mobile requests have a 15-second deadline.
- The API permits 20 assessment requests per address per minute and caps bodies at 20 KiB.
- Without a provider key, the server uses predictable local feedback rather than failing startup.
- Unexpected provider failures are logged with a correlation ID, captured by Sentry when configured, and mapped to a stable 503 response.

## Observability

Pino emits JSON fields for request ID, method, route, status, and duration. Redaction covers authorization, cookies, API keys, passwords, and tokens. `/metrics` exposes labelled request counts plus assessment count and total latency in Prometheus text format. `/health` verifies process readiness without leaking configuration.

## Architecture decisions

### ADR-001: Keep secrets behind a backend boundary

Expo public environment variables are part of the client bundle. Provider keys therefore live only in the Hono server process. The app retains a small compatibility wrapper, but it targets the proxy and never the provider.

### ADR-002: Test domain policy outside the React tree

XP, transition, score, and persistence validation rules are pure functions. UI components consume those functions. This makes failure paths deterministic and reduces fragile component mocking while keeping the presentation layer thin.

### ADR-003: Treat content catalogues as modules

Each level is a separate sub-500-line module composed by `src/data/levels.js`. The same 500-line ceiling is checked by ESLint and a dedicated repository policy script.
