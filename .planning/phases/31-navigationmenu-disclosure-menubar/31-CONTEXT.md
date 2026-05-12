---
phase: 31
name: NavigationMenu Disclosure → Menubar
slug: navigationmenu-disclosure-menubar
date: 2026-05-12
requirements: [TC-14-IMPL]
depends_on: [26]
---

<domain>
NavigationMenu upgrades from APG **Disclosure Navigation Menu** (current shipping behavior — `<button aria-expanded>` trigger, plain `<a>` submenu links inside `<ul>`, Tab/Enter/Space/ArrowDown/Escape) to the W3C APG **Menubar** pattern (`role="menubar"` / `role="menu"` / `role="menuitem"`, single `tabindex="0"` roving across top-level items, Arrow horizontal/vertical, Home/End bounds, Enter activates leaf, Escape closes submenu and returns to trigger, type-ahead first-character buffer with 500 ms timeout). The new pattern is opt-in via a `pattern` prop — existing v0.6 consumers using `<NavigationMenu items={...} />` continue to get Disclosure behavior byte-for-byte. Setting `pattern="menubar"` ships the full APG Menubar contract. NavigationMenu.test.tsx Disclosure tests stay byte-equivalent under a `pattern="disclosure"` describe block; new Menubar tests are added under a parallel `pattern="menubar"` describe block (D-02a-clean: userEvent + toHaveFocus, no fireEvent).
</domain>

