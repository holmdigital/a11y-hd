---
phase: 22-test-infra-and-first-7-components
plan: 02
subsystem: testing
tags: [vitest, axe-core, jsdom, testing-library, react, components, helpers]

requires:
  - phase: 22-01
    provides: "_test/setup.ts with 7 jsdom polyfills + jest-dom & axe matcher extensions; vitest.config.ts wired"
provides:
  - "Centralised axe wrapper at _test/axe.ts exporting expectNoAxeViolations(container)"
  - "Reusable test primitives at _test/helpers.ts: expectUniqueIds + expectKeyboardSequence + re-export of expectNoAxeViolations"
  - "11 jsdom-incompatible / page-level axe rules disabled in ONE place; per-test configureAxe forbidden"
  - "D-04-mandated meta-tests proving each helper's happy + failure-mode contract (11 meta-tests, all green)"
affects: [22-04, 22-05, 22-06, 22-07, 22-08, 22-09, phase-24]

tech-stack:
  added: []
  patterns:
    - "Single import path for component tests: import { expectNoAxeViolations, expectUniqueIds, expectKeyboardSequence } from '../_test/helpers'"
    - "axe-core called directly (axe.run) — @chialab/vitest-axe ships ONLY the toHaveNoViolations matcher, not configureAxe/axe"
    - "Helper meta-tests live alongside the helpers in _test/helpers/{name}.test.ts (D-07)"
    - "Failure-mode assertions use specific regex (toThrow(/.../)) so a buggy helper cannot silently green CI"

key-files:
  created:
    - "packages/components/src/_test/axe.ts"
    - "packages/components/src/_test/helpers.ts"
    - "packages/components/src/_test/helpers/expectNoAxeViolations.test.ts"
    - "packages/components/src/_test/helpers/expectUniqueIds.test.ts"
    - "packages/components/src/_test/helpers/expectKeyboardSequence.test.ts"
  modified: []

key-decisions:
  - "Use axe-core directly (axe.configure + axe.run) instead of configureAxe from @chialab/vitest-axe — the package ships only the toHaveNoViolations matcher (default export of main entry); configureAxe/axe do NOT exist on it. The matcher is fed the AxeResults from axe.run()."
  - "Rule overrides applied both at module load (axe.configure) and per-run (RunOptions.rules) for belt-and-braces against any future test file calling axe.configure with a fresh spec."
  - "expectKeyboardSequence uses userEvent.setup() once per call — keeps single user instance across the step loop so sticky modifiers (Shift, Meta) compose correctly."

patterns-established:
  - "_test/{axe,helpers}.ts is the single source of truth for axe rule disables and helper signatures — Wave 2 plans 04–09 import from here, never call configureAxe themselves"
  - "Meta-test triad: every helper requires (a) happy-path success, (b) regex-matched failure-mode throw, (c) edge-case coverage — D-04 contract"

requirements-completed: [TI-03, TI-04]

duration: ~3 min
completed: 2026-05-10
---

# Phase 22 Plan 02: Axe Wrapper + Reusable Helpers Summary

**Centralised axe-core configuration (11 rules disabled in one place) and three named test primitives (`expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`) — each backed by D-04-mandated meta-tests with failure-mode assertions, all 11 helper meta-tests green, full component suite still passes (176/176).**

## Performance

- **Duration:** ~3 minutes
- **Started:** 2026-05-10T17:00:38Z
- **Completed:** 2026-05-10T17:03:20Z
- **Tasks:** 3 of 3
- **Files created:** 5
- **Files modified:** 0

## Accomplishments

- `packages/components/src/_test/axe.ts` exports a single `expectNoAxeViolations(container: HTMLElement): Promise<void>`
- 11 rule IDs disabled in one place (each documented with a one-line rationale comment):
  1. `color-contrast` (jsdom returns empty computed styles)
  2. `region`
  3. `landmark-one-main`
  4. `landmark-complementary-is-top-level`
  5. `landmark-no-duplicate-banner`
  6. `landmark-no-duplicate-contentinfo`
  7. `landmark-unique`
  8. `bypass`
  9. `meta-viewport`
  10. `document-title`
  11. `html-has-lang`
