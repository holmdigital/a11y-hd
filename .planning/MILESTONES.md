# Milestones

## v0.6 Components Quality (Shipped: 2026-05-11)

**Phases:** 5 | **Plans:** 25 | **Commits:** ~108 | **Test files:** 7 → 28 (+21) | **Tests:** 165 → 453 (+288)

**Key accomplishments:**
- Reusable test infrastructure landed in `@holmdigital/components`: 7 jsdom polyfills, axe-core wrapper with 11 documented disables, 3 reusable helpers (`expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`), `TESTING-CONVENTIONS.md` codifying Tier 1/2/3 grammar with WCAG-SC traceability
- 19 components covered (was 1): Tier 1+2 suites for Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, Tabs (Phase 22) + 6 complex APG widgets (Phase 24) — Combobox/DatePicker/MultiSelect/DataTable/TreeView with W3C APG keyboard contracts pinned; NavigationMenu tested as APG Disclosure (Menubar upgrade deferred to TC-14-IMPL)
- Tabs, Accordion, Breadcrumbs migrated from Tailwind utility classes to inline-style + co-located `.css` files (CSS custom properties for theming with `var(--hd-{component}-{role}, default)` fallbacks; `:focus-visible` preserved per WCAG 2.4.7)
- 3 CI guards added: `test:wcag-headers`, `check-no-tailwind-leak` (scoped to 3 migrated dirs), `check-no-test-leak` (all 89 dist files)
- AccessibilityStatement `'2024-01-01'` publishDate fallback replaced with `[YOUR PUBLISH DATE]` placeholder across 13 locale slots; 2 regression-guard tests pin the fix
- Unified `verify` pipeline gates `npm publish` in all 3 packages (`publint --strict` + `attw --pack . --ignore-rules no-resolution` + build + tests); 29 component subpaths exposed CJS `require` with per-condition types; `lucide-react` → optional peerDep with text-glyph fallbacks
- LiveRegion TS2503 (deferred since Phase 22-01) resolved in Phase 26-01 — DTS build succeeds end-to-end

**Phases:**
- Phase 22: Test Infrastructure + First-7 Components — 9 plans, 7 → 16 test files (2026-05-10)
- Phase 23: Styling Unification — 4 plans, tsup.config.ts + sideEffects + CSS pipeline + STY-05 guard (2026-05-10)
- Phase 24: Complex APG Widget Test Coverage — 6 plans, 6 widget test files (2026-05-11)
- Phase 25: AccessibilityStatement publishDate Fix + Regression Guards — 1 plan, 13-site mechanical replace + 2 guards (2026-05-10)
- Phase 26: Publish Hygiene — 5 plans, `verify` chain + LiveRegion keystone fix (2026-05-11)

**Tech debt (deferred to v0.7):**
- TC-09-LIVE, TC-10-LIVE, TC-11-LIVE — live-region announcements for Combobox/DatePicker/MultiSelect
- TC-10-IMPL, TC-11-IMPL, TC-12-IMPL — APG keyboard handler implementations (DatePicker/MultiSelect/DataTable)
- TC-14-IMPL — NavigationMenu Menubar upgrade
- TC-15, STY-07, PUB-07, PUB-08 — pre-existing v0.7 carries
- `npm publish --dry-run` + attw stdio quirk investigation

**Notable surprises:**
- Multiple worktree agents (Phase 22-09, 24 all 6, 26-02) forked from stale origin/master `5ce4646` instead of local master. Most self-recovered with `git reset --hard <local-HEAD>`; one (26-02) halted and needed SendMessage corrective. Recurring orchestration friction.
- Researcher source-read at Phase 24 plan time surfaced 4 CONTEXT mismatches (live-region absent from 3 widgets, NavigationMenu is Disclosure not Menubar, DataTable less stub than thought, MultiSelect also partial-stub). Saved ~50 LOC of misplaced no-throw stubs.
- Phase 25 count drift (13, not 14) caught by plan-checker pre-execution.

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

