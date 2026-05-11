# Phase 22 — Deferred Items

Issues discovered during execution that are out of scope for the current plan and deferred for follow-up work.

## Resolved

### TS2503: Cannot find namespace 'NodeJS' in LiveRegion.tsx — RESOLVED 2026-05-11

- **File:** `packages/components/src/LiveRegion/LiveRegion.tsx:37`
- **Resolved by:** Phase 26 Plan 01 (D-01) on 2026-05-11
- **Fix:** Replaced `useRef<NodeJS.Timeout>()` with `useRef<ReturnType<typeof setTimeout>>()`. No `@types/node` added; tsup DTS build now succeeds end-to-end. 5 LiveRegion tests and 439 total component tests stay green.
