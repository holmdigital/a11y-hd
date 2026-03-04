---
phase: 07-engine-generator-locale-expansion
plan: 02
subsystem: testing
tags: [locale, i18n, accessibility-statement, vitest, data-driven-tests, eu-locales]

# Dependency graph
requires:
  - phase: 07-engine-generator-locale-expansion
    plan: 01
    provides: 9-locale EVALUATION_METHOD, STATUS_LABELS, and RESPONSE_TIME_DEFAULT lookup maps
provides:
  - 9 locale-specific content verification tests validating evaluationMethod and compliance status text
  - Regression safety net ensuring locale maps produce correct output in all EU locales
affects: [10-validation]

# Tech tracking
tech-stack:
  added: []
  patterns: [data-driven-test-with-it-each, locale-output-verification]

key-files:
  created: []
  modified:
    - packages/engine/src/reporting/statement-generator.test.ts

key-decisions:
  - "Status phrase assertions use template prose text (not STATUS_LABELS map values) since templates embed compliance wording in choice blocks"
  - "Case-insensitive matching for status phrases since template prose uses lowercase within sentences"

patterns-established:
  - "Data-driven locale test pattern: it.each with [lang, evalMethod, statusPhrase] tuples"
  - "Negative assertion pattern: non-English locales must NOT contain English fallback text"

requirements-completed: [ENGI-01, ENGI-02, ENGI-03]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 7 Plan 2: Locale-Specific Content Verification Tests Summary

**9 data-driven tests verifying each EU locale produces locale-specific evaluationMethod and compliance status text in Markdown output, not English fallbacks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T18:21:39Z
- **Completed:** 2026-03-04T18:24:58Z
- **Tasks:** 2 (1 implementation + 1 verification-only)
- **Files modified:** 1

## Accomplishments
- Added 9 data-driven locale-specific content tests using it.each pattern
- Each test verifies evaluationMethod text and compliance status phrase appear in locale-specific form
- Each non-English test verifies no English fallback text ("Automated scan", "partially compliant") is present
- Full test suite passes: 94 tests across 3 packages, zero failures
- Engine build clean with zero warnings

## Task Commits

Each task was committed atomically:

1. **Task 1: Add locale-specific evaluationMethod content verification tests** - `46d960f` (test)
2. **Task 2: Verify full test suite passes and build is clean** - verification only, no commit needed

## Files Created/Modified
- `packages/engine/src/reporting/statement-generator.test.ts` - Added 9 locale-specific content verification tests in new describe block

## Decisions Made
- Status phrase assertions use actual template prose fragments (e.g., German "teilweise mit den Barrierefreiheitsanforderungen vereinbar") rather than STATUS_LABELS map values (e.g., "Teilweise konform"), because templates embed compliance status in full sentences via choice blocks, not via the STATUS_LABELS map
- Case-insensitive matching used for status phrases since template text uses lowercase within sentences while STATUS_LABELS uses title case

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected status label expectations to match actual template output**
- **Found during:** Task 1 (writing locale-specific tests)
- **Issue:** Plan specified STATUS_LABELS map values (e.g., "Teilweise konform", "Gedeeltelijk conform", "Osittain saavutettava") as expected status substrings, but templates use different compliance wording in their choice blocks (e.g., German: "teilweise mit den Barrierefreiheitsanforderungen vereinbar", Dutch: "gedeeltelijk in overeenstemming", Finnish: "osittain")
- **Fix:** Updated test expectations to use actual template prose fragments with case-insensitive matching
- **Files modified:** packages/engine/src/reporting/statement-generator.test.ts
- **Verification:** All 9 locale tests pass with correct assertions
- **Committed in:** 46d960f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in plan expectations)
**Impact on plan:** Auto-fix necessary for correctness. The tests now verify actual locale-specific output rather than map values that don't appear in Markdown output. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 9 EU locales fully tested for both evaluationMethod and compliance status text
- Phase 7 complete: locale lookup maps (07-01) + verification tests (07-02)
- Phase 10 (validation) can build on these tests for comprehensive locale review

## Self-Check: PASSED

- FOUND: packages/engine/src/reporting/statement-generator.test.ts
- FOUND: .planning/phases/07-engine-generator-locale-expansion/07-02-SUMMARY.md
- FOUND: commit 46d960f

---
*Phase: 07-engine-generator-locale-expansion*
*Completed: 2026-03-04*
