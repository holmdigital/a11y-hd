---
phase: 29
name: MultiSelect APG Listbox-Multi Completeness
slug: multiselect-apg-listbox-multi-completeness
created: 2026-05-12
milestone: v0.7 APG Completion
requirements: [TC-11-IMPL]
---

<domain>
**What this phase delivers:** MultiSelect satisfies the full W3C APG listbox-multi
contract — `aria-multiselectable="true"` on the listbox, dynamic `aria-selected`
per option (currently hardcoded `false`), Space toggles focused option without
moving focus (currently types literal space), Shift+ArrowUp/Down extends selection
range from an anchor.

**Bounded by:** ROADMAP success criteria 1–5. No interface change. No live-region
work (TC-11-LIVE shipped in Phase 27). Chip/token UI unchanged. Stays one widget,
one source file, one test file.
</domain>

<canonical_refs>
**Required reading for downstream agents:**
- `.planning/ROADMAP.md` — Phase 29 success criteria 1–5 (lines 180–189 region)
- `.planning/phases/27-apg-live-regions/27-CONTEXT.md` — `hasInteracted` ref convention + locale prop pattern
- `.planning/phases/28-datepicker-apg-dialog-grid/28-02-PLAN.md` — APG keyboard handler template (Plan 28-02 pattern: switch on `e.key`, `e.preventDefault()`, focus-state management)
- `.planning/phases/24-complex-apg-widget-test-coverage/24-03-SUMMARY.md` — Phase 24 stub strategy + APG-gap rows already in MultiSelect.test.tsx
- `packages/components/src/MultiSelect/MultiSelect.tsx` — current source; gaps visible at L295 (`role="listbox"` missing `aria-multiselectable`), L304 (`aria-selected={false}` hardcoded)
- `packages/components/src/MultiSelect/MultiSelect.test.tsx` — 4 APG-gap stubs at L364–373 to convert
- W3C APG: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ (multiple-select listbox section)
</canonical_refs>

<decisions>

### D-01: Selection-anchor model — "last non-Shift focus"
**Decision:** Anchor index is set whenever the user focuses an option WITHOUT Shift held —
first ArrowDown when listbox opens, plain ArrowUp/Down navigation, click on an option,
or type-ahead jumps. Shift+ArrowUp/Down extends selection from anchor to current focus.
A subsequent non-Shift Arrow moves the anchor.

**Why:** Matches W3C APG listbox-multi reference implementation. Intuitive — anchor
follows the "starting point" of any range a user might want to extend.

**Implementation hint for planner:**
```typescript
const anchorIndex = useRef<number>(-1);
// In handleKeyDown:
//   - On plain Arrow: setFocusedIndex(next); anchorIndex.current = next;
//   - On Shift+Arrow: setFocusedIndex(next); extend selection from anchorIndex.current to next
```

### D-02: Space-toggle gating — "open + focusedIndex ≥ 0"
**Decision:** Space toggles the focused option only when `isOpen === true` AND
`focusedIndex >= 0`. Otherwise Space falls through to default input behavior (types
a literal space in the search field).

**Why:** Preserves combobox typing UX. Matches mental model: "if I'm clearly navigating
the list, Space acts on the list; if I'm typing a query, Space types."

**Implementation hint for planner:**
```typescript
case ' ':
  if (isOpen && focusedIndex >= 0) {
    e.preventDefault();
    toggleOption(availableOptions[focusedIndex].value);  // do NOT close, do NOT move focus
    return;
  }
  // fall through — input handles space normally
  break;
```

### D-03: Plan structure — single plan
**Decision:** All work lands in ONE plan: `29-01-PLAN.md`. ARIA semantics + Space-toggle +
Shift+Arrow + stub conversion + new tests in one cohesive change. Estimated 2–3 atomic commits.

**Why:** No breaking change, one widget, one source file, one test file. Splitting adds
orchestration overhead without isolation benefit. Smaller than Phase 28-02 in scope.

### D-04: Test scope — convert 4 stubs + add anchor/aria coverage
**Decision:** Convert the 4 existing APG-gap stubs in MultiSelect.test.tsx (L364–373) to
real assertions. Add 2–3 new tests:
1. `aria-multiselectable="true"` is on the listbox element
2. Anchor resets on plain Arrow (Shift+Arrow→Arrow→Shift+Arrow extends from new anchor, not original)
3. Space-toggle preserves focus (focusedIndex unchanged after Space)

