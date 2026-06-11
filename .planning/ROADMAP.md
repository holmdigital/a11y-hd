# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- ✅ **v0.2 Full Localization** — Phases 6-10 (shipped 2026-03-05)
- ✅ **v0.3 National Compliance** — Phases 11-13 (shipped 2026-03-06)
- ✅ **v0.4 Locale Expansion + EAA Sector** — Phases 14-17 (shipped 2026-03-07)
- ✅ **v0.5 Australia Jurisdiction** — Phases 18-21 (shipped 2026-03-29)
- ✅ **v0.6 Components Quality** — Phases 22-26 (shipped 2026-05-11)
- 🚧 **v0.7 APG Completion** — Phases 27-33 (in progress)

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

<details>
<summary>✅ v0.6 Components Quality (Phases 22-26) — SHIPPED 2026-05-11</summary>

- [x] Phase 22: Test Infrastructure + First-7 Components (9/9 plans) — completed 2026-05-10
- [x] Phase 23: Styling Unification (4/4 plans) — completed 2026-05-10
- [x] Phase 24: Complex APG Widget Test Coverage (6/6 plans) — completed 2026-05-11
- [x] Phase 25: AccessibilityStatement publishDate Fix + Regression Guards (1/1 plan) — completed 2026-05-10
- [x] Phase 26: Publish Hygiene (5/5 plans) — completed 2026-05-11

See: `.planning/milestones/v0.6-ROADMAP.md` for full details

</details>

### v0.7 APG Completion (In Progress)

**Milestone Goal:** Finish the source-side APG implementation work that Phase 24 pinned with tests — close the 4 keyboard-handler gaps (DatePicker/MultiSelect/DataTable/NavigationMenu) and 3 live-region gaps surfaced by Phase 24, add Tier 1+2 test coverage for the remaining 8 components, and chain lint + typecheck into the verify pipeline. v0.6 pinned the contracts; v0.7 ships them.

- [x] **Phase 27: APG Live Regions** - Combobox results-count + MultiSelect selection-count live-region announcements (TC-09-LIVE, TC-11-LIVE); shared `_i18n/live-region-strings.ts` localized per `locale` prop. TC-10-LIVE moved to Phase 28 (paired with calendar UI). (completed 2026-05-11)
- [x] **Phase 28: DatePicker APG Dialog-Grid Keyboard + Live Region** - Replace/augment native `<input type="date">` with `role="grid"` calendar UI + Arrow/Home/End/PageUp/PageDown/Shift variants; calendar `onSelect` triggers selected-date live-region announcement (TC-10-IMPL + TC-10-LIVE) (completed 2026-05-11)
- [x] **Phase 29: MultiSelect APG Listbox-Multi** - `aria-multiselectable="true"`, Space-toggle without focus move, Shift+Arrow extends selection, dynamic `aria-selected`; MultiSelect.test.tsx stubs converted (TC-11-IMPL) (completed 2026-05-12)
- [x] **Phase 30: DataTable APG Grid Cell-Wise Keyboard** - Right/Left/Down/Up cell navigation, Home/End row-bounds, PageUp/PageDown row-paging, Ctrl+Home/End table-bounds; DataTable.test.tsx stubs converted (TC-12-IMPL) (completed 2026-05-12)
- [x] **Phase 31: NavigationMenu Disclosure → Menubar** - APG Menubar contract: Arrow horizontal/vertical, Home/End, Enter activates leaf, type-ahead, single tabindex="0" roving. NavigationMenu opt-in `pattern="menubar"` prop (default disclosure preserves v0.6 byte-equivalence); 43 tests; components 2.4.0 → 2.5.0 (TC-14-IMPL) (completed 2026-05-12)
- [x] **Phase 32: TC-15 Remaining Component Test Coverage** - Tier 1+2 suites for Card, Skeleton, Heading, ProgressBar, Pagination, SkipLink, Switch; Tooltip audited and augmented in place under D-02a waiver. 22 → 29 colocated test files; +106 new tests; components 2.5.0 → 2.6.0 (TC-15) (completed 2026-05-12)
- [x] **Phase 33: Lint + Typecheck Verify Gates** - Add `lint` (eslint) + `typecheck` (tsc --noEmit) to `verify` chain in all 3 packages (PUB-09) (completed 2026-05-12)

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

### Phase 27: APG Live Regions

