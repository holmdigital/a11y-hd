---
phase: 22-test-infra-and-first-7-components
plan: 03
subsystem: components-test-infra
tags: [testing, conventions, ci-guard, ssr-audit, docs]
requires: [22-01]
provides:
  - "TESTING-CONVENTIONS.md (Tier grammar, anti-patterns, helper rules) at top of @holmdigital/components"
  - "WCAG-SC header CI grep guard (test:wcag-headers) chained into test:ci"
  - "SSR consumer audit recorded in PROJECT.md — confirms engine is sole consumer"
affects:
  - "Wave-2 component test plans (22-05..09): MUST include WCAG SCs covered: marker"
  - "Phase 23 styling unification: file-per-component CSS confirmed SSR-safe"
tech_stack:
  added: []
  patterns:
    - "JSDoc WCAG-SC traceability header at top of every component test file"
    - "Two-tier describe block grammar (Tier 1 Table Stakes / Tier 2 A11y Differentiators)"
    - "Plain Node ESM script for CI guard (no eslint custom rule overhead)"
key_files:
  created:
    - "packages/components/TESTING-CONVENTIONS.md"
    - "packages/components/scripts/check-wcag-headers.mjs"
  modified:
    - "packages/components/package.json (add test:wcag-headers; chain into test:ci)"
    - ".planning/PROJECT.md (append SSR Consumer Audit section)"
    - "packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx (backfill WCAG header)"
    - "packages/components/src/Dialog/Dialog.test.tsx (backfill WCAG header)"
    - "packages/components/src/LiveRegion/LiveRegion.test.tsx (backfill WCAG header)"
    - "packages/components/src/Select/Select.test.tsx (backfill WCAG header)"
    - "packages/components/src/Toast/Toast.test.tsx (backfill WCAG header)"
    - "packages/components/src/Tooltip/Tooltip.test.tsx (backfill WCAG header)"
decisions:
  - "Backfill WCAG-SC headers on 6 pre-existing test files rather than ship a guard that fails day-zero CI"
  - "Windows path normalisation in guard script — strip leading slash from import.meta.url pathname"
metrics:
  duration: "~25 minutes"
  completed: "2026-05-10"
  tasks: 3
  commits: 3
  conventions_doc_words: 1140
requirements: [TI-05, TI-06]
---

# Phase 22 Plan 03: Conventions Doc + WCAG Header Guard + SSR Audit — Summary

Codified the test grammar that Wave-2 component plans (22-05..09) will follow, shipped the CI grep guard that enforces the WCAG-SC traceability marker, and recorded the SSR consumer audit confirming `@holmdigital/engine` is the sole consumer of `@holmdigital/components` via `react-dom/server` — unblocking the Phase 23 file-per-component CSS strategy.

## What Shipped

### TI-05 — `packages/components/TESTING-CONVENTIONS.md` (1140 words)

Top-of-package doc (sibling to `package.json`, discoverable from the npm landing page) with eight `##` sections:

1. **Test File Layout** — colocated `Component/Component.test.tsx`, `_test/` for shared scaffolding, `_test/helpers/` for meta-tests
2. **WCAG SCs Covered Header** — required JSDoc block, 30-line window, enforced by `test:wcag-headers`
3. **Tier Grammar** — verbatim `describe('Tier 1: Table Stakes', ...)` / `describe('Tier 2: A11y Differentiators', ...)`; Tier 3 deferred to Phase 24
4. **Helper Usage** — `expectNoAxeViolations` / `expectUniqueIds` / `expectKeyboardSequence` with one usage example each; per-test `configureAxe` forbidden
5. **Anti-Patterns (Hard NO)** — six bullets: no DOM snapshots, no class selectors, no internal-state probing, no `data-testid` on library components, no `fireEvent.click` without paired keyboard test, no coverage-percent chasing
6. **Test Depth (~10–15 tests/component)** — behaviours over combinatorial matrices
7. **Helper Meta-Tests** — happy path + non-negotiable failure-mode (`toThrow(/regex/)`)
8. **What This Library Does NOT Test** — colour-contrast, landmarks, real focus advancement, animation timing

### D-03a — `packages/components/scripts/check-wcag-headers.mjs` + npm wiring

Plain Node ESM script that walks `packages/components/src/`, skips `_test/`, and asserts `WCAG SCs covered:` appears in the first 30 lines of every `*.test.tsx`. Exits 1 with offender list on miss, exits 0 with file count on pass. Wired as:

```json
"test:ci": "vitest run && npm run test:wcag-headers",
"test:wcag-headers": "node scripts/check-wcag-headers.mjs"
```

Verified to fire on missing marker (created `__tmp_check.test.tsx` containing `// no marker`, ran script, confirmed exit 1, deleted temp file).

### TI-06 — SSR Consumer Audit recorded in `.planning/PROJECT.md`

Grep across all source extensions (`*.ts`, `*.tsx`, `*.mts`, `*.cts`, `*.js`, `*.mjs`) for the four React SSR APIs.

**Raw matches:**

```
packages/engine/src/reporting/statement-generator.ts:2:import { renderToStaticMarkup } from 'react-dom/server';
packages/engine/src/reporting/statement-generator.ts:218:        const markup = renderToStaticMarkup(element);
```

