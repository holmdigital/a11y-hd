---
phase: 34-klarsprak-plain-language-report
plan: 01
subsystem: standards
tags: [typescript, vitest, json, plain-language, klarsprak, accessibility, wcag]

# Dependency graph
requires:
  - phase: 33-pub-09-verify-chains
    provides: zero-warning lint state, prepublishOnly verify chain (build+lint+typecheck+check:exports+check:types+test:ci)
provides:
  - PlainLanguageCopy interface exported from @holmdigital/standards
  - BusinessImpactLevel union type exported from @holmdigital/standards
  - plainLanguage? optional field on ConvergenceRule (D-15)
  - plainLanguage? optional field on RegulatoryReport (D-15)
  - 8 Swedish plainLanguage blocks in rules.sv.json with D-04 impactLevel
  - 8 English plainLanguage blocks in rules.en.json with D-04 impactLevel
  - D-10.1 encoding guard, D-10.2 tone lint, D-10.3 sv/en parity vitest guards
  - PLAIN-02 enrichment test (generateRegulatoryReport + EN fallback D-03)
affects:
  - 34-02 (enrichment: generateRegulatoryReport reads plainLanguage, D-03 fallback)
  - 34-03 (plain-report renderer reads report.plainLanguage directly)
  - 34-04 (CLI flags and HTML template consume PlainLanguageCopy)
  - 34-05 (changeset and release consume PlainLanguageCopy from types)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD RED/GREEN with data-guard tests preceding data insertion
    - AJV v6 usage pattern (dataPath not instancePath, no strict option)
    - plainLanguage as optional additive field on existing interfaces (backward-compat)
    - D-04 canonical impactLevel table overrides diggRisk derivation for 6 of 8 rules
    - English-keyed PlainLanguageCopy fields (headline/whatHappens/whoIsAffected/businessImpact/howToFix/impactLevel)

key-files:
  created: []
  modified:
    - packages/standards/src/types.ts
    - packages/standards/src/index.ts
    - packages/standards/src/index.test.ts
    - packages/standards/data/rules.sv.json
    - packages/standards/data/rules.en.json

key-decisions:
  - "BusinessImpactLevel uses type, PlainLanguageCopy uses interface per CLAUDE.md convention"
  - "impactLevel is required in PlainLanguageCopy interface (not optional) for the 8 explicit rules; derivation fallback for future rules lives in the renderer"
  - "D-04 canonical table overrides diggRisk derivation for 6 of 8 rules (wrong for form-labels, name-role-value, keyboard-accessible, color-contrast, heading-order, language-of-page)"
  - "plainLanguage? added to BOTH ConvergenceRule AND RegulatoryReport (D-15) as required compile gate for plan 02 enrichment"
  - "EN fallback in generateRegulatoryReport (D-03) implemented in plan 01 to enable PLAIN-02 tests to pass"
  - "Swedish texts written in raw UTF-8 via Write tool (not Bash heredoc) to prevent mojibake (D-10.1)"
  - "Rule 1 fix: pre-existing AJV v6 TypeScript errors in schema validation test (strict option and instancePath field not valid in v6 — dataPath is the correct v6 field)"

patterns-established:
  - "D-10 data guards: write failing tests first, then add data to make them green (TDD pairing)"
  - "plainLanguage JSON blocks use English keys matching PlainLanguageCopy interface fields"
  - "D-04 table is the authoritative source for impactLevel values — not diggRisk mapping"

requirements-completed: [PLAIN-01, PLAIN-06]

# Metrics
duration: 17min
completed: 2026-06-11
---

# Phase 34 Plan 01: Klarsprak Data Foundation Summary

**PlainLanguageCopy interface and BusinessImpactLevel type exported from @holmdigital/standards, with 16 plainLanguage blocks (8 sv + 8 en) carrying D-04 impactLevel and three mechanical data guards (D-10.1/D-10.2/D-10.3) all green**

## Performance

- **Duration:** 17 min
- **Started:** 2026-06-11T20:40:00Z
- **Completed:** 2026-06-11T20:57:32Z
- **Tasks:** 2 (TDD task with RED commit + GREEN commit)
- **Files modified:** 5

## Accomplishments
- New public API: `PlainLanguageCopy` interface and `BusinessImpactLevel` union type exported from `@holmdigital/standards`
- D-15 satisfied: `plainLanguage?` added to both `ConvergenceRule` and `RegulatoryReport` (compile gate for plan 02 enrichment)
- 16 plainLanguage blocks authored: 8 Swedish (from klarsprakslager-engine.md) + 8 English (D-02), all with D-04 canonical impactLevel values
- Three data guards green: D-10.1 mojibake encoding guard, D-10.2 tone lint (no em/en dashes or percent signs), D-10.3 sv/en parity (identical impactLevel per ruleId)
- PLAIN-02 enrichment guard green: `generateRegulatoryReport` returns `plainLanguage` for sv and falls back to EN for unsupported languages (D-03)
- Full verify chain passes: build + lint (zero warnings) + typecheck + check:exports + check:types + test:ci (72/72 tests)

