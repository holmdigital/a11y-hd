---
status: diagnosed
trigger: "UAT-001 (datatable-grid-multiple-tab-stops): Phase 30 APG grid must be a single Tab stop, but Tab visits Name header, then City header, then exits. Name and City are the two sortable columns; non-sortable Role was not visited."
created: 2026-06-12T00:00:00Z
updated: 2026-06-12T00:30:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED - root cause found and triple-verified (source + design decision + test gap). Investigation complete.
test: n/a (diagnosis complete)
expecting: n/a
next_action: Return ROOT CAUSE FOUND to orchestrator (goal: find_root_cause_only - no fix applied).

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Click in a text input before the table, press Tab once -> focus lands on the "Name" column header (the roving anchor, tabindex=0). Press Tab again -> focus leaves the table entirely (lands on a button after the table). Tab never visits other cells/headers.
actual: "name, city then leaves the grid" - Tab stops on the Name header, then the City header, then exits. Two stops inside the grid instead of one. Data cells correctly skipped (DevTools confirmed td elements carry role="gridcell" with tabindex="-1", active cell tabindex="0").
errors: None reported
reproduction: Test 1 in .planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-UAT.md - run `npm run storybook -w @holmdigital/components`, open story "Components/DataTable -> APG Grid Keyboard" (Name + City sortable, Role not sortable), Tab from the input above the table.
started: Discovered during UAT 2026-06-12. Phase 30 (commit a21457d and follow-ups) shipped the APG grid keyboard contract; the sortable-header surface predates it (Phase 22).

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-06-12 (investigation step 1)
  checked: packages/components/src/DataTable/DataTable.tsx (full read, 325 lines)
  found: |
    (1) th elements correctly implement roving tabindex - line 259: `tabIndex={isActive(-1, index) ? 0 : -1}`; td elements likewise - line 301.
    (2) Sortable headers render an inner native <button> (lines 272-286) with NO tabIndex prop - native buttons default into the tab order, so EVERY sortable column contributes an extra Tab stop regardless of the th roving state.
    (3) The component doc comment EXPLICITLY documents this as intended: lines 70-72 "Header row participates in roving (D-02); sortable-header inner <button> stays in document tab order unchanged." and lines 78-79 "sortable-header inner <button> still receives native Enter/Space when tabbed to."
    (4) Enter/Space sorting does NOT depend on button focus: onGridKeyDown lines 175-189 calls handleSort(column.accessor) directly when the focused roving cell is a sortable th (row === -1). So removing the button from the tab order would not break keyboard sorting (UAT Test 6 passed using this very path).
  implication: |
    Root cause located. Tab sequence in the story is: input -> Name th (roving anchor tabindex=0) -> Name inner button (implicit tabindex 0) -> City inner button (implicit tabindex 0) -> button after table. The two extra stops are exactly the two sortable columns' inner buttons - matching the symptom (Name, City visited; non-sortable Role skipped). User perceived the adjacent Name-th and Name-button stops as one "name" stop since both focus rings wrap the same word.
    This was a deliberate Phase 30 design decision that conflicts with the APG grid single-tab-stop contract, not an accidental omission.

- timestamp: 2026-06-12 (investigation step 2)
  checked: .planning/phases/30-datatable-apg-grid-cell-wise-keyboard/30-CONTEXT.md (decisions D-02, D-03, D-05, code_context)
  found: |
    The defective behavior was SPECIFIED, and the implementation followed the spec faithfully:
    (1) D-02 (line 57): "Sortable header's inner <button> STAYS in the DOM unchanged... Inner <button> remains tab-focusable in document order (preserves current Tab-to-sort behavior)."
    (2) D-05 (line 76): "The inner <button> of a sortable header is left untouched (it has its own implicit tab order)."
    (3) code_context "Patterns to mirror" (line 115): "Users who Tab through the page hit cells AND sort buttons - that's intentional (APG grid + nested control)."
    (4) D-03 (lines 59-64) independently provides keyboard sorting through the roving cell: Enter/Space on a focused sortable th delegates to handleSort - so Tab-to-button is NOT needed for keyboard operability. UAT Test 6 (Enter/Space sorts via roving header focus) PASSED, proving the D-03 path works.
  implication: |
    The root cause is a design-level contradiction inside 30-CONTEXT.md: D-02/D-05 keep inner sort buttons tab-focusable while the phase's own domain statement and UAT Test 1 require the APG single-tab-stop contract ("single-tabindex=0 roving"). W3C APG Grid explicitly requires that focusable widgets inside cells be removed from the page Tab sequence (tabindex=-1) and be reachable via grid navigation instead. D-03 already makes that safe.

