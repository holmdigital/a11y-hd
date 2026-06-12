---
phase: 30
name: DataTable APG Grid Cell-Wise Keyboard
slug: datatable-apg-grid-cell-wise-keyboard
date: 2026-05-12
requirements: [TC-12-IMPL]
depends_on: [26]
---

<domain>
DataTable upgrades from a sortable-header-only contract to the full W3C APG Grid pattern: cell-wise Arrow keyboard navigation with single-`tabindex="0"` roving across `role="grid"` / `role="row"` / `role="gridcell"` / `role="columnheader"`. Adds Right/Left/Down/Up cell traversal, Home/End row-bounds, PageUp/PageDown row-paging (10-row jumps), Ctrl+Home/Ctrl+End table corners. Existing sortable-header contract (`scope="col"`, `aria-sort`, native Enter/Space on `<button>` headers) stays functionally identical — Enter/Space on a focused sortable `<th>` delegates to the inner `<button>.click()`. Phase 24's 9 cell-arrow no-throw stubs at `DataTable.test.tsx:219-250` convert to real `focus()` + `toHaveFocus()` assertions.
</domain>

<canonical_refs>
- `.planning/ROADMAP.md` — Phase 30 success criteria (#1–#5), Phase 26 dependency, TC-12-IMPL pointer
- `.planning/REQUIREMENTS.md` — TC-12 (test scope) at L129; TC-12-IMPL (impl scope) at L173, L198
- `.planning/phases/28-datepicker-apg-dialog-grid/28-CONTEXT.md` — closest precedent (`role="grid"` calendar, roving `tabindex="0"`, `data-state="focused"` hook)
- `.planning/phases/28-datepicker-apg-dialog-grid/28-02-PLAN.md` — concrete implementation of grid keyboard handler (Arrow/Home/End/PageUp/PageDown) to mirror
- `packages/components/src/DataTable/DataTable.tsx` — current source (sortable headers only, 182 lines)
- `packages/components/src/DataTable/DataTable.test.tsx` — current test file with 9 no-throw stubs to convert (L219-250) + sortable-header tests to keep green
- W3C APG Grid pattern: https://www.w3.org/WAI/ARIA/apg/patterns/grid/ — canonical reference for keyboard contract
- `CLAUDE.md` — project conventions (TypeScript strict, no breaking changes, WCAG SC JSDoc markers)
</canonical_refs>

<prior_decisions>
**Carried forward from Phase 28 (DatePicker dialog-grid):**
- Use `role="grid"` + `role="gridcell"` (not native table semantics) — Phase 28 established the pattern for this codebase
- Single `tabindex="0"` on the active cell; all others `tabindex="-1"` (roving)
- `data-state="focused"` attribute hook for tracking active cell (mirrors Phase 23 Accordion + Phase 28 calendar)
- `useRef` for active-cell coordinates to avoid stale closures inside keyboard handler

**Carried forward from Phase 27 (live regions):**
- This phase does NOT add live-region announcements (DataTable has no TC-12-LIVE counterpart in REQUIREMENTS.md). Cell-nav is silent — SR announces focus changes natively.

**Carried forward from Phase 24 (test scope):**
- 9 no-throw stubs (8 single-key `it.each` rows + 1 Ctrl+Home/End block) at `DataTable.test.tsx:219-250` MUST be removed and replaced with real assertions
- Sortable-header tests (~lines 180-212) MUST stay byte-equivalent — header `<button>` accessible-name patterns (`/^Name$/`) and `aria-sort` transitions are load-bearing
- D-02a anti-pattern gate: no `querySelector`, `configureAxe`, `toMatchSnapshot` in new tests
</prior_decisions>

<decisions>

### D-01: ARIA roles override — explicit grid
- `<table>` → `role="grid"`
- `<tr>` → `role="row"` (both thead and tbody)
- `<th>` → `role="columnheader"` (explicit, even though `<th>` implies it — needed because `role="grid"` on the parent overrides the implicit role chain)
- `<td>` → `role="gridcell"`
- `aria-rowcount`, `aria-colcount`, `aria-rowindex`, `aria-colindex`: NOT REQUIRED for v1 (only needed when rendering a windowed subset of a larger logical grid — DataTable always renders full data). Defer.

**Why:** APG Grid contract requires explicit roles to enable the cell-nav announcement model. Phase 28 used the same pattern for the calendar.

### D-02: Header row participation in roving — included
- Header row `<th>` cells DO participate in roving `tabindex`.
- ArrowUp from data row 0 (col `c`) lands on header `<th>` col `c`.
- ArrowDown from a header cell lands on data row 0, same column.
- Initial mount: tabindex="0" on header row 0, col 0 (the first `<th>`).
- Sortable header's inner `<button>` STAYS in the DOM unchanged — Phase 24's sort tests query it by accessible name. Inner `<button>` remains tab-focusable in document order (preserves current Tab-to-sort behavior).

### D-03: Enter/Space on a focused sortable `<th>` — delegate
- When focus is on a sortable `<th>` (via roving) and the user presses **Enter** or **Space**, the cell's `onKeyDown` calls the inner sort `<button>`'s `.click()` (or directly invokes the same `handleSort(column.accessor)` the click handler uses).
- For non-sortable `<th>`: Enter/Space are no-ops on the cell itself.
- For data `<td>`: Enter/Space are no-ops in v1 (no row-level actions defined). Reserved for future extension.

**Why:** Keeps Phase 24's sortable-header tests green (the inner `<button>` is still findable by accessible name). Matches APG "controls inside cells are reachable via cell focus".

### D-04: PageUp/PageDown row count — hardcoded constant
- `const PAGE_SIZE = 10` declared inside `DataTable.tsx`. No new prop.
- `PageDown` from row `r` moves focus to row `min(r + 10, lastRow)`.
- `PageUp` from row `r` moves focus to row `max(r - 10, firstRow)` where `firstRow` = 0 (data) or `-1` (header — first row visually but logically "row above data").
- PageUp from data row 0 lands on the header row (single step up beyond `r=0` clamped to header).
- PageUp/Down on a header cell: behave the same as ArrowDown / no-op-upward (clamped).

**Why:** ROADMAP success #4 ("Existing prop interface unchanged") read strictly. Adding `pageSize?: number` is technically additive but introduces an unbounded test-matrix and consumer-API surface. Future consumers needing custom page size can land it in a minor bump.

### D-05: Initial roving tabindex + return behavior
- **Initial mount:** tabindex="0" on the FIRST cell in tab/row order = header row, col 0 (i.e., the first `<th>`). All other grid cells tabindex="-1". The inner `<button>` of a sortable header is left untouched (it has its own implicit tab order).
- **Tab-away / Tab-back:** the most recently focused cell's coordinates are tracked in a `useRef<{row, col}>` and that cell retains `tabindex="0"`. When the user Tabs back into the table, the browser focuses the cell with `tabindex="0"` (i.e., the last-focused cell). This is the standard APG roving pattern.
- **Click on a cell:** moves the roving `tabindex="0"` to that cell (matches Phase 28 calendar's click→focus parity).
- **Row coordinate convention:** header row = `row = -1` (or use a discriminated union `{kind: 'header', col} | {kind: 'data', row, col}`). Researcher/planner picks the cleaner representation — both work.

### D-06: Keyboard contract details (clamped, not wrapping)
- **ArrowRight at last col:** stop (no wrap to next row).
- **ArrowLeft at col 0:** stop.
- **ArrowDown at last row:** stop.
- **ArrowUp at header row 0:** stop (no wrap to last data row).
- **Home:** focus moves to col 0 of current row.
- **End:** focus moves to last col of current row.
- **Ctrl+Home:** focus moves to row 0 / col 0 of the entire grid (the header row's first cell — NOT data row 0).
- **Ctrl+End:** focus moves to last row / last col (data, not header).

**Why:** APG Grid examples are split (some wrap, some don't); clamping is the safer default for tabular data where wrap-around could disorient users. Matches Phase 28's `min`/`max` clamp pattern for calendar bounds.

### D-07: Sort-on-Arrow-nav — no side effects
- Arrow / Home / End / Ctrl+Home/End / PageUp/Down NEVER trigger sort or change `sortConfig`. They move focus only.
- Only Enter/Space on a sortable `<th>` (delegated to the inner button) triggers sort. Click on the inner button continues to work as today.

</decisions>

<code_context>

### Reusable assets
- `Phase 28 DatePicker calendar` — implements the exact same APG grid keyboard handler (Arrow/Home/End/PageUp/PageDown). Planner should grep `packages/components/src/DatePicker/DatePicker.tsx` for `case 'ArrowDown'` / `data-state="focused"` / roving `tabindex` patterns and adapt.
- `Phase 23 Accordion` — `data-state="focused"` attribute hook precedent.
- `expectNoAxeViolations` test helper — Phase 22 / 24 standard for axe-clean smoke.

### Integration points
- `DataTable.tsx:127-181` — JSX tree to instrument: add `role="grid"` on `<table>`, `role="row"` on `<tr>`, `role="columnheader"` on `<th>`, `role="gridcell"` on `<td>`, plus `tabIndex={isActive(...) ? 0 : -1}` and `onKeyDown` on each cell.
- `DataTable.tsx:50-67` — existing `useState<sortConfig>` + `handleSort` stay unchanged.
- `DataTable.tsx:86-125` — `styles` object can be extended with a `focusedCell` outline ring (matches Phase 28 focus indicator).
- `DataTable.test.tsx:219-250` — the no-throw stub block to delete + replace.
- `DataTable.test.tsx:180-212` — sortable-header tests; MUST stay byte-equivalent (or, at minimum, all `getByRole('button', { name: /Name/ })` queries continue to find the inner button).

### Patterns to mirror
- **State for roving:** `const [activeCell, setActiveCell] = useState<{kind: 'header' | 'data', row?: number, col: number}>(...)` OR equivalent. A `useRef` shadow for in-handler reads (Phase 28 used `useRef` to avoid stale closures inside `onKeyDown`).
- **Tab order:** the sortable `<button>` retains its position in document order. The grid's roving system uses tabindex on `<th>`/`<td>`. Users who Tab through the page hit cells AND sort buttons — that's intentional (APG grid + nested control).
- **Test conversion:** delete the `it.each([['ArrowDown'], ...])` block at L219-237 and the Ctrl+Home/End block at L239-250. Replace with `~10` individual `it()` blocks that `focus()` a specific cell then `await user.keyboard('{ArrowDown}')` and assert the next cell's `toHaveFocus()` + `tabindex="0"`.

</code_context>

<scope_guardrails>
**In scope (Phase 30):**
- `role="grid"` semantics, roving tabindex, full Arrow/Home/End/PageUp-Down/Ctrl+Home-End contract on DataTable
- Conversion of 9 no-throw stubs to real focus assertions
- Preserving sortable-header contract (Enter/Space delegation)

**Out of scope (defer):**
- New `pageSize` prop (D-04)
- `aria-rowcount` / `aria-colcount` / `aria-rowindex` / `aria-colindex` (D-01) — needed only for windowed grids
- Multi-cell selection (Shift+Arrow extend, Ctrl+click toggle) — not in TC-12-IMPL
- Cell editing (`role="gridcell"` with `aria-readonly="false"`) — not in TC-12-IMPL
- Column reordering / column resize keyboard shortcuts
- Row-level Enter/Space actions (e.g., expand-row, select-row) — reserved per D-03

**Deferred Ideas:**
- Add `pageSize?: number` prop in a future minor version once a consumer requests it.
- Add `onCellFocus?: (row, col) => void` callback for analytics/highlights — wait for a use case.
- Optional Shift+Arrow multi-cell selection if a consumer needs bulk operations.
</scope_guardrails>

<success_signals>
Researcher / planner should treat the phase done-criteria as:
1. `grep -c 'role="grid"' packages/components/src/DataTable/DataTable.tsx` → 1
2. `grep -c 'role="gridcell"' packages/components/src/DataTable/DataTable.tsx` → 1 (rendered per cell)
3. `grep -c 'role="columnheader"' packages/components/src/DataTable/DataTable.tsx` → 1
4. `grep -c 'role="row"' packages/components/src/DataTable/DataTable.tsx` → 1 (or 2 — thead + tbody loops)
5. `grep -c 'it.each' packages/components/src/DataTable/DataTable.test.tsx` → 0 (stub block removed)
6. `grep -cE '(toHaveFocus|tabIndex)' packages/components/src/DataTable/DataTable.test.tsx` → ≥ 9 (one per converted stub)
7. `grep -cE 'getByRole..button., \{ name: /(Name|Age|Email)/' packages/components/src/DataTable/DataTable.test.tsx` → unchanged from pre-phase (sortable-header tests intact)
8. `grep -c 'export interface DataTableProps' packages/components/src/DataTable/DataTable.tsx` → 1, body byte-identical (no new props per D-04)
9. `npm run verify -w @holmdigital/components` → exit 0
10. `@wcag` JSDoc list in DataTable.tsx includes `2.1.1 Keyboard` (must exist; add if missing)
</success_signals>
</content>
</invoke>