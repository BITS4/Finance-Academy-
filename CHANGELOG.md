# Changelog

Notable changes follow Keep a Changelog and Semantic Versioning.

## [1.1.0] - 2026-09-03

### Added

- Credential-safe Hono assessment API with offline mode, rate limiting, health, metrics, Pino, and Sentry.
- Strict Zod schemas at environment, persisted-progress, client-response, and API-request boundaries.
- Vitest coverage suite with explicit 90% statement/line/function and 85% branch gates.
- Blocking CI jobs, CodeQL, dependency review, Dependabot, Docker Compose, and tagged container releases.
- Contributor, security, architecture, quality, API, dependency, and operations documentation.

### Changed

- Upgraded to Expo SDK 57, React Native 0.86, React 19.2, and React Navigation 7.
- Split the 1,700-line level catalogue into one module per level.
- Split the 800-line lesson modal into focused flow, consequence, phase, and style modules.
- Extracted immutable progress, scoring, lesson-flow, and XP rules from UI/storage code.
- Enforced ESLint, Prettier, strict TypeScript, and a 500-line source-file ceiling.

### Security

- Removed the provider credential placeholder and direct Anthropic call from the mobile bundle.
- Added redaction, request-size validation, safe public errors, rate limiting, and high-severity audit gates.

## [1.0.0] - 2026-04-24

### Added

- Initial Finance Academy Expo application and five-level finance curriculum.

[1.1.0]: https://github.com/BITS4/Finance-Academy-/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/BITS4/Finance-Academy-/commit/3a258ee
