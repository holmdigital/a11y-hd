---
phase: 13-component-national-compliance
plan: 01
subsystem: ui
tags: [react, accessibility, typescript, standards, enforcement-body, national-law, EU-compliance]

# Dependency graph
requires:
  - phase: 12-engine-national-compliance
    provides: "getEnforcementBody(country, sector) and getNationalLawByFramework(framework, country) in @holmdigital/standards"
provides:
  - "AccessibilityStatement component uses sector-aware enforcement body resolution via getEnforcementBody(country, sector)"
  - "AccessibilityStatement component renders correct national law name per EU locale via {<national_law>} substitution"
  - "All 8 EU TEMPLATE objects audited — no hardcoded law names remain"
  - "16 new per-locale tests: 8 enforcement body + 8 national law assertions across sv/no/da/nl/de/fr/es/fi"
affects:
  - phase-14-component-eaa
  - any future work consuming AccessibilityStatement rendered HTML

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auto-syncing tests: test expectations call same standards functions as production code (getEnforcementBody, getNationalLawByFramework)"
    - "Sector-aware enforcement body resolution: sector prop flows from component props through to getEnforcementBody(country, sector)"
    - "{<national_law>} placeholder in TEMPLATE strings resolved at render time via getNationalLawByFramework('WAD', country)"

key-files:
  created: []
  modified:
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx

key-decisions:
  - "Sector prop was previously destructured as _sector (unused) — now flows through to getEnforcementBody(country, sector), enabling WAD vs EAA body selection"
  - "RGAA (FR) is used as the WAD law reference for France — matches standards data fullName field"
  - "DE uses BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung) as WAD law — replaced both EU directive reference in intro and Barrierefreiheitsanforderungen in technical/enforcement/how-accessible sections"
  - "FI has two different Finnish law phrase variants in templates — both replaced with {<national_law>} placeholder"

patterns-established:
  - "Template audit pattern: all EU TEMPLATE objects must use {<national_law>} placeholder — no hardcoded law names in any locale template"
  - "Auto-syncing test pattern: import standards functions in tests and reference them directly in assertions"

requirements-completed: [CMP-01, CMP-02, CMP-03]

# Metrics
duration: 10min
completed: 2026-03-06
---

# Phase 13 Plan 01: Component National Compliance Summary

**AccessibilityStatement component updated to render sector-aware enforcement bodies and dynamic national law names for all 8 EU locales via getEnforcementBody/getNationalLawByFramework, with 16 auto-syncing per-locale tests**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-06T15:15:00Z
- **Completed:** 2026-03-06T15:22:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced `ENFORCEMENT_BODIES[country]` lookup with `getEnforcementBody(country, sector)` — sector prop now flows through correctly for WAD vs EAA body selection
- Added `{<national_law>}` entry to replacements map resolved via `getNationalLawByFramework('WAD', country)` — renders correct national law for each EU locale
- Audited all 8 EU TEMPLATE objects (sv/no/da/nl/de/fr/es/fi): replaced all hardcoded law names with `{<national_law>}` placeholder
- Added 16 new auto-syncing tests: 8 enforcement body assertions + 8 national law fullName assertions across all EU locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Update enforcement body resolution, add national_law substitution, and audit 8 EU TEMPLATES** - `dfcf0bf` (feat)
2. **Task 2: Add per-locale enforcement body and law name tests** - `ddd0395` (test)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks may have multiple commits (test → feat → refactor). Task 1 was implementation; Task 2 added the test assertions._

## Files Created/Modified

- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` - Import updated, sector prop used, enforcement body and national law resolution via standards functions, 8 EU TEMPLATES updated
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` - Added getEnforcementBody/getNationalLawByFramework imports and 2 new describe blocks with 16 total test cases

## Decisions Made

- Sector prop was previously destructured as `_sector` (unused) and suppressed with an eslint-disable comment. Now destructured as `sector` and passed to `getEnforcementBody(country, sector)`, enabling correct WAD vs EAA enforcement body selection.
- DE had two separate hardcoded law references: EU directive wording in intro and "Barrierefreiheitsanforderungen" in how-accessible, enforcement, and technical sections. All replaced with `{<national_law>}` (resolves to "Barrierefreie-Informationstechnik-Verordnung (BITV 2.0)").
- FR's `le RGAA` and `le référentiel général d'amélioration de l'accessibilité (RGAA)` references — both replaced with `la {<national_law>}` to maintain grammatical gender agreement.
- FI had two distinct Finnish phrase variants describing the same law — both replaced with `{<national_law>}` placeholder.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Component national compliance complete for WAD (public sector) path
- EAA (private sector) path will be handled in Phase 14 if planned
- The `sector="private"` path now correctly calls `getEnforcementBody(country, 'private')` returning the EAA enforcement body — no additional component changes needed for basic private sector rendering
- Component dist rebuild needed before npm publish (pre-existing blocker noted in STATE.md)

---
*Phase: 13-component-national-compliance*
*Completed: 2026-03-06*
