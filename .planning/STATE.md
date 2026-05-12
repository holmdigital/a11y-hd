---
gsd_state_version: 1.0
milestone: v0.7
milestone_name: APG Completion
status: executing
stopped_at: Phase 32 COMPLETE — TC-15 closed. 8 plans across 3 waves shipped (Wave 1 Card/Skeleton/Heading/SkipLink; Wave 2 ProgressBar/Switch/Pagination; Wave 3 Tooltip audit + 2.5.0→2.6.0 bump + CHANGELOG). 29 colocated component test files (was 22) carrying Tier 1+2+axe smoke + WCAG SC header; 36 vitest files / 634 tests green; full verify exit 0. Tooltip legacy SC 1.4.13 block preserved under documented D-02a waiver (fake-timer + user-event v14 + vitest 4 deadlock per Plan 27-01).
last_updated: "2026-05-12T08:50:00.000Z"
last_activity: 2026-05-12
progress:
  total_phases: 11
  completed_phases: 3
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-11)

**Core value:** The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.
**Current focus:** Phase 28 — datepicker-apg-dialog-grid

## Current Position

Milestone: v0.7 APG Completion — PLANNING
Phase: 28 (datepicker-apg-dialog-grid) — COMPLETE
Plan: 3 of 3
Status: All plans verified; ready to advance
Last activity: 2026-05-11

## Performance Metrics

**Prior milestones:**

- v0.1: 5 phases, 9 plans, 20 commits
- v0.2: 5 phases, 8 plans, 25 commits
- v0.3: 3 phases, 4 plans, 13 commits (same-day ship)
- v0.4: 4 phases, 4 plans (3 min avg/plan)
- v0.5: 4 phases, 4 plans (Australia jurisdiction)

**v0.6 plan:**

- 5 phases (22-26), 0 plans drafted yet
- 32 requirements mapped (TI: 6, TC: 14, STY: 6, STMT: 3, PUB: 6)
- Phases 22, 23, 25 can run in parallel; 24 depends on 22; 26 runs last

## Accumulated Context

### Decisions

**Prior milestone decisions logged in PROJECT.md Key Decisions table.**

**v0.6 locked decisions (from research synthesis + user sign-off):**

- Styling pattern: CSS-file-per-component side-effect import (rejects JS event-handler approach which would break `:focus-visible`)
- Theming: CSS custom properties with inline-style fallbacks
- Dist policy: stop committing `packages/*/dist/`; CI builds for publish
- lucide-react: optional `peerDependencies` with text-glyph fallbacks (`▾`, `⚠`, `ℹ`)
- SSR consumer audit (Phase 22 task) confirms whether engine is the only SSR consumer
- Test stack: `@chialab/vitest-axe` (NOT chaance/vitest-axe — dead since 2021), `@testing-library/user-event` v14, `@testing-library/jest-dom` v6, `eslint-plugin-testing-library`
- jsdom stays (do NOT switch to happy-dom — breaks vitest-axe via `Node.prototype.isConnected`)
- [Phase ?]: Phase 27-01: added additive optional locale?: string prop to Combobox + MultiSelect; non-breaking. Real-timer + findByText test pattern chosen over fake-timers (user-event v14 deadlock in vitest 4.x).

### Pending Todos

- Confirm SSR audit result during Phase 22 execution and update PROJECT.md
- ~~Address pre-existing TS2503 in `packages/components/src/LiveRegion/LiveRegion.tsx:37`~~ — **RESOLVED 2026-05-11 by Phase 26 Plan 01 (D-01)**

### Plan 22-01 deviations (logged 2026-05-10)

- [Rule 1 - Bug] `@chialab/vitest-axe@0.19.1` exposes matchers as the default export of the main entry, not via the `./matchers` subpath (which ships types only). Imported via `import axeMatchers from '@chialab/vitest-axe'` in `src/_test/setup.ts`. Downstream plans should follow the same pattern.

### Plan 22-02 deviations (logged 2026-05-10)

