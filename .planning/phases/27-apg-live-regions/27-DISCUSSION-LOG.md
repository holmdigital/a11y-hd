# Phase 27 Discussion Log

**Date:** 2026-05-11
**Phase:** 27 — APG Live Regions

## Areas Discussed

### Locale-awareness
**Question:** Should the live-region announcement text be localized per the component's `locale` prop, or English-only?

**Options presented:**
- Localized per `locale` prop (recommended)
- English-only (matches Phase 25 STMT-01 policy)
- English-only with locale TODO

**User choice:** Localized per `locale` prop

**Rationale:** Most consequential for assistive tech — a Swedish user with a screen reader shouldn't hear "10 results" in English mid-flow. Translation surface is small (~32 strings) and the components already pass locale down. Different policy from STMT-01 (which used English placeholder because the placeholder signals dev-config error, not real content).

### Debounce
**Question:** Combobox fires live-region on every keystroke — how should that be paced?

**Options presented:**
- Debounce ~300ms via local state (recommended)
- Use LiveRegion's `clearAfter` only, no debounce
- No debounce at all

**User choice:** Debounce ~300ms via local state

**Rationale:** W3C APG combobox-with-autocomplete guidance says don't barrage the user with every-character-typed count. 300ms is a common pause-threshold value. Implementation: `useEffect` + `setTimeout` cleanup. Debounce lives in the consumer (Combobox), NOT in LiveRegion (whose `clearAfter` is about re-announce semantics, not throttling).

### DatePicker scope
**Question:** DatePicker live-region scope — announce now using native `<input type="date">` onChange, or defer to Phase 28's calendar UI?

**Options presented:**
- Defer to Phase 28 (recommended)
- Announce now on native input onChange

**User choice:** Defer to Phase 28

**Rationale:** Native `<input type="date">` `onChange` fires inconsistently across browsers (some on every digit, some on full-date commit); jsdom doesn't replicate this reliably. Phase 28's `role="grid"` calendar UI's `onSelect` is the natural announcement trigger. Phase 27 ships only TC-09-LIVE (Combobox) + TC-11-LIVE (MultiSelect). ROADMAP + REQUIREMENTS need small updates to move TC-10-LIVE → Phase 28.

## Deferred Ideas

- `Intl.PluralRules` for complex plural languages (Polish 1/2-4/5+, Czech, Russian, Arabic) — Phase 27 uses simple 0/1/N branching
- Live-region politeness as a prop (`ariaLive` overridable) — both widgets ship `polite` hardcoded; consumer override is a v0.8+ backlog item if requested
- `_i18n/` as a published subpath export — kept internal for Phase 27; revisit if consumers ask for translation override

## Claude's Discretion (not asked)

- **D-04 initial-render suppression:** announce only on changes, not on mount — per W3C APG guidance. Uses `useRef` + `hasInteracted` flag. Avoids "10 results available" being announced when Combobox first renders.
- **D-05 test additions:** +3 tests per widget (no-initial-announce + announce-on-change + locale-fallback for Combobox; no-initial + announce-on-toggle + chip-remove for MultiSelect). 28/453 → 28/459 baseline shift.
- **D-06 single plan with 3 tasks:** shared `_i18n/live-region-strings.ts` is the load-bearing dep; splitting into 3 plans would force inter-plan ordering on the shared file. Tasks 2+3 are independent (different widget sources).
- **`_i18n/` exclusion from tsup build:** new utility directory should NOT be bundled as a public subpath (mirrors `_test/` and `_hooks/` convention). Planner verifies tsup glob doesn't accidentally pick it up.
- **Translation-quality flag:** native-speaker review of the 16-locale translations should happen during execution; flag any uncertain strings in SUMMARY for follow-up (mirrors AccessibilityStatement en-au pattern).
