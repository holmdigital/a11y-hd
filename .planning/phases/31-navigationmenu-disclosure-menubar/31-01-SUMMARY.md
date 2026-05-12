---
phase: 31-navigationmenu-disclosure-menubar
plan: 01
subsystem: components/NavigationMenu
tags: [navigationmenu, apg, menubar, keyboard, type-ahead, roving-tabindex, opt-in, tc-14-impl]
requires: []
provides:
  - "MenubarRenderer central-state pattern (Map<string,HTMLElement> + useLayoutEffect imperative focus + hasUserMovedRef mount-guard)"
  - "parseMenubarKey module-scope helper (menubar:i vs submenu:p:c keying for multi-tier roving)"
  - "Two-sibling-component dispatch on a pattern prop without breaking byte-equivalence of the default renderer"
affects: []
tech_stack:
  added: []
  patterns:
    - "Central activeKey state + Ref shadow + Map<string,HTMLElement> registry + useLayoutEffect imperative focus (Phase 30 DataTable carry-forward)"
    - "Single parent onKeyDown switch on role=menubar UL (Phase 28 DatePicker shape)"
    - "Type-ahead buffer with 500 ms setTimeout, locale-naive .toLowerCase(), scope-aware reset (D-02 + D-08)"
key_files:
  created: []
  modified:
    - packages/components/src/NavigationMenu/NavigationMenu.tsx
    - packages/components/src/NavigationMenu/NavigationMenu.test.tsx
    - packages/components/package.json
    - packages/components/CHANGELOG.md
decisions:
  - "parseMenubarKey kept module-scope (per RESEARCH recommendation) for reuse and shallow function scope inside MenubarRenderer."
  - "Task 31-01-01 + 31-01-02 of the original plan-draft merged into a single atomic Task 31-01-01 because tsconfig.base.json carries noUnusedLocals: true, which would reject a shell-only intermediate commit (preflight finding)."
  - "No void-no-op workaround used — the merged task ships the full handler in one commit (anti-pattern avoided per plan revision)."
  - "RESEARCH Q1 items-prop-change hardening clamp NOT added — no test exercised an items prop swap; keeping the renderer minimal."
  - "RESEARCH Q2 axe role='none' contingency did NOT trigger — axe-core 4.x is clean on <li role='none'> inside <ul role='menubar'>. D-05 unchanged."
  - "Type-ahead fake-timer test replaced with real-timer 600 ms wait — userEvent v14 + vitest 4 fake-timers integration was brittle. The 500 ms literal is verified via the source grep gate in Task 31-01-03; the test still proves buffer reset semantically."
  - "D-04 leaf Enter activation test uses dispatchEvent + defaultPrevented assertion rather than clickSpy-on-wrapper (jsdom does not synthesise <a> activation on Enter). PRECONDITIONS (tagName === 'A' + toHaveAttribute('href', '/help')) still asserted BEFORE the keydown — these are the element-type proofs that D-04 demanded."
metrics:
  duration_minutes: ~15
  completed_date: 2026-05-12
---

# Phase 31 Plan 01: NavigationMenu Disclosure → Menubar (TC-14-IMPL) Summary

Opt-in `pattern="menubar"` upgrade to NavigationMenu shipping the full W3C APG Menubar keyboard contract (roving tabindex, Arrow/Home/End, ArrowRight cross-submenu, Escape with stopPropagation, type-ahead with 500 ms buffer) while preserving v0.6 Disclosure behaviour byte-for-byte. @holmdigital/components 2.4.0 → 2.5.0 (MINOR, additive, no breaking changes).

## Tasks Completed

| # | Task | Commit |
|---|------|--------|
| 1 | feat(31-01): pattern prop + DisclosureRenderer extraction + full MenubarRenderer (shell + onKeyDown + type-ahead + cross-submenu) | `10a4294` |
| 2 | test(31-01): Tier 2 APG Menubar describe block + MENUBAR_ITEMS fixture (20 D-02a-clean it() blocks) | `1eb50a4` |
| 3 | chore(31-01): 3 axe-clean smoke tests + version bump 2.4.0→2.5.0 + CHANGELOG entry | `1eb6d34` |

## Test Surface Delta

