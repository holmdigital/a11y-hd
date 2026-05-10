---
phase: 23-styling-unification
plan: 04
subsystem: components
tags: [styling, breadcrumbs, css, tailwind-migration, sty-01, sty-03, sty-04, sty-05, sty-06]
requires:
  - 23-01  # build infra (tsup config, exports map, STY-05 guard script, sideEffects)
provides:
  - "Breadcrumbs co-located CSS + theming surface"
  - "STY-05 guard wired into test:ci (bootstrap-defer flipped)"
  - "Phase 23 wave-2 closeout — all 3 scoped dirs (Tabs+Accordion+Breadcrumbs) Tailwind-free"
affects:
  - packages/components/src/Breadcrumbs/Breadcrumbs.tsx
  - packages/components/src/Breadcrumbs/Breadcrumbs.css
  - packages/components/src/Breadcrumbs/Breadcrumbs.test.tsx
  - packages/components/package.json
tech-stack:
  added: []
  patterns:
    - "Co-located component CSS imported as ES side-effect"
    - "CSS custom-property theming (var(--token, default)) with embedded fallbacks"
    - "Current-page styling via [aria-current=\"page\"] attribute selector (no modifier class)"
    - "BEM naming (hd-breadcrumbs__element--modifier)"
key-files:
  created:
    - packages/components/src/Breadcrumbs/Breadcrumbs.css
    - packages/components/src/Breadcrumbs/Breadcrumbs.test.tsx
    - .planning/phases/23-styling-unification/23-04-SUMMARY.md
  modified:
    - packages/components/src/Breadcrumbs/Breadcrumbs.tsx
    - packages/components/package.json
decisions:
  - "Current-page styling keyed off aria-current=\"page\" attribute selector — NOT a modifier class. Single source of truth (ARIA attribute); CSS regex smoke test guards against future refactor dropping the hook."
  - "Separator SVG keeps stroke=\"currentColor\" — CSS rule sets `color: var(--hd-breadcrumbs-separator-color, …)` and the SVG inherits via currentColor."
  - "package.json exports map untouched in this plan — the ./Breadcrumbs.css entry was already added by 23-01 (Wave 1 consolidation). Only scripts.test:ci was modified."
metrics:
  duration: "~25 min"
  completed: "2026-05-10"
  tasks: 3
  tests-added: 5
  tests-total: 299
  test-files: 20
---

# Phase 23 Plan 04: Breadcrumbs Tailwind→CSS Migration + STY-05 CI Wire-in Summary

Migrated `Breadcrumbs.tsx` off Tailwind utility classes onto co-located `Breadcrumbs.css` with a 5-property `--hd-breadcrumbs-*` theming surface, and flipped `scripts.test:ci` to chain `check:no-tailwind-leak` as the final CI step — closing the bootstrap defer from Plan 23-01 and making STY-05 enforceable across the 3 scoped dirs (Tabs, Accordion, Breadcrumbs).

## Theming Surface (final)

| Custom property                       | Default   | Role                              |
| ------------------------------------- | --------- | --------------------------------- |
| `--hd-breadcrumbs-current-color`      | `#0f172a` | Current-page text                 |
| `--hd-breadcrumbs-link-color`         | `#64748b` | Resting link colour               |
| `--hd-breadcrumbs-link-hover-color`   | `#334155` | Link hover colour                 |
| `--hd-breadcrumbs-focus-ring`         | `#3b82f6` | `:focus-visible` outline          |
| `--hd-breadcrumbs-separator-color`    | `#94a3b8` | Separator icon colour (via `currentColor` cascade) |

All defaults are embedded inside `var(--token, <default>)` inside `Breadcrumbs.css` per A1 (research recommendation: defaults in CSS, never in JSX inline style).

## 7 Tailwind → BEM migrations

