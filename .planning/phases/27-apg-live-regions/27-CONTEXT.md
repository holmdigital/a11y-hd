---
phase: 27
phase_name: APG Live Regions
date: 2026-05-11
requirements: TC-09-LIVE, TC-11-LIVE
scope_change: TC-10-LIVE moved to Phase 28
---

# Phase 27 Context

## Domain

Add W3C APG live-region announcements to Combobox and MultiSelect — the two widgets where filtered/selected state changes too quickly for the surrounding DOM to convey the change to assistive tech. Each widget renders a `LiveRegion` (or `aria-live="polite"` element) that announces the most consequential state change: filtered results count on Combobox, selection count on MultiSelect. Announcement text is localized per the component's existing `locale` prop.

**Scope change vs the original v0.7 ROADMAP:** TC-10-LIVE (DatePicker live-region) moves to Phase 28. The DatePicker live-region is more naturally triggered by Phase 28's `role="grid"` calendar UI's `onSelect` handler than by the current native `<input type="date">` element's inconsistently-firing `onChange`. ROADMAP and REQUIREMENTS need a small update to reflect this.

## Canonical Refs

- `.planning/ROADMAP.md` Phase 27 entry (live-region success criteria — TC-10-LIVE bullet moves to Phase 28)
- `.planning/REQUIREMENTS.md` — TC-09-LIVE, TC-11-LIVE (TC-10-LIVE traceability row moves to Phase 28)
- `.planning/phases/22-test-infra-and-first-7-components/22-CONTEXT.md` (Phase 22 conventions inherited)
- `.planning/phases/24-complex-apg-widget-test-coverage/24-CONTEXT.md` (D-05 live-region testing pattern; D-01 widget-stub strategy that this phase partially closes)
- `packages/components/src/LiveRegion/LiveRegion.tsx` — 60 LOC, props: `message` (string) + `ariaLive` ('polite'|'assertive') + `clearAfter` (optional debounce-after-announce). SSR-safe. **Phase 26-01 fixed the TS2503 — LiveRegion is now build-clean.**
- `packages/components/src/Combobox/Combobox.tsx` — has `filteredOptions` array (line 80), uses `useEffect` for state — natural insertion point for debounced live-region
- `packages/components/src/MultiSelect/MultiSelect.tsx` — has `selectedValues` array, chips render based on it
- `packages/components/src/Combobox/Combobox.test.tsx` — 18 tests landed Phase 24; new live-region assertions extend this file
- `packages/components/src/MultiSelect/MultiSelect.test.tsx` — 22 tests landed Phase 24; new live-region assertions extend this file
- `packages/components/src/_test/helpers.ts` — `waitFor` available via testing-library; pattern for async live-region content assertion
- W3C WAI-ARIA APG — Combobox pattern (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) explicitly recommends results-count announcements; Listbox-multi pattern recommends selection-count announcements

## Code Context

**LiveRegion API:**
- Renders a visually-hidden `<div aria-live={polite|assertive} aria-atomic="true">` with the current `message`
- `message` prop changes trigger re-announce via `useEffect`
- `clearAfter` clears message after N ms (useful so repeat-same-message re-announces)
- NO debounce on incoming messages — that has to live in the consumer

**Combobox current state:**
- Filter happens on `query` change → recomputes `filteredOptions`
- No live-region rendered today (D-05 deferred from Phase 24)
- 18 existing tests assert combobox-with-listbox-popup contract; planner adds ~2-3 new tests for the live-region

**MultiSelect current state:**
- `selectedValues` controlled via parent state OR internal state via `defaultSelected`
- Chips render from `selectedValues` (one per selected option)
- No live-region rendered today
- 22 existing tests assert listbox-multi shape; planner adds ~2-3 new tests for the live-region

**Locale prop convention:**
- All 16+ supported locales: `sv`, `en`, `en-gb`, `en-us`, `en-ca`, `en-au`, `de`, `fr`, `es`, `nl`, `it`, `pt`, `da`, `no`, `fi`, `pl` (plus the variants from AccessibilityStatement template work)
- Each component already destructures `locale?: string` (defaulting to `'en'`)
- Phase 26-04 added similar locale-aware fallback handling in HelpText/Select/Toast for lucide-react glyphs — same pattern reuse opportunity

