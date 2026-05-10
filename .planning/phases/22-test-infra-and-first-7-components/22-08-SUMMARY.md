---
phase: 22-test-infra-and-first-7-components
plan: 08
subsystem: components-tests
tags: [tests, modal, dialog, focus-trap, wcag, tc-04]
requires: [22-01, 22-02, 22-03, 22-04, 22-05]
provides:
  - "Modal Tier 1+2 contract test (TC-04) — focus management + Escape + ARIA wiring"
  - "Centralised HTMLDialogElement polyfill is now the only source of truth in component tests"
affects:
  - packages/components/src/Modal/Modal.test.tsx
  - packages/components/src/Dialog/Dialog.test.tsx
tech-stack:
  added: []
  patterns:
    - "Wrapper component testing — assert wiring of delegated behaviour (useFocusTrap), not the hook contract itself"
    - "Native <dialog> close-event simulation as a stand-in for Escape in jsdom (Dialog handles Escape via the cancel→close native sequence)"
    - "Backdrop-vs-child click discrimination via target === dialog (Dialog.tsx lines 96-104)"
key-files:
  created:
    - packages/components/src/Modal/Modal.test.tsx
  modified:
    - packages/components/src/Dialog/Dialog.test.tsx
decisions:
  - "Escape path verified via dialog.close() rather than fireEvent.keyDown — jsdom does not translate Escape into the native cancel→close event sequence on <dialog>, so simulating the close path directly proves Modal/Dialog's onClose wiring with no false positives"
  - "Trimmed close-button click test out of Modal.test.tsx — that path is a Dialog concern (the close button lives in Dialog.tsx) already covered by Dialog.test.tsx; keeping it here would have pushed the it() count past the D-02 budget of 16"
metrics:
  completed_date: 2026-05-10
  duration_minutes: ~12
  tasks_completed: 2
  files_changed: 2
  it_blocks: 16
---

# Phase 22 Plan 08: Modal Test Suite + Dialog Polyfill Cleanup Summary

Adds the Modal Tier 1+2 contract suite (TC-04, 16 `it()` blocks across two top-level Tier describes) and retires the duplicate `HTMLDialogElement.showModal` polyfill from `Dialog.test.tsx` — the central polyfill in `_test/setup.ts` (Plan 22-01) is now the only source of truth.

## Tasks Completed

| Task | Description | Commit |
| ---- | ----------- | ------ |
| 1 | Modal.test.tsx (TC-04) — Tier 1+2 suite mirroring Button.test.tsx template | `ad1f484` |
| 2 | Remove inline showModal polyfill from Dialog.test.tsx + refresh WCAG header | `abf7c47` |

## Modal `it()` count: 16

- **Tier 1 (5):** mounts + renders children when open, does-not-show-open when isOpen=false, ref forwarding to HTMLDialogElement, className passthrough merging with hard-coded `max-w-2xl`, title/description text rendering.
- **Tier 2 (11):** role="dialog", aria-modal="true", aria-labelledby resolves via getElementById (PITFALLS §3.1), aria-describedby resolves via getElementById, focus moves into dialog on open (wiring of useFocusTrap), focus restored to opener on close, Escape path via native close event, backdrop click vs child click discrimination (D-02a paired keyboard+click), 2× axe-clean (default + with footer actions), `expectUniqueIds` across two Modal instances.

## Dialog cleanup notes

- Dropped the inline `beforeAll(() => { ... HTMLDialogElement.prototype.showModal ... })` block (originally Dialog.test.tsx lines 13–25) and the now-unused `beforeAll` import from `vitest`.
- The WCAG header was refreshed: 2.1.1 → 2.1.2 (the more precise SC for "no keyboard trap"), kept 2.4.3 and 4.1.2, and added a paragraph documenting why the inline polyfill is gone.
- All 6 Dialog tests still pass against the centralised polyfill. No production code touched.

## Click-outside vs backdrop semantics

Modal/Dialog implements backdrop click via `e.target === dialog` (Dialog.tsx lines 96–104). The Modal test asserts both branches of this discriminator: a click on a child button does NOT fire onClose, while `fireEvent.click(dialog, { target: dialog })` DOES. There is no separate "backdrop element" — the `:backdrop` pseudo is purely visual; the click target check is what makes the close-on-outside-click reliable even with CSS transforms.

## Verification

```
npm run test:ci -w @holmdigital/components
  Test Files  14 passed (14)
       Tests  232 passed (232)
[check-wcag-headers] ok — 10 test file(s) all carry the marker.
```

Pre-Plan-22-08 baseline: 13 files / 216 tests. Post-Plan-22-08: 14 files / 232 tests (+16, exactly Modal). No collateral changes to other suites.

## Acceptance Criteria

### Task 1 (Modal.test.tsx)

- ✅ File exists; first 30 lines contain `WCAG SCs covered:`
- ✅ Both Tier describes present
- ✅ `getByRole('dialog'` references: 12 (≥ 1)
- ✅ `aria-modal` references: 3 (≥ 1)
- ✅ `aria-labelledby|aria-describedby` references: 5 (≥ 2)
- ✅ `Escape` references: 6 (≥ 1)
- ✅ `expectNoAxeViolations` references: 3 (≥ 2)
- ✅ `expectUniqueIds` references: 2 (≥ 1)
- ✅ `querySelector|toMatchSnapshot` references: 0 (must be 0 — D-02a)
- ✅ `it()` count: 16 (within [10, 16])
- ✅ All 16 tests pass

### Task 2 (Dialog.test.tsx)

- ✅ `if (!HTMLDialogElement.prototype.showModal)` count: 0
- ✅ `beforeAll` count: 0
- ✅ First 30 lines contain `WCAG SCs covered:`
- ✅ `npm run test:ci -- Dialog.test` exits 0
- ✅ WCAG header guard exits 0

## Deviations from Plan

None — plan executed exactly as written.

The plan's commit message for Task 2 was `refactor(components): remove inline showModal polyfill (now centralised in _test/setup.ts) + add WCAG header to Dialog.test.tsx`; I changed "add WCAG header" to "update WCAG header" in the actual commit since the file already had a header — the plan's wording was slightly inaccurate (Dialog.test.tsx had a 2.1.1/2.4.3/4.1.2 header pre-Plan; I refreshed it to 2.1.2/2.4.3/4.1.2 and added a paragraph documenting the polyfill move). No semantic deviation.

## Self-Check: PASSED

- Modal.test.tsx exists at `packages/components/src/Modal/Modal.test.tsx`
- Dialog.test.tsx modified, no inline polyfill, WCAG header present
- Commit `ad1f484` exists in git log (Task 1)
- Commit `abf7c47` exists in git log (Task 2)
- All 232 tests in 14 files green
- WCAG header guard ok — 10 test files all carry the marker