**Goal**: Combobox (TC-09-LIVE), DatePicker (TC-10-LIVE), and MultiSelect (TC-11-LIVE) each render a `LiveRegion` (or `aria-live="polite"` element) that announces the most consequential state change to assistive tech: results count on Combobox query change, selected-date on DatePicker commit, selection count on MultiSelect chip add/remove. The three Phase 24 test files are extended with live-region assertions, completing the relevant ROADMAP success-criterion bullets deferred from v0.6.
**Depends on**: Phase 26 (v0.6 complete)
**Requirements**: TC-09-LIVE, TC-11-LIVE (TC-10-LIVE moved to Phase 28)
**Success Criteria** (what must be TRUE):

  1. Combobox renders a status live-region that updates to "{N} results" (or equivalent) when the filtered options list changes; Combobox.test.tsx asserts the region content updates via `waitFor`
  2. DatePicker renders a status live-region that announces the selected date in the component's `locale` when a date is committed; DatePicker.test.tsx asserts the region content
  3. MultiSelect renders a status live-region that announces "{N} selected" when chips are added or removed; MultiSelect.test.tsx asserts the region content
  4. All three implementations use the existing `LiveRegion` component (Phase 22 deps) — no duplicate live-region scaffolding
  5. 28-test-files / 453-tests baseline preserved; each plan adds ~2-3 new tests to existing files

### Phase 28: DatePicker APG Dialog-Grid Keyboard

**Goal**: DatePicker replaces (or augments) its current native `<input type="date">` with a `role="grid"` calendar dialog UI that satisfies the W3C APG dialog-grid pattern — day cells with `aria-selected` and `aria-current="date"` for today, plus the full keyboard matrix (Arrow day-by-day, Home/End week-bounds, PageUp/PageDown month, Shift+PageUp/PageDown year, Enter/Space select, Escape close). DatePicker.test.tsx no-throw stubs convert to real focus/state assertions.
**Depends on**: Phase 26 (independent of Phase 27 after TC-10-LIVE moved here)
**Requirements**: TC-10-IMPL, TC-10-LIVE
**Success Criteria** (what must be TRUE):

  1. DatePicker renders a `role="grid"` calendar when expanded; day cells use `role="gridcell"` with `aria-selected` reflecting selection state and `aria-current="date"` on today's cell
  2. Keyboard navigation: Arrow moves day-by-day; Home/End jump to week bounds; PageUp/PageDown jump month; Shift+PageUp/PageDown jump year; Enter/Space commit selection; Escape closes the dialog without selecting (returns focus to trigger)
  3. DatePicker.test.tsx no-throw stubs from Phase 24 are converted to real focus and `aria-selected`/`aria-current` assertions
  4. **`value` prop type changes from `string` to `Date`** — accepted breaking change per Phase 28 CONTEXT D-01 (verified non-coupled via Phase 22 SSR audit; CHANGELOG migration note shipped). All other consumer-facing props (label/description/error/className) preserved; new optional props added (minDate/maxDate/locale/placeholder); `forwardRef` and `extends React.InputHTMLAttributes` removed (no underlying input element)
  5. `LiveRegion` announces "Selected: {localized date}" on commit; localized per `locale` prop; no-mount-announce via `hasInteracted` ref (TC-10-LIVE)
  6. axe-clean smoke under jsdom

**Plans**: 3 plans
Plans:

- [x] 28-01-PLAN.md — Date math + i18n + base calendar render (no keyboard yet)
- [x] 28-02-PLAN.md — APG keyboard handler + focus trap + Phase 24 stub conversion
- [x] 28-03-PLAN.md — Live-region announcement (TC-10-LIVE) + WCAG 4.1.3 marker

### Phase 29: MultiSelect APG Listbox-Multi Completeness

**Goal**: MultiSelect satisfies the full W3C APG listbox-multi contract — `aria-multiselectable="true"` on the listbox, Space toggles option selection without moving focus (currently types a literal space), Shift+Arrow extends selection from current focus, `aria-selected` is dynamic (currently hardcoded `false`). MultiSelect.test.tsx no-throw stubs convert to real assertions.
**Depends on**: Phase 27 (MultiSelect live-region pairs with selection-state correctness)
**Requirements**: TC-11-IMPL
**Success Criteria** (what must be TRUE):

  1. The listbox carries `aria-multiselectable="true"`; options carry dynamic `aria-selected` reflecting current selection state
  2. Space on a focused option toggles its selection without moving focus to the next option; the option's `aria-selected` flips correctly
  3. Shift+ArrowDown / Shift+ArrowUp extends selection range from the anchor focus to the new focus position
  4. MultiSelect.test.tsx no-throw stubs from Phase 24 are converted to real selection-state assertions; existing 22 tests preserved
  5. Existing prop interface unchanged

**Plans:** 1 plan

Plans:

