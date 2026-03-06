---
phase: 12-engine-national-compliance
plan: 02
subsystem: testing
tags: [vitest, accessibility, templates, i18n, national-law, eu-compliance, json]

# Dependency graph
requires:
  - phase: 12-01
    provides: "{<national_law>} substitution key registered in statement-generator substitution map"
provides:
  - "8 EU locale templates updated to use {<national_law>} placeholder (replacing all hardcoded law names)"
  - "Per-locale enforcement body and national law name tests for all 8 EU locales"
  - "TLD detection EU locale tests (.de, .fr, .nl, .es)"
affects: [13-component-statement, any phase touching EU locale templates]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Template placeholder pattern: replace hardcoded law names with {<national_law>} for dynamic substitution", "Test pattern: it.each([locale, country]) with getEnforcementBody/getNationalLawByFramework for auto-syncing assertions"]

key-files:
  created: []
  modified:
    - "packages/engine/src/reporting/templates/sv.json"
    - "packages/engine/src/reporting/templates/no.json"
    - "packages/engine/src/reporting/templates/da.json"
    - "packages/engine/src/reporting/templates/nl.json"
    - "packages/engine/src/reporting/templates/de.json"
    - "packages/engine/src/reporting/templates/fr.json"
    - "packages/engine/src/reporting/templates/es.json"
    - "packages/engine/src/reporting/templates/fi.json"
    - "packages/engine/src/reporting/statement-generator.test.ts"

key-decisions:
  - "DE template: replaced EU directive reference entirely with {<national_law>} (BITV 2.0) — more specific and accurate than the directive citation"
  - "ES template: replaced directive reference + generic 'estándar' with {<national_law>} (UNE 139803) in intro and how-accessible sections"
  - "FR template: replaced both loi reference in intro AND RGAA references in how-accessible/what-to-do with {<national_law>} (RGAA) — consistent single source"
  - "FI template: enforcement section had descriptive phrase 'digitaalisten palvelujen saavutettavuutta koskevan lain' — also replaced with {<national_law>} for full coverage"
  - "Test assertions auto-sync with standards data: using getEnforcementBody() and getNationalLawByFramework() directly in test expectations, so tests never need manual updates when law names change"

patterns-established:
  - "EU locale template test pattern: it.each(euLocales) with explicit metadata.country to isolate from TLD detection"
  - "Standards-sourced assertions: test expectations call the same standards functions as production code — no duplicated hardcoded strings in tests"

requirements-completed: [ENG-02, ENG-04]

# Metrics
duration: 12min
completed: 2026-03-06
---

# Phase 12 Plan 02: EU Locale Templates and Test Coverage Summary

**8 EU locale JSON templates updated with {<national_law>} placeholder and 20 new per-locale tests verifying enforcement body and national law name in generated Markdown output**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-06T05:58:00Z
- **Completed:** 2026-03-06T06:10:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- All 8 EU locale templates now use {<national_law>} instead of hardcoded law names (zero remaining hardcoded law references)
- 20 new tests: 8 enforcement body assertions + 8 national law assertions + 4 EU TLD enforcement body assertions
- Test suite grows from 43 to 63 tests, all passing
- TypeScript compiles cleanly after changes
- Placeholder exhaustiveness test confirms no leftover {<national_law>} in output (substitution resolves correctly for all 8 locales)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update 8 EU locale templates with {<national_law>} placeholder** - `535b119` (feat)
2. **Task 2: Add per-locale enforcement body and law name tests** - `8848f7c` (test)

## Files Created/Modified
- `packages/engine/src/reporting/templates/sv.json` - replaced hardcoded law name in intro, enforcement, and technical sections (3 occurrences)
- `packages/engine/src/reporting/templates/no.json` - replaced hardcoded law name in intro, enforcement, and technical sections (3 occurrences)
- `packages/engine/src/reporting/templates/da.json` - replaced hardcoded law name in intro, enforcement, and technical sections (3 occurrences)
- `packages/engine/src/reporting/templates/nl.json` - replaced hardcoded law name in intro, enforcement, and technical sections (3 occurrences)
- `packages/engine/src/reporting/templates/de.json` - replaced EU directive reference with {<national_law>} in intro, technical (choice block), and enforcement sections
- `packages/engine/src/reporting/templates/fr.json` - replaced "loi n° 2005-102" in intro and all RGAA references in how-accessible/what-to-do sections
- `packages/engine/src/reporting/templates/es.json` - replaced directive reference with {<national_law>} in intro, how-accessible choice block, and enforcement section
- `packages/engine/src/reporting/templates/fi.json` - replaced "digitaalisten palvelujen tarjoamisesta annetun lain" and enforcement descriptive phrase with {<national_law>}
- `packages/engine/src/reporting/statement-generator.test.ts` - added imports (getEnforcementBody, getNationalLawByFramework, Country), added 2 new describe blocks with 20 new it.each tests

## Decisions Made
- DE/ES templates: replaced directive citation entirely (not alongside) with {<national_law>} — specific law name is more useful in a statement than a directive reference
- FR: RGAA replaced in both the how-accessible choice block AND the what-to-do section "Non-conformité" heading — ensures consistency throughout
- FI enforcement section: descriptive law phrase (not the exact title) was also replaced for complete coverage
- Test assertions reference the same standards functions as production code — no static strings that could drift

## Deviations from Plan

None - plan executed exactly as written. All 8 templates updated per the action table. Both test describe blocks added as specified. The `statement-generator.test.ts` Plan 01 cleanup (uncommitted changes from prior execution) was included in the Task 1 commit to maintain clean history.

## Issues Encountered
None - substitution infrastructure from Plan 01 worked correctly for all 8 locales. The FR template initially had `RGAA\b` matching concern (as it's also the law abbreviation in the substitution result "Référentiel Général d'Amélioration de l'Accessibilité (RGAA)") but this is expected and correct — the abbreviated form in the output is inside the full resolved law name.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 12 complete: engine Markdown path now fully national-law-aware for all 8 EU locales
- Phase 13 (Component Statement) can read the same {<national_law>} substitution pattern — it already uses the standards package
- All 63 statement-generator tests pass; TypeScript clean
- No blockers

---
*Phase: 12-engine-national-compliance*
*Completed: 2026-03-06*
