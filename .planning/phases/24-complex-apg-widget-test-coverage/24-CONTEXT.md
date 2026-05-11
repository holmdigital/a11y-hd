---
phase: 24
phase_name: Complex APG Widget Test Coverage
date: 2026-05-11
requirements: TC-09, TC-10, TC-11, TC-12, TC-13, TC-14
---

# Phase 24 Context

## Domain

Add Tier 1+2 test coverage for the six complex APG-pattern widgets — Combobox (TC-09), DatePicker (TC-10), MultiSelect (TC-11), DataTable (TC-12), TreeView (TC-13), NavigationMenu (TC-14) — using the helpers and conventions established in Phase 22. The tests assert the W3C WAI-ARIA Authoring Practices Guide keyboard and ARIA contracts for each widget pattern, plus live-region announcements where the pattern requires them.

This phase is **test-only scope**. Source-implementation gaps in DataTable and DatePicker (which currently ship without the full APG keyboard handlers) are handled via the Phase 22 RadioGroup pattern: tests assert what the source actually implements + keystrokes-do-not-throw for the missing behaviors, with the gaps documented as v0.7 follow-up.

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 24 goal + 5 success criteria (one per widget pattern group)
- `.planning/REQUIREMENTS.md` — TC-09..14
- `.planning/phases/22-test-infra-and-first-7-components/22-CONTEXT.md` — Phase 22 conventions inherited
- `.planning/phases/22-test-infra-and-first-7-components/22-06-SUMMARY.md` — **RadioGroup pattern reference** (no-throw fallback when source lacks keyboard handler)
- `packages/components/TESTING-CONVENTIONS.md` — Phase 22 test grammar (Tier 1 / Tier 2 / WCAG-SC marker)
- `packages/components/src/Button/Button.test.tsx` — Phase 22 template-setter; new test files mirror its structure
- `packages/components/src/Tabs/Tabs.test.tsx` — Phase 22 Plan 09; full APG keyboard-matrix template (pinned roving-tabindex contract for components that actually implement it)
- `packages/components/src/_test/helpers.ts` — `expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`
- `packages/components/src/_test/setup.ts` — 7 jsdom polyfills + matchers
- `packages/components/src/Combobox/Combobox.tsx` (353 LOC, 9 ARIA hits, has onKeyDown, uses LiveRegion)
- `packages/components/src/DatePicker/DatePicker.tsx` (121 LOC, 1 ARIA hit, NO onKeyDown, uses LiveRegion) — **stub for APG keyboard**
- `packages/components/src/MultiSelect/MultiSelect.tsx` (293 LOC, 9 ARIA hits, likely has keyboard, uses LiveRegion)
- `packages/components/src/DataTable/DataTable.tsx` (182 LOC, 1 ARIA hit, NO onKeyDown, no live region) — **stub for APG keyboard**
- `packages/components/src/TreeView/TreeView.tsx` (285 LOC, 18 ARIA hits, likely has keyboard)
- `packages/components/src/NavigationMenu/NavigationMenu.tsx` (177 LOC, 5 ARIA hits, has onKeyDown — `handleKeyDown` and `handleTriggerKeyDown`)
- W3C WAI-ARIA Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/) — patterns: combobox, datepicker dialog, listbox, grid, tree, menubar

## Code Context

