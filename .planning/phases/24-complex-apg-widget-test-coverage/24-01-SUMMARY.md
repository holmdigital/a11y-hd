---
phase: 24-complex-apg-widget-test-coverage
plan: 01
subsystem: components
tags: [testing, a11y, apg, combobox, tc-09, wcag-2.1.1, wcag-1.3.1, wcag-2.4.3, wcag-4.1.2]
requires: [TI-01, TI-02, TI-03, TI-04, TI-05]
provides: [TC-09]
affects: [packages/components/src/Combobox/Combobox.test.tsx]
tech-stack:
  added: []
  patterns: ["APG combobox-with-listbox-popup keyboard contract assertions via userEvent.keyboard"]
key-files:
  created:
    - packages/components/src/Combobox/Combobox.test.tsx
  modified: []
decisions:
  - "Document live-region absence inline + defer to TC-09-LIVE v0.7 backlog rather than synthesising aria-live in the test"
  - "Assert ArrowUp-when-closed wraps-to-last as-shipped; flag divergence from strict APG via TC-09-IMPL marker"
  - "Merge aria-expanded + aria-controls assertions into one test to keep total within plan budget (18 tests)"
metrics:
  duration: 254s
  completed: 2026-05-11
---

# Phase 24 Plan 01: Combobox Test Suite (TC-09) Summary

Added Tier 1 + Tier 2 APG-conformant Combobox test coverage (18 tests, single new file) pinning the role/ARIA/keyboard contract that the source already ships, so the deferred v0.7 live-region work and any future keyboard refactor cannot silently regress current behavior.

## What Changed

- **Created** `packages/components/src/Combobox/Combobox.test.tsx` (314 lines) with two `describe` tiers, WCAG-SC JSDoc header, `_test/helpers` imports, zero anti-patterns.

## Tier 1 (6 tests) — Table Stakes

- `role="combobox"` mounts and label renders
- `<label htmlFor>` wires accessible name (`getByLabelText` resolves the input) — WCAG 1.3.1
- `className` passes through additively on outer container
- Controlled `value` preselects input text via `useEffect` sync (Combobox.tsx:85-94)
- Typing opens listbox and filters case-insensitively
- `description` + `error` both chained into `aria-describedby`; `aria-invalid="true"`; `role="alert"` on the error node

## Tier 2 (12 tests) — A11y Differentiators

- `aria-expanded` `false`→`true` on open; `aria-controls` resolves to `<ul role="listbox">` (merged into one test)
- ArrowDown after opening sets `aria-activedescendant` to `${id}-option-0`
- Successive ArrowDown advances index; wraps from last back to 0
- ArrowUp-from-closed wraps to LAST (documents source divergence from strict APG — see Pattern Notes)
- Home → option-0; End → option-{last}
- PageDown +10 (clamped to last); PageUp −10 (clamped to 0)
- Enter on focused option calls `onChange(value)` and sets `aria-expanded="false"`
- Escape closes listbox, does not call `onChange` with any option value, resets input text
- Tab closes listbox
- Typeahead: typing `"ba"` filters `OPTIONS` to a single `Banana` option
- `expectNoAxeViolations` smoke for default render (D-03)
- `expectUniqueIds` over two side-by-side `<Combobox>` instances

## Pattern Notes / APG Divergences

- **ArrowUp-when-closed wraps to LAST**, not first. Source wrap branch at Combobox.tsx:145-149 fires because `focusedIndex` starts at `-1`, which is NOT `> 0`. Tested as-shipped; strict-APG alignment deferred to TC-09-IMPL.
- **Alt+ArrowDown / Alt+ArrowUp** not distinguished from plain Arrow keys by source handler — modifier-specific tests omitted (per plan §action).
- **Live region (aria-live results count) is NOT rendered by source.** JSDoc header explicitly records `TC-09-LIVE` v0.7 backlog reference rather than testing an absent feature (D-01, D-05).

## Verification

| Check                                         | Expected         | Actual           |
| --------------------------------------------- | ---------------- | ---------------- |
| `vitest run src/Combobox/Combobox.test.tsx`   | 15–18 pass / 0 fail | 18 pass / 0 fail |
| Full components suite                         | ≥ 21 files / ≥ 307 tests | 22 files / 325 tests |
| `npm run test:wcag-headers` count             | 17 → 18          | 17 → 18          |
| `grep -c "querySelector\|configureAxe\|toMatchSnapshot"` in new file | 0    | 0                |
| `expectNoAxeViolations(` calls in new file    | ≥ 1              | 1                |
| `TC-09-LIVE` mentions in new file             | ≥ 1              | 1                |

axe-clean: confirmed (Tier-2 smoke green).
D-02a anti-pattern hits: 0.

## Deviations from Plan

None — plan executed as written. One internal optimisation: the plan listed `aria-expanded toggles` and `aria-controls resolves` as two separate Tier-2 items (would have produced 19 tests). They were merged into one `it()` to stay within the 15–18 budget specified in `<done>`. Both assertions are still present and run together on a single open-popup state.

## Known Stubs

None.

## Self-Check: PASSED

- `packages/components/src/Combobox/Combobox.test.tsx` — FOUND
- Commit `b496ac8` — FOUND in `git log --oneline -1`
