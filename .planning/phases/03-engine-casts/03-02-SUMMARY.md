---
phase: 03-engine-casts
plan: 02
subsystem: engine, components
tags: [typescript, type-safety, any-removal, EnrichedReport, Country, unknown]

# Dependency graph
requires:
  - phase: 01-standards-types
    provides: EnrichedReport, FailingNode, Country types
  - phase: 03-engine-casts-01
    provides: Cast removal patterns established in scanner/template files
provides:
  - Zero any casts in cli/index.ts, cloud-client.ts, statement-generator.ts, i18n/index.ts
  - Zero any annotations in AccessibilityStatement.tsx
  - StatementTemplate interface for statement generator
  - Type-safe i18n JSON traversal using unknown with narrowing
affects: [04-locale-fix, 05-testing]

# Tech tracking
tech-stack:
  added: []
  patterns: [unknown-with-narrowing for JSON traversal, StatementTemplate interface for template typing, Array.isArray narrowing for string|string[] union]

key-files:
  created: []
  modified:
    - packages/engine/src/cli/index.ts
    - packages/engine/src/cli/cloud-client.ts
    - packages/engine/src/reporting/statement-generator.ts
    - packages/engine/src/i18n/index.ts
    - packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx

key-decisions:
  - "i18n traversal uses unknown (not any) with Record<string, unknown> narrowing casts -- legitimate for JSON key traversal after typeof+in checks"
  - "StatementTemplate interface defined locally in statement-generator.ts -- not shared since only used for JSON.parse output typing"
  - "cloud-client element_selector uses Array.isArray narrowing for FailingNode.target (string|string[]) -- previously hidden by any"
  - "TEMPLATES in AccessibilityStatement.tsx typed as Record<string, StatementTemplate> with local TemplateSection interface"

patterns-established:
  - "unknown-with-narrowing: Use unknown for dynamic JSON traversal, cast to Record<string, unknown> after typeof+in checks"
  - "StatementTemplate pattern: Define interface matching JSON shape, use as-cast on JSON.parse (legitimate for known JSON structures)"

requirements-completed: [TS-06, TS-07, TS-08, TS-09]

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 3 Plan 2: Remaining Cast Removal Summary

**Removed all any casts from CLI handler, cloud client, statement generator, i18n module, and AccessibilityStatement component -- 16 casts eliminated across 5 files using EnrichedReport, Country, StatementTemplate, unknown, and type inference**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-03T04:27:35Z
- **Completed:** 2026-03-03T04:32:40Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Eliminated 11 any casts across cli/index.ts (7), cloud-client.ts (1), statement-generator.ts (3)
- Eliminated 3 any usages in i18n/index.ts using unknown with proper narrowing and LocaleData typing
- Eliminated 2 any annotations in AccessibilityStatement.tsx with TemplateSection/StatementTemplate interfaces
- Full monorepo build (standards + components + engine) passes with zero errors
- All 52 tests pass across all packages

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove casts from cli/index.ts, cloud-client.ts, statement-generator.ts** - `7a7ed68` (feat)
2. **Task 2: Remove casts from i18n/index.ts, clean up AccessibilityStatement.tsx, full build** - `7df7fcf` (feat)

## Files Created/Modified
- `packages/engine/src/cli/index.ts` - Typed viewport, EnrichedReport for callbacks, removed 7 any annotations
- `packages/engine/src/cli/cloud-client.ts` - Removed report any annotation, fixed element_selector string|string[] narrowing
- `packages/engine/src/reporting/statement-generator.ts` - Added StatementTemplate interface, typed country as Country, inferred section callback
- `packages/engine/src/i18n/index.ts` - LocaleData for locales record, unknown for value traversal with Record<string, unknown> narrowing
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` - Added TemplateSection/StatementTemplate interfaces, typed TEMPLATES record, typed renderSections param

## Decisions Made
- i18n traversal uses `unknown` with `Record<string, unknown>` narrowing -- safer than `any`, validated by existing typeof+in checks
- StatementTemplate defined locally in each file that needs it (statement-generator.ts and AccessibilityStatement.tsx) -- not shared since the shapes are similar but independently maintained
- cloud-client `element_selector` uses `Array.isArray` narrowing for `FailingNode.target` union -- this type mismatch was previously hidden by `any`
- TEMPLATES in AccessibilityStatement typed as `Record<string, StatementTemplate>` -- eliminates the only remaining `any` in the component

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed element_selector type mismatch in cloud-client.ts**
- **Found during:** Task 1 (cloud-client.ts cast removal)
- **Issue:** Removing `(report: any)` revealed that `FailingNode.target` is `string | string[]` but `CloudViolation.element_selector` expects `string` -- the `any` was hiding a type mismatch
- **Fix:** Added `Array.isArray` check: `Array.isArray(firstNode?.target) ? firstNode.target.join(' ') : (firstNode?.target || '')`
- **Files modified:** packages/engine/src/cli/cloud-client.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 7a7ed68 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed unnecessary as-Country cast in enforcement_body lookup**
- **Found during:** Task 1 (statement-generator.ts cast removal)
- **Issue:** After typing `country` as `Country`, the existing `ENFORCEMENT_BODIES[country as Country]` had a redundant assertion flagged by the linter
- **Fix:** Simplified to `ENFORCEMENT_BODIES[country]`
- **Files modified:** packages/engine/src/reporting/statement-generator.ts
- **Verification:** Linter warning resolved, tsc passes
- **Committed in:** 7a7ed68 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs exposed by removing any)
**Impact on plan:** Both fixes were necessary corrections exposed by proper typing. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All production files in engine and components are now free of any casts in core data-flow paths
- Phase 3 cast removal is complete -- ready for Phase 4 (locale fix) or Phase 5 (testing)
- The `unknown` pattern established in i18n can be reused for any future JSON traversal needs

---
*Phase: 03-engine-casts*
*Completed: 2026-03-03*
