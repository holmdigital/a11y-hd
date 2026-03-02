# Feature Landscape

**Domain:** TypeScript monorepo stability pass — accessibility library
**Researched:** 2026-03-02
**Confidence:** HIGH (based on direct codebase analysis + established TypeScript/npm/i18n patterns)

---

## Scope of This Research

This milestone is a **stability pass**, not a feature pass. The three technical capability domains under investigation are:

1. **Properly typed TypeScript accessibility library** — type exports, discriminated unions, generic constraints
2. **Version management in npm monorepos** — single source of truth, build-time injection, runtime resolution
3. **Multi-locale React component libraries** — template loading, locale routing, fallback chains

Each feature below is evaluated against the actual codebase state (audited 2026-02-26) to ensure recommendations are grounded in what is broken, not hypothetical.

---

## Table Stakes

Features that a stable library must have. Missing or broken = library cannot be trusted by consumers.

### Domain 1: TypeScript Type Safety

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| Exported named interfaces for all public data shapes | Consumers need to type-check against library contracts. Without named exports, consumers write `any` or duplicate types. | Low | BROKEN — `RegulatoryReport` is exported but missing `failingNodes` and `legalContext` which are added at runtime by the engine |
| No `as any` casts in core data flow paths | `as any` bypasses the compiler entirely. Every cast is a latent bug that the type system cannot catch. | Medium | BROKEN — 40+ instances. The `enrichResults()` → reporting pipeline casts `report as any` in every downstream consumer: `html-template.ts`, `junit-generator.ts`, `github-actions.ts` |
| Discriminated union or explicit optional properties for runtime-extended types | When a base type (`RegulatoryReport`) is extended at runtime with additional properties (`failingNodes`, `legalContext`), the extension must be modeled in the type system, not worked around with casts | Low | BROKEN — `enrichResults()` uses `as any` to attach `failingNodes` and `legalContext` rather than returning a properly typed `EnrichedReport` |
| Explicit optional keys instead of index signatures on domain interfaces | `[key: string]: any` on `HolmDigitalInsight` makes the entire object escape the type system. All known dynamic keys should be explicit optional properties. | Low | BROKEN — `HolmDigitalInsight` has `[key: string]: any` (types.ts line 57) |
| All public type exports re-exported from package entry point | Consumers importing `@holmdigital/standards` must be able to use all types without reaching into internal paths | Low | PARTIAL — `LegalContext`, `FailingNode` (not yet defined) need to be added to the public export surface |
| TypeScript strict mode throughout | `strict: true` ensures `null` checks, no implicit `any`, no unchecked indexing | Low | EXISTING — TypeScript 5.7.2 strict mode is on, but ESLint `no-explicit-any` is warning-only, not error |
| `.d.ts` declaration files emitted for all packages | Consumers using the library in a TypeScript project need type information. tsup `--dts` covers this. | Low | EXISTING — all three packages emit `--dts` via tsup |

### Domain 2: Version Management

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| Single source of truth for package version | Hardcoded version strings drift from `package.json` after every release. The only authoritative source is `package.json`. | Low | BROKEN — three different hardcoded versions in `cloud-client.ts` (`1.4.4`), `cli/index.ts` (`0.1.0`), `regulatory-scanner.ts` fallback (`2.1.1`) against actual `2.1.5` |
| CLI `--version` reports correct package version | Users and CI pipelines rely on `--version` for debugging, audit trails, and compatibility checks | Low | BROKEN — reports `0.1.0` |
| Cloud API payload sends correct engine version | The HolmDigital Cloud uses `engine_version` for filtering, dashboards, and regression tracking | Low | BROKEN — sends `1.4.4` |
| Version read at build time or startup, not hardcoded | Hardcoded strings require manual updates; automated version reads never drift | Low | PARTIAL — `getEngineVersion()` in `regulatory-scanner.ts` reads from `package.json` at runtime, but `cloud-client.ts` and `cli/index.ts` ignore it |
| Consistent version string across all entry points | Cloud client, CLI, scanner metadata, and scan results must all report identical versions | Low | BROKEN — they each use different values |

