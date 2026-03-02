# Project Research Summary

**Project:** @holmdigital/a11y-hd (three-package accessibility scanning monorepo)
**Domain:** TypeScript monorepo stability pass — type safety, version management, locale/template handling
**Researched:** 2026-03-02
**Confidence:** HIGH — all findings grounded in direct codebase inspection across all four research domains

## Executive Summary

This is a stability pass on a published npm monorepo (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) that provides accessibility scanning, reporting, and statement generation for Nordic and European markets. The codebase is functionally working but has three structural defects that undermine consumer trust: 40+ `as any` casts hiding a missing type (`EnrichedReport`) in the public API, hardcoded version strings that diverge from `package.json`, and a locale routing bug that silently returns English for 7 of 9 supported locales. None of these are feature gaps — they are type contract failures and silent misbehaviors in a library whose consumers depend on its correctness for legally significant accessibility statements.

The recommended approach is a layered fix that respects the existing build dependency order: standards first (define the missing types), components second (fix locale routing), engine last (remove all casts that become unnecessary once the types exist). The root cause of nearly all `as any` usage is a single missing interface — `EnrichedReport extends RegulatoryReport` — that `enrichResults()` should have been returning all along. Defining it and widening `ScanResult.reports` to `EnrichedReport[]` cascades cleanly through the reporting pipeline, eliminating every downstream cast as a consequence rather than requiring individual surgical fixes.

The key risk is maintaining backwards compatibility with published consumers. `RegulatoryReport` is the public API surface of `@holmdigital/standards`. Any required field additions are a semver-breaking change. The safe path is exclusively additive: `EnrichedReport extends RegulatoryReport` with optional fields, keeping the base type frozen. The version fix is already 90% done at the code level — `getEngineVersion()` exists and is already called by both the CLI and the cloud client; only the stale fallback string needs updating and the `tsup define` injection needs adding to make it reliable across CJS/ESM dist contexts.

## Key Findings

### Recommended Stack

No technology changes are needed or recommended. The stability pass operates entirely within the current toolchain: TypeScript 5.7.2 (strict mode already on), tsup 8.3.5, Vitest 4.0.16, axe-core 4.11.1. Two existing toolchain features should be activated that are not currently used: `define` in tsup.config.ts (to bake version strings into the bundle at build time) and `define` in vitest.config.ts (to provide the same constant in test contexts).

**Core technologies:**
- TypeScript 5.7.2: Interface extension (`EnrichedReport extends RegulatoryReport`) — standard language feature, no library dependency
- tsup 8.3.5: `define` option for build-time version injection — eliminates runtime filesystem dependency for version reads
- Vitest 4.0.16: `define` in config for test-context version constant — mirrors tsup behavior so tests run against real version values
- axe-core 4.11.1: Provides `AxeResults` / `NodeResult` types — import these instead of `(node: any)` to close the remaining cast in `enrichResults()`
- @typescript-eslint 8.18.1: Upgrade `no-explicit-any` from `"warn"` to `"error"` — do this only after casts are removed, not before

### Expected Features

The scope is explicitly a **stability pass**, not a feature pass. Features are classified by whether they are broken in the current codebase.

**Must have (table stakes — currently broken):**
- Exported named types for all public data shapes (`FailingNode`, `EnrichedReport`) — consumers cannot type-check against the library without these
- No `as any` in core data flow paths (`enrichResults()` → reporting pipeline) — every cast is a latent runtime bug
- Correct version reporting from CLI `--version`, cloud API payload, and scan metadata — currently 3 different stale values
- All 9 advertised locales produce locale-appropriate output — currently 7 of 9 silently return English
- Explicit locale routing with documented fallback (not silent accidental fallback)
- Tests covering every code area touched by this milestone

**Should have (differentiators — deferred to after this milestone):**
- Branded `LocaleCode` type union — prevents invalid locale strings at call sites
- `template` prop on `AccessibilityStatement` — decouples component from template management
- Shared `processTemplate()` utility replacing duplicate `renderTemplate()` / `processText()` implementations
- Changesets integration for automated version management