Total test delta: ~7–9 changed/added in MultiSelect.test.tsx.

**Why:** Stubs alone leave anchor and dynamic-aria-selected logic uncovered. Full APG suite
(Ctrl+A, Shift+Home/End, etc.) is out of scope per ROADMAP — those would be a follow-up phase.

**Out of scope (deferred):** Ctrl+A select-all, Shift+Home/End range-to-bounds, Ctrl+Click
discontiguous selection. Note in DISCUSSION-LOG.md as "potential v0.8 backlog if APG-completeness
audit demands it."

</decisions>

<carried_forward>
- **Locale prop + `getAnnouncement` (Phase 27):** MultiSelect already wired. No change.
- **`hasInteracted` ref convention (Phase 27 D-04):** Live-region announce on selection
  count change; already in source. New Space-toggle path MUST also set `hasInteracted.current = true`
  to keep announcements firing.
- **D-02a anti-pattern gate (Phase 22):** 0 querySelector / configureAxe / toMatchSnapshot.
  Use getByRole / firstElementChild / children for traversal.
- **Atomic commits per task (project-wide):** feat-then-test or test-then-feat per Plan 28-02 example.
- **No breaking changes (ROADMAP success #5):** `MultiSelectProps` interface untouched;
  no new props.
</carried_forward>

<code_context>
**Current MultiSelect source gaps (planner: address each):**
- `MultiSelect.tsx:295` — `<ul role="listbox">` missing `aria-multiselectable="true"` and `aria-activedescendant` (consider whether activedescendant is needed for SR + APG, or roving via DOM focus)
- `MultiSelect.tsx:304` — `aria-selected={false}` hardcoded; must reflect `selected.includes(option.value)`
- `MultiSelect.tsx` keyDown handler (~L100+) — no Space branch (currently passes through to input which types literal space); no Shift+Arrow branch
- No anchor ref exists yet — add `anchorIndex = useRef(-1)` next to existing refs
- `handleSelect` adds to `selected[]`; need new `toggleOption(value)` for Space-path that adds OR removes without closing the listbox or moving focus

**Test file pattern reference:**
- Phase 24 partial-stub rows live at `MultiSelect.test.tsx:364–373`. Same `it.each(...)` table can be split: rows that now have real implementation get individual `it()` blocks with proper asserts; remove the no-throw stub for them. The describe block JSDoc header must drop the "TC-11-IMPL backlog" notes for the rows that become real.

**WCAG SC update needed:** Already claims 1.3.1, 2.1.1, 2.4.3, 4.1.2, 4.1.3. No new SCs (existing ones already cover ARIA + keyboard + status messages). Verify the JSDoc header still lists them post-change.
</code_context>

<deferred>
- **Ctrl+A select-all** — APG listbox-multi optional; user said no. Backlog if v0.8 audit demands.
- **Shift+Home / Shift+End range-to-bounds** — same: APG-optional, deferred.
- **Ctrl+Click discontiguous selection** — mouse equivalent of Ctrl-keyboard; deferred.
- **`aria-activedescendant` vs roving DOM focus** — planner picks one based on what fits the existing `focusedIndex` state model best. Both satisfy APG; not a user-decision question.
</deferred>

<success_signals>
For verifier — what "done" looks like:
- `<ul role="listbox" aria-multiselectable="true">` in DOM
- `aria-selected` on each option reflects `selected.includes(option.value)` dynamically
- Space on focused option (listbox open) toggles selection; focus and listbox open-state unchanged
- Space in input (listbox closed OR no focused index) types a literal space
- Shift+ArrowDown from focusedIndex 2 to focusedIndex 5 selects indices 2–5 (range extend from anchor)
- Plain ArrowDown after Shift+Arrow moves anchor to new focus
- All 4 Phase 24 APG-gap stubs converted to real `it()` blocks with proper asserts (no `it.each` no-throw)
- Test count: 22 → ~29–31 in MultiSelect.test.tsx; full suite stays green
- D-02a clean
- axe-clean smoke (existing test still passes)
- `npm run verify -w @holmdigital/components` exits 0
</success_signals>
