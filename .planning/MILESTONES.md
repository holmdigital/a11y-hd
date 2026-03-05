# Milestones

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

