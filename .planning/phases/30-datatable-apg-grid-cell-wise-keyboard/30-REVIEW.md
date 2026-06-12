---
phase: 30-datatable-apg-grid-cell-wise-keyboard
reviewed: 2026-06-12T17:09:09Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - packages/components/src/DataTable/DataTable.tsx
  - packages/components/src/DataTable/DataTable.test.tsx
  - packages/components/package.json
  - packages/components/CHANGELOG.md
findings:
  critical: 2
  warning: 4
  info: 5
  total: 11
status: issues_found
---

# Phase 30: Code Review Report

**Reviewed:** 2026-06-12T17:09:09Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 30 added an APG grid roving-tabindex keyboard layer to DataTable (30-01) and closed the single-tab-stop UAT gap by setting `tabIndex={-1}` on the inner sort button (30-02). The 30-02 fix itself is correct and well-guarded by the new `userEvent.tab()` regression tests; all 35 tests pass and the directory is lint-clean at zero warnings.

However, the new grid interaction layer has two Critical defects. First, every keydown and click handler keys off the **roving anchor state** (`activeCellRef`) instead of the actual event target, so any interactive content a consumer renders into a cell via the public `render` prop (inputs, links, action buttons — the canonical use case for a render prop) is hijacked: arrow/Home/End keys are swallowed and focus is yanked out of inputs, Space/Enter typed in a cell input silently sorts the table while suppressing the keystroke, and clicking into a cell input immediately steals focus to the `<td>`. Second, the roving anchor is never clamped when `data` or `columns` shrink, so a routine filter operation can leave the grid with **zero** Tab stops — the component becomes completely unreachable by keyboard, the exact WCAG 2.1.1 failure class this phase set out to fix.

Two of the existing keyboard tests also pass for the wrong reason (the grid handler intercepts before the native button path they claim to test), which is how the wrong-column manifestation of CR-01 stayed invisible. Remaining findings are quality/accuracy issues in the comparator, React keys, and CHANGELOG ordering.

Verification performed: full diff inspection against `a21457d^`, `npx vitest run src/DataTable/DataTable.test.tsx` (35/35 pass), `npx eslint src/DataTable --max-warnings 0` (clean), DatePicker source cross-check for WR-04.

## Critical Issues

### CR-01: Grid keyboard/click layer hijacks consumer-rendered interactive cell content (keys off anchor state, not event target)

**File:** `packages/components/src/DataTable/DataTable.tsx:146-208` (keydown), `:317-320` (td onClick), `:140-144` (focus effect)
**Issue:** `onGridKeyDown` is attached to the `<table>` and handles every bubbled keydown using `activeCellRef.current`, never inspecting `e.target`. `Column.render?: (item: T) => React.ReactNode` is public API and explicitly supports arbitrary content; with any focusable content inside a cell (a text input, link, or per-row action button):

1. **Arrow/Home/End/PageUp/PageDown are swallowed.** The switch always produces a non-null `next`, so line 203 calls `e.preventDefault()`, sets the anchor, and the layout effect (line 143) calls `.focus()` on a cell — caret movement inside an `<input>` is blocked and focus is yanked out of the input mid-typing. Home/End in a text field are likewise broken.
2. **Space/Enter typed inside a cell input ghost-sorts the table.** The `' '`/`'Enter'` branch (lines 183-197) checks only `activeCellRef` (`row === -1`). On a freshly mounted table the anchor defaults to `{row: -1, col: 0}` — the sortable Name header — so a user typing "hello world" into a consumer-rendered input gets the table re-sorted on every Space, and `e.preventDefault()` suppresses the character itself.
3. **Clicking into a cell input steals focus to the `<td>`.** The `<td>` onClick (lines 317-320) bubbles from the input, sets `hasUserMovedRef`, and calls `setActiveCell({...})` with a fresh object — even when coordinates are unchanged, the new object identity re-fires the `useLayoutEffect` (deps `[activeCell]`) and focuses the `<td>`, so the user can never place a caret in an input inside a cell.