- [x] 29-01-PLAN.md — ARIA semantics (aria-multiselectable + dynamic aria-selected) + Space toggle + Shift+Arrow extend from anchor + stub conversion (TC-11-IMPL) (completed 2026-05-12)

### Phase 30: DataTable APG Grid Cell-Wise Keyboard

**Goal**: DataTable adds cell-wise Arrow keyboard navigation to satisfy the W3C APG grid contract — Right/Left/Down/Up move between cells, Home/End jump to row bounds, PageUp/PageDown jump pages (or a configurable row-count if pagination isn't built-in), Ctrl+Home/End jump to table bounds. Existing sortable-header contract (`scope="col"`, `aria-sort`, native Enter/Space on `<button>` headers) stays as-is. DataTable.test.tsx cell-arrow no-throw stubs convert to real focus assertions.
**Depends on**: Phase 26 (independent of Phases 27-29)
**Requirements**: TC-12-IMPL
**Success Criteria** (what must be TRUE):

  1. Arrow keys move focus between `gridcell` elements per the APG grid pattern; focus is managed via single tabindex="0" on the active cell, tabindex="-1" on inactive cells (roving)
  2. Home / End jump to first / last cell in the current row; PageUp / PageDown jump up/down by N rows (default 10 or configurable); Ctrl+Home / Ctrl+End jump to table corners
  3. DataTable.test.tsx cell-arrow no-throw stubs from Phase 24 are converted to real focus assertions; sortable-header tests still pass unchanged
  4. Existing prop interface unchanged
  5. axe-clean smoke under jsdom

**Plans:** 1 plan

Plans:

- [x] 30-01-PLAN.md — Add APG grid roles + roving tabindex + parent-grid onKeyDown (Arrow/Home/End/Ctrl+Home/End/PageUp/PageDown/Enter delegation) + @wcag JSDoc to DataTable.tsx; migrate Tier 1 role queries; convert 9 no-throw stubs to ~17 real focus assertions; full verify (TC-12-IMPL)

### Phase 31: NavigationMenu Disclosure → Menubar

**Goal**: NavigationMenu upgrades from its current APG Disclosure pattern to the W3C APG Menubar pattern — Arrow horizontal/vertical, Home/End first/last, Enter activates leaf, type-ahead, single `tabindex="0"` roving. NavigationMenu.test.tsx Disclosure tests are replaced (or augmented under an opt-in prop) with the Menubar contract. **Backwards-compat decision in discuss-phase:** opt-in via new `pattern="menubar" | "disclosure"` prop (preserves current behavior for v0.6 consumers), or new default with migration note in CHANGELOG. Discuss decides.
**Depends on**: Phase 26 (independent of Phases 27-30)
**Requirements**: TC-14-IMPL
**Success Criteria** (what must be TRUE):

  1. NavigationMenu satisfies the APG Menubar keyboard contract: Right/Left along menubar, Down opens submenu and focuses first item, Up/Down within submenu, Right enters nested submenu or moves to next menubar item, Left collapses submenu or moves to previous menubar item, Home/End jump to bounds, Enter activates leaf, Escape closes submenu, type-ahead (single character) jumps to first matching item
  2. Single `tabindex="0"` rove implemented; ARIA: `role="menubar"`, items `role="menuitem"`, submenus `role="menu"`, triggers `aria-haspopup="menu"` + `aria-expanded`
  3. Backwards-compat strategy chosen in discuss-phase is implemented (opt-in prop OR new default + migration note); existing Disclosure consumers documented as supported (if opt-in) or migrated (if new default)
  4. NavigationMenu.test.tsx Phase-24 Disclosure tests either preserved under opt-in OR replaced with Menubar tests; Escape focus-parity race resolved
  5. axe-clean smoke

### Phase 32: TC-15 Remaining Component Test Coverage

**Goal**: Tier 1+2 test suites for the 8 remaining components without coverage — Card, Skeleton, Heading, ProgressBar, Pagination, SkipLink, Switch, Tooltip. Brings total components-with-tests from 19 → 27 (full coverage of the public API). Each test file follows the Phase 22 template-setter pattern.
**Depends on**: Phase 26 (independent of Phases 27-31)
**Requirements**: TC-15
**Success Criteria** (what must be TRUE):

  1. 8 new `*.test.tsx` files exist next to their components in `packages/components/src/<Component>/`
  2. Each test file: WCAG-SC JSDoc marker, ~5-15 `it()` blocks (component complexity dependent), Tier 1 (render + props + className passthrough) + Tier 2 (where applicable: Switch keyboard toggle, Pagination keyboard, SkipLink focus, Tooltip aria-describedby wire-up, ProgressBar aria-valuenow/min/max, Heading semantic-level prop, Card composition, Skeleton aria-busy)
  3. D-02a clean across all 8 files; each includes at least one `expectNoAxeViolations` smoke
  4. Test-file count: 28 → 36; test count grows by ~50-100 tests depending on per-widget complexity
  5. `test:wcag-headers` count: 24 → 32
  (actual baseline 22 → target 29 — reconciled during planning, see 32-08 SUMMARY)

**Plans:** 8 plans

Plans:

- [ ] 32-01-PLAN.md — Card Tier 1+2 tests (TC-15)
- [ ] 32-02-PLAN.md — Skeleton Tier 1+2 tests (TC-15)
- [ ] 32-03-PLAN.md — Heading Tier 1+2 tests (TC-15, source untouched per TS2590 guard)
- [ ] 32-04-PLAN.md — SkipLink Tier 1+2 tests (TC-15, Swedish copy preserved)
- [ ] 32-05-PLAN.md — ProgressBar Tier 1+2 tests (TC-15)
- [ ] 32-06-PLAN.md — Switch Tier 1+2 tests (TC-15, APG Space/Enter toggle)
- [ ] 32-07-PLAN.md — Pagination Tier 1+2 tests (TC-15, no arrow-roving per RadioGroup precedent)
- [ ] 32-08-PLAN.md — Tooltip audit/augment + verify + 2.5.0→2.6.0 + CHANGELOG (TC-15 close)

### Phase 33: Lint + Typecheck Verify Gates

**Goal**: All 3 packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) chain `lint` (eslint) and `typecheck` (tsc --noEmit) into the `verify` pipeline. New chain: `build && lint && typecheck && check:exports && check:types && test:ci`. Each package gets a `typecheck` script if it doesn't already have one. Closes the v0.6 publish-gating effort by adding the last two automated quality gates.
**Depends on**: Phases 27-32 (runs last so all preceding source changes pass the new gates)
**Requirements**: PUB-09
**Success Criteria** (what must be TRUE):

  1. All 3 packages have `"typecheck": "tsc --noEmit"` script (creating if missing); `tsconfig.json` exists or extends a root config
  2. `verify` script in each package chains `build && lint && typecheck && check:exports && check:types && test:ci` in that order
  3. `npm run verify -w @holmdigital/<each>` exits 0 for all 3 packages after Phases 27-32 land
  4. Pre-existing engine TS2724 (puppeteer types) — if it surfaces as a verify failure, this phase either fixes it inline or documents an explicit `--skipLibCheck` justification
  5. `prepublishOnly` continues to chain `verify`; `npm publish` fails if lint or typecheck fails

