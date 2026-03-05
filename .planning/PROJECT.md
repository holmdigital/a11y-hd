# a11y-hd

## What This Is

HolmDigital's accessibility scanning engine, regulatory standards database, and prescriptive React component library — a monorepo of three npm packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) that maps WCAG criteria to EN 301 549 and Swedish DOS-lagen, scans pages via Puppeteer + axe-core, and generates compliance reports in multiple formats.

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
- ✓ `FailingNode` and `EnrichedReport` types in `@holmdigital/standards` — v0.1
- ✓ `HolmDigitalInsight` tightened (no index signature) — v0.1
- ✓ `ScanResult.reports` typed as `EnrichedReport[]` — v0.1
- ✓ Zero `as any` casts in production code — v0.1
- ✓ Build-time version injection via tsup `define` — v0.1
- ✓ CLI, cloud client, and reports derive version from `package.json` — v0.1
- ✓ `AccessibilityStatement` routes all 9 EU locales correctly — v0.1
- ✓ 74 tests across 9 files covering enrichment, version, locales, placeholders — v0.1
- ✓ `evaluationMethod` localized for all 9 EU locales — v0.2
- ✓ `statusMap` expanded to all 9 EU locales — v0.2
- ✓ UI chrome (badges, footer, labels) localized for 12 locales (9 EU + en-gb/en-us/en-ca) — v0.2
- ✓ Statement generation extended to en-gb, en-us, en-ca with jurisdiction-specific legislation — v0.2
- ✓ ESM `import.meta` warning fixed via tsup shims — v0.2
- ✓ TLD-based country detection for .uk/.us/.ca — v0.2
- ✓ 127 automated locale tests with zero failures — v0.2

### Active

(None — next milestone requirements TBD via `/gsd:new-milestone`)

### Out of Scope

- Template rendering dedup (engine vs component) — accepted architecture decision (wrong dependency direction)
- Performance fixes (vDOM removal, browser reuse for PDF) — not a stability issue
- Native speaker validation of non-English translations — requires external review
- Engine JSON template section[5] missing `title` (produces `## undefined` in Markdown) — cosmetic, future fix

## Context

- Monorepo: `packages/standards` -> `packages/components` -> `packages/engine` (strict dependency order)
- Build: tsup 8.5.1 (CJS + ESM + DTS), TypeScript 5.7.2 strict mode
- Test framework: Vitest 4.0.16, @testing-library/react 16.3.2
- Current test coverage: 127 locale-related tests + 16 standards tests across 3 test files
- Zero `as any` in production source files (3 occurrences in test files only, documented)
- `EnrichedReport extends RegulatoryReport` with typed `failingNodes` and `legalContext`
- Build-time `__ENGINE_VERSION__` injected via tsup `define` from `package.json`
- `AccessibilityStatement` has 12 inline templates (9 EU + en-gb/en-us/en-ca) with complete placeholder substitution
- Engine has 12 JSON templates with locale-specific prose and placeholder exhaustiveness testing
- Locale lookup maps (module-level `Record<string, string>`) for evaluationMethod, statusMap, badges, labels, footer
- TLD-based country detection (.uk→GB, .us→US, .ca→CA) with ENFORCEMENT_BODIES map integration
- ~8,900 LOC TypeScript across all packages (net +637 from v0.2)

## Constraints

- **Backwards compatibility**: Public API surface must not break existing consumers
- **Build order**: standards -> components -> engine (changes to types cascade)
- **Test suite**: All 127+ locale tests must continue passing
- **Pre-publish**: Run `npm run build` in packages/components before npm publish (dist stale after v0.2 source changes)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build-time version injection via tsup `define` | Runtime `readFileSync` fails in dist context; build-time is reliable | ✓ Good |
| `EnrichedReport extends RegulatoryReport` | Additive subtype — base type frozen, no semver break | ✓ Good |
| Inline templates in component (not cross-package import) | Wrong dependency direction (engine → components); keeps component self-contained | ✓ Good |
| `AxeScanOutput` as local interface (not importing `AxeResults`) | Serialized page.evaluate output is a subset of axe-core's full type | ✓ Good |
| `unknown` with narrowing for i18n JSON traversal | Legitimate for JSON key traversal after typeof+in checks | ✓ Good |
| Bracket notation for private method testing | Avoids production code changes; documented pattern for TypeScript | ✓ Good |
| tsup `shims: true` for ESM `__dirname` support | Eliminates `import.meta.url` conditional; single `__dirname` path | ✓ Good |
| Module-level locale lookup maps (not inline ternaries) | Extensible, testable, consistent pattern across engine and component | ✓ Good |
| Separate `locale-chrome.ts` for component chrome maps | Mirrors engine pattern; prevents AccessibilityStatement.tsx bloat | ✓ Good |
| `.gov` TLD left unmapped | Ambiguous (could be any country); requires explicit `country` metadata | ✓ Good |
| en-gb/en-us/en-ca route to own templates (not generic en) | Jurisdiction-specific legislation requires distinct prose, not fallback | ✓ Good |

## Current State

Shipped v0.2 Full Localization (2026-03-05). All i18n expanded from binary sv/en to 12 locales. Next milestone TBD.

---
*Last updated: 2026-03-05 after v0.2 milestone*