### Domain 3: Multi-Locale Support

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| All supported locales produce correct output (not silent English fallback) | If a library advertises 9-locale support, passing any of those locales must produce locale-specific output | Medium | BROKEN — `AccessibilityStatement` component routes `sv` → Swedish and everything else → English via `(locale === 'sv' ? 'sv' : 'en')`. Norwegian (`no`) has a template but is silently shadowed |
| Locale routing via an exhaustive map | A hardcoded ternary cannot scale. A lookup map over all supported locales is the minimum viable approach | Low | PARTIAL — `supportedLocales` map exists (`{sv: 'sv', no: 'no', nb: 'no'}`) but only covers 3 of 9 locales; `da`, `de`, `fi`, `fr`, `nl`, `es` all fall through to English |
| Template existence validated at load time (not silently absent) | If a template is missing, it should fail loudly rather than substituting English and producing a legally non-compliant document | Medium | BROKEN — component uses in-source `TEMPLATES` constant containing only `sv`, `en`, `no`; other locales silently get English |
| Consistent template source between engine and component | The engine's `statement-generator.ts` loads from 9 external JSON files. The component's `AccessibilityStatement.tsx` uses inline hardcoded strings for 3 locales. These can diverge. | High | BROKEN — two separate template systems with different logic ordering (component: conditionals → substitution → choices; generator: load JSON → substitution → choices → conditionals differ) |
| Date formatting respects locale | Dates in compliance statements must match the locale's conventional format to be legally valid (e.g., "1 januari 2025" in Swedish, "1. Januar 2025" in German) | Low | EXISTING — `formatDiggDate()` uses `Intl.DateTimeFormat` locale map correctly, but `da`, `de`, `fi`, `fr`, `nl`, `es` are missing from the locale map (line 154-163), falling back to `en-US` |
| Fallback chain: requested locale → English | When a locale is unknown or unsupported, falling back to English is acceptable provided the fallback is explicit, not accidental | Low | PARTIAL — fallback to English happens but is invisible to the caller; callers cannot detect the fallback |

### Domain 4: Test Coverage for Changed Code

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| Tests for type-safety changes (enrichment flow, reporting modules) | Type fixes without tests can regress silently | Medium | MISSING — `enrichResults()`, `html-template.ts`, `junit-generator.ts`, `github-actions.ts` have 0 tests |
| Tests for version resolution | Version logic must be verified to prove the fix works in both CJS and ESM contexts | Low | MISSING — `getEngineVersion()` has no test, cloud client version field has no test |
| Tests for locale/template routing in AccessibilityStatement | Bug being fixed (Norwegian silent fallback) needs a regression test | Medium | MISSING — no component tests for `AccessibilityStatement` |
| Existing 7 test files must continue passing | Regression gate for the stability pass | Low | EXISTING — 7 files pass; this is a constraint, not a feature to add |

---

## Differentiators

Nice-to-have improvements that add quality but are not blocking stability. These should be noted for a future pass, not addressed in this milestone.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Branded types for locale codes (`type LocaleCode = 'sv' \| 'en' \| 'no' \| ...`) | Prevents passing arbitrary strings as locale identifiers; compiler catches invalid locales at call sites | Low | Simple union type addition; safe to do during stability pass as a byproduct |
| Generic `EnrichedReport<T extends RegulatoryReport>` | More flexible than a flat extension; allows future specialization | Medium | Over-engineering for current needs. Plain `EnrichedReport extends RegulatoryReport` is sufficient. Defer. |
| Template prop injection on `AccessibilityStatement` (`templateData?: LocaleTemplate`) | Allows consumers to supply custom templates, decoupling the component from template management | Medium | Architectural change. Out of scope for stability pass. |
| Build-time template bundling via tsup `define` | Bundle template JSON into the component at build time, eliminating runtime file loading risk | Medium | Worthwhile for the engine's `statement-generator.ts` path fragility, but complex to implement correctly for ESM+CJS. |
| Changesets integration for version management | Automates version bumping, changelog generation, and coordinated monorepo releases | High | Current manual process works. Changesets adds CI overhead. Not needed for this milestone. |
| Explicit `isBrave` API for external locale detection | Return the resolved locale so callers can detect fallbacks | Low | Useful but not blocking |
| `@testing-library/react` snapshot tests for each locale | Verify rendered output per locale | Medium | High value but exceeds "test what we change" scope |

---

## Anti-Features

Things to explicitly NOT do during this stability pass. These would introduce risk without solving the stability problems.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Rewrite `renderTemplate()` / `processText()` into a shared utility | Dedup is noted in CONCERNS.md but explicitly called out-of-scope in PROJECT.md. Touching both template systems risks breaking statement generation behavior for all locales and formats. | Fix the locale routing bug inside the existing `AccessibilityStatement` component without changing the rendering logic |
| Remove the inline `TEMPLATES` constant entirely in favor of JSON files | This would require the component to load JSON at runtime (async, bundler-dependent path resolution) or at build time (tsup config change). Both are architectural changes beyond the stability scope. | Expand the existing `supportedLocales` map to cover all 9 locales using the inline templates. The inline templates already exist for `sv`, `en`, and `no` — add `da`, `de`, `fi`, `fr`, `nl`, `es` inline templates matching the JSON sources, or extend the map. |
| Change `RegulatoryReport` public type in a breaking way | Existing consumers depend on the current shape. Adding required fields breaks them. | Add `failingNodes?` and `legalContext?` as optional fields, or introduce `EnrichedReport extends RegulatoryReport` as an additive subtype |
| Upgrade tsup, TypeScript, axe-core, or Puppeteer | Dependency upgrades are not stability fixes; they introduce their own regression risk | Fix code bugs within current toolchain versions |
| Add integration tests that require a live browser | Integration tests for the scanner require Puppeteer + a real URL; they are high value but out of scope for a stability pass that focuses on unit-testable changes | Test `enrichResults()` with mocked axe output; test `generateStatementContent()` with fixture scan results |
| Convert global `currentLang` mutable state to React Context or a class instance | Correct architecture, but this is a refactor that changes the calling convention for `setLanguage()`/`t()` throughout the CLI | Leave the global for now; ensure tests don't rely on leaked state between test runs by resetting `currentLang` in `beforeEach` |
| Fix the monorepo build script fragility (components `package.json` glob) | Valid tech debt but unrelated to type safety, versioning, or locale bugs | Noted in CONCERNS.md; address in a separate "build hygiene" task |
| Fix the `--no-sandbox` Puppeteer security concern | Security improvement, not a stability bug | Out of scope; document in a security backlog |

