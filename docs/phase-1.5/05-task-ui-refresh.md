Title: Auto-refresh task UI after restoreTaskProgress

## Background

After a service-worker restart, the Health page does not reflect restored tasks until the user manually refreshes.

## Scope

Broadcast task restoration completion from the background task manager and refresh the Health route task list when the dashboard receives the message.

## Acceptance criteria

- On `TaskManager.restoreTaskProgress` completion, broadcast a runtime message `tasks.restored`.
- Health route subscribes to `tasks.restored`.
- Health route re-renders task list on receipt.
- Add unit test that simulates restore and asserts one broadcast was sent.

## Out of scope

- paused/resumed task transitions
