---
phase: 04-locale-routing
plan: 01
subsystem: ui
tags: [react, i18n, locale-routing, accessibility-statement, templates]

# Dependency graph
requires:
  - phase: 03-engine-casts
    provides: Record<string, StatementTemplate> typing on TEMPLATES object
provides:
  - 9-locale routing with inline templates for sv, en, no, da, de, fr, es, fi, nl
  - Complete placeholder substitution map for all locale-specific variables
  - Explicit fallback with console.warn for unsupported locales
  - Norwegian placeholder bug fixes (4 previously unresolved)
affects: [05-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [locale-map routing with explicit fallback warning, per-locale placeholder mapping]

key-files:
  created: []
  modified:
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx

key-decisions:
  - "effectiveLang pattern for explicit fallback: separate lang lookup from fallback to enable console.warn on miss"
  - "DA/FI/NL templates get added id and title on non-accessible sections (engine JSON lacks them)"
  - "Section count differences preserved: DE/ES/FR have 6 sections, DA/FI/NL have 7 (by design)"
  - "supportedLocales type changed from keyof typeof TEMPLATES to string for flexibility"

patterns-established:
  - "Locale fallback: lookup in supportedLocales, warn if missing, default to 'en'"
  - "Per-locale placeholder mapping: each locale's unique variable names mapped to same prop values"

requirements-completed: [I18N-01, I18N-02, I18N-03]

# Metrics
duration: 6min
completed: 2026-03-03
---

# Phase 4 Plan 1: Locale Routing Summary

**Full 9-locale routing with inline templates, placeholder substitution for ~30 new locale-specific variables, Norwegian bug fixes, and explicit English fallback with console.warn**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-03T18:14:37Z
- **Completed:** 2026-03-03T18:20:37Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- AccessibilityStatement routes all 9 supported locales (sv, en, no, da, de, fr, es, fi, nl) to correct templates
- Fixed 4 Norwegian placeholder bugs (e-postadresse, oppdateringsdato, metode, publiseringsdato)
- Unsupported locales trigger console.warn before English fallback
- Added ~30 new locale-specific placeholder mappings covering all 6 new locales
- issuesContent "no known issues" translated for all 9 locales
- Conditional block handler recognizes phone/issues/response-time placeholders from all locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Routing, fallback, Norwegian fixes, conditional handler, and issuesContent localization** - `a632b70` (feat)
2. **Task 2: Add 6 inline templates and all new placeholder mappings** - `513252c` (feat)

## Files Created/Modified
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` - Full 9-locale routing with inline templates, placeholder substitution, explicit fallback

## Decisions Made
- Used `effectiveLang` pattern (separate from `lang` lookup) to enable console.warn on unsupported locale before fallback
- Changed `supportedLocales` type from `keyof typeof TEMPLATES` to `string` since TEMPLATES is already `Record<string, StatementTemplate>`
- Added `id: "non-accessible"` and localized titles to DA/FI/NL sections[5] which lack them in engine JSON
- Preserved section count differences: DE/ES/FR have 6 sections (non-accessible merged into what-to-do), DA/FI/NL have 7

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 9 locale templates render with correct placeholder substitution
- Ready for Phase 5 testing: template rendering tests, placeholder leakage tests, locale fallback tests
- All 52 existing tests pass, components package builds successfully

---
*Phase: 04-locale-routing*
*Completed: 2026-03-03*
