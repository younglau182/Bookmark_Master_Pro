Title: Logger: introduce level-based logger and replace ad-hoc console calls

## Background

Ad-hoc console calls make runtime output noisy and difficult to filter. A level-based logger gives contributors a single logging contract while keeping the default extension output concise.

## Scope

Introduce level-threshold filtering in the shared logger and migrate existing direct console usage in runtime modules to the logger API.

## Acceptance criteria

- `lib/logger.js` exposes `debug`/`info`/`warn`/`error`.
- logger has a level threshold read from a constant.
- default level is `"info"`.
- replace existing `console.log` / `console.error` in `background/`, `lib/`, `dashboard/` with `logger.*`.
- add a unit test asserting level filtering.

## Out of scope

- remote log shipping
- log persistence
