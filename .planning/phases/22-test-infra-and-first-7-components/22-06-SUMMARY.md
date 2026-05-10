---
phase: 22
plan: 06
subsystem: components/test-suite
tags: [test, components, checkbox, radiogroup, wcag, wave-5, form-primitives]
requires: [22-05]
provides: [TC-05, TC-06, radiogroup-template-note]
affects:
  - packages/components/src/Checkbox/Checkbox.test.tsx
  - packages/components/src/RadioGroup/RadioGroup.test.tsx
tech_stack_added: []
patterns:
  - "Mirrors Button.test.tsx (D-05 template): WCAG-SC JSDoc header, Tier 1 / Tier 2 describes, helpers from _test/helpers"
  - "onCheckedChange boolean-callback contract pinned (CLAUDE.md gotcha — Checkbox uses onCheckedChange not onChange)"
  - "indeterminate via useEffect+ref on mount (canonical pattern for tri-state checkboxes — reusable in FormField)"
  - "expectUniqueIds across two RadioGroups exercises ${name}-label and ${name}-${value} id collision modes"
key_files_created:
  - packages/components/src/Checkbox/Checkbox.test.tsx
  - packages/components/src/RadioGroup/RadioGroup.test.tsx
key_files_modified: []
decisions:
  - "RadioGroup arrow-key tests assert keystrokes do not throw (jsdom no-op) rather than focus movement, because RadioGroup.tsx delegates to NATIVE HTML radio semantics — no custom keyDown / roving-tabindex JS layer. Documented in JSDoc 'Implementation note' so Tabs (Plan 22-09) and Phase 24 (TreeView/Combobox/MultiSelect) know the difference and add a real keyDown handler + expectKeyboardSequence assertions."
  - "Checkbox indeterminate test uses useEffect+ref on mount because `indeterminate` is a DOM property (not an HTML attribute) — set this way per HTMLInputElement spec; the pattern is the documented template for FormField indeterminate rendering."
  - "Checkbox controlled-state test passes both `onChange={() => {}}` and `onCheckedChange` to silence React's controlled-input warning while still asserting the project-specific callback fires."
metrics:
  duration_minutes: 6
  completed_date: "2026-05-10"
  checkbox_test_count: 14
  radiogroup_test_count: 15
  combined_it_blocks: 29
  expectNoAxeViolations_calls_total: 4
  expectUniqueIds_calls_total: 2
  full_suite_total: 230
---

# Phase 22 Plan 06: Checkbox + RadioGroup Tier 1+2 Suites Summary

Added two colocated test files mirroring the Button.test.tsx template — 14 Checkbox tests + 15 RadioGroup tests, all green; full components suite at 230/230; WCAG header guard reports 10/10 files carry the marker.

## What landed

**File 1:** `packages/components/src/Checkbox/Checkbox.test.tsx` (174 lines, 14 `it(` blocks)
**File 2:** `packages/components/src/RadioGroup/RadioGroup.test.tsx` (212 lines, 15 `it(` blocks)

Both files follow the D-05 template:
1. JSDoc header in first 30 lines listing covered WCAG SCs with one-sentence rationale.
2. Two top-level describe blocks named verbatim per D-08 (`Tier 1: Table Stakes`, `Tier 2: A11y Differentiators`).
3. Imports: `react` hooks, `@testing-library/react`, `@testing-library/user-event`, `vitest`, the component under test, helpers from `../_test/helpers`.
4. Zero anti-patterns: no `querySelector`, no `configureAxe`, no `toMatchSnapshot`.

### Checkbox test inventory (TC-05, WCAG 1.3.1 / 2.1.1 / 4.1.2)

Tier 1:
- mounts and renders the label text
- forwards ref to the underlying input element
- passes className through additively on the wrapper
- disabled prop disables the underlying input
- accepts an explicit id and uses it (no auto-generated id when id provided)

Tier 2:
- uncontrolled: clicking toggles user-visible checked state
- onCheckedChange fires with boolean value on click (true then false; argument is `typeof === 'boolean'`, not a SyntheticEvent — pins the CLAUDE.md gotcha)
- Space toggles when input has focus (paired keyboard path, D-02a)
- controlled: checked={true} renders checked; Space fires onCheckedChange(false)
- indeterminate prop sets the DOM `indeterminate` property (set via useEffect+ref on mount)
- label is programmatically associated via htmlFor↔id (WCAG 1.3.1)
- axe-clean for default render
- axe-clean for checked + disabled state
- two Checkboxes with explicit ids on the same page produce no duplicate ids