- `packages/components/src/_test/helpers.ts` re-exports `expectNoAxeViolations` and adds two helpers:
  - `expectUniqueIds(root: HTMLElement | Document | null): void` — collects `[id]` attributes, throws `Error('expectUniqueIds: duplicate id(s) found: …')` on duplicates; throws on null root.
  - `expectKeyboardSequence(steps: KeyboardStep[]): Promise<void>` — drives `userEvent.keyboard(step.key)` per step then asserts `document.activeElement === step.expectFocusOn` if provided. Throws on empty steps array, empty key, or focus mismatch.
- 3 meta-test files (11 tests total) cover happy-path AND specific-regex failure-mode for every helper, per D-04. Wave 2 component plans can now `import { expectNoAxeViolations, expectUniqueIds, expectKeyboardSequence } from '../_test/helpers'` and trust the contract.

## Task Commits

1. **Task 1: Create _test/axe.ts (TI-03)** — `206d800` (feat)
2. **Task 2: Create _test/helpers.ts (TI-04)** — `f9ac979` (feat)
3. **Task 3: Helper meta-tests (D-04)** — `eec9a46` (test)

**Plan metadata commit:** see final commit covering this SUMMARY.md + STATE.md.

## Files Created

- `packages/components/src/_test/axe.ts` — centralised axe wrapper, 11 documented disables, single `expectNoAxeViolations` export
- `packages/components/src/_test/helpers.ts` — `expectUniqueIds` + `expectKeyboardSequence` + re-export of `expectNoAxeViolations`
- `packages/components/src/_test/helpers/expectNoAxeViolations.test.ts` — 3 meta-tests (happy + 2 failure-mode)
- `packages/components/src/_test/helpers/expectUniqueIds.test.ts` — 4 meta-tests (2 happy + 2 failure-mode)
- `packages/components/src/_test/helpers/expectKeyboardSequence.test.ts` — 4 meta-tests (1 happy + 3 failure-mode)

**Meta-test count:** 11 tests across 3 files, all green.

## Decisions Made