**Plans:** 4 plans
Plans:

- [x] 33-01-PLAN.md — Standards verify-chain wire-up (typecheck script + lint/typecheck gate in verify)
- [x] 33-02-PLAN.md — Engine verify-chain wire-up + 2 lint-error fixes (`__ENGINE_VERSION__` global + `@ts-ignore` → `@ts-expect-error`)
- [x] 33-03-PLAN.md — Components verify-chain wire-up + 27 tsc-error fixes across 5 categories + 5 absorbed lint errors (React TS-namespace imports + eslint-plugin-react-hooks)
- [x] 33-04-PLAN.md — Sequential verify proof + PATCH bumps (standards 2.5.1→2.5.2 / components 2.6.0→2.6.1 / engine 2.5.2→2.5.3) + CHANGELOGs

**Completed:** 2026-05-12

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

### Phase 34: Klarspråksrapport (opt-in plain-language report)

**Goal:** `hd-a11y-scan <url> --plain` (alias för `--audience plain`, default `developer` — inget befintligt beteende ändras) ger en klarspråksrapport för icke-tekniska mottagare i terminal och PDF. Texterna bor i standards (engelska nycklar, lokaliserade värden), hämtas i `generateRegulatoryReport` via den befintliga `getConvergenceRule`-uppslagningen (EN uppslagning — ingen ny locale-laddare, ingen andra uppslagning vid utskrift), och flödar till terminal/`--json`/`--pdf` på samma gång.
**Requirements**: PLAIN-01 (typ + datafält i standards), PLAIN-02 (enrichment-koppling), PLAIN-03 (terminalrenderare), PLAIN-04 (CLI-flaggor `--audience`/`--plain`), PLAIN-05 (PDF-läge via `audience`-arg i `generateReportHTML`), PLAIN-06 (8 svenska texter i `rules.sv.json` mot semantiska id: `alt-text`, `color-contrast`, `form-labels`, `link-purpose`, `name-role-value`, `keyboard-accessible`, `heading-order`, `language-of-page`)
**Depends on:** Phase 33
**Plans:** 5 plans

