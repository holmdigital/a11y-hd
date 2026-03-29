---
phase: 18-au-standards-foundation
plan: 01
subsystem: standards
tags: [typescript, accessibility, legal, australia, dda, wcag, enforcement]

# Dependency graph
requires: []
provides:
  - LegalFramework type extended with 'DDA'
  - Country type extended with 'AU'
  - AU entries in ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED (AHRC)
  - au-dda and au-dta entries in national-laws.json
  - getNationalLawByFramework('DDA', 'AU') returns au-dda (scope both)
  - getEnforcementBody('AU', 'private') returns AHRC
affects:
  - 19-au-engine-integration
  - 20-au-locale-templates
  - 21-au-release

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Non-EU jurisdictions use euFramework field with framework-specific value (DDA, not WAD/EAA)
    - AHRC is used for both wad and eaa keys in ENFORCEMENT_BODIES_DETAILED for AU (single body)
    - au-dda must be first array entry for getNationalLawByFramework Array.find to return it

key-files:
  created: []
  modified:
    - packages/standards/src/types.ts
    - packages/standards/src/index.ts
    - packages/standards/data/legal/national-laws.json
    - packages/standards/src/index.test.ts

key-decisions:
  - "DDA as new LegalFramework value (not reusing WAD/EAA) to avoid EU directive references in AU output"
  - "AHRC is enforcement body for both public and private AU sectors (single body, unlike EU countries)"
  - "au-dda placed first in AU array so getNationalLawByFramework returns it (scope both, general law)"
  - "au-dta placed second as government-specific policy with scope public"

patterns-established:
  - "Non-EU national frameworks: add distinct LegalFramework value rather than mapping to WAD/EAA"
  - "Single enforcement body countries: set both wad and eaa keys to same value in ENFORCEMENT_BODIES_DETAILED"

requirements-completed: [STD-01, STD-02, STD-03, STD-04]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 18 Plan 01: AU Standards Foundation Summary

**Australia jurisdiction added to @holmdigital/standards with DDA framework type, AHRC enforcement body, and two national law entries (au-dda scope both, au-dta scope public) — 39 tests passing**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-28T18:24:54Z
- **Completed:** 2026-03-28T18:27:25Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended `LegalFramework` type with `'DDA'` and `Country` type with `'AU'` — TypeScript build passes with both Record<Country> maps fully populated
- Added AHRC to both `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` (17 countries total)
- Added `au-dda` (Disability Discrimination Act 1992, scope both, enforcer AHRC) and `au-dta` (Digital Experience Policy, scope public, enforcer DTA) to `national-laws.json`
- Updated test suite from 16 to 17 countries with full AU assertion coverage — all 39 tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend types, add AU enforcement bodies, and add AU national law JSON entries** - `be09165` (feat)
2. **Task 2: Update tests with AU assertions and country count** - `fcc1451` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/standards/src/types.ts` - Added 'DDA' to LegalFramework, 'AU' to Country
- `packages/standards/src/index.ts` - Added AU entries to ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED
- `packages/standards/data/legal/national-laws.json` - Added "AU" key with au-dda and au-dta entries
- `packages/standards/src/index.test.ts` - Updated ALL_COUNTRIES, count assertions (16→17), added AU-specific tests and National Laws — AU describe block

## Decisions Made
- Used `'DDA'` as a new `LegalFramework` value rather than reusing `'WAD'` to prevent AU templates from referencing the EU Web Accessibility Directive — this was a confirmed v0.5 decision from STATE.md
- AHRC is set as enforcement body for both wad and eaa keys in ENFORCEMENT_BODIES_DETAILED because Australia has a single enforcement body for both public and private sectors (unlike EU members)
- `au-dda` placed before `au-dta` in the AU array — `getNationalLawByFramework` uses `Array.find` so ordering determines which entry is returned for a framework query; au-dda (general law, scope both) is the primary entry

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AU type foundation complete — Phase 19 (au-engine-integration) can now reference `Country = 'AU'`, `LegalFramework = 'DDA'`, and call `getEnforcementBody('AU', ...)` and `getNationalLawByFramework('DDA', 'AU')`
- No blockers

---
*Phase: 18-au-standards-foundation*
*Completed: 2026-03-28*