- timestamp: 2026-06-12 (investigation step 3)
  checked: packages/components/src/DataTable/DataTable.test.tsx (full read, 470 lines, 33 tests) + grep for Tab simulation
  found: |
    Why the 33-test suite missed it:
    (1) grep for `\.tab\(|user\.tab|Tab\}` across the test file: ZERO matches. No test ever simulates pressing Tab - all keyboard tests use user.keyboard('{ArrowRight}') etc. after programmatic .focus() calls.
    (2) tabindex assertions exist ONLY on columnheader/gridcell elements (e.g., lines 242, 250-251, 278, 304, 316, 437, 442-443). No test asserts the inner sort button's tabIndex.
    (3) Tests that focus the sort button do it programmatically: `nameBtn.focus()` (lines 187, 200) - programmatic focus works regardless of tabindex value, so these tests cannot detect document-tab-order membership.
    (4) Test-file header comment (lines 10-12) even restates the wrong contract: "Sortable headers also expose real <button>s so Enter/Space activate them natively when the inner button is tabbed to."
  implication: The suite verifies the roving contract ON the cells but is structurally blind to the document Tab sequence. A regression test needs userEvent.tab() walking input -> grid -> exit, plus an assertion that sort buttons carry tabindex="-1".

- timestamp: 2026-06-12 (investigation step 4)
  checked: packages/components/src/DataTable/DataTable.stories.tsx (grep for column defs, lines 47-49)
  found: "Story columns: { header: 'Name', sortable: true }, { header: 'City', sortable: true }, { header: 'Role' } (not sortable)."
  implication: |
    Exactly two sortable columns = exactly the two extra Tab stops observed ("name, city then leaves the grid"); Role has no inner button hence was skipped. Full predicted DOM tab sequence: input -> th[Name] (roving anchor tabindex=0) -> button[Name] (implicit tabindex 0) -> button[City] (implicit tabindex 0) -> after-table button. The user perceived the adjacent th[Name]/button[Name] stops as a single "name" stop since both focus rings wrap the same word. Hypothesis explains 100% of the symptom including the skipped Role column.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: |
  The sortable-header inner sort <button> (packages/components/src/DataTable/DataTable.tsx, lines 272-286) is rendered WITHOUT tabIndex={-1}. Native buttons are tab-focusable by default, so each sortable column contributes its own document Tab stop in addition to the single roving-tabindex anchor on the th/td cells. With two sortable columns (Name, City) in the UAT story, the grid exposes 3 tab stops (th[Name] roving anchor + button[Name] + button[City]) instead of 1, violating the APG grid single-tab-stop contract.

  This is not an implementation slip: Phase 30 CONTEXT D-02 ("Inner <button> remains tab-focusable in document order") and D-05 ("left untouched - it has its own implicit tab order") explicitly specified the wrong behavior, and DataTable.tsx's doc comment (lines 70-72, 78-79) faithfully documents it. The decision contradicts the phase's own domain statement ("single-tabindex=0 roving") and W3C APG Grid, which requires focusable widgets inside cells to be tabindex=-1 and reachable via grid navigation.

  The 33-test suite missed it because no test simulates Tab (zero userEvent.tab() calls), tabindex assertions cover only th/td cells, and sort-button focus is set programmatically (nameBtn.focus()) which works regardless of tab-order membership.
fix: |
  NOT APPLIED (goal: find_root_cause_only). Suggested direction: add tabIndex={-1} to the inner sort button in DataTable.tsx (line ~273). Safe because D-03 already routes Enter/Space sorting through the roving cell focus (onGridKeyDown lines 175-189, UAT Test 6 passed) and mouse click is unaffected. Update the stale doc comments in DataTable.tsx (lines 70-72, 78-79) and DataTable.test.tsx (lines 10-12). Add regression tests: (a) assert every sort button has tabindex="-1", (b) a userEvent.tab() sequence test proving input -> roving anchor -> exits grid. Existing 33 tests stay green (programmatic .focus() works on tabindex=-1 elements; getByRole('button') queries unaffected). Supersede D-02/D-05's tab-order clause in phase docs.
verification: n/a (diagnose-only mode)
files_changed: []
