---
phase: 28-datepicker-apg-dialog-grid
plan: 03
subsystem: components/DatePicker
tags: [datepicker, live-region, i18n, apg, wcag-4.1.3]
dependency_graph:
  requires:
    - "Plan 28-01 (date-utils, base render, getDateAnnouncement helper)"
    - "Plan 28-02 (keyboard handler + commitDate + cell onClick commit path)"
  provides:
    - "DatePicker.tsx: <LiveRegion> mount + announcement state + commit-path announcement update"
    - "DatePicker.test.tsx: 5 live-region tests + WCAG 4.1.3 claim"
  affects: []
tech_stack:
  added: []
  patterns:
    - "Phase 27 D-04 hasInteracted ref (kept for cross-widget consistency; LiveRegion internally guards empty message)"
    - "LiveRegion as last child of outer wrapper (always mounted; survives dialog open/close cycles)"
    - "waitFor + getByText for async live-region content assertion"
key_files:
  created: []
  modified:
    - "packages/components/src/DatePicker/DatePicker.tsx (LiveRegion mount + announcement state + commit-path wiring)"
    - "packages/components/src/DatePicker/DatePicker.test.tsx (5 live-region tests + WCAG 4.1.3 header marker)"
decisions:
  - "LiveRegion mounted UNCONDITIONALLY (not inside {isOpen && ...}) — screen readers need the element to persist before message changes, and the dialog unmounts on close so an inside-dialog LiveRegion would lose its state."
  - "hasInteracted ref kept per Phase 27 D-04 even though LiveRegion already guards empty message internally — cross-widget consistency + future-proof if `clearAfter` is ever added."
  - "5 tests (not 3) — planner-discretion polish: included Swedish-prefix test (locale=sv) and Escape-does-not-announce test in addition to the 3 required (no-mount-announce, English commit, locale fallback)."
  - "Closes BOTH TC-10-IMPL (Plan 28-02 shipped keyboard + commit) and TC-10-LIVE (Plan 28-03 ships live-region) with this plan — Phase 28 fully completes both requirements."
metrics:
  duration_minutes: ~6
  completed_date: 2026-05-11
  test_files_before: 29
  test_files_after: 29
  tests_before: 489
  tests_after: 494
  net_delta: "+5 tests (all live-region; all passing)"
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

# Phase 28 Plan 03: DatePicker LiveRegion Announcement Summary

Wire the selected-date live-region announcement (TC-10-LIVE) into `DatePicker.tsx`:
`<LiveRegion>` mounted as last child of the outer wrapper, `announcement` state +
`hasInteracted` ref updated only on commit (Enter / Space / click), localised via
`getDateAnnouncement(locale, date)`. Adds 5 live-region tests and claims WCAG SC 4.1.3
on `DatePicker.test.tsx`.

## What Shipped

### `DatePicker/DatePicker.tsx` (modified)

- **Imports** added: `LiveRegion` from `../LiveRegion/LiveRegion`; `getDateAnnouncement`
  from `../_i18n/live-region-strings`.
- **State + ref** added:
  ```typescript
  const [announcement, setAnnouncement] = useState<string>('');
  const hasInteracted = useRef(false);
  ```
- **`commitDate` (Enter / Space commit path)** — after `onChange?.(clamped)`:
  ```typescript
  hasInteracted.current = true;
  setAnnouncement(getDateAnnouncement(locale, clamped));
  ```
- **Cell `onClick` (mouse commit path)** — same two lines after `onChange?.(d)`.
- **Escape / nav-buttons / arrow-nav unchanged** — those are not commit paths and
  must NOT produce a SR announcement (per CONTEXT D-04 / plan behaviour spec).
- **`<LiveRegion>` mount** — last child of outer wrapper `<div className="hd-datepicker">`,
  AFTER the `{isOpen && <div role="dialog">...</div>}` block. Always mounted so the
  element survives dialog open/close cycles — committing a date closes the dialog
  immediately, and an inside-dialog LiveRegion would unmount before the screen reader
  could read the announcement.
- **JSDoc header** — added 4.1.3 wiring to the SC claims list (component-side comment).

### `DatePicker/DatePicker.test.tsx` (modified)

