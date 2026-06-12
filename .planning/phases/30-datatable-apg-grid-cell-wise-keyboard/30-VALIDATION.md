---
phase: 30
slug: datatable-apg-grid-cell-wise-keyboard
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-12
audited: 2026-06-12
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x + @testing-library/react + @testing-library/user-event + jsdom |
| **Config file** | `packages/components/vitest.config.ts` |
| **Quick run command** | `npm run test -w @holmdigital/components -- DataTable` |
| **Full suite command** | `npm run verify -w @holmdigital/components` |
| **Estimated runtime** | ~6 seconds (DataTable only) / ~30 seconds (full components suite) |

---

## Sampling Rate

- **After every task commit:** Run quick command (DataTable file only)
- **After every plan wave:** Run full `npm run verify -w @holmdigital/components`
- **Before `/gsd-verify-work`:** Full suite must be green AND axe-clean smoke must pass under jsdom
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | TC-12-IMPL | — | N/A (focus management, no auth surface) | unit | `npm run test -w @holmdigital/components -- DataTable` | ✅ | ✅ green |
| 30-01-02 | 01 | 1 | TC-12-IMPL | — | N/A | unit | `npm run test -w @holmdigital/components -- DataTable` | ✅ | ✅ green |
| 30-01-03 | 01 | 2 | TC-12-IMPL | — | N/A | unit | `npm run test -w @holmdigital/components -- DataTable` | ✅ | ✅ green |
| 30-01-04 | 01 | 2 | TC-12-IMPL | — | N/A | unit | `npm run test -w @holmdigital/components -- DataTable` | ✅ | ✅ green |
| 30-01-05 | 01 | 3 | TC-12-IMPL | — | N/A | full | `npm run verify -w @holmdigital/components` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* Vitest + jsdom + @testing-library/user-event + axe-helper (`expectNoAxeViolations`) are already proven on Phases 22–29. No new test infra needed.

The 9 existing no-throw stubs at `packages/components/src/DataTable/DataTable.test.tsx:219-250` already exist as failing scaffolds awaiting real assertions — these convert during Wave 2 of Plan 01, not Wave 0.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screen-reader announcement of focused cell coordinates | TC-12-IMPL | NVDA/VoiceOver announcement strings are not jsdom-observable | Render DataTable in real browser with NVDA active; Tab to grid; Arrow through cells; verify each cell content + column header are announced. Out of automated scope. |

All other phase behaviors (roving tabindex, focus movement, axe-clean) have automated verification.

---

## Observable Test Signals

Three signals cover every required behavior under jsdom — the planner / executor must use these (and only these):

1. **`toHaveFocus()`** — DOM focus state (verifiable via `document.activeElement`)
2. **`getAttribute('tabindex')`** — `"0"` on active cell, `"-1"` on all others (roving invariant)
3. **`getAttribute('data-state')`** — `"focused"` on the active cell (CSS hook + test handle)

No `querySelector`, `configureAxe`, or `toMatchSnapshot` (D-02a anti-pattern gate from Phase 24).

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none — existing infra sufficient)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-12

---

## Validation Audit 2026-06-12

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 5 tasks COVERED at HEAD (components 2.7.2, post-Phase-34): `DataTable.test.tsx` runs 33/33 green
(5 Tier 1 + 11 sortable-header/Tier 2 + 17 APG keyboard), full `npm run verify -w @holmdigital/components`
exits 0, D-02a anti-pattern gate clean (0 `fireEvent` / `querySelector` / `configureAxe` / `toMatchSnapshot`;
15 `toHaveFocus|tabIndex` assertions; 0 `it.each`; `LARGE_DATA` fixture present ×3). Per-Task Map statuses
flipped pending → green; no new tests required. Screen-reader announcement remains the sole manual-only item.
