Title: README: add Safety Contract section

## Background

The extension is safety-first and local-first, but the README should make the destructive-action contract explicit for users and contributors in both Chinese and English.

## Scope

Document the Phase 1 safety guarantees, local snapshot storage model, future hard-delete preconditions, and manifest permissions in README.md.

## Acceptance criteria

- Add section "Safety Contract" in README.md in both Chinese and English.
- Explain:
  - Phase 1 makes no destructive changes
  - snapshots live in IndexedDB and are local-only
  - future hard-delete flow will require a recent snapshot
  - permissions list and why each permission is needed

## Out of scope

- implementing the real-delete flow
