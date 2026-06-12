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

## Current Milestone: v0.7 APG Completion (In Progress)

**Started:** 2026-05-11
**Phases:** 27-33 (7 phases planned)
**Theme:** Finish the source-side APG implementation work that Phase 24 pinned with tests. v0.6 pinned the contracts; v0.7 ships them.

**Target features:**
- APG keyboard handlers: DatePicker dialog-grid (TC-10-IMPL), MultiSelect listbox-multi (TC-11-IMPL), DataTable grid cell-nav (TC-12-IMPL), NavigationMenu Disclosure→Menubar (TC-14-IMPL)
- Live-region announcements for Combobox/DatePicker/MultiSelect (TC-09-LIVE, TC-10-LIVE, TC-11-LIVE)
- Tier 1+2 test coverage for 8 remaining components: Card, Skeleton, Heading, ProgressBar, Pagination, SkipLink, Switch, Tooltip (TC-15)
- Lint + typecheck added to `verify` chain in all 3 packages (PUB-09)

**Out of scope (deliberately):**
- STY-07 inline-style consistency audit for 26 components (v0.8)
- WCAG 2.2 audit (paired with PUB-07 real-browser axe in a future milestone)
- PUB-07 real-browser axe (deferred)
- PUB-08 visual regression (still blocked on Storybook esbuild upstream)
- Engine redesign (v2.0 major, separate DRAFT)
- AccessibilityStatement refactor (v0.6 STMT guards cover the risk)

**Phase numbering:** continues from v0.6 (last phase = 26) → v0.7 starts at Phase 27

## Last Shipped Milestone: v0.6 Components Quality (2026-05-11) — Phases 22-26 across 25 plans

**Achievements:**
- Reusable test infrastructure: `@chialab/vitest-axe` + `@testing-library/user-event` + 7 jsdom polyfills + 3 helpers (`expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`) + `TESTING-CONVENTIONS.md` codifying Tier 1/2/3 grammar
- 7 → 28 test files (165 → 453 tests). 19 components covered (was 1).
- WAI-ARIA APG keyboard contracts pinned for Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu (Disclosure pattern) — 4 widgets partial-stub per RadioGroup pattern with v0.7 implementation backlog
- Tabs, Accordion, Breadcrumbs migrated from Tailwind utility classes to inline-style + co-located `.css` file pattern (CSS custom properties for theming; `:focus-visible` preserved per WCAG 2.4.7)
- 3 CI guards landed: `test:wcag-headers` (Phase 22), `check-no-tailwind-leak` (Phase 23 — scoped to 3 migrated dirs), `check-no-test-leak` (Phase 26)
- AccessibilityStatement `'2024-01-01'` publishDate fallback replaced with `[YOUR PUBLISH DATE]` placeholder across 13 locale slots; 2 regression guards added
- 3 packages now gated by unified `verify` pipeline (publint --strict + attw --pack . + build + tests) via `prepublishOnly`; subpath `require` closed (29 components); committed `dist/` drift eliminated
- `lucide-react` moved from hard dependency to optional peerDep with text-glyph fallbacks in 4 consumer components (Checkbox, HelpText, Select, Toast)
- LiveRegion TS2503 (deferred since Phase 22-01) resolved in Phase 26-01 — DTS build now succeeds end-to-end

**Phase numbering:** continues from v0.6 (last phase = 26) → v0.7 starts at Phase 27.

See `.planning/milestones/v0.6-ROADMAP.md` and `.planning/milestones/v0.6-REQUIREMENTS.md` for full archived details.

## Next Milestone Goals

**v0.7 backlog (12 items inherited from v0.6 deferrals):**
- TC-09-LIVE, TC-10-LIVE, TC-11-LIVE — live-region announcements for Combobox/DatePicker/MultiSelect
- TC-10-IMPL — DatePicker APG dialog-grid keyboard handler (`role="grid"` + Arrow/Home/End/PageUp/PageDown/Shift variants)
- TC-11-IMPL — MultiSelect APG listbox-multi completeness (`aria-multiselectable`, Space-toggle, Shift+Arrow, dynamic `aria-selected`)
- TC-12-IMPL — DataTable APG grid cell-wise keyboard handler
- TC-14-IMPL — NavigationMenu APG Menubar upgrade (currently APG Disclosure pattern)
- TC-15 — test coverage for remaining 8 components (Card, Skeleton, Heading, ProgressBar, Pagination, SkipLink, Switch, Tooltip)
- STY-07 — inline-style consistency audit for the other 26 components
- PUB-07 — real-browser axe-core run for layout-dependent rules
- PUB-08 — automated visual regression (blocked on Storybook esbuild upstream patch)
- Tooling: investigate `npm publish --dry-run` + attw stdio quirk surfaced in Phase 26-05

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

