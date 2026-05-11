---
phase: 28-datepicker-apg-dialog-grid
plan: 01
subsystem: components/DatePicker
tags: [datepicker, apg, calendar, css, i18n, breaking-change]
dependency_graph:
  requires: []
  provides:
    - "DatePicker/date-utils.ts (internal — 8 helpers)"
    - "DatePicker/DatePicker.tsx (APG dialog-grid base render)"
    - "DatePicker/DatePicker.css (Phase 23 styling pattern)"
    - "_i18n/live-region-strings.ts::getDateAnnouncement"
    - "@holmdigital/components/DatePicker.css subpath export"
  affects:
    - "Plan 28-02 (keyboard handler + roving tabindex + focus trap)"
    - "Plan 28-03 (live-region wiring on commit)"
tech_stack:
  added:
    - "vanilla Date + Intl date math (no new dependencies — D-02)"
  patterns:
    - "Phase 23 styling: co-located .css + custom-property theming + :focus-visible in .css"
    - "Phase 23 data-state attribute-styling hook (mirrors Accordion)"
    - "D-02a anti-pattern gate: no querySelector, no configureAxe, no toMatchSnapshot"
key_files:
  created:
    - "packages/components/src/DatePicker/date-utils.ts"
    - "packages/components/src/DatePicker/date-utils.test.ts"
    - "packages/components/src/DatePicker/DatePicker.css"
  modified:
    - "packages/components/src/DatePicker/DatePicker.tsx (full replacement)"
    - "packages/components/src/DatePicker/DatePicker.test.tsx (Tier 1+2 skipped, base-render block added)"
    - "packages/components/src/_i18n/live-region-strings.ts (datepicker.selected key + getDateAnnouncement helper)"
    - "packages/components/package.json (./DatePicker.css export)"
    - "packages/components/tsup.config.ts (exclude DatePicker/date-utils.ts)"
    - "packages/components/CHANGELOG.md (BREAKING entry)"
decisions:
  - "tsup strategy: explicit exclusion (option c) — mirrors !src/AccessibilityStatement/locale-*.{ts,tsx}"
  - "_i18n imports nothing from DatePicker — getDateAnnouncement inlines its own Intl.DateTimeFormat call (avoids inverted dep arrow)"
  - "Tier 1+2 stubs SKIPPED not deleted — Plan 28-02 restores them as real assertions"
  - "WCAG SCs in 28-01: 1.3.1 + 4.1.2 only. 2.1.1/2.4.3/2.4.7 deferred to 28-02 when popup cells become keyboard-reachable."
metrics:
  duration_minutes: ~25
  completed_date: 2026-05-11
  test_files_before: 28
  test_files_after: 29
  tests_before: 459
  tests_after: 463 passed + 2 skipped (465 total)
  net_delta: "+4 passing tests, +2 skipped placeholders, +1 test file"
translation_flags:
  - locale: sv
    key: datepicker.selected
    status: needs-native-review
    string: "Valt: "
  - locale: de
    key: datepicker.selected
    status: needs-native-review
    string: "Ausgewählt: "
  - locale: fr
    key: datepicker.selected
    status: needs-native-review
    string: "Sélectionné : "
  - locale: es
    key: datepicker.selected
    status: needs-native-review
    string: "Seleccionado: "
  - locale: nl
    key: datepicker.selected
    status: needs-native-review
    string: "Geselecteerd: "
  - locale: it
    key: datepicker.selected
    status: needs-native-review
    string: "Selezionato: "
  - locale: pt
    key: datepicker.selected
    status: needs-native-review
    string: "Selecionado: "
  - locale: da
    key: datepicker.selected
    status: needs-native-review
    string: "Valgt: "
  - locale: no
    key: datepicker.selected
    status: needs-native-review
    string: "Valgt: "
  - locale: fi
    key: datepicker.selected
    status: needs-native-review
    string: "Valittu: "
  - locale: pl
    key: datepicker.selected
    status: needs-native-review
    string: "Wybrano: "
---

