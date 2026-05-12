# Phase 30 Discussion Log

**Date:** 2026-05-12
**Phase:** 30 — DataTable APG Grid Cell-Wise Keyboard
**Requirement:** TC-12-IMPL

## Areas Discussed

User selected all 4 gray areas presented:
1. ARIA roles override
2. Header row participation
3. PageUp/PageDown size + new props
4. Initial focus cell + Tab behavior

## Questions & Answers

### Q1: ARIA role strategy for DataTable cell-nav?
**Options:**
- Explicit grid roles (Recommended)
- Keep native table semantics
- Hybrid: role="grid" only when interactive

**Selected:** Explicit grid roles
→ Recorded as **D-01** in CONTEXT.md.

### Q2: Does the header row participate in Arrow-key roving navigation?
**Options:**
- Headers included in roving (Recommended)
- Headers excluded; sortable buttons untouched
- Headers included but skip sortable cells

**Selected:** Headers included in roving
→ Recorded as **D-02** in CONTEXT.md.

### Q3 (follow-up to Q2): When focus is on a sortable <th> via Arrow-nav and the user presses Enter/Space, what fires?
**Options:**
- Delegate to inner button.click() (Recommended)
- Replace inner <button> with onKeyDown on <th>
- Inner button is the only Enter target; <th> Enter is no-op

**Selected:** Delegate to inner button.click()
→ Recorded as **D-03** in CONTEXT.md.

### Q4: PageUp/PageDown row count — hardcoded vs new prop?
**Options:**
- Hardcoded constant (10 rows) (Recommended)
- New optional `pageSize?: number` prop (default 10)
- Compute from data length

**Selected:** Hardcoded constant (10 rows)
→ Recorded as **D-04** in CONTEXT.md.

### Q5: Where does the roving tabindex="0" start on mount, and what happens when Tab leaves and returns?
**Options:**
- Start: header row 0, col 0. Return: last-focused cell (Recommended)
- Start: first data cell. Return: last-focused
- Start: header row 0, col 0. Return: reset to start cell

**Selected:** Start: header row 0, col 0. Return: last-focused cell
→ Recorded as **D-05** in CONTEXT.md.

## Claude's Discretion (recorded as decisions for planner)

- **D-06: Keyboard contract details (clamped, not wrapping)** — ArrowRight at last col stops; ArrowLeft at col 0 stops; ArrowDown at last row stops; ArrowUp at header row 0 stops. Home/End jump to col 0/last in current row. Ctrl+Home/End jump to grid corners (header,0)/(lastData,lastCol). Rationale: APG examples split on wrap behavior; clamping is safer for tabular data.
- **D-07: Sort-on-Arrow-nav — no side effects** — Arrow / Home / End / Ctrl+Home/End / PageUp/Down only move focus. Sort only fires via Enter/Space on sortable <th> (delegated) or click on inner button (unchanged).

These are technical implementation details the user does not need to decide directly; flagged here for transparency.

## Deferred Ideas

- `pageSize?: number` prop — defer to future minor when a consumer requests it.
- `onCellFocus?: (row, col) => void` callback — wait for a use case.
- Shift+Arrow multi-cell selection — not in TC-12-IMPL.
- `aria-rowcount` / `aria-colcount` / `aria-rowindex` / `aria-colindex` — needed only for windowed grids.
- Cell editing semantics (`role="gridcell"` + `aria-readonly`) — separate phase.

## Carry-Forward

- Phase 28 (DatePicker) grid keyboard handler is the closest precedent — planner mirrors `case 'ArrowDown'` / `data-state="focused"` / `useRef` roving patterns.
- Phase 24's 9 no-throw stubs at `DataTable.test.tsx:219-250` are the conversion target.
- Sortable-header tests (~L180-212) must stay byte-equivalent.
- D-02a anti-pattern gate carries forward (no querySelector / configureAxe / toMatchSnapshot in new tests).
