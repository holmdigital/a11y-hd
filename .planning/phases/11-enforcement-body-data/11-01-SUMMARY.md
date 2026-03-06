---
phase: 11-enforcement-body-data
plan: 01
subsystem: api
tags: [typescript, enforcement-bodies, wad, eaa, accessibility, eu-compliance]

# Dependency graph
requires: []
provides:
  - "ENFORCEMENT_BODIES map with 14 countries (SE, NO, DK, FI, NL, DE, FR, ES, IE, IT, GB, US, CA, EU) using English names"
  - "ENFORCEMENT_BODIES_DETAILED map with { wad, eaa } dual-body entries for all 14 countries"
  - "getEnforcementBody(country, sector?) helper function returning WAD or EAA body by sector"
  - "Country type expanded to include 'IT' (Italy)"
affects: [12-enforcement-templates, 13-national-law-templates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WAD/EAA dual-body data pattern: parallel maps ENFORCEMENT_BODIES (WAD default) and ENFORCEMENT_BODIES_DETAILED ({ wad, eaa })"
    - "Helper function sector parameter pattern: getEnforcementBody(country, sector?) defaulting to WAD (public)"
    - "English-only map with 'Full Official Name (Abbreviation)' naming convention"

key-files:
  created: []
  modified:
    - "packages/standards/src/types.ts"
    - "packages/standards/src/index.ts"
    - "packages/standards/src/index.test.ts"

key-decisions:
  - "Keep ENFORCEMENT_BODIES as Record<Country, string> for backwards compatibility (WAD body by default)"
  - "Add ENFORCEMENT_BODIES_DETAILED: Record<Country, { wad, eaa }> for dual-body storage without breaking existing API"
  - "getEnforcementBody() defaults to WAD (public sector) — callers pass sector='private' explicitly for EAA"
  - "All names in English using 'Full Official Name (Abbreviation)' format — localization happens at output layer"
  - "Non-EU countries (GB, US, CA) use same body for both wad and eaa fields to maintain complete Record<Country> shape"
  - "EU meta-entry: WAD=DG CNECT, EAA=DG JUST (different DGs for different frameworks)"
  - "IT Country type addition causes downstream Record<Country> compile errors in engine/components — deferred to Phase 12/13 per plan"

patterns-established:
  - "Dual-map pattern: simple string map for defaults + detailed object map for extended data, both keyed on Country"
  - "Sector parameter pattern: optional 'public' | 'private' parameter with public as default"

requirements-completed: [STD-01, STD-02]

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 11 Plan 01: Enforcement Body Data Summary

**Expanded enforcement body data layer with 14-country dual WAD/EAA storage, normalized English names, and getEnforcementBody() helper using Record<Country, { wad, eaa }> pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T03:40:45Z
- **Completed:** 2026-03-06T03:43:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 'IT' (Italy) to Country union type, expanding from 13 to 14 members
- Normalized all ENFORCEMENT_BODIES entries to English using 'Full Official Name (Abbreviation)' convention, including fixing Swedish/German/French names and adding Italy (AgID)
- Added ENFORCEMENT_BODIES_DETAILED with { wad, eaa } dual-body entries for all 14 countries, covering both WAD monitoring bodies and EAA market surveillance authorities
- Added getEnforcementBody(country, sector?) helper that returns WAD body by default and EAA body when sector='private'
- 26/26 tests pass (16 existing + 10 new enforcement body tests), zero TypeScript errors, clean build

## Task Commits

Each task was committed atomically:

1. **TDD RED - Failing enforcement body tests** - `3d5a96f` (test)
2. **Task 1: IT to Country type + ENFORCEMENT_BODIES** - `00bc03a` (feat)
3. **Task 2: ENFORCEMENT_BODIES_DETAILED + getEnforcementBody()** - `072593c` (feat)

_Note: TDD tasks have separate RED (test) then GREEN (feat) commits_

## Files Created/Modified
- `packages/standards/src/types.ts` - Added 'IT' to Country union type (14 members total)
- `packages/standards/src/index.ts` - Updated ENFORCEMENT_BODIES with English names + added ENFORCEMENT_BODIES_DETAILED + getEnforcementBody()
- `packages/standards/src/index.test.ts` - Added Enforcement Bodies describe block with 10 new tests covering all 14 countries

## Decisions Made
- **Backwards compatibility:** ENFORCEMENT_BODIES kept as `Record<Country, string>` returning WAD body — existing callers unaffected
- **Parallel map approach:** ENFORCEMENT_BODIES_DETAILED added as separate export rather than replacing ENFORCEMENT_BODIES — clean separation of concerns
- **WAD-first default:** getEnforcementBody() returns WAD body unless sector='private' explicitly passed — matches WAD being the primary framework for most users
- **Non-EU countries:** GB, US, CA use same body for both wad and eaa fields — WAD/EAA distinction doesn't apply, but Record shape must be complete
- **EU meta-entry split:** EU wad='European Commission (DG CNECT)', EU eaa='European Commission (DG JUST)' — different DGs oversee different frameworks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `ENFORCEMENT_BODIES`, `ENFORCEMENT_BODIES_DETAILED`, and `getEnforcementBody()` are ready for consumption in Phase 12/13 templates
- Country type now includes 'IT' — Phase 12/13 must handle IT in any `Record<Country, ...>` maps in engine/components packages
- All enforcement body names are in English; Phase 12/13 templates will need to handle localization at the output layer

---
*Phase: 11-enforcement-body-data*
*Completed: 2026-03-06*