# Phase 28 Plan 01: DatePicker APG Dialog-Grid Base Render Summary

Replace `DatePicker`'s native `<input type="date">` with the structural foundation of a custom W3C APG dialog-grid calendar — `role="grid"` calendar with 42 `role="gridcell"` day buttons, `aria-current="date"` on today, `aria-selected` on the chosen date, `aria-disabled` on out-of-bounds cells, co-located CSS, i18n module extended with `datepicker.selected` × 16 locales — while preserving the test suite green and deferring keyboard + live-region wiring to Plans 28-02 / 28-03.

## What Shipped

### `DatePicker/date-utils.ts` (new, internal — 8 helpers)

Vanilla `Date` + `Intl` math, no new deps. Helpers exported: `getDaysInMonth`, `getFirstDayOfMonth`, `getWeekStartForLocale` (Intl.Locale weekInfo with Monday fallback), `isSameDay` (y/m/d-triple compare, DST-safe), `addDays`, `addMonths` (month-overflow-safe: March 31 + 1m = April 30, not May 1), `clampDate`, `formatDateForAnnouncement` (long-form Intl.DateTimeFormat with English fallback).

### `DatePicker/date-utils.test.ts` (new — D-05 documented exception)

19 it() blocks across 8 helpers, all green. Covers leap year, month overflow, negative arithmetic, DST safety (hour insensitivity), runtime-tolerant weekInfo, English long-format assertion ("March" / "2026"), unknown-locale fallback. No WCAG-SC marker — `check-wcag-headers.mjs` scans `.test.tsx` only.

### `DatePicker/DatePicker.tsx` (full replacement)

