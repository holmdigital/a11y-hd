---
gsd_state_version: 1.0
milestone: v0.6
milestone_name: Components Quality
status: executing
stopped_at: Phase 22 Wave 2 complete (Plans 02 + 03)
last_updated: "2026-05-10T17:10:00Z"
last_activity: 2026-05-10 — Phase 22 Wave 2 complete (Plan 02 axe+helpers, Plan 03 conventions+guard+SSR audit)
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 10
  completed_plans: 3
  percent: 30
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-10)

**Core value:** The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.
**Current focus:** Phase 22 — test-infra-and-first-7-components

## Current Position

Phase: 22 (test-infra-and-first-7-components) — EXECUTING
Plan: 3 of 9 (Plans 01 + 02 complete: TI-01..04 — test infra + axe wrapper + helpers)
Status: Executing Phase 22 — Wave 2 partly landed (22-02), 22-03 in parallel; component plans 22-04..09 unblocked once 22-03 completes
Last activity: 2026-05-10 -- Phase 22 plan 02 complete (axe wrapper + helpers TI-03 + TI-04)

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

### Blockers/Concerns

- Component dist rebuild needed before npm publish (carryover from v0.3 — addressed by Phase 26)
- `en-au` template prose pending AU-familiar legal practitioner review (carryover from v0.5)
- PROJECT.md and MILESTONES.md missed v0.4 and v0.5 sync passes — separate cleanup needed
- Storybook esbuild vuln blocks visual regression — out of scope for v0.6, deferred to v0.7+

## Session Continuity

Last session: 2026-05-10T17:03:20Z
Stopped at: Phase 22 Plan 02 complete (TI-03 + TI-04 — axe wrapper + helpers + meta-tests). Plan 22-03 runs in parallel; component plans 22-04..09 unblock when 22-03 completes.
Resume: `/gsd-execute-plan 22-03` (or next plan in Wave 2)