- **`waitFor`** added to `@testing-library/react` imports.
- **New `describe('Live region (Plan 28-03 — TC-10-LIVE)', ...)` block** with 5 tests:
  1. `no announcement on initial mount` — assert `queryByText(/^Selected:/i)` and
     `queryByText(/^Valt:/i)` both return `null` on render with no value committed.
  2. `announces selected date after click commit (English default locale)` — open
     dialog, click cell `20` (in-month, not disabled), assert `waitFor(() => getByText(/^Selected:.*March.*2026/i))`.
  3. `locale fallback: unknown locale 'xx' uses English 'Selected:' prefix` — render
     with `locale="xx"`, commit, assert `getByText(/^Selected:/i)`.
  4. `Swedish locale uses 'Valt:' prefix on commit` — render with `locale="sv"`,
     commit, assert `getByText(/^Valt:/i)`.
  5. `Escape does NOT trigger an announcement (commit-path only)` — open, focus cell,
     press Escape, assert dialog is closed AND no `Selected:` / `Valt:` text visible.
- **JSDoc header** — adds `4.1.3 Status Messages` to claimed SCs (final list:
  `1.3.1, 2.1.1, 2.4.3, 2.4.7, 4.1.2, 4.1.3`).
- **D-02a gate** — 0 `querySelector` / `configureAxe` / `toMatchSnapshot` (only the
  JSDoc reference to the gate name itself remains, as in prior plans).

## Test Delta

| Surface | Before (28-02) | After (28-03) |
|---------|----------------|----------------|
| Test files | 29 | 29 |
| Tests passing | 489 | 494 |
| Tests skipped | 0 | 0 |
| **Total** | **489** | **494** |

Full suite `npm run test:ci -w @holmdigital/components` exit 0; 29 files / 494 tests
passing. CONTEXT D-05 target was 475-485; actual delivered 494 tests (+9 over the
high end of the target window because Plan 28-02 over-delivered the keyboard test
restoration set, and Plan 28-03 added 5 live-region tests instead of the minimum 3).

WCAG-SC header gate (`test:wcag-headers`) reports 24 test files all carry the marker.
No-tailwind-leak gate green (6 files across 3 scoped dirs). No-test-leak gate green
(91 dist files clean).

## WCAG SCs Claimed in DatePicker.test.tsx After Phase 28

| SC      | Source plan | Coverage |
|---------|-------------|----------|
| 1.3.1   | 28-01 | label↔trigger via aria-labelledby; description+error in aria-describedby id-chain |
| 2.1.1   | 28-02 | full APG key matrix (Arrow / Home / End / PageUp / PageDown / Shift+Page* / Enter / Space / Escape) asserted with real focus + state |
| 2.4.3   | 28-02 | Enter / Space / Escape all return focus to trigger |
| 2.4.7   | 28-02 | `:focus-visible` in DatePicker.css (Phase 23 STY-04 pattern); structural roving-tabindex asserted |
| 4.1.2   | 28-01 | trigger button name+role+state; dialog `role="dialog"`; grid `role="grid"`; cells `role="gridcell"` with `aria-selected` + `aria-current="date"` |
| 4.1.3   | 28-03 | committed date announced via `<LiveRegion>` + `getDateAnnouncement(locale, date)`; no-mount-announce; commit-path-only |

## Requirements Closed By Phase 28

| Requirement | Status | Notes |
|-------------|--------|-------|
| TC-10-IMPL | ✓ Closed | Plan 28-02 shipped the APG keyboard handler + roving tabindex + focus trap + commit logic |
| TC-10-LIVE | ✓ Closed | Plan 28-03 (this plan) shipped the LiveRegion mount + commit-path announcement + locale-aware `Selected: {long date}` |

## Phase 24 Stub → Real-Assertion Conversion

Fully complete across Plans 28-01..03:
- Plan 28-01: Tier 1 + Tier 2 stubs temporarily `describe.skip`'d (placeholder it() per block to keep file structure visible).
- Plan 28-02: Tier 1 restored (4 tests) + Tier 2 APG key matrix restored as real focus + state assertions (12 tests) + Tier 2 axe / uniqueness restored (4 tests) + 5 new Plan 28-02 tests.
- Plan 28-03: 5 new live-region tests appended; 0 stubs remain anywhere in DatePicker.test.tsx.