**Test infrastructure already in place (Phase 22):**
- `_test/setup.ts`: 7 jsdom polyfills (IntersectionObserver, ResizeObserver, matchMedia, offsetParent, HTMLDialogElement.showModal/close, Element.animate, scrollIntoView), jest-dom matchers, vitest-axe matchers
- `_test/axe.ts`: `axe-core` direct usage via `axe.run` + `axe.configure` (NOT `configureAxe` from vitest-axe — doesn't exist in 0.19.1)
- `_test/helpers.ts`: `expectNoAxeViolations(container, options?)`, `expectUniqueIds(container)`, `expectKeyboardSequence(element, keys[])`
- `userEvent` v14 from `@testing-library/user-event`
- WCAG-SC marker enforced by `npm run test:wcag-headers` (currently 17 files marker-checked)
- D-02a anti-pattern gate enforced by reviewer: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot` in test files

**Component implementation status (scouted 2026-05-11):**
- **Combobox** (353 LOC, has `onKeyDown`, uses LiveRegion): expected to satisfy full APG combobox-with-listbox-popup contract — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, Down/Up/Home/End/Enter/Escape/type-ahead/Alt+Down/Alt+Up, live-region announces results count
- **MultiSelect** (293 LOC, 9 ARIA hits, uses LiveRegion): expected to satisfy `role="listbox"` + `aria-multiselectable="true"`, options with `aria-selected` (NOT `aria-checked`), Space toggles without focus move, Shift+Arrow extends selection, removable chips keyboard-operable, live-region count
- **TreeView** (285 LOC, 18 ARIA hits): expected to satisfy APG tree — Arrow expand/collapse/navigate, Asterisk expand siblings, type-ahead, single `tabindex="0"` roving
- **NavigationMenu** (177 LOC, 5 ARIA hits, has `handleKeyDown` + `handleTriggerKeyDown`): expected to satisfy APG menubar — Arrow horizontal/vertical, Home/End, Enter activates, Escape closes submenu
- **DataTable** (182 LOC): **PARTIAL-STUB for APG grid keyboard**. Source HAS `scope="col"`, `aria-sort` on sortable headers, button-wrapped sortable headers with native Enter/Space activation. Source LACKS cell-wise Arrow navigation, Home/End row, PageUp/PageDown paging, Ctrl+Home/End table bounds. Tests assert what source HAS + no-throw for cell-arrow nav. Gap documented for v0.7.
- **DatePicker** (121 LOC, NO `onKeyDown`, does NOT use LiveRegion despite earlier scouting): **STUB for APG dialog-grid keyboard**. Source lacks `role="grid"` calendar, `gridcell` day cells with `aria-selected`/`aria-current="date"`, Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown navigation, and live-region selected-date announcement. Tests will assert what's there + no-throw for the missing keyboard contract. Gaps documented for v0.7.
- **Combobox** (353 LOC, has `onKeyDown`, does NOT actually render `<LiveRegion>` despite earlier scouting — researcher confirmed via source read 2026-05-11): Substantive keyboard handler. Tests assert APG combobox-with-listbox-popup contract for what source implements; live-region absence documented for v0.7.
- **MultiSelect** (293 LOC): **PARTIAL-STUB**. Source HAS `role="listbox"`, options with `role="option"`, some keyboard handling. Source LACKS `aria-multiselectable="true"`, Space-toggle (Space currently types literal space), Shift+Arrow extend, live region; `aria-selected` is hardcoded `false`. Tests assert what's there + no-throw for the missing APG behaviors. Gaps documented for v0.7.
- **NavigationMenu** (177 LOC, has onKeyDown): source self-documents as APG **Disclosure** pattern (file JSDoc line 26), NOT APG Menubar despite the ROADMAP TC-14 wording. Tests assert the Disclosure pattern source ships. Menubar upgrade (Arrow horizontal/vertical, Home/End, Enter activates leaf, type-ahead) deferred to v0.7 via TC-14-IMPL backlog.
- **TreeView** (285 LOC, 18 ARIA hits): near-full APG tree. Implements Arrow expand/collapse/navigate, Home/End, single `tabindex="0"` roving. Lacks typeahead and asterisk-expand — both APG-OPTIONAL — omitted silently from tests per user decision (no backlog item).

**Existing test surface:** None of the 6 components have existing test files. Phase 24 starts from zero for all six.

**Live region implementation:** Combobox, DatePicker, MultiSelect already use LiveRegion / `aria-live` — TC-09/10/11 live-region requirements are testable against existing source. DataTable, TreeView, NavigationMenu do NOT have live regions and the ROADMAP success criteria don't require them for those three.

## Decisions

### D-01 — Stub-component strategy: Phase 22 RadioGroup pattern (revised 2026-05-11 after researcher source-read)

**Applies to 4 widgets, not 2.** Source-reading at plan time confirmed that DataTable, DatePicker, MultiSelect, and NavigationMenu all have partial-stub status for some portion of their APG contracts. Apply the Phase 22 RadioGroup pattern (documented in `22-06-SUMMARY.md`):

1. Tests assert the contract the source DOES implement (static ARIA, semantic structure, axe-clean, props/event passthrough)
2. For missing APG keyboard behaviors, tests assert **keystrokes-do-not-throw** only — verify that pressing Arrow/Home/End/PageUp/PageDown/Enter/Space/Escape does NOT raise an exception, but do NOT assert focus movement or aria-state changes that the source doesn't drive
3. Each test file carries a JSDoc `Implementation note` block at the top documenting which APG behaviors are stubbed-out vs fully tested, and notes that DataTable and DatePicker APG-keyboard implementation work is deferred to v0.7
4. SIX NEW v0.7 backlog items added to `.planning/REQUIREMENTS.md` "Deferred / Out of Scope" section (expanded from 2 after researcher source-read 2026-05-11):
   - **TC-12-IMPL**: DataTable APG grid cell-wise keyboard handler (Right/Left/Down/Up cell navigation, Home/End row, PageUp/PageDown, Ctrl+Home/End table bounds). NOTE: source already has `scope="col"`, `aria-sort`, and native Enter/Space on sortable headers — only cell-arrow nav is the gap.
   - **TC-10-IMPL**: DatePicker APG dialog-grid keyboard handler (`role="grid"`, day-cell navigation, Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown, Escape close)
   - **TC-11-IMPL**: MultiSelect APG listbox-multi completeness (`aria-multiselectable="true"`, Space-toggle without focus move, Shift+Arrow extends selection, dynamic `aria-selected`)
   - **TC-14-IMPL**: NavigationMenu APG Menubar upgrade (currently APG Disclosure; upgrade to Arrow horizontal/vertical, Home/End, Enter activates leaf, type-ahead)
   - **TC-09-LIVE**: Combobox live-region for results count
   - **TC-10-LIVE**: DatePicker live-region for selected-date announcement
   - **TC-11-LIVE**: MultiSelect live-region for selection count

**Rationale:** keeps Phase 24 scope as "Test Coverage" (its actual name). Pinning the existing contract NOW prevents silent regressions in the keyboard work that will land in v0.7. Adding two backlog items (not loose TODOs) keeps the gaps visible.

### D-02 — Plan shape: 6 plans, one per component, all parallel

Plans 24-01 through 24-06, no dependencies between them — each component's test file is independent of the others:
- 24-01: Combobox (TC-09) — full APG combobox-with-listbox-popup contract; uses existing keyboard handler + LiveRegion
- 24-02: DatePicker (TC-10) — partial APG dialog-grid; STUB strategy per D-01; uses existing LiveRegion
- 24-03: MultiSelect (TC-11) — full APG listbox-multi contract; uses existing keyboard handler + LiveRegion
- 24-04: DataTable (TC-12) — partial APG grid; STUB strategy per D-01
- 24-05: TreeView (TC-13) — full APG tree contract; uses existing keyboard handler
- 24-06: NavigationMenu (TC-14) — full APG menubar contract; uses existing keyboard handlers

All 6 plans in Wave 1, run in parallel via worktrees. Source files for each component are disjoint (`src/<Component>/<Component>.test.tsx` per plan); only `package.json` would conflict but **no plan needs to touch `package.json`** (the test files inherit existing `test:ci` configuration from Phase 23).

**Rationale:** mirrors Phase 22 Wave 5 parallel structure (3 plans worked successfully); failure mode of one plan doesn't block the others; smallest atomic diffs per PR.

### D-03 — Each test file ships with axe-clean smoke

Per Phase 22 convention, each component test file MUST include at least one `expectNoAxeViolations()` call against a typical-render fixture. For these complex widgets, scope the axe pass to a single Tier-1 default-render smoke (NOT every Tier-2 keyboard state — full axe scan per keyboard step is too slow and noisy for jsdom).

If a component's typical-render violates axe (which would be a real WCAG bug, not just a test concern), the test FAILS and the planner spawns a fix-in-place for the offending rule — but Phase 22's Tabs/Modal/etc. test runs were all axe-clean, so this is unlikely.

### D-04 — Test file structure: mirror `Button.test.tsx` template

Each test file uses the Phase 22 template-setter structure:
1. WCAG-SC JSDoc header (relevant SCs vary per widget pattern: 2.1.1 Keyboard, 2.4.3 Focus Order, 2.4.7 Focus Visible, 1.3.1 Info and Relationships, 4.1.2 Name Role Value, 4.1.3 Status Messages — planner picks the right ones per widget)
2. Imports from `_test/helpers` (NEVER `configureAxe` from vitest-axe)
3. Tier 1 describe block: default render, ARIA structure, axe-clean smoke
4. Tier 2 describe block: keyboard matrix, state transitions, live-region announcements (for Combobox/DatePicker/MultiSelect/MenuBar where applicable)
5. D-02a gate: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot`

Test count budget per file: ~10-20 `it()` blocks (less than Phase 22's Tabs which has 19). Stub components (DataTable, DatePicker) will be on the lower end (~8-12 tests) because Tier-2 keyboard tests collapse to no-throw asserts.

### D-05 — Live-region testing pattern (REVISED 2026-05-11)

**Researcher source-read found that Combobox, DatePicker, and MultiSelect do NOT actually render `<LiveRegion>` despite earlier scouting.** TC-09/10/11 live-region success criteria are unimplementable against current source.

**Resolution:** test files do NOT assert live-region announcements. The live-region implementation gap is documented as three v0.7 backlog items (TC-09-LIVE, TC-10-LIVE, TC-11-LIVE) per D-01. Each test file's JSDoc Implementation note explicitly records that the live-region success-criterion bullet is deferred and references the backlog item.

**If future v0.7 work lands live regions:** the testing pattern would be:
1. Region exists with `role="status"` or `aria-live="polite"` (whichever LiveRegion ships with — read `LiveRegion.tsx` at that time)
2. Region content updates when state changes (results count on Combobox filter, selection count on MultiSelect, selected-date on DatePicker)
3. Use `waitFor(() => expect(region).toHaveTextContent(...))` for async-update cases
4. Assert content presence, NOT announcement timing (jsdom doesn't replicate browser announcement queueing)

Pre-existing TS2503 in `LiveRegion.tsx:37` is deferred (see Phase 22 `deferred-items.md`) — does NOT block testing (runtime behavior works; only DTS build step fails on it).

### D-06 — NavigationMenu is APG Disclosure, not Menubar (NEW 2026-05-11)

ROADMAP TC-14 wording assumes APG Menubar pattern, but NavigationMenu source self-documents (file JSDoc line 26) as APG **Disclosure** pattern: each top-level item has a button trigger that toggles its submenu independently, Escape closes the open submenu, click-outside closes. No Arrow-key navigation along the menubar; submenus are independent.

**Resolution:** TC-14 tests assert the Disclosure pattern source ships, NOT the Menubar contract. Test file's WCAG-SC marker uses Disclosure-relevant SCs (2.1.1 Keyboard, 2.4.3 Focus Order, 4.1.2 Name Role Value — NOT 2.4.7 Focus Visible-specific menubar requirements). The Menubar upgrade is deferred to v0.7 via TC-14-IMPL backlog.

### D-07 — TreeView APG-OPTIONAL behaviors omitted (NEW 2026-05-11)

TreeView source is near-full APG-compliant. The two missing behaviors — typeahead (character-key jumps to first matching item) and asterisk-expand (`*` expands all sibling nodes) — are both APG-OPTIONAL. Per user decision, tests OMIT these silently: no test asserts them, no no-throw stub, no backlog item. Test file focuses on the required APG tree contract.

## Deferred Ideas

- **TC-12-IMPL: DataTable APG grid keyboard handler** — v0.7 work; cell-wise navigation, sortable headers, aria-sort toggling. Out of Phase 24 scope per D-01.
- **TC-10-IMPL: DatePicker APG dialog-grid keyboard handler** — v0.7 work; role="grid" calendar, Arrow/Home/End/PageUp/PageDown navigation, Escape close. Out of Phase 24 scope per D-01.
- **Real-browser axe-core run** (PUB-07) — deferred to v0.7+; jsdom axe coverage is what Phase 24 ships.
- **Storybook visual regression for the 6 widgets** — blocked on upstream Storybook esbuild patch (recorded in STATE.md Blockers).
- **MutationObserver-driven live-region announcement timing tests** — out of scope; jsdom doesn't replicate browser announcement queueing reliably. Tests assert region content, not announcement timing.
- **Full Tier-3 (production-realism) test suites** — Phase 24 ships Tier 1+2 only; Tier 3 (large-dataset DataTable, edge-case Combobox query results, multi-day-range DatePicker) is implementation-budget work for v0.7+.

## Constraints

- 21 test files / 307 tests baseline (post-Phase-23) must stay green
- New test files MUST carry WCAG-SC JSDoc marker (Phase 22 CI gate via `npm run test:wcag-headers`)
- D-02a anti-pattern gate: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot` per file
- No source modifications to the 6 widgets in Phase 24 (test-only scope; gaps documented for v0.7)
- 6 plans run in parallel via worktrees; each plan's source surface is disjoint
- Each test file ships with at least one `expectNoAxeViolations` Tier-1 smoke
- Live-region assertions use `waitFor` for async-update cases (Combobox, DatePicker, MultiSelect)
- Stub components (DataTable, DatePicker) document the APG-keyboard gap inline + add backlog items

## Success Criteria (from ROADMAP)

1. `Combobox.test.tsx` asserts APG combobox-with-listbox-popup contract: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, full keyboard matrix, live-region results count, axe-clean
2. `DatePicker.test.tsx` asserts APG dialog-grid contract — full where source implements; no-throw asserts + documented gap where source is stub; live-region selected-date; axe-clean
3. `MultiSelect.test.tsx` asserts `role="listbox"`, `aria-multiselectable="true"`, options with `aria-selected`, Space toggles without focus move, Shift+Arrow extends, removable chips keyboard-operable, live-region selection count, axe-clean
4. `DataTable.test.tsx` asserts what source implements (static grid semantics, `scope="col"`/`scope="row"` if present); no-throw asserts + documented gap for cell-wise Arrow nav, Home/End, PageUp/PageDown, `aria-sort` toggle; axe-clean
5. `TreeView.test.tsx` asserts APG tree (Arrow expand/collapse/navigate, Asterisk expand siblings, type-ahead, single `tabindex="0"` roving), axe-clean
6. `NavigationMenu.test.tsx` asserts APG menubar (Arrow horizontal/vertical, Home/End, Enter activates, Escape closes submenu), axe-clean

## Next Steps

`/gsd-plan-phase 24` — produces 6 plans (one per component, all parallel in Wave 1). Researcher likely needed: APG spec is dense and varies per widget; planner benefits from a per-pattern keyboard matrix and ARIA-attribute crib sheet before drafting 6 plans.
