---
phase: 03-engine-casts
plan: 01
subsystem: engine
tags: [typescript, type-safety, axe-core, enriched-report, regulatory-scanner]

# Dependency graph
requires:
  - phase: 01-standards-types
    provides: "EnrichedReport, FailingNode, LegalContext types in @holmdigital/standards"
provides:
  - "Typed enrichResults() with AxeScanOutput param returning EnrichedReport[]"
  - "Typed generateResultPackage() accepting EnrichedReport[]"
  - "Cast-free html-template, junit-generator, github-actions reporting modules"
affects: [03-engine-casts plan 02, 04-locale]

# Tech tracking
tech-stack:
  added: []
  patterns: ["AxeScanOutput local interface for serialized axe-core output (not importing AxeResults)"]

key-files:
  created: []
  modified:
    - packages/engine/src/core/regulatory-scanner.ts
    - packages/engine/src/reporting/html-template.ts
    - packages/engine/src/reporting/junit-generator.ts
    - packages/engine/src/reporting/github-actions.ts

key-decisions:
  - "AxeScanOutput defined as local interface in regulatory-scanner.ts -- not importing AxeResults from axe-core because serialized page.evaluate output is a subset"
  - "RegulatoryReport import retained -- still used for local variable type in enrichResults() loop body"

patterns-established:
  - "Local AxeScanOutput interface: use minimal typed interfaces for serialized browser-context data rather than importing full library types"

requirements-completed: [TS-05, TS-06]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 3 Plan 1: Engine Core Data-Flow Cast Removal Summary

**Typed enrichResults()/generateResultPackage() with AxeScanOutput param and removed 11 as-any casts across regulatory-scanner + 3 reporting modules**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T04:27:02Z
- **Completed:** 2026-03-03T04:29:56Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Defined AxeScanOutput interface for typed axe-core serialized output from page.evaluate()
- Changed enrichResults() from `any` param to `AxeScanOutput`, return type from `RegulatoryReport[]` to `EnrichedReport[]`
- Changed generateResultPackage() param from `RegulatoryReport[]` to `EnrichedReport[]`, removed 4 filter `(r: any)` casts
- Removed all `(report as any)` casts from html-template.ts (4 casts) and junit-generator.ts (3 casts)
- Typed escapeXML() param as `string | number | undefined | null` instead of `any`
- Removed `(node: any)` callback from github-actions.ts -- inferred as FailingNode

## Task Commits

Each task was committed atomically:

1. **Task 1: Type enrichResults() and generateResultPackage()** - `8acf47f` (feat)
2. **Task 2: Remove casts from html-template, junit-generator, github-actions** - `54d9e9d` (feat)

## Files Created/Modified
- `packages/engine/src/core/regulatory-scanner.ts` - Added AxeScanOutput interface, typed enrichResults() and generateResultPackage(), removed 7 any casts
- `packages/engine/src/reporting/html-template.ts` - Removed 4 (report as any) casts for legalContext access
- `packages/engine/src/reporting/junit-generator.ts` - Removed 3 (report as any) casts, typed escapeXML param
- `packages/engine/src/reporting/github-actions.ts` - Removed (node: any) callback annotation

## Decisions Made
- AxeScanOutput defined as local interface in regulatory-scanner.ts rather than importing AxeResults from axe-core, because the serialized output from page.evaluate() is a minimal subset of the full axe-core type
- RegulatoryReport import retained in regulatory-scanner.ts since it is still used as the local variable type for the report returned by generateRegulatoryReport()

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing tsc errors in cloud-client.ts and statement-generator.ts (uncommitted changes from prior work). These are out of scope -- logged to deferred-items.md. All 4 target files compile cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 03-02 can proceed with remaining engine cast removals
- Pre-existing errors in cloud-client.ts (element_selector type mismatch) and statement-generator.ts (possibly-undefined template) should be addressed in a future plan

## Self-Check: PASSED

All 4 modified files exist. Both task commits (8acf47f, 54d9e9d) verified. SUMMARY.md created.

---
*Phase: 03-engine-casts*
*Completed: 2026-03-03*