---

## Feature Dependencies

```
TS-1: Define FailingNode interface
  → TS-2: Define EnrichedReport extending RegulatoryReport (requires FailingNode)
  → TS-3: Remove `as any` in enrichResults() (requires EnrichedReport)
  → TS-4: Remove `as any` in reporting modules (requires TS-3 — EnrichedReport must be visible)
  → TS-5: Remove [key: string]: any from HolmDigitalInsight (independent of above)
  → TS-6: Tests for enrichment and reporting paths (requires TS-3, TS-4)

VER-1: Decide version source approach (build-time tsup define vs runtime getEngineVersion())
  → VER-2: Remove hardcoded version in cli/index.ts (requires VER-1 decision)
  → VER-3: Remove hardcoded version in cloud-client.ts (requires VER-1 decision)
  → VER-4: Update fallback in regulatory-scanner.ts getEngineVersion() (independent, minor)
  → VER-5: Tests for version resolution (requires VER-2, VER-3)

I18N-1: Expand supportedLocales map in AccessibilityStatement to all 9 locales
  → I18N-2: Add missing inline templates for da, de, fi, fr, nl, es (requires I18N-1)
  → I18N-3: Expand date formatting localeMap to include all 9 locales (parallel to I18N-1)
  → I18N-4: Tests for locale routing and template rendering per locale (requires I18N-1, I18N-2)

Build order constraint:
  @holmdigital/standards (TS-1, TS-2, TS-5) must build before
  @holmdigital/components (I18N-1, I18N-2, I18N-3) must build before
  @holmdigital/engine (TS-3, TS-4, VER-2, VER-3)
```

---

## MVP Recommendation

Prioritize in this order to respect the build dependency chain and minimize regression risk:

1. **TS-1 + TS-2** — Define `FailingNode` interface and `EnrichedReport` type in `@holmdigital/standards`. This is the foundation for all `as any` removal. Zero behavior change, pure type addition.

2. **TS-5** — Remove `[key: string]: any` from `HolmDigitalInsight` and add explicit optional keys. Independent of the above; do it first in `standards` while touching the file.

3. **VER-1 decision + VER-2 + VER-3** — `getEngineVersion()` already exists and works. Both `cli/index.ts` and `cloud-client.ts` import from `regulatory-scanner.ts` anyway. The fix is: call `getEngineVersion()` instead of the hardcoded literal. One-liner change per file.

4. **TS-3 + TS-4** — Remove `as any` casts from `enrichResults()` and all reporting modules once `EnrichedReport` is defined and visible.

5. **I18N-1 + I18N-2 + I18N-3** — Expand the locale map and add inline templates for all 9 locales. Match content from the existing JSON templates in `packages/engine/src/reporting/templates/`.

6. **TS-6 + VER-5 + I18N-4** — Tests for every area touched above. Scope to: `enrichResults()` unit test (mock axe output), version field tests, locale routing tests for all 9 locales in `AccessibilityStatement`.

**Defer:** Template dedup, build script globbing, security flags, integration tests, changesets.

---

## Sources

- Direct codebase audit: `packages/standards/src/types.ts`, `packages/engine/src/core/regulatory-scanner.ts`, `packages/engine/src/cli/index.ts`, `packages/engine/src/cli/cloud-client.ts`, `packages/engine/src/i18n/index.ts`, `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`, `packages/engine/src/reporting/junit-generator.ts` — HIGH confidence, source of truth
- `.planning/codebase/CONCERNS.md` (2026-02-26 audit) — HIGH confidence, cross-validated against source
- `.planning/PROJECT.md` (2026-03-02) — HIGH confidence, authoritative scope definition
- TypeScript 5.x interface extension and discriminated union patterns — HIGH confidence (well-established language features, no version staleness concern)
- tsup `define` option for build-time constant injection — MEDIUM confidence (known feature, not verified against current tsup 8.x docs due to tool restrictions)
- npm `package.json` as version source of truth — HIGH confidence (universal npm convention)
