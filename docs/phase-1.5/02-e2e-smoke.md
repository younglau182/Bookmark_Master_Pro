Title: E2E smoke: Playwright loads unpacked extension, asserts popup renders and dashboard opens

## Background

Unit tests cover core modules, but the extension still needs a minimal browser smoke test to prove the unpacked Manifest V3 extension can load, render the popup, and navigate into the dashboard.

## Scope

Introduce a Playwright-based smoke test that launches Chromium with the unpacked extension and verifies the main user entry points render.

## Acceptance criteria

- Add Playwright project with Chromium and extension launch flag.
- One test:
  - load unpacked extension
  - open popup
  - assert version and stats slot render
  - click "Open Dashboard"
  - assert dashboard tab loads
  - assert safety route is reachable
- Runs in CI, depending on 01-ci.

## Out of scope

- business-logic E2E for dedup, snapshots, health checks, restore, or deletes