This breaks WCAG 2.1.1 for all editable/interactive cell content and contradicts the library's "accessible by default" contract. Note also that consumer-rendered focusable content silently re-breaks the single-tab-stop contract that 30-02 just fixed for the internal sort button (extra document Tab stops), and the W3C APG Grid pattern requires focus to move to the widget inside a cell when the cell contains exactly one widget — neither is handled nor documented.
**Fix:**
```tsx
const onGridKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    // Only drive grid navigation when the event originates on a grid cell
    // itself — never intercept keys aimed at interactive content inside cells.
    const target = e.target as HTMLElement;
    if (!target.matches('[role="columnheader"], [role="gridcell"]')) return;
    // ... existing switch unchanged
};
```
For the click path, bail out of the focus-steal when the click landed on interactive content, and avoid identity-only state churn:
```tsx
onClick={(ev) => {
    const interactive = (ev.target as HTMLElement).closest(
        'a,button,input,select,textarea,[contenteditable="true"]'
    );
    if (!interactive) hasUserMovedRef.current = true; // don't yank focus from widgets
    setActiveCell((prev) =>
        prev.row === rowIndex && prev.col === colIndex ? prev : { row: rowIndex, col: colIndex }
    );
}}
```
(With the keydown guard in place, Enter/Space on the focused sort button activates through the native button path — see WR-01.) Add regression tests with a `render` prop that emits an `<input>`: typing arrows/space/enter must edit the input, never sort or move the anchor; clicking the input must keep focus in the input.

### CR-02: Roving anchor is never clamped when `data`/`columns` shrink — grid loses its only Tab stop (keyboard-unreachable)

**File:** `packages/components/src/DataTable/DataTable.tsx:128`, `:137-138`, `:267`, `:310`
**Issue:** `activeCell` holds raw indices into `sortedData`/`columns` and nothing re-validates them when props change. Sequence: user arrows to data row 12 (anchor `{12, c}`), the app filters `data` down to 3 rows (a routine controlled-table operation). Now no rendered cell satisfies `isActive(...)`, so **every** `th`/`td` renders `tabIndex={-1}` — the grid contributes zero entries to the document Tab order and is completely unreachable by keyboard until the user clicks a cell with a mouse. This is a hard WCAG 2.1.1 failure of exactly the class plan 30-02 was shipped to fix, and it is permanent for keyboard-only users. Additionally, if the focused cell unmounts during the shrink, DOM focus drops to `<body>` (focus loss, WCAG 2.4.3 concern), and the keydown handler then computes moves from out-of-range coordinates. The same applies to `columns` shrinking past `activeCell.col`.
**Fix:** Derive a clamped anchor at render time so the roving cell always exists:
```tsx
const effectiveRow = Math.min(activeCell.row, lastDataRow);   // lastDataRow may be -1 (header)
const effectiveCol = Math.max(0, Math.min(activeCell.col, lastCol));

const isActive = (row: number, col: number) =>
    effectiveRow === row && effectiveCol === col;
```
and read `effectiveRow`/`effectiveCol` (not the raw ref) at the top of `onGridKeyDown`. Optionally add a `useEffect` that snaps `activeCell` state back into range when `lastDataRow`/`lastCol` shrink, so the ref and state stay coherent. Add a regression test: rerender with a smaller `data` array after moving the anchor to the last row, then assert `user.tab()` still enters the grid (exactly one cell with `tabindex="0"`).

## Warnings

### WR-01: "Enter/Space on the focused sort button" tests pass for the wrong reason — they exercise the grid-handler interception, not the native button path they claim

