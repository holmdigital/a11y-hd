# Phase 29 Discussion Log

**Date:** 2026-05-12
**Phase:** 29 — MultiSelect APG Listbox-Multi Completeness
**Mode:** default (4 single-question turns)

## Areas Discussed

User selected all 4 areas presented:
1. Selection-anchor for Shift+Arrow
2. Space-semantics in combobox-input
3. Plan structure (1 plan vs split)
4. Test scope: convert stubs vs expand

## Decisions

### 1. Selection-anchor model
**Question:** When is the Shift+Arrow anchor set/reset?
**Options presented:**
- A. Anchor = last non-Shift focus (recommended, matches W3C APG)
- B. Anchor = first selected option index
- C. No persistent anchor — toggle next only
**Selected:** A — last non-Shift focus
**Rationale captured in CONTEXT.md D-01.**

### 2. Space-toggle gating
**Question:** When does Space toggle the focused option vs type a literal space?
**Options presented:**
- A. Only when listbox open AND focusedIndex ≥ 0 (recommended)
- B. Only when input is empty
- C. Never — only Enter toggles
**Selected:** A — open + focusedIndex ≥ 0
**Rationale captured in CONTEXT.md D-02.**

### 3. Plan structure
**Question:** How do we split the work?
**Options presented:**
- A. 1 plan — all together (recommended)
- B. 2 plans: ARIA → keyboard
- C. 3 plans: ARIA → Space → Shift+Arrow
**Selected:** A — single plan
**Rationale captured in CONTEXT.md D-03.**

### 4. Test scope
**Question:** What's the test scope?
**Options presented:**
- A. Convert 4 stubs + add anchor + roving-tabindex tests (recommended)
- B. Only convert the 4 stubs
- C. Full APG listbox-multi suite (Ctrl+A, Shift+Home/End, etc.)
**Selected:** A — convert + add 2–3 anchor/aria tests
**Rationale captured in CONTEXT.md D-04.**

## Deferred Ideas

Captured in CONTEXT.md `<deferred>`:
- Ctrl+A select-all
- Shift+Home / Shift+End range-to-bounds
- Ctrl+Click discontiguous selection
- `aria-activedescendant` vs roving DOM focus (planner discretion, not user-decision)

## Carried Forward (no questions asked)

- Locale prop + `getAnnouncement` from Phase 27 — already wired in MultiSelect
- `hasInteracted` ref convention — already in source
- D-02a anti-pattern gate (Phase 22)
- Atomic commits per task (project-wide)
- No breaking changes (ROADMAP success #5)

## Notes

- Phase has very tight scope from ROADMAP (5 success criteria). Most "what to build" is locked.
- Discussion focused entirely on HOW (anchor model, Space gating, plan/test shape).
- No scope creep raised by user.
- Total turns: 4 (one per area), no follow-ups needed — all selections were the recommended option.