**Conclusion:** Engine's `statement-generator.ts` is the **sole** SSR consumer of `@holmdigital/components`. No application code, no other packages, no `renderToString` / `renderToPipeableStream` / `renderToReadableStream` anywhere in the repo.

**Plan-reference correction:** The plan frontmatter cited `packages/engine/src/reporting/html-template.ts` as the known SSR consumer. That file actually builds report HTML via template-literal concatenation; the `renderToStaticMarkup` call lives in `statement-generator.ts` (which materialises the `AccessibilityStatement` React component). The conclusion (engine = sole SSR consumer) is unchanged.

**Phase 23 implication:** Confirms file-per-component CSS side-effect imports are SSR-safe. Phase 23 styling unification may proceed without further audit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Backfilled WCAG-SC headers on 6 pre-existing test files**
- **Found during:** Task 2 (after writing the guard, ran it against the actual tree)
- **Issue:** Plan acceptance criteria stated "no `*.test.tsx` exist yet under `src/*` outside `_test/` that would lack the marker". In reality, six test files already shipped: `AccessibilityStatement.test.tsx`, `Dialog.test.tsx`, `LiveRegion.test.tsx`, `Select.test.tsx`, `Toast.test.tsx`, `Tooltip.test.tsx`. Running the guard on a clean tree exited 1 — the opposite of the plan's stated success criterion.
- **Fix:** Prepended a JSDoc `WCAG SCs covered:` header to each of the six files, choosing SCs that map to what the test file actually exercises (e.g., Dialog → 2.1.1 / 2.4.3 / 4.1.2; Tooltip → 1.4.13 / 2.1.1 / 4.1.2). Headers are minimal (3–4 SCs each); they document what is already tested and do not add new coverage claims.
- **Files modified:** the 6 test files listed under `key_files.modified`.
- **Commit:** `84fa51c chore(components): add WCAG-SC header CI grep guard (D-03a)` — bundled into the same commit as the guard itself, since the guard cannot exit 0 without the headers and shipping a guard that fails day-zero CI is worse than the small backfill scope creep.

**2. [Rule 3 — Blocking] Windows path normalisation in guard script**
- **Found during:** Task 2 (running guard locally on Windows worktree)
- **Issue:** `new URL('../src', import.meta.url).pathname` returns `/D:/.../src` on Windows (leading slash before drive letter), which `readdirSync` rejects with ENOENT.
- **Fix:** Added a one-line regex strip `.replace(/^\/([A-Za-z]:)/, '$1')`. Harmless on POSIX (no drive letter, no match).
- **Files modified:** `packages/components/scripts/check-wcag-headers.mjs`.
- **Commit:** Same as above (`84fa51c`).

**3. [Rule 1 — Documentation Bug] Corrected SSR consumer file path in PROJECT.md**
- **Found during:** Task 3
- **Issue:** Plan frontmatter and several context files identified `packages/engine/src/reporting/html-template.ts` as the SSR consumer. Grep showed zero matches in that file; the actual SSR call is in `statement-generator.ts`.
- **Fix:** Recorded both the corrected file path and a note explaining the discrepancy in PROJECT.md. Conclusion (engine = sole consumer) unchanged.
- **Commit:** `4b022c7 docs(project): record SSR consumer audit finding (TI-06)`.

## Verification

- `node packages/components/scripts/check-wcag-headers.mjs` → exit 0, "6 test file(s) all carry the marker"
- Guard fires correctly on missing marker (verified with temp file, exit 1 with offender path)
- `package.json` `scripts.test:wcag-headers` exists; `scripts.test:ci` chains both `vitest run` and `npm run test:wcag-headers`
- `.planning/PROJECT.md` contains literal heading `## SSR Consumer Audit (Phase 22 / TI-06)` with verbatim grep command, full match list, conclusion, and Phase 23 implication
- `packages/components/TESTING-CONVENTIONS.md` exists at the top of the package directory; contains all 8 named sections, all 6 anti-patterns, all 3 helper names, and the literal strings `Tier 1: Table Stakes`, `Tier 2: A11y Differentiators`, `WCAG SCs covered:`

## Commits

| Task   | Commit    | Message                                                            |
| ------ | --------- | ------------------------------------------------------------------ |
| Task 1 | `17089c8` | docs(components): add TESTING-CONVENTIONS.md (TI-05)               |
| Task 2 | `84fa51c` | chore(components): add WCAG-SC header CI grep guard (D-03a)        |
| Task 3 | `4b022c7` | docs(project): record SSR consumer audit finding (TI-06)           |

## Self-Check: PASSED

- [x] `packages/components/TESTING-CONVENTIONS.md` exists
- [x] `packages/components/scripts/check-wcag-headers.mjs` exists
- [x] `packages/components/package.json` has `test:wcag-headers` and chained `test:ci`
- [x] `.planning/PROJECT.md` contains `## SSR Consumer Audit (Phase 22 / TI-06)` heading
- [x] All three commits present in `git log` (17089c8, 84fa51c, 4b022c7)
- [x] All 6 backfilled test files contain the `WCAG SCs covered:` marker
