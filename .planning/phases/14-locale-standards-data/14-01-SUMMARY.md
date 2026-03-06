---
phase: 14-locale-standards-data
plan: 01
subsystem: database
tags: [standards, country, enforcement-bodies, national-laws, typescript, portugal, poland, italy]

# Dependency graph
requires: []
provides:
  - Country type extended with PT and PL
  - ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED maps with PT and PL entries
  - national-laws.json entries for IT (WAD + EAA), PT (WAD + EAA), PL (WAD + EAA)
  - Test coverage for all 6 new national law entries and 2 new enforcement bodies
affects:
  - 15-engine-templates (PT and PL enforcement body strings for template rendering)
  - 16-component-templates (IT/PT/PL national law lookups for compliance components)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD red-green for data expansion: write failing tests, verify failure, add data, verify green"
    - "Country-keyed national law arrays: each country key maps to [WAD, EAA] tuple in national-laws.json"

key-files:
  created: []
  modified:
    - packages/standards/src/types.ts
    - packages/standards/src/index.ts
    - packages/standards/data/legal/national-laws.json
    - packages/standards/src/index.test.ts

key-decisions:
  - "Added PT and PL after IT in Country union (before GB) to maintain geographic grouping"
  - "All new national law sanctions set to minAmount=0 maxAmount=0 as amounts are not publicly confirmed"
  - "IT EAA law D.Lgs. 82/2024 and both PT/PL EAA laws marked inForce=true with effectiveDate 2025-06-28"

patterns-established:
  - "National law WAD entry always precedes EAA entry in the per-country array"
  - "Enforcement body names use English form in parentheses after native acronym"

requirements-completed: [STD-03, STD-04]

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 14 Plan 01: Locale Standards Data Summary

**Country type expanded to PT and PL with enforcement body maps and national law records (WAD + EAA) for IT, PT, and PL — 33 tests all green**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T22:06:32Z
- **Completed:** 2026-03-06T22:09:32Z
- **Tasks:** 2 (4 atomic commits via TDD)
- **Files modified:** 4

## Accomplishments

- Country union in types.ts now includes 'PT' | 'PL' (16 countries total)
- ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED each expanded from 14 to 16 entries
- national-laws.json gains 6 new entries across IT, PT, PL (WAD + EAA each)
- All 33 standards tests pass with new PT/PL enforcement body and IT/PT/PL national law assertions

## Task Commits

Each task was committed atomically using TDD:

1. **Task 1 RED: Failing tests for PT/PL enforcement bodies** - `081eeb9` (test)
2. **Task 1 GREEN: Country type + enforcement body maps** - `34aa272` (feat)
3. **Task 2 RED: Failing tests for IT/PT/PL national laws** - `b5e8622` (test)
4. **Task 2 GREEN: national-laws.json IT/PT/PL entries** - `6d20be5` (feat)

_Note: TDD tasks have 2 commits each (test RED, feat GREEN)_

## Files Created/Modified

- `packages/standards/src/types.ts` - Added 'PT' | 'PL' to Country union after 'IT'
- `packages/standards/src/index.ts` - Added PT and PL entries to ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED
- `packages/standards/data/legal/national-laws.json` - Added IT (Legge 4/2004 + D.Lgs. 82/2024), PT (DL 83/2018 + DL 101-D/2023), PL (Ustawa o dostepnosci cyfrowej + Ustawa o dostepnosci produktow i uslug) entries
- `packages/standards/src/index.test.ts` - Updated ALL_COUNTRIES array, toHaveLength(14) to (16), added PT/PL enforcement body tests and National Laws describe block

## Decisions Made

- Added PT and PL after IT in the Country union to maintain rough geographic grouping (before GB)
- Sanctions for all new entries use minAmount=0 maxAmount=0 since official confirmed figures are not published
- EAA laws for IT, PT, and PL all carry inForce=true with effectiveDate 2025-06-28 (EU EAA application deadline)
- IT WAD law (Legge 4/2004) uses inForce=true since it predates WAD and has been in effect since 2004

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 15 (engine templates) can now reference PT and PL enforcement bodies via getEnforcementBody()
- Phase 16 (component templates) can now reference IT, PT, PL national laws via getNationalLawByFramework()
- All data is typed correctly — Country type enforces PT and PL are valid at compile time

---
*Phase: 14-locale-standards-data*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: packages/standards/src/types.ts
- FOUND: packages/standards/src/index.ts
- FOUND: packages/standards/data/legal/national-laws.json
- FOUND: packages/standards/src/index.test.ts
- FOUND: .planning/phases/14-locale-standards-data/14-01-SUMMARY.md
- FOUND commit 081eeb9 (test RED: PT/PL enforcement bodies)
- FOUND commit 34aa272 (feat GREEN: Country type + enforcement maps)
- FOUND commit b5e8622 (test RED: IT/PT/PL national laws)
- FOUND commit 6d20be5 (feat GREEN: national-laws.json entries)
