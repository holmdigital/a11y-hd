# Requirements: a11y-hd

**Defined:** 2026-03-27
**Core Value:** The type system and tests must catch bugs before users do -- no `as any` escape hatches in core paths, no silent wrong behavior.

## v0.5 Requirements

Requirements for v0.5 Australia Jurisdiction. Each maps to roadmap phases.

### Standards

- [x] **STD-01**: `LegalFramework` type extended with `'DDA'` as third value alongside `'WAD'` and `'EAA'`
- [x] **STD-02**: `Country` type extended with `'AU'` — triggers compile-time completeness across all `Record<Country, ...>` maps
- [x] **STD-03**: `national-laws.json` has `au-dda` entry (scope: both, enforcer: AHRC) and `au-dta` entry (scope: public, enforcer: DTA)
- [x] **STD-04**: `ENFORCEMENT_BODIES['AU']` and `ENFORCEMENT_BODIES_DETAILED['AU']` both route to AHRC for WAD and EAA keys

### Engine

- [x] **ENG-01**: `en-au.json` statement template with DDA-specific prose, voluntary framing, and AHRC complaint pathway
- [x] **ENG-02**: `TLD_MAP` includes `'au': 'AU'` — detects .au, .com.au, .gov.au domains
- [x] **ENG-03**: Engine locale maps (evaluationMethod, statusMap, locale routing) include `en-au` entries

### Components

- [x] **CMP-01**: `TEMPLATES['en-au']` inline template in AccessibilityStatement with AU-specific legislation references
- [x] **CMP-02**: locale-chrome.ts includes en-au entries for BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT

### Testing

- [x] **TST-01**: AU enforcement body and national law assertions using auto-syncing test pattern
- [x] **TST-02**: en-au engine template placeholder exhaustiveness tests
- [x] **TST-03**: en-au component template rendering and locale routing tests

## Future Requirements

Deferred to future milestones.

### AU Enhancements
- **AU-01**: DTA Digital Experience Policy annotation for `.gov.au` domains
- **AU-02**: AS EN 301 549 procurement reference for state government clients
- **AU-03**: AHRC complaint pathway URL in statement contact section

### EAA Template Prose
- **EAA-04**: EAA-specific intro prose variants (private sector obligation framing differs from WAD)

### New Locales
- **LOC-04**: Irish (ie) locale template
- **LOC-05**: Romanian (ro) locale
- **LOC-06**: Hungarian (hu) locale
- **LOC-07**: Czech (cs) locale

### SaaS Features
- **SAAS-01**: Hosted statement page with scheduled rescanning
- **SAAS-02**: CI/CD integration (GitHub Action)
- **SAAS-03**: Multi-site monitoring dashboard

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| State/territory-level AU policy annotations | No state-specific TLDs; requires explicit metadata beyond TLD detection |
| Mobile app compliance notes for AU | AHRC 2025 scope expansion; requires architecture outside web scanning |
| WCAG 2.2 vs 2.1 delta highlighting | Complexity not justified for v0.5 |
| Native speaker validation of en-au prose | Requires external review |
| Penalty amounts in AU statements | DDA enforcement is complaint/court-driven with no fixed fine cap |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STD-01 | Phase 18 | Complete |
| STD-02 | Phase 18 | Complete |
| STD-03 | Phase 18 | Complete |
| STD-04 | Phase 18 | Complete |
| ENG-01 | Phase 20 | Complete |
| ENG-02 | Phase 20 | Complete |
| ENG-03 | Phase 20 | Complete |
| CMP-01 | Phase 19 | Complete |
| CMP-02 | Phase 19 | Complete |
| TST-01 | Phase 21 | Complete |
| TST-02 | Phase 21 | Complete |
| TST-03 | Phase 21 | Complete |

**Coverage:**
- v0.5 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---

## v0.6 Requirements

Requirements for v0.6 Components Quality. Each maps to roadmap phases (22–26). Locked decisions embedded:
- **Styling pattern:** CSS-file-per-component (side-effect import, SSR-safe, preserves `:focus-visible`)
- **Theming:** CSS custom properties (`--hd-button-bg` etc.) with inline fallbacks
- **Dist policy:** Stop committing `packages/*/dist/`; build only in CI for publish
- **lucide-react:** Move to optional `peerDependencies` with text-glyph fallbacks
- **Anti-patterns enforced:** No DOM snapshots, no class-selector queries, no internal-state probing, no `data-testid` on library components, no `fireEvent.click` without paired keyboard test, no coverage-percent chasing

### Test Infrastructure

