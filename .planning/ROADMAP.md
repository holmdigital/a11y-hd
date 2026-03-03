# Roadmap: a11y-hd Stability Pass

## Overview

This milestone stabilizes the three-package accessibility monorepo by addressing three structural defects: a missing public type that forces 40+ `as any` casts throughout the engine and reporting pipeline, hardcoded version strings that diverge from the actual package version, and a locale routing bug that silently returns English for 7 of the 9 advertised locales. The work proceeds in strict dependency order (standards -> components -> engine) with tests added after each code area is fixed.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Standards Types** - Define `FailingNode`, `EnrichedReport`, and tighten `HolmDigitalInsight` in `@holmdigital/standards` (completed 2026-03-02)
- [x] **Phase 2: Version Fix** - Inject engine version at build time via tsup `define`; eliminate all hardcoded version strings (completed 2026-03-03)
- [ ] **Phase 3: Engine Casts** - Remove all `as any` casts from the engine, reporting, CLI, and i18n paths using the new types
- [ ] **Phase 4: Locale Routing** - Fix `AccessibilityStatement` to correctly route all 9 supported locales
- [ ] **Phase 5: Test Coverage** - Add tests for enrichment pipeline, version resolution, and all 9 locale routings

## Phase Details

### Phase 1: Standards Types
**Goal**: The `@holmdigital/standards` package exports all types needed to describe the enriched scan result — consumers can import `FailingNode` and `EnrichedReport` without any runtime casts
**Depends on**: Nothing (first phase)
**Requirements**: TS-01, TS-02, TS-03, TS-04
**Success Criteria** (what must be TRUE):
  1. `FailingNode` is a named export from `@holmdigital/standards` with `html`, `target`, and `failureSummary` fields matching axe-core's `NodeResult` shape
  2. `EnrichedReport extends RegulatoryReport` is a named export with `failingNodes?: FailingNode[]` and `legalContext?: LegalContext` — the base `RegulatoryReport` type is unchanged (no breaking change)
  3. `HolmDigitalInsight` no longer has `[key: string]: any`; all used keys are explicit optional fields
  4. `ScanResult.reports` is typed as `EnrichedReport[]` (widened from `RegulatoryReport[]`)
  5. TypeScript build of `@holmdigital/standards` passes with zero errors
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Define FailingNode, EnrichedReport, tighten HolmDigitalInsight in standards types.ts + re-export from index.ts
- [ ] 01-02-PLAN.md — Update ScanResult.reports to EnrichedReport[] in engine regulatory-scanner.ts + full monorepo build verification

### Phase 2: Version Fix
**Goal**: Every version string the engine emits (CLI output, cloud API payload, scan metadata) derives from a single build-time constant — no hardcoded values remain in source files
**Depends on**: Nothing (independent of type changes)
**Requirements**: VER-01, VER-02, VER-03, VER-04
**Success Criteria** (what must be TRUE):
  1. Running `node packages/engine/dist/cli/index.js --version` prints the version from `packages/engine/package.json` (currently `2.1.2`)
  2. The cloud client payload's `engineVersion` field matches the same version — not `1.4.4`
  3. `tsup.config.ts` in `packages/engine` has a `define` block that injects `__ENGINE_VERSION__` from `package.json` at build time
  4. No source file contains a hardcoded version string (`1.4.4`, `0.1.0`, `2.1.1`) in a version-reporting context
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Create tsup.config.ts with build-time define, simplify getEngineVersion(), add globals.d.ts + vitest define
- [ ] 02-02-PLAN.md — Replace hardcoded v0.1.0 in 9 locale footers with {version} placeholder, full build+test verification

### Phase 3: Engine Casts
**Goal**: The engine, reporting modules, CLI, and i18n paths contain zero `as any` casts in core data-flow paths — every cast is replaced by the proper type from Phase 1
**Depends on**: Phase 1
**Requirements**: TS-05, TS-06, TS-07, TS-08, TS-09
**Success Criteria** (what must be TRUE):
  1. `enrichResults()` in `regulatory-scanner.ts` returns `EnrichedReport[]` with no `as any` — the axe-core `NodeResult` type is imported and used for the node shape
  2. All `(report as any).*` accesses in `html-template.ts`, `junit-generator.ts`, `github-actions.ts`, and `statement-generator.ts` are removed
  3. `cli/index.ts` contains no `as any` casts in its action handler
  4. `AccessibilityStatement.tsx` contains no `as any` casts
  5. TypeScript build of the full monorepo passes with zero errors after the cast removals
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Type enrichResults() and generateResultPackage() in regulatory-scanner.ts, remove casts from html-template, junit-generator, github-actions
- [ ] 03-02-PLAN.md — Remove casts from cli/index.ts, cloud-client.ts, statement-generator.ts, i18n/index.ts, clean up AccessibilityStatement.tsx

### Phase 4: Locale Routing
**Goal**: `AccessibilityStatement` correctly routes all 9 supported locales to their intended templates — Norwegian renders Norwegian, other locales fall back to English explicitly with documented intent
**Depends on**: Phase 1
**Requirements**: I18N-01, I18N-02, I18N-03
**Success Criteria** (what must be TRUE):
  1. Rendering `<AccessibilityStatement locale="no" />` produces Norwegian-language output (not English)
  2. Rendering with any of the 9 supported locales (sv, en, no, da, de, fi, fr, nl, es) produces output in the correct language or an explicit English fallback — never a silent mismatch
  3. No rendered output for any supported locale contains unresolved `{<...>}` placeholder variables
**Plans**: TBD

### Phase 5: Test Coverage
**Goal**: Every code area touched in this milestone has test coverage that will catch regressions — the enrichment pipeline, version resolution, and all 9 locale routings are verifiable by the test suite
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. A test asserts that `enrichResults()` called with mocked axe output produces a correctly typed `EnrichedReport[]` — field access on `failingNodes` and `legalContext` is typed, not cast
  2. A test asserts that the build-time `__ENGINE_VERSION__` constant equals the value in `packages/engine/package.json` — no hardcoded string appears in the assertion
  3. Tests for all 9 locale routings in `AccessibilityStatement` pass — each locale is asserted to produce the expected language marker in the output
  4. A placeholder-leakage test asserts that no `{<...>}` strings survive in rendered output for any locale
  5. All 7 pre-existing test files pass without modification
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Standards Types | 2/2 | Complete    | 2026-03-02 |
| 2. Version Fix | 0/2 | Complete    | 2026-03-03 |
| 3. Engine Casts | 0/2 | Not started | - |
| 4. Locale Routing | 0/? | Not started | - |
| 5. Test Coverage | 0/? | Not started | - |