| Metric | Pre-phase | Post-phase |
|---|---|---|
| NavigationMenu.test.tsx total tests | 20 | **43** (+23) |
| New "Tier 2: A11y Differentiators (APG Menubar per Phase 31)" `it()` blocks | 0 | 20 |
| Axe-clean smoke tests | 0 | 3 |
| Whole-file `fireEvent` count | 23 | **23** (invariant preserved — BLOCKER 1 gate) |
| `fireEvent` / `querySelector` / `configureAxe` / `toMatchSnapshot` in new block | n/a | **0 / 0 / 0 / 0** (D-02a-clean) |
| `npm run verify -w @holmdigital/components` exit code | 0 | **0** |
| @holmdigital/components test suite total | 506 | **529** (+23) |

## Success Signal Verification — All 10 CONTEXT.md Signals ✓

| # | Signal | Result |
|---|--------|--------|
| 1 | `grep -c "pattern?: 'disclosure' \| 'menubar'" NavigationMenu.tsx` → 1 | ✓ 1 |
| 2 | `grep -c 'role="menubar"' NavigationMenu.tsx` → 1 attribute (JSDoc also references it for docs; the literal `<ul role="menubar">` attribute appears exactly once at line 462) | ✓ 1 attribute (2 total incl. JSDoc text — verbatim per plan `<interfaces>`) |
| 3 | `grep -c 'role="menuitem"' NavigationMenu.tsx` → ≥ 2 | ✓ 4 |
| 4 | `grep -cE 'role="menu"[^b]' NavigationMenu.tsx` → ≥ 1 | ✓ 1 |
| 5 | `grep -c 'aria-haspopup="menu"' NavigationMenu.tsx` → ≥ 1 | ✓ 2 (JSDoc + attribute) |
| 6 | `grep -cE 'typeAheadBufferRef\|type-ahead' NavigationMenu.tsx` ≥ 1; setTimeout 500 ms present | ✓ 5 / setTimeout(..., 500) present once |
| 7 | `@wcag` present; `2.1.1 Keyboard` + `2.4.3 Focus Order` + `4.1.2 Name, Role, Value` all ≥ 1 | ✓ all four present |
| 8 | `grep -c 'Tier 2: A11y Differentiators (APG Menubar' NavigationMenu.test.tsx` → 1 | ✓ 1 |
| 9 | `grep -cE '(toHaveFocus\|tabIndex)' NavigationMenu.test.tsx` → ≥ 9 | ✓ 26 |
| 10 | `npm run verify -w @holmdigital/components` exit 0; package.json `"version": "2.5.0"`; CHANGELOG has `## 2.5.0` | ✓ all three |

## BLOCKER-Fix Gates ✓

| Gate | Required | Actual |
|---|---|---|
| BLOCKER 1 / Whole-file `fireEvent` invariant | exactly 23 | **23** ✓ |
| BLOCKER 1 / New-block `fireEvent` via line-range (`tail -n +$START`) | 0 | **0** ✓ |
| BLOCKER 2 / D-04 leaf element-type: `<a[^>]*role="menuitem"` (multiline) | ≥ 1 | **2** ✓ |
| BLOCKER 4 / D-08 locale-naive: `toLocaleLowerCase` | 0 | **0** ✓ |
| BLOCKER 4 / D-08 locale-naive: `.toLowerCase()` | ≥ 2 | **4** ✓ |
| D-04 element-type assertion in test 's': `tagName).toBe('A')` | ≥ 1 | **2** ✓ |
| D-04 href precondition: `toHaveAttribute('href', '/help')` | ≥ 1 | **1** ✓ |

## RESEARCH Q1/Q2 Outcomes

- **Q1 items-prop-change clamp:** NOT triggered (no failing test invoked an items swap). Hardening clamp left unimplemented; can be added defensively if a future consumer hits an out-of-bounds focus call.
- **Q2 axe `role="none"` on `<li>` inside `role="menubar"`:** Did NOT trigger. axe-core 4.x running under jsdom passed all three smoke tests:
  - `pattern="disclosure"` default render
  - `pattern="menubar"` closed render
  - `pattern="menubar"` with one submenu open
  No HALT report needed. D-05 (the `role="none"` decision) ships unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test runtime: D-04 Enter activation test rewritten**
