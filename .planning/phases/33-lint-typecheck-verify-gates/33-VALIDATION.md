---
phase: 33
slug: lint-typecheck-verify-gates
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-12
audited: 2026-06-12
reconstructed: true
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **Reconstructed retroactively** (2026-06-12) from 33-01..33-04 PLAN/SUMMARY files via /gsd-validate-phase — the phase executed 2026-05-12 without a VALIDATION.md.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.16 (standards package: no vitest.config — defaults, explicit `import { describe, it, expect } from 'vitest'`) |
| **Config file** | none for standards; `packages/engine/vitest.config.ts` + `packages/components/vitest.config.ts` for their suites |
| **Quick run command** | `npm run test:ci -w @holmdigital/standards -- publish-gates` |
| **Full suite command** | `npm run verify -w @holmdigital/standards && npm run verify -w @holmdigital/components && npm run verify -w @holmdigital/engine` |
| **Estimated runtime** | ~1 s (publish-gates guard) / ~4 s (standards test:ci, 85 tests) / ~3–4 min (3× full verify) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:ci -w @holmdigital/standards -- publish-gates`
- **After every plan wave:** Run the affected package's `npm run verify`
- **Before `/gsd-verify-work`:** All three `npm run verify` must exit 0
- **Max feedback latency:** ~45 seconds (components verify is the longest single-package gate)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | PUB-09 | — | N/A (publish-pipeline hygiene; no auth surface) | guard | `npm run test:ci -w @holmdigital/standards -- publish-gates` | ✅ | ✅ green |
| 33-02-01 | 02 | 1 | PUB-09 | — | N/A | gate | `npm run lint -w @holmdigital/engine` | ✅ | ✅ green |
| 33-02-02 | 02 | 1 | PUB-09 | — | N/A | guard | `npm run test:ci -w @holmdigital/standards -- publish-gates` | ✅ | ✅ green |
| 33-03-01 | 03 | 1 | PUB-09 | — | N/A | gate + guard | `npm run typecheck -w @holmdigital/components && npm run lint -w @holmdigital/components` + publish-gates guard | ✅ | ✅ green |
| 33-04-01 | 04 | 2 | PUB-09 | — | N/A | full | `npm run verify -w @holmdigital/standards && npm run verify -w @holmdigital/components && npm run verify -w @holmdigital/engine` | ✅ | ✅ green |
| 33-04-02 | 04 | 2 | PUB-09 | — | N/A | guard | `npm run test:ci -w @holmdigital/standards -- publish-gates` (CHANGELOG durable-history block) | ✅ | ✅ green |
| 33-04-03 | 04 | 2 | PUB-09 | — | N/A | docs | `grep -c "Phase 33" .planning/ROADMAP.md && grep -c "PUB-09" .planning/STATE.md` | ✅ | ✅ green |
| 33-04-04 | 04 | 2 | PUB-09 | — | N/A | manual | — (human-verify checkpoint) | — | ✅ approved 2026-05-12 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Notes:

- **gate** = the lint/typecheck pipeline delivered by this phase is itself the persistent verifier: eslint (`no-undef`, `@typescript-eslint/ban-ts-comment`) re-fails any regression of the engine fixes (`/* global __ENGINE_VERSION__ */`, `@ts-expect-error`); `tsc --noEmit` re-fails any regression of the 27 components tsc fixes.
- **guard** = `packages/standards/src/publish-gates.test.ts` (added retroactively 2026-06-12) — 13 assertions: per-package `typecheck === 'tsc --noEmit'`; `verify` contains the literal ordered substring `npm run build && npm run lint && npm run typecheck && npm run check:exports && npm run check:types && npm run test:ci`; `prepublishOnly === 'npm run verify'` byte-equal (SC#5); components `@types/node` ^22 (Route A1); and the three PUB-09 CHANGELOG sections (standards `## 2.5.2` / components `## 2.6.1` / engine `## 2.5.3` — durable history). Current package versions are intentionally NOT asserted; they have legitimately moved on (standards 2.6.1 / components 2.7.2 / engine 2.5.6 at audit time).
- The guard runs inside standards `test:ci` → `verify` → `prepublishOnly`, so the drift check itself executes on every standards verify and publish.

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* The phase's deliverable IS verification machinery (lint + typecheck publish gates); the only missing piece was a persistent wiring guard, filled retroactively by `publish-gates.test.ts`. No new framework or config needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real `npm publish` gating end-to-end (`prepublishOnly` firing under npm's publish lifecycle, registry auth, provenance) | PUB-09 (SC#5) | `npm publish --dry-run` has a known attw stdio flake (DRY-RUN-FIX, deferred to v0.8); the actual lifecycle is only observable during a real publish | Before each release run `npm publish -w @holmdigital/<pkg> --dry-run`; expect `prepublishOnly` → `verify` → exit 0. If attw exits 3 under dry-run stdio while direct `npm run verify` passes, that is the documented DRY-RUN-FIX flake — not a gate failure. |
| Phase 33 closure sign-off (Task 33-04-04 checkpoint) | PUB-09 | Human gate by design | Completed — user signaled "approved" 2026-05-12. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none remain — guard test fills the only gap)
- [x] No watch-mode flags
- [x] Feedback latency < 45 s (quick guard ~1 s; single-package verify ≤ ~45 s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** reconstructed and approved 2026-06-12 (retroactive Nyquist audit; execution completed 2026-05-12)

---

## Validation Audit 2026-06-12

| Metric | Count |
|--------|-------|
| Gaps found | 4 |
| Resolved | 4 |
| Escalated | 0 |

State B reconstruction (no VALIDATION.md existed). PUB-09 wiring verified intact at HEAD one month after execution (standards 2.6.1 / components 2.7.2 / engine 2.5.6): all three verify chains still carry the literal gate order, all three `prepublishOnly` byte-equal `npm run verify`, engine lint fixes in place at `regulatory-scanner.ts:29` and `:186`. Gaps: the package.json wiring (33-01-01, 33-02-02, 33-03-01 wiring half) and the PUB-09 CHANGELOG entries (33-04-02) had only one-off `node -e` verification at execution time — nothing would fail on drift. Filled with `packages/standards/src/publish-gates.test.ts`: 13 tests, green on first run; standards suite now 85/85 (72 pre-existing + 13 new) in ~0.9 s; standards lint + typecheck remain 0-error/0-warning. Engine lint fixes (33-02-01) and components tsc fixes (33-03-01 fix half) are self-guarding via the now-gated pipelines. Two manual-only items documented (real-publish lifecycle incl. DRY-RUN-FIX flake; human closure checkpoint, approved 2026-05-12).
