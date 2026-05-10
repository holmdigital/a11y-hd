# a11y-hd

## What This Is

HolmDigital's accessibility scanning engine, regulatory standards database, and prescriptive React component library — a monorepo of three npm packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) that maps WCAG criteria to EN 301 549 and national accessibility laws, scans pages via Puppeteer + axe-core, and generates country-specific compliance reports and statements in multiple formats and locales.

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
- ✓ ENFORCEMENT_BODIES expanded with all 9 EU country-specific enforcement bodies (WAD + EAA dual) — v0.3
- ✓ Engine JSON templates reference correct national enforcement body and law name per country — v0.3
- ✓ Component inline TEMPLATES reference correct national enforcement body and law name per country — v0.3
- ✓ TLD detection extended to cover all 9 EU countries (.de, .fr, .nl, .fi, .dk, .no, .es, .se, .it) — v0.3
- ✓ 225 automated tests with zero failures — v0.3

### Active

**v0.6 Components Quality** — TBD pending requirements definition (see REQUIREMENTS.md)

### Out of Scope

- Template rendering dedup (engine vs component) — accepted architecture decision (wrong dependency direction)
- Performance fixes (vDOM removal, browser reuse for PDF) — not a stability issue
- Native speaker validation of non-English translations — requires external review
- Engine JSON template section[5] missing `title` (produces `## undefined` in Markdown) — cosmetic, future fix
- Italian (it) locale template — deferred to LOC-01 milestone
- `--sector` CLI flag for EAA mode — data ready in standards; CLI integration deferred

## Context

- Monorepo: `packages/standards` -> `packages/components` -> `packages/engine` (strict dependency order)
- Build: tsup 8.5.1 (CJS + ESM + DTS), TypeScript 5.7.2 strict mode
- Test framework: Vitest 4.0.16, @testing-library/react 16.3.2
- Current test coverage: 225 tests across 3 test files (standards: 26, engine: 95, components: 104)
- Zero `as any` in production source files (3 occurrences in test files only, documented)
- `EnrichedReport extends RegulatoryReport` with typed `failingNodes` and `legalContext`
- Build-time `__ENGINE_VERSION__` injected via tsup `define` from `package.json`
- `AccessibilityStatement` has 12 inline templates (9 EU + en-gb/en-us/en-ca) with complete placeholder substitution
- Engine has 12 JSON templates with locale-specific prose and placeholder exhaustiveness testing
- TLD detection covers 12 TLDs (.se, .no, .dk, .fi, .de, .fr, .nl, .es, .it, .uk, .us, .ca); unmapped fallback is EU
- `getEnforcementBody(country, sector?)` — sector-aware enforcement body selection (WAD default, EAA for private)
- `getNationalLawByFramework('WAD', country)` — returns NationalLaw with `.law` and `.fullName` fields
- Auto-syncing test pattern: assertions call standards functions directly, auto-update when law data changes
- ~9,142 LOC TypeScript across all packages (net +242 from v0.3)
- **Pre-publish**: Run `npm run build` in packages/components before npm publish (dist stale after v0.3 source changes)

## Constraints

- **Backwards compatibility**: Public API surface must not break existing consumers
- **Build order**: standards -> components -> engine (changes to types cascade)
- **Test suite**: All 225 tests must continue passing
- **Pre-publish**: Run `npm run build` in packages/components before npm publish

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
| Keep `ENFORCEMENT_BODIES` as `Record<Country, string>` for backwards compatibility | Existing callers unaffected; new `ENFORCEMENT_BODIES_DETAILED` for dual WAD/EAA | ✓ Good |
| Default country fallback changed from SE to EU | Unmapped TLDs are international context, not Swedish | ✓ Good |
| `getEnforcementBody(country, sector)` replaces direct map lookup | Sector-aware; EAA data ready for when private-sector clients arrive | ✓ Good |
| Auto-syncing test pattern for enforcement body/law expectations | Tests call standards functions directly — never need manual updates when law data changes | ✓ Good |
| IT (Italian) country added to Country type but template deferred | IT falls back to English; Italian locale work is its own milestone scope | ✓ Good |

## Current Milestone: v0.6 Components Quality

**Goal:** Lift `@holmdigital/components` from "ships and renders" to "production-grade prescriptive UI library" — resolve the styling-strategy ambiguity (Tailwind vs inline-style), close test coverage gaps on the most critical untested components, and remove stale data-hygiene defaults that leak into customer output.

**Target features:**
- Styling strategy resolution (Tailwind components → inline-style OR documented hard peer dep)
- Test coverage for top-priority untested components (Button, FormField, Modal, Checkbox, RadioGroup at minimum)
- AccessibilityStatement publishDate fallback fix (`'2024-01-01'` → empty + `[YOUR PUBLISH DATE]` placeholder, 14 locales)
- Component pre-publish hygiene (gate dist-rebuild requirement)

**Out of scope (deliberately):**
- AccessibilityStatement refactor — 131 tests cover it, low ROI
- Engine and Standards work — separate packages, future milestones
- Storybook — dev-only, blocked on upstream esbuild patch
- New component additions

**Phase numbering:** continues from v0.5 (last phase = 21) → v0.6 starts at Phase 22

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-10 — v0.6 Components Quality milestone started*
