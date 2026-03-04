---
phase: 07-engine-generator-locale-expansion
plan: 01
subsystem: i18n
tags: [locale, intl, accessibility-statement, date-formatting, eu-locales]

# Dependency graph
requires:
  - phase: 06-esm-fix-and-foundation
    provides: ESM build with __dirname shim, placeholder exhaustiveness tests for all 9 templates
provides:
  - 9-locale EVALUATION_METHOD lookup map in statement-generator.ts
  - 9-locale STATUS_LABELS lookup map (3 compliance levels per locale) in statement-generator.ts
  - 9-locale RESPONSE_TIME_DEFAULT lookup map in statement-generator.ts
  - 14-variant LOCALE_TO_INTL date formatting map in html-template.ts
affects: [07-02, 09-english-variant-templates, 10-validation]

# Tech tracking
tech-stack:
  added: []
  patterns: [locale-lookup-map-over-ternary, intl-locale-mapping]

key-files:
  created: []
  modified:
    - packages/engine/src/reporting/statement-generator.ts
    - packages/engine/src/reporting/html-template.ts

key-decisions:
  - "Module-level const maps for locale lookups instead of inline ternaries -- cleaner, extensible"
  - "nb alias included in all 3 statement-generator maps for Norwegian Bokmal compatibility"
  - "LOCALE_TO_INTL covers 14 variants including dk, nb, en-gb, en-us, en-ca aliases"

patterns-established:
  - "Locale lookup map pattern: const MAP: Record<string, string> with English fallback via || MAP['en']"
  - "Nested locale map for multi-value lookups: Record<string, Record<string, string>> (STATUS_LABELS)"

requirements-completed: [ENGI-01, ENGI-02, ENGI-03]

# Metrics
duration: 2min
completed: 2026-03-04
---

# Phase 7 Plan 1: Engine Generator Locale Expansion Summary

**Replaced binary sv/en ternaries with 9-locale lookup maps for evaluationMethod, statusMap, responseTime, and Intl date formatting across all EU locales**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T18:16:36Z
- **Completed:** 2026-03-04T18:18:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Expanded evaluationMethod from sv/en binary to 9 EU locales + nb alias with proper translations per locale
- Expanded statusMap from sv/no/da partial coverage to 9 EU locales + nb alias with 3 compliance levels each
- Expanded responseTime default from sv/en binary to 9 EU locales + nb alias with localized "2 days" text
- Expanded HTML report date formatting from sv-SE/en-US binary to 14 Intl locale codes covering all lang variants

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand evaluationMethod, statusMap, and responseTime locale maps** - `c9bed05` (feat)
2. **Task 2: Expand date formatting locale mapping** - `931472e` (feat)

## Files Created/Modified
- `packages/engine/src/reporting/statement-generator.ts` - Added EVALUATION_METHOD, STATUS_LABELS, RESPONSE_TIME_DEFAULT module-level const maps; replaced 3 binary/nested ternaries with map lookups
- `packages/engine/src/reporting/html-template.ts` - Added LOCALE_TO_INTL module-level const map; replaced binary getCurrentLang() check with map lookup

## Decisions Made
- Module-level const maps chosen over inline maps inside generateStatementContent() for better readability and reusability
- nb (Norwegian Bokmal) alias included in all statement-generator maps since getCurrentLang() can return 'nb'
- dk alias included in LOCALE_TO_INTL since getCurrentLang() can return 'dk'
- English fallback used for all maps via `|| MAP['en']` pattern for unknown locale codes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 9-locale lookup maps in place for statement generator and HTML reports
- Ready for 07-02 (additional locale expansion work if planned)
- Phase 9 (en-gb/en-us/en-ca templates) can leverage the LOCALE_TO_INTL map already containing these aliases
- Phase 10 (validation) can verify locale-specific output against these maps

---
*Phase: 07-engine-generator-locale-expansion*
*Completed: 2026-03-04*