**Defer (v2+):**
- Generic `EnrichedReport<T extends RegulatoryReport>` — over-engineering for current needs
- Integration tests requiring live browser/Puppeteer
- Converting module-level `currentLang` global to React Context
- Build script globbing fixes (separate "build hygiene" task)
- `--no-sandbox` Puppeteer security hardening

### Architecture Approach

The monorepo has a clear and correct dependency hierarchy: `@holmdigital/standards` (types, rules) → `@holmdigital/components` (React UI) → `@holmdigital/engine` (scan orchestration, CLI, cloud client). The three defects all share one structural root: layer boundaries are not enforced by the type system. Engine attaches runtime properties to standards-owned types using `as any` casts instead of a proper subtype; the component carries template data that belongs in the engine layer; version strings live in source files instead of being derived from `package.json`. The fix principle is identical for all three: move ownership to the correct layer and express it through the type system.

**Major components:**
1. `@holmdigital/standards/src/types.ts` — defines all shared interfaces; the fix starts and ends here by adding `FailingNode` and `EnrichedReport`
2. `@holmdigital/engine/src/core/regulatory-scanner.ts` — `enrichResults()` must return `EnrichedReport[]`; `getEngineVersion()` is the single version source and is already correct in structure
3. `@holmdigital/components/src/AccessibilityStatement/AccessibilityStatement.tsx` — locale routing must be replaced from a 3-locale ternary to a 9-locale explicit map
4. `@holmdigital/engine/src/reporting/` (html-template, junit-generator, cloud-client) — all casts removed as a downstream consequence of the `ScanResult.reports` type change
5. `packages/engine/tsup.config.ts` (new file) — adds `define: { __ENGINE_VERSION__: ... }` to make version reliable in dist

### Critical Pitfalls

1. **Breaking the published RegulatoryReport interface** — Adding `failingNodes` and `legalContext` as required fields on the base type is a semver-breaking change. Prevention: use `EnrichedReport extends RegulatoryReport` (new subtype, keeps base frozen) or add fields as optional to the base type. Never add required fields without a major version bump.

2. **Removing `as any` without verifying the axe-core node shape** — `node: any` in `enrichResults()` hides that `axe-core`'s `NodeResult.target` is `string[]`, not `string`. After removing the cast, the `FailingNode.target` mapping `.join(' ')` must be verified against the live axe-core type definitions. Prevention: import `NodeResult` from `axe-core`; write a unit test with `target: ['#foo', '.bar']` that asserts `.join(' ')` is applied.

3. **Runtime `readFileSync` version resolution fails in dist context** — `package.json` is not inside the `dist/` directory (the `files` array only includes `dist` and `README.md`), so `resolve(dir, '..', 'package.json')` fails silently after `npm publish`, falling back to the stale `'2.1.1'` string. Prevention: use tsup `define` to inject the version at build time, eliminating the filesystem dependency.

4. **Template processing order divergence produces different HTML vs Markdown output** — The React component and the Markdown generator implement the same template engine with opposite ordering (substitution before choices vs. choices before substitution). This is a legally significant document. Prevention: write a cross-path equality test before touching any template logic; any fix must preserve output parity across both paths.

5. **Global i18n state contaminates test isolation** — `currentLang` is a module-level `let`; Vitest shares process state across test files by default. Prevention: `afterEach(() => setLanguage('en'))` reset in every locale test file from day one.

## Implications for Roadmap

The research establishes an unambiguous three-phase execution order driven by the monorepo build dependency chain. Standards must build before components, components before engine. This is not a preference — it is a hard constraint because TypeScript project references enforce it.

### Phase 1: Standards Layer — Define Missing Types

**Rationale:** All 40+ `as any` casts cascade from a single missing type. Until `FailingNode` and `EnrichedReport` are defined and exported from `@holmdigital/standards`, no downstream cast removal is possible. This phase has zero behavior change — it is purely additive type definitions.

**Delivers:** `FailingNode` interface, `EnrichedReport extends RegulatoryReport`, removal of `[key: string]: any` from `HolmDigitalInsight` (with all explicit keys added including `reasoning?`), updated public exports from `src/index.ts`.

**Addresses:** TS-1, TS-2, TS-5 from FEATURES.md dependency graph

