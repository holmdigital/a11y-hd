# Feature Landscape: Component Test Coverage Scope

**Domain:** Test-suite design for a prescriptive React accessibility component library
**Researched:** 2026-05-10
**Milestone:** v0.6 Components Quality
**Scope:** 22 untested components in `@holmdigital/components`
**Confidence:** HIGH (evidence: existing Dialog.test.tsx and Select.test.tsx in repo establish the canonical pattern; WAI-ARIA APG patterns are W3C-stable; vitest+@testing-library stack already in use)

> **Note:** This file replaces stale v0.4 (Australia jurisdiction) research from 2026-03-27. The Australian feasibility content was archived in `SUMMARY.md` of that milestone and remains accessible via git history.

---

## Executive Summary

The existing `Dialog.test.tsx` and `Select.test.tsx` files have already locked in the project's testing philosophy — and that philosophy is **uncommonly opinionated for a React component library**:

- Tests assert **WAI-ARIA Authoring Practices Guide (APG) keyboard contracts**, not just rendering
- Tests assert **ID uniqueness across multi-instance mounts** (catches hardcoded IDs that break a11y when component used twice)
- Tests assert **focus restoration** (catches the most common a11y regression)
- Tests assert **event propagation boundaries** (Escape doesn't double-fire to ancestors)
- Tests use **roles and ARIA attributes as selectors**, never CSS classes or `data-testid` on internal nodes

This is the bar. Every new component test file must clear it. This document defines the taxonomy, per-component scope, and rollout priority.

---

## Test Category Taxonomy

### Tier 1: Table Stakes (every component, ~3-5 tests)

These exist solely so a missing test file is obvious. They catch nothing that a halfway-decent type system wouldn't, but their absence signals neglect.

| Category | What It Asserts | Example |
|----------|----------------|---------|
| **Renders without crashing** | Component mounts with minimal valid props | `render(<Button>Click</Button>)` returns without throwing |
| **Forwards ref** | `ref` lands on the public root element | `expect(ref.current).toBeInstanceOf(HTMLButtonElement)` |
| **Forwards `className`** | User-supplied className is composed, not replaced | Class list contains both library default AND user class |
| **Forwards arbitrary HTML props** | `data-*`, `aria-*`, `id` reach the DOM | `data-testid="x"` survives to rendered output |
| **Honors `disabled` / equivalent state prop** | Disabled component does not fire `onClick`/`onChange` and exposes correct ARIA |  |

**Anti-pattern warning:** Do NOT add a "matches snapshot" test. See Anti-Features.

### Tier 2: Differentiators — The Reason This Library Exists (every component, ~5-15 tests)

This is where a regulatory-compliance library earns its name. A generic React library test suite skips most of these.

| Category | What It Asserts | Why It Matters For This Library |
|----------|----------------|-------|
| **axe-core scan passes** | `vitest-axe` (or `jest-axe`) reports zero violations on rendered output | Self-evident for a library that maps WCAG to law. If our own components fail axe, the entire value proposition collapses. |
| **ARIA role correctness** | Component renders the role required by its APG pattern (`button`, `dialog`, `combobox`, `tree`, `tablist`, etc.) | Wrong role = wrong screen-reader announcement = WCAG 4.1.2 failure. |
| **ARIA state attributes** | `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-current`, `aria-invalid` flip with state | Static-correct ARIA isn't enough; state must reflect reality (WCAG 4.1.2). |
| **ARIA relationship attributes** | `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-owns`, `aria-activedescendant` resolve to real elements | Dangling IDREFs are the #1 axe-core "serious" violation in custom widgets. |
| **ID uniqueness across instances** | Mount the component twice; assert all generated IDs differ AND each resolves to exactly one element | Already enforced in `Dialog.test.tsx` lines 49-71. Catches hardcoded `id="dialog-title"` regressions. |
| **Keyboard interaction matrix** | Every key in the APG pattern fires the correct action (Enter, Space, Arrow keys, Home, End, Esc, Tab, Shift+Tab, type-ahead) | WCAG 2.1.1 Keyboard. Mouse-only widgets fail. |
| **Focus management** | Focus moves to expected element on open/close/expand/select; restoration on close | WCAG 2.4.3 Focus Order, 2.4.7 Focus Visible. |
| **Focus trap (modal/dialog)** | Tab/Shift+Tab cycles within container; does not escape | Specific to Modal, Dialog. WCAG 2.1.2 No Keyboard Trap inverse — modal MUST trap. |
| **Escape closes overlay AND stops propagation** | Inner Escape does not bubble to ancestor handlers | Already enforced in `Select.test.tsx` lines 78-91. Prevents double-close cascades. |
| **Screen-reader announcement (live region)** | Status/error changes route through `LiveRegion` with correct `aria-live` politeness | WCAG 4.1.3 Status Messages. The whole reason `LiveRegion` exists. |
| **Form-association correctness** | Input components emit a `<label>` with `htmlFor` matching the input `id`; `aria-describedby` points at error/help text | WCAG 1.3.1, 3.3.2. |
| **Error state contract** | `aria-invalid="true"` set on the input; error text rendered in/linked via `aria-describedby`; not announced as label | WCAG 3.3.1 Error Identification. |
| **Required state contract** | `aria-required="true"` AND visible required indicator — not asterisk-only | WCAG 3.3.2 Labels or Instructions. |
| **Reduced motion** | If component animates, animation respects `prefers-reduced-motion` | WCAG 2.3.3 Animation from Interactions. |
| **Touch target size hint** | Interactive elements meet 24x24 CSS px minimum (assert via getBoundingClientRect or rendered styles) | WCAG 2.5.8 Target Size (Minimum) — 2.2 AA. |

### Tier 3: Pattern-Specific — APG Conformance Per Widget Type

These are the WAI-ARIA Authoring Practices Guide patterns. Each complex widget MUST be tested against its published pattern.

#### Combobox (APG: Combobox with Listbox Popup)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/combobox/`

**Required keyboard tests:**
- Down Arrow when collapsed → opens listbox, focus visually on first option (or selected)
- Down/Up Arrow when expanded → moves visual focus through options (uses `aria-activedescendant` pattern, not actual DOM focus)
- Enter → selects option, closes listbox, returns focus to combobox input
- Escape → if listbox open, close and keep input value; if closed, clear input
- Home/End → first/last option (when listbox open)
- Printable characters → filter listbox (autocomplete) OR type-ahead (manual selection)
- Alt+Down → open listbox without moving focus
- Alt+Up → close listbox

**Required ARIA tests:**
- Input has `role="combobox"`, `aria-expanded`, `aria-controls={listboxId}`, `aria-autocomplete` (`list`/`both`/`none`)
- Listbox has `role="listbox"` with `aria-label` or `aria-labelledby`
- Each option has `role="option"`, `aria-selected="true|false"`
- `aria-activedescendant` on input = id of visually focused option

#### DatePicker (APG: Date Picker Dialog pattern)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/` + grid pattern

**Required keyboard tests (in calendar grid):**
- Arrow keys → move one day in grid direction
- Home/End → first/last day of week
- PageUp/PageDown → previous/next month
- Shift+PageUp/PageDown → previous/next year
- Enter/Space → select date, close
- Escape → close without selecting

**Required ARIA tests:**
- Calendar uses `role="grid"`, `aria-labelledby` pointing to "Month YYYY" heading
- Day cells use `role="gridcell"` with `aria-selected`, `aria-current="date"` for today
- Month/year navigation buttons have accessible names (`aria-label="Previous month"`)

#### MultiSelect (APG: Listbox, multi-select)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/listbox/`

**Required keyboard tests:**
- Space → toggle selection of focused option (does NOT move focus)
- Shift+Down/Up → extend selection
- Ctrl+A → select all (if supported)
- Selected count announced via live region after selection change

**Required ARIA tests:**
- `role="listbox"` with `aria-multiselectable="true"`
- Each option has `aria-selected="true|false"` (NOT `aria-checked`)

#### DataTable (APG: Grid pattern, or static table)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/grid/` (interactive) or HTML `<table>` (static)

**Required tests:**
- If sortable: `aria-sort="ascending|descending|none"` on `<th>`, toggles on click AND on Enter/Space when th has `tabindex="0"`
- If selectable rows: `aria-selected` on `<tr>`, keyboard via row navigation
- Caption or `aria-label` describes table purpose
- Column headers have `scope="col"`, row headers `scope="row"`
- If interactive grid: full two-dimensional Arrow key navigation, Home/End for row, Ctrl+Home/End for grid, PageUp/PageDown for paging

#### TreeView (APG: Tree)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`

**Required keyboard tests:**
- Down/Up Arrow → next/previous visible node (skipping collapsed children)
- Right Arrow → if collapsed, expand; if expanded, move to first child; if leaf, no-op
- Left Arrow → if expanded, collapse; if collapsed/leaf, move to parent
- Home/End → first/last visible node in tree
- Enter → activate node (if it has activation behaviour)
- Type-ahead → focus next node whose name starts with typed string
- Asterisk (`*`) → expand all sibling nodes at current level

**Required ARIA tests:**
- Container has `role="tree"`
- Each node has `role="treeitem"` with `aria-expanded` (only on parent nodes), `aria-selected`, `aria-level`, `aria-setsize`, `aria-posinset`
- Child group wrapped in `role="group"`
- Only ONE `treeitem` has `tabindex="0"` at any time (roving tabindex)

#### Accordion / Tabs (APG patterns)

Reference: `https://www.w3.org/WAI/ARIA/apg/patterns/accordion/` and `/tabs/`

- **Tabs:** roving tabindex, Arrow keys move between tabs, Home/End jump, automatic vs manual activation pattern (Enter/Space for manual)
- **Accordion:** Each header is a `<button>` with `aria-expanded`, `aria-controls`. Optional roving down/up between headers.

---

## Per-Component Test Scope Matrix

Legend: TS = Table Stakes | DIFF = Differentiator categories from Tier 2 | APG = Pattern-specific from Tier 3

| Component | TS | axe | Roles | ARIA state | ARIA refs | ID-uniq | Keyboard | Focus mgmt | Form-assoc | Live region | APG pattern | Est. test count |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Button** | yes | yes | yes | aria-pressed, aria-disabled, aria-busy | aria-describedby (loading) | — | Enter, Space | — | — | — | Button | 8-10 |
| **FormField** | yes | yes | yes | aria-invalid, aria-required | label htmlFor, aria-describedby | yes | — | — | error to live | — | Form labelling | 12-15 |
| **Modal** | yes | yes | dialog, alertdialog | aria-modal | aria-labelledby, aria-describedby | yes | Tab cycle, Esc | trap + restore | — | — | Dialog (Modal) | 12-15 |
| **Checkbox** | yes | yes | checkbox | aria-checked (incl. mixed) | label, aria-describedby | yes | Space | — | yes | — | Checkbox | 10-12 |
| **RadioGroup** | yes | yes | radiogroup, radio | aria-checked | aria-labelledby (group), label per radio | yes | Arrow keys (roving), Tab into group | roving tabindex | yes | — | Radio Group | 12-14 |
| **Combobox** | yes | yes | combobox, listbox, option | aria-expanded, aria-selected, aria-autocomplete | aria-controls, aria-activedescendant | yes | Full APG matrix | combobox-listbox dance | yes | optional | Combobox | 18-22 |
| **DatePicker** | yes | yes | dialog, grid, gridcell | aria-selected, aria-current | aria-labelledby month | yes | Arrow, Home/End, PgUp/Dn, Shift+PgUp/Dn | trap in popup | yes | month change | Date Picker Dialog | 18-22 |
| **MultiSelect** | yes | yes | listbox, option | aria-multiselectable, aria-selected | aria-activedescendant | yes | Space toggle, Shift+Arrow extend | — | yes | selection count | Listbox (multi) | 14-18 |
| **DataTable** | yes | yes | table or grid, columnheader, rowheader | aria-sort, aria-selected | aria-describedby caption | — | Sort via Enter/Space; if grid: 2D nav | — | — | sort change | Grid / Table | 14-18 |
| **Pagination** | yes | yes | navigation | aria-current="page" | aria-label="Pagination" | — | Enter on page link | — | — | page change | Navigation landmark | 8-10 |
| **Card** | yes | yes | article or region (if labelled) | — | aria-labelledby (heading) | — | if interactive: Enter/Space | — | — | — | — | 5-7 |
| **TreeView** | yes | yes | tree, treeitem, group | aria-expanded, aria-selected, aria-level, aria-setsize, aria-posinset | — | yes | Full APG tree matrix | roving tabindex | — | — | Tree View | 18-22 |
| **ProgressBar** | yes | yes | progressbar | aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext | aria-labelledby | — | — | — | yes (if status) | — | Meter / Progress | 6-8 |
| **Skeleton** | yes | yes | — (presentational) | aria-busy on parent, aria-hidden on skeleton | — | — | — | — | optional | reduced-motion | — | 4-6 |
| **HelpText** | yes | yes | — | — | id targeted by aria-describedby | yes | — | — | — | — | — | 4-6 |
| **Accordion** | yes | yes | button (header), region (panel) | aria-expanded | aria-controls | yes | Enter, Space, optional Arrow | — | — | — | Accordion | 10-14 |
| **Tabs** | yes | yes | tablist, tab, tabpanel | aria-selected, aria-controls | aria-labelledby (panel) | yes | Arrow, Home/End, manual vs auto | roving tabindex | — | — | Tabs | 14-18 |
| **Heading** | yes | yes | heading (h1-h6) | aria-level if non-native | — | — | — | — | — | — | Heading semantics | 5-7 |
| **ErrorSummary** | yes | yes | alert or region | tabindex=-1 receives focus | aria-labelledby title; each link to field id | — | Enter on link to focus field | focus on mount | — | yes on mount | Error Summary (GOV.UK pattern) | 10-12 |
| **SkipLink** | yes | yes | link | — | href targets existing id | — | Tab to visible; Enter to jump | scroll/focus target | — | — | Bypass Blocks WCAG 2.4.1 | 6-8 |
| **Switch** | yes | yes | switch | aria-checked | label | yes | Space, optional Enter | — | yes | — | Switch | 8-10 |
| **Breadcrumbs** | yes | yes | navigation | aria-current="page" on last | aria-label="Breadcrumb" | — | — | — | — | — | Breadcrumb | 6-8 |
| **NavigationMenu** | yes | yes | navigation, menubar/menu, menuitem | aria-expanded, aria-haspopup | aria-controls submenu | yes | Arrow horizontal/vertical, Esc, type-ahead | roving tabindex | — | — | Menubar / Disclosure Nav | 16-20 |

**Estimated total new tests: ~250-300 across 22 components.**

---

## Priority Recommendation: Tackle These 7 First

Rationale weights: (a) form-critical (used in every accessibility statement form), (b) most-mounted (appears in nearly every page built with the library), (c) highest regression-prone (complex state), (d) currently broken/risky (CONCERNS.md flags), (e) blocks downstream component testing (e.g. FormField wraps Checkbox, RadioGroup, etc.).

| # | Component | Rationale | Why First |
|---|-----------|-----------|-----------|
| 1 | **Button** | (b) Most-mounted by far. Foundation primitive. Loading/disabled states regress quietly. | Lowest LOC-to-coverage ratio. Quick win, builds momentum, validates the test pattern works on simple primitives. |
| 2 | **FormField** | (a) (e) Wraps every form input. Owns the label-input-error-help-text id linkage that drives 40% of axe failures in form-heavy apps. | Without FormField tests, all input-component tests sit on quicksand. WCAG 1.3.1, 3.3.1, 3.3.2 all flow through here. |
| 3 | **Modal** | (b) (c) (d) Full focus-trap + restore + Esc-stop-propagation. CONCERNS.md classifies modal regressions as the #1 a11y bug class. Distinct from existing Dialog (different API surface). | Focus-trap regressions ship silently. Modal is the highest-stakes "looks fine, screen-reader trapped" component. |
| 4 | **Checkbox** | (a) (c) Tri-state (`mixed`) is commonly broken. Form-critical. | Tri-state checkbox is a known footgun. Required for "select all" patterns in MultiSelect/DataTable downstream. |
| 5 | **RadioGroup** | (a) (c) Roving tabindex + Arrow navigation is the most-frequently-broken APG pattern in the wild. | Required for sector selection (public/private) in AccessibilityStatement consumer flows. Sets the roving-tabindex test pattern reused by Tabs/TreeView/NavigationMenu. |
| 6 | **ErrorSummary** | (a) (d) GOV.UK-pattern component, focus-on-mount + link-to-field semantics. Existing field has known fragility (it relies on consumer-supplied IDs matching). | Used at the top of every form to surface errors. Failure mode = inaccessible error reporting, which IS the WCAG 3.3.1 failure the library promises to prevent. Self-undermining if broken. |
| 7 | **Tabs** | (b) (c) Roving tabindex + manual-vs-automatic activation is APG's classic "developers get this wrong" pattern. | Establishes the Tier-3 APG-pattern test template that Combobox/TreeView/NavigationMenu inherit. Better to nail the pattern on Tabs (simpler) before tackling Combobox (hardest). |

**Deferred to Phase 2 (after the seven above):** Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu — the five complex APG widgets. Group them together so the same engineer/session builds APG-pattern muscle memory.

**Deferred to Phase 3 (lowest ROI, can ship without):** Card, Skeleton, HelpText, Heading, ProgressBar, Pagination, Breadcrumbs, SkipLink, Switch, Accordion — simpler primitives whose failure modes are visible (rendering wrong) rather than silent (accessibility broken).

---

## Anti-Features — Patterns to Explicitly NOT Test

These are testing practices that look like coverage but actively harm the suite. The existing Dialog/Select tests already avoid all of them — codify the discipline.

| Anti-Pattern | Why Avoid | What To Do Instead |
|--------------|-----------|--------------------|
| **Snapshot tests on rendered HTML** | Snapshots break on every styling tweak; reviewers blanket-update them; the snapshot becomes write-only. They assert nothing meaningful about behaviour. | Assert specific roles, ARIA attributes, and structural relationships. If you can't write the assertion, you don't know what the test is checking. |
| **Selecting by CSS class** (`.querySelector('.hd-btn-primary')`) | Couples tests to internal styling. Refactoring class names becomes a multi-day exercise. | Use `getByRole`, `getByLabelText`, `getByText`. CSS classes are an implementation detail. |
| **Testing internal React state** (`wrapper.state('isOpen')`) | Couples tests to component internals. Cannot survive refactor to hooks or compound components. The user never observes state directly. | Test observable outputs: rendered DOM, ARIA attributes, callback invocations. If `isOpen` is true, `role="dialog"` should be in the DOM — assert that. |
| **Testing internal hook return values** | Same as above — implementation detail. | Render the hook through a component and test the rendered output. |
| **Brittle `data-testid` on every leaf element** | Encourages testing structure rather than behaviour. Leaks test-only attributes to production HTML. | Use `data-testid` ONLY on test-harness wrappers (see Dialog.test.tsx `data-testid="opener"`), never on library components themselves. |
| **Asserting className strings exactly** (`expect(el.className).toBe('hd-btn hd-btn-primary')`) | Order-dependent, breaks when Tailwind/cva adds utilities. | Assert class membership: `expect(el.classList.contains('hd-btn-primary')).toBe(true)`. Or skip — class names are not user-observable behaviour. |
| **`waitFor` without a clear assertion target** | Hides race conditions, leads to flaky tests with arbitrary timeouts. | Use `findBy*` queries (built-in async wait) or `waitFor(() => expect(...).toBe(...))` with a specific assertion. |
| **Mocking the component under test** | Tautological — you're testing the mock. | If the component has a hard-to-test dependency, refactor to inject it. Mock the dependency, not the subject. |
| **`fireEvent.click` on non-button elements without keyboard equivalent test** | A test that passes with `fireEvent.click` on a `<div>` proves the component fails WCAG 2.1.1 (Keyboard). The test gives false confidence. | Always pair click tests with Enter/Space keydown tests. If only click works, the component is broken — fix the component, don't accept the gap. |
| **One mega-test with 20 assertions** | When it fails, you have no idea which assertion broke. | One behaviour per `it()`. Test names form readable specification. |
| **Testing what React already tests** (e.g. "calls useState") | Wastes lines, tests the framework not your code. | Test what your component contributes on top of React. |
| **Testing CSS computed styles for visual appearance** | jsdom does not implement layout. Computed styles are unreliable. Visual regressions belong in Playwright/Chromatic, not unit tests. | Reserve visual checks for E2E. Unit tests assert semantic structure and behaviour. |

---

## Pattern Library: Three Reusable Test Helpers To Build First

Before writing 22 component test files, extract these three helpers. They appear in every Tier-2 differentiator and would otherwise be copy-pasted 22 times.

### 1. `expectNoAxeViolations(container)`
Wraps `vitest-axe` (or `axe-core/react`) call. Configures the rule set to match what the engine itself uses (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`). Single import for every test file.

### 2. `expectUniqueIds(container, selector)`
Mirrors the pattern from `Dialog.test.tsx` lines 49-71 — mount twice, assert all generated IDs differ AND each resolves to exactly one element. Currently inlined; extract once.

### 3. `expectKeyboardSequence(element, keys, expectations)`
Drives a keyboard sequence with `fireEvent.keyDown` and runs an assertion after each key. Removes the boilerplate from APG keyboard-matrix tests, which are otherwise the most repetitive code in the suite.

These three helpers also become the project's testing "documentation" — anyone reading `Button.test.tsx` sees `expectNoAxeViolations`, `expectUniqueIds`, and immediately understands the test grammar.

---

## Sources

- **Existing test patterns (canonical for this project):**
  - `packages/components/src/Dialog/Dialog.test.tsx` — establishes ID-uniqueness, focus-restoration, initialFocusRef patterns
  - `packages/components/src/Select/Select.test.tsx` — establishes APG keyboard matrix, aria-activedescendant, Escape-stops-propagation patterns
- **WAI-ARIA Authoring Practices Guide (W3C):** `https://www.w3.org/WAI/ARIA/apg/patterns/` — authoritative for every Tier-3 pattern reference. APG is actively maintained by W3C ARIA WG.
- **WCAG 2.2 Success Criteria (W3C Recommendation):** `https://www.w3.org/TR/WCAG22/` — referenced criteria (1.3.1, 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7, 2.5.8, 3.3.1, 3.3.2, 4.1.2, 4.1.3) drive Tier-2 categories.
- **CONCERNS.md "Test Coverage Gaps":** `D:\a11y-hd-project\.planning\codebase\CONCERNS.md` lines 328-352 — confirms the 22-component gap and assigns High priority.
- **PROJECT.md milestone scope:** `D:\a11y-hd-project\.planning\PROJECT.md` lines 103-119 — confirms Button, FormField, Modal, Checkbox, RadioGroup as the milestone's named priorities, validating five of the seven items in the priority list.

**Confidence:** HIGH on Tier 1 and Tier 2 categories (directly evidenced in repo). HIGH on APG patterns (W3C-stable). HIGH on priority list (4 of 7 explicitly named in PROJECT.md, remaining 3 derived from observed CONCERNS.md risk weighting). MEDIUM on per-component test counts (estimates based on category counts × component complexity; actual counts will vary ±30%).
