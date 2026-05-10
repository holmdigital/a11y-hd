---
phase: 22-test-infra-and-first-7-components
plan: 07
subsystem: components/testing
tags: [test, formfield, aria-describedby, useId, wcag-1.3.1, wcag-3.3.1, wcag-3.3.2, wcag-4.1.2]
requires: [22-05]
provides: [TC-03, formfield-test-template, aria-describedby-resolution-pattern]
affects: [packages/components/src/FormField/FormField.tsx]
tech-stack:
  added: []
  patterns: ["aria-describedby ID-resolution assertion (split-and-resolve)", "useId distinctness across instances"]
key-files:
  created:
    - packages/components/src/FormField/FormField.test.tsx
  modified: []
decisions:
  - "Match required-state label by regex (/Email/), not exact text — visual asterisk and sr-only '(obligatoriskt)' are part of the accessible name"
  - "Assert aria-required OR native required (FormField sets the latter; HTML semantics expose required to AT either way)"
  - "Use screen.getByText for label-content assertions instead of container.querySelector to satisfy D-02a"
metrics:
  duration: ~6m
  tasks: 1
  files: 1
  it_blocks: 15
  tests_passing: 216
  completed: 2026-05-10
---

# Phase 22 Plan 07: FormField Test Suite (TC-03) Summary

**One-liner:** FormField Tier 1+2 vitest suite (15 it() blocks) pins the aria-describedby ID-resolution contract — every whitespace-separated token in `aria-describedby` resolves to a real DOM node when help and error are both present.

## What Landed

- `packages/components/src/FormField/FormField.test.tsx` — 222 lines, 15 `it()` blocks
  - **Tier 1 (5):** mount + label/input render, ref forwarding, className passthrough, explicit-id override, disabled
  - **Tier 2 (10):** htmlFor/id label association, helpText aria-describedby resolution, error aria-describedby + aria-invalid, both-together aria-describedby resolution, required state (aria-required + visual indicator), useId distinctness across instances, axe-clean default, axe-clean required+error, duplicate-id guard via `expectUniqueIds`, paired keyboard typing input

## aria-describedby Assertion Shape (template for Phase 24)

The pattern this plan pins, copyable for Combobox/DatePicker/MultiSelect:

```tsx
const describedBy = input.getAttribute('aria-describedby');
expect(describedBy).toBeTruthy();
const ids = describedBy!.split(/\s+/).filter(Boolean);
expect(ids.length).toBeGreaterThanOrEqual(2); // when both help+error
const resolvedTexts = ids.map((id) => {
    const node = container.ownerDocument.getElementById(id);
    expect(node).not.toBeNull();
    return node!.textContent ?? '';
});
expect(resolvedTexts.some((t) => t.includes('expected message'))).toBe(true);
```

Why split-and-resolve rather than `querySelector('#id')`? Two reasons:
1. ARIA spec says `aria-describedby` is a whitespace-separated ID list — the test must walk the same parser path AT does.
2. D-02a forbids `querySelector`; `document.getElementById` is allowed and matches the AT semantics exactly.

## FormField Wiring Quirks Discovered

1. **Required-state label text** — When `required` is set, the visible label text becomes `Email` + `*` (aria-hidden) + ` (obligatoriskt)` (sr-only). `getByLabelText('Email')` (exact match) fails because the accessible name includes the sr-only text. Use `getByLabelText(/Email/)` regex match. Worth noting in component docs as well.
2. **Required attribute exposure** — FormField sets the native `required` HTML attribute on the input (which AT exposes natively); it does NOT additionally set `aria-required="true"`. The test asserts the contract loosely (`aria-required === 'true' || hasAttribute('required')`) so a future tightening of FormField that adds `aria-required` does not flip-fail the test, and the current implementation passes.
3. **id sanitization** — `useId()` returns `:r0:` style ids; FormField's `sanitizeId` strips colons. Asserted via `expect(input.id).not.toMatch(/:/)` to lock the colon-strip behaviour.

## Deviations from Plan

None. Plan executed exactly as written. One iteration cycle:
- **Iteration 1 fail:** `getByLabelText('Email')` exact match failed in the required-state test because the accessible name now contained `*` + sr-only text. Fixed by switching to regex `/Email/`. Not a deviation — the plan's task description anticipated this ("read FormField.tsx to confirm which" indicator pattern is used).
- **Iteration 2 fail:** D-02a gate caught one `container.querySelector('label')` in the required test. Replaced with `screen.getByText` queries. Not a deviation — D-02a was always the constraint.

## Acceptance Criteria

| Criterion | Result |
|-----------|--------|
| File exists | ✅ |
| WCAG SCs marker in first 30 lines | ✅ (lines 3–14) |
| Both Tier describes present | ✅ |
| `grep aria-describedby` ≥ 2 | ✅ (10) |
| `grep aria-invalid` ≥ 1 | ✅ (3) |
| `grep aria-required` ≥ 1 | ✅ (5) |
| `grep expectUniqueIds` ≥ 1 | ✅ (2) |
| `grep expectNoAxeViolations` ≥ 2 | ✅ (3) |
| `grep querySelector\|toMatchSnapshot\|configureAxe` = 0 | ✅ (0) |
| `it(` count in [10, 16] | ✅ (15) |
| `npm run test:ci` exits 0 | ✅ (216/216) |
| `npm run test:wcag-headers` exits 0 | ✅ |

## Commits

- `732417d` test(components): add FormField Tier 1+2 suite (TC-03)

## Self-Check: PASSED

- `packages/components/src/FormField/FormField.test.tsx` exists ✅
- Commit `732417d` exists in git log ✅
- All 216 tests pass; WCAG header guard passes ✅