**Avoids:** Pitfall 1 (breaking published interface — use extension pattern, not modification), Pitfall 6 (missing `reasoning` field — enumerate all `holmdigitalInsight.*` accesses before removing the index signature)

**Research flag:** None needed — interface extension is a standard TypeScript pattern with no ambiguity.

### Phase 2: Version Fix — Build-Time Injection

**Rationale:** Version fix is independent of the type fix and components fix. It should be done in parallel with Phase 1 logically (same standards PR), or as a standalone change immediately after. The version fix has a hidden complexity (runtime path resolution fails in dist) that requires the tsup `define` approach rather than just calling `getEngineVersion()` in more places.

**Delivers:** `tsup.config.ts` in `packages/engine` with `define: { __ENGINE_VERSION__: ... }`, Vitest config updated with matching `define`, fallback in `getEngineVersion()` changed from `'2.1.1'` to `'unknown'`, version verified with `node dist/cli/index.js --version` after build.

**Addresses:** VER-1, VER-2, VER-3, VER-4, VER-5 from FEATURES.md dependency graph

**Avoids:** Pitfall 5 (runtime filesystem path fails in dist), Pitfall 8 (CJS/ESM dual build breaks `import.meta.url` in CJS context)

**Research flag:** None — tsup `define` is a documented first-class feature; Vitest `define` is identical.

### Phase 3: Engine Layer — Remove All as any Casts

**Rationale:** Engine changes require Phase 1 types to be in place. The single most impactful change is widening `ScanResult.reports` from `RegulatoryReport[]` to `EnrichedReport[]` — this causes the TypeScript compiler to flag every illegal `(report as any)` access as an error, making the cast removal self-guided. Fix what the compiler flags.

**Delivers:** `enrichResults()` returns `EnrichedReport[]`, `ScanResult.reports` typed as `EnrichedReport[]`, all `(report as any).*` casts removed in `html-template.ts`, `junit-generator.ts`, `cloud-client.ts`, `github-actions.ts`, `escapeXML` parameter tightened from `any` to `string | null | undefined`, i18n dynamic traversal casts documented with `// eslint-disable` rather than forced to typed (legitimate use case).

**Addresses:** TS-3, TS-4, TS-6 from FEATURES.md dependency graph

**Avoids:** Pitfall 2 (axe-core node shape — import `NodeResult` type; verify `.join(' ')` behavior), Pitfall 10 (partial cast removal — both casts in `junit-generator.ts` must be removed in the same commit)

**Research flag:** Minimal — patterns are well-established. Only the axe-core `NodeResult.target` array shape needs verification against current axe-core 4.11.1 types before finalizing the `FailingNode` definition.

### Phase 4: Components Layer — Fix Locale Routing

**Rationale:** The locale fix is self-contained in `AccessibilityStatement.tsx` but must come after standards (to confirm type compatibility of any new prop surface). The minimum fix is a two-line change to the `supportedLocales` map. The maximum fix adds a `template` prop for full locale support. Research recommends the explicit locale map as the minimum, with the `template` prop flagged as a separate milestone.

**Delivers:** `LOCALE_TO_TEMPLATE` map covering all 9 locales, Norwegian correctly routed to Norwegian template (bug fix), other 6 non-sv/en locales explicitly mapped to `'en'` (deliberate, documented fallback), `formatDiggDate` locale map expanded to include all 9 locales, icon detection switched from language-specific string matching to `section.id`-based selection, placeholder-leakage tests for all 9 locales.

**Addresses:** I18N-1, I18N-2, I18N-3, I18N-4 from FEATURES.md dependency graph

**Avoids:** Pitfall 3 (template processing divergence — write cross-path equality test before touching any template logic), Pitfall 4 (unresolved placeholder variables for non-Nordic locales — test with `/{<[^>]+>}/` regex on all output), Pitfall 7 (global i18n state — `afterEach` reset in all locale test files), Pitfall 11 (icon detection breaks for new locales — use `section.id`)

**Research flag:** Moderate attention needed. The substitution key casing for non-Nordic templates (e.g., `{<Bewertungsdatum>}` vs. `{<bewertungsdatum>}`) must be verified against the JSON template files before writing tests. This is a one-time audit, not deep research.

### Phase Ordering Rationale