- [x] **TI-01**: `@chialab/vitest-axe`, `@testing-library/user-event`, `@testing-library/jest-dom`, `eslint-plugin-testing-library` added as devDependencies in `@holmdigital/components`
- [x] **TI-02**: `_test/setup.ts` polyfills jsdom gaps (IntersectionObserver, ResizeObserver, matchMedia, `offsetParent`, `HTMLDialogElement.showModal`, `Element.animate`, `scrollIntoView`)
- [ ] **TI-03**: `_test/axe.ts` centralises axe-core configuration with documented disables for jsdom-incompatible rules (`color-contrast`, `region`, `landmark-*`, `bypass`, `meta-viewport`, `document-title`, `html-has-lang`)
- [ ] **TI-04**: Three reusable test helpers extracted: `expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`
- [ ] **TI-05**: `TESTING-CONVENTIONS.md` documents the test grammar (Tier 1 / Tier 2 / Tier 3 / WCAG-SC traceability convention at top of each test file)
- [ ] **TI-06**: SSR consumer audit — grep across all packages for `renderToStaticMarkup` / `renderToString` / `renderToPipeableStream` to confirm engine is the only SSR consumer; documented in PROJECT.md

### Test Coverage — Priority 7

- [ ] **TC-01**: `useFocusTrap.test.tsx` covers 5 scenarios (multiple focusables, `initialFocusRef`, Tab cycle, focus restore on unmount, no-focusables container) — must land BEFORE Modal tests
- [ ] **TC-02**: Button test suite — Tier 1 + Tier 2 (loading state ARIA, disabled state, variants render, ref forwarding, axe-clean, keyboard activation)
- [ ] **TC-03**: FormField test suite — label association, error/help text via `aria-describedby`, required state, axe-clean, ID uniqueness across multiple instances
- [ ] **TC-04**: Modal test suite — focus trap engages on open and restores on close, Escape closes, click-outside behaviour, ARIA attributes, axe-clean
- [x] **TC-05**: Checkbox test suite — controlled/uncontrolled, `onCheckedChange`, indeterminate, keyboard (Space), label association, axe-clean (completed 2026-05-10, Plan 22-06, 14 it() blocks)
- [x] **TC-06**: RadioGroup test suite — controlled/uncontrolled, click+Space onChange, name attr, label-via-aria-labelledby, axe-clean; arrow-key tests assert no-throw (RadioGroup.tsx has no roving-tabindex JS — relies on native HTML radio semantics; see 22-06-SUMMARY.md for downstream-impact note for Tabs / Phase 24) (completed 2026-05-10, Plan 22-06, 15 it() blocks)
- [ ] **TC-07**: ErrorSummary test suite — focusable headings, links resolve to fields, live-region announcement on update, axe-clean (regression-prevents the WCAG 3.3.1 failure the component exists to prevent)
- [ ] **TC-08**: Tabs test suite — automatic vs manual activation modes, Arrow keys cycle, Home/End jump, ARIA `aria-selected`/`aria-controls`/`aria-labelledby`, axe-clean (establishes APG roving-tabindex test template for Phase C)

### Test Coverage — Complex APG Widgets

- [ ] **TC-09**: Combobox test suite — APG combobox pattern (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`), Arrow/Enter/Escape/type-ahead, live-region for results count, axe-clean
- [ ] **TC-10**: DatePicker test suite — APG dialog grid pattern, keyboard date navigation, Escape closes, selected-date live-region announcement, axe-clean
- [ ] **TC-11**: MultiSelect test suite — multi-selection state, Arrow/Space/Enter, removable chips with keyboard, live-region for count, axe-clean
- [ ] **TC-12**: DataTable test suite — APG grid pattern (Arrow keys cell navigation, Home/End row, PageUp/PageDown), sortable column ARIA, axe-clean
- [ ] **TC-13**: TreeView test suite — APG tree pattern (Arrow keys expand/collapse/navigate, Asterisk expands all siblings, type-ahead), axe-clean
- [ ] **TC-14**: NavigationMenu test suite — APG menubar pattern (Arrow keys, Home/End, Enter activates, Escape closes submenu), axe-clean

### Styling Migration

- [ ] **STY-01**: `Tabs`, `Accordion`, `Breadcrumbs` migrated from Tailwind utility classes to inline-style + co-located CSS file pattern
- [ ] **STY-02**: Each migrated component ships its own `.css` file as side-effect import; tsup CSS pipeline configured
- [ ] **STY-03**: CSS custom properties define theming surface (`--hd-tabs-active-color`, `--hd-accordion-border` etc.) with inline fallbacks
- [ ] **STY-04**: `:focus-visible` styling preserved (no JS-event-handler workarounds — would break WCAG 2.4.7)
- [ ] **STY-05**: Regression-guard test in `src/index.test.ts` greps `dist/**/*.{js,mjs}` for Tailwind utility patterns inside `className=` and fails build if any leak
- [ ] **STY-06**: Migrated components retain `className` as passthrough only; layout/visual classes removed

### AccessibilityStatement Hygiene

- [ ] **STMT-01**: All 14 locale `'2024-01-01'` `publishDate` fallbacks replaced with empty string + `[YOUR PUBLISH DATE]` placeholder pattern in `AccessibilityStatement.tsx`
- [ ] **STMT-02**: Regression-guard test asserts no literal `2024-01-01` appears anywhere in component source
- [ ] **STMT-03**: Regression-guard test asserts `country='US'` never produces empty `{<national_law>}` placeholder (covers the live US bug already fixed in commit 859f301)

### Publish Hygiene

- [ ] **PUB-01**: `publint --strict` and `attw --pack .` run as part of `verify` script in all three packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`)
- [ ] **PUB-02**: `prepublishOnly` script gates `npm publish` behind `verify` — build, lint, type-check, tests, publint, attw must all pass
- [ ] **PUB-03**: `packages/*/dist/` added to `.gitignore`; CI builds and publishes from a clean dist; `standards/dist/` drift in current `git status` resolved
- [ ] **PUB-04**: Subpath exports `require` field gap closed — either add `require` to all 29 component subpaths OR document and configure as ESM-only (whichever publint accepts)
- [ ] **PUB-05**: tsup entry replaced with glob exclusion (`src/index.ts`, `src/*/!(*.test|*.stories).{ts,tsx}`); CI guard greps `dist/**` for `vitest`, `@testing-library`, `describe(`, `it(` and fails if any test code leaks
- [ ] **PUB-06**: lucide-react moved from `dependencies` to optional `peerDependencies` with text-glyph fallbacks (`▾`, `⚠`, `ℹ`) when not installed; documented in README