## Translation Flags (datepicker.selected prefix)

All 11 non-English prefixes (sv / de / fr / es / nl / it / pt / da / no / fi / pl) shipped
in Plan 28-01 are still flagged `needs-native-review`. The Plan 28-03 live-region tests
exercise the English `Selected:` prefix, the Swedish `Valt:` prefix, and the unknown-locale
fallback path; the other 9 non-English prefixes are exercised structurally via the same
`getDateAnnouncement` code path but not in test assertions.

Tracked follow-up: ping native speakers for sv / de / fr / es / nl / it / pt / da / no /
fi / pl review. Same pattern as Phase 27.

## Deviations from Plan

None — plan executed verbatim. Two notes:

1. **Test count: 5 added (planner-discretion polish)** — plan specified 3 required +
   2 optional. Both optional tests (Swedish prefix, Escape-no-announce) were added
   because they pin behaviour the plan called out as important (locale-aware prefix
   localisation; Escape-no-commit-no-announce). No additional effort, strict gain in
   coverage.
2. **No Rule 1/2/3 auto-fixes needed** — existing 28-02 commit paths (commitDate +
   cell onClick) were straightforward to extend with the two new lines each;
   `hasInteracted.current = true` + `setAnnouncement(getDateAnnouncement(locale, ...))`.
   No structural changes to the component shape.

## Phase 28 Retrospective Seed (handoff to phase-complete)

Estimated 3-sequential-plan shape worked well in practice:

| Plan | Estimated cost | Actual cost | Sub-splits at execute time? |
|------|----------------|-------------|------------------------------|
| 28-01 | ~25 min | ~25 min (3 tasks) | No |
| 28-02 | ~10 min | ~8 min (2 tasks) | No |
| 28-03 | ~7 min | ~6 min (2 tasks) | No |

Sequential dependency arrow (28-01 base → 28-02 keyboard → 28-03 live-region) was the
correct shape; no opportunity for intra-phase parallelism since each plan modifies the
same source file's commit-path code. Plan 28-02 over-delivered slightly on test count
(restored 16 stubs as 16 real assertions + added 5 new tests, +24 net vs estimated +15-17),
which left Plan 28-03 with a comfortable budget for the +5 live-region tests.

## Stub-Marker Inventory (handoff to next phase)

None — Phase 28 fully completes both TC-10-IMPL and TC-10-LIVE; no stubs remain in
DatePicker.tsx or DatePicker.test.tsx for downstream phases to resolve.

## Threat Flags

None — DatePicker is local component state only. No network, no auth, no schema
changes. LiveRegion is a visually-hidden span with `aria-live="polite"` — no
security surface introduced.

## Self-Check: PASSED

- `DatePicker.tsx` imports `LiveRegion` — FOUND
- `DatePicker.tsx` imports `getDateAnnouncement` — FOUND
- `<LiveRegion message={announcement} ariaLive="polite" />` present — FOUND
- `commitDate` calls `setAnnouncement(getDateAnnouncement(locale, clamped))` — FOUND
- Cell `onClick` calls `setAnnouncement(getDateAnnouncement(locale, d))` — FOUND
- Escape path does NOT call setAnnouncement — CONFIRMED (only `setIsOpen(false)` + `triggerRef.current?.focus()`)
- `hasInteracted` ref present — FOUND
- `DatePicker.test.tsx` describe block `Live region (Plan 28-03 — TC-10-LIVE)` present — FOUND
- 5 live-region tests pass — CONFIRMED (vitest output: 39/39 in DatePicker.test.tsx)
- WCAG SC 4.1.3 in DatePicker.test.tsx JSDoc — FOUND
- D-02a clean (only JSDoc reference to gate name) — CONFIRMED
- `npm run test:ci -w @holmdigital/components` exit 0; 29 files / 494 tests — CONFIRMED
- `npm run build -w @holmdigital/components` exit 0 — CONFIRMED
- Task 1 commit 7c63976 — FOUND
- Task 2 commit 8629a7b — FOUND
