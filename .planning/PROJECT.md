# a11y-hd Stability Pass

## What This Is

HolmDigital's accessibility scanning engine, regulatory standards database, and prescriptive React component library — a monorepo of three npm packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) that maps WCAG criteria to EN 301 549 and Swedish DOS-lagen, scans pages via Puppeteer + axe-core, and generates compliance reports in multiple formats.

This milestone focuses on stabilizing the foundation: eliminating unsafe type casts, fixing version reporting bugs, resolving broken locale handling, and adding test coverage for every area touched.

## Core Value

The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.

## Requirements

### Validated

- ✓ Regulatory scanning via Puppeteer + axe-core — existing
- ✓ WCAG -> EN 301 549 -> DOS-lagen rule mapping — existing
- ✓ Multi-format report generation (PDF, HTML, JUnit, JSON) — existing
- ✓ Accessibility statement generation with localized templates — existing
- ✓ 29 prescriptive React components with ARIA enforcement — existing
- ✓ CLI tool (`hd-a11y-scan`) with cosmiconfig support — existing
- ✓ HolmDigital Cloud API integration — existing
- ✓ i18n with 9+ locales for UI strings and statement templates — existing

### Active

- [ ] Extend `RegulatoryReport` type with `failingNodes` and `legalContext` properties
- [ ] Define `FailingNode` and `LegalContext` interfaces in `@holmdigital/standards`
- [ ] Remove all `as any` casts from core paths (engine, reporting, CLI, components)
- [ ] Remove `[key: string]: any` from `HolmDigitalInsight`, add explicit optional keys
- [ ] Fix version string to use a single source of truth (no hardcoded versions)
- [ ] Fix CLI `--version` to report actual package version
- [ ] Fix cloud client to send correct engine version
- [ ] Fix `AccessibilityStatement` locale handling to support all 9 languages (not just sv/en)
- [ ] Add tests for type-safety changes (enrichment, reporting, CLI paths)
- [ ] Add tests for version resolution
- [ ] Add tests for locale/template handling in AccessibilityStatement component

### Out of Scope

- Template rendering dedup (engine vs component) — related but separate concern, tackle after stability pass
- Performance fixes (vDOM removal, browser reuse for PDF) — not a stability issue
- New feature work — this is purely foundational cleanup
- Test coverage for untouched code — only test what we change

## Context

- Monorepo: `packages/standards` -> `packages/components` -> `packages/engine` (strict dependency order)
- Build: tsup (CJS + ESM + DTS), TypeScript 5.7.2 strict mode
- Test framework: Vitest 4.0.16, @testing-library/react 16.3.2
- Current test coverage: ~15% (7 test files / ~49 source files)
- ESLint already warns on `@typescript-eslint/no-explicit-any` but warnings are not blocking
- The `as any` problem is concentrated in `enrichResults()` flow: standards defines `RegulatoryReport` without `failingNodes`/`legalContext`, engine adds them at runtime, all downstream reporting accesses via casts
- Version strings hardcoded in 3 places: cloud-client.ts (1.4.4), cli/index.ts (0.1.0), regulatory-scanner.ts (2.1.1) — actual version is 2.1.2
- AccessibilityStatement component hardcodes templates for sv/en/no but only routes sv to Swedish, everything else to English

## Constraints

- **Backwards compatibility**: Public API surface (`@holmdigital/standards` types, `@holmdigital/engine` exports, `@holmdigital/components` props) must not break existing consumers
- **Build order**: standards -> components -> engine (changes to types in standards cascade)
- **Existing tests**: All 7 existing test files must continue passing
- **No runtime behavior change**: Scan results, report output, and compliance scores must remain identical — we're fixing types and bugs, not changing logic

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Version source of truth approach | Research best option (build-time inject vs runtime read) | — Pending |
| Template/locale fix approach | Research cleanest way to support all 9 locales in component | — Pending |
| Extend vs new type for EnrichedReport | Extending `RegulatoryReport` is simpler; new type is safer | — Pending |

---
*Last updated: 2026-03-02 after initialization*
