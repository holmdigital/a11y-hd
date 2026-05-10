---
gsd_state_version: 1.0
milestone: v0.6
milestone_name: Components Quality
status: executing
stopped_at: Phase 22 Plan 05 complete (TC-02 Button.test.tsx — template-setter for Wave 2)
last_updated: "2026-05-10T19:15:00Z"
last_activity: 2026-05-10 — Phase 22 Plan 05 complete (TC-02: Button.test.tsx, 19 tests, template-setter for Plans 06–09)
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 10
  completed_plans: 5
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-10)

**Core value:** The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.
**Current focus:** Phase 22 — test-infra-and-first-7-components

## Current Position

Phase: 22 (test-infra-and-first-7-components) — EXECUTING
Plan: 5 of 9 complete (Plans 01 + 02 + 03 + 04 + 05: TI-01..06 + TC-01 + TC-02 — Button template-setter landed)
Status: Executing Phase 22 — PR #1 ready (7 atomic commits). PR #2 in flight: Plan 05 (Button) done; Plans 06–09 (Checkbox, RadioGroup, FormField, Modal, ErrorSummary, Tabs) mirror Button.test.tsx structure.
Last activity: 2026-05-10 -- Phase 22 plan 05 complete (TC-02: Button.test.tsx, 19 tests, template established for Plans 06–09)

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

### Pending Todos

- Confirm SSR audit result during Phase 22 execution and update PROJECT.md
- Address pre-existing TS2503 in `packages/components/src/LiveRegion/LiveRegion.tsx:37` (deferred from 22-01 — see `.planning/phases/22-test-infra-and-first-7-components/deferred-items.md`); fold into 22-09 or Phase 26.

### Plan 22-01 deviations (logged 2026-05-10)

- [Rule 1 - Bug] `@chialab/vitest-axe@0.19.1` exposes matchers as the default export of the main entry, not via the `./matchers` subpath (which ships types only). Imported via `import axeMatchers from '@chialab/vitest-axe'` in `src/_test/setup.ts`. Downstream plans should follow the same pattern.

### Plan 22-02 deviations (logged 2026-05-10)

- [Rule 1 - Bug] `@chialab/vitest-axe@0.19.1` ships ONLY the `toHaveNoViolations` matcher (default export) — it does NOT export `configureAxe` or `axe`. `_test/axe.ts` therefore calls `axe-core` directly (`axe.run` + `axe.configure`) and feeds the `AxeResults` into the package's matcher. Downstream plans that need axe should use the `expectNoAxeViolations` helper, never reach for `configureAxe` from `@chialab/vitest-axe`.

### Plan 22-04 deviations (logged 2026-05-10)

- None. Planner's harness shape and 5-scenario list executed verbatim. Hook contract held under jsdom thanks to the offsetParent polyfill (Plan 22-01). Scenario 3 (Tab cycle) used native `KeyboardEvent` dispatch per PITFALLS §3.3 because the hook attaches a raw keydown listener and reads `document.activeElement` synchronously — documented inline in the test file.

### Plan 22-05 deviations (logged 2026-05-10)

- [Rule 1 - Bug] Initial draft of `Button.test.tsx` used `container.querySelectorAll('[aria-hidden="true"]')` in the spinner-glyph test. Refactored to `btn.firstElementChild + toHaveAttribute('aria-hidden', 'true')` to satisfy the D-02a anti-pattern grep gate (querySelector count must be 0). Same coverage, no DOM reach. Pattern guidance for Plans 06–09: never `querySelector` — query by role then walk via `firstElementChild` / `children` if you need to inspect a hidden glyph or icon.

### Blockers/Concerns

- Component dist rebuild needed before npm publish (carryover from v0.3 — addressed by Phase 26)
- `en-au` template prose pending AU-familiar legal practitioner review (carryover from v0.5)
- PROJECT.md and MILESTONES.md missed v0.4 and v0.5 sync passes — separate cleanup needed
- Storybook esbuild vuln blocks visual regression — out of scope for v0.6, deferred to v0.7+

## Session Continuity

Last session: 2026-05-10T19:15:00Z
Stopped at: Phase 22 Plan 05 complete (TC-02 — Button.test.tsx, 19 tests, template-setter for Wave 2). Plans 06–09 (Checkbox, RadioGroup, FormField, Modal, ErrorSummary, Tabs) ready to mirror Button.test.tsx file shape.
Resume: `/gsd-execute-plan 22-06`