**Phase 22 conventions in scope:**
- WCAG-SC marker required when modifying test files (existing markers extended)
- D-02a: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot` in test additions
- 28 test files / 453 tests baseline preserved

## Decisions

### D-01 — Scope: 2 widgets in Phase 27 (Combobox + MultiSelect); DatePicker moves to Phase 28

TC-10-LIVE (DatePicker live-region) is removed from Phase 27 and added to Phase 28's success criteria. Rationale: Phase 28 implements the `role="grid"` calendar UI; that UI's `onSelect` handler is the natural place to dispatch the selected-date announcement. Triggering live-region off the native `<input type="date">` `onChange` (the Phase 27 alternative) is unreliable because browsers fire onChange inconsistently for partial dates and jsdom doesn't replicate this consistently.

**Side effect:** ROADMAP.md and REQUIREMENTS.md need small updates (move TC-10-LIVE traceability row from Phase 27 → Phase 28; update Phase 27 and Phase 28 goal statements to match). The planner does this as part of plan-phase frontmatter cleanup OR documents it for the orchestrator to apply.

### D-02 — Localized announcement text per `locale` prop

Read the existing `locale` prop on each widget (defaults to `'en'`) and pick announcement text from a small locale table. Translation surface for Phase 27: ~2 announcement keys × 16 locales = 32 strings total (Combobox results-count + MultiSelect selection-count, each pluralized 0/1/2+).

**Implementation pattern (planner picks the cleanest version):**

Option A — shared `_i18n/live-region-strings.ts` module exporting a typed object:
```ts
export const LIVE_REGION_STRINGS = {
  combobox: {
    results: {
      en: (n) => n === 0 ? 'No results' : n === 1 ? '1 result' : `${n} results`,
      sv: (n) => n === 0 ? 'Inga träffar' : n === 1 ? '1 träff' : `${n} träffar`,
      // ... 14 more locales
    }
  },
  multiselect: {
    selected: {
      en: (n) => n === 0 ? 'No items selected' : n === 1 ? '1 item selected' : `${n} items selected`,
      sv: (n) => `${n} valda`,
      // ...
    }
  }
};
```

Option B — per-component locale table inline (mirrors `AccessibilityStatement.tsx` `TEMPLATES`/`replacements` pattern). Smaller per-file, more duplication.

**Recommendation:** Option A — shared module, single import path, no duplication. The `_i18n/` directory is new but follows the `_test/` and `_hooks/` underscore-prefixed-utility convention.

**Plural rules:** for Phase 27, use simple `0 / 1 / N` branch (English-style). Languages with more complex plural rules (e.g., Polish 1/2-4/5+) get accurate translations but the JS code stays simple. If Polish/Czech/Russian-grade plural correctness is needed, a future v0.8 backlog item can introduce `Intl.PluralRules`. For Phase 27, simple branching is acceptable per "ship it" pragmatism.

**Fallback chain:** if a locale isn't in the table, fall back to `en` (matches the existing AccessibilityStatement fallback pattern at line 401).

### D-03 — Debounce ~300ms in consumer, not LiveRegion

Add a 300ms debounce inside Combobox (and MultiSelect if applicable) so the live-region `message` only updates 300ms after the last keystroke. Matches W3C APG guidance for combobox-with-autocomplete — don't barrage the user with every-character-typed count.

**Implementation pattern (planner picks cleanest):**

```tsx
// Inside Combobox
const [announcement, setAnnouncement] = useState('');
useEffect(() => {
  const timer = setTimeout(() => {
    setAnnouncement(formatResultsCount(filteredOptions.length, locale));
  }, 300);
  return () => clearTimeout(timer);
}, [filteredOptions.length, locale]);

