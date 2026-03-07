---
phase: 16-new-locale-component-templates
plan: 01
subsystem: ui
tags: [react, accessibility, localization, italian, portuguese, polish]

requires:
  - phase: 15-new-locale-engine-templates
    provides: "it/pt/pl engine JSON templates, TLD_MAP entries, locale maps"
  - phase: 14-standards-national-laws
    provides: "IT/PT/PL national laws, enforcement bodies in standards package"
provides:
  - "it/pt/pl inline TEMPLATES in AccessibilityStatement.tsx"
  - "it/pt/pl chrome strings (BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT)"
  - "18 auto-syncing component tests for it/pt/pl locales"
affects: [component-dist-rebuild, npm-publish]

tech-stack:
  added: []
  patterns: [locale-specific replacement mappings, auto-syncing test pattern]

key-files:
  created: []
  modified:
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx
    - packages/components/src/AccessibilityStatement/locale-chrome.ts
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx

key-decisions:
  - "Followed established pattern for locale-specific placeholders: {<carenze>} (IT), {<deficiencias>} (PT), {<braki>} (PL) matching engine phase 15 decisions"
  - "Placed new locale entries after nl and before en-gb in all files for geographic consistency"

patterns-established:
  - "NEW_LOCALE_COUNTRY_MAP: separate test array for new locale batches to avoid mutating existing test data"

requirements-completed: [CMP-04, CMP-05, CMP-06]

duration: 3min
completed: 2026-03-07
---

# Phase 16 Plan 01: New Locale Component Templates Summary

**Italian, Portuguese, and Polish AccessibilityStatement templates with enforcement body/law placeholders, chrome strings, and 18 auto-syncing tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-07T07:29:12Z
- **Completed:** 2026-03-07T07:32:28Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added it/pt/pl inline TEMPLATES with full section structure (title, intro, 6 sections each) including {<enforcement_body>} and {<national_law>} placeholders
- Added supportedLocales, formatDiggDate, noIssuesText, and locale-specific replacement mappings for all three new locales
- Added BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT chrome entries for it/pt/pl
- Added 18 new auto-syncing tests: placeholder leakage (3), enforcement body (3), national law (3), badge (3), updated label (3), footer (3)
- Total component tests: 114 (up from 96)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add it/pt/pl TEMPLATES + wiring to AccessibilityStatement.tsx** - `47c7042` (feat)
2. **Task 2: Add it/pt/pl chrome strings to locale-chrome.ts** - `341b6ee` (feat)
3. **Task 3: Add auto-syncing component tests for it/pt/pl locales** - `a76382a` (test)

## Files Created/Modified
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` - Added it/pt/pl TEMPLATES, supportedLocales, formatDiggDate, replacements, noIssuesText, conditional block handler
- `packages/components/src/AccessibilityStatement/locale-chrome.ts` - Added 9 new entries (3 locales x 3 constants)
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.test.tsx` - Added 18 auto-syncing tests for it/pt/pl

## Decisions Made
- Followed established pattern for locale-specific issue placeholders matching engine phase 15 decisions
- Placed new locale entries after nl and before en-gb for geographic consistency
- Created separate NEW_LOCALE_COUNTRY_MAP array for test data to avoid mutating existing EU_LOCALE_COUNTRY_MAP

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Component layer fully supports it/pt/pl locales
- Component dist rebuild still needed before npm publish (pre-existing deferred item)
- Ready for any future locale expansion phases

---
*Phase: 16-new-locale-component-templates*
*Completed: 2026-03-07*
