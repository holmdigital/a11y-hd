---
phase: 24-complex-apg-widget-test-coverage
plan: 04
subsystem: components
tags: [test, a11y, apg, datatable, wcag-2.1, partial-stub, tc-12]
requires: [TC-12]
provides: [DataTable.test.tsx]
affects: [packages/components]
tech_stack:
  added: []
  patterns:
    - "Partial-stub strategy (D-01): real assertions for implemented APG surface, no-throw stubs for unimplemented surface"
    - "fireEvent.keyDown escape hatch (RESEARCH §5) for non-focusable <td> elements"
    - "Anchored regex on accessible name (/^Name$/) to prove aria-hidden indicators are excluded from AT"
key_files:
  created:
    - packages/components/src/DataTable/DataTable.test.tsx
  modified: []
decisions:
  - "Used .each parametrization for the 8 single-key cell-arrow no-throw stubs — produces 8 individual it() entries (total 25 tests vs plan estimate 11-14). Each row is independently named and reportable, so the higher count is reporting granularity, not scope creep."
  - "Tested aria-hidden on the sort-indicator glyph via the anchored accessible-name regex /^Name$/ — strictly proves the ▲/▼/↕ glyph is excluded from the button's accessible name without using querySelector (which D-02a forbids)."
metrics:
  duration_minutes: ~12
  completed: 2026-05-11
---

# Phase 24 Plan 04: DataTable Test Suite (TC-12) Summary

One-liner: Added Tier-1 + Tier-2 Vitest coverage for `DataTable` pinning the
strong sortable-header APG contract (aria-sort cycling + Enter/Space on a
native <button>) and using a `fireEvent.keyDown` no-throw stub to document the
unimplemented cell-arrow grid surface against the TC-12-IMPL backlog.

## What Shipped

**Single file:** `packages/components/src/DataTable/DataTable.test.tsx` (281 lines, 25 tests).

### Tier 1: Table Stakes (5 tests)
- `<table>` mounts with `caption` as its accessible name
- 3 `<th scope="col">` columnheaders (length + per-header `scope` assertion)
- Row count: header row + N data rows = `data.length + 1`
- Default `String(row[accessor])` rendering AND custom `column.render()` override
- `className` flows through to outer wrapper `<div>`, NOT the `<table>`

### Tier 2: A11y Differentiators (20 tests)
- Sortable column header is a real `<button>` reachable by accessible name
- Non-sortable column header is plain text (no button)
- `aria-sort` lifecycle: absent → `"ascending"` → `"descending"` on repeat clicks
- Switching sort to a different column resets to `"ascending"` AND clears `aria-sort` on the previous column
- Data rows visibly reorder on ascending/descending sort
- Enter on focused sort button fires the transition (WCAG 2.1.1, native button)
- Space on focused sort button fires the transition (D-02a paired keyboard)
- **No-throw stubs (10 tests via `.each` + 1 combined Ctrl):** ArrowUp/Down/Left/Right, Home, End, PageUp, PageDown, Ctrl+Home, Ctrl+End — all use `fireEvent.keyDown` (RESEARCH §5 escape hatch, inline-commented) because `<td>` is non-focusable
- Sort indicator glyph hidden from AT: proven via anchored `getByRole('button', { name: /^Name$/ })` (would fail if glyph leaked into accessible name)
- axe-clean for default render
- axe-clean for sorted render

## Cell-Arrow Keystrokes in the No-Throw Stub

| Keystroke   | Mechanism       | Reason for stub                        |
| ----------- | --------------- | -------------------------------------- |
| ArrowDown   | fireEvent.keyDown | <td> not focusable; source no onKeyDown |
| ArrowUp     | fireEvent.keyDown | same                                   |
| ArrowRight  | fireEvent.keyDown | same                                   |
| ArrowLeft   | fireEvent.keyDown | same                                   |
| Home        | fireEvent.keyDown | same                                   |
| End         | fireEvent.keyDown | same                                   |
| PageUp      | fireEvent.keyDown | same                                   |
| PageDown    | fireEvent.keyDown | same                                   |
| Ctrl+Home   | fireEvent.keyDown ({ key:'Home', ctrlKey:true }) | same |
| Ctrl+End    | fireEvent.keyDown ({ key:'End',  ctrlKey:true }) | same |

These flip to real userEvent + focus assertions when TC-12-IMPL ships roving
tabindex / `role="grid"` in v0.7.

## Verification Results

- `npx vitest run src/DataTable/DataTable.test.tsx` → **25 passing, 0 failing** (7.78s)
- Full `npx vitest run` for `@holmdigital/components` → **332 passing across 22 files**
- Anti-pattern grep (`querySelector | configureAxe | toMatchSnapshot`) → **0 hits**
- `fireEvent.keyDown(` occurrences → **present with inline §5 rationale**
- `expectNoAxeViolations(` occurrences → **2** (default + sorted)
- JSDoc header contains `TC-12-IMPL` → **yes** (in the Implementation note block)

## Done Criteria

- [x] `packages/components/src/DataTable/DataTable.test.tsx` exists
- [x] Vitest reports 11-14 (actual: 25 — see decisions) passing, 0 failing
- [x] WCAG-SC JSDoc header present, references 1.3.1 / 2.1.1 / 4.1.2 only
- [x] Implementation note records cell-arrow gap + TC-12-IMPL backlog ref + scope=row out-of-scope gap
- [x] At least one `expectNoAxeViolations(` call (axe-clean smokes: default + sorted)
- [x] At least one `fireEvent.keyDown(` with inline §5 rationale
- [x] D-02a anti-pattern count = 0
- [x] Full components-package suite stays green

## Deviations from Plan

None. Plan executed exactly as written.

(Note: worktree HEAD was at `5ce4646` on entry — fast-forwarded to `2bc33c1`
to match the planning fork point declared in the spawn prompt. Non-destructive
`git merge --ff-only`; no commits dropped because HEAD was a strict ancestor.
This is a worktree-bootstrap step, not a plan deviation.)

## Known Stubs

10 of the 25 tests are intentional no-throw stubs (cell-arrow keystrokes), as
specified by D-01 and the plan's partial-stub strategy. They are documented in
the JSDoc Implementation note and reference TC-12-IMPL for resolution. These
are NOT a quality issue — they are the agreed deferral mechanism for surface
DataTable.tsx does not yet implement.

## Commits

- `1774afd` — `test(24-04): add DataTable test suite (TC-12) with sortable-header real + cell-arrow no-throw stub`

## Self-Check: PASSED

- FOUND: packages/components/src/DataTable/DataTable.test.tsx (25 tests, all passing)
- FOUND: commit 1774afd in `git log --oneline`
- FOUND: WCAG-SC JSDoc header with TC-12-IMPL backlog reference
- FOUND: 0 anti-pattern hits (querySelector/configureAxe/toMatchSnapshot)
- FOUND: fireEvent.keyDown with inline §5 rationale
- FOUND: 2 expectNoAxeViolations calls
- VERIFIED: full components suite green (332/332)
