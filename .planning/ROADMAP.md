# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- ✅ **v0.2 Full Localization** — Phases 6-10 (shipped 2026-03-05)
- ✅ **v0.3 National Compliance** — Phases 11-13 (shipped 2026-03-06)
- ✅ **v0.4 Locale Expansion + EAA Sector** — Phases 14-17 (shipped 2026-03-07)
- ✅ **v0.5 Australia Jurisdiction** — Phases 18-21 (shipped 2026-03-29)
- 🚧 **v0.6 Components Quality** — Phases 22-26 (in progress)

## Phases

<details>
<summary>✅ v0.1 Stability Pass (Phases 1-5) — SHIPPED 2026-03-03</summary>

- [x] Phase 1: Standards Types (2/2 plans) — completed 2026-03-02
- [x] Phase 2: Version Fix (2/2 plans) — completed 2026-03-03
- [x] Phase 3: Engine Casts (2/2 plans) — completed 2026-03-03
- [x] Phase 4: Locale Routing (1/1 plan) — completed 2026-03-03
- [x] Phase 5: Test Coverage (2/2 plans) — completed 2026-03-03

See: `.planning/milestones/v0.1-ROADMAP.md` for full details

</details>

<details>
<summary>✅ v0.2 Full Localization (Phases 6-10) — SHIPPED 2026-03-05</summary>

- [x] Phase 6: ESM Fix and Foundation (1/1 plan) — completed 2026-03-04
- [x] Phase 7: Engine Generator Locale Expansion (2/2 plans) — completed 2026-03-04
- [x] Phase 8: Component UI Chrome Localization (1/1 plan) — completed 2026-03-04
- [x] Phase 9: en-gb/en-us/en-ca Statement Templates (2/2 plans) — completed 2026-03-04
- [x] Phase 10: Verification and Test Coverage (2/2 plans) — completed 2026-03-05

See: `.planning/milestones/v0.2-ROADMAP.md` for full details

</details>

<details>
<summary>✅ v0.3 National Compliance (Phases 11-13) — SHIPPED 2026-03-06</summary>

- [x] Phase 11: Enforcement Body Data (1/1 plan) — completed 2026-03-06
- [x] Phase 12: Engine National Compliance (2/2 plans) — completed 2026-03-06
- [x] Phase 13: Component National Compliance (1/1 plan) — completed 2026-03-06

See: `.planning/milestones/v0.3-ROADMAP.md` for full details

</details>

<details>
<summary>✅ v0.4 Locale Expansion + EAA Sector (Phases 14-17) — SHIPPED 2026-03-07</summary>

- [x] Phase 14: Locale Standards Data (1/1 plan) — completed 2026-03-06
- [x] Phase 15: New Locale Engine Templates (1/1 plan) — completed 2026-03-07
- [x] Phase 16: New Locale Component Templates (1/1 plan) — completed 2026-03-07
- [x] Phase 17: EAA Sector Support (1/1 plan) — completed 2026-03-07

See: `.planning/milestones/v0.4-ROADMAP.md` for full details

</details>

### v0.5 Australia Jurisdiction (In Progress)

**Milestone Goal:** Add Australia as a fully supported jurisdiction across all three packages — standards (DDA + DTA), components (en-au UI chrome and inline template), engine (en-au statement template + .au TLD detection), and sector-aware enforcement routing for AU. All output for Australian clients must reference DDA 1992 and AHRC, not EU law.

- [x] **Phase 18: AU Standards Foundation** - `LegalFramework` extended to `'DDA'`, `Country` extended to `'AU'`, DDA + DTA law data, AHRC enforcement bodies (completed 2026-03-28)
- [x] **Phase 19: AU Component Locale** - `TEMPLATES['en-au']` inline template and locale-chrome entries for en-au (completed 2026-03-28)
- [x] **Phase 20: AU Engine Integration** - `en-au.json` statement template, `.au`/`.com.au` TLD detection, engine locale maps (completed 2026-03-28)
- [x] **Phase 21: AU Test Coverage** - Auto-syncing enforcement/law tests, en-au template placeholder exhaustiveness, component rendering and locale routing tests (completed 2026-03-29)

### v0.6 Components Quality (In Progress)