**File:** `packages/components/src/DataTable/DataTable.test.tsx:185-208`
**Issue:** Both tests focus the **Name** button (column 0) while the roving anchor is still at its mount default `{row: -1, col: 0}` — also column 0. The keydown bubbles to the table handler, which sees a sortable header at the anchor, calls `e.preventDefault()` (suppressing the native button activation — user-event skips the synthesized click when `defaultPrevented` is set) and sorts via `handleSort`. The test labels ("native button", "WCAG 2.1.1 — native button") are therefore false: the native path is never exercised. Worse, the same test written against the **Age** button (column 1) would sort the **Name** column and fail — which is the wrong-column manifestation of CR-01 that this coincidental column-0 alignment is masking. The suite's apparent green is concealing a real defect, which is a test-reliability problem, not a style nit.
**Fix:** After the CR-01 target guard lands, these tests genuinely go through native button activation and remain green. Add a discriminating variant: focus the Age button (col 1, anchor untouched at col 0), press Enter, and assert `aria-sort` appears on the **Age** header and not on Name. That variant fails against the current implementation and proves the fix.

### WR-02: Index-based React row keys on a sortable (reorderable) table corrupt stateful cell content across sorts

**File:** `packages/components/src/DataTable/DataTable.tsx:305`
**Issue:** `<tr key={rowIndex}>` keys rows by position. When sorting reorders `sortedData`, React reuses the same row/cell component instances per position, so any DOM/component state created by consumer `render` content — uncontrolled `<input>` values, checkbox state, expanded toggles — stays at the old *position* while the row *data* moves elsewhere. After a sort, the value typed into Charlie's row is now displayed in Alice's row: visible data corruption. This pre-dates Phase 30, but the phase materially raised the stakes by promoting DataTable to a full APG grid (interactive cell content is the expected next consumer move) without addressing it.
**Fix:** Add an optional identity prop and use it for keys, falling back to index:
```tsx
rowKey?: (item: T) => React.Key;
// ...
<tr key={rowKey ? rowKey(row) : rowIndex} role="row">
```
Document that `rowKey` is required for stable behavior when cells contain stateful content.

### WR-03: Sort comparator is locale-naive and case-sensitive; null/undefined values compare as equal-to-everything

**File:** `packages/components/src/DataTable/DataTable.tsx:114-125`
**Issue:** The `<`/`>` comparison sorts strings by code unit: all uppercase sorts before all lowercase (`'Zebra' < 'apple'`), and Swedish å/ä/ö sort **after** `z` (`'Åsa'` lands below `'Zeb'`) — wrong for this library's home market and any sv/de/fr/es locale the project advertises. `null`/`undefined` values make both comparisons false, so they pin wherever the (stable) sort leaves them, and the default cell renderer (line 325) then prints the literal strings `"null"`/`"undefined"`. Pre-existing code, but Phase 30 made sorting a first-class keyboard operation (`aria-sort` is announced to AT), so the announced order being linguistically wrong is now an AT-visible correctness issue.
**Fix:**
```tsx
const cmp = (a: unknown, b: unknown): number => {
    if (a == null) return b == null ? 0 : 1;   // nulls last
    if (b == null) return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
};
```
(Optionally accept a `locale`/`compare` prop later.) Guard the default renderer against nullish: `row[column.accessor] == null ? '' : String(...)`.

### WR-04: CHANGELOG strands a BREAKING "Unreleased (Phase 28)" DatePicker section below released versions 2.4.0–2.7.3 that actually shipped the change

