---
phase: 27-apg-live-regions
plan: 01
subsystem: components
tags: [apg, live-region, wcag-4.1.3, i18n, combobox, multiselect]
requires: [TC-09-LIVE, TC-11-LIVE]
provides:
  - "packages/components/src/_i18n/live-region-strings.ts (LIVE_REGION_STRINGS, getAnnouncement, LiveRegionLocale, LiveRegionKey)"
  - "Combobox locale?: string prop + debounced LiveRegion (TC-09-LIVE)"
  - "MultiSelect locale?: string prop + LiveRegion (TC-11-LIVE)"
affects:
  - packages/components/src/Combobox/Combobox.tsx
  - packages/components/src/MultiSelect/MultiSelect.tsx
  - packages/components/tsup.config.ts
tech-stack:
  added: []
  patterns:
    - "Shared _i18n/ helper directory excluded from tsup public entries (mirrors _hooks/, _test/)"
    - "hasInteracted ref pattern suppresses initial-mount live-region announcement (D-04)"
    - "300ms debounce inside Combobox consumer; LiveRegion stays presentational"
key-files:
  created:
    - packages/components/src/_i18n/live-region-strings.ts
    - .planning/phases/27-apg-live-regions/27-01-SUMMARY.md
  modified:
    - packages/components/tsup.config.ts
    - packages/components/src/Combobox/Combobox.tsx
    - packages/components/src/Combobox/Combobox.test.tsx
    - packages/components/src/MultiSelect/MultiSelect.tsx
    - packages/components/src/MultiSelect/MultiSelect.test.tsx
decisions:
  - "Added additive optional `locale?: string` prop to both widgets (default 'en'); non-breaking — existing 18 Combobox + 22 MultiSelect tests stay green unchanged. CONTEXT.md line 183 said 'no prop API changes' but actual source had no locale prop (CONTEXT line 53 discrepancy). Flag for retro."
  - "Debounce-test mechanism: real timers + findByText(timeout: 1000). vi.useFakeTimers + advanceTimers wiring deadlocked user-event v14's internal setTimeout in vitest 4.x (5s test timeout reproduced). Real timers cost ~0.4s per test; acceptable."
  - "tsup `_i18n/` exclusion: added `'!src/_i18n/**'` to the entry array (mirrors `_test/`, `_hooks/`). Verified `dist/_i18n/` does not exist post-build."
metrics:
  duration: "~12 minutes"
  completed: "2026-05-11"
  tasks: 3
  files_changed: 6
  tests_added: 6
  test_files_added: 0
---

# Phase 27 Plan 01: APG Live-Regions for Combobox + MultiSelect Summary

W3C APG-compliant live-region announcements added to Combobox (300ms debounced filtered-results count) and MultiSelect (immediate selection count), localized across 16 locales via a new shared `_i18n/live-region-strings.ts` module. Closes TC-09-LIVE + TC-11-LIVE; +6 tests, no new test files, zero regressions.

## What Shipped

| File | Change | Lines |
|------|--------|-------|
| `packages/components/src/_i18n/live-region-strings.ts` | **new** | +108 |
| `packages/components/tsup.config.ts` | exclude `_i18n/` | +2 / −1 |
| `packages/components/src/Combobox/Combobox.tsx` | +locale prop, +LiveRegion, +debounced useEffect | +24 / −2 |
| `packages/components/src/Combobox/Combobox.test.tsx` | +describe `live-region (TC-09-LIVE)`, 3 tests | +71 / −5 |
| `packages/components/src/MultiSelect/MultiSelect.tsx` | +locale prop, +LiveRegion, +useEffect (no debounce), `hasInteracted` flipped in both `handleSelect`+`handleRemove` | +25 / −2 |
| `packages/components/src/MultiSelect/MultiSelect.test.tsx` | +describe `live-region (TC-11-LIVE)`, 3 tests | +97 / −3 |

## Test Count Delta (vitest output)