- [Rule 1 - Bug] `@chialab/vitest-axe@0.19.1` ships ONLY the `toHaveNoViolations` matcher (default export) — it does NOT export `configureAxe` or `axe`. `_test/axe.ts` therefore calls `axe-core` directly (`axe.run` + `axe.configure`) and feeds the `AxeResults` into the package's matcher. Downstream plans that need axe should use the `expectNoAxeViolations` helper, never reach for `configureAxe` from `@chialab/vitest-axe`.

### Plan 22-04 deviations (logged 2026-05-10)

- None. Planner's harness shape and 5-scenario list executed verbatim. Hook contract held under jsdom thanks to the offsetParent polyfill (Plan 22-01). Scenario 3 (Tab cycle) used native `KeyboardEvent` dispatch per PITFALLS §3.3 because the hook attaches a raw keydown listener and reads `document.activeElement` synchronously — documented inline in the test file.

### Plan 22-05 deviations (logged 2026-05-10)

- [Rule 1 - Bug] Initial draft of `Button.test.tsx` used `container.querySelectorAll('[aria-hidden="true"]')` in the spinner-glyph test. Refactored to `btn.firstElementChild + toHaveAttribute('aria-hidden', 'true')` to satisfy the D-02a anti-pattern grep gate (querySelector count must be 0). Same coverage, no DOM reach. Pattern guidance for Plans 06–09: never `querySelector` — query by role then walk via `firstElementChild` / `children` if you need to inspect a hidden glyph or icon.

### Plan 22-06 deviations + downstream-impact decisions (logged 2026-05-10)

- None (no auto-fixes needed). RadioGroup.tsx implements ZERO custom keyboard handling — it relies on native HTML radio semantics, which jsdom does NOT simulate for arrow-key roving. RadioGroup.test.tsx documents (JSDoc "Implementation note") that Plan 22-09 (Tabs) and Phase 24 widgets that DO need roving-tabindex MUST add an explicit `onKeyDown` handler with focus management AND replace the no-op arrow assertions with `expectKeyboardSequence(...)` calls. Arrow-key tests in this file assert keystrokes-do-not-throw only — pinning the testable contract (focus, click, Space).
- Indeterminate-state pattern (useEffect+ref-on-mount) is the canonical template for FormField tri-state checkbox rendering — `indeterminate` is a DOM property, not an HTML attribute.

### Plan 22-08 deviations (logged 2026-05-10)

- None. Two implementation notes captured in the plan SUMMARY: (a) Escape path is verified via `dialog.close()` rather than `fireEvent.keyDown` because jsdom does not translate Escape into the native `cancel→close` sequence on `<dialog>`; (b) the standalone close-button click test was trimmed (Dialog concern, already covered by Dialog.test.tsx) to keep `it()` count within the D-02 budget of 16. Modal landed with 16 tests, Dialog.test.tsx lost the redundant inline `HTMLDialogElement.showModal/close` polyfill — the central one in `_test/setup.ts` is now the only source of truth. Full suite: 232 tests / 14 files green.

### Plan 26-01 decisions + deviations (logged 2026-05-11)

- **D-01 resolved:** Single-line type swap at `LiveRegion.tsx:37` — `useRef<NodeJS.Timeout>()` → `useRef<ReturnType<typeof setTimeout>>()`. No `@types/node` added; tsup DTS build now succeeds end-to-end (CJS 650ms, ESM 652ms, **DTS 20584ms** — all green). 27 test files / 439 tests stay green.
- **PUB-03 part 1 resolved:** `git rm --cached -r packages/standards/dist/` removed 4 tracked dist files (index.{js,mjs,d.ts,d.mts}); working-tree copies preserved. `.gitignore` now carries both `dist/` (recursive) and explicit `packages/*/dist/` lines per ROADMAP success criterion #2.
- Phase 22 deferred-items entry moved to `## Resolved` section with `Resolved by Phase 26 Plan 01 (D-01) on 2026-05-11` back-reference.
- No deviations — plan executed verbatim. Phase 26 Wave 2 (plans 02/03/04) now unblocked.

### Plan 31-01 decisions + deviations (logged 2026-05-12)

