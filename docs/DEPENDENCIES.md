# Dependency Policy and Snapshot

Snapshot date: 2026-09-03.

The root manifest is the single npm workspace and explicitly declares 19 runtime and 15 development dependencies. `package-lock.json` locks the complete graph for `npm ci`; the Docker image and every CI job use that same lockfile.

## Runtime rationale

| Group           | Packages                                                          | Reason                                      |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| Expo runtime    | `expo`, React, React Native, navigation/safe-area/screen packages | Cross-platform mobile and web shell         |
| Device features | AsyncStorage, navigation bar, WebView, YouTube iframe             | Progress persistence and lesson media       |
| API             | Hono and Node adapter                                             | Small standards-based assessment boundary   |
| Validation      | Zod                                                               | Explicit untrusted-input schemas            |
| Observability   | Pino and Sentry Node                                              | Structured redacted logs and error tracking |

`babel-preset-expo` remains a runtime declaration because Expo's build process resolves it when bundling the application in deployment environments.

## Freshness review

`npm outdated` is reviewed during releases. Generic npm "latest" is not automatically correct for Expo packages: React, React Native, safe-area, screens, WebView, TypeScript, and Babel versions follow the compatibility matrix validated by `expo-doctor`. Major ESLint and Vitest upgrades remain separate reviewed changes because their plugin/config and coverage formats can be breaking.

Dependabot opens grouped weekly npm updates plus GitHub Actions and Docker updates. Each update must pass formatting, lint, types, Expo Doctor, tests/coverage, build, audit, dependency review, and CodeQL before merge.

## Security and reproducibility

- `npm audit --audit-level=high` blocks high and critical advisories in CI and releases.
- All GitHub Actions are pinned to immutable commit SHAs.
- The container base is pinned by tag and digest.
- Release images include provenance and a software bill of materials.
- Overrides are narrow, documented in `package.json`, and remove vulnerable transitive ranges without replacing application APIs.