## SSR Consumer Audit (Phase 22 / TI-06)

**Audit date:** 2026-05-10

**Command run:**

```bash
grep -rn -E "renderToStaticMarkup|renderToString|renderToPipeableStream|renderToReadableStream" packages/ apps/ \
  --include="*.ts" --include="*.tsx" --include="*.mts" --include="*.cts" --include="*.js" --include="*.mjs"
```

**Matches (source files only; `dist/` build artefacts excluded):**

- `packages/engine/src/reporting/statement-generator.ts:2` — `import { renderToStaticMarkup } from 'react-dom/server';`
- `packages/engine/src/reporting/statement-generator.ts:218` — `const markup = renderToStaticMarkup(element);`

No matches outside `packages/engine/src/`. No occurrences of `renderToString`, `renderToPipeableStream`, or `renderToReadableStream` anywhere in the repo.

**Note on plan reference:** The plan's frontmatter cited `packages/engine/src/reporting/html-template.ts` as the known SSR consumer. The actual consumer is `statement-generator.ts` (which calls `renderToStaticMarkup` to materialise the `AccessibilityStatement` React component into HTML). `html-template.ts` builds report HTML via template-literal string concatenation, not React SSR. The conclusion (engine package is the sole SSR consumer of `@holmdigital/components`) is unchanged.

**Conclusion:** The engine package (`packages/engine/src/reporting/statement-generator.ts`) is the **only** SSR consumer of `@holmdigital/components`. No application or other package renders components via `react-dom/server`.

**Implication for Phase 23 styling unification:** This finding **confirms** the styling-strategy assumption (CONTEXT D-Styling). A CSS-file-per-component side-effect import (`import './Button.css'`) is SSR-safe in this codebase: the only SSR path is engine's `renderToStaticMarkup` call, which executes inside a Node process where bundler resolution of CSS side-effect imports is handled at engine build time, not at SSR time. Phase 23 may proceed with the file-per-component CSS strategy without further audit.

## Current State

Phase 30 gap closure complete (2026-06-12) — DataTable APG grid single-tab-stop contract restored (TC-12-IMPL validated): plan 30-02 added `tabIndex={-1}` to the inner sort button (UAT Test 1, severity major, root cause was a wrong D-02/D-05 spec — superseded with dated notes), added `userEvent.tab()` regression coverage (the suite's structural blind spot), and shipped components 2.7.3 (patch). Verification passed 9/9; UAT and debug session resolved. 30-REVIEW.md carries 2 Critical + 4 Warning advisory findings in the pre-existing 30-01 grid layer (interactive cell-content hijack, stale roving anchor on data shrink) — candidates for a follow-up fix pass.

Phase 34 complete (2026-06-12) — opt-in klarspråk plain-language report shipped: `hd-a11y-scan <url> --plain` renders a business-first report for non-technical recipients in terminal and PDF (wiki-branded, embedded logo, fixed per-page footer). PlainLanguageCopy data lives in @holmdigital/standards (10 rules, sv+en, sector-neutral tone), flows through generateRegulatoryReport with EN fallback, zero engine enrichment changes. Developer report byte-unchanged (D-13 snapshot, now TZ-independent per CR-01 fix). D-09 editorial gate approved by Daniel after 4 review rounds. Last phase of the roadmap — milestone ready for audit/completion. Pending: 2 minor changesets (standards 2.7.0, engine 2.6.0) for the next Version Packages PR; 6 advisory review warnings in 34-REVIEW.md (WR-01..06).

---
*Last updated: 2026-06-12 — Phase 30 gap closure complete (DataTable single Tab stop, components 2.7.3)*