**File:** `packages/components/CHANGELOG.md:3` (new 2.7.3 entry placement), `:176-198` (stranded Unreleased section)
**Issue:** The Phase 30+ release entries (2.4.0 through 2.7.3, all added within this review range) were inserted **above** the pre-existing `## @holmdigital/components — Unreleased (v0.7 Phase 28)` section, leaving a BREAKING change (`DatePicker value: string → Date`, `forwardRef` removed, `InputHTMLAttributes` passthrough removed) stranded between 2.4.0 and 2.3.0. Verified against source: `DatePicker.tsx:30-32` on master already has `value?: Date` / `onChange?: (date: Date) => void`, and the Phase 28 commit (`dfc6f2d`, `feat(28-01)!`) is an ancestor of every 2.4.0+ release. So either (a) the breaking DatePicker API shipped to npm inside minor/patch releases with no major bump and no release-notes mention — a semver violation consumers will hit as a silent runtime break — or (b) the published packages were cut from a different ref, in which case the CHANGELOG misrepresents what each version contains. Either way the changelog is inaccurate for downstream consumers of an npm-published package.
**Fix:** Determine which published version first contained `dfc6f2d` (compare npm tarball or release tags). If 2.4.0 shipped it, fold the Phase 28 section into the 2.4.0 entry, flag the breakage prominently, and plan the corrective communication (the project's own convention would have demanded 3.0.0). If it truly hasn't shipped, move the Unreleased section to the top of the file above 2.7.3.

## Info

### IN-01: `data-state="focused"` is set on the anchor cell even when the grid has never had focus

**File:** `packages/components/src/DataTable/DataTable.tsx:268`, `:311`
**Issue:** The attribute tracks the roving anchor, not actual focus: on initial mount the Name header carries `data-state="focused"` before any interaction, and it remains after focus leaves the grid. Any consumer styling `[data-state="focused"]` as a focus ring renders a phantom indicator (WCAG 2.4.7 confusion).
**Fix:** Rename to `data-active`, or gate it on real focus via `onFocus`/`onBlur` tracking on the table.

### IN-02: `useLayoutEffect` emits SSR warnings for library consumers

**File:** `packages/components/src/DataTable/DataTable.tsx:140`
**Issue:** React logs "useLayoutEffect does nothing on the server" when this component renders in Next.js/SSR apps. The effect only runs post-interaction (`hasUserMovedRef` guard), so server rendering never needs it.
**Fix:** Use the standard `useIsomorphicLayoutEffect` pattern (`typeof window === 'undefined' ? useEffect : useLayoutEffect`) shared in `src/_hooks/`.

### IN-03: Roving-cell wiring duplicated between `<th>` and `<td>` branches

**File:** `packages/components/src/DataTable/DataTable.tsx:267-277` vs `:310-320`
**Issue:** `tabIndex`/`data-state`/ref-callback/onClick logic is copy-pasted with only the row index differing. The two implementations will drift (e.g., a CR-01 fix applied to one but not the other).
**Fix:** Extract a `rovingCellProps(row: number, col: number)` helper returning the shared prop object.

### IN-04: Space/Enter on non-sortable cells fall through without `preventDefault` — Space scrolls the page while focus is inside the grid

**File:** `packages/components/src/DataTable/DataTable.tsx:183-197`
**Issue:** The Enter/Space branch returns without `preventDefault()` for data cells and non-sortable headers, so pressing Space while focused on a grid cell scrolls the document — jarring for keyboard users and inconsistent with most APG grid implementations, which swallow Space inside the grid.
**Fix:** Call `e.preventDefault()` for `' '`/`'Spacebar'` whenever the event originated on a grid cell (after the CR-01 target guard), even when no sort applies.

### IN-05: Sort changes are not announced to AT (no live region) — documented gap, needs a tracked follow-up

**File:** `packages/components/src/DataTable/DataTable.tsx:103-109`; acknowledged at `DataTable.test.tsx:21-22`
**Issue:** `aria-sort` attribute changes are not reliably announced by screen readers, and the keyboard sort path (Enter on a focused `<th>`) gives no audible confirmation that anything happened. The test header explicitly documents this as a 4.1.3 Status Messages non-implementation, but no backlog item is referenced.
**Fix:** Wire the existing `LiveRegion` component (already in the package) to announce "Sorted by {header}, {direction}" on sort; or create the tracked follow-up the test comment implies.

---

_Reviewed: 2026-06-12T17:09:09Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