- New `DatePickerProps`: `label`, `description?`, `error?`, `className?`, `value?: Date`, `onChange?: (date: Date) => void`, `minDate?`, `maxDate?`, `locale = 'en'`, `placeholder = 'Pick a date'`
- No more `forwardRef`, no more `React.InputHTMLAttributes` extension — the native input is gone
- Trigger `<button>` with `aria-labelledby` → label id, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, `aria-describedby` chain for description + error
- Popup `<div role="dialog" aria-modal="false">` (non-modal per D-01/D-03), contains a 4-button nav header (`data-nav="prev-year|prev-month|next-month|next-year"` selectors reserved for 28-02) + a `role="grid"` calendar
- Calendar: 42 cells (6 weeks × 7 days), `role="gridcell"` buttons, weekday `role="columnheader"` row, locale-aware week-start (Intl.Locale `weekInfo`)
- Today highlight: `aria-current="date"` + `data-state="today"`
- Selected highlight: `aria-selected={true || undefined}` + `data-state="selected"` (undefined-fallback per APG hint #2 — keeps unselected cells out of the AT verbosity)
- Min/max bounds: `aria-disabled="true"` + CSS `pointer-events: none`
- All cells `tabIndex={-1}` (no roving yet — keyboard reachability lands in 28-02)
- Click-outside-to-close (Plan 28-02 augments with Escape + focus return)

### `DatePicker/DatePicker.css` (new — Phase 23 pattern)

BEM `hd-datepicker__*` selectors, custom-property theming (`--hd-datepicker-today-bg`, `--hd-datepicker-selected-bg`, `--hd-datepicker-focus-ring`, `--hd-datepicker-popup-bg`, `--hd-datepicker-disabled-color`, etc.), `:focus-visible` rules in CSS (Phase 23 STY-04 / WCAG 2.4.7). Side-effect imported at top of `DatePicker.tsx`. Emitted as `dist/DatePicker/DatePicker.css` via tsup's per-component CSS extraction (Phase 23 STY-02).

### `_i18n/live-region-strings.ts` (extended)

- `LiveRegionKey` union now `'combobox.results' | 'multiselect.selected' | 'datepicker.selected'`
- New `DATEPICKER_SELECTED_PREFIX: Record<LiveRegionLocale, string>` table — 16 locales × localized "Selected: " prefix. All å/ä/ö/ü/é preserved verbatim (MEMORY instruction).
- New sibling helper `getDateAnnouncement(locale, date): string` — composes `prefix + Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)`. Inlines its own `Intl.DateTimeFormat` call rather than depending on `DatePicker/date-utils.ts` (would invert the dependency arrow: `_i18n/` is foundation, component subdirs are downstream).
- `getAnnouncement(key, locale, count)` retains old shape via a narrowed cast on the table lookup. (Future tightening: split into per-key helpers if a third count-shape ever lands.)

### `packages/components/package.json`

Added `"./DatePicker.css": "./dist/DatePicker/DatePicker.css"` exports entry, ordered immediately after the existing `"./DatePicker"` block (mirrors Phase 23 `./Tabs` → `./Tabs.css` ordering).

### `packages/components/tsup.config.ts`

Added `'!src/DatePicker/date-utils.ts'` to the `entry` array — chosen **strategy (c)** explicit exclusion. **Rationale documented in plan:** (a) underscore-prefix file does NOT exclude (`src/*/*.{ts,tsx}` still matches `_date-utils.ts`); (b) shared `src/_date-utils/` dir breaks co-location. The explicit `!` mirrors the existing `!src/AccessibilityStatement/locale-*.{ts,tsx}` pattern.

Verification: `dist/DatePicker/` contains `DatePicker.css`, `DatePicker.js/mjs`, `DatePicker.d.ts/mts` — and NO `date-utils.*` artifact.

### `packages/components/CHANGELOG.md`

Prepended an Unreleased "v0.7 Phase 28" entry above the existing `## 2.3.0`. Documents the `value: string → value: Date` breaking change with a migration diff, lists removed surfaces (forwardRef, InputHTMLAttributes passthrough, native input arbitrary-attrs), and lists added surfaces (minDate / maxDate / locale / placeholder, the dialog-grid UI, the `./DatePicker.css` subpath).

### `DatePicker/DatePicker.test.tsx` (restructured)

- `Tier 1: Table Stakes` describe wrapped in `describe.skip` with TODO(28-02) — collapsed to a single placeholder it()
- `Tier 2: A11y Differentiators` (APG_GRID_KEYS it.each matrix + axe-state-render blocks + expectUniqueIds) wrapped in `describe.skip` with TODO(28-02) — collapsed to a single placeholder
- New `describe('base render (Plan 28-01)', ...)` with 8 it() blocks:
  - trigger renders with accessible name from label + placeholder text + popup absent
  - click opens dialog → grid present; aria-expanded flips true
  - 42 gridcell buttons exactly
  - exactly 1 aria-current="date" cell
  - value={2026-03-14} → trigger contains "March"/"2026" AND grid contains a cell with aria-selected=true and text "14"
  - axe-clean smoke (closed-popup render — open-popup axe deferred to 28-02 when cells become keyboard-reachable)
  - error → role=alert + trigger aria-invalid=true
  - description id appears in trigger aria-describedby
- WCAG SC marker updated: now only `1.3.1` + `4.1.2` claimed (keyboard SCs deferred to 28-02 per plan rationale)
- D-02a gate: 0 querySelector, 0 configureAxe, 0 toMatchSnapshot — only `screen.getByRole`, `within(...)`, attribute filters

## Test Delta

| Surface | Before | After |
|---------|--------|-------|
| Test files | 28 | 29 (+date-utils.test.ts) |
| Tests passing | 459 | 463 |
| Tests skipped | 0 | 2 (Tier 1 + Tier 2 stub-block placeholders) |
| **Total** | **459** | **465** |

Full suite `npm run test:ci -w @holmdigital/components` exit 0; build green; publint `check:exports` exit 0; no-tailwind-leak + no-test-leak checks green.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Unused `React` namespace import broke DTS build**

- **Found during:** Task 3 build verification
- **Issue:** `import React, { ... } from 'react'` — the `React` namespace identifier is unused in the new function-component body (no `React.createElement`, no `React.FC`). TypeScript's `noUnusedLocals` flagged it during tsup's DTS pass.
- **Fix:** Drop the default import; keep only the named hook imports.
- **Files modified:** `packages/components/src/DatePicker/DatePicker.tsx`
- **Commit:** Included in `dfc6f2d` (squashed before commit was finalised)

**2. [Rule 2 - Critical] Unused-setter lint risk for `setCursor`**

- **Found during:** Task 3 implementation
- **Issue:** `setCursor` is created by `useState` but not invoked in 28-01 (nav buttons are stub-rendered; 28-02 wires their onClick). Without a `void setCursor;` line, ESLint's `no-unused-vars` (component-internal destructure) or TS strict modes could flag it depending on lint config evolution.
- **Fix:** Added `void setCursor;` immediately after the destructure with a comment pointing to 28-02 — keeps the state slot wired for Plan 28-02 without lint noise.
- **Files modified:** `packages/components/src/DatePicker/DatePicker.tsx`

No other deviations. All other plan steps applied verbatim.

## Stub-Marker Inventory (handoff to 28-02)

These are intentional 28-01 stubs that **must** be wired in 28-02:

| Stub | Location | 28-02 Action |
|------|----------|--------------|
| Nav header buttons (`prev-year` / `prev-month` / `next-month` / `next-year`) | `DatePicker.tsx` lines ~168–204 | Wire `onClick` to step `cursor` via `addMonths`. `data-nav` selectors reserved for tests. |
| Day cells (no `onClick`, no key handler) | `DatePicker.tsx` lines ~225–245 | Wire `onClick` → commit; add `onKeyDown` → APG matrix (Arrow / Home / End / PageUp / PageDown / Shift+Page* / Enter / Space / Escape); promote one cell to `tabIndex={0}` (roving). |
| `_onChange` (renamed underscore) | `DatePicker.tsx` line ~52 | Rename to `onChange`, invoke from commit. |
| `setCursor` (state slot kept live via `void`) | `DatePicker.tsx` line ~70 | Used by nav-button + PageUp/PageDown / Shift+Page* handlers. |
| `Tier 1: Table Stakes` describe.skip | `DatePicker.test.tsx` line ~33 | Restore as button-trigger assertions against the new render. |
| `Tier 2: A11y Differentiators` describe.skip | `DatePicker.test.tsx` line ~43 | Restore APG_GRID_KEYS it.each — flip from "does not throw" to real focus + state assertions. Add open-popup axe smoke once cells are reachable. |
| Live-region announcement (component does NOT import `getDateAnnouncement` yet) | n/a | 28-03 wires `useState` for announcement + `useRef` for `hasInteracted` + `<LiveRegion>`. |

## Threat Flags

None — DatePicker is local component state only. No network, no auth, no schema. The breaking-change `value: Date` shift is a public-API churn (documented in CHANGELOG), not a security surface.

## Self-Check: PASSED

- date-utils.ts exists — FOUND
- date-utils.test.ts exists, 19 tests pass — FOUND
- DatePicker.css exists — FOUND
- DatePicker.tsx contains `value?: Date` (exactly 1 match) — FOUND
- `import './DatePicker.css'` at top of DatePicker.tsx — FOUND
- live-region-strings.ts contains `Ausgewählt` + `Sélectionné` (diacritics intact) — FOUND
- package.json has `"./DatePicker.css": "./dist/DatePicker/DatePicker.css"` — FOUND
- tsup.config.ts contains `!src/DatePicker/date-utils.ts` — FOUND
- CHANGELOG.md contains "DatePicker" + "BREAKING" — FOUND
- dist/DatePicker/DatePicker.css produced by build — FOUND
- dist/DatePicker/date-utils.* does NOT exist — CONFIRMED ABSENT
- `npm run test:ci -w @holmdigital/components` exit 0, 463 passed + 2 skipped — FOUND
- `npm run check:exports -w @holmdigital/components` exit 0 — FOUND
- Commits in worktree: 937dcfd (task 1), 0880457 (task 2), dfc6f2d (task 3) — FOUND