**Milestone Goal:** Lift `@holmdigital/components` from "ships and renders" to "production-grade prescriptive UI library" — install reusable test infrastructure and cover the highest-stakes untested components against WAI-ARIA APG contracts, unify the styling strategy so non-Tailwind consumers stop receiving silently un-styled DOM, fix stale `publishDate` defaults that leak into customer output, and add publish-hygiene gates (publint, attw, `prepublishOnly`, stop committing `dist/`) so future drift is caught at the boundary.

- [ ] **Phase 22: Test Infrastructure + First-7 Components** - jsdom shims, axe helper, three reusable test helpers, `useFocusTrap` hook tests, and Tier 1+2 suites for Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, Tabs
- [ ] **Phase 23: Styling Unification** - Migrate Tabs, Accordion, Breadcrumbs from Tailwind utility classes to inline-style + co-located CSS file pattern with CSS custom properties for theming and a regression-guard against Tailwind class leakage in `dist/`
- [ ] **Phase 24: Complex APG Widget Test Coverage** - Tier 3 APG suites for Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu using helpers from Phase 22
- [ ] **Phase 25: AccessibilityStatement publishDate Fix + Regression Guards** - All 14 locale `'2024-01-01'` defaults replaced with empty + `[YOUR PUBLISH DATE]` placeholder; regression-guards lock the date fix and the US national-law placeholder bug
- [ ] **Phase 26: Publish Hygiene** - `publint`, `attw`, `prepublishOnly`, stop committing `packages/*/dist/`, close subpath `require` gap, ship-no-test-code CI guard, lucide-react moved to optional peer dep with text-glyph fallbacks

## Phase Details

### Phase 18: AU Standards Foundation
**Goal**: The standards package contains all AU type entries and data required for downstream packages to compile — `'DDA'` in `LegalFramework`, `'AU'` in `Country`, DDA and DTA law records in `national-laws.json`, and AHRC in both enforcement body maps — committed atomically so the TypeScript build never breaks mid-update.
**Depends on**: Phase 17 (v0.4 complete)
**Requirements**: STD-01, STD-02, STD-03, STD-04
**Success Criteria** (what must be TRUE):
  1. `LegalFramework` type includes `'DDA'` as a valid value alongside `'WAD'` and `'EAA'`
  2. `Country` type includes `'AU'` and the build fails if any `Record<Country, ...>` map is missing the `'AU'` key
  3. `national-laws.json` has an `au-dda` entry (scope both, enforcer AHRC) and an `au-dta` entry (scope public, enforcer DTA)
  4. `ENFORCEMENT_BODIES['AU']` and `ENFORCEMENT_BODIES_DETAILED['AU']` are present with both `wad` and `eaa` fields pointing to AHRC
  5. `getEnforcementBody('AU', 'private')` returns AHRC (not DTA) — DDA applies to both sectors under one body
**Plans**: 1 plan
Plans:
- [x] 18-01-PLAN.md — Extend types, add AU enforcement bodies, national law entries, and tests

### Phase 19: AU Component Locale
**Goal**: The `AccessibilityStatement` React component renders a legally accurate Australian statement for `locale="en-au"` — referencing DDA 1992 and AHRC, using complaint-based enforcement framing (not mandatory statement framing), and displaying correct AU-specific badge labels and footer text.
**Depends on**: Phase 18
**Requirements**: CMP-01, CMP-02
**Success Criteria** (what must be TRUE):
  1. `TEMPLATES['en-au']` exists in `AccessibilityStatement.tsx` and references DDA legislation and AHRC (no EU Web Accessibility Directive references)
  2. `locale-chrome.ts` contains `en-au` entries for `BADGE_LABELS`, `UPDATED_LABEL`, and `FOOTER_TEXT`
  3. Rendering `<AccessibilityStatement locale="en-au" />` produces HTML with DDA and AHRC text and zero placeholder leakage (`{<` must not appear in output)
**Plans**: 1 plan
Plans:
- [x] 19-01-PLAN.md — Add en-au template, locale routing, national_law DDA fallback, locale-chrome entries, and tests