- **TC-14-IMPL closed.** NavigationMenu gains opt-in `pattern?: 'disclosure' | 'menubar'` (default disclosure preserves v0.6 byte-equivalence). MenubarRenderer ships full APG Menubar keyboard contract: roving tabindex + Map<string,HTMLElement> cellRefs + useLayoutEffect imperative focus + hasUserMovedRef mount-guard + parseMenubarKey module-scope helper.
- **Q2 axe `role="none"` contingency NOT triggered** — axe-core 4.x clean on `<li role="none">` inside `<ul role="menubar">`. D-05 ships unchanged.
- **Three runtime deviations auto-fixed (Rule 3):** (a) D-04 Enter activation test uses `dispatchEvent` + `defaultPrevented` instead of click-spy because jsdom doesn't synthesise `<a>` activation on Enter; (b) fake-timer test replaced with real-timer 600 ms wait because userEvent v14 + vitest 4 fake-timer integration hangs; (c) ArrowDown-on-leaf test pre-navigates via `{End}` so `activeKeyRef.current` reads the right key. PRECONDITION assertions (`tagName === 'A'`, `toHaveAttribute('href', '/help')`) retained — they're the D-04 element-type proofs.
- **Patterns established for Phase 32+:** parseMenubarKey discriminated-union keying generalises to N-depth tree (`tree:0:2:1` style); two-sibling-component dispatch on a `pattern` prop is a proven non-breaking refactor shape.

### Plan 23-01 decisions + deviations (logged 2026-05-10)

- **CSS layout decision: NESTED** (`dist/<Name>/<Name>.css`) — empirically detected by smoke probe. Load-bearing for Wave 2 plans. Recorded in 23-01-SUMMARY.md.
- 3 CSS subpath exports added upfront (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) — eliminates Wave 2 parallel-write conflict on `package.json` exports map.
- `check-no-tailwind-leak` script created but **NOT yet wired into test:ci** — bootstrap-deferred to Plan 23-04 once 23-02/03/04 each drive their dir's match count to 0.
- Engine TS2724 build failure on `AccessibilityStatementProps` is **pre-existing at f2b5fd1** (downstream of LiveRegion DTS error) — verified by checkout; NOT a Plan 23-01 regression. Per plan context, do not auto-fix.
- vitest 4.x dropped `--reporter=basic`; default reporter used instead — same 19/294 result.

### Blockers/Concerns

- Component dist rebuild needed before npm publish (carryover from v0.3 — addressed by Phase 26)
- `en-au` template prose pending AU-familiar legal practitioner review (carryover from v0.5)
- PROJECT.md and MILESTONES.md missed v0.4 and v0.5 sync passes — separate cleanup needed
- Storybook esbuild vuln blocks visual regression — out of scope for v0.6, deferred to v0.7+

## Session Continuity

Last session: 2026-05-12T08:50:00.000Z
Stopped at: Phase 32 COMPLETE — TC-15 closed. 8 plans / 3 waves; 29 colocated component test files (was 22); 106 new tests; @holmdigital/components 2.5.0→2.6.0 (MINOR per Phase 22/24/30/31 precedent); full verify exit 0 (36 files / 634 tests; wcag-headers ok 31 files; no-tailwind-leak / no-test-leak ok). Tooltip.test.tsx audited and augmented in place under documented D-02a waiver (legacy SC 1.4.13 fireEvent block byte-equivalent; cites Plan 27-01 fake-timer + user-event v14 + vitest 4 deadlock). ROADMAP arithmetic reconciled in 32-08-SUMMARY (target 28→36 was 22→29; #1's "8 new files" was 7 new + 1 augmented). Process improvement: Wave 1 Card+Heading bundled into one commit (`43cf5ad`) because parallel agents didn't pathspec-scope; Wave 2 added `git commit -- <pathspec>` and committed cleanly — recommend universal adoption.
Resume: Phase 33 (lint + typecheck gates) per ROADMAP v0.7
completed_phases_v07: [27, 28, 29, 30, 31, 32]
