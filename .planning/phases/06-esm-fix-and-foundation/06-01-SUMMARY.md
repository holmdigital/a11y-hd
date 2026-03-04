---
phase: 06-esm-fix-and-foundation
plan: 01
subsystem: engine
tags: [tsup, esm, cjs, shims, i18n, templates, vitest, placeholder-validation]

# Dependency graph
requires: []
provides:
  - "Clean ESM/CJS dual build with zero warnings"
  - "Single canonical template path using __dirname (shimmed by tsup)"
  - "Data-driven placeholder exhaustiveness test covering all 9 EU locale templates"
  - "All 10 pre-existing placeholder mismatches fixed across da, es, fr, nl, no locales"
affects: [07-locale-content, 08-locale-content, 09-locale-content]

# Tech tracking
tech-stack:
  added: []
  patterns: ["tsup shims: true for ESM __dirname support", "data-driven vitest with fs.readdirSync template discovery"]

key-files:
  created:
    - "packages/engine/src/reporting/statement-generator.test.ts"
  modified:
    - "packages/engine/tsup.config.ts"
    - "packages/engine/src/reporting/statement-generator.ts"

key-decisions:
  - "Removed English fallback for missing templates; throw clear error instead"
  - "Added both accent variants for method placeholder keys (metode/metodo/methode alongside existing)"
  - "Test uses fs.readdirSync for automatic template discovery rather than hardcoded list"

patterns-established:
  - "tsup shims: true enables __dirname in ESM output without manual import.meta.url conditionals"
  - "Single canonical template path: path.join(__dirname, 'templates', lang + '.json')"
  - "Placeholder exhaustiveness testing: generate Markdown output and regex-check for leftover {<...>} markers"

requirements-completed: [FOUND-01, FOUND-02]

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 6 Plan 01: ESM Fix and Foundation Summary

**Eliminated ESM import.meta warning via tsup shims, simplified 3-path template fallback to single canonical path, and added data-driven placeholder exhaustiveness test covering all 9 EU locale templates**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T04:49:11Z
- **Completed:** 2026-03-04T04:53:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Engine builds with zero `import.meta` warnings in both CJS and ESM output
- Template loading simplified from ~40 lines of 3-path fallback to 8 lines with single canonical path and clear error
- Fixed 8 missing placeholder substitution keys across 5 locales (da, es, fr, nl, no)
- Created data-driven test that automatically discovers templates and verifies exhaustive placeholder substitution
- Full test suite passes: 85 tests across 3 packages with zero failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix ESM warning and simplify template path resolution** - `5b81874` (fix)
2. **Task 2: Create placeholder exhaustiveness test** - `9b37753` (test)

## Files Created/Modified
- `packages/engine/tsup.config.ts` - Added `shims: true` for ESM __dirname support
- `packages/engine/src/reporting/statement-generator.ts` - Removed fileURLToPath/import.meta conditional, simplified template loading, fixed 8 placeholder mismatches
- `packages/engine/src/reporting/statement-generator.test.ts` - New data-driven test: 9 locale exhaustiveness tests + error path + discovery verification (11 tests total)

## Decisions Made
- Removed English fallback for missing templates: throw a clear error with expected file path instead. Callers can catch and retry with `lang='en'` if they want fallback behavior.
- Added both accent/spelling variants for mismatched placeholder keys (e.g., both `metode` and `metodo`) rather than changing templates, ensuring maximum compatibility.
- Test uses `fs.readdirSync` for template discovery so new templates added in Phases 7-9 are automatically picked up without test changes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Clean build baseline established for Phases 7-9 locale content work
- Placeholder exhaustiveness test will automatically catch any new template mismatches
- Template path resolution is ready for en-gb/en-us/en-ca templates in Phase 9

---
*Phase: 06-esm-fix-and-foundation*
*Completed: 2026-03-04*