## Task Commits

1. **Task 1: Types, exports, test guards (TDD RED)** - `39ccd87` (test)
2. **Task 2: 8 sv + 8 en plainLanguage JSON blocks (TDD GREEN)** - `446ca25` (feat)

## Files Created/Modified
- `packages/standards/src/types.ts` - Added `BusinessImpactLevel` type, `PlainLanguageCopy` interface, `plainLanguage?` on `ConvergenceRule` and `RegulatoryReport`
- `packages/standards/src/index.ts` - Added `PlainLanguageCopy`/`BusinessImpactLevel` to import+export blocks; added EN fallback to `generateRegulatoryReport` (D-03)
- `packages/standards/src/index.test.ts` - Added JSON imports, D-10.1/D-10.2/D-10.3 describe blocks, PLAIN-02 enrichment describe block
- `packages/standards/data/rules.sv.json` - Added 8 plainLanguage blocks (Swedish source texts from klarsprakslager-engine.md)
- `packages/standards/data/rules.en.json` - Added 8 plainLanguage blocks (English, D-02 tone rules)

## Decisions Made
- `BusinessImpactLevel` uses `type`, `PlainLanguageCopy` uses `interface` per CLAUDE.md convention
- `impactLevel` is required (not optional) in `PlainLanguageCopy` for the 8 explicit rules; derivation fallback for future rules belongs in the renderer (plan 03)
- D-04 canonical impactLevel table used — NOT diggRisk derivation (incorrect for 6 of 8 rules as confirmed by kontextgranskning)
- D-03 EN fallback implemented in `generateRegulatoryReport` in plan 01 (required to make PLAIN-02 enrichment tests pass; plan 02 was listed as the responsible plan but the pattern was established here to enable test-driven verification)
- Swedish texts written via Write tool (never Bash heredoc) to prevent encoding corruption

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing AJV v6 TypeScript errors in schema validation test**
- **Found during:** Task 1 (types/exports/test guards)
- **Issue:** `packages/standards/src/index.test.ts` contained two pre-existing TS errors from the existing schema validation describe block: `strict` is not a valid AJV v6 constructor option (v8 feature), and `instancePath` does not exist on AJV v6 `ErrorObject` (v6 uses `dataPath`)
- **Fix:** Removed `strict: false` from AJV constructor call; changed `instancePath` to `dataPath`
- **Files modified:** `packages/standards/src/index.test.ts`
- **Verification:** `npm run typecheck -w @holmdigital/standards` exits 0 after fix
- **Committed in:** `39ccd87` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — pre-existing TS errors blocking typecheck acceptance criterion)
**Impact on plan:** Necessary fix; the existing test file had stale AJV API usage. No scope creep.

## Issues Encountered
- Worktree path isolation: initial edits landed in the main repo checkout at `/d/a11y-hd-project/` instead of the worktree at `/d/a11y-hd-project/.claude/worktrees/agent-a52b99c62e5f03d47/`. Detected via `diff` comparison. All edits re-applied to the correct worktree path before committing.

## Known Stubs
None. All 8 plainLanguage blocks carry real editorial content from klarsprakslager-engine.md. No placeholder text present.

## Threat Surface Scan
No new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries introduced. All changes are additive optional fields on existing types and static JSON data files. D-10.1 mojibake guard and D-10.2 tone lint guard are the threat mitigations registered in the plan's threat model — both implemented and green.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Plan 02 (enrichment): `plainLanguage?` is now on both `ConvergenceRule` and `RegulatoryReport`; `generateRegulatoryReport` already carries the EN fallback; plan 02 can wire `plainLanguage` copy through the enrichment pipeline without additional type work
- Plan 03 (terminal renderer): `PlainLanguageCopy` and `BusinessImpactLevel` are exported and ready for import in `plain-report.ts`
- All downstream plans have a stable contract layer: types and data are tested and locked

## Self-Check: PASSED

- `packages/standards/src/types.ts` contains `export interface PlainLanguageCopy` and `export type BusinessImpactLevel`: FOUND
- `packages/standards/src/types.ts` contains `plainLanguage?: PlainLanguageCopy` on `ConvergenceRule`: FOUND
- `packages/standards/src/types.ts` contains `plainLanguage?: PlainLanguageCopy` on `RegulatoryReport`: FOUND
- `packages/standards/src/index.ts` export block contains `PlainLanguageCopy` and `BusinessImpactLevel`: FOUND
- `packages/standards/src/index.test.ts` contains D-10.1/D-10.2/D-10.3 describe blocks: FOUND
- Commit `39ccd87` exists: VERIFIED
- Commit `446ca25` exists: VERIFIED
- 72/72 tests pass: VERIFIED
- `npm run verify -w @holmdigital/standards` exits 0: VERIFIED

---
*Phase: 34-klarsprak-plain-language-report*
*Completed: 2026-06-11*
