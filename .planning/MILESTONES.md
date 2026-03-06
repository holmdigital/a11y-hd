# Milestones

## v0.3 National Compliance (Shipped: 2026-03-06)

**Phases:** 3 | **Plans:** 4 | **Commits:** 13 | **Changes:** +1,426 / -151 lines across 24 files
**New tests:** 58 | **Total tests:** 225 | **Timeline:** 2026-03-06 (same day)

**Key accomplishments:**
- Expanded `@holmdigital/standards` with 14-country dual WAD/EAA enforcement body map, `ENFORCEMENT_BODIES_DETAILED`, and `getEnforcementBody(country, sector?)` helper
- Rewrote TLD detection in engine from fragile `endsWith()` chain to URL hostname parse + `TLD_MAP`, extending coverage to all 9 EU TLDs (.de, .fr, .nl, .fi, .dk, .no, .es, .se, .it)
- Updated all 8 EU engine JSON templates to use `{<national_law>}` placeholder — zero hardcoded law names remain
- Updated all 8 EU component inline TEMPLATES with sector-aware enforcement body (`getEnforcementBody(country, sector)`) and `{<national_law>}` placeholder
- Established auto-syncing test pattern: test assertions call standards functions directly instead of hardcoding strings — tests auto-update when law data changes

**Phases:**
- Phase 11: Enforcement Body Data — 14-country dual WAD/EAA storage with getEnforcementBody() helper (2026-03-06)
- Phase 12: Engine National Compliance — TLD_MAP, standards helpers, {<national_law>} in all 8 EU templates, 32 new tests (2026-03-06)
- Phase 13: Component National Compliance — sector pass-through, {<national_law>} in 8 EU TEMPLATES, 16 new per-locale tests (2026-03-06)

**Tech debt (deferred):**
- Italian (it) locale template in component — LOC-01 future milestone (falls back to English)
- `--sector` CLI flag for engine (EAA mode) — future phase
- Component dist rebuild needed before npm publish

---

## v0.2 Full Localization (Shipped: 2026-03-05)

**Phases completed:** 5 phases, 8 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v0.1 a11y-hd Stability Pass (Shipped: 2026-03-03)

**Phases:** 5 | **Plans:** 9 | **Commits:** 20 | **Changes:** +1,941 / -93 lines across 37 files

**Key accomplishments:**
- Defined `FailingNode` and `EnrichedReport` types in `@holmdigital/standards` — typed scan results without casts
- Build-time version injection via tsup `define` — CLI, cloud client, and reports derive from `package.json`
- Removed all `as any` casts from production code (engine, reporting, CLI, components)
- Fixed `AccessibilityStatement` to route all 9 EU locales with complete placeholder substitution
- Added 22 tests: enrichment pipeline, version resolution, 9 locale routings, placeholder leakage
- Full test suite: 74 tests across 9 files, 0 failures

**Phases:**
1. Standards Types — `FailingNode`, `EnrichedReport`, tightened `HolmDigitalInsight` (2026-03-02)
2. Version Fix — `__ENGINE_VERSION__` build-time constant, dynamic locale footers (2026-03-03)
3. Engine Casts — Zero `as any` in regulatory-scanner, reporting, CLI, i18n, components (2026-03-03)
4. Locale Routing — 9 inline templates, 67 placeholder mappings, Norwegian bug fixes (2026-03-03)
5. Test Coverage — 22 tests for enrichment, version, locales, placeholders (2026-03-03)

**Tech debt (deferred):**
- statement-generator `evaluationMethod` only localized for Swedish
- statement-generator `statusMap` only covers sv/no/da
- UI chrome (status badges, footer) only has sv/en variants
- `import.meta` ESM warning in statement-generator.ts (pre-existing, non-fatal)

---

