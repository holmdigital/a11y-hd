# Requirements: a11y-hd Stability Pass

**Defined:** 2026-03-02
**Core Value:** The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Type Safety

- [x] **TS-01**: Define `FailingNode` interface in `@holmdigital/standards` with shape matching axe-core's `NodeResult` (`html`, `target`, `failureSummary`)
- [x] **TS-02**: Define `EnrichedReport extends RegulatoryReport` in `@holmdigital/standards` with `failingNodes?: FailingNode[]` and `legalContext?: LegalContext`
- [x] **TS-03**: Remove `[key: string]: any` index signature from `HolmDigitalInsight`, add explicit optional keys (`reasoning`, language-specific interpretations)
- [x] **TS-04**: Update `ScanResult.reports` type from `RegulatoryReport[]` to `EnrichedReport[]`
- [x] **TS-05**: Remove all `as any` casts from `enrichResults()` in `regulatory-scanner.ts`
- [x] **TS-06**: Remove all `(report as any)` casts from reporting modules (`html-template.ts`, `junit-generator.ts`, `github-actions.ts`, `statement-generator.ts`)
- [x] **TS-07**: Remove all `as any` casts from CLI action handler (`cli/index.ts`)
- [x] **TS-08**: Remove all `as any` casts from `AccessibilityStatement.tsx` component
- [x] **TS-09**: Remove all `as any` casts from `i18n/index.ts`

### Version Management

- [x] **VER-01**: Inject engine version at build time via tsup `define` (single source of truth from `package.json`)
- [x] **VER-02**: CLI `--version` reports the actual package version (not hardcoded `0.1.0`)
- [x] **VER-03**: Cloud client sends the actual engine version (not hardcoded `1.4.4`)
- [x] **VER-04**: Remove stale fallback version string `2.1.1` from `regulatory-scanner.ts`

### Locale Handling

- [x] **I18N-01**: `AccessibilityStatement` routes all 9 supported locales correctly (sv, en, no, da, de, fi, fr, nl, es)
- [x] **I18N-02**: Norwegian locale (`no`) renders the Norwegian template (not English)
- [x] **I18N-03**: Unsupported locales fall back to English explicitly (not silently)

### Testing

- [x] **TEST-01**: Tests for `EnrichedReport` type usage through the enrichment pipeline (mocked axe output)
- [x] **TEST-02**: Tests for version resolution — build-time constant is correct, no hardcoded strings remain
- [x] **TEST-03**: Tests for all 9 locale routings in `AccessibilityStatement` component
- [x] **TEST-04**: Placeholder leakage test — no `{...}` template variables survive in rendered output for any locale
- [x] **TEST-05**: All existing tests continue to pass

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Template Deduplication

- **TMPL-01**: Extract shared template processing logic from component and engine into shared utility
- **TMPL-02**: Reconcile template processing order (component: substitution before choices; engine: choices before substitution)

### Performance

- **PERF-01**: Remove unused `VirtualDOMBuilder.build()` call from scan pipeline
- **PERF-02**: Reuse scanner browser instance for PDF generation instead of spawning second Chromium

## Out of Scope

| Feature | Reason |
|---------|--------|
| Template rendering dedup | Related but separate concern — higher risk, separate milestone |
| Performance fixes (vDOM, PDF browser) | Not a stability issue — no type/correctness impact |
| New feature work | This is purely foundational cleanup |
| Test coverage for untouched code | Only test what we change — avoid scope creep |
| Component library broad test coverage | Separate milestone after stability pass |
| Removing inline TEMPLATES from component | Too intertwined with template dedup — defer |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TS-01 | Phase 1 | Complete |
| TS-02 | Phase 1 | Complete |
| TS-03 | Phase 1 | Complete |
| TS-04 | Phase 1 | Complete |
| TS-05 | Phase 3 | Complete |
| TS-06 | Phase 3 | Complete |
| TS-07 | Phase 3 | Complete |
| TS-08 | Phase 3 | Complete |
| TS-09 | Phase 3 | Complete |
| VER-01 | Phase 2 | Complete |
| VER-02 | Phase 2 | Complete |
| VER-03 | Phase 2 | Complete |
| VER-04 | Phase 2 | Complete |
| I18N-01 | Phase 4 | Complete |
| I18N-02 | Phase 4 | Complete |
| I18N-03 | Phase 4 | Complete |
| TEST-01 | Phase 5 | Complete |
| TEST-02 | Phase 5 | Complete |
| TEST-03 | Phase 5 | Complete |
| TEST-04 | Phase 5 | Complete |
| TEST-05 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-03 — all v1 requirements complete*
