---
phase: 28
phase_name: DatePicker APG Dialog-Grid Keyboard + Live Region
date: 2026-05-11
requirements: TC-10-IMPL, TC-10-LIVE
---

# Phase 28 Context

## Domain

Replace DatePicker's current native `<input type="date">` UI with a fully custom `role="grid"` calendar dialog that satisfies the W3C APG dialog-grid pattern. The calendar renders a month header + 7-column grid + 6-week display with prev/next-month overflow, today/selected highlights, min/max date bounds, and the full APG keyboard matrix (Arrow day-by-day, Home/End week-bounds, PageUp/PageDown month, Shift+PageUp/PageDown year, Enter/Space select, Escape close). The calendar's `onSelect` handler triggers a localized live-region announcement of the selected date (TC-10-LIVE, moved here from Phase 27 per Phase 27 D-01).

**This is the largest implementation surface in v0.7.** ~300-500 LOC of new UI + date math + keyboard handler + CSS file + extending the Phase 27 `_i18n` module.

The user explicitly chose "Replace entirely" over Hybrid / Opt-in / Defer-just-live-region after seeing the trade-off (the existing source's JSDoc defended the native input choice). Trade-off accepted: loses native mobile UX (iOS wheel, Android material), gains full APG conformance + first-party styling control.

## Canonical Refs

- `.planning/ROADMAP.md` Phase 28 (5 success criteria — keyboard contract + live-region)
- `.planning/REQUIREMENTS.md` — TC-10-IMPL, TC-10-LIVE
- `.planning/phases/24-complex-apg-widget-test-coverage/24-02-PLAN.md` + `24-02-SUMMARY.md` — the Phase 24 stub test file that Phase 28 converts from no-throw assertions to real focus/state assertions
- `.planning/phases/24-complex-apg-widget-test-coverage/24-RESEARCH.md` Section 1 (APG dialog-grid keyboard matrix from W3C spec) — already researched, planner can lean on it
- `.planning/phases/27-apg-live-regions/27-CONTEXT.md` (D-02 i18n module pattern; D-04 hasInteracted ref pattern; D-05 live-region testing with `waitFor`)
- `.planning/phases/23-styling-unification/23-CONTEXT.md` (CSS strategy: inline-style + co-located `.css` + custom-property theming + `:focus-visible` in `.css`)
- `packages/components/src/DatePicker/DatePicker.tsx` (121 LOC — current native-input implementation; will be REPLACED, not augmented)
- `packages/components/src/DatePicker/DatePicker.test.tsx` (Phase 24, 23 tests — mostly no-throw stubs for APG keys; Phase 28 converts these)
- `packages/components/src/_i18n/live-region-strings.ts` (Phase 27 — extend with `datepicker.selected` key for all 16 locales)
- `packages/components/src/LiveRegion/LiveRegion.tsx` (Phase 26-01 fixed; integration via `<LiveRegion message=... ariaLive="polite" />`)
- `packages/components/src/Tabs/Tabs.css` + `Accordion.css` + `Breadcrumbs.css` (Phase 23 examples — CSS shape Phase 28 mirrors for `DatePicker.css`)
- W3C WAI-ARIA APG — Date Picker Dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/

## Code Context

**Current DatePicker source (to be replaced):**
- `DatePicker.tsx` lines 1-121
- `DatePickerProps` extends `React.InputHTMLAttributes<HTMLInputElement>` with `label`, `description`, `error`, `className`
- Renders a `<label>` + `<input type="date">` + optional description/error
- No keyboard handling, no calendar UI, no live-region
- Existing Phase 24 tests cover: render, label association, error state, native input semantics, + no-throw stubs for APG keys

**Phase 27 i18n module (to extend):**
- `packages/components/src/_i18n/live-region-strings.ts` — currently has `combobox.results` + `multiselect.selected` × 16 locales
- Phase 28 adds a third key `datepicker.selected` × 16 locales — announcement format: "Selected: {localized date}", with the date itself formatted via `Intl.DateTimeFormat(locale, { dateStyle: 'long' })`
- Phase 27 established the `getAnnouncement(key, locale, count)` shape. For DatePicker the "count" parameter becomes "date" — planner picks: either overload the helper with a typed second-arg, OR add a sibling `getDateAnnouncement(locale, date): string` function. Recommend the latter (cleaner types).

**Phase 24 test stubs to convert (DatePicker.test.tsx):**
- 23 existing tests; many are `it.each` no-throw matrices for Arrow/Home/End/PageUp/PageDown/Shift+PageUp/Shift+PageDown/Enter/Escape
- Phase 28 converts these to assert real focus movement (e.g., ArrowRight from day 15 lands on day 16; ArrowDown moves a week forward; PageUp moves a month back) and state (e.g., `aria-selected="true"` on the clicked cell)
- New tests added for: month/year navigation header buttons, min/max bounds, today highlight, live-region announcement, locale-specific week-start day, focus return to trigger on Escape

**Date math approach (vanilla):**
- `Intl.DateTimeFormat(locale, { weekday: 'short' })` for day-of-week column headers
- `Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })` for header
- `Intl.Locale(locale).weekInfo?.firstDay` for week-start day (Sunday=7 or Monday=1 etc.; locale-aware) — fallback to Monday=1 (ISO 8601) if `weekInfo` is undefined (older runtimes/locales)
- Manual month arithmetic: `new Date(y, m+1, 0).getDate()` = days in month m of year y; `new Date(y, m, 1).getDay()` = day-of-week of the 1st (0=Sunday-7=Saturday in JS Date semantics; map to week-start)
- Today comparison: compare `getFullYear()/getMonth()/getDate()` triples (NOT timestamps — DST and time-of-day shouldn't affect day-matching)
- Min/max bounds: optional `minDate?: Date` + `maxDate?: Date` props; cells outside bounds get `aria-disabled="true"` + `pointer-events: none` + tabindex skipping

**Phase 23 CSS pattern to follow:**
- New file `packages/components/src/DatePicker/DatePicker.css`
- Side-effect `import './DatePicker.css'` at top of `DatePicker.tsx`
- All structural/visual CSS in the `.css` file
- Custom-property theming via `var(--hd-datepicker-{role}, default)` syntax — at minimum: `--hd-datepicker-today-color`, `--hd-datepicker-selected-bg`, `--hd-datepicker-focus-ring`, `--hd-datepicker-disabled-color`
- `:focus-visible` styling in `.css` (NOT JS event handlers) per Phase 23 STY-04 / WCAG 2.4.7
- New entry in `package.json` exports: `"./DatePicker.css": "./dist/DatePicker/DatePicker.css"`
- STY-05 guard (Phase 23) scoped to Tabs/Accordion/Breadcrumbs only — Phase 28 does NOT need to extend the guard's directory list; DatePicker.tsx using `hd-datepicker__*` BEM classes is intentional and not part of the legacy-Tailwind-leak surface

**Phase 22 conventions in scope:**
- WCAG-SC marker on test file additions
- D-02a: 0 `querySelector` / `configureAxe` / `toMatchSnapshot`
- 28/459 baseline preserved; Phase 28 adds ~10-20 tests (real conversions + new tests)

**APG keyboard matrix (from 24-RESEARCH.md §1, verified against W3C):**
- ArrowRight / ArrowLeft → next/previous day
- ArrowDown / ArrowUp → next/previous week (move 7 days)
- Home / End → first / last day of current week (locale-aware week-start)
- PageDown / PageUp → next / previous month (same day-of-month if exists, else last day of target month)
- Shift+PageDown / Shift+PageUp → next / previous year
- Enter / Space → select focused day, close dialog, return focus to trigger
- Escape → close dialog without selecting, return focus to trigger
- Focus management: single `tabindex="0"` on the active cell (roving); all other cells `tabindex="-1"`; calendar dialog itself is a `role="dialog"` with focus trap (reuse Phase 22's `useFocusTrap` hook)

## Decisions

### D-01 — Replace native input entirely with custom calendar UI

Native `<input type="date">` removed; new calendar dialog UI is the only render. Accepted trade-offs:
- Loses iOS wheel + Android material native pickers on touch devices (consumers who need that UX migrate to a downstream wrapper or stay on v0.6 DatePicker)
- Gains full W3C APG dialog-grid conformance, first-party styling control, predictable cross-browser keyboard behavior

**Backwards-compat:** consumers using current DatePicker get a visually-different UI. The prop interface — `label`, `description`, `error`, `className` plus standard `input` HTML attrs — is preserved as much as possible. New optional props: `value?: Date`, `onChange?: (date: Date) => void`, `minDate?: Date`, `maxDate?: Date`, `locale?: string` (default `'en'`, mirrors Phase 27 additive-optional convention). Note: `value` was previously typed via `InputHTMLAttributes`'s `string`; Phase 28 changes the public surface from `string`-typed (HTML form-value) to `Date`-typed. **This is technically a breaking change** but acceptable because:
- The 23 existing tests use the native input directly; rewriting them is in-scope for this phase
- Engine and AccessibilityStatement don't consume DatePicker (verified during Phase 22 SSR audit)
- Document the change in CHANGELOG; major-version-bump conversation happens at v1.0, not v0.7 patch

### D-02 — Date math: vanilla `Date` + `Intl` APIs (no new dependencies)

No `date-fns` / `dayjs` / `luxon`. All date math implemented via:
- `new Date(y, m, d)` constructor + `getFullYear()/getMonth()/getDate()/getDay()` for arithmetic
- `Intl.DateTimeFormat(locale, options).format(date)` for localized day/month names and full-date announcement
- `Intl.Locale(locale).weekInfo?.firstDay` (with Monday=1 fallback for older runtimes that don't support `weekInfo`)
- Manual leap-year + days-in-month via `new Date(y, m+1, 0).getDate()`

**Rationale:** matches the project's no-frills standards/components philosophy. Phase 26-04 just made `lucide-react` an optional peer to shrink the dependency surface — adding `date-fns` immediately undoes that effort. Vanilla `Date` math is well-understood (no DST surprises if we stick to `Date(y, m, d)` constructor and avoid hour-level operations).

**Implementation note:** the planner organizes date helpers into a small utility module `packages/components/src/DatePicker/date-utils.ts` (NOT under `_i18n/` — date helpers are DatePicker-specific). Helper exports: `getDaysInMonth(year, month)`, `getFirstDayOfMonth(year, month)`, `getWeekStartForLocale(locale)`, `isSameDay(a, b)`, `addDays(date, n)`, `addMonths(date, n)`, `clampDate(date, min, max)`, `formatDateForAnnouncement(date, locale)`. The utility file is excluded from tsup public-entry glob (it's internal, not a published subpath).

### D-03 — Plan shape: 3 sequential plans

- **Plan 28-01 (Wave 1, no deps) — Date math + i18n + base calendar render (no keyboard, no live-region yet)**
  - `DatePicker/date-utils.ts` (new) with the 8 helper functions per D-02
  - Extend `_i18n/live-region-strings.ts` with `datepicker.selected` × 16 locales (translations needed for sv/de/fr/es/nl/it/pt/da/no/fi/pl) AND a sibling `getDateAnnouncement(locale, date): string` helper
  - `DatePicker.tsx` REPLACED with new component: trigger button (formatted-date or placeholder text) + popup div containing month header (prev/next/year buttons + month-year text) + 7-col grid of `<button role="gridcell">` cells
  - `DatePicker.css` (new) with structural/visual CSS, custom-property theming, NO interactivity (Plan 28-02 adds keyboard, focus, popup-toggle, etc.)
  - Calendar opens on trigger click but no keyboard nav yet — all cells render correctly, today is highlighted, selected is highlighted, min/max bounds visually disabled
  - Phase 24 stub tests temporarily disabled or skip-marked with TODO note → restored as real assertions in Plan 28-02
  - Verification: full vitest suite stays green excluding the temporarily-skipped Phase 24 stubs

- **Plan 28-02 (Wave 2, depends_on: [28-01]) — APG keyboard handler + focus management**
  - Add `onKeyDown` handler to the grid with the full APG matrix (Arrow / Home / End / PageUp / PageDown / Shift variants / Enter / Space / Escape)
  - Single-tabindex-0 roving via `data-state="focused"` attribute hook (mirrors Phase 23 Accordion `data-state` pattern)
  - Reuse Phase 22 `useFocusTrap` hook for dialog focus trap
  - Escape returns focus to trigger; Enter/Space select + close + return focus
  - Convert Phase 24 no-throw stubs to real assertions: ArrowRight from day 15 → focus on day 16; PageUp → focus on same day-of-month in previous month (or last day if not exists); Shift+PageDown → focus on same date in next year; etc.
  - Verification: all 23 Phase-24 baseline tests converted + ~5 new tests for month/year-nav buttons + bounds + focus-return; baseline 28/459 → ~28/470-480

- **Plan 28-03 (Wave 3, depends_on: [28-02]) — Live-region (TC-10-LIVE) + final test conversion + cleanup**
  - Add LiveRegion to DatePicker; `useState` for announcement; `useRef` for `hasInteracted` (D-04 pattern from Phase 27)
  - Announcement triggers on `onSelect` (Enter/Space/click commit), localized via `getDateAnnouncement(locale, selectedDate)` — uses `Intl.DateTimeFormat(locale, { dateStyle: 'long' })` internally
  - Format: "Selected: {long date in locale}" (English fallback: "Selected: Tuesday, March 14, 2026")
  - 3 new live-region tests added: no-mount-announce + announce-on-select + locale fallback
  - Verification: all Phase 24 stubs converted, 3 live-region tests pass, full suite green

Plans 28-01..03 are strictly sequential — each builds on the previous. No parallelism opportunity within this phase.

### D-04 — CSS strategy: mirror Phase 23 (inline-style + co-located `.css`)

`packages/components/src/DatePicker/DatePicker.css` (new) with:
- All structural/visual CSS (NO Tailwind utilities — never enter the codebase as Phase 23 STY-05 guard would catch them if they leaked into `dist/Tabs|Accordion|Breadcrumbs`, but Phase 28 doesn't extend the guard scope; DatePicker uses `hd-datepicker__*` BEM convention anyway)
- `:focus-visible` selectors in `.css` per Phase 23 STY-04 / WCAG 2.4.7
- Custom-property theming via `var(--hd-datepicker-..., #default)` syntax (Phase 23 D-02 / A1 pattern)
- Minimum custom-property surface: `--hd-datepicker-today-color`, `--hd-datepicker-today-bg`, `--hd-datepicker-selected-color`, `--hd-datepicker-selected-bg`, `--hd-datepicker-focus-ring`, `--hd-datepicker-disabled-color`, `--hd-datepicker-popup-bg`, `--hd-datepicker-popup-border`. Planner decides final list after reading the render shape.
- Side-effect `import './DatePicker.css'` at top of `DatePicker.tsx`
- Add `"./DatePicker.css": "./dist/DatePicker/DatePicker.css"` to `packages/components/package.json` exports map (mirror Phase 23 `./Tabs.css` etc.)
- `[data-state="selected"]` and `[data-state="today"]` attribute selectors as styling hooks (mirrors Phase 23 D-04 Accordion `data-state` pattern)

**STY-05 guard scope:** Phase 23's `check-no-tailwind-leak.mjs` is scoped to `dist/Tabs/`, `dist/Accordion/`, `dist/Breadcrumbs/` only. Phase 28 does NOT add `dist/DatePicker/` to the scope — the guard is for the legacy Tailwind-using components, and Phase 28's new code never uses Tailwind in the first place. If the guard scope should expand to cover every component going forward, that's STY-07 territory (v0.8).

### D-05 — Test additions per plan

- **Plan 28-01:** ~5 tests for date-utils helpers; ~3 tests for base calendar render (header text, 42 grid cells render, today highlighted, selected highlighted). Phase 24 stubs temporarily disabled (skipped not deleted — restored in 28-02). Net: ~+5-8 tests, ~−15 temporarily skipped.
- **Plan 28-02:** Restore Phase 24 stubs as real assertions (~10-12 tests converted) + ~5 new tests for month/year-nav buttons, bounds, focus-return-to-trigger, focus-trap-on-Tab. Net: ~+15-17 tests (counting restorations as net-positive since the stub form was less-strict).
- **Plan 28-03:** 3 live-region tests. Net: +3 tests.

**Expected final baseline:** 28 test files / 459 tests → **29 files / ~475-485 tests** (acknowledged exception: `date-utils.test.ts` is a NEW pure-logic unit-test file for the 8 date helpers in 28-01; this is a documented D-05 exception, NOT a new component test file. WCAG-SC marker not required on pure-logic test files). DatePicker.test.tsx extended throughout the 3 plans.

### D-06 — Translation expansion in `_i18n/live-region-strings.ts`

Add `datepicker.selected` key + a sibling `getDateAnnouncement(locale, date): string` helper. The 16 locales × 1 new key = 16 strings. Format per locale uses `Intl.DateTimeFormat(locale, { dateStyle: 'long' })` for the date portion + a localized "Selected: " prefix per locale:

- `en`: `Selected: {date}` (uses `Intl.DateTimeFormat('en', { dateStyle: 'long' })`)
- `sv`: `Valt: {date}`
- `de`: `Ausgewählt: {date}`
- `fr`: `Sélectionné : {date}` (French space-before-colon)
- `es`: `Seleccionado: {date}`
- `nl`: `Geselecteerd: {date}`
- `it`: `Selezionato: {date}`
- `pt`: `Selecionado: {date}`
- `da`: `Valgt: {date}`
- `no`: `Valgt: {date}`
- `fi`: `Valittu: {date}`
- `pl`: `Wybrano: {date}`
- `en-gb/en-us/en-ca/en-au`: identical to `en`

All non-English strings ship as `needs-native-review` per Phase 27 precedent (SUMMARY flags them).

## Deferred Ideas

- **Native input as opt-in fallback** (`mode="native"` prop) — discussed and rejected. The user explicitly chose "Replace entirely". Consumers who need the native UX on mobile can wrap a downstream conditional render.
- **Time picker / datetime picker** — out of scope; v0.8+ feature surface expansion if requested
- **Date range selection** (start + end) — out of scope; single-date picker only
- **Year-only or month-only picker variants** — out of scope
- **`Intl.PluralRules` for selected-date phrasing** — not applicable (no plural count in the announcement)
- **STY-05 guard extension to `dist/DatePicker/`** — out of scope; STY-07 territory if guard should become universal

## Constraints

- 28 test files / 459 tests baseline must stay green THROUGHOUT (Plans 28-01..03 each individually leave the suite green; temporary stub-skipping in 28-01 is restored in 28-02 — verify per-plan)
- No new dependencies (vanilla `Date` + `Intl` only — D-02)
- Phase 23 CSS strategy (inline-style + co-located `.css` + custom-property theming) followed (D-04)
- Phase 22 D-02a anti-pattern gate enforced
- Phase 27 i18n module extended (don't duplicate); `getDateAnnouncement` sibling helper added (D-06)
- Phase 22 `useFocusTrap` hook reused (don't duplicate)
- Existing prop interface preserved where possible; `value: string` → `value: Date` is the ONE accepted breaking change (documented in CHANGELOG; D-01 rationale)
- No engine or AccessibilityStatement coupling (verified during Phase 22 SSR audit — DatePicker has no upstream consumer in this repo)

## Success Criteria (from ROADMAP)

1. DatePicker renders a `role="grid"` calendar when expanded; day cells use `role="gridcell"` with `aria-selected` reflecting selection state and `aria-current="date"` on today's cell
2. Keyboard navigation: ArrowRight/Left day-by-day; ArrowDown/Up week-by-week; Home/End jump to week bounds; PageUp/PageDown jump month; Shift+PageUp/PageDown jump year; Enter/Space commit and return focus to trigger; Escape close without selecting (return focus to trigger)
3. Phase 24 DatePicker.test.tsx no-throw stubs converted to real focus + `aria-selected`/`aria-current` assertions
4. `LiveRegion` announces "Selected: {localized date}" on commit; localized per `locale` prop; no-mount-announce per D-04 (`hasInteracted` ref)
5. Existing prop interface preserved (label/description/error/className/standard HTML attrs); `value` type changes from `string` to `Date` (documented breaking change)
6. axe-clean smoke under jsdom

## Next Steps

`/gsd-plan-phase 28` — produces 3 sequential plans. Researcher unlikely to add value beyond what's already in CONTEXT + Phase 24's RESEARCH §1 (APG keyboard matrix already documented). Consider `--skip-research`.

Plan 28-01 is the foundation that requires the most thinking-through (component-shape decisions, date-utils signatures). Plans 28-02 and 28-03 are tactical extensions of that foundation.
