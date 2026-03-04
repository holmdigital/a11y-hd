---
phase: 10-verification-and-test-coverage
plan: 01
subsystem: testing
tags: [vitest, locale, accessibility, badge, html-pipeline, smoke-test]

# Dependency graph
requires:
  - phase: 08-component-chrome-locale-maps
    provides: "BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT locale maps for 9 EU locales"
  - phase: 09-en-gb-en-us-en-ca-statement-templates
    provides: "en-gb/en-us/en-ca templates, chrome map entries, jurisdiction content"
provides:
  - "Non-compliant badge text verification for all 12 locales"
  - "Engine HTML output pipeline smoke test confirming delegation to component renderer"
  - "127 locale-related tests with 0 failures, closing Gaps 4 and 5"
affects: [10-02-verification-and-test-coverage]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Object.entries().forEach() pattern for parameterized locale badge tests"]

key-files:
  created: []
  modified:
    - "packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx"
    - "packages/engine/src/reporting/statement-generator.test.ts"

key-decisions:
  - "Hardcoded non-compliant marker map matching established CHROME_BADGE_MARKERS pattern (no import from locale-chrome.ts)"
  - "Single HTML smoke test sufficient since 80 component tests already cover locale rendering"

patterns-established:
  - "CHROME_NON_COMPLIANT_MARKERS map pattern for non-compliant badge text verification"
  - "Engine HTML pipeline smoke test pattern using HTML marker + title marker + placeholder regex"

requirements-completed: [VRFY-01]

# Metrics
duration: 2min
completed: 2026-03-04
---

# Phase 10 Plan 01: Locale Test Coverage Gaps Summary

**Non-compliant badge text verified for all 12 locales plus engine HTML pipeline smoke test, closing Gaps 4 and 5 with 127 passing locale tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T20:22:28Z
- **Completed:** 2026-03-04T20:24:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added 12 non-compliant badge text tests verifying locale-specific badge labels for sv, en, no, fi, da, de, fr, es, nl, en-gb, en-us, en-ca (Gap 4 closure)
- Added engine HTML output pipeline smoke test confirming delegation to component renderer produces valid HTML (Gap 5 closure)
- Full locale test suite passes: 127 tests, 0 failures across engine (31), components (80), and standards (16)
- VRFY-01 coverage confirmed across all 10 validation checklist items

## Task Commits

Each task was committed atomically:

1. **Task 1: Add non-compliant badge and engine HTML smoke tests** - `c394420` (test)
2. **Task 2: Run and document full locale test suite results** - verification-only task, no code changes

## Files Created/Modified
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` - Added CHROME_NON_COMPLIANT_MARKERS map and 12 non-compliant badge text tests
- `packages/engine/src/reporting/statement-generator.test.ts` - Added HTML output pipeline smoke test

## Decisions Made
- Used hardcoded CHROME_NON_COMPLIANT_MARKERS map matching established test file pattern (no import from locale-chrome.ts) for consistency with existing CHROME_BADGE_MARKERS approach
- Single HTML smoke test sufficient -- 80 component tests already cover locale-specific rendering; one delegation test confirms the pipeline end-to-end

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- VRFY-01 fully satisfied with 127 passing locale tests covering evaluationMethod, statusMap, UI chrome (badge full + non-compliant, Updated label, Generated footer), en-* routing, jurisdiction content, placeholder exhaustiveness, and HTML pipeline delegation
- Ready for plan 10-02 (any remaining verification tasks)

## Self-Check: PASSED

- FOUND: packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx
- FOUND: packages/engine/src/reporting/statement-generator.test.ts
- FOUND: .planning/phases/10-verification-and-test-coverage/10-01-SUMMARY.md
- FOUND: commit c394420

---
*Phase: 10-verification-and-test-coverage*
*Completed: 2026-03-04*