// Render
<LiveRegion message={announcement} ariaLive="polite" />
```

For MultiSelect, debounce is less critical because selections happen at user-pace (click/Space), not keystroke-rate. Plan can opt to skip debounce for MultiSelect; live-region updates immediately on `selectedValues` change. Document the asymmetry.

**Don't use `LiveRegion`'s `clearAfter`** for the debounce purpose — `clearAfter` clears the message N ms AFTER announce, not BEFORE. It's about re-announce semantics, not throttling.

### D-04 — Initial-render announcement: only on changes, not on mount

Per W3C APG guidance: announce CHANGES, not initial state. Initial render of Combobox shouldn't announce "10 results available" — that information is conveyed by the popup's `role="listbox"` ARIA structure when the user navigates to it. Live-region fires only when:
- Combobox: filter query causes `filteredOptions.length` to change after first user input
- MultiSelect: selection state changes after first user interaction

Use a ref or "user has interacted" flag to suppress the initial mount's announcement:

```tsx
const hasInteracted = useRef(false);
useEffect(() => {
  if (!hasInteracted.current) return;
  // ... announce
}, [...]);
// Set hasInteracted.current = true on first onChange / onSelect
```

### D-05 — Test additions per widget

**Combobox.test.tsx** (Phase 24 baseline 18 tests):
- Add `describe('live-region (TC-09-LIVE)', ...)` block with ~3 tests:
  1. No announcement on initial mount (region empty)
  2. Announces filtered-options count after user types and debounce elapses (use `vi.useFakeTimers()` + `vi.advanceTimersByTime(300)` + `waitFor`)
  3. Locale fallback: passing `locale="xx"` (unknown) renders English announcement
- Expected new test count: +3

**MultiSelect.test.tsx** (Phase 24 baseline 22 tests):
- Add `describe('live-region (TC-11-LIVE)', ...)` block with ~3 tests:
  1. No announcement on initial mount
  2. Announces selection count after option toggle (no debounce — assert directly via `waitFor`)
  3. Removes chip → announces new lower count
- Expected new test count: +3

**Total Phase 27 test delta:** 28 files / 453 tests → 28 files / 459 tests (+6 tests; no new files).

### D-06 — Plan shape: 1 plan, 3 tasks

Single plan `27-01-PLAN.md` with 3 tasks:
1. Task 1: Create `packages/components/src/_i18n/live-region-strings.ts` shared module with 2 strings × 16 locales
2. Task 2: Refactor Combobox.tsx to render LiveRegion with debounced announcement; extend Combobox.test.tsx with 3 new tests
3. Task 3: Refactor MultiSelect.tsx to render LiveRegion (no debounce); extend MultiSelect.test.tsx with 3 new tests

Single plan because the shared `_i18n` module is the load-bearing dependency for both widgets; splitting would force inter-plan ordering on a shared file. Tasks 2 and 3 are independent (different widget source + test files).

## Deferred Ideas

- **TC-10-LIVE moved to Phase 28** (per D-01) — calendar UI's `onSelect` is the natural trigger
- **`Intl.PluralRules` for complex plural languages** (Polish, Czech, Russian, Arabic) — Phase 27 ships simple 0/1/N branching; complex plural correctness deferred to a future i18n-quality milestone (`TC-09-LIVE-i18n-plurals` if/when prioritized)
- **Live-region for ErrorSummary** — already announced via `role="alert"` (Phase 22 TC-07 coverage), no separate live-region needed
- **Live-region for Tabs** — APG Tabs pattern doesn't require live-region announcement; tab activation is conveyed by `aria-selected`
- **Polite vs assertive choice as a prop** — both widgets ship `ariaLive="polite"` hardcoded. Consumer-overridable politeness is a v0.8+ backlog item if requested.

## Constraints

- 28 test files / 453 tests baseline must stay green
- No changes to LiveRegion source (Phase 26-01 fixed it; don't refactor)
- No prop API changes to Combobox or MultiSelect (live-region is internal implementation)
- Existing 16 supported locales — no new locale additions in Phase 27; if any need translation review, flag in SUMMARY for native speaker review (mirrors AccessibilityStatement template pattern)
- Translations follow simple 0/1/N pluralization; complex plural rules are out of scope per D-02
- Phase 22 D-02a anti-pattern gate enforced on test additions
- `_i18n/` directory is NEW — must NOT be picked up by tsup glob as a built entry (the glob `src/*/!(*.test|*.stories).{ts,tsx}` would match `src/_i18n/live-region-strings.ts` since it doesn't have a sibling `.test` or `.stories`). Plan must verify the tsup config either excludes `_i18n/` explicitly (like it does `_test/` and `_hooks/`) OR consciously includes it as a published subpath. Recommend: exclude `_i18n/` from build entries (utility, not a public surface); Combobox/MultiSelect import directly via relative path.

## Success Criteria (from ROADMAP, adjusted)

1. Combobox renders a `LiveRegion` that announces filtered-results count after 300ms debounce; Combobox.test.tsx asserts the announcement updates via `waitFor` with fake timers
2. MultiSelect renders a `LiveRegion` that announces selection count immediately on chip add/remove; MultiSelect.test.tsx asserts the announcement
3. ~~DatePicker renders a `LiveRegion` for selected-date~~ → **MOVED TO PHASE 28** (D-01)
4. Announcement text is localized per the widget's `locale` prop using a shared `_i18n/live-region-strings.ts` table (English fallback for unknown locales)
5. No prop API changes to either widget; existing Phase 24 tests preserved (18 Combobox + 22 MultiSelect = 40 tests stay green)

## Next Steps

`/gsd-plan-phase 27` — produces 1 plan with 3 tasks. Researcher may add value on:
- The exact 16-locale translation strings for both announcement keys (researcher could draft native-speaker-reviewable copy)
- The W3C APG combobox spec's exact debounce recommendation (300ms is a guess; APG may suggest different)
- Whether `_i18n/` should be a published subpath (`@holmdigital/components/i18n`) for consumer override, or kept internal

Alternatively, `--skip-research` and trust the planner to make those calls inline.
