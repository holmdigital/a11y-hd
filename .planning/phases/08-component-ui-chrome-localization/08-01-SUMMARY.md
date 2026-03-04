---
phase: 08-component-ui-chrome-localization
plan: 01
subsystem: ui
tags: [react, localization, i18n, accessibility-statement, locale-maps]

# Dependency graph
requires:
  - phase: 07-engine-generator-locale-expansion
    provides: STATUS_LABELS locale map pattern and canonical locale wording
provides:
  - BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT locale maps for component chrome
  - en-gb/en-us/en-ca support in AccessibilityStatement component
  - Chrome localization test coverage for all 9 EU locales
affects: [09-en-gb-en-us-en-ca-templates]

# Tech tracking
tech-stack:
  added: []
  patterns: [locale-lookup-map for component chrome, same pattern as engine STATUS_LABELS]

key-files:
  created:
    - packages/components/src/AccessibilityStatement/locale-chrome.ts
  modified:
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx

key-decisions:
  - "Swedish badge text aligned to engine STATUS_LABELS wording (Fullt ut forenlig, Inte forenlig) for cross-package consistency"
  - "Locale maps in separate locale-chrome.ts file for maintainability"
  - "en-gb/en-us/en-ca resolve to en via supportedLocales, no duplicate map entries needed"

patterns-established:
  - "Component chrome locale maps: same Record<string, ...> keyed by 9 canonical codes, with English fallback via || operator"

requirements-completed: [CHRM-01, CHRM-02, CHRM-03]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 8 Plan 1: Component UI Chrome Localization Summary

**Locale lookup maps for badge, updated label, and footer chrome text across 9 EU locales, replacing binary sv/en ternaries**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T19:10:36Z
- **Completed:** 2026-03-04T19:13:36Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created locale-chrome.ts with BADGE_LABELS (9 locales x 3 compliance levels), UPDATED_LABEL (9 locales), and FOOTER_TEXT (9 locales)
- Replaced all three sv/en ternary expressions in AccessibilityStatement.tsx with map lookups using English fallback
- Extended supportedLocales and formatDiggDate to handle en-gb, en-us, en-ca locale codes
- Added 31 new tests covering badge text, updated label, footer text for all 9 EU locales plus English variants and nb alias

## Task Commits

Each task was committed atomically:

1. **Task 1: Create locale-chrome.ts and update AccessibilityStatement.tsx** - `5da7bde` (feat)
2. **Task 2: Add chrome localization tests for all 9 EU locales** - `b5c88c1` (test)

## Files Created/Modified
- `packages/components/src/AccessibilityStatement/locale-chrome.ts` - Exported BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT lookup maps for 9 canonical EU locales
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` - Import locale maps, replace ternaries with map lookups, add en-gb/en-us/en-ca support
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` - 31 new tests for chrome badge, label, footer localization across all locales

## Decisions Made
- Swedish badge text aligned to engine's STATUS_LABELS wording ("Fullt ut forenlig" / "Inte forenlig" instead of old "Fullt forenlig" / "Ej forenlig") for cross-package consistency
- Locale maps placed in separate locale-chrome.ts file following the same pattern established by engine's statement-generator.ts in Phase 7
- English variant codes (en-gb, en-us, en-ca) resolve through supportedLocales to 'en', avoiding duplicate entries in chrome maps

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All component chrome now localized for 9 EU locales
- en-gb/en-us/en-ca locale codes accepted without console warning
- Ready for Phase 9 (en-gb/en-us/en-ca template work)
- Components package builds successfully

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 08-component-ui-chrome-localization*
*Completed: 2026-03-04*
