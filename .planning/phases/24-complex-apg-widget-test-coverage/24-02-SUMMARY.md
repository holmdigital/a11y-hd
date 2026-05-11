---
phase: 24-complex-apg-widget-test-coverage
plan: 02
subsystem: components-testing
tags: [testing, datepicker, wcag, apg-dialog-grid, no-throw-stub, D-01]
requires: [TI-04 helpers, TC-02 Button template, TC-06 RadioGroup template]
provides: [TC-10 acceptance criterion 2]
affects: [packages/components/src/DatePicker]
tech-stack:
  added: []
  patterns: [D-01 no-throw stub matrix, it.each parametrisation, native-input rationale JSDoc]
key-files:
  created:
    - packages/components/src/DatePicker/DatePicker.test.tsx
  modified: []
decisions:
  - "Tier-2 APG dialog-grid keystrokes implemented as no-throw stubs (D-01), not real keyboard assertions — source uses native <input type=date>, not a roving role=grid"
  - "Selected-date live-region tests OMITTED — deferred to TC-10-LIVE backlog (no <LiveRegion> in source)"
  - "WCAG 4.1.3 and 2.4.3 NOT claimed in header — they belong to TC-10-IMPL / TC-10-LIVE follow-ups"
metrics:
  duration: ~25 min
  completed: 2026-05-11
---

# Phase 24 Plan 02: DatePicker Test Suite (TC-10) Summary

DatePicker Tier 1 (real contract) + Tier 2 (D-01 no-throw stub for APG dialog-grid keystrokes) test suite pinned at 23 passing assertions; source is a native `<input type="date">` with no calendar grid, no custom keyboard handling, no LiveRegion — so Tier 2 stubs structural sanity (input still mounted, aria-invalid did not flip spuriously) per the Phase 22 RadioGroup pattern, ready to upgrade to real assertions when TC-10-IMPL lands in v0.7.

## What Shipped

**One file, atomic commit `37e3642`:**

`packages/components/src/DatePicker/DatePicker.test.tsx` (208 LOC, 23 passing tests, 0 failures)

### Test breakdown (final count: 23)

| Tier | it() block | Tests produced | What it pins |
|------|------------|----------------|--------------|
| 1 | `mounts and the input has type="date"` | 1 | Input role + type |
| 1 | `label is wired via htmlFor` | 1 | WCAG 1.3.1 label/control |
| 1 | `forwards ref to the underlying <input>` | 1 | useRef Probe pattern (Button.test.tsx parity) |
| 1 | `passes className through on the outer container` | 1 | Consumer-class survives |
| 1 | `description renders and its id appears in aria-describedby` | 1 | WCAG 1.3.1 description chain |
| 1 | `error renders with role="alert", aria-describedby, aria-invalid` | 1 | WCAG 4.1.2 error state |
| 1 | `arbitrary HTML attributes pass through` | 1 | min/max/name/data-* spread |
| 2 | `APG dialog-grid keystroke %s does not throw` (it.each) | 12 | D-01 stub matrix |
| 2 | `axe-clean for default render` | 1 | axe smoke |
| 2 | `axe-clean for error-state render` | 1 | axe under aria-invalid |
| 2 | `axe-clean for description-only render` | 1 | axe positive flow |
| 2 | `two <DatePicker> instances render with no duplicate ids` | 1 | useId() collision smoke |
| **Total** | **12 it blocks** | **23 tests** | |

### No-throw keystroke matrix (Tier 2, parametrised)

Exact keys exercised (in `it.each` order):
1. `{ArrowLeft}`
2. `{ArrowRight}`
3. `{ArrowUp}`
4. `{ArrowDown}`
5. `{Home}`
6. `{End}`
7. `{PageUp}`
8. `{PageDown}`
9. `{Shift>}{PageUp}{/Shift}` (Shift+PageUp — APG month↔year navigation)
10. `{Shift>}{PageDown}{/Shift}` (Shift+PageDown)
11. `{Enter}`
12. `{Escape}`

Per-key assertion shape:
- `await expect(user.keyboard(key)).resolves.not.toThrow()` — D-01 contract
- `expect(input).toBeInTheDocument()` — structural sanity
- `expect(input).toHaveAttribute('aria-invalid', 'false')` — no spurious error-state flip

## Verification

```
✓ src/DatePicker/DatePicker.test.tsx (23 tests) 1.24s
Test Files  1 passed (1)
     Tests  23 passed (23)
```

Done-criteria checks:
- `grep querySelector|configureAxe|toMatchSnapshot` → **0** (D-02a clean)
- `grep expectNoAxeViolations(` → **3** (default + error + description-only)
- `grep TC-10-IMPL|TC-10-LIVE` → **5** (header + body references)
- `grep not.toThrow|resolves.not.toThrow` → **1** (the parametrised it.each)
- WCAG-SC JSDoc header lists exactly 1.3.1, 2.1.1, 4.1.2 (NOT 4.1.3, NOT 2.4.3 — deliberate per plan)
- File mirrors Button.test.tsx structure (Tier-1 useRef Probe) + RadioGroup.test.tsx no-throw pattern (Tier-2 keystroke stubs)

## Deviations from Plan

### None (scope-wise)

Plan executed exactly as written. Test count landed at 23 (12 it() blocks expanded via it.each into 23 tests) — plan budgeted "10-12 it() blocks", actual is 12 it() blocks: 7 Tier-1 + 1 parametrised it.each + 4 Tier-2 single tests. Plan-spec "Tier 2 keyboard collapses to a single parametrised no-throw test" honoured.

### Environment defect (out of scope, NOT committed)

The worktree was documented as forked from master `2bc33c1` but the actual worktree HEAD on agent-a5fef62cf80214a22 was `5ce4646` — a different branch line that predates the Phase 22 test infrastructure (`_test/helpers.ts`, `_test/axe.ts`, `_test/setup.ts`, `vitest.config.ts`). Brought those four files into the worktree working copy via `git checkout master -- ...` so vitest could run; **deliberately did NOT stage or commit them** — they are pre-existing infrastructure from Phase 22 and are out of this plan's strict one-file scope.

Vitest binary was sourced from the main repo's `node_modules/.bin/vitest` because the worktree has no `node_modules`. Test execution happened against the worktree's `vitest.config.ts` (jsdom env, `_test/setup.ts` setup). No package.json modifications.

## Self-Check: PASSED

- `[X] FOUND: packages/components/src/DatePicker/DatePicker.test.tsx`
- `[X] FOUND commit 37e3642`: `test(24-02): add DatePicker Tier 1+2 suite (TC-10) — D-01 no-throw stub`
- `[X] 23/23 vitest assertions passing`
- `[X] All 6 must_haves.truths from PLAN frontmatter satisfied`
- `[X] All 7 done criteria satisfied`