| # | Original (Tailwind)                                                              | Replacement (BEM)                              |
| - | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1 | current li: `flex items-center text-slate-900 font-semibold ${className}`        | `hd-breadcrumbs__item` + `aria-current="page"` (CSS attribute selector handles styling) + passthrough |
| 2 | link li:    `flex items-center text-slate-500 hover:text-slate-700 transition-colors ${className}` | `hd-breadcrumbs__item hd-breadcrumbs__item--link` + passthrough |
| 3 | link a:     `hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-sm` | `hd-breadcrumbs__link`           |
| 4 | separator svg: `text-slate-400 mx-2`                                             | `hd-breadcrumbs__separator` (color cascades via `currentColor`) |
| 5 | nav:        `${className}` (passthrough only)                                    | `hd-breadcrumbs ${className}` (default + passthrough) |
| 6 | ol:         `flex items-center flex-wrap`                                        | `hd-breadcrumbs__list`                         |
| 7 | separator li: `flex items-center select-none`                                    | `hd-breadcrumbs__separator-item`               |

## test:ci wire-in (the bootstrap-defer flip)

`packages/components/package.json` `scripts.test:ci`:

```diff
- "test:ci": "vitest run && npm run test:wcag-headers",
+ "test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak",
```

This is the **only** `package.json` edit this plan produced. The exports map entry `"./Breadcrumbs.css": "./dist/Breadcrumbs/Breadcrumbs.css"` was already in place from Plan 23-01.

## Verification results (in this isolated worktree)

| Check | Result |
| ----- | ------ |
| Breadcrumbs.css regex contract (`:focus-visible`, ≥4 `var()`, `[aria-current="page"]`, separator rule, link hover) | PASS (5 var refs, all selectors present) |
| Breadcrumbs.tsx regex contract (`import './Breadcrumbs.css'`, JSDoc theming API, BEM classes) | PASS |
| `package.json scripts.test:ci` contains `check:no-tailwind-leak` | PASS |
| `npm run build` (tsup) JS/MJS/CSS emission for Breadcrumbs | PASS — `dist/Breadcrumbs/Breadcrumbs.css` written (nested layout) |
| Vitest full suite                                          | **20 files, 299 tests passing** (was 19/294 pre-plan; added 5 Breadcrumbs smoke tests) |
| `npm run test:wcag-headers`                                | PASS — 16 files with WCAG marker (15 baseline + Breadcrumbs smoke). After merging 23-02 + 23-03 the orchestrator will see 17. |
| D-02a anti-pattern gate in `Breadcrumbs.test.tsx`          | CLEAN — 0 `querySelector` / `configureAxe` / `toMatchSnapshot` |
| `grep` Tailwind tokens in `Breadcrumbs.tsx`                | 0 hits |
| Source-side Breadcrumbs scoped guard (scanning `dist/Breadcrumbs/*.js`) | 0 offenders |
| `node scripts/check-no-tailwind-leak.mjs` (whole scoped set, isolated worktree) | EXIT 1 — **expected** (Tabs + Accordion dist still has Tailwind because 23-02 + 23-03 run in parallel worktrees). The orchestrator's post-merge run will be 0 offenders. Documented per prompt directive. |

### Verification approach for the STY-05 guard in this worktree

The user/orchestrator prompt explicitly stated: *"DO NOT block this plan on the guard exit code in your isolated worktree — the bootstrap state is by design."* I chose option **(b)** from the prompt — I ran the guard, confirmed only Tabs/Accordion offenders remain, and ran a **manually scoped re-check** over just `dist/Breadcrumbs/**` which reports **0 offenders**. This proves THIS plan's contribution is clean; the orchestrator's post-wave merge will collapse the remaining offenders to zero.

## Pre-existing build issues (deferred, NOT touched per directive)

- `src/LiveRegion/LiveRegion.tsx:37` — `TS2503: Cannot find namespace 'NodeJS'.` Affects `tsup` DTS emit step; JS/MJS/CSS still emit successfully. Per orchestrator directive: **do NOT auto-fix.** Defer to a follow-up plan.
- `packages/engine/src/core/regulatory-scanner.ts:7` — `TS2307: Cannot find module 'puppeteer'`. Pre-existing in this worktree's snapshot; unrelated to Breadcrumbs migration.

## Deviations from Plan

