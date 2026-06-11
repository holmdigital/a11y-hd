---
gsd_state_version: 1.0
milestone: v0.7
milestone_name: APG Completion
status: verifying
stopped_at: Phase 34 context gathered
last_updated: "2026-06-11T19:19:00.707Z"
last_activity: 2026-05-11
progress:
  total_phases: 12
  completed_phases: 7
  total_plans: 20
  completed_plans: 17
  percent: 58
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

### Roadmap Evolution

- Phase 34 added (2026-06-11): Klarspråksrapport — opt-in plain-language report via `--plain`/`--audience plain`. Source docs from Karins team (Meja+Ebba underlag, Amanda sammanställning) live in the phase directory. Build per klarsprak-cli-implementation.md (text in standards, English keys); 8 texts + tone rules from klarsprakslager-engine.md are the content; its Swedish-keyed type is scrapped. Key verified facts in ROADMAP Phase 34 block: copy plainLanguage in generateRegulatoryReport (single lookup), CLI doc's image-alt example is wrong (semantic id alt-text), source files on disk are clean UTF-8.

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

### Plan 33-04 decisions + deviations (logged 2026-05-12)

- **PUB-09 closed.** All 3 packages now gate publish on lint + typecheck. Three sequential `npm run verify` runs exit 0: standards (61 tests), components (634 tests / 36 files), engine (123 tests / 6 files). `prepublishOnly` byte-equivalent to pre-phase (literal `npm run verify`).
- **PATCH-bump rationale (vs Phase 32 MINOR precedent):** Phase 32 added test files (artifacts ship in source tree). Phase 33 changes scripts + dev-side fixes only — no public API surface, no source artifacts shipped. PATCH-honest.
- **Engine baseline note:** plan brief mentioned 2.5.1 → 2.5.2 but `packages/engine/package.json` was already at 2.5.2 (Section 504 routing shipped per CLAUDE.md inline notes — see ef3d381 in CHANGELOG). 33-04 stacks a fresh 2.5.2 → 2.5.3 PATCH bump for the lint cleanup. v0.7 ship notes corrected accordingly.
- **No TS2724 / `--skipLibCheck` carry-over from 33-02** — engine `tsc --noEmit` exits 0 cleanly. No flag added.
- **No unexpected category from 33-03** — the 5 planned tsc-error categories executed cleanly. 33-03 expanded Cat C scope (2 → 8 files) and absorbed 5 dormant lint errors, but did not introduce a 6th category.
- **Commits (3):** `6584b93` (chore(standards): 2.5.1 → 2.5.2 + CHANGELOG), `7b719c3` (chore(components): 2.6.0 → 2.6.1 + CHANGELOG), `b1a8e80` (chore(engine): 2.5.2 → 2.5.3 + CHANGELOG).

### Plan 33-03 decisions + deviations (logged 2026-05-12)

- **Verify chain wired for components.** typecheck script added; `verify` now chains build → lint → typecheck → check:exports → check:types → test:ci. `prepublishOnly` unchanged. End-to-end `npm run verify -w @holmdigital/components` exits 0 (36 test files / 634 tests passing).
- **Cat C expansion 2 → 8 files (Rule 1).** Plan listed only RadioGroup + SkipLink; preflight grep surfaced the same Phase 22 template-setter `ref.current = node` pattern in Button, Checkbox, FormField, Heading + helper. All 8 fixed with `(ref as MutableRefObject<HTML*Element | null>).current = node` cast (semantics-preserving, supports future ref.current reads).
- **tsconfig types array gained "node" entry (Rule 4 minimal-A2 overlay).** Route A1 (devDep install) was locked at plan time, but preflight tsc showed `__dirname`/node globals still unresolved after install. Added `"node"` to `tsconfig.json` `compilerOptions.types`. Route A1 INTENT preserved — devDep is the source of truth; types array just makes TS pick it up.
- **5 pre-existing lint errors absorbed (Phase 33 scope clarification).** Once verify ran lint, 5 dormant errors surfaced: 4 × `'React' is not defined` (DatePicker.tsx source + Dialog/Modal/NavigationMenu tests) + 1 × `rule react-hooks/exhaustive-deps not found` (DatePicker.tsx:124 inline-disable). Per Phase 33's mission ("verify exit 0 with lint + typecheck wired in"), these belong to PUB-09 scope by definition. Fixed: type-only `import type React from 'react'` in all 4 files (zero runtime impact).
- **eslint-plugin-react-hooks installed at monorepo root + narrowly registered.** Plugin 7.1.1 added to root devDeps; ONLY `react-hooks/exhaustive-deps` rule registered. Full `recommended` set surfaces 18 pre-existing react-compiler violations (setState-in-effect, components-during-render) out of Phase 33 scope — deferred to v0.7 backlog as dedicated react-hooks audit plan.
- **Breadcrumbs unused React import removed (Rule 3 blocker).**
- **Commits (6):** `b9e3ed1` (Cat C 8-file ref fix + Cat D), `afe3727` (Cat B matcher aug + Cat E narrowing), `14400e8` (Cat A @types/node + verify chain), `1cb9f99` (Breadcrumbs cleanup), `4a01fc8` (4× TS-namespace React imports), `958b74b` (react-hooks plugin install + narrow registration).

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

Last session: 2026-06-11T19:19:00.695Z
Stopped at: Phase 34 context gathered
Resume: Phase 33 Plan 04 Task 4 (checkpoint:human-verify) — user runs the 6-step verification (sequential verify + npm publish --dry-run × 3 + version inspection + CHANGELOG visual + git log + Swedish-char encoding scan) and signals "approved" to close PUB-09.
completed_phases_v07: [27, 28, 29, 30, 31, 32, 33]