**Underlag:** `daniel-engine-klarsprak-2026-06-05.md` (auktoritativ ram, Karins beslut), `klarsprak-cli-implementation.md` (bygg enligt denna — text i standards, engelska nycklar), `klarsprakslager-engine.md` (innehåll: 8 färdiga texter + tonregler + rapportöppning; dess svensk-nycklade datatyp skrotas). De två sistnämnda säger emot varandra med flit — läses ihop via förslaget.

**Tekniska avgöranden (verifierade mot kod):**

- `generateRegulatoryReport` plockar explicita fält (spreadar inte) — `plainLanguage` kopieras där (`packages/standards/src/index.ts:274`), då flödar den genom `{...report}`-spreaden i engines `enrichResults` utan engine-ändringar för dataflödet
- `getPlainLanguageCopy`-helpern + `RULES_BY_LANG` ur CLI-dokumentet SKROTAS (förslaget förbjuder andra uppslagning) — renderaren läser `report.plainLanguage` direkt
- CLI-dokumentets exempel `"ruleId": "image-alt"` är fel — semantiskt id är `alt-text`
- Fallback-rapporter (omappade regler) får `plainLanguage: undefined` → degraderar till `remediation.description` precis som spec kräver
- `impactLevel` sätts för hand på köpkritiska regler (`form-labels` = stoppar-kop); övriga härleds från `diggRisk` (critical→stoppar-kop, high→hindrar, medium→forsamrar, low→putsning)
- Tonregler: du-tilltal, ingen oförklarad fackterm, aldrig skuldbeläggande, affärsnytta före teknik, konkret nästa steg, inga tankstreck. Inga uppfunna procentsatser.
- Öppen designfråga till planning: renderarens chrome-strängar ("Vad som händer:" etc.) — hårdkodad svenska (som CLI-dokumentets exempel) eller via engines i18n så `--plain --lang en` inte blir halvsvensk
- Encoding-vakt: källdokumenten är mojibake-skadade (Ã¶→ö) — texterna måste återskapas med korrekta å/ä/ö och verifieras före commit
- Leverans: testskanning av johancask.com med `--plain --pdf` för Karins granskning; minor-release av standards + engine via changesets efter godkännande (Version Packages-PR-mergen är godkännandegrinden)

Plans:
**Wave 1**

- [ ] 34-01-PLAN.md — Standards types (PlainLanguageCopy + BusinessImpactLevel) + 8 sv/en texts + D-10 data guards [wave 1]
- [ ] 34-03-PLAN.md — Engine i18n: plain.* chrome in all 9 locale files (en/sv real, 7 deferred English) [wave 1]

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 34-02-PLAN.md — Enrichment: generateRegulatoryReport explicit plainLanguage copy + D-03 EN fallback [wave 2]
- [ ] 34-04-PLAN.md — Terminal renderer plain-report.ts + D-10.4 structure tests (sort/badge/fallback/empty) [wave 2]

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 34-05-PLAN.md — CLI flags --plain/--audience + plain PDF + 2 changesets + D-09 Karin gate [wave 3]

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
| 22. Test Infrastructure + First-7 Components | v0.6 | 9/9 | Complete | 2026-05-10 |
| 23. Styling Unification | v0.6 | 4/4 | Complete | 2026-05-10 |
| 24. Complex APG Widget Test Coverage | v0.6 | 6/6 | Complete | 2026-05-11 |
| 25. AccessibilityStatement publishDate Fix + Regression Guards | v0.6 | 1/1 | Complete | 2026-05-10 |
| 26. Publish Hygiene | v0.6 | 5/5 | Complete | 2026-05-11 |
| 27. APG Live Regions | v0.7 | 1/1 | Complete   | 2026-05-11 |
| 28. DatePicker APG Dialog-Grid Keyboard | v0.7 | 3/3 | Complete   | 2026-05-11 |
| 29. MultiSelect APG Listbox-Multi Completeness | v0.7 | 1/1 | Complete   | 2026-05-12 |
| 30. DataTable APG Grid Cell-Wise Keyboard | v0.7 | 0/1 | In progress | - |
| 31. NavigationMenu Disclosure → Menubar | v0.7 | 0/0 | Not started | - |
| 32. TC-15 Remaining Component Test Coverage | v0.7 | 0/0 | Not started | - |
| 33. Lint + Typecheck Verify Gates | v0.7 | 4/4 | Complete | 2026-05-12 |