### Phase 20: AU Engine Integration
**Goal**: The engine automatically detects Australian domains via `.au` and `.com.au` TLD matching, routes them to the `en-au` locale, and generates a legally accurate accessibility statement referencing DDA 1992, AHRC, and WCAG 2.2 AA — with correct evaluationMethod and statusMap entries for the en-au locale.
**Depends on**: Phase 19
**Requirements**: ENG-01, ENG-02, ENG-03
**Success Criteria** (what must be TRUE):
  1. `TLD_MAP` maps `'au'` to `'AU'` and the existing `hostname.split('.').pop()` parser correctly routes `.au`, `.com.au`, and `.gov.au` domains to country `AU`
  2. `en-au.json` statement template exists in `packages/engine/src/reporting/templates/` with DDA-specific prose, voluntary framing, and AHRC complaint pathway — no "disproportionate burden" or mandatory statement language from EU/UK templates
  3. Engine locale maps (`evaluationMethod`, `statusMap`, locale routing) include `en-au` entries
  4. The risk-level display label for `en-au` reads "Risk level" (not "DIGG Risk") in CLI output
**Plans**: 1 plan
Plans:
- [x] 20-01-PLAN.md — Create en-au.json template, wire TLD detection, locale maps, DDA substitution, and i18n routing

### Phase 21: AU Test Coverage
**Goal**: The test suite verifies all AU additions end-to-end — enforcement body routing, national law retrieval, TLD detection, statement template placeholder exhaustiveness, and component rendering — using the auto-syncing pattern so tests call standards functions directly and do not hardcode law or enforcement body names.
**Depends on**: Phase 20
**Requirements**: TST-01, TST-02, TST-03
**Success Criteria** (what must be TRUE):
  1. Tests assert `getEnforcementBody('AU')` and `getEnforcementBody('AU', 'private')` both return AHRC using the auto-syncing pattern (no hardcoded strings)
  2. Tests assert `getNationalLawByFramework('DDA', 'AU')` returns a non-null result with correct `.law` and `.fullName` fields
  3. en-au engine template placeholder exhaustiveness tests confirm every `{<placeholder>}` is substituted and no placeholder leakage occurs in generated output
  4. Component tests confirm `<AccessibilityStatement locale="en-au" />` renders AU-specific content and all 225 pre-existing tests continue to pass
**Plans**: 1 plan
Plans:
- [ ] 21-01-PLAN.md — Close 7 auto-sync and coverage gaps across standards, engine, and component test files + full regression

