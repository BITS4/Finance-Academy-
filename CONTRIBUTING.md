# Contributing

Finance Academy uses small, test-paired changes so its history remains reviewable and reusable.

## Development workflow

1. Create an issue with a reproducible problem or measurable learner outcome.
2. Branch from an up-to-date `main` using `feat/`, `fix/`, `test/`, or `docs/`.
3. Keep one concern per commit. Include the implementation and the tests that prove it together.
4. Run `npm ci` and `npm run check` before opening a pull request.
5. Complete the pull-request template and link the issue.
6. Merge only after every required CI check passes and review comments are resolved.

Do not combine dependency upgrades, formatting, refactors, and product behavior in one commit. Keep ordinary feature commits near 200 changed lines when practical; split larger work into independently safe steps.

## Commit convention

Use Conventional Commits:

- `feat: add interview answer rubric`
- `fix: prevent duplicate gate XP`
- `test: cover malformed progress records`
- `refactor: isolate lesson phase policy`
- `docs: document offline assessment mode`
- `chore(deps): update Expo patch release`

Breaking changes use `!` and a `BREAKING CHANGE:` footer.

## Quality requirements

- No source file may exceed 500 lines; `npm run quality:files` enforces the rule.
- New domain and server behavior requires normal, boundary, and failure-path tests.
- Coverage cannot fall below 90% statements, 85% branches, 90% functions, or 90% lines.
- Tests must not access external networks or require credentials.
- API input must use explicit Zod schemas; persisted untrusted data must be validated before use.
- Never log credentials, complete prompts, or personal data.

## Dependency changes

`package.json` and `package-lock.json` are the dependency source of truth. Use `npm install` for intentional changes and commit both files together. Explain new runtime dependencies in the pull request. Dependabot covers npm, Actions, and Docker weekly; do not merge its pull requests until the full suite passes.

## Releases

Update `CHANGELOG.md` and the matching versions in `package.json` and `app.json`. Merge the release commit, create an annotated `vMAJOR.MINOR.PATCH` tag, and verify both Release and CodeQL workflows. Never rewrite or move a published release tag.