## Future Requirements (added in v0.6 planning)

- **TC-15**: Card, Skeleton, HelpText, Heading, ProgressBar, Pagination, SkipLink, Switch, Accordion test coverage (deferred to v0.7+ — failure modes are visible rather than silent)
- **STY-07**: Audit remaining 26 components for inline-style consistency (variant/state object pattern)
- **PUB-07**: Real-browser axe-core run for layout-dependent rules (deferred to v0.7+)
- **PUB-08**: Automated visual regression (Chromatic / Playwright Component Testing) — blocked on Storybook esbuild upstream patch

## Out of Scope (v0.6)

| Feature | Reason |
|---|---|
| AccessibilityStatement refactor (1018 lines) | 131 existing tests cover prose; refactor is high-risk, low-ROI; STMT-02/03 add regression guards |
| Engine package work | Separate package, future milestone |
| Standards package work | Separate package, future milestone |
| Storybook upgrade | Blocked on upstream esbuild patch |
| New component additions | Quality-on-existing milestone, not surface expansion |
| CSS-in-JS runtime libraries (vanilla-extract, panda) | Disproportionate tooling burden for 29 components |
| shadcn-style copy-paste registry | Wrong distribution model for versioned compliance library |
| Hard Tailwind peer dep | Setup-cost vs benefit ratio wrong for non-frontend-shop consumers |
| Real-browser test runner | Defer to v0.7+ — jsdom + centralised axe disables sufficient for v0.6 |
| Snapshot testing | Anti-pattern for prescriptive a11y library — encourages drift acceptance |

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TI-01 | Phase 22 (22-01) | Complete (2026-05-10) |
| TI-02 | Phase 22 (22-01) | Complete (2026-05-10) |
| TI-03 | Phase 22 | Pending |
| TI-04 | Phase 22 | Pending |
| TI-05 | Phase 22 | Pending |
| TI-06 | Phase 22 | Pending |
| TC-01 | Phase 22 | Pending |
| TC-02 | Phase 22 | Pending |
| TC-03 | Phase 22 | Pending |
| TC-04 | Phase 22 | Pending |
| TC-05 | Phase 22 | Complete (Plan 22-06, 2026-05-10) |
| TC-06 | Phase 22 | Complete (Plan 22-06, 2026-05-10) |
| TC-07 | Phase 22 | Pending |
| TC-08 | Phase 22 | Pending |
| TC-09 | Phase 24 | Pending |
| TC-10 | Phase 24 | Pending |
| TC-11 | Phase 24 | Pending |
| TC-12 | Phase 24 | Pending |
| TC-13 | Phase 24 | Pending |
| TC-14 | Phase 24 | Pending |
| STY-01 | Phase 23 | Pending |
| STY-02 | Phase 23 | Pending |
| STY-03 | Phase 23 | Pending |
| STY-04 | Phase 23 | Pending |
| STY-05 | Phase 23 | Pending |
| STY-06 | Phase 23 | Pending |
| STMT-01 | Phase 25 | Pending |
| STMT-02 | Phase 25 | Pending |
| STMT-03 | Phase 25 | Pending |
| PUB-01 | Phase 26 | Pending |
| PUB-02 | Phase 26 | Pending |
| PUB-03 | Phase 26 | Pending |
| PUB-04 | Phase 26 | Pending |
| PUB-05 | Phase 26 | Pending |
| PUB-06 | Phase 26 | Pending |

**Coverage:**
- v0.6 requirements: 32 total
- Mapped to phases: 32 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27 (v0.5)*
*Last updated: 2026-05-10 — v0.6 roadmap created, all 32 requirements mapped to Phases 22–26*
