---
phase: 12-engine-national-compliance
plan: 01
subsystem: engine
tags: [statement-generator, tld-detection, enforcement-body, national-law, standards, tdd]

# Dependency graph
requires:
  - phase: 11-enforcement-body-data
    provides: getEnforcementBody(), getNationalLawByFramework(), ENFORCEMENT_BODIES_DETAILED from @holmdigital/standards

provides:
  - Updated TLD parse in statement-generator.ts using URL.hostname + TLD_MAP (proper, not endsWith)
  - .fr, .nl, .es, .it added to TLD coverage; EU as default fallback (was SE)
  - getEnforcementBody(country, 'public') used for enforcement body lookup (was ENFORCEMENT_BODIES[country])
  - {<national_law>} substitution key in statement-generator resolving to "fullName (law)" or "" for non-WAD countries

affects:
  - 12-02 (template authoring — can now use {<national_law>} placeholder)
  - 13-components (templates consuming enforcement_body will get correct values via getEnforcementBody)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TLD detection: URL.hostname.split('.').pop() then TLD_MAP lookup — no endsWith() fragility"
    - "Standards data layer: getEnforcementBody(country, sector) replaces direct map access"
    - "Lazy IIFE pattern for substitution values: (() => { ... })()"

key-files:
  created: []
  modified:
    - packages/engine/src/reporting/statement-generator.ts
    - packages/engine/src/reporting/statement-generator.test.ts

key-decisions:
  - "Default country fallback changed from 'SE' to 'EU' — TLD-unknown URLs are international/EU context, not Swedish"
  - "Use getEnforcementBody(country, 'public') not ENFORCEMENT_BODIES[country] — ensures enforcement data flows from canonical source"
  - "national_law substitution registered even though no template currently uses it — placeholder-ready for Phase 12 template authoring"
  - "TLD_MAP covers: se, no, dk, fi, de, fr, nl, es, it, uk, us, ca — EU fallback for everything else"

patterns-established:
  - "Standards-as-source: enforcement body and national law data always sourced from @holmdigital/standards functions, never hardcoded in engine"
  - "TLD_MAP: all TLD-to-Country mappings in one place, easy to extend"

requirements-completed: [ENG-01, ENG-03]

# Metrics
duration: 8min
completed: 2026-03-06
---

# Phase 12 Plan 01: Engine National Compliance — TLD Detection, Enforcement Body Helper, National Law Summary

**Replaced fragile endsWith() TLD detection with URL.hostname parse + TLD_MAP (adding .fr/.nl/.es/.it), switched enforcement body lookup from ENFORCEMENT_BODIES[country] to getEnforcementBody(country, 'public'), and added {<national_law>} substitution key backed by getNationalLawByFramework('WAD', country)**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-06T05:51:00Z
- **Completed:** 2026-03-06T05:59:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Proper TLD parsing: `new URL(result.url).hostname.split('.').pop()` replaces 7 fragile `endsWith()` calls
- Extended country coverage: .fr → FR, .nl → NL, .es → ES, .it → IT added to TLD_MAP
- EU as default fallback: unmapped TLDs (.eu, .gov, .com) correctly resolve to 'EU' not 'SE'
- Enforcement body decoupled from local map: `getEnforcementBody(country, 'public')` ensures canonical data
- `{<national_law>}` substitution added: format `${fullName} (${law})` or empty string for null-returning countries (GB)
- 43 tests pass (up from 31); 7 new targeted tests; 0 regressions

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for TLD detection, enforcement body, national law** - `c26cd97` (test)
2. **Task 1 GREEN: Implement all three changes** - `afcd6bb` (feat)

## Files Created/Modified
- `packages/engine/src/reporting/statement-generator.ts` - Updated import, TLD detection block, enforcement body substitution, added national law substitution
- `packages/engine/src/reporting/statement-generator.test.ts` - Added 12 new tests across 3 new describe blocks

## Decisions Made
- Default country changed from 'SE' to 'EU': a URL with an unknown TLD is more likely an international/EU-scope site than a Swedish one. EU → DG CNECT is a safe neutral fallback.
- `getEnforcementBody(country, 'public')` selected over `ENFORCEMENT_BODIES[country]`: data must flow from the standards package function, not the backwards-compat map that may diverge.
- `{<national_law>}` registered in substitution map even though no template currently uses it — placeholder-ready for Phase 12 template authoring without requiring a second engine change.
- DE WAD law is BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung), not BFSG — BFSG is the EAA law. Test updated to match actual data.

## Deviations from Plan

None - plan executed exactly as written.

Minor clarification: Plan cited 'Barrierefreiheitsstärkungsgesetz (BFSG)' as the DE national law example. The data shows BFSG is the EAA framework law; BITV 2.0 is the WAD framework law. Test was corrected to match actual data before RED commit.

## Issues Encountered
None - TypeScript compiled clean, all tests green on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Statement-generator now ready for template updates using `{<national_law>}` placeholder
- All 9 EU locales + en-gb/en-us/en-ca pass the exhaustiveness test (no leftover placeholders)
- IT country type is now handled (IT → AgID via getEnforcementBody)
- Phase 12-02 can proceed with template authoring using the registered substitution keys

---
*Phase: 12-engine-national-compliance*
*Completed: 2026-03-06*
