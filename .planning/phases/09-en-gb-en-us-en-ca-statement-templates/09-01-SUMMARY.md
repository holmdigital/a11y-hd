---
phase: 09-en-gb-en-us-en-ca-statement-templates
plan: 01
subsystem: reporting
tags: [accessibility-statement, en-gb, en-us, en-ca, tld-detection, templates]

# Dependency graph
requires:
  - phase: 07-engine-generator-locale-expansion
    provides: Locale lookup maps (EVALUATION_METHOD, STATUS_LABELS, RESPONSE_TIME_DEFAULT) and template loading infrastructure
provides:
  - en-gb.json template with PSBAR 2018 UK legislation references
  - en-us.json template with Section 508 and ADA US legislation references
  - en-ca.json template with Accessible Canada Act and AODA Canadian legislation references
  - TLD detection for .uk/.us/.ca country codes
  - en-gb/en-us/en-ca entries in engine locale maps
affects: [09-02-component-templates, 10-statement-review]

# Tech tracking
tech-stack:
  added: []
  patterns: [jurisdiction-specific template variants from base en.json]

key-files:
  created:
    - packages/engine/src/reporting/templates/en-gb.json
    - packages/engine/src/reporting/templates/en-us.json
    - packages/engine/src/reporting/templates/en-ca.json
  modified:
    - packages/engine/src/reporting/statement-generator.ts
    - packages/engine/src/reporting/statement-generator.test.ts

key-decisions:
  - "en-gb/en-us/en-ca templates share identical non-legal sections with en.json, only intro/enforcement/technical differ"
  - ".gov TLD left unmapped (ambiguous per user decision); only .uk/.us/.ca added"
  - "Explicit en-gb/en-us/en-ca entries in locale maps rather than relying on en fallback for safety"
  - "English fallback guard updated to lang.startsWith('en') to exclude en-* from non-English assertions"

patterns-established:
  - "Jurisdiction-specific template: copy base en.json, modify intro/enforcement/technical sections with national legislation"
  - "TLD detection: simple url.endsWith() checks with compound TLDs covered by suffix matching (.gov.uk ends with .uk)"

requirements-completed: [TMPL-01, TMPL-02, TMPL-03, TMPL-04]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 9 Plan 1: en-gb/en-us/en-ca Engine Templates Summary

**Three jurisdiction-specific JSON templates (UK PSBAR 2018, US Section 508/ADA, CA ACA/AODA) with TLD country detection and 30 passing tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T19:42:37Z
- **Completed:** 2026-03-04T19:45:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created en-gb.json referencing Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 and EHRC
- Created en-us.json referencing Section 508 of the Rehabilitation Act and Americans with Disabilities Act (ADA)
- Created en-ca.json referencing Accessible Canada Act and Accessibility for Ontarians with Disabilities Act (AODA)
- Extended TLD detection: .uk -> GB, .us -> US, .ca -> CA (compound TLDs like .gov.uk and .gc.ca covered by suffix matching)
- Added en-gb/en-us/en-ca entries to all three engine locale maps (EVALUATION_METHOD, STATUS_LABELS, RESPONSE_TIME_DEFAULT)
- All 30 tests pass including placeholder exhaustiveness for 12 templates and TLD detection unit tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create en-gb/en-us/en-ca JSON templates, extend TLD detection, add en-* locale map entries** - `2c9dfa7` (feat)
2. **Task 2: Update engine tests for 12 templates and en-* locale-specific output verification** - `8137e36` (test)

## Files Created/Modified
- `packages/engine/src/reporting/templates/en-gb.json` - UK-specific accessibility statement template with PSBAR 2018 references
- `packages/engine/src/reporting/templates/en-us.json` - US-specific accessibility statement template with Section 508/ADA references
- `packages/engine/src/reporting/templates/en-ca.json` - Canada-specific accessibility statement template with ACA/AODA references
- `packages/engine/src/reporting/statement-generator.ts` - Extended TLD detection (.uk/.us/.ca) and en-* locale map entries
- `packages/engine/src/reporting/statement-generator.test.ts` - Updated to 12 templates, en-* locale verification, TLD detection tests

## Decisions Made
- en-gb/en-us/en-ca templates share identical non-legal sections with en.json; only intro, enforcement, and technical sections contain jurisdiction-specific legislation names
- .gov TLD intentionally left unmapped (ambiguous per user decision) -- only .uk, .us, .ca added
- Explicit en-gb/en-us/en-ca entries added to locale maps rather than relying on fallback to 'en' for safety and consistency
- English fallback guard in tests changed from `lang !== 'en'` to `!lang.startsWith('en')` so en-* locales are correctly excluded from non-English assertions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Engine-side en-gb/en-us/en-ca templates complete and tested
- Ready for Phase 9 Plan 2: component-side inline TEMPLATES for en-gb/en-us/en-ca
- All 12 engine templates produce valid Markdown output with zero leftover placeholders

## Self-Check: PASSED

- All 6 files verified present on disk
- Commits 2c9dfa7 and 8137e36 verified in git log
- en-gb.json contains "Public Sector Bodies" (3 occurrences)
- en-us.json contains "Section 508" (3 occurrences)
- en-ca.json contains "Accessible Canada Act" (3 occurrences)
- statement-generator.ts contains endsWith('.uk') TLD check

---
*Phase: 09-en-gb-en-us-en-ca-statement-templates*
*Completed: 2026-03-04*