<canonical_refs>
- `.planning/ROADMAP.md` — Phase 31 success criteria (#1–#5), backwards-compat decision pointer at L213, TC-14-IMPL requirement
- `.planning/REQUIREMENTS.md` — TC-14 (test scope), TC-14-IMPL (impl scope) — to be quoted in RESEARCH.md
- `.planning/phases/24-tier2-keyboard-stubs/*-CONTEXT.md` — D-02 anti-pattern gate origin (fireEvent allowance documented for Disclosure's focus-parity race)
- `.planning/phases/28-datepicker-apg-dialog-grid/28-02-PLAN.md` — closest precedent for single-`onKeyDown` parent handler + `useRef` stale-closure shadow
- `.planning/phases/29-multiselect-apg-listbox-multi-completeness/29-CONTEXT.md` — precedent for `aria-selected`-like dynamic state attribute on roving items
- `.planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md` — most recent precedent: roving `tabindex="0"`, `Map<string, HTMLElement>` ref registry, `useLayoutEffect` imperative focus, `hasUserMovedRef` mount-guard, Enter/Space delegation to inner control (D-03)
- `packages/components/src/NavigationMenu/NavigationMenu.tsx` — current source (177 lines; Disclosure pattern with `<button aria-expanded>` trigger, `<a>` submenu links, mouseEnter+onFocus open with 200 ms close timeout, Escape closes + stopPropagation)
- `packages/components/src/NavigationMenu/NavigationMenu.test.tsx` — current test file (335 lines; Tier 1 Table Stakes + Tier 2 Disclosure tests; uses `fireEvent` deliberately to bypass jsdom focus-parity race per Phase 24 D-02 exception)
- W3C APG Menubar pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ — canonical reference for keyboard contract and ARIA roles
- W3C APG Disclosure Navigation Menu pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/ — current shipping behavior, preserved under `pattern="disclosure"` default
- `CLAUDE.md` — project conventions (TS strict, MINOR bump for opt-in additive features, @wcag JSDoc markers, å/ä/ö preserved in Swedish text)
</canonical_refs>

<prior_decisions>
**Carried forward from Phase 30 (DataTable APG grid):**
- Roving `tabindex="0"` with a single parent-level `onKeyDown` handler that reads `activeItemRef.current` (NOT the state value — stale-closure trap).
- `Map<string, HTMLElement>` ref registry keyed by stable coordinate strings; `useLayoutEffect` imperative `.focus()` keyed on the active coordinate.
- `hasUserMovedRef` guard to prevent focus-steal on initial mount (table renders but doesn't yank focus to itself).
- Enter/Space on a roving item delegates by directly invoking the underlying action — for DataTable that was `handleSort(accessor)`; here it's either submenu-open (parent item) or native `<a>` link activation (leaf item).
- `data-state="focused"` attribute hook on the currently-roving item (consumer-CSS focus ring; not load-bearing for tests).

**Carried forward from Phase 29 (MultiSelect listbox-multi):**
- Single parent `onKeyDown` (NOT per-item handlers) — events bubble from the focused item to the parent. Phase 29 nailed the pattern; Phase 31 reuses it.

**Carried forward from Phase 28 (DatePicker dialog-grid):**
- Imperative focus via `useLayoutEffect` (NOT `useEffect`) — prevents jsdom flicker and matches real-browser focus timing.

**Carried forward from Phase 24 (D-02 anti-pattern gate exception):**
- `fireEvent.click` / `fireEvent.keyDown` are tolerated in the EXISTING Disclosure test block to bypass jsdom's focus-parity race on hover+focus open. This exception is SCOPED to the legacy Disclosure tests. NEW Menubar tests MUST be D-02a-clean (userEvent + toHaveFocus + toHaveAttribute), zero fireEvent.

**Carried forward from project-level CLAUDE.md / memory:**
- MINOR bump for new opt-in feature (no break) → `@holmdigital/components` 2.4.0 → 2.5.0.
- Swedish characters å/ä/ö preserved in any Swedish-locale strings the menubar might need (none planned for v1; type-ahead is locale-agnostic single-char matching).
</prior_decisions>

<decisions>

### D-01: Backwards-compatibility strategy — opt-in via `pattern` prop (NEW DEFAULT REMAINS DISCLOSURE)
- New prop added to `NavigationMenuProps`:
  ```typescript
  pattern?: 'disclosure' | 'menubar';  // default: 'disclosure'
  ```
- **Default behavior unchanged:** `<NavigationMenu items={...} />` renders the current Disclosure-pattern source byte-for-byte. v0.6 consumers see zero diff in DOM, ARIA, keyboard, hover behavior, or test output.
- **Opt-in:** `<NavigationMenu items={...} pattern="menubar" />` swaps to the new Menubar implementation (separate branch internally — likely a sibling `<Menubar>` sub-component dispatched on the prop).
- **Version bump:** `@holmdigital/components` 2.4.0 → **2.5.0** (MINOR, additive). NO major bump. NO breaking change. NO CHANGELOG migration note required beyond "Added: opt-in `pattern='menubar'`".
- **Test file strategy:** existing Tier 2 describe `'Tier 2: A11y Differentiators (APG Disclosure Navigation per D-06)'` stays byte-equivalent. A NEW sibling describe `'Tier 2: A11y Differentiators (APG Menubar per Phase 31)'` is added below it, exclusively renders `<NavigationMenu pattern="menubar" .../>`.

**Why:** ROADMAP success criterion #3 explicitly invites either option; opt-in is the lowest-risk path that lets v0.6 consumers upgrade to 2.5.0 freely and adopt menubar at their own pace. A future major bump can flip the default to `"menubar"` once consumer feedback has stabilized — that decision is OUT OF SCOPE for Phase 31.

### D-02: Type-ahead — multi-char buffer with 500 ms timeout (APG full spec)
- Implementation: a `typeAheadBufferRef = useRef("")` accumulates printable characters as the user types. A `setTimeout` (500 ms) clears the buffer.
- On each printable keystroke (`e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey`):
  1. Append `e.key.toLowerCase()` to the buffer.
  2. Reset the 500 ms timeout.
  3. Find the first menuitem whose `label.toLowerCase()` starts with the buffer.
  4. If found, move roving focus to that item.
  5. Wrap-around: if no match starting from `activeItem + 1`, scan from index 0.
- Scope: type-ahead only fires within the menubar (top-level items) and within an open submenu (scoped to that submenu's items). Buffer is RESET when crossing the menubar↔submenu boundary.
- Non-printable keys (Arrow, Home, End, Escape, Enter, Space, Tab) bypass the type-ahead branch and route to the existing keyboard switch.

**Why:** APG canonical pattern; matches Windows/macOS native menubars; allows distinguishing "Se" → "Settings" from "Sea" → "Search" without forcing single-letter cycling. 500 ms is the APG-cited default. Single-char fallback is implicit (first character is enough when buffer is fresh).

### D-03: Hover-to-open behavior — DROPPED in menubar mode (preserved in disclosure mode)
- In `pattern="disclosure"` (default): hover and focus both open the submenu (current behavior, unchanged).
- In `pattern="menubar"`: hover does NOT open the submenu. Click on a trigger toggles it; ArrowDown opens it and focuses the first item; ArrowUp opens it and focuses the last item (APG canonical).
- `onMouseEnter` / `onMouseLeave` / `onFocus`-with-200ms-close are NOT wired on menubar-mode `<li role="none">` / `<button role="menuitem">` elements.
- Click-outside still closes (carries over from Disclosure).

**Why:** APG Menubar spec doesn't include hover as a contract surface; mixing hover-open with the roving-tabindex model creates SR-confusing announcements (submenu opens unprompted while focus is still on the menubar). Strict APG = predictable for assistive tech.

### D-04: Leaf-item behavior (top-level item without `children`) — native `<a>` with `role="menuitem"`
- In `pattern="menubar"`, top-level items WITHOUT a `children` array are rendered as `<a href role="menuitem" tabIndex={isActive ? 0 : -1}>`.
- Top-level items WITH `children` are rendered as `<button role="menuitem" aria-haspopup="menu" aria-expanded={isOpen} tabIndex={isActive ? 0 : -1}>`.
- Keyboard contract on a leaf `<a>`:
  - **Enter / Space:** native `<a>` activation (browser navigates to `href`). No preventDefault — let the native behavior fire. Ctrl+click / middle-click / native modifier semantics preserved.
  - **ArrowDown / ArrowUp:** no-op (no submenu to open). preventDefault to suppress page scroll.
  - **ArrowLeft / ArrowRight:** moves roving anchor to previous/next top-level item (clamped — NOT wrapping, see D-06).
  - **Home / End:** jump to first / last top-level item.
  - **Escape:** no-op (no submenu open).
  - **Type-ahead characters:** standard buffer match (D-02).
- Leaf-items render WITHOUT an inner `<button>` shell — keeps native `<a>` semantics (right-click "Open in new tab", `Ctrl+Click`, screen-reader "link" announcement).

**Why:** Preserves native `<a>` affordances (the entire point of using a real link). APG explicitly permits `role="menuitem"` on `<a>` elements. Wrapping a leaf link in a `<button>` would break Ctrl+click → new-tab, which is a hard regression.

### D-05: ARIA role chain in `pattern="menubar"` mode
- Outer `<nav>` — UNCHANGED (still `<nav aria-label="...">`).
- Top-level `<ul>` — gains `role="menubar"` and the `aria-orientation="horizontal"` default (omitted attribute since horizontal is the role default).
- Each top-level `<li>` — gains `role="none"` (per APG: `<li>` inside `role="menubar"` should not announce as list-item, otherwise the menubar item role is announced redundantly).
- Top-level button trigger (item with children) — `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded={isOpen}`, `aria-controls={dropdownId}`, `tabIndex={isActive ? 0 : -1}`, `data-state={isActive ? "focused" : undefined}`.
- Top-level link leaf (item without children) — `role="menuitem"`, `tabIndex={isActive ? 0 : -1}`, `data-state={isActive ? "focused" : undefined}` on the `<a>`.
- Submenu `<ul>` — `role="menu"`, `aria-orientation="vertical"` (explicit since vertical isn't the default for `role="menu"` in all UA implementations).
- Submenu `<li>` — `role="none"`.
- Submenu link — `role="menuitem"`, `tabIndex={-1}` always (only one focus anchor exists; submenu focus is imperative).

### D-06: Keyboard contract in `pattern="menubar"` mode (clamped, NOT wrapping)
Mirror Phase 30's clamping decision — wrap-around is confusing for menubars where positional memory matters.

**On a top-level trigger / leaf (focus on menubar):**
- **ArrowRight:** roving anchor → next top-level item; if at last → no-op (clamped).
- **ArrowLeft:** roving anchor → previous top-level item; if at first → no-op.
- **ArrowDown** (on trigger): open submenu, focus first submenu item. (On leaf: no-op + preventDefault.)
- **ArrowUp** (on trigger): open submenu, focus LAST submenu item. (On leaf: no-op + preventDefault.)
- **Home:** focus first top-level item.
- **End:** focus last top-level item.
- **Enter / Space** (on trigger): open submenu, focus first item.
- **Enter / Space** (on leaf): native `<a>` activation (do NOT preventDefault).
- **Escape:** no-op when no submenu is open.
- **Type-ahead character:** D-02 buffer match within top-level items.
- **Tab:** native — moves focus OUT of the menubar to the next focusable element after it.

**On a submenu item (focus inside an open submenu):**
- **ArrowDown:** next submenu item; if at last → no-op (clamped — APG also permits wrap; we pick clamp for consistency with Phase 30).
- **ArrowUp:** previous submenu item; if at first → no-op.
- **ArrowRight:** close current submenu, move roving anchor to NEXT top-level item, open ITS submenu, focus its first item (if it has one; otherwise just focus the next top-level item).
- **ArrowLeft:** close current submenu, return focus to its trigger (the parent top-level item).
- **Home:** focus first submenu item.
- **End:** focus last submenu item.
- **Enter / Space:** native `<a>` activation on the submenu link.
- **Escape:** close submenu, return focus to the trigger. **stopPropagation** (carry over from Phase 24 Disclosure — prevents ancestor Dialog from also reacting).
- **Tab:** native — closes submenu (visually) and moves focus to next focusable element after the menubar.
- **Type-ahead character:** D-02 buffer match within THIS submenu's items only.

**Click-outside:** still closes any open submenu in menubar mode (carries over from Disclosure).

### D-07: Test surface for Menubar mode — D-02a-clean
- New describe block: `'Tier 2: A11y Differentiators (APG Menubar per Phase 31)'`.
- ALL menubar tests use `userEvent.setup()` + `user.keyboard(...)` + `toHaveFocus()` + `toHaveAttribute('tabindex', '0' | '-1')` + `toHaveAttribute('aria-expanded', 'true' | 'false')`.
- **ZERO** `fireEvent`, `querySelector`, `configureAxe`, `toMatchSnapshot` in the new block. (Existing Disclosure block keeps its `fireEvent` usage — Phase 24 D-02 exception is preserved verbatim there.)
- Test count delta: target ~15 new `it()` blocks covering — roving init + Arrow horizontal × 2 (clamped each side), Home/End, ArrowDown opens submenu + focuses first, ArrowUp opens submenu + focuses last, ArrowDown within submenu + clamp, ArrowLeft from submenu closes + returns to trigger, ArrowRight from submenu crosses to next menubar item, Escape from submenu, type-ahead single-char, type-ahead multi-char buffer, type-ahead timeout reset, leaf-link Enter activation (assert native `<a>` href is followed via click-handler stub or `toHaveAttribute('href')`), no-side-effect guard (Arrow keys do NOT trigger link navigation).
- Final NavigationMenu.test.tsx test count: ~17 (existing) → ~32.

### D-08: Type-ahead label source + matching rules
- Match against `item.label` (existing `NavItem.label: string` field — unchanged).
- Case-insensitive: `item.label.toLowerCase().startsWith(buffer)`.
- Whitespace-sensitive at the START (matching `" Home"` requires `" "` in the buffer — we accept this as not a real-world issue since labels shouldn't have leading whitespace).
- Locale-naive: uses JavaScript's default `toLowerCase()` (no `toLocaleLowerCase('sv-SE')`). Phase 31 doesn't introduce locale-aware matching; that's an explicit non-goal. (Swedish menu labels with å/ä/ö still WORK — they're just matched as their literal lowercased codepoint; no Turkish-I problem because we don't touch dotted-I rules.)

</decisions>

<code_context>
**Current NavigationMenu structure (`packages/components/src/NavigationMenu/NavigationMenu.tsx`, 177 lines):**
- L1: imports `useState, useRef, useEffect, useId, forwardRef` from React
- L3-7: `NavItem` interface (label, href?, children?) — UNCHANGED by this phase
- L9-13: `NavigationMenuProps` interface — gains `pattern?: 'disclosure' | 'menubar'` (D-01)
- L29-45: `NavigationMenu` forwardRef component — dispatches on `pattern` prop; current body stays as the `'disclosure'` branch
- L49-176: `MenuItem` sub-component — STAYS as the Disclosure renderer; new `MenubarItem` sub-component (or similar) is added as the menubar renderer
- L73-80: existing Escape-with-stopPropagation pattern (Phase 24 carry-forward) — REUSED in menubar mode

**Current test file (`packages/components/src/NavigationMenu/NavigationMenu.test.tsx`, 335 lines):**
- L66-68: imports `render, screen, waitFor, fireEvent` from RTL + `userEvent` from `@testing-library/user-event`
- L88-141: Tier 1 Table Stakes — UNCHANGED
- L143-end: Tier 2 Disclosure block — UNCHANGED (preserves Phase 24 fireEvent exception)
- NEW: append a Tier 2 Menubar describe block after the existing Tier 2 block

**Reusable patterns from Phase 30 (`packages/components/src/DataTable/DataTable.tsx`):**
- `activeCell` state + `activeCellRef` shadow (Phase 30 lines ~85-95)
- `cellRefs: Map<string, HTMLElement>` registry (Phase 30 lines ~98-105)
- `useLayoutEffect` imperative focus (Phase 30 lines ~108-115)
- `hasUserMovedRef` mount-guard pattern (Phase 30 lines ~95)
- Parent-level `onKeyDown` switch with clamped Math.max/Math.min (Phase 30 lines ~150-230)

**Reusable patterns from Phase 28 DatePicker.tsx:**
- JSDoc `@wcag` header structure with bulleted SC list (DatePicker.tsx:42-65)
- Single-`onGridKeyDown` parent handler attached to the role-bearing element (DatePicker.tsx:224-287)
</code_context>

<success_signals>
Grep-verifiable from the repo root after Phase 31 ships:

1. `grep -c "pattern?: 'disclosure' | 'menubar'" packages/components/src/NavigationMenu/NavigationMenu.tsx` → 1 (new prop declared)
2. `grep -c "role=\"menubar\"" packages/components/src/NavigationMenu/NavigationMenu.tsx` → 1 (menubar role wired)
3. `grep -c "role=\"menuitem\"" packages/components/src/NavigationMenu/NavigationMenu.tsx` → ≥ 2 (top-level + submenu items)
4. `grep -c "role=\"menu\"" packages/components/src/NavigationMenu/NavigationMenu.tsx` → ≥ 1 (submenu container; may match `role="menubar"` substring — disambiguate with `grep -cE 'role="menu"[^b]'`)
5. `grep -c "aria-haspopup=\"menu\"" packages/components/src/NavigationMenu/NavigationMenu.tsx` → ≥ 1
6. `grep -cE 'typeAheadBufferRef|type-ahead' packages/components/src/NavigationMenu/NavigationMenu.tsx` → ≥ 1
7. `grep -c '@wcag' packages/components/src/NavigationMenu/NavigationMenu.tsx` → ≥ 1; JSDoc includes `2.1.1 Keyboard` AND `4.1.2 Name, Role, Value`
8. `grep -c 'Tier 2: A11y Differentiators (APG Menubar' packages/components/src/NavigationMenu/NavigationMenu.test.tsx` → 1 (new describe block exists)
9. `grep -cE '(toHaveFocus|tabIndex)' packages/components/src/NavigationMenu/NavigationMenu.test.tsx` → ≥ 9 (new D-02a-clean assertions)
10. `npm run verify -w @holmdigital/components` exits 0; package version bumped 2.4.0 → 2.5.0; CHANGELOG entry under 2.5.0 describing the opt-in `pattern='menubar'` addition.
</success_signals>

<deferred>
- **Default flip to `pattern="menubar"`** — once consumer feedback stabilizes, a future major bump (3.0.0) can make menubar the default. Decision deferred — not in Phase 31 scope.
- **Locale-aware type-ahead** (e.g., `toLocaleLowerCase('sv-SE')` for å/ä/ö normalization). Not needed for v1 — current matching works correctly for Swedish labels via codepoint comparison. Revisit if consumer reports edge case.
- **Submenu wrap-around** (instead of clamping) — APG permits both; clamping chosen for Phase 31 consistency. Toggle prop or default change deferred.
- **Multi-level submenus** (submenus inside submenus) — current `NavItem.children` is recursive in TypeScript but the implementation only renders one level. Multi-level menubar is its own phase.
- **`aria-current="page"` integration** with router state — out of scope; consumer responsibility via `NavItem.href` rendering.
- **Mouse drag-from-trigger-to-item-to-activate** (macOS menu bar UX) — not an APG requirement; defer.
</deferred>

<next_steps>
Run `/gsd-plan-phase 31` to create `31-RESEARCH.md` (Menubar/Type-ahead implementation patterns, jsdom quirks for focus management across dispatched roles) and `31-01-PLAN.md` (task breakdown, byte-equivalent Disclosure preservation tactic, atomic commit plan).
</next_steps>