- **Found during:** Task 31-01-02 run
- **Issue:** Original test design used `user.keyboard('{Enter}')` with a click-spy wrapper to assert the leaf `<a>` activated. jsdom does NOT synthesise an `<a>` click on Enter, so the assertion never fired and the test timed out at 5 s.
- **Fix:** Replaced with `helpLeaf.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))` + `expect(event.defaultPrevented).toBe(false)`. This is a stricter D-04 assertion (it proves the handler ITSELF does not call preventDefault) AND keeps the PRECONDITION assertions (`tagName === 'A'`, `toHaveAttribute('href', '/help')`) that the plan demanded.
- **Files modified:** `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (test 's')
- **Commit:** `1eb50a4`

**2. [Rule 3 - Blocking] Test runtime: fake-timer integration brittleness**
- **Found during:** Task 31-01-02 run
- **Issue:** `userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })` timed out under vitest 4.0.16 + userEvent v14 — the keystroke promise never resolved when fake timers were active.
- **Fix:** Replaced with a real-timer 600 ms `setTimeout` wait between two character presses. The 500 ms literal is still verified via the source grep gate in Task 31-01-03 acceptance #6.
- **Files modified:** `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (test 'r')
- **Commit:** `1eb50a4`

**3. [Rule 3 - Blocking] Test runtime: ArrowDown-on-leaf test focus drift**
- **Found during:** Task 31-01-02 run
- **Issue:** Test was `help.focus()` then `{ArrowDown}`. Because the test bypassed roving keyboard navigation, `activeKeyRef.current` was still `'menubar:0'` (File). ArrowDown then opened File's submenu — the opposite of the test's intent.
- **Fix:** Pre-navigate to Help via `{End}` so the handler's reads `activeKeyRef.current === 'menubar:2'`.
- **Files modified:** `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (test 'j')
- **Commit:** `1eb50a4`

**4. [Rule 3 - Blocking] Test imports: `vi` added to vitest import**
- **Found during:** Task 31-01-02 write
- **Issue:** Existing test file imported only `{ describe, it, expect }` from vitest; the new Tier 2 block uses `vi.fn()` for the Escape ancestor-spy.
- **Fix:** Added `vi` to the existing import line. This is the only modification to lines 1–335; everything else in the legacy block remains byte-equivalent — the whole-file `fireEvent` baseline of 23 is preserved.
- **Files modified:** `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (line 68)
- **Commit:** `1eb50a4`

### Authentication Gates
None.

### Architectural Decisions Made During Execution
None.

## Verification Summary

- `npm run build -w @holmdigital/components` — exit 0 (noUnusedLocals satisfied — confirms Task 01+02 merge was correctly applied)
- `npm run test -w @holmdigital/components -- NavigationMenu --run` — 43/43 passing
- `npm run verify -w @holmdigital/components` — exit 0; 529 tests across 29 files passing; all post-test scripts green (`check-wcag-headers`, `check-no-tailwind-leak`, `check-no-test-leak`)
- `packages/components/package.json` → `"version": "2.5.0"` ✓
- `packages/components/CHANGELOG.md` → `## 2.5.0 — 2026-05-12` entry present ✓

## Handoff to Phase 32

The MenubarRenderer establishes three reusable cross-tier patterns for future multi-tier roving components (e.g., TreeView with `tree:0:2:1` keys):

1. **`parseMenubarKey` parsed-key shape** — discriminated union on `kind` (`'menubar'` vs `'submenu'`) keyed by colon-delimited stable strings. Generalises to N-depth trees.
2. **Central-state model** — `useState<string>(activeKey)` + `useRef` shadow + `Map<string, HTMLElement>` cellRefs registry + `useLayoutEffect` imperative focus gated by `hasUserMovedRef` mount-guard. Same shape as Phase 30 DataTable.
3. **Two-sibling-component dispatch on a `pattern` prop** — proven non-breaking refactor: the existing renderer body extracts verbatim into a sibling component while a new variant ships alongside, gated by an opt-in prop default-equal to the legacy value.

## Self-Check: PASSED

- `[FOUND]` `packages/components/src/NavigationMenu/NavigationMenu.tsx` (modified, 562 lines)
- `[FOUND]` `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` (modified, 651 lines)
- `[FOUND]` `packages/components/package.json` (version 2.5.0)
- `[FOUND]` `packages/components/CHANGELOG.md` (## 2.5.0 entry)
- `[FOUND]` commit `10a4294` (Task 31-01-01)
- `[FOUND]` commit `1eb50a4` (Task 31-01-02)
- `[FOUND]` commit `1eb6d34` (Task 31-01-03)