**1. [Pre-execution] Merge master into worktree**
- **Found during:** initial context load
- **Issue:** Worktree HEAD was on `5ce4646` (master release-merge commit), which does NOT include phase 23 commits (`f1cbca5` etc.). The plan's prerequisites (Plan 23-01 build infra: `tsup.config.ts`, `scripts/check-no-tailwind-leak.mjs`, the `./Breadcrumbs.css` exports entry, the `sideEffects` field) were missing.
- **Fix:** Ran `git merge master --no-edit` to pull phase 23 infra into the worktree. Resolved one `package.json` conflict by keeping version `2.4.0` (newer, from HEAD) and the `license: MIT` field (from master). Committed as `020c914 merge master into worktree (phase 23 infra + version 2.4.0)`.
- **Rationale:** Without this merge, none of Plan 23-04's verification steps could run (no guard script, no exports entry, no tsup config emitting `dist/Breadcrumbs/Breadcrumbs.css`). The merge was idempotent infrastructure pull — no logic changes, no plan-scope expansion.
- **Files modified:** `packages/components/package.json` (conflict resolution only)
- **Commit:** `020c914`

**2. [Documented expected behaviour, not a fix] STY-05 guard exits non-zero in isolated worktree**
- Tabs and Accordion live in their own parallel worktrees; `dist/Tabs/` and `dist/Accordion/` in THIS worktree still contain Tailwind tokens compiled into JS. The guard exits 1 as a result. This is **by design per the orchestrator's instructions** and will resolve to 0 after the wave-2 merge.

## Engine SSR consumer smoke

`npm run build -w @holmdigital/engine` does NOT cleanly exit 0 in this isolated worktree due to the pre-existing puppeteer types issue (`TS2307` in `regulatory-scanner.ts`). This is unrelated to the Breadcrumbs migration — the engine source files never import or reference Breadcrumbs. The wave-merge state in master at execution time will resolve this; further validation deferred to the orchestrator's post-merge run.

## Phase 23 closeout cross-reference

When 23-02 (Tabs) and 23-03 (Accordion) worktrees are merged alongside this one:

| ROADMAP Phase 23 success criterion | Status after 23-02 + 23-03 + 23-04 |
| ---------------------------------- | ---------------------------------- |
| Tabs, Accordion, Breadcrumbs zero Tailwind in `className=` | ✓ (this plan completes Breadcrumbs; sibling plans complete Tabs/Accordion) |
| Co-located CSS emitted at exported subpath | ✓ (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css` exports all present from 23-01; tsup emits nested layout for all 3) |
| CSS custom-property theming surface for each | ✓ (`--hd-tabs-*`, `--hd-accordion-*`, `--hd-breadcrumbs-*` per plan) |
| `:focus-visible` smoke test per migrated component | ✓ (Breadcrumbs smoke test added in this plan; Tabs/Accordion in their plans) |
| STY-05 guard wired into CI; className prop passthrough preserved (STY-06) | ✓ (this plan's `test:ci` flip; STY-06 unchanged — `BreadcrumbsProps`/`BreadcrumbItemProps` extend native HTMLAttributes and merge `className`) |

Refs: `.planning/phases/23-styling-unification/23-01-SUMMARY.md`, `23-02-SUMMARY.md` (sibling), `23-03-SUMMARY.md` (sibling).

## Pointer for STY-07 / v0.7

`packages/components/scripts/check-no-tailwind-leak.mjs` currently scopes via `const SCOPED_DIRS = ['Tabs', 'Accordion', 'Breadcrumbs'];`. As STY-07 lands and remaining components migrate off Tailwind, extend `SCOPED_DIRS` accordingly. Once every component ships with a sibling `.css`, flip the script to scan the whole `dist/` tree (per the script's own header comment) and retire `SCOPED_DIRS`.

## Self-Check: PASSED

- `packages/components/src/Breadcrumbs/Breadcrumbs.css` — FOUND (78 lines, 5 var refs, all required selectors)
- `packages/components/src/Breadcrumbs/Breadcrumbs.tsx` — FOUND (refactored, side-effect import + JSDoc + BEM)
- `packages/components/src/Breadcrumbs/Breadcrumbs.test.tsx` — FOUND (5/5 tests passing, WCAG marker, D-02a clean)
- `packages/components/package.json` — `test:ci` chain includes `check:no-tailwind-leak` (verified)
- Commits: `41041e3`, `cbd736e`, `ca728b0` — all present in `git log`
