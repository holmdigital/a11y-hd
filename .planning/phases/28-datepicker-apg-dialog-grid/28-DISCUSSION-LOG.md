# Phase 28 Discussion Log

**Date:** 2026-05-11
**Phase:** 28 — DatePicker APG Dialog-Grid Keyboard + Live Region

## Areas Discussed

### Calendar UI strategy (biggest scope decision in v0.7)
**Question:** Native `<input type="date">` vs custom calendar UI — current source's JSDoc explicitly defends the native choice.

**Options presented:**
- Replace entirely with custom `role="grid"` calendar (recommended for APG compliance)
- Hybrid: native on touch, custom on desktop
- Opt-in: native by default, prop enables calendar (`mode="calendar"` / `"native"`)
- Defer entire phase — ship just TC-10-LIVE on native input now

**User choice:** Replace entirely

**Rationale:** APG conformance is the milestone goal. Mobile-native trade-off accepted. Consumers who need iOS wheel / Android material picker can wrap downstream or stay on v0.6 DatePicker. `value: string` → `value: Date` is the one accepted breaking change; documented in CHANGELOG.

### Date math
**Question:** Vanilla `Date`+`Intl` vs date-fns vs dayjs/luxon?

**Options presented:**
- Vanilla `Date` + `Intl.DateTimeFormat` / `Intl.Locale` (recommended)
- Add `date-fns`
- Add `dayjs` (or `luxon`)

**User choice:** Vanilla

**Rationale:** Phase 26-04 just made lucide-react optional to shrink the dependency surface; adding a date library would undo that effort. `Intl.DateTimeFormat` gives localized day/month names; manual month arithmetic is well-understood. Helpers organized in `DatePicker/date-utils.ts` (internal, not a published subpath).

### Plan shape
**Question:** How to break up the calendar work?

**Options presented:**
- 3 plans, sequential (recommended)
- 2 plans (UI+keyboard combined, then live-region+tests)
- 1 big plan

**User choice:** 3 plans, sequential

**Rationale:** Plan 28-01 = date math + i18n + base render (no keyboard). Plan 28-02 = APG keyboard + focus management + Phase 24 stub conversion. Plan 28-03 = live-region + final test additions + cleanup. Each plan reviewable, atomic rollback per layer. ~100-200 LOC per plan. Strictly sequential (no parallelism within phase).

## Deferred Ideas

- Native input as opt-in fallback (mode="native" prop)
- Time picker / datetime picker variant
- Date range selection (start + end)
- Year-only / month-only picker variants
- `Intl.PluralRules` (no plural count in announcement)
- STY-05 guard extension to `dist/DatePicker/` (STY-07 territory in v0.8)

## Claude's Discretion (not asked)

- **D-04 CSS strategy:** mirror Phase 23 pattern (inline-style + co-located `.css` + custom-property theming + `:focus-visible` in CSS + `[data-state]` attribute selectors as styling hooks). Add `./DatePicker.css` to package.json exports.
- **D-05 test trajectory:** Plan 28-01 temporarily skips Phase 24 stubs (TODO note); Plan 28-02 restores them as real assertions; Plan 28-03 adds 3 live-region tests. Final: 28/459 → ~28/475-485.
- **D-06 i18n expansion:** add `datepicker.selected` key × 16 locales + sibling `getDateAnnouncement(locale, date)` helper. Date portion uses `Intl.DateTimeFormat(locale, { dateStyle: 'long' })`. 11 non-English locales flagged `needs-native-review` per Phase 27 precedent.
- **Breaking change documented:** `value: string` → `value: Date` is the only intentional prop API change. Acceptable because: (a) the 23 existing tests are being rewritten anyway; (b) verified during Phase 22 SSR audit that engine and AccessibilityStatement don't consume DatePicker; (c) CHANGELOG entry will document.
- **`useFocusTrap` reuse:** Phase 22's hook used for the dialog focus trap; don't duplicate.
- **STY-05 guard NOT extended to DatePicker:** Phase 23 guard is for legacy Tailwind components; Phase 28 doesn't use Tailwind. Extending guard scope is STY-07 territory.