- The standards → components → engine build order is enforced by TypeScript project references and cannot be changed.
- Phase 2 (version) is independent but logically grouped with Phase 1 because both touch `@holmdigital/standards` and `@holmdigital/engine` infrastructure with no behavior overlap.
- Phase 4 (locale) comes last not because of technical dependency but because it is the highest-risk change for regression: the Norwegian bug fix is an intentional behavioral change, the locale expansion touches a legally significant document path, and the test infrastructure needs to be solid before expanding locale coverage.
- Every phase must pass its full test suite before proceeding to the next — this is not optional; it is the only way to isolate regressions in a monorepo with cascading type changes.

### Research Flags

Phases likely needing attention during planning:
- **Phase 4 (locale):** Verify substitution key casing in non-Nordic JSON templates before writing tests. Run the existing 9 JSON templates through the generator and grep for unresolved `{<` placeholders to establish a baseline.
- **Phase 3 (engine casts):** Confirm axe-core 4.11.1 `NodeResult.target` type (`string[]`) before finalizing `FailingNode.target` type (`string` after `.join(' ')` transform). One import check against `node_modules/axe-core/axe.d.ts` is sufficient.

Phases with standard patterns (no additional research needed):
- **Phase 1 (standards types):** Interface extension is a foundational TypeScript pattern. The specific fields needed are enumerated in STACK.md and ARCHITECTURE.md. No ambiguity.
- **Phase 2 (version):** tsup `define` is documented with examples. The vitest `define` config mirrors it exactly. The implementation is fully specified in STACK.md.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All toolchain features (tsup define, Vitest define, axe-core types) verified against current versions in the codebase; no speculative recommendations |
| Features | HIGH | Derived from direct codebase audit cross-referenced with .planning/codebase/CONCERNS.md; every "broken" claim is backed by file + line number |
| Architecture | HIGH | Build dependency order confirmed by inspection of tsconfig project references and package.json scripts; `EnrichedReport extends RegulatoryReport` pattern is standard TypeScript |
| Pitfalls | HIGH | All pitfalls are grounded in static analysis; no speculative claims; two pitfalls (tsup CJS/ESM dual build, runtime readFileSync path) explain why a superficially "easy" version fix has hidden complexity |

**Overall confidence:** HIGH

### Gaps to Address

- **Substitution key casing for non-Nordic templates:** The generator maps substitution keys in lowercase (e.g., `'{<bewertungsdatum>}'`) but template JSON files may use mixed case. Verify against actual JSON content before writing placeholder-leakage tests. Resolution: one-time grep, not blocking Phase 4 planning.
- **Template processing divergence (HTML vs Markdown):** PITFALLS.md documents that `renderTemplate()` (component) and `processText()` (generator) have different evaluation order. A cross-path equality test is needed before any template logic is touched. Current extent of divergence is documented but not quantified. Resolution: write the test first in Phase 4; the test output will reveal the exact divergence.
- **Full template dedup:** Extracting a shared `processTemplate()` utility is the correct long-term fix for both the divergence and the template ownership problem. This is explicitly out of scope per PROJECT.md. Track as a follow-on milestone.

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `packages/standards/src/types.ts` — interface definitions, index signatures, export surface
- `packages/engine/src/core/regulatory-scanner.ts` — `enrichResults()` cast sites, `getEngineVersion()` pattern, `ScanResult` interface
- `packages/engine/src/reporting/` (html-template, junit-generator, cloud-client, statement-generator) — downstream cast sites, template processing, version usage
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` — locale routing bug, TEMPLATES constant, renderTemplate ordering
- `packages/engine/src/i18n/index.ts` — module-level global state, dynamic key traversal
- `packages/engine/package.json` — `files` array, version, tsup config
- `.planning/codebase/CONCERNS.md` — comprehensive codebase audit (2026-02-26)
- `.planning/PROJECT.md` — milestone scope, constraints, out-of-scope decisions

### Secondary (HIGH confidence — established patterns)
- TypeScript Handbook: interface extension, structural compatibility, discriminated unions
- tsup documentation: `define` option for build-time constant injection
- Vitest documentation: `define` config option

### Tertiary (not needed — no speculative claims)
None. All recommendations derive from direct inspection or well-established language/toolchain patterns.

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