### Phase 22: Test Infrastructure + First-7 Components
**Goal**: A reusable, opinionated test scaffold lands in `@holmdigital/components` — devDeps installed, jsdom shims polyfill the seven known gaps, axe-core is centrally configured with documented disables, and three named helpers (`expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`) are available — and the seven highest-stakes untested components plus the `useFocusTrap` hook are covered to Tier 1 + Tier 2 with WAI-ARIA APG keyboard contracts asserted.
**Depends on**: Phase 21 (v0.5 complete)
**Requirements**: TI-01, TI-02, TI-03, TI-04, TI-05, TI-06, TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07, TC-08
**Success Criteria** (what must be TRUE):
  1. `@chialab/vitest-axe`, `@testing-library/user-event`, `@testing-library/jest-dom`, and `eslint-plugin-testing-library` are installed as devDependencies in `packages/components/package.json` and `_test/setup.ts` polyfills `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `offsetParent`, `HTMLDialogElement.showModal`, `Element.animate`, and `scrollIntoView`
  2. `_test/axe.ts` exposes a single `expectNoAxeViolations` helper with documented disables for `color-contrast`, `region`, `landmark-*`, `bypass`, `meta-viewport`, `document-title`, and `html-has-lang` — no per-test `configureAxe` call is required or permitted, and `_test/helpers.ts` (or equivalent) exports `expectUniqueIds` and `expectKeyboardSequence`
  3. `useFocusTrap.test.tsx` lands BEFORE any Modal test and covers all five required scenarios (multiple focusables, `initialFocusRef`, Tab cycle, focus restore on unmount, no-focusables container) — green under jsdom with the `offsetParent` shim
  4. Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, and Tabs each have a `.test.tsx` next to the component asserting Tier 1 (mount, ref, className, props, disabled) AND Tier 2 (axe-clean via the shared helper, ARIA roles/states, ID uniqueness across two mounts, full APG keyboard matrix, focus management) — every test file declares its WCAG SC coverage in a top-of-file comment
  5. `TESTING-CONVENTIONS.md` exists in `packages/components/` codifying Tier 1 / Tier 2 / Tier 3 grammar and the anti-pattern list (no DOM snapshots, no class selectors, no internal-state probing, no `data-testid` on library components, no `fireEvent.click` without paired keyboard test); SSR consumer audit (`renderToStaticMarkup` / `renderToString` / `renderToPipeableStream` grep across all packages) confirms engine is the only SSR consumer and the result is recorded in `PROJECT.md`
**Plans**: 9 plans
Plans:
- [x] 22-01-PLAN.md — TI-01 + TI-02: install devDeps, create vitest config, _test/setup.ts with 7 jsdom polyfills (completed 2026-05-10, see 22-01-SUMMARY.md)
- [ ] 22-02-PLAN.md — TI-03 + TI-04: _test/axe.ts (11 disables) + 3 helpers + helper meta-tests with failure-mode (D-04)
- [ ] 22-03-PLAN.md — TI-05 + TI-06: TESTING-CONVENTIONS.md, WCAG-SC header CI grep guard, SSR consumer audit recorded in PROJECT.md
- [ ] 22-04-PLAN.md — TC-01: useFocusTrap.test.tsx, 5 APG scenarios (closes PR #1)
- [ ] 22-05-PLAN.md — TC-02: Button Tier 1+2 suite (template-setter for Wave 2)
- [ ] 22-06-PLAN.md — TC-05 + TC-06: Checkbox + RadioGroup (form primitives, roving-tabindex template)
- [ ] 22-07-PLAN.md — TC-03: FormField (label/aria-describedby composition)
- [x] 22-08-PLAN.md — TC-04: Modal + Dialog.test.tsx polyfill cleanup (depends on TC-01) — Complete 2026-05-10
- [ ] 22-09-PLAN.md — TC-07 + TC-08: ErrorSummary (live-region template) + Tabs (APG roving + automatic/manual activation, closes PR #2)

### Phase 23: Styling Unification
**Goal**: The three Tailwind-utility-class components (`Tabs`, `Accordion`, `Breadcrumbs`) ship correct, themable, focus-visible-preserving output to consumers regardless of whether Tailwind is installed — by migrating to inline-style + a co-located `.css` file imported as a side-effect, with theming exposed via CSS custom properties — and a build-time regression guard prevents any future Tailwind utility from leaking back into `dist/`.
**Depends on**: Phase 21 (independent of Phase 22)
**Requirements**: STY-01, STY-02, STY-03, STY-04, STY-05, STY-06
**Success Criteria** (what must be TRUE):
  1. `packages/components/src/Tabs/Tabs.tsx`, `Accordion/Accordion.tsx`, and `Breadcrumbs/Breadcrumbs.tsx` contain zero Tailwind utility class strings inside `className=` and each ships a co-located `Tabs.css` / `Accordion.css` / `Breadcrumbs.css` imported as a side-effect from the component file (tsup CSS pipeline emits these to `dist/`)
  2. Each migrated component exposes its theming surface via CSS custom properties (e.g. `--hd-tabs-active-color`, `--hd-accordion-border`, `--hd-breadcrumbs-separator-color`) with inline-style fallbacks so the component still renders correctly when no consumer override is provided
  3. `:focus-visible` styling is preserved via the co-located `.css` file (NOT via JS `onFocus`/`onBlur` event handlers — that approach is rejected because it cannot distinguish keyboard from mouse focus and would break WCAG 2.4.7) and a smoke test in each component's test file asserts the focus-visible style hook is present
  4. A regression-guard test in `src/index.test.ts` (or equivalent) greps `dist/**/*.{js,mjs}` for Tailwind utility patterns (`\b(flex|text-slate|bg-white|hover:|focus:|focus-visible:|ring-)\b` inside `className=`) and fails the build if any leak through
  5. `className` on each migrated component remains a passthrough only — all visual/layout class strings are removed; consumer-supplied `className` and `style` merge with inline defaults so theming overrides work
**Plans**: TBD
**UI hint**: yes

### Phase 24: Complex APG Widget Test Coverage
**Goal**: The six complex APG-pattern widgets (Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu) are covered against the W3C WAI-ARIA Authoring Practices Guide keyboard and ARIA contracts — using the helpers and conventions established in Phase 22 — with mandatory live-region tests where the pattern requires announcements.
**Depends on**: Phase 22 (uses `expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`, the jsdom shims, and the conventions doc)
**Requirements**: TC-09, TC-10, TC-11, TC-12, TC-13, TC-14
**Success Criteria** (what must be TRUE):
  1. `Combobox.test.tsx` asserts the APG combobox-with-listbox-popup contract: `role="combobox"` on the input, `aria-expanded` flips on open/close, `aria-controls` resolves to the listbox id, `aria-activedescendant` tracks the visually-focused option, full keyboard matrix (Down/Up/Home/End/Enter/Escape/type-ahead/Alt+Down/Alt+Up), live-region announces results count, axe-clean
  2. `DatePicker.test.tsx` asserts the APG dialog-grid contract: calendar uses `role="grid"` with month-heading `aria-labelledby`, day cells are `gridcell` with `aria-selected` and `aria-current="date"`, keyboard navigation covers Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown, Escape closes without selecting, selected-date is announced via live region, axe-clean
  3. `MultiSelect.test.tsx` asserts `role="listbox"` with `aria-multiselectable="true"`, options carry `aria-selected` (NOT `aria-checked`), Space toggles without moving focus, Shift+Arrow extends selection, removable chips are keyboard-operable, selection count announced via live region, axe-clean
  4. `DataTable.test.tsx` asserts the APG grid contract: cell-wise Arrow navigation, Home/End for row, PageUp/PageDown for paging, sortable columns expose `aria-sort` that toggles via Enter/Space, headers carry `scope="col"`/`scope="row"`, axe-clean
  5. `TreeView.test.tsx` and `NavigationMenu.test.tsx` assert the APG tree pattern (Arrow expand/collapse/navigate, Asterisk expands sibling group, type-ahead, single `tabindex="0"` roving) and APG menubar pattern (Arrow horizontal/vertical, Home/End, Enter activates, Escape closes submenu) respectively, both axe-clean
**Plans**: TBD

### Phase 25: AccessibilityStatement publishDate Fix + Regression Guards
**Goal**: The `AccessibilityStatement` component stops shipping the misleading `'2024-01-01'` `publishDate` fallback to consumers in any of its 14 locales — instead emitting an empty string + `[YOUR PUBLISH DATE]` placeholder pattern that makes the missing-data state obvious — and two regression-guard tests pin the fix and the US national-law placeholder bug already fixed in commit 859f301 so neither can silently re-occur.
**Depends on**: Phase 21 (independent of Phases 22/23/24; component source change is local and the 131 existing tests cover the prose surface)
**Requirements**: STMT-01, STMT-02, STMT-03
**Success Criteria** (what must be TRUE):
  1. All 14 locale entries in `AccessibilityStatement.tsx` (every `TEMPLATES[locale]` and every code path that supplies a default `publishDate`) use empty string + `[YOUR PUBLISH DATE]` placeholder instead of `'2024-01-01'` — no literal `2024-01-01` string remains anywhere in component source
  2. A regression-guard test asserts no literal `2024-01-01` appears anywhere in `packages/components/src/**/*.{ts,tsx}` — a simple file-content grep that fails the build if the fallback ever re-appears
  3. A regression-guard test renders `<AccessibilityStatement country="US" />` and asserts the rendered output contains zero literal `{<national_law>}` placeholder strings — covering the live US bug already fixed in commit 859f301 so it cannot silently regress
**Plans**: TBD

### Phase 26: Publish Hygiene
**Goal**: All three packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) gate `npm publish` behind a single `verify` pipeline — `publint --strict` + `attw --pack .` + build + tests + type-check — committed `dist/` directories are eliminated as a drift source, the subpath `require` export gap that publint flags is closed, no test code can leak into `dist/`, and `lucide-react` moves out of hard runtime dependencies into an optional peer dep with text-glyph fallbacks so consumers without it still get correct, accessible output.
**Depends on**: Phases 22, 23, 24, 25 (runs last so all earlier work passes the new `verify` gate)
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
**Success Criteria** (what must be TRUE):
  1. `package.json` in all three packages defines `"check:exports": "publint --strict"`, `"check:types": "attw --pack ."`, `"verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci"`, and `"prepublishOnly": "npm run verify"` — `npm publish` fails if any verify step fails
  2. `packages/*/dist/` is added to `.gitignore`, the currently-committed `standards/dist/` drift visible in `git status` is resolved (build artefacts removed from history-going-forward), and CI builds dist before publish from a clean tree
  3. The 29 component subpath exports either expose a `require` field (alongside `types` and `import`) OR the package is documented and configured as ESM-only — whichever resolution publint accepts without error
  4. tsup entry config uses a glob exclusion (`src/index.ts`, `src/*/!(*.test|*.stories).{ts,tsx}`) and a CI guard greps `dist/**` for `vitest`, `@testing-library`, `describe(`, and `it(` — failing the build if any test code leaks into the published bundle
  5. `lucide-react` is moved from `dependencies` to optional `peerDependencies` (with `peerDependenciesMeta.optional: true`) in `@holmdigital/components`, every component that imports a lucide icon falls back to a text glyph (`▾`, `⚠`, `ℹ`) when the peer is not installed, and the README documents the fallback behaviour
**Plans**: TBD

### DRAFT: Engine Redesign — Detektion + Scoring + Kommunikation (ej planlagd)

**Draft:** `.planning/milestones/v2.0-scoring-redesign-DRAFT.md`
**Research:** `.planning/research/tool-comparison-gov-sites.md`, `test-methodology.md`, `tool-comparison-lptt-se.md`

**Bakgrund:** Jämförande research (10 myndighets-sajter × 4 verktyg) visar att HolmDigital hittar 5 unika problem ingen annan ser, men ger lägre score pga strängare modell + renderings-timing-gap. 8/10 Webperf 5.00-sajter har kontrastproblem vi missar. Paradoxen: en grundligare scanner ser sämre ut i siffror.

**Prioritetsordning: Fixa → Förbättra → Kommunicera**

**P0 — Fixa detektion:**
- Fas 0: Dual-pass axe-scanning (pre + post networkIdle) — fångar kontrast i cookie-banners
- Fas 1: Saknade violations (aria-required-children, nested-interactive, button-name)
- Fas 2: Multi-viewport scanning (desktop + mobil)

**P1 — Förbättra scoring:**
- Fas 3: Violation dedup per rule-ID
- Fas 4: Trelagersmodell (complianceScore + riskIndicator + testCoverage) + html-validate i score

**P2 — Kommunicera styrka:**
- Fas 5: WCAG Coverage Mapping
- Fas 6: CLI & Report Output med förklaring
- Fas 7: Dokumentation & Artikel
- Fas 8: Test & Regression

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Standards Types | v0.1 | 2/2 | Complete | 2026-03-02 |
| 2. Version Fix | v0.1 | 2/2 | Complete | 2026-03-03 |
| 3. Engine Casts | v0.1 | 2/2 | Complete | 2026-03-03 |
| 4. Locale Routing | v0.1 | 1/1 | Complete | 2026-03-03 |
| 5. Test Coverage | v0.1 | 2/2 | Complete | 2026-03-03 |
| 6. ESM Fix and Foundation | v0.2 | 1/1 | Complete | 2026-03-04 |
| 7. Engine Generator Locale Expansion | v0.2 | 2/2 | Complete | 2026-03-04 |
| 8. Component UI Chrome Localization | v0.2 | 1/1 | Complete | 2026-03-04 |
| 9. en-gb/en-us/en-ca Statement Templates | v0.2 | 2/2 | Complete | 2026-03-04 |
| 10. Verification and Test Coverage | v0.2 | 2/2 | Complete | 2026-03-05 |
| 11. Enforcement Body Data | v0.3 | 1/1 | Complete | 2026-03-06 |
| 12. Engine National Compliance | v0.3 | 2/2 | Complete | 2026-03-06 |
| 13. Component National Compliance | v0.3 | 1/1 | Complete | 2026-03-06 |
| 14. Locale Standards Data | v0.4 | 1/1 | Complete | 2026-03-06 |
| 15. New Locale Engine Templates | v0.4 | 1/1 | Complete | 2026-03-07 |
| 16. New Locale Component Templates | v0.4 | 1/1 | Complete | 2026-03-07 |
| 17. EAA Sector Support | v0.4 | 1/1 | Complete | 2026-03-07 |
| 18. AU Standards Foundation | v0.5 | 1/1 | Complete | 2026-03-28 |
| 19. AU Component Locale | v0.5 | 1/1 | Complete | 2026-03-28 |
| 20. AU Engine Integration | v0.5 | 1/1 | Complete | 2026-03-28 |
| 21. AU Test Coverage | v0.5 | 1/1 | Complete | 2026-03-29 |
| 22. Test Infrastructure + First-7 Components | v0.6 | 0/0 | Not started | - |
| 23. Styling Unification | v0.6 | 0/0 | Not started | - |
| 24. Complex APG Widget Test Coverage | v0.6 | 0/0 | Not started | - |
| 25. AccessibilityStatement publishDate Fix + Regression Guards | v0.6 | 0/0 | Not started | - |
| 26. Publish Hygiene | v0.6 | 0/0 | Not started | - |
