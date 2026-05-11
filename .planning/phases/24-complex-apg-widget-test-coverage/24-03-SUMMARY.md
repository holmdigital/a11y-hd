---
phase: 24-complex-apg-widget-test-coverage
plan: 03
subsystem: components-testing
tags: [test, a11y, multiselect, TC-11, partial-stub, listbox-multi, APG]
requires:
  - packages/components/src/MultiSelect/MultiSelect.tsx
  - packages/components/src/_test/helpers.ts
  - packages/components/src/_test/axe.ts
provides:
  - packages/components/src/MultiSelect/MultiSelect.test.tsx
affects: []
tech_added: []
patterns:
  - partial-stub-strategy (D-01)
  - paired-keyboard-D-02a
  - parametrised-no-throw-row
key_files_created:
  - packages/components/src/MultiSelect/MultiSelect.test.tsx
key_files_modified: []
decisions:
  - "Real assertions for ArrowDown/Up + Enter + Escape + Backspace + chip remove (Enter+Space)"
  - "No-throw stubs for Space-on-input toggle, Shift+ArrowDown, Shift+ArrowUp (deferred to TC-11-IMPL)"
  - "Chip ArrowLeft (source lines 104-112) silently omitted — source-acknowledged TODO comment, no backlog entry"
  - "Used user.click(input) instead of native input.focus() because React onFocus → setIsOpen(true) only round-trips through user-event's synthetic event path in jsdom"
metrics:
  duration_minutes: ~25
  tests_total: 22
  tests_tier1: 6
  tests_tier2: 16
  no_throw_stubs: 3
  axe_smokes: 2
  completed: 2026-05-11
requirements:
  - TC-11
---

# Phase 24 Plan 03: MultiSelect Test Suite Summary

One-liner: Added 22 passing tests for MultiSelect covering listbox-multi combobox surface, chip-removal contract (D-02a paired keyboard) and three parametrised no-throw stubs for APG gaps deferred to v0.7.

## What Shipped

Single file: `packages/components/src/MultiSelect/MultiSelect.test.tsx` (435 LOC).

### Test Breakdown — 22 it() blocks, 0 failures

**Tier 1 — Table Stakes (6)**
1. mounts with role="combobox" on the input
2. label wired via htmlFor to the combobox input (1.3.1)
3. className passes through additively on the outer container
4. selected items render as visible chips with their labels
5. each chip remove button carries aria-label="Remove {label}"
6. empty selected renders the placeholder; non-empty selected renders chips (no placeholder)

**Tier 2 — A11y Differentiators (16)**
1. clicking an option in the listbox fires onChange with [...selected, value]
2. ArrowDown opens listbox + moves aria-activedescendant to option-0
3. ArrowUp opens listbox + wraps aria-activedescendant to last option (-1→last branch)
4. Enter selects focused option AND closes the listbox
5. Escape closes the listbox without calling onChange
6. Backspace on EMPTY input fires onChange with selected.slice(0, -1)
7. Backspace on NON-empty input does NOT fire onChange (clears inputValue first)
8. clicking a chip remove button removes value AND focus returns to input
9. Enter on focused chip remove button fires onChange (D-02a paired)
10. Space on focused chip remove button fires onChange (D-02a paired)
11-13. APG-gap parametrised it.each (3 cases): Space on input, Shift+ArrowDown, Shift+ArrowUp — no-throw stubs
14. axe-clean for default render (selected=[])
15. axe-clean for with-selection render (selected=['a','b'])
16. two MultiSelect instances produce no duplicate ids (expectUniqueIds)

## No-throw Stubs vs Real Assertions

| Keystroke | Status | Reason | Backlog |
|---|---|---|---|
| ArrowDown / ArrowUp | REAL | Source implements + activedescendant tracking | — |
| Enter | REAL | Source: handleSelect → onChange + close | — |
| Escape | REAL | Source: setIsOpen(false) | — |
| Backspace (empty input) | REAL | Source: handleRemove(last) | — |
| Backspace (non-empty) | REAL | Source no-op (negative assertion) | — |
| Chip remove Enter + Space | REAL | Native HTMLButtonElement activation | — |
| **Space on input** | **NO-THROW STUB** | Source has no Space branch — types literal space | TC-11-IMPL |
| **Shift+ArrowDown** | **NO-THROW STUB** | Source has no Shift modifier branch | TC-11-IMPL |
| **Shift+ArrowUp** | **NO-THROW STUB** | Source has no Shift modifier branch | TC-11-IMPL |

## Source-side Gaps Documented in JSDoc

Implementation-note block records (deferred to TC-11-IMPL unless noted):
- `aria-multiselectable="true"` missing on listbox
- `aria-selected` hardcoded to `false` on every option (line 278)
- Space on input has no toggle handler (types literal space)
- Shift+ArrowDown/Up does not extend selection
- No `<LiveRegion>` / aria-live region (deferred to **TC-11-LIVE**)
- Chip ArrowLeft (source lines 104-112) silently omitted (TODO comment in source, planner's discretion)

## Verification Results

| Check | Result |
|---|---|
| `npx vitest run src/MultiSelect/MultiSelect.test.tsx` | 22/22 passing (4.9s) |
| `npm run test:ci -w @holmdigital/components` | 329/329 passing (full suite green) |
| `npm run test:wcag-headers` | 18 marker files (up from 17 — new file detected) |
| `grep "querySelector\|configureAxe\|toMatchSnapshot"` in new file | 0 hits (D-02a clean) |
| `expectNoAxeViolations(` count in new file | 2 |
| JSDoc TC-11-IMPL backlog reference present | Yes |
| JSDoc TC-11-LIVE backlog reference present | Yes |

## Deviations from Plan

None. Plan executed exactly as written.

The plan target was "13-16 tests"; ended at 22 because (a) the parametrised APG-gap row contributes 3 it() blocks via `it.each`, (b) Tier 1 needed 6 distinct table-stakes (not 5) to cover the placeholder→chip swap separately, and (c) Backspace required separate empty vs non-empty input branches. All extra tests satisfy criteria already in the plan's `<behavior>` block — no scope creep.

## Auth Gates

None.

## Commits

| Commit | Description |
|---|---|
| 1f4f11b | test(24-03): add MultiSelect Tier 1+2 suite (TC-11) — listbox-multi with APG-gap stubs |

(Merge commit 2bc33c1 is the master fast-forward that brought helpers + RadioGroup.test.tsx + Button.test.tsx + scripts into this worktree at agent start — not part of plan output.)

## Known Stubs

The three no-throw stubs (Space-on-input, Shift+ArrowDown, Shift+ArrowUp) are intentional per D-01 partial-stub strategy. They are documented in the test file's JSDoc with explicit backlog references (TC-11-IMPL). They do NOT prevent the plan's goal — pinning the implemented portion of the APG listbox-multi contract — from being achieved.

## Self-Check: PASSED

- packages/components/src/MultiSelect/MultiSelect.test.tsx — FOUND
- Commit 1f4f11b — FOUND in git log
- WCAG-header script counts the new file (18 marker files, up from 17)
- 0 anti-pattern hits in new file (querySelector/configureAxe/toMatchSnapshot)
- 2 expectNoAxeViolations calls present
- JSDoc contains TC-11-IMPL and TC-11-LIVE backlog references
- npm run test:ci -w @holmdigital/components fully green (329/329)