```
Test Files  28 passed (28)
     Tests  459 passed (459)
```
Baseline was 28 files / 453 tests → **+6 tests, 0 new files**. Per-file breakdown:
- Combobox.test.tsx: 18 → 21
- MultiSelect.test.tsx: 22 → 25

## Phase-26 Guard Status

| Guard | Status |
|-------|--------|
| `test:ci` chain (vitest + wcag-headers + no-tailwind-leak + no-test-leak) | PASS |
| `check:no-tailwind-leak` | ok — 6 file(s) across 3 scoped dir(s) |
| `check:no-test-leak` | ok — 90 dist file(s) |
| `check-wcag-headers` | ok — 24 test file(s) all carry the marker |
| D-02a anti-pattern gate on new test blocks | clean (zero `querySelector`/`configureAxe`/`toMatchSnapshot`) |
| `tsup` build emits no `dist/_i18n/` | verified |

## Translation Review Queue (needs-native-review)

Mirrors the AccessibilityStatement `en-au` precedent — planner-drafted translations ship as DRAFT, native-speaker review tracked before v0.7 publish.

The 6 English variants (`en`, `en-gb`, `en-us`, `en-ca`, `en-au`) all use identical English copy; no review required.

| Locale | combobox.results | multiselect.selected | Status |
|--------|------------------|----------------------|--------|
| `sv` (Swedish) | Inga träffar / 1 träff / N träffar | Inga valda / 1 vald / N valda | needs-native-review |
| `de` (German) | Keine Ergebnisse / 1 Ergebnis / N Ergebnisse | Nichts ausgewählt / 1 Element ausgewählt / N Elemente ausgewählt | needs-native-review |
| `fr` (French) | Aucun résultat / 1 résultat / N résultats | Aucun élément sélectionné / 1 élément sélectionné / N éléments sélectionnés | needs-native-review |
| `es` (Spanish) | Sin resultados / 1 resultado / N resultados | Nada seleccionado / 1 elemento seleccionado / N elementos seleccionados | needs-native-review |
| `nl` (Dutch) | Geen resultaten / 1 resultaat / N resultaten | Niets geselecteerd / 1 item geselecteerd / N items geselecteerd | needs-native-review |
| `it` (Italian) | Nessun risultato / 1 risultato / N risultati | Nessun elemento selezionato / 1 elemento selezionato / N elementi selezionati | needs-native-review |
| `pt` (Portuguese) | Sem resultados / 1 resultado / N resultados | Nada selecionado / 1 item selecionado / N itens selecionados | needs-native-review |
| `da` (Danish) | Ingen resultater / 1 resultat / N resultater | Intet valgt / 1 valgt / N valgt | needs-native-review |
| `no` (Norwegian) | Ingen treff / 1 treff / N treff | Ingen valgt / 1 valgt / N valgt | needs-native-review |
| `fi` (Finnish) | Ei tuloksia / 1 tulos / N tulosta | Ei valintoja / 1 valittu / N valittua | needs-native-review |
| `pl` (Polish) | Brak wyników / 1 wynik / N wyników | Brak wybranych / 1 wybrany / N wybranych | needs-native-review-plural-rules-too |

> Polish (and other Slavic) plural rules are more complex than 0/1/N. Simple branching ships per D-02 (planner decision); accurate `Intl.PluralRules` migration deferred to v0.8 backlog.

## Deviations from Plan

### Rule 1 — Bug fix: plan-text filter assumption

**Found during:** Task 2 verification (first vitest run timed out).

**Issue:** Plan assumed `await user.type(input, 'A')` would filter Combobox's `[Apple, Banana, Avocado]` down to **2 results** (Apple + Avocado). Reality: case-insensitive substring match also picks up `Banana` (contains 'a') → 3 results = no `filteredOptions.length` change from mount (which also had length 3) → `useEffect` never re-ran → no announcement fired. Test failed at `findByText('2 results')`.

