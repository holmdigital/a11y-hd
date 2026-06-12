---
status: diagnosed
phase: 30-datatable-apg-grid-cell-wise-keyboard
source: 30-01-SUMMARY.md
started: 2026-06-12T08:21:22Z
updated: 2026-06-12T08:43:09Z
---

## Current Test

[testing complete]

## Tests

### 1. Tab Into Grid — Single Stop (Roving Tabindex)
expected: Setup — run `npm run storybook -w @holmdigital/components`, open Components/DataTable → APG Grid Keyboard. Click in the text input above the table, press Tab once → focus lands on the "Name" column header. Press Tab again → focus leaves the table and lands on the button below it. The grid is one Tab stop; Tab never visits individual cells.
result: issue
reported: "name, city then leaves the grid"
severity: major

### 2. Arrow Key Navigation with Edge Clamping
expected: With any cell focused, ArrowRight/ArrowLeft move one cell sideways within the row; ArrowDown/ArrowUp move one row down/up. ArrowUp from the first data row lands in the header row. At grid edges (first/last column, header row, last row) focus stays put — no wrapping, no focus loss, no errors.
result: pass

### 3. Home / End Within a Row
expected: With a mid-row cell focused, Home jumps focus to the first cell of the current row; End jumps to the last cell of the current row. The row does not change.
result: pass

### 4. Ctrl+Home / Ctrl+End Across the Grid
expected: Ctrl+Home jumps focus to the first header cell ("Name", top-left of the grid) from anywhere. Ctrl+End jumps to the last cell of the last data row (bottom-right, the "Viewer"/Role cell of User15).
result: pass

### 5. PageDown / PageUp Jumps 10 Rows
expected: PageDown jumps focus 10 rows down, clamped at the last data row (e.g., from the User01 row to the User11 row; a second PageDown clamps at User15). PageUp jumps 10 rows up, clamped at the header row (PageUp from a low row can land back in the header band).
result: pass

### 6. Enter/Space Sorts Header — Navigation Keys Never Sort
expected: Focus the "City" column header and press Enter (or Space) → rows reorder by city and the header's sort indicator updates; pressing again flips the direction. Arrow keys, Home/End, Ctrl+Home/End, and PageUp/PageDown never change the sort order — they only move focus. The "Role" header (not sortable) does not sort on Enter/Space.
result: pass

### 7. Click Moves the Focus Anchor
expected: Click any data cell in the middle of the table → that cell becomes the active cell (shows the focused state) and arrow keys continue navigation from there. After Tab-ing out of the grid, Tab-ing back in returns focus to that same cell (the roving anchor is remembered).
result: pass

### 8. No Focus Steal on Page Load
expected: Reload the story page (F5). The table does NOT grab focus on load — the page does not jump-scroll to the table and focus stays wherever the browser put it. The first header is merely the resting Tab stop, not auto-focused.
result: pass

### 9. Accessibility Tree Exposes Grid Roles
expected: In the browser DevTools accessibility pane (or via a screen reader such as NVDA), the table exposes role "grid", each row "row", header cells "columnheader", and data cells "gridcell". A screen reader announces entry like "grid, Team roster…" and reads cell coordinates while arrowing.
result: pass

## Summary

total: 9
passed: 8
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- YAML format for plan-phase --gaps consumption -->
- truth: "Tab into the grid is a single stop — focus lands on the Name header once, and the next Tab leaves the grid entirely (roving tabindex)"
  status: failed
  reason: "User reported: name, city then leaves the grid — Tab visits both sortable headers (Name, City) before exiting, so the grid exposes multiple Tab stops"
  severity: major
  test: 1
  root_cause: "Inner sort <button> in sortable headers rendered without tabIndex={-1} (DataTable.tsx ~L272-286) — native buttons are tab-focusable, so each sortable column adds a document Tab stop on top of the roving anchor. Specified (wrongly) by 30-CONTEXT.md D-02/D-05, which contradict the phase's own APG single-tab-stop contract. Test suite has zero userEvent.tab() coverage, so the violation was structurally undetectable."
  artifacts:
    - path: "packages/components/src/DataTable/DataTable.tsx"
      issue: "sort <button> (~L272-286) missing tabIndex={-1}; doc comment (~L70-79) codifies the wrong tab-order contract"
    - path: "packages/components/src/DataTable/DataTable.test.tsx"
      issue: "no userEvent.tab() sequence coverage; no button-tabindex assertion; header comment (~L10-12) restates wrong contract"
    - path: ".planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md"
      issue: "D-02 (L57) and D-05 (L76) specify inner button stays tab-focusable — supersede"
  missing:
    - "Add tabIndex={-1} to the inner sort button (keyboard sorting already covered by D-03 Enter/Space delegation via roving cell — UAT Test 6 passed on that path)"
    - "Update stale doc comments in DataTable.tsx and DataTable.test.tsx to the corrected single-tab-stop contract"
    - "Supersede D-02/D-05 tab-order clauses in 30-CONTEXT.md"
    - "Regression tests: every sort button has tabindex=-1; userEvent.tab() sequence test proving input → roving anchor → next Tab exits the grid"
  debug_session: ".planning/debug/datatable-grid-multiple-tab-stops.md"
