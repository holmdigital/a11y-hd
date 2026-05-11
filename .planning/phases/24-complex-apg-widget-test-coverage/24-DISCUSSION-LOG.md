# Phase 24 Discussion Log

**Date:** 2026-05-11
**Phase:** 24 — Complex APG Widget Test Coverage

## Areas Discussed

### Stub-component strategy
**Question:** How should we handle DataTable and DatePicker, whose source appears to lack the keyboard handlers the APG success criteria require?

**Codebase scouting:** DataTable has 1 ARIA hit and 0 onKeyDown across 182 LOC; DatePicker has 1 ARIA hit and 0 onKeyDown across 121 LOC. The other 4 widgets (Combobox, MultiSelect, TreeView, NavigationMenu) have substantive keyboard handlers and ARIA surface.

**Options presented:**
- Phase 22 RadioGroup pattern (no-throw + documented gap) — recommended
- Strict APG tests + implement missing keyboard in source as part of Phase 24
- Defer DataTable + DatePicker to v0.7

**User choice:** Phase 22 RadioGroup pattern

**Rationale:** keeps Phase 24 scope as "Test Coverage" (its name). Pinning the existing contract NOW prevents silent regressions when the v0.7 keyboard work lands. Two backlog items added (TC-12-IMPL, TC-10-IMPL) rather than loose TODOs.

### Plan shape
**Question:** What plan shape best fits 6 component test suites?

**Options presented:**
- 6 plans, one per component, all parallel (recommended)
- 2 plans — group by complexity
- 1 plan, all 6 components

**User choice:** 6 plans, one per component, all parallel

**Rationale:** mirrors Phase 22 Wave 5 parallel structure that worked successfully. Each component's source surface is disjoint (different `src/<Component>/<Component>.test.tsx`), so worktrees don't conflict. Failure of one plan doesn't block others. Smallest atomic diffs per PR.

## Deferred Ideas

- **TC-12-IMPL** — DataTable APG grid keyboard handler (v0.7)
- **TC-10-IMPL** — DatePicker APG dialog-grid keyboard handler (v0.7)
- Real-browser axe-core run (PUB-07) — v0.7+
- Storybook visual regression — blocked on esbuild upstream patch
- MutationObserver-driven announcement timing tests — jsdom can't replicate
- Tier 3 (production-realism) test suites — implementation budget for v0.7+

## Claude's Discretion (not asked)

- D-03: axe-clean smoke is one Tier-1 default-render per component (NOT per Tier-2 keyboard step). Full axe per state would be slow + noisy in jsdom; one smoke is the Phase 22 convention.
- D-04: test files mirror `Button.test.tsx` template-setter structure with Tier 1 + Tier 2 describes. Test count budget ~10-20 per file (Tabs reference: 19).
- D-05: live-region tests use `waitFor` for async-update cases; assert region content, NOT announcement timing (jsdom doesn't replicate browser queueing reliably).
- WCAG-SC selection per file deferred to planner (varies per widget pattern: 2.1.1 / 2.4.3 / 2.4.7 / 1.3.1 / 4.1.2 / 4.1.3 mix).
- Researcher likely needed before planner — APG spec is dense and varies per widget; per-pattern keyboard matrix + ARIA-attribute crib sheet would help.
