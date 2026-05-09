# Phase 1.5 Backlog

Phase 1.5 is a docs-first backlog for hardening the extension before implementing the next product changes. It captures CI, smoke testing, README safety documentation, logger cleanup, and task UI refresh work as implementation-ready specs without changing runtime code in this PR.

## Specs

- [CI: run npm test and npm run validate:manifest on push & PR](01-ci.md)
- [E2E smoke: Playwright loads unpacked extension, asserts popup renders and dashboard opens](02-e2e-smoke.md)
- [README: add Safety Contract section](03-readme-safety-contract.md)
- [Logger: introduce level-based logger and replace ad-hoc console calls](04-logger-levels.md)
- [Auto-refresh task UI after restoreTaskProgress](05-task-ui-refresh.md)
