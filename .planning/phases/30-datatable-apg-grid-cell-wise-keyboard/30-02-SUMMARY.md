---
phase: 30-datatable-apg-grid-cell-wise-keyboard
plan: 02
subsystem: components/DataTable
tags: [datatable, apg, grid, keyboard, roving-tabindex, wcag-2.1.1, a11y-bugfix, tab-stop, tc-12-impl]

requires:
  - phase: 30-01
    provides: "DataTable APG grid keyboard contract + roving tabindex; the inner sort button surface that needed the tabIndex={-1} fix"

provides:
  - "DataTable APG grid single-tab-stop contract: sort button carries tabIndex={-1}, roving anchor is the only document Tab stop"
  - "@holmdigital/components 2.7.3 (PATCH — a11y bug fix, no API change)"
  - "Regression test coverage: every sort button tabindex=-1 assertion + userEvent.tab() sequence test (input -> grid anchor -> exits grid)"
  - "Dated supersession notes on 30-CONTEXT.md D-02, D-05, and line-115 Patterns (history preserved)"

affects:
  - "packages/components/src/DataTable/DataTable.tsx"
  - "packages/components/src/DataTable/DataTable.test.tsx"
  - "packages/components/package.json"
  - "packages/components/CHANGELOG.md"
  - ".planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md"

tech-stack:
  added: []
  patterns:
    - "Gap-closure pass: tabIndex={-1} on nested interactive widget inside grid cell removes it from page Tab sequence while keeping it reachable via grid nav + mouse (W3C APG Grid pattern)"
    - "Regression test pattern: userEvent.tab() walking before-grid / grid-anchor / after-grid proves single-stop contract; complements programmatic .focus() tests that are structurally blind to tab-order"

key-files:
  created:
    - ".planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-02-SUMMARY.md"
  modified:
    - "packages/components/src/DataTable/DataTable.tsx"
    - "packages/components/src/DataTable/DataTable.test.tsx"
    - "packages/components/package.json"
    - "packages/components/CHANGELOG.md"
    - ".planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md"

key-decisions:
  - "PATCH bump (2.7.2 -> 2.7.3): a11y regression fix with zero API change — DataTableProps interface byte-identical, no new prop"
  - "tabIndex={-1} as first prop after type='button': the only source change; all existing getByRole('button') queries and programmatic .focus() tests remain green"
  - "History-preserving supersession: original D-02/D-05 text kept intact, dated SUPERSEDED note appended inline — provides audit trail without rewriting decisions"
  - "TDD ordering: plan placed Task 1 (fix) before Task 2 (tests); tests written after fix, pass GREEN immediately — authoritative plan ordering followed"

requirements-completed: [TC-12-IMPL]

duration: ~15 min
completed: 2026-06-12
---

# Phase 30 Plan 02: DataTable APG Grid Gap Closure Summary

**DataTable sort button receives `tabIndex={-1}` to restore the APG single-Tab-stop contract, closed with two regression tests (per-button tabindex assertion + userEvent.tab() sequence), CHANGELOG and patch version bump to 2.7.3.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-12T14:45:00Z
- **Completed:** 2026-06-12T14:58:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- One-line source fix: `tabIndex={-1}` on the inner sort `<button>` in `DataTable.tsx` removes it from the page Tab sequence — the grid is now a single Tab stop (the roving anchor), closing UAT Test 1 (severity: major)
- Two new regression tests in the `Tier 2: Single Tab Stop` describe block close the test blind spot that let this ship: Test A asserts every sort button has `tabindex="-1"`; Test B uses `user.tab()` to prove the sequence input -> Name-header roving anchor -> after-grid button (no inner button stop)
- Stale doc comments in `DataTable.tsx` and `DataTable.test.tsx` corrected; 30-CONTEXT.md D-02, D-05, and the line-115 Patterns entry carry dated SUPERSEDED notes with rationale (original text preserved for audit trail)
- `npm run verify -w @holmdigital/components` exits 0: build, lint (zero warnings), typecheck, publint --strict, attw, and the full test:ci suite (now 636 tests / 36 files, incl. 35 DataTable tests) all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: tabIndex={-1} fix + CONTEXT supersession** - `3ffd468` (fix)
2. **Task 2: regression tests + file JSDoc correction** - `6bf90fb` (test)
3. **Task 3: version bump 2.7.3 + CHANGELOG entry** - `e97a9fb` (chore)

**Plan metadata:** (docs commit — see final metadata commit)

## Files Created/Modified

- `packages/components/src/DataTable/DataTable.tsx` - Added `tabIndex={-1}` to inner sort `<button>`; corrected JSDoc (button is NOT in page Tab order; Enter/Space sort delegated via D-03)
- `packages/components/src/DataTable/DataTable.test.tsx` - New `Tier 2: Single Tab Stop` describe block (Test A + Test B); corrected file JSDoc header
- `packages/components/package.json` - Version 2.7.2 -> 2.7.3 (patch bump)
- `packages/components/CHANGELOG.md` - New `## 2.7.3 / ### Patch Changes` entry at top
- `.planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md` - Dated SUPERSEDED notes on D-02 (line 57 bullet), D-05 (first bullet), and line-115 Patterns; original text preserved

## Decisions Made

- PATCH bump (2.7.2 -> 2.7.3): bug fix, no public API surface change — `DataTableProps` and `Column` interfaces byte-identical
- `tabIndex={-1}` as first explicit prop after `type="button"`: safe because programmatic `.focus()` works on tabindex=-1 elements (all existing sort-button tests keep their `.focus()` calls and stay green); `getByRole('button', { name: /.../ })` queries still find the button (role + accessible name unchanged)
- History-preserving supersession over deletion: original D-02/D-05 wording preserved, SUPERSEDED notes appended inline — provides full audit trail for why the spec changed
- Task ordering as specified by plan: fix (Task 1) before tests (Task 2) — tests written after fix already in place, go GREEN immediately; plan notes this explicitly

## Deviations from Plan

None — plan executed exactly as written. The task ordering note ("source fix from Task 1 will already be in place, so the new tests should pass GREEN immediately") was followed correctly.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 30 is now complete (2/2 plans: 30-01 shipped the APG grid keyboard contract; 30-02 closed the single UAT gap). TC-12-IMPL is fully closed.

The components package is at 2.7.3 with a clean verify chain (636 tests, 36 files, zero lint warnings). Ready for Phase 31+ or the next milestone step.

---
*Phase: 30-datatable-apg-grid-cell-wise-keyboard*
*Completed: 2026-06-12*

## Self-Check: PASSED

- FOUND: packages/components/src/DataTable/DataTable.tsx (modified — tabIndex={-1} on sort button)
- FOUND: packages/components/src/DataTable/DataTable.test.tsx (modified — 35 tests, 2 new)
- FOUND: packages/components/package.json (version 2.7.3)
- FOUND: packages/components/CHANGELOG.md (## 2.7.3 entry at top)
- FOUND: .planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md (3 SUPERSEDED notes)
- FOUND: commit 3ffd468 (fix — Task 1)
- FOUND: commit 6bf90fb (test — Task 2)
- FOUND: commit e97a9fb (chore — Task 3)
- npm run verify -w @holmdigital/components → EXIT=0
- 636 tests pass across 36 files; DataTable: 35 tests, 0 failures, 0 skipped
- grep -c "user.tab()" DataTable.test.tsx → 2 (was 0 before this plan)
- grep -c "SUPERSEDED 2026-06-12" 30-CONTEXT.md → 3
