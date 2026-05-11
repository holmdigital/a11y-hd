# Phase 24: Complex APG Widget Test Coverage — Research

**Researched:** 2026-05-11
**Domain:** WAI-ARIA APG conformance testing for 6 complex widgets (React 18 + Vitest 4 + jsdom + userEvent v14 + axe-core direct)
**Confidence:** HIGH for source-state findings (read every file); HIGH for APG spec contracts (W3C-published); MEDIUM for jsdom-specific test-timing nuances (training + Phase 22 PITFALLS).

## Summary

Phase 24 ships Tier-1 + Tier-2 test files for six widgets. After reading each component's source on 2026-05-11, the codebase splits cleanly into **three implementation tiers**, not the two CONTEXT.md describes:

1. **Substantive APG implementations** (test the contract for real): TreeView, Combobox.
2. **Partial implementations** (test what's there, no-throw the rest): MultiSelect, NavigationMenu.
3. **Pure stubs** (D-01 RadioGroup pattern): DataTable, DatePicker.

Three findings change the planner's input shape and require explicit flagging — they are NOT covered by CONTEXT.md and the planner must decide how to handle them:

- **CONTEXT.md is wrong about LiveRegion usage.** None of Combobox, DatePicker, or MultiSelect render `<LiveRegion>` in source. The ROADMAP success criteria reference "live-region results count" (Combobox), "selected-date live-region" (DatePicker), "selection count live-region" (MultiSelect) — these contracts do not exist in code today. D-05 cannot be implemented as written. See §4 and §Open Questions Q1.
- **NavigationMenu is the APG Disclosure Navigation pattern, not Menubar.** The source explicitly says so in its file-level JSDoc: "This is the disclosure pattern, not the menu/menuitem pattern. Submenu items are plain `<a>` tags inside an `<ul>`, not `role="menuitem"`." The ROADMAP TC-14 criterion "APG menubar pattern (Arrow keys, Home/End, Enter activates, Escape closes submenu)" is half-aligned: only ArrowDown-opens + Escape-closes are implemented. See §1.6 / §3.6 / §Open Questions Q2.
- **DataTable is less of a stub than CONTEXT.md implies.** It DOES carry `scope="col"`, `aria-sort`, sortable `<button>` headers, sort toggle on Enter/Space (via native button semantics). The gap is purely cell-wise arrow-key navigation. The Tier-1 surface is non-trivial. See §3.4.

**Primary recommendation:** Six plans as locked by D-02. For Combobox/TreeView use real `expectKeyboardSequence` assertions; for MultiSelect/NavigationMenu test what exists + no-throw the gaps; for DataTable/DatePicker apply D-01 RadioGroup pattern as planned. For live-region tests, replace D-05 assertions with "live region absent — documented gap, TC-09-LIVE / TC-10-LIVE / TC-11-LIVE deferred" — request planner confirmation before drafting.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 — Stub-component strategy: Phase 22 RadioGroup pattern.** DataTable (TC-12) and DatePicker (TC-10) get no-throw asserts + JSDoc `Implementation note` + TC-12-IMPL / TC-10-IMPL backlog items for v0.7.
- **D-02 — Plan shape: 6 plans, one per component, all parallel.** Plans 24-01..24-06, no inter-plan dependencies, run in Wave 1 via worktrees. No plan touches `package.json`.
- **D-03 — Each test file ships with axe-clean smoke.** One `expectNoAxeViolations()` call against typical-render. Not per Tier-2 keyboard state.
- **D-04 — Test file structure mirrors `Button.test.tsx` template.** WCAG-SC JSDoc header → imports from `_test/helpers` → Tier 1 describe → Tier 2 describe. D-02a gate enforced (0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot`). Budget ~10-20 `it()` per file, stubs at the lower end (~8-12).
- **D-05 — Live-region testing pattern.** Region exists with `role="status"` or `aria-live="polite"`; region content updates on state change; use `waitFor` for async cases; assert content not announcement timing.

### Claude's Discretion

- WCAG-SC selection per file (1.3.1 / 2.1.1 / 2.4.3 / 2.4.7 / 4.1.2 / 4.1.3 mix — planner picks per widget).
- Stub-vs-real keyboard assertions for partial-implementation widgets (MultiSelect, NavigationMenu) — researcher recommends per §3 coverage maps.
- Test-count exact distribution within the 10-20 budget.

### Deferred Ideas (OUT OF SCOPE)

- TC-12-IMPL — DataTable APG grid keyboard handler (v0.7).
- TC-10-IMPL — DatePicker APG dialog-grid keyboard handler (v0.7).
- Real-browser axe-core run (PUB-07) — v0.7+.
- Storybook visual regression — blocked on esbuild upstream patch.
- MutationObserver-driven announcement timing tests — jsdom can't replicate.
- Tier 3 production-realism suites — v0.7+.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TC-09 | Combobox APG combobox-with-listbox-popup contract; live-region results count; axe-clean | §1.1 keyboard matrix; §2.1 ARIA crib sheet; §3.1 coverage map (source FULLY implements); §4 live-region — **GAP, requires planner decision** |
| TC-10 | DatePicker APG dialog-grid; selected-date live-region; axe-clean | §1.2 keyboard matrix; §2.2 ARIA crib sheet; §3.2 coverage map (PURE STUB — native `<input type="date">`); §4 live-region — **GAP** |
| TC-11 | MultiSelect listbox-multi (`aria-multiselectable`, `aria-selected` NOT `aria-checked`); chip keyboard; live-region count; axe-clean | §1.3 keyboard matrix; §2.3 ARIA crib sheet; §3.3 coverage map (PARTIAL — `aria-multiselectable` MISSING, `aria-selected` HARDCODED FALSE); §4 live-region — **GAP** |
| TC-12 | DataTable APG grid + sortable headers; axe-clean | §1.4 keyboard matrix; §2.4 ARIA crib sheet; §3.4 coverage map (PARTIAL — `scope`/`aria-sort`/sortable buttons present; cell-arrow nav absent) |
| TC-13 | TreeView APG tree; axe-clean | §1.5 keyboard matrix; §2.5 ARIA crib sheet; §3.5 coverage map (SUBSTANTIVE — typeahead + asterisk-expand MISSING; otherwise full) |
| TC-14 | NavigationMenu APG menubar; axe-clean | §1.6 keyboard matrix; §2.6 ARIA crib sheet; §3.6 coverage map (DISCLOSURE pattern, not menubar — **requirement mismatch**) |

## Project Constraints (from CLAUDE.md)

- TypeScript strict mode. Use `interface` for public APIs, `type` for unions.
- Each package has `src/`, `dist/`, `package.json`, `README.md`. Tests colocated next to component file.
- No source modifications in Phase 24 (test-only scope per CONTEXT.md).
- WCAG-SC JSDoc marker required in first 30 lines; enforced by `npm run test:wcag-headers`.
- `@holmdigital/components` is at 2.3.0, unchanged in this phase (no version bump needed unless Phase 26 requires it).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| APG keyboard contract assertion | Test-runtime (jsdom + userEvent v14) | — | Phase 22 settled this; userEvent fires KeyboardEvents jsdom honours up to the documented exceptions (§5) |
| ARIA-attribute presence | Test-runtime (`getByRole` / `getAttribute`) | — | RTL queries enforce role-based discovery; never touch className/querySelector |
| Axe-clean validation | Test-runtime (axe-core direct via `_test/axe.ts`) | — | Phase 22 helper; no per-test `configureAxe`, 11 rules pre-disabled |
| Live-region content assertion | Test-runtime (`getByRole('status')` + `waitFor`) | — | LiveRegion uses `aria-live="polite"` + visually-hidden div; queryable when the component renders one (NOT the case today for any of the 6) |
| Source implementation of missing APG behaviors | DEFERRED to v0.7 (out of phase) | — | D-01 stub pattern; backlog items TC-12-IMPL, TC-10-IMPL plus new TC-09-LIVE / TC-11-LIVE if planner confirms §Open Q1 |

## Standard Stack

### Core (already installed by Phase 22)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | 4.0.16 | Test runner | Phase 22 baseline; CLAUDE.md confirms 4.x safe to use |
| @testing-library/react | (Phase 22 baseline) | DOM-driven React rendering | Forces accessible-name queries; matches D-02a anti-pattern gate |
| @testing-library/user-event | v14 | Keyboard / pointer simulation | Phase 22 baseline; `userEvent.keyboard('{ArrowDown}')` is the canonical APG pattern |
| @testing-library/jest-dom | (Phase 22 baseline) | `toBeInTheDocument`, `toBeDisabled`, `toHaveAttribute` | jest-dom matchers wired in `_test/setup.ts` |
| axe-core | (Phase 22 baseline) | A11y violation scanner | Direct usage via `_test/axe.ts` — `@chialab/vitest-axe` 0.19.x ships only the matcher, NOT `configureAxe` |
| @chialab/vitest-axe | 0.19.x | `toHaveNoViolations` matcher | See note above; do NOT use chaance/vitest-axe |

### Supporting (already in `_test/`)

| File | Purpose | When to Use |
|------|---------|-------------|
| `_test/setup.ts` | 7 jsdom polyfills + matcher wiring | Implicit (auto-loaded) |
| `_test/axe.ts` | `expectNoAxeViolations(container)` with 11 disabled rules | One Tier-1 smoke per test file (D-03) |
| `_test/helpers.ts` | `expectUniqueIds`, `expectKeyboardSequence` | Every test file imports from here, NEVER from `vitest-axe` directly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `userEvent.keyboard('{ArrowDown}')` | `fireEvent.keyDown(el, { key: 'ArrowDown' })` | `fireEvent` is the escape hatch when userEvent's focus model fights us (see §5). Default to userEvent. |
| `expectKeyboardSequence(steps)` | Inline `await user.keyboard(...)` + `expect(document.activeElement).toBe(...)` | Helper is cleaner for 3+ step sequences; inline is fine for 1-2 steps. Both are acceptable in Phase 22. |
| `getByRole('status')` for live region | `getByText` / `getByLabelText` | `getByRole('status')` matches `aria-live="polite"` per ARIA-in-HTML mapping. LiveRegion ships `aria-live="polite"` + `aria-atomic="true"` so `getByRole('status')` resolves. CONFIRMED via `LiveRegion.test.tsx`. |

**Installation:** No new packages. Phase 22 + Phase 23 already installed everything.

## Architecture Patterns

### System Architecture Diagram

```
                                    Phase 24 Test Architecture

  Test File (e.g. Combobox.test.tsx)
       │
       │ imports
       ├─→  React component (../Combobox)
       ├─→  expectNoAxeViolations, expectUniqueIds  (../_test/helpers)
       │       │
       │       └─→ axe-core (configured via _test/axe.ts, 11 disabled rules)
       │
       └─→  @testing-library/{react, user-event}
                │
                ├─→  render(<Component />) → jsdom DOM
                ├─→  screen.getByRole(...) → accessible-name lookup
                ├─→  userEvent.keyboard('{ArrowDown}') → synthetic KeyboardEvent
                └─→  axe.run(container) → AxeResults → toHaveNoViolations()

  Tier 1 describe block:           Tier 2 describe block:
   - mounts                         - axe-clean smoke (1x)
   - role present                   - keyboard matrix per APG
   - ARIA attributes present        - focus management
   - controlled / uncontrolled      - state transitions
   - props passthrough              - id uniqueness (2x mount)
                                    - (Combobox/MultiSelect) live-region — see §4
```

### Recommended Project Structure

```
packages/components/src/
├── Combobox/
│   ├── Combobox.tsx
│   └── Combobox.test.tsx        ← NEW (24-01)
├── DatePicker/
│   ├── DatePicker.tsx
│   └── DatePicker.test.tsx      ← NEW (24-02)
├── MultiSelect/
│   ├── MultiSelect.tsx
│   └── MultiSelect.test.tsx     ← NEW (24-03)
├── DataTable/
│   ├── DataTable.tsx
│   └── DataTable.test.tsx       ← NEW (24-04)
├── TreeView/
│   ├── TreeView.tsx
│   └── TreeView.test.tsx        ← NEW (24-05)
└── NavigationMenu/
    ├── NavigationMenu.tsx
    └── NavigationMenu.test.tsx  ← NEW (24-06)
```

### Pattern 1: WCAG-SC JSDoc header (mandatory)

```tsx
// Source: packages/components/TESTING-CONVENTIONS.md §"WCAG SCs Covered Header"
// @vitest-environment jsdom
/**
 * WCAG SCs covered:
 * - 1.3.1 Info and Relationships — <ul role="listbox"> wires options to combobox via aria-controls
 * - 2.1.1 Keyboard — ArrowDown/Up/Home/End/Enter/Escape APG matrix
 * - 2.4.3 Focus Order — focus stays on input; aria-activedescendant ranges over options
 * - 4.1.2 Name, Role, Value — role="combobox", aria-expanded, aria-controls, aria-activedescendant
 * - 4.1.3 Status Messages — (DEFERRED: live-region not implemented in source; TC-09-LIVE)
 *
 * Implementation note: see §3.1 of 24-RESEARCH.md — Combobox FULLY implements APG keyboard
 * including Home/End/PageUp/PageDown beyond the strict APG required set.
 */
```

### Pattern 2: Tier 1 / Tier 2 describe split (mandatory)

```tsx
// Source: packages/components/TESTING-CONVENTIONS.md §"Tier Grammar"
describe('Tier 1: Table Stakes', () => { /* mount, role, props passthrough */ });
describe('Tier 2: A11y Differentiators', () => { /* APG keyboard, ARIA, axe, ids */ });
```

### Pattern 3: APG keyboard sequence

```tsx
// Source: packages/components/src/Tabs/Tabs.test.tsx — Phase 22 template
const user = userEvent.setup();
render(<Combobox label="Fruit" options={OPTIONS} onChange={() => {}} />);
const input = screen.getByRole('combobox', { name: /fruit/i });
input.focus();
await user.keyboard('{ArrowDown}'); // opens listbox
expect(screen.getByRole('listbox')).toBeInTheDocument();
expect(input).toHaveAttribute('aria-expanded', 'true');
await user.keyboard('{ArrowDown}'); // focuses option 0 via aria-activedescendant
expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
```

### Pattern 4: D-01 RadioGroup no-throw stub

```tsx
// Source: packages/components/src/RadioGroup/RadioGroup.test.tsx
it('ArrowDown / ArrowRight do not crash on a focused gridcell (APG grid keyboard deferred — TC-12-IMPL)', async () => {
    const user = userEvent.setup();
    render(<DataTable data={DATA} columns={COLUMNS} caption="Demo" />);
    const firstCell = screen.getAllByRole('cell')[0];
    firstCell.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');
    // Native <td> does not accept tabindex by default; the no-throw assertion is
    // that the table still renders and the component is in a sane state.
    expect(screen.getByRole('table')).toBeInTheDocument();
});
```

### Anti-Patterns to Avoid

- **`querySelector` for content discovery** — D-02a gate. Use `getByRole`/`getByLabelText`/`getByText`.
- **Per-test `configureAxe`** — D-04 forbids; rule disable list lives in `_test/axe.ts` only.
- **`toMatchSnapshot` on JSX trees** — locks structure, rots on refactor. D-02a gate.
- **Asserting announcement *timing*** — D-05 explicitly forbids. Assert region *content* after `waitFor`.
- **`fireEvent.click` without paired keyboard** — D-02a gate. Every clickable widget gets Space/Enter equivalence.
- **Inline `await user.keyboard()` for a 5-step sequence** — use `expectKeyboardSequence` helper for readability.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Axe-clean assertion | Per-test `configureAxe` + rule list | `expectNoAxeViolations(container)` | D-04 / D-02a — drift causes inconsistent CI signal |
| Keyboard event dispatch | `new KeyboardEvent(...)` + `dispatchEvent` | `userEvent.keyboard('{ArrowDown}')` | userEvent owns the focus model + IME + repeat semantics; raw events skip them |
| ID uniqueness check | Hand-rolled `Map` scan in each test | `expectUniqueIds(container)` | Helper throws on duplicates with the offending id surfaced |
| Multi-step keyboard chain | 5+ inline `await user.keyboard()` calls | `expectKeyboardSequence([{key, expectFocusOn}, ...])` | Reads as a contract; failure message names the failing step |
| Date-picker calendar UI | Hand-built grid + month nav | Native `<input type="date">` | DatePicker.tsx already does this; OS owns the dialog. APG dialog-grid contract is "deferred to v0.7" per D-01 |

**Key insight:** Phase 22 paid the upfront cost of three helpers + the axe-core direct-usage workaround. Phase 24 must consume them, never rebuild them. The temptation in keyboard-heavy widgets is to write raw KeyboardEvent dispatch when userEvent appears to "not work" — the fix in 95% of cases is to focus the right element first (§5), not to escape to fireEvent.

## Runtime State Inventory

Phase 24 is test-only scope (no source edits, no data migrations). Categories below are all "None" by phase shape:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — test files don't touch persistence | None |
| Live service config | None — no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | `packages/components/dist/` is tracked in git but unchanged by Phase 24 (test files excluded from tsup entries). Phase 26 will handle dist hygiene. | None for Phase 24 |

## Common Pitfalls

### Pitfall 1: `screen.getByRole('listbox')` throws before the listbox is open
**What goes wrong:** Test renders `<Combobox>`, queries `getByRole('listbox')` immediately, fails — listbox is conditionally rendered when `isOpen === true`.
**Why it happens:** Combobox (and MultiSelect) only render the `<ul role="listbox">` inside an `{isOpen && ...}` block.
**How to avoid:** Either (a) drive the keyboard or click to open before querying, or (b) use `screen.queryByRole('listbox')` and assert `null` for the closed state.
**Warning signs:** `Unable to find an accessible element with the role "listbox"` — go check the source's conditional render.

### Pitfall 2: `aria-activedescendant` is on the INPUT, not the option
**What goes wrong:** Test asserts the focused option has `aria-current` or `[focused]` styling; actually focus stays on the input and the *input's* `aria-activedescendant` attribute names the active option's id.
**Why it happens:** APG combobox pattern keeps real focus on the input for typeahead; the listbox uses virtual focus via `aria-activedescendant`.
**How to avoid:** Assert `input.getAttribute('aria-activedescendant') === expectedOptionId` and assert the option with that id is in the DOM.
**Warning signs:** `document.activeElement` is still the input even after `{ArrowDown}` — that's correct, not a bug. The activedescendant moves, not the focus.

### Pitfall 3: jsdom doesn't process `<input type="date">` keyboard like a browser
**What goes wrong:** A test on DatePicker tries `await user.keyboard('{ArrowDown}')` expecting the day to change; nothing happens; test asserts the original value, passes, and gives false confidence.
**Why it happens:** `<input type="date">` in jsdom is a plain `<input>` — no calendar dropdown, no key handling. The browser-OS does that.
**How to avoid:** For DatePicker tests, restrict assertions to: (1) the input renders with `type="date"`, (2) `aria-invalid` toggles with `error`, (3) `aria-describedby` resolves to description/error. No-throw asserts for {ArrowDown}/{Home}/{End}/{PageUp}/{PageDown}/{Escape} per D-01.
**Warning signs:** A DatePicker test that asserts a specific selected date after a keypress is almost certainly testing nothing real.

### Pitfall 4: `userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')` modifier syntax
**What goes wrong:** Combobox APG calls for `Alt+ArrowDown` to open and `Alt+ArrowUp` to close-and-keep-selection. Naïve `await user.keyboard('{Alt}{ArrowDown}')` fires Alt and ArrowDown separately, not as a combo.
**Why it happens:** userEvent v14 requires `{Modifier>}key{/Modifier}` syntax for sustained modifier presses.
**How to avoid:** Use `await user.keyboard('{Alt>}{ArrowDown}{/Alt}')`. **HOWEVER** — see §3.1: Combobox source does NOT distinguish Alt+ArrowDown from plain ArrowDown. The handler reads `e.key === 'ArrowDown'` only. Testing the Alt-modifier path against current source would just be a duplicate ArrowDown assertion; defer it to a TC-09-IMPL backlog item or omit.

### Pitfall 5: `requestAnimationFrame` defers focus in NavigationMenu trigger
**What goes wrong:** Test fires `{ArrowDown}` on a NavigationMenu trigger, immediately checks the first dropdown link is focused, assertion fails.
**Why it happens:** `NavigationMenu.tsx:88` uses `requestAnimationFrame(() => firstLink?.focus())` to defer focus until the dropdown is mounted.
**How to avoid:** Use `await waitFor(() => expect(firstLink).toHaveFocus())` instead of immediate `expect`. jsdom polyfills rAF as `setTimeout(fn, 0)`.
**Warning signs:** Flaky test — sometimes passes, sometimes fails. Always wrap in `waitFor`.

### Pitfall 6: TreeView `useEffect` focus shift competes with `userEvent` focus
**What goes wrong:** TreeView calls `nodeRefs.current.get(focusedId)?.focus()` in a `useEffect`. After `await user.keyboard('{ArrowDown}')`, the test asserts `document.activeElement` is the next item — but the assertion races the effect.
**Why it happens:** `useEffect` is async after React commit. `userEvent.keyboard` awaits act() flushes, so the effect SHOULD complete before the await resolves — but only if the test doesn't read `document.activeElement` synchronously in the same microtask.
**How to avoid:** Use the helper's `expectFocusOn: () => screen.getByRole('treeitem', { name: /target/i })` form, which is evaluated AFTER the await. Avoid capturing element references before the keypress.
**Warning signs:** "expected focus on DIV#null but was DIV#previous" — the effect ran but the test captured the wrong moment.

### Pitfall 7: Combobox `Escape` calls `e.stopPropagation()`
**What goes wrong:** A test wraps `<Combobox>` in a `<Modal>`-like portal; presses Escape; expects the modal to close; modal stays open because Combobox swallows the event.
**Why it happens:** `Combobox.tsx:159` calls `e.stopPropagation()` on Escape to prevent ancestor handlers (e.g. Dialog) from also closing. This is deliberate (it's a feature). Same pattern in NavigationMenu `handleKeyDown`.
**How to avoid:** Test Escape behavior in isolation; do NOT wrap the widget in an outer Dialog for the keyboard test. Document the stop-propagation as a Tier-2 assertion if planner wants it pinned ("Escape does not propagate when Combobox is open").

## Per-Widget APG Keyboard Matrix (§1)

This is the load-bearing reference for all 6 plans. Each row is the W3C APG-required keystroke; "Source implements" reflects what the file actually does on 2026-05-11.

### §1.1 Combobox (with listbox popup, manual selection)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/> [CITED]

| Key | APG-required action | Source implements? | Test type |
|-----|---------------------|---------------------|-----------|
| ArrowDown (closed) | Open listbox; focus first option | YES (lines 133-136) | real assertion |
| ArrowDown (open) | Move activedescendant to next option, wrap to first | YES (lines 139-144, wraps) | real assertion |
| ArrowUp (closed) | Open listbox; focus last option (APG); source focuses first | PARTIAL (opens; wraps to last on next press) | real assertion + note divergence |
| ArrowUp (open) | Move activedescendant to prev option, wrap to last | YES (lines 145-150) | real assertion |
| Home (open) | Move to first option | YES (lines 170-175) | real assertion |
| End (open) | Move to last option | YES (lines 176-181) | real assertion |
| PageDown (open) | Move down 10 (or visible-page) | YES (lines 182-187, jumps 10) | real assertion |
| PageUp (open) | Move up 10 | YES (lines 188-193) | real assertion |
| Enter | Select focused option; close listbox | YES (lines 151-156) | real assertion |
| Escape | Close listbox; reset input to selected value | YES (lines 157-169); stops propagation | real assertion + see Pitfall 7 |
| Tab | Close listbox; allow Tab to leave widget | YES (lines 194-196) | real assertion |
| Typeahead (letters) | Filter listbox to matching options | YES via `handleInputChange` filtering | real assertion (type 'b', assert filtered list) |
| Alt+ArrowDown | Open listbox without moving focus | NO (handler treats Alt+ArrowDown same as ArrowDown) | OMIT — or no-throw + TC-09-IMPL note |
| Alt+ArrowUp | Close listbox, keep selection | NO | OMIT or no-throw |

### §1.2 DatePicker (APG dialog-grid)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#examples> + Date Picker Dialog [CITED]

**Source reality:** native `<input type="date">`. NONE of the APG dialog-grid keystrokes (Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown/Enter/Escape on the calendar grid) apply because there is no calendar grid. The OS provides the picker; jsdom provides nothing.

| Key | APG-required action | Source implements? | Test type |
|-----|---------------------|---------------------|-----------|
| ArrowLeft/Right | Day -/+ 1 in calendar grid | NO (no grid) | no-throw (D-01) |
| ArrowUp/Down | Week -/+ 1 | NO | no-throw |
| Home/End | Start/end of week | NO | no-throw |
| PageUp/PageDown | Month -/+ 1 | NO | no-throw |
| Shift+PageUp/PageDown | Year -/+ 1 | NO | no-throw |
| Enter/Space (on day) | Select day, close dialog | NO | no-throw |
| Escape | Close dialog without selecting | NO | no-throw |

All 7 keystrokes collapse to a single no-throw test or one parametrised `it.each` over all keys. Document gap → TC-10-IMPL.

### §1.3 MultiSelect (listbox-multi + chip removal)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#examples-listbox> (multi-select listbox) + Tag/Chip pattern [CITED]

| Key | APG-required action | Source implements? | Test type |
|-----|---------------------|---------------------|-----------|
| ArrowDown / ArrowUp on input | Open listbox, move activedescendant | YES (lines 80-89) | real assertion |
| Enter on focused option | Add to selection, clear input, keep popup behavior per source | YES (lines 90-95, but closes popup — APG says popup stays open for multi) | real assertion + note divergence |
| Space | APG: toggle selection without moving focus | NO (source has no Space handler on the input — Space inserts literal space char) | OMIT or no-throw with note |
| Shift+ArrowDown/Up | Extend selection to next/prev | NO | no-throw + TC-11-IMPL |
| Shift+Home/End | Extend selection to bounds | NO | no-throw |
| "A" key | Toggle all | NO (optional in APG) | OMIT |
| Escape | Close popup | YES (lines 96-98) | real assertion |
| Backspace (empty input) | Remove last chip | YES (lines 99-103) | real assertion |
| Delete on a focused chip | Remove that chip | NO (chips don't take focus — they're `<span>` with a remove `<button>`) | OMIT — instead test the remove-button keyboard activation |
| Click chip remove `<button>` | Remove chip + focus returns to input | YES (lines 68-71) | real assertion |
| Enter/Space on chip remove button | Activate remove (native `<button>` semantics) | YES (native) | real assertion + paired keyboard per D-02a |

### §1.4 DataTable (APG grid)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/grid/> [CITED]

**Source reality:** `scope="col"` on every `<th>`, `aria-sort` on sortable columns, sortable header is a native `<button>` (so it accepts Enter/Space and is focusable by Tab). NO cell tabindex, NO arrow-key cell nav.

| Key | APG-required action | Source implements? | Test type |
|-----|---------------------|---------------------|-----------|
| ArrowRight/Left | Move focus cell -/+ 1 | NO | no-throw (D-01) |
| ArrowDown/Up | Move focus row -/+ 1 | NO | no-throw |
| Home / End | First / last cell in row | NO | no-throw |
| Ctrl+Home / Ctrl+End | First / last cell in table | NO | no-throw |
| PageUp / PageDown | Row -/+ visible page | NO | no-throw |
| Tab to header | Header `<button>` receives focus | YES (native) | real assertion |
| Enter / Space on header button | Toggle sort (none→ascending→descending) | YES via native button click handler (lines 144-149, 61-67) | real assertion |
| (verify `aria-sort` flips) | `aria-sort="ascending"` then `"descending"` on subsequent Enter | YES | real assertion |

### §1.5 TreeView (APG tree, single-select, roving tabindex)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/treeview/> [CITED]

| Key | APG-required action | Source implements? | Test type |
|-----|---------------------|---------------------|-----------|
| ArrowDown | Focus next visible treeitem | YES (lines 67-74) | real assertion |
| ArrowUp | Focus prev visible treeitem | YES (lines 75-82) | real assertion |
| ArrowRight (collapsed parent) | Expand | YES (lines 84-86) | real assertion |
| ArrowRight (expanded parent) | Move to first child | YES (lines 87-92) | real assertion |
| ArrowRight (leaf) | No-op | YES (falls through) | real assertion (no crash) |
| ArrowLeft (expanded parent) | Collapse | YES (lines 96-98) | real assertion |
| ArrowLeft (collapsed / leaf) | Move to parent | YES (lines 99-106) via `findParent` recursion | real assertion |
| Home | Focus first visible treeitem | YES (lines 109-115) | real assertion |
| End | Focus last visible treeitem | YES (lines 116-122) | real assertion |
| Enter | Select + toggle expand if has children | YES (lines 123-132) | real assertion |
| Space | Same as Enter | YES (combined case clause `case ' '`) | real assertion (paired with Enter per D-02a) |
| Typeahead (letters) | Focus next matching item | NO | no-throw OR omit — flag TC-13-IMPL backlog |
| Asterisk `*` | Expand all siblings at this level | NO | no-throw OR omit — flag TC-13-IMPL |
| Roving tabindex (single tabindex=0) | Only focused item has tabIndex=0 | YES (line 174: `tabIndex={focusedId === node.id ? 0 : -1}`) | real assertion (parametrised) |

### §1.6 NavigationMenu (APG Disclosure Navigation, NOT Menubar)

W3C APG ref: <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#examples> — Disclosure Navigation Menu [CITED]

**Source explicitly documents** (file JSDoc, lines 26-28): "This is the disclosure pattern, not the menu/menuitem pattern."

| Key | APG (Disclosure) action | Source implements? | Test type |
|-----|------------------------|---------------------|-----------|
| Tab / Shift+Tab | Between top-level items + into open submenu | YES (native button + anchor focus order) | real assertion |
| Enter on trigger | Toggle submenu | YES via `onClick={() => setIsOpen(!isOpen)}` (line 122) | real assertion |
| Space on trigger | Toggle submenu (native button Space=click) | YES (native) | real assertion (paired with Enter per D-02a) |
| ArrowDown on closed trigger | Open submenu, focus first item | YES (lines 82-92) — uses `requestAnimationFrame` (see Pitfall 5) | real assertion via `waitFor` |
| Escape | Close submenu, return focus to trigger | YES (lines 73-79) | real assertion |
| ArrowRight/Left between top-level | (APG-Menubar only; NOT required for Disclosure) | NO | OMIT — not an APG-Disclosure requirement |
| ArrowDown/Up within submenu | (APG-Menubar only) | NO | OMIT |
| Home/End | (APG-Menubar only) | NO | OMIT |

**Critical:** TC-14 ROADMAP criterion says "APG menubar pattern". The source is APG-Disclosure. Either (a) accept that the source ships Disclosure and re-scope TC-14 to assert the Disclosure contract, OR (b) treat the gap as TC-14-IMPL backlog. See §Open Questions Q2.

## Per-Widget ARIA Attribute Crib Sheet (§2)

### §2.1 Combobox (verified against source lines 280-303, 312-318, 325-332)

| Element | Required attributes | Source provides? |
|---------|---------------------|------------------|
| `<input>` | `role="combobox"`, `aria-expanded` (bool), `aria-controls=<listboxId>`, `aria-activedescendant` (string\|undef), `aria-autocomplete="list"`, `aria-haspopup="listbox"` | YES, all present |
| `<input>` | `aria-invalid` if error | YES |
| `<input>` | `aria-describedby` chaining description + error | YES |
| `<label>` | `htmlFor` matches input `id` | YES |
| `<ul role="listbox">` | `id`, `aria-label` | YES |
| `<li role="option">` | `id="${id}-option-${index}"`, `aria-selected` | YES |
| Live region | `role="status"` or `aria-live="polite"` with results count | **NO — not rendered** |

### §2.2 DatePicker (source lines 84-110)

| Element | APG-Dialog-Grid would require | Source provides |
|---------|------------------------------|-----------------|
| Trigger | n/a (no trigger — native input) | — |
| `role="dialog"` calendar wrapper | required | NOT rendered (no dialog) |
| `role="grid"` calendar | required | NOT rendered |
| `role="row"` weeks | required | NOT rendered |
| `role="gridcell"` days with `aria-selected` + `aria-current="date"` for today | required | NOT rendered |
| `<input>` | `aria-invalid`, `aria-describedby`, native `type="date"` | YES |
| `<label htmlFor>` | links to input | YES |
| Live region | `role="status"` for selected-date | **NO — not rendered** |

### §2.3 MultiSelect (source lines 219-258, 266-289)

| Element | APG listbox-multi requires | Source provides |
|---------|---------------------------|-----------------|
| `<input>` | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-haspopup="listbox"` | YES |
| `<ul role="listbox">` | `role="listbox"`, **`aria-multiselectable="true"`** | YES `role="listbox"`; **NO `aria-multiselectable`** (gap — ROADMAP explicitly calls it out) |
| `<li role="option">` | `aria-selected` reflecting selection state | **`aria-selected={false}` is HARDCODED** (line 278) — never reflects true. Filtered options exclude already-selected (line 56), so options in the popup are by definition not selected. APG still expects the attribute to be present per spec. PARTIAL pass. |
| Chip `<span>` | (No required role; chip is a presentational token + remove button) | YES, with `aria-label="Remove X"` on the button |
| Chip remove `<button>` | accessible name | YES (`aria-label="Remove ${label}"`) |
| Live region | `role="status"` for selection count | **NO — not rendered** |

### §2.4 DataTable (source lines 129-179)

| Element | APG grid + table-semantics requires | Source provides |
|---------|------------------------------------|-----------------|
| `<table>` | role implicit | YES |
| `<caption>` | accessible name | YES |
| `<th scope="col">` | scope | YES (line 136) |
| `<th scope="row">` | scope for row headers | **NO** — no first-column row-header support; all rows render `<td>` |
| `aria-sort` on sortable headers | `"ascending"|"descending"|"none"` | YES (line 137) — undefined when not the sorted column (APG accepts this; `"none"` would also be valid) |
| `<button>` for sortable header | accessible name + Enter/Space activation | YES (lines 145-158) |
| `role="grid"` + `role="row"` + `role="gridcell"` (for full APG grid) | required for grid-keyboard widgets | **NO** — pure `<table>` semantics, no grid roles. Acceptable for static table; APG grid keyboard is the gap. |

### §2.5 TreeView (source lines 164-202, 239-281)

| Element | APG tree requires | Source provides |
|---------|------------------|-----------------|
| `<ul role="tree">` | top-level container | YES (line 223) |
| `aria-label` on tree | accessible name | YES |
| `<li role="none">` | structural, not semantic | YES |
| `<div role="treeitem">` | each item | YES |
| `aria-expanded` on parent items | `true|false`, **omitted on leaves** | YES (line 171 / 246: `hasChildren ? isExpanded : undefined`) |
| `aria-selected` | selection state | YES (line 172 / 247) |
| `aria-level` | nesting depth (1-based) | YES — but only `1` at root and `level` parameter in `renderTree` (recursion starts at 2). |
| `tabIndex` (roving) | exactly one `0`, rest `-1` | YES (line 174 / 249) |
| `role="group"` | for child `<ul>` | YES (line 158: `<ul role="group">`) |

### §2.6 NavigationMenu (source lines 32-43, 117-165)

| Element | APG Disclosure Navigation requires | Source provides |
|---------|----------------------------------|-----------------|
| `<nav>` | landmark | YES |
| `aria-label` on nav | accessible name | YES (default "Main Navigation") |
| `<ul>` of items | structural | YES |
| Trigger `<button>` | `aria-expanded`, `aria-haspopup="true"` (or `"menu"`), `aria-controls=<dropdownId>` | YES — `aria-haspopup="true"` (boolean-string; APG accepts this) |
| Dropdown `<ul>` | `id` referenced by `aria-controls` | YES |
| Dropdown items | plain `<a>` (Disclosure pattern) — NOT `role="menuitem"` | YES — plain `<a>` |
| Caret SVG | `aria-hidden="true"` | YES (line 137) |

**If the ROADMAP-stated APG Menubar were the contract**, the source would need: `role="menubar"` on the `<ul>`, `role="menuitem"` on every `<button>`/`<a>`, submenu `role="menu"`, `aria-haspopup="menu"`. None of these are present — by design.

## Per-Widget Implementation Coverage Map (§3)

### §3.1 Combobox — SUBSTANTIVE / FULL

Implements full APG single-select combobox with listbox popup, including OPT-IN extras (Home/End/PageUp/PageDown beyond minimum). Aria attributes complete. Two divergences from strict APG:
- ArrowUp-when-closed focuses first option (APG: last). Document, do not block.
- Alt+ArrowDown/Up not distinguished. Omit or backlog TC-09-IMPL.

**Live-region: NOT RENDERED.** TC-09 success criterion "live-region for results count" cannot be tested. Recommend: TC-09-LIVE backlog item; assert region absence as a documented gap with `// IMPL note` JSDoc.

### §3.2 DatePicker — PURE STUB

Native `<input type="date">`. No calendar grid, no dialog, no APG-grid keyboard, no live region. Tier-1 surface: `type="date"`, `aria-invalid`, `aria-describedby` chain, label wiring, axe-clean. Tier-2 surface: all APG keystrokes → no-throw. Live region: NOT RENDERED — TC-10-LIVE backlog.

### §3.3 MultiSelect — PARTIAL

Has combobox-input + dropdown listbox + chip removal. **Gaps:**
- `aria-multiselectable="true"` is missing (ROADMAP explicitly requires it)
- `aria-selected` on options hardcoded to `false`
- Space-to-toggle is missing (Space types a space character)
- Shift+Arrow extend is missing
- Live region NOT RENDERED

**Recommendation:** test what's there (combobox role, listbox role, popup behavior, chip removal, Backspace-removes-last-chip, Escape-closes), no-throw the rest. Add TC-11-IMPL backlog covering aria-multiselectable + Space-toggle + Shift+Arrow + live region.

### §3.4 DataTable — STUB-BUT-NOT-BARE

Has `<caption>`, `scope="col"`, `aria-sort`, sortable header buttons with Enter/Space activation, sort-toggle state machine. Lacks `role="grid"`, cell-arrow nav, `scope="row"`.

**Recommendation:** Tier-1 hits all the real semantics (caption, headers, sort buttons, rendering rows). Tier-2 keyboard: Enter/Space on sort button = REAL assertion (this is the only place keystrokes do something). All cell-nav keystrokes = no-throw. Backlog: TC-12-IMPL.

### §3.5 TreeView — SUBSTANTIVE / NEAR-FULL

Implements ArrowUp/Down/Left/Right/Home/End/Enter/Space + roving tabindex + aria-expanded/aria-selected/aria-level. **Gaps:** typeahead, asterisk-expand. These are APG-OPTIONAL (typeahead) and APG-OPTIONAL (asterisk-expand) — the spec marks them "should" not "must". Recommendation: omit both from Tier-2 (or single no-throw), do NOT create a backlog item unless the planner wants strict APG compliance.

**Note on duplication:** TreeView source has the root render duplicated inline with the recursive `renderTree`. Tests should pass against the inline path; don't be confused by the apparent dead code.

### §3.6 NavigationMenu — DISCLOSURE PATTERN (mismatched to ROADMAP)

The source ships APG-Disclosure-Navigation, not APG-Menubar. Tests should assert the Disclosure contract: trigger button with `aria-expanded`/`aria-haspopup="true"`/`aria-controls`, Enter/Space toggles, ArrowDown opens + focuses first link, Escape closes + returns focus. Submenu items are plain `<a>` — NOT `role="menuitem"`.

**Recommendation:** plan 24-06 tests the Disclosure contract; the test file's WCAG-SC JSDoc explicitly notes "this widget is the APG Disclosure Navigation pattern, not Menubar; TC-14-IMPL would convert it to Menubar if v0.7 chooses to."

## §4 Live-Region Implementation Reality Check

**Verified by `Grep "LiveRegion|aria-live"` across `packages/components/src/`:**
- `LiveRegion.tsx` exists, ships `aria-live="polite"` + `aria-atomic="true"` on a visually-hidden `<div>` (no explicit `role`, but the ARIA-in-HTML mapping makes `aria-live="polite"` queryable via `getByRole('status')`).
- `Toast.tsx` uses `aria-live` directly (not LiveRegion).
- `ErrorSummary` uses `role="alert"` (implicit assertive live region).
- **Combobox.tsx, DatePicker.tsx, MultiSelect.tsx import NONE of these.** Live regions are NOT rendered.

**What this means for D-05:** the assertion shape D-05 prescribes (`getByRole('status')`, `waitFor`, content matching) is correct *technically* but matches nothing in the current source. Three options for the planner:

1. **(Recommended)** Treat the live-region requirement for TC-09/10/11 as a documented gap. Each test file's JSDoc notes "live-region NOT IMPLEMENTED IN SOURCE — TC-XX-LIVE deferred to v0.7." No live-region `it()` block. Wave 1 unblocked.
2. **Adjust source in Phase 24 (would violate "test-only scope" constraint).** Add `<LiveRegion>` to Combobox/MultiSelect (DatePicker requires the calendar dialog first, so skip). Adds 6 LOC × 2 files. NOT recommended — breaks the locked constraint.
3. **Use the existing announcement-via-`role="alert"` in Combobox error path as a proxy.** Combobox already renders `<div role="alert">` for the error prop (line 306). Test the error-alert region for that case only. Doesn't satisfy the "results count" / "selection count" intent but covers the WCAG 4.1.3 surface. Marginal value.

If the planner picks (1), update D-05 to "live-region tests OMITTED until source implements live region — TC-09-LIVE / TC-10-LIVE / TC-11-LIVE added to backlog." See §Open Questions Q1.

**Live-region query pattern (when source HAS one, e.g. Toast tests):**

```tsx
// Source: packages/components/src/LiveRegion/LiveRegion.test.tsx (Phase 22)
const { container } = render(<LiveRegion message="Search results updated" />);
const region = container.firstElementChild as HTMLElement;
expect(region.getAttribute('aria-live')).toBe('polite');
expect(region.textContent).toBe('Search results updated');
// For async updates from a parent state change:
await waitFor(() => expect(region).toHaveTextContent(/updated/));
```

## §5 userEvent v14 vs fireEvent Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| Single key on focused element | `userEvent.keyboard('{ArrowDown}')` | Default; respects focus model, fires keydown+keyup+input correctly |
| Modifier combos (Alt+Down, Shift+PageUp) | `userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')` | v14 syntax for sustained modifier. **None of the 6 widgets actually distinguish modifiers in their handlers** (verified — all read `e.key` only). Don't bother testing modifier combos unless source upgrades. |
| Multi-step sequence with focus assertions | `expectKeyboardSequence([{key, expectFocusOn}, ...])` | Helper failure message names step + expected element |
| Element doesn't accept focus but you need to fire a keydown on it (e.g., `<td>` no tabindex) | `fireEvent.keyDown(td, { key: 'ArrowDown' })` | Escape hatch — `<td>` can't be focused so userEvent has nothing to target. Use sparingly; pair with a comment explaining why. |
| Click on a `<button>` | `userEvent.click(btn)` | Fires the full pointer sequence + focus + click |
| Native HTML radio group ArrowDown | Use either; jsdom doesn't simulate native radio movement anyway | RadioGroup test pattern: no-throw, see RadioGroup.test.tsx lines 125-153 |

**Phase 22 PITFALL §3.3 reference:** RadioGroup used `fireEvent.keyDown` once because userEvent v14's auto-focus behavior was fighting the test. In Phase 24, the equivalent escape-hatch case is **DataTable cells**: `<td>` is not focusable by default, so `userEvent.keyboard` on the table won't dispatch to the cell. Use `fireEvent.keyDown(cell, { key: 'ArrowDown' })` for the no-throw stub — comment the why.

## §6 Typeahead Testing Strategy

Two of our widgets list typeahead in APG:
- **Combobox** — implemented as input-filter (every keystroke filters `availableOptions`). Test by typing a letter and asserting the listbox now shows only matching options.
- **TreeView** — NOT implemented. No typeahead handler in TreeView source.

**Concrete Combobox typeahead test:**

```tsx
const user = userEvent.setup();
render(<Combobox label="Fruit" options={[
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
    { value: 'c', label: 'Cherry' },
]} onChange={() => {}} />);
const input = screen.getByRole('combobox', { name: /fruit/i });
input.focus();
await user.keyboard('ba');
// Listbox now open + filtered
const options = screen.getAllByRole('option');
expect(options).toHaveLength(1);
expect(options[0]).toHaveTextContent(/banana/i);
```

**TreeView typeahead:** OMIT. Source has no debounced char accumulator. If tested at all, single no-throw: `await user.keyboard('a')` after focusing a treeitem; assert tree still renders.

**Fake-timer note:** Phase 22 setup does NOT install vitest fake timers globally. If a future TreeView typeahead lands, the test will need `vi.useFakeTimers()` + `vi.advanceTimersByTime(...)` to simulate the debounce reset. Phase 24 does not need this — typeahead is filter-based in Combobox (synchronous on input).

## §7 Axe-Clean Expectations Per Widget

Run `expectNoAxeViolations(container)` against a typical-render. The 11 disabled rules (`_test/axe.ts`) cover the jsdom + page-chrome cases. **Expected outcomes per widget:**

| Widget | Typical-render axe expectation | Specific risks |
|--------|-------------------------------|---------------|
| Combobox | CLEAN | None — label/htmlFor, listbox-only-when-open, aria-controls resolved are all fine |
| DatePicker | CLEAN | None — native `<input>` + label is the simplest case |
| MultiSelect | CLEAN | Watch for the `<input>` placeholder swap; chips have buttons with accessible names |
| DataTable | CLEAN | Caption present; `scope="col"` present; button-in-header has accessible name from text content |
| TreeView | CLEAN | Watch for unique ids if the same `data` is rendered twice — `nodeRefs` keyed by user-provided `node.id` so consumer-supplied non-unique ids would fail `expectUniqueIds`. Test with unique ids. |
| NavigationMenu | LIKELY CLEAN | `aria-haspopup="true"` (boolean-string) is fine per ARIA. Caret SVG has `aria-hidden="true"`. |

**No per-widget axe rule overrides needed.** If a Tier-1 smoke fails, treat as a real source bug (D-03 spawns fix-in-place).

**Color-contrast** is globally disabled (jsdom has no layout). Real-browser coverage = PUB-07, deferred to v0.7+.

## §8 Per-File Skeleton (Plan-Consumable)

Each skeleton names ONE `describe`-block-pair + per-`it()` purpose. Planner expands into PLAN.md tasks.

### 24-01 Combobox.test.tsx (target ~14 tests)

```
WCAG SCs: 1.3.1, 2.1.1, 2.4.3, 4.1.2 (omit 4.1.3 — live-region deferred)

Tier 1: Table Stakes
  - mounts with role="combobox"
  - renders label wired via htmlFor (1.3.1)
  - passes className through additively
  - controlled value preselects input text
  - typing fires the filter (input value changes, listbox opens)
  - description + error wire into aria-describedby

Tier 2: A11y Differentiators
  - aria-expanded=false when closed, true when open
  - aria-controls resolves to a real <ul role="listbox"> element when open
  - ArrowDown opens listbox and moves aria-activedescendant
  - ArrowUp wraps from -1 to last (one-press-to-open + wrap-on-prev)
  - Home / End jump activedescendant to bounds
  - Enter selects focused option, closes listbox, calls onChange with value
  - Escape closes listbox without selecting and resets input
  - typeahead filters options ('ba' → only Banana)
  - axe-clean for typical render
  - two Comboboxes render with no duplicate ids
```

### 24-02 DatePicker.test.tsx (target ~10 tests, stub-mode)

```
WCAG SCs: 1.3.1, 2.1.1, 4.1.2 (omit 4.1.3, 2.4.3)
Implementation note: APG dialog-grid keyboard contract NOT implemented in source
(native <input type="date">). Tier-2 keyboard tests are no-throw stubs per D-01.
Backlog: TC-10-IMPL (APG dialog-grid handler), TC-10-LIVE (selected-date region).

Tier 1: Table Stakes
  - mounts with input type="date"
  - label wired via htmlFor
  - forwards ref to the input
  - passes className through additively
  - description renders + wires into aria-describedby
  - error renders with role="alert" + wires into aria-describedby
  - aria-invalid="true" when error set

Tier 2: A11y Differentiators
  - APG dialog-grid keystrokes do not throw (no-throw matrix: Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown/Enter/Escape)
  - axe-clean for default render
  - axe-clean for error state
  - two DatePickers render with no duplicate ids
```

### 24-03 MultiSelect.test.tsx (target ~14 tests)

```
WCAG SCs: 1.3.1, 2.1.1, 2.4.3, 4.1.2 (omit 4.1.3 — live-region deferred)
Implementation note: aria-multiselectable + Space-toggle + Shift+Arrow extend
NOT implemented in source. Tier-2 covers what exists; remainder no-throw.
Backlog: TC-11-IMPL, TC-11-LIVE.

Tier 1: Table Stakes
  - mounts with role="combobox" input + <ul role="listbox">-on-open
  - selected items render as chips with remove buttons
  - passes className through
  - controlled selected[] renders correct chips
  - onChange fires with new selected[] when option clicked

Tier 2: A11y Differentiators
  - listbox renders when opened by ArrowDown; aria-expanded flips
  - chip remove <button> has aria-label="Remove <label>"
  - clicking chip remove fires onChange with chip removed + focus returns to input
  - Enter/Space on chip remove button activates remove (paired keyboard per D-02a)
  - Backspace on empty input removes last chip
  - Escape closes the listbox
  - APG-gap keystrokes do not throw (Space-toggle, Shift+ArrowDown/Up — no-throw)
  - axe-clean for default render
  - axe-clean for with-selection render
  - two MultiSelects render with no duplicate ids
```

### 24-04 DataTable.test.tsx (target ~12 tests, partial-stub)

```
WCAG SCs: 1.3.1, 2.1.1, 4.1.2 (omit 4.1.3, 2.4.3)
Implementation note: APG grid cell-arrow keyboard NOT implemented in source
(table semantics + sortable button headers present). Tier-2 covers sort
toggle; cell-nav keystrokes are no-throw. Backlog: TC-12-IMPL.

Tier 1: Table Stakes
  - mounts a <table> with the supplied caption
  - renders one <th scope="col"> per column
  - renders one <tr> per row with cells matching accessor / render
  - passes className through on outer wrapper
  - column.render override fires for cells that supply one

Tier 2: A11y Differentiators
  - sortable column header renders as a <button> with the header text as accessible name
  - clicking sortable header sets aria-sort="ascending" on the th
  - clicking same header again sets aria-sort="descending"
  - Enter on focused sort button fires the same sort (paired with Space per D-02a)
  - cell-arrow keystrokes do not throw on a focused cell (Arrow/Home/End/PageUp/PageDown/Ctrl+Home/Ctrl+End — no-throw stub via fireEvent.keyDown per §5)
  - axe-clean for default render
  - axe-clean for a sorted state
```

### 24-05 TreeView.test.tsx (target ~15 tests)

```
WCAG SCs: 1.3.1, 2.1.1, 2.4.3, 4.1.2

Tier 1: Table Stakes
  - mounts with role="tree" + aria-label
  - renders one role="treeitem" per visible node
  - passes className through on container
  - clicking a node selects it (aria-selected) and toggles expand on parents
  - onSelect fires with the clicked node

Tier 2: A11y Differentiators
  - aria-expanded omitted on leaf items
  - aria-expanded reflects expand state on parent items
  - aria-level is 1 on roots
  - roving tabindex: focused item tabIndex=0, all others tabIndex=-1
  - ArrowDown moves focus to next visible treeitem
  - ArrowUp moves focus to prev visible treeitem
  - ArrowRight on collapsed parent expands; on expanded parent moves to first child
  - ArrowLeft on expanded parent collapses; on collapsed leaf moves to parent
  - Home / End focus first / last visible treeitem
  - Enter selects + toggles expand on parents (paired with Space per D-02a)
  - axe-clean for default render
```

### 24-06 NavigationMenu.test.tsx (target ~12 tests)

```
WCAG SCs: 1.3.1, 2.1.1, 4.1.2
Implementation note: source implements APG-Disclosure-Navigation, not APG-Menubar.
TC-14 ROADMAP wording mismatches the source pattern; assertions match the
Disclosure contract. Backlog: TC-14-IMPL (convert to Menubar) if v0.7 desired.

Tier 1: Table Stakes
  - mounts as <nav aria-label> with default "Main Navigation"
  - renders top-level items: anchors when no children, buttons when children
  - passes className through additively
  - clicking a leaf <a> follows the href (smoke: anchor is in the DOM with the href)
  - clicking a trigger toggles aria-expanded

Tier 2: A11y Differentiators
  - trigger button carries aria-expanded + aria-haspopup="true" + aria-controls
  - aria-controls resolves to the dropdown <ul>
  - Enter / Space on trigger toggles aria-expanded (paired keyboard per D-02a)
  - ArrowDown on closed trigger opens dropdown and focuses first <a> (waitFor — rAF defer)
  - Escape closes the dropdown and returns focus to the trigger
  - caret SVG carries aria-hidden="true"
  - axe-clean for default closed render
  - axe-clean for open dropdown render
```

## Test File Structure Budget

Per D-04 the budget is 10-20 `it()` per file. Above skeletons sum to:
- Combobox: 14 (in range)
- DatePicker: 10 (at floor; appropriate for pure stub)
- MultiSelect: 14 (in range)
- DataTable: 12 (in range; appropriate for partial stub)
- TreeView: 15 (in range)
- NavigationMenu: 12 (in range)

Total Phase 24 = **77 new tests**, raising 21 files / 307 tests → 27 files / 384 tests. Within Phase 22-23 budget and CI runtime envelope.

## Code Examples (template snippets per widget)

### Combobox typeahead + Enter-selects + Escape-resets

```tsx
// Source: APG combobox pattern + Combobox.tsx lines 132-198
it('typing filters listbox, Enter selects, Escape resets', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={OPTIONS} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: /fruit/i }) as HTMLInputElement;
    input.focus();
    await user.keyboard('b');
    // Listbox open + filtered to Banana
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(opts[0]).toHaveTextContent(/banana/i);
    // ArrowDown moves activedescendant
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-option-0$/);
    // Enter selects
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('b');
    expect(input).toHaveAttribute('aria-expanded', 'false');
});
```

### TreeView roving tabindex + ArrowDown sequence

```tsx
// Source: APG tree pattern + TreeView.tsx
it('roving tabindex: only focused item tabIndex=0; ArrowDown moves focus', async () => {
    const user = userEvent.setup();
    render(<TreeView data={DATA} />);
    const items = screen.getAllByRole('treeitem');
    expect(items[0].tabIndex).toBe(0);
    items.slice(1).forEach(i => expect(i.tabIndex).toBe(-1));

    items[0].focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(document.activeElement).toBe(items[1]));
    expect(items[1].tabIndex).toBe(0);
    expect(items[0].tabIndex).toBe(-1);
});
```

### D-01 no-throw stub for DataTable cell-nav

```tsx
// Source: D-01 RadioGroup pattern
it('cell-arrow keystrokes do not throw (APG grid keyboard deferred — TC-12-IMPL)', () => {
    render(<DataTable data={DATA} columns={COLUMNS} caption="Demo" />);
    const cells = screen.getAllByRole('cell');
    // <td> is not focusable; use fireEvent.keyDown directly (§5 escape hatch)
    expect(() => {
        fireEvent.keyDown(cells[0], { key: 'ArrowDown' });
        fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
        fireEvent.keyDown(cells[0], { key: 'Home' });
        fireEvent.keyDown(cells[0], { key: 'End' });
        fireEvent.keyDown(cells[0], { key: 'PageUp' });
        fireEvent.keyDown(cells[0], { key: 'PageDown' });
    }).not.toThrow();
    expect(screen.getByRole('table')).toBeInTheDocument();
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `configureAxe` from chaance/vitest-axe | Direct `axe.run` + `axe.configure` from axe-core (`_test/axe.ts`) | Phase 22 (2025-Q4) | Package switched to `@chialab/vitest-axe` 0.19.x which omits `configureAxe` — Phase 22 PITFALLS §1.4 |
| `userEvent.keyboard('{Alt}{ArrowDown}')` (split keys) | `userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')` (sustained modifier) | userEvent v14 syntax | Modifier combos require explicit hold-release |
| `data-testid` on library components | accessible-name queries (`getByRole`, `getByLabelText`) | Phase 22 D-02a | Tests fail-fast on accessibility regressions instead of selector breakage |
| `toMatchSnapshot` for JSX trees | Behavioral assertions (`toHaveAttribute`, `toHaveFocus`) | Phase 22 D-02a | Snapshots locked structure not behavior — rotted on every refactor |

**Deprecated/outdated:**
- Reaching into internal state via `.instance()` or hook internals — banned by D-02a.
- Per-test `configureAxe` calls — banned by D-04.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | userEvent v14 `{Alt>}{ArrowDown}{/Alt}` syntax for sustained modifier press | §5, Pitfall 4 | [ASSUMED — training data] If syntax has changed in v14.x patch releases, modifier tests would silently fire wrong events. Mitigation: planner can simply OMIT modifier tests because no source widget distinguishes modifiers. |
| A2 | `getByRole('status')` resolves to elements with `aria-live="polite"` (ARIA-in-HTML mapping) | §2.1, §4 | [VERIFIED via LiveRegion.test.tsx grep] — Phase 22 LiveRegion tests use this query shape. Confidence HIGH. |
| A3 | jsdom polyfills `requestAnimationFrame` as `setTimeout(fn, 0)` so `waitFor` resolves the rAF deferred focus | Pitfall 5 | [ASSUMED — common knowledge / Phase 22 patterns] If jsdom skipped the polyfill, NavigationMenu's ArrowDown test would hang. Phase 22 setup adds a polyfill list — verify the planner's first test run resolves rAF; if not, use `vi.advanceTimersByTime` (requires fake timers). |
| A4 | Axe-core typical-render emits no violations for any of the 6 widgets with the 11 pre-disabled rules | §7 | [ASSUMED — extrapolation from Phase 22's clean Button/Tabs/Modal] If MultiSelect's hardcoded `aria-selected={false}` triggers an axe rule, the smoke fails and the planner spawns fix-in-place. Low risk — `aria-selected` boolean is valid ARIA. |
| A5 | All 6 widgets are mountable in jsdom without runtime errors | All sections | [ASSUMED — none have heavy browser-API dependencies; LiveRegion is NOT imported by any of them so the LiveRegion TS2503 deferred issue is irrelevant here] |

**Confirm assumptions before locking the planner output.** A1 + A3 are the only ones with non-trivial mitigation; both have documented fallbacks in this file.

## Open Questions

1. **Live regions are not in source for Combobox / DatePicker / MultiSelect — how should the planner handle the ROADMAP "live-region" success criteria?**
   - What we know: ROADMAP TC-09/10/11 and CONTEXT.md D-05 assume the components render a live region. They do not (verified by grep).
   - What's unclear: Whether the user wants (a) accept the gap + create 3 new backlog items (TC-09-LIVE / TC-10-LIVE / TC-11-LIVE), or (b) re-scope Phase 24 to add the source change, or (c) declare the live-region success criteria already covered by `<LiveRegion>` existing in the package even though it's not wired.
   - **Recommendation: option (a).** Three new backlog items, JSDoc note in each test file, no live-region `it()` blocks. Preserves test-only scope.

2. **NavigationMenu is APG Disclosure, not APG Menubar — does the planner re-scope TC-14 or backlog the upgrade?**
   - What we know: source explicitly documents the Disclosure pattern (file JSDoc line 26). ROADMAP says "APG menubar". The contracts are different (Menubar requires ArrowLeft/Right between top-level items, ArrowUp/Down within submenu, `role="menuitem"`, etc.).
   - What's unclear: Whether the user wants Disclosure-conformant tests now + TC-14-IMPL backlog for Menubar upgrade, or strict Menubar tests + extensive no-throw stubs.
   - **Recommendation: Disclosure-conformant tests now, TC-14-IMPL backlog for Menubar conversion in v0.7.** This matches what the source actually claims to ship.

3. **TreeView typeahead + asterisk-expand are APG-OPTIONAL — backlog or omit silently?**
   - What we know: APG marks both as "may" / "should" not "must". Source omits both.
   - What's unclear: Whether ROADMAP TC-13's specific mention of "Asterisk expands all siblings, type-ahead" elevates them to MUST for Phase 24.
   - **Recommendation: single combined no-throw test ("APG-optional keystrokes do not throw") + TC-13-IMPL backlog item only if user wants strict APG.** Default: omit the backlog.

4. **DataTable `<td>` is not focusable — escape to `fireEvent.keyDown` for the no-throw stub?**
   - What we know: `userEvent.keyboard` requires a focusable target. `<td>` has no `tabindex`.
   - What's unclear: Whether D-02a's "no fireEvent without paired keyboard" applies (it's about `fireEvent.click`, not `fireEvent.keyDown` for accessibility tests).
   - **Recommendation: use `fireEvent.keyDown(cell, { key })` for the cell-nav no-throw stub.** Comment the why inline. Phase 22 RadioGroup PITFALLS §3.3 establishes this escape hatch.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | vitest + tsup | ✓ (assumed — Phase 22 baseline) | ≥18 | — |
| vitest | test runner | ✓ | 4.0.16 (CLAUDE.md) | — |
| @testing-library/react | RTL | ✓ | Phase 22 baseline | — |
| @testing-library/user-event | keyboard sim | ✓ | v14 | — |
| @testing-library/jest-dom | matchers | ✓ | Phase 22 baseline | — |
| axe-core | a11y scan | ✓ | Phase 22 baseline | — |
| @chialab/vitest-axe | matcher | ✓ | 0.19.x | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

No external services, no network, no Docker. Pure node+jsdom test runtime.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.0.16 (jsdom env per-file via `// @vitest-environment jsdom`) |
| Config file | `packages/components/vitest.config.ts` (Phase 22 — assumed in place) |
| Quick run command | `npm run test -w @holmdigital/components -- src/Combobox/Combobox.test.tsx` (per-file during dev) |
| Full suite command | `npm run test -w @holmdigital/components` (chains to `test:ci` which runs `test:wcag-headers` then vitest) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TC-09 | Combobox APG combobox-with-listbox | unit | `npm run test -w @holmdigital/components -- src/Combobox` | ❌ Wave 0 / Plan 24-01 |
| TC-10 | DatePicker APG stub + live-region (gap) | unit | `npm run test -w @holmdigital/components -- src/DatePicker` | ❌ Plan 24-02 |
| TC-11 | MultiSelect listbox-multi partial | unit | `npm run test -w @holmdigital/components -- src/MultiSelect` | ❌ Plan 24-03 |
| TC-12 | DataTable APG grid stub | unit | `npm run test -w @holmdigital/components -- src/DataTable` | ❌ Plan 24-04 |
| TC-13 | TreeView APG tree | unit | `npm run test -w @holmdigital/components -- src/TreeView` | ❌ Plan 24-05 |
| TC-14 | NavigationMenu APG Disclosure (re-scoped from Menubar — see Q2) | unit | `npm run test -w @holmdigital/components -- src/NavigationMenu` | ❌ Plan 24-06 |

### Sampling Rate

- **Per task commit:** `npm run test -w @holmdigital/components -- src/<Component>` (per-file vitest run)
- **Per wave merge:** `npm run test -w @holmdigital/components` (chains `test:wcag-headers` first)
- **Phase gate:** Full suite green before `/gsd-verify-work` — 21 → 27 files, 307 → 384 tests, all green.

### Wave 0 Gaps

- [ ] `packages/components/src/Combobox/Combobox.test.tsx` — covers TC-09
- [ ] `packages/components/src/DatePicker/DatePicker.test.tsx` — covers TC-10
- [ ] `packages/components/src/MultiSelect/MultiSelect.test.tsx` — covers TC-11
- [ ] `packages/components/src/DataTable/DataTable.test.tsx` — covers TC-12
- [ ] `packages/components/src/TreeView/TreeView.test.tsx` — covers TC-13
- [ ] `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` — covers TC-14

No framework installation needed; Phase 22 + 23 already provisioned everything. No new shared fixtures required (each test file builds its own per-component fixtures inline, per Button.test.tsx template).

## Sources

### Primary (HIGH confidence)
- `packages/components/src/Combobox/Combobox.tsx` — read in full
- `packages/components/src/DatePicker/DatePicker.tsx` — read in full
- `packages/components/src/MultiSelect/MultiSelect.tsx` — read in full
- `packages/components/src/DataTable/DataTable.tsx` — read in full
- `packages/components/src/TreeView/TreeView.tsx` — read in full
- `packages/components/src/NavigationMenu/NavigationMenu.tsx` — read in full
- `packages/components/src/LiveRegion/LiveRegion.tsx` — read in full + grep confirms no consumer imports
- `packages/components/src/_test/helpers.ts`, `_test/axe.ts` — read in full
- `packages/components/src/Button/Button.test.tsx`, `Tabs/Tabs.test.tsx`, `RadioGroup/RadioGroup.test.tsx` — read in full as template references
- `packages/components/TESTING-CONVENTIONS.md` — read in full
- `.planning/phases/24-complex-apg-widget-test-coverage/24-CONTEXT.md` — read in full
- `.planning/phases/24-complex-apg-widget-test-coverage/24-DISCUSSION-LOG.md` — read in full
- `.planning/REQUIREMENTS.md` TC-09..14 lines — grepped
- `.planning/ROADMAP.md` Phase 24 entry — read

### Secondary (MEDIUM confidence — cited spec, not freshly fetched this session)
- W3C WAI-ARIA Authoring Practices Guide patterns: combobox / dialog-modal / listbox / grid / treeview / disclosure (CITED — URLs above; training-data citations of stable W3C spec; no version drift expected for APG 1.2)

### Tertiary (LOW confidence — flagged for validation)
- None this session — every assertion above is either source-verified or W3C-spec-cited.

## Metadata

**Confidence breakdown:**
- Source-state coverage maps (§3): **HIGH** — every component file read in full on 2026-05-11.
- APG keyboard matrices (§1) and ARIA crib sheets (§2): **HIGH** for source-verified columns; **MEDIUM** for APG-required columns (W3C spec cited from training, not fetched this session — APG 1.2 is stable, low drift risk).
- Live-region reality check (§4): **HIGH** — direct grep confirms no consumer imports LiveRegion.
- Test-file skeletons (§8): **HIGH** — directly assembled from coverage maps + Phase 22 template.
- userEvent v14 modifier syntax (§5 / Pitfall 4): **MEDIUM** — assumption A1, mitigation documented (modifier tests omittable).
- Axe-clean expectations (§7): **MEDIUM** — assumption A4, smoke-fails-are-real-bugs is the Phase 22 norm.

**Research date:** 2026-05-11
**Valid until:** ~2026-06-10 — APG spec is stable; the only churn risk is userEvent v14 patch updates and source changes to the 6 widgets between now and Phase 24 execution. Re-verify source if more than 30 days pass before plans run.

---

## Final Notes for the Planner

1. **Read §Open Questions first** — three decisions are not covered by CONTEXT.md and need user confirmation before drafting plans: live-region scope (Q1), NavigationMenu pattern mismatch (Q2), TreeView APG-optional behaviors (Q3).
2. **Per-plan skeleton in §8 is plan-ready** — each lists describe-block titles and one-line `it()` purposes. PLAN.md tasks can be 1:1 with the listed `it()`s.
3. **D-01 stub strategy applies to 4 widgets, not 2.** CONTEXT.md says DataTable + DatePicker; researcher confirms MultiSelect + NavigationMenu also have partial gaps best handled with the same no-throw + JSDoc-note + backlog-item pattern. The four backlog items recommended are: TC-12-IMPL (already in CONTEXT), TC-10-IMPL (already in CONTEXT), TC-11-IMPL (new — `aria-multiselectable`, Space-toggle, Shift+Arrow), TC-14-IMPL (new — Menubar conversion). Plus the three live-region backlog items pending Q1.
4. **Update CONTEXT.md** before locking plans: D-05 should reflect Q1's resolution (probably "live-region tests OMITTED — TC-XX-LIVE backlogged"); the per-widget LOC/ARIA-hit table in `## Code Context` should be updated with the partial-stub status for MultiSelect and the Disclosure-not-Menubar finding for NavigationMenu.
