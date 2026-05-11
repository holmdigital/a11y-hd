---
phase: 24-complex-apg-widget-test-coverage
plan: 05
subsystem: components/TreeView
tags: [tests, a11y, apg, roving-tabindex, tree]
requires:
  - TreeView.tsx source implementing role=tree/treeitem/group, aria-expanded/aria-level/aria-selected, ArrowUp/Down/Left/Right + Home/End + Enter/Space handlers, roving tabindex
  - _test/helpers.ts (expectNoAxeViolations, expectUniqueIds)
provides:
  - packages/components/src/TreeView/TreeView.test.tsx (24 it() blocks, Tier 1 + Tier 2)
  - Regression guard for the full APG tree keyboard contract
affects:
  - npm run test:wcag-headers (+1 file with WCAG-SC JSDoc header)
tech-stack:
  added: []
  patterns:
    - waitFor wrapper around every post-keystroke focus assertion (Pitfall 6 mitigation)
    - re-query via screen.getByRole(...) after the await rather than capturing stale refs
    - Click-to-focus to deterministically position focus before keyboard sequences (avoids brittle .focus() race with useEffect)
key-files:
  created:
    - packages/components/src/TreeView/TreeView.test.tsx
  modified: []
decisions:
  - "D-07 honored: typeahead and asterisk-expand silently omitted — no test, no no-throw stub, no TC-13-IMPL backlog item"
  - "D-02a honored: paired Enter + Space tests for select-toggle; 0 querySelector / configureAxe / toMatchSnapshot"
  - "D-04 honored: JSDoc WCAG-SC header covers 1.3.1, 2.1.1, 2.4.3, 4.1.2 (NOT 4.1.3 — no live region in TreeView)"
metrics:
  duration: ~25 minutes
  tasks: 1
  files_changed: 1
  tests_added: 24
  date: 2026-05-11
---

# Phase 24 Plan 05: TreeView Test Suite (TC-13) Summary

One-liner: 24-test Tier 1+2 suite pinning TreeView's full APG tree contract (roving tabindex, arrow expand/collapse/navigate, Home/End, paired Enter/Space) against the existing 285-LOC source; APG-OPTIONAL typeahead + asterisk-expand silently omitted per D-07.

## What Shipped

A single new file, `packages/components/src/TreeView/TreeView.test.tsx`, exercising the near-full APG tree contract that the source already implements.

**Tier 1 (6 tests):** role=tree mount + default aria-label "Tree View", custom ariaLabel override, one treeitem per visible root node initially, className additive pass-through, click-to-select on leaves with onSelect callback, click-to-toggle-expand-and-select on parents.

**Tier 2 (18 tests):** aria-expanded omitted on leaves, aria-expanded state on parents, aria-level=1 on roots and =2 on first-level children, roving tabindex invariant (initial), ArrowDown/Up focus movement, ArrowRight expand-then-into (two branches), ArrowRight no-op on leaf, ArrowLeft collapse-then-up (two branches), Home/End first/last visible, Enter on leaf, Space on leaf (D-02a paired), Enter on parent (select + toggle), axe-clean default render, axe-clean expanded-state render, two-instance duplicate-id guard.

Plan target was 15-18 tests; actual count is 24 because each behavior bullet from `<behavior>` was given its own `it()` block rather than combined, which keeps failure messages focused and matches the granular Tabs.test.tsx template.

## Deviations from Plan

**Worktree base reset (Rule 3 — blocking).** The worktree's branch HEAD on arrival was `5ce4646` (a release-merge tip on master that lacked Phase 22/23 component infrastructure: `_test/helpers.ts`, the Tabs.test.tsx canonical template, all phase 24 planning files). The plan declared fork base `2bc33c1`, which contains the full infrastructure. I hard-reset the worktree branch to `2bc33c1` before writing anything; the worktree branch had no prior commits of its own, so nothing was lost. After reset, all required dependencies (`_test/helpers.ts`, TreeView.tsx source, plan files) were present unchanged. Recorded here as a deviation per Rule 3 because it touched VCS state beyond the plan's declared single file.

No other deviations. No bugs found in TreeView source. All 24 tests passed on first run against the existing implementation.

## Authentication Gates

None.

## Known Stubs

None. TreeView source is near-full APG and the test file asserts the contract directly.

## Self-Check: PASSED

- `packages/components/src/TreeView/TreeView.test.tsx` — FOUND
- Commit `e63d6d1` — FOUND
- `npx vitest run src/TreeView/TreeView.test.tsx` — 24/24 passing, 0 failures
- Full `packages/components` suite — 331/331 passing across 22 files
- `grep -c "querySelector\|configureAxe\|toMatchSnapshot" TreeView.test.tsx` — 0
- `grep -c "expectNoAxeViolations(" TreeView.test.tsx` — 2 (default + expanded)
- `grep -c "waitFor(" TreeView.test.tsx` — 17 (Pitfall 6 mitigation across all keyboard tests)
- JSDoc Implementation-note block documents D-07 silent omission of typeahead + asterisk-expand
- No TC-13-IMPL backlog reference anywhere in the file
