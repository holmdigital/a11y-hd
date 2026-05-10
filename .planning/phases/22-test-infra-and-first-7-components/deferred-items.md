# Phase 22 — Deferred Items

Issues discovered during execution that are out of scope for the current plan and deferred for follow-up work.

## Discovered during 22-01 execution (2026-05-10)

### TS2503: Cannot find namespace 'NodeJS' in LiveRegion.tsx

- **File:** `packages/components/src/LiveRegion/LiveRegion.tsx:37`
- **Status:** Pre-existing — reproduces on the parent commit before any 22-01 changes.
- **Cause:** Reference to `NodeJS.Timeout` (or similar) without `@types/node` available in the components package's type roots. The new `compilerOptions.types` array in this plan replaces the implicit default (which previously included `node` if it was hoisted), surfacing the latent gap.
- **Why deferred:** Out of scope for 22-01 (test-infra wiring). Existing test suite (`npm run test:ci -w @holmdigital/components`) is green — vitest uses its own pipeline so this error does not block downstream Wave 2 plans. Should be fixed by either adding `"node"` to the `compilerOptions.types` array or using `ReturnType<typeof setTimeout>` in LiveRegion.tsx.
- **Suggested fix plan:** Address in 22-09 (final hygiene) or roll into Phase 26 (publish hardening).
