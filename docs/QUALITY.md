# Quality Strategy

## Required gates

Every push and pull request runs independent, blocking jobs for formatting, lint/file size, strict typechecking/Expo compatibility, tests/coverage, production build, and dependency audit. Build waits for all code-quality jobs.

| Signal       | Enforced policy                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| Formatting   | Prettier check across source and configuration                                |
| Lint         | ESLint errors and warnings fail CI                                            |
| Source size  | No non-test JS/TS source file over 500 lines                                  |
| Types        | Strict TypeScript with unchecked indexed access and exact optional properties |
| Expo         | `expo-doctor` validates SDK compatibility                                     |
| Tests        | Vitest must pass without network or credentials                               |
| Coverage     | Statements 90%, branches 85%, functions 90%, lines 90%                        |
| Build        | Expo must produce a production web export from HEAD                           |
| Dependencies | High and critical npm advisories fail CI                                      |

## Test design

The suite emphasizes business and trust boundaries:

- Progress: malformed persistence, immutability, idempotency, score bounds, and XP awards.
- Lessons: correct/wrong phase transitions, visible progress, XP penalty, and deterministic shuffling.
- Assessment: score bands, duplicate weak topics, URL validation, transport errors, response schemas, and timeouts.
- Server: configuration, request validation, body limits, rate limits, safe errors, provider/offline modes, health, metrics, logging, and correlation IDs.
- Catalogue: five unique levels with lessons and gate questions after modularization.

Generated coverage reports are uploaded for 14 days even if the CI test step fails. Thresholds live in `vitest.config.mts`, so documentation cannot silently overstate enforcement.

## Definition of done

A change is complete only when its behavior and failure modes are tested in the same commit, `npm run check` passes after `npm ci`, documentation reflects user-facing or operational changes, and no secret or generated output is added.