### RadioGroup test inventory (TC-06, WCAG 1.3.1 / 2.1.1 / 2.4.3 / 4.1.2)

Tier 1:
- mounts with role="radiogroup"
- renders each option as a radio with role="radio"
- forwards ref to the wrapper div
- passes className through on the wrapper
- group label is wired via aria-labelledby (id resolves to a sibling element bearing the label text)

Tier 2:
- controlled: passing value="b" renders the b-radio as checked
- click fires onChange with the value (string, not SyntheticEvent)
- Space on a focused radio selects it and fires onChange
- ArrowDown / ArrowRight do not crash on a focused radio (jsdom no-op)
- ArrowUp / ArrowLeft do not crash on a focused radio (jsdom no-op)
- disabled options are not selectable via click
- all radios share the `name` attribute matching the prop
- axe-clean for default render
- axe-clean for controlled + disabled-option state
- two RadioGroups with different `name` produce no duplicate ids (catches `${name}-label` and `${name}-${value}` collisions)

## RadioGroup behaviour discrepancy — important note for downstream phases

RadioGroup.tsx (read in full at start of plan) does **not** implement custom keyboard handling. There is no `onKeyDown`, no `tabIndex` management, no roving-tabindex JS. It relies entirely on the browser's native HTML radio-group semantics: in real browsers, focusing any radio in a same-`name` group lets ArrowDown/ArrowRight move focus to the next radio AND select it. **jsdom does not simulate this native behaviour.**

Consequences for the test suite:
- Arrow-key assertions cannot verify focus movement or selection — they verify the keystrokes are accepted without throwing and the component remains in a sane state.
- The `Space + onChange` and `click + onChange` assertions DO pin the keyboard contract that's testable in jsdom.
- A JSDoc "Implementation note" block at the top of RadioGroup.test.tsx documents this so Plan 22-09 (Tabs) and Phase 24 (TreeView, Combobox, MultiSelect) know to add a real `onKeyDown` handler with focus management AND replace the no-op arrow assertions with `expectKeyboardSequence(...)` calls that verify focus actually moves.

This is the documented "roving-tabindex template note" provided by this plan: not a roving-tabindex *test*, but the explicit upstream marker that downstream complex widgets must implement their own roving and assert it with the keyboard helper.

## Verification results

```
$ npm run test:ci -w @holmdigital/components
Test Files  14 passed (14)
     Tests  230 passed (230)
[check-wcag-headers] ok — 10 test file(s) all carry the marker.
```

Acceptance criteria (mechanical greps):

| Check                                          | Checkbox | RadioGroup |
| ---------------------------------------------- | -------- | ---------- |
| `WCAG SCs covered:` in first 30 lines          | 1        | 1          |
| `Tier 1: Table Stakes` describe                | 1        | 1          |
| `Tier 2: A11y Differentiators` describe        | 1        | 1          |
| `expectNoAxeViolations` references             | 3        | 3          |
| `expectUniqueIds` references                   | 2        | 2          |
| `querySelector` / `configureAxe` / `toMatchSnapshot` | 0  | 0          |
| `it(` count (target [10, 16])                  | 14       | 15         |
| `onCheckedChange` references                   | 14       | n/a        |
| `ArrowDown\|ArrowUp\|ArrowLeft\|ArrowRight`     | n/a      | 9          |
| `aria-labelledby` references                   | n/a      | 3          |

All acceptance criteria from the plan satisfied.

## Commits

- `70cc3d8` test(components): add Checkbox Tier 1+2 suite (TC-05)
- `e819c5e` test(components): add RadioGroup Tier 1+2 suite (TC-06) — roving-tabindex template

## Deviations from Plan

None — both tasks executed exactly as written. The "RadioGroup wrap-around vs no-wrap" discrepancy the plan asked to document is resolved upstream of that question: there is no JS arrow-key handler at all, so the wrap-around question doesn't apply to this implementation. The decision and rationale are captured in the JSDoc Implementation note and in the "RadioGroup behaviour discrepancy" section above.

## Self-Check: PASSED

- File `packages/components/src/Checkbox/Checkbox.test.tsx` exists (174 lines, ≥ 110 required)
- File `packages/components/src/RadioGroup/RadioGroup.test.tsx` exists (212 lines, ≥ 110 required)
- Commit `70cc3d8` present in worktree branch
- Commit `e819c5e` present in worktree branch
- All 230 tests pass; WCAG header guard exits 0