- **axe-core called directly, not via @chialab/vitest-axe.** Plan instruction was `import { configureAxe, axe } from '@chialab/vitest-axe'` but inspecting `node_modules/@chialab/vitest-axe@0.19.1/lib/index.js` shows the package's default export is JUST the `toHaveNoViolations` matcher object — no `configureAxe`, no `axe`. Switched to `import axe from 'axe-core'` and call `axe.run(container, RunOptions)` ourselves, then feed the `AxeResults` into the matcher via `expect(results).toHaveNoViolations()`. This is the same semantic contract the plan described, just sourced from the package that actually ships the runtime.
- **Belt-and-braces rule disabling.** Both `axe.configure({ rules: [...] })` at module load and `RunOptions.rules` per call carry the 11 disables, so a stray `axe.configure` elsewhere can't silently re-enable them.
- **Single `userEvent.setup()` per call** in `expectKeyboardSequence` — keeps sticky modifier state consistent across step loop iterations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @chialab/vitest-axe does not export configureAxe/axe**
- **Found during:** Task 1 (writing axe.ts to plan spec)
- **Issue:** Plan code block specified `import { configureAxe, axe } from '@chialab/vitest-axe'`. Inspection of `node_modules/@chialab/vitest-axe/lib/index.js` (the entire file is one `export default { toHaveNoViolations(results) { ... } }`) shows the package ships ONLY the matcher object — no `configureAxe`, no `axe`. This is consistent with the 22-01 deviation note (matchers live as default export, no `./matchers` runtime, no `./configureAxe` either).
- **Fix:** Use `axe-core` directly (already a transitive dep, version 4.11.4). Apply rule overrides via `axe.configure({ rules: [...] })` at module load and via `RunOptions.rules` per call. Feed the resulting `AxeResults` into the package's `toHaveNoViolations` matcher (already extended onto `expect` in `setup.ts`). Documented inline in `axe.ts` so the next plan that touches this file doesn't repeat the import attempt.
- **Files modified:** `packages/components/src/_test/axe.ts`
- **Verification:** All 3 meta-tests in `expectNoAxeViolations.test.ts` pass (including the failure-mode test that asserts axe actually fires the `label` rule on a bare `<input>` — proving rule overrides didn't silently disable everything).
- **Committed in:** `206d800` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug — upstream package shape mismatch, identical category to 22-01's matcher-import deviation).
**Impact on plan:** No scope creep. Same external contract (`expectNoAxeViolations(container)` returning a Promise that resolves on clean / rejects on violation), same 11 rule disables, identical observable behaviour.

## Authentication Gates

None — pure local test scaffolding.

## Issues Encountered

- **None blocking.** The pre-existing TS2503 in `LiveRegion.tsx:37` (logged in 22-01) is unrelated and remains deferred.

## Verification Results

- `npm run test:ci -w @holmdigital/components` → **10 files / 176 tests pass** (was 7/165 in 22-01, +3 helper meta-test files / +11 tests; existing 165 stay green).
- `grep -rn "configureAxe" packages/components/src --include="*.test.tsx" --include="*.test.ts"` → no matches outside `_test/axe.ts` (verified: zero `.test.{ts,tsx}` files reference `configureAxe`).
- All 5 new files present:
  - `packages/components/src/_test/axe.ts`
  - `packages/components/src/_test/helpers.ts`
  - `packages/components/src/_test/helpers/expectNoAxeViolations.test.ts`
  - `packages/components/src/_test/helpers/expectUniqueIds.test.ts`
  - `packages/components/src/_test/helpers/expectKeyboardSequence.test.ts`

## Threat Flags

None — purely test scaffolding (no network, auth, file, or schema surface).

## Next Phase Readiness

- Wave 2 plans 22-04 through 22-09 can now `import { expectNoAxeViolations, expectUniqueIds, expectKeyboardSequence } from '../_test/helpers'` (or `'../../_test/helpers'` depending on depth) and rely on a single source of truth for the 11 axe rule disables and the keyboard/ID assertion contracts.
- Plan 22-03 (TESTING-CONVENTIONS.md, WCAG-SC header guard, package.json test:ci script) runs in parallel and does not depend on this plan's outputs.
- The `@chialab/vitest-axe` package shape (matcher-only, no configureAxe/axe) is documented in this SUMMARY and inline in `axe.ts` so future plans don't re-discover it.

## Self-Check: PASSED

Verified the following before returning:

- `packages/components/src/_test/axe.ts` — FOUND
- `packages/components/src/_test/helpers.ts` — FOUND
- `packages/components/src/_test/helpers/expectNoAxeViolations.test.ts` — FOUND
- `packages/components/src/_test/helpers/expectUniqueIds.test.ts` — FOUND
- `packages/components/src/_test/helpers/expectKeyboardSequence.test.ts` — FOUND
- Commit `206d800` (Task 1, TI-03 axe.ts) — FOUND in `git log`
- Commit `f9ac979` (Task 2, TI-04 helpers.ts) — FOUND in `git log`
- Commit `eec9a46` (Task 3, helper meta-tests) — FOUND in `git log`
- All 11 axe rule IDs literally present in `axe.ts` — verified
- Each meta-test file contains ≥ 1 specific-regex `toThrow(/.../)` failure assertion — verified
- `npm run test:ci -w @holmdigital/components` → 10 files / 176 tests pass

---
*Phase: 22-test-infra-and-first-7-components*
*Completed: 2026-05-10*