**Fix:** Adjusted the typed string to `'Av'` (matches **only Avocado**, length 3 → 1). Updated both new tests + the inline-comment assertions to `'1 result'`. Same English string applies to the locale-fallback test.

**Files:** `packages/components/src/Combobox/Combobox.test.tsx`
**Commit:** `10237fb`

### Rule 1 — Bug fix: fake-timers deadlock with user-event v14

**Found during:** Task 2 verification (initial implementation per plan used `vi.useFakeTimers()` + `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`).

**Issue:** `await user.type(...)` hangs indefinitely — vitest 4.x + user-event v14's internal setTimeout-based keystroke delay does not unblock under `vi.useFakeTimers()` even with the documented `advanceTimers` bridge. Test timed out at 5s.

**Fix:** Switched to real timers + `findByText(text, {}, { timeout: 1000 })`. CI cost ≈ +0.4s per debounce test (two tests, total ≈ +0.8s). Deterministic, no leaked timers across test boundaries.

**Files:** `packages/components/src/Combobox/Combobox.test.tsx`
**Commit:** `10237fb` (folded into same Task 2 commit as the previous fix).

### Rule 3 — Plan-text mismatch: MultiSelect interaction pattern

**Found during:** Task 3 test-writing.

**Issue:** Plan's example uses `screen.getByRole('button', { name: /fruits/i })` as a "trigger" to open the listbox. MultiSelect has no such trigger button — the `<input role="combobox">` itself opens the popup via `onFocus`/click (lines 254–255 of MultiSelect.tsx; existing Tier-2 tests use this pattern at lines 164–180 of MultiSelect.test.tsx).

**Fix:** Replaced trigger pattern with `screen.getByRole('combobox')` + `user.click(input)` to match the established source contract. Also wrapped test 2 in the same controlled-state `Wrapper` as test 3 (the plan only required Wrapper for test 3, but test 2 also needs `onChange`→`setSel` so `selected.length` actually changes after clicking the option — without Wrapper, `selected` stays `[]` and no announcement would fire).

**Files:** `packages/components/src/MultiSelect/MultiSelect.test.tsx`
**Commit:** `46720bd`

### Architectural addition flagged for retro

CONTEXT.md line 183 stated "no prop API changes"; CONTEXT.md line 53 (and the plan's `<interfaces>` block) clarified that neither widget currently has a `locale` prop. The plan resolves this by adding `locale?: string` (default `'en'`) — an **additive optional** prop, non-breaking for every existing consumer (TypeScript optional, all 18+22 existing tests pass unchanged with no locale-related test edits). Flag for retro: tighten CONTEXT prop-API constraints upfront when an i18n requirement is in scope.

## Commits

- `47e1068` — feat(27-01): add shared _i18n/live-region-strings.ts (16 locales × 2 keys)
- `10237fb` — feat(27-01): Combobox live-region for filtered-results count (TC-09-LIVE)
- `46720bd` — feat(27-01): MultiSelect live-region for selection count (TC-11-LIVE)

## Self-Check: PASSED

- FOUND: `packages/components/src/_i18n/live-region-strings.ts`
- FOUND: `packages/components/tsup.config.ts` (modified — `!src/_i18n/**` present)
- FOUND: `packages/components/src/Combobox/Combobox.tsx` (locale prop + LiveRegion)
- FOUND: `packages/components/src/MultiSelect/MultiSelect.tsx` (locale prop + LiveRegion)
- FOUND: commit `47e1068`, `10237fb`, `46720bd` in `git log`
- VERIFIED: `dist/_i18n/` does NOT exist after `npm run build -w @holmdigital/components`
- VERIFIED: 28 files / 459 tests pass (+6 from baseline 453)
- VERIFIED: `test:ci` chain (wcag-headers + no-tailwind-leak + no-test-leak) green
- VERIFIED: D-02a clean on Combobox.test.tsx + MultiSelect.test.tsx additions
