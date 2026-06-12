# @holmdigital/components

## 2.7.3

### Patch Changes

- DataTable APG grid now exposes a single Tab stop (the roving cell anchor) — the inner sort `<button>` in sortable headers was incorrectly tab-focusable, so each sortable column added an extra document Tab stop, breaking the APG single-tab-stop contract (WCAG 2.1.1 keyboard navigation). The button now carries `tabIndex={-1}`; keyboard sorting is unchanged (Enter/Space on a focused sortable header still sorts via the roving-cell delegation per D-03) and mouse sorting is unchanged. Closes Phase 30 UAT Test 1 regression.

## 2.7.2

### Patch Changes

- 5d7716e: Public discoverability pass (npm metadata only, no runtime changes):
  - **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
  - **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
  - **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
  - All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).

- Updated dependencies [5d7716e]
  - @holmdigital/standards@2.6.1

## 2.7.0

### Minor Changes

- 0b911ef: WCAG 2.1 AA conformance pass — closes 14 false-compliance gaps across Tooltip, Dialog, Modal, Toast, NavigationMenu, Combobox, and Select

  A post-2.3.0 audit found that several components advertised WCAG conformance their code did not deliver. This minor closes every BLOCKER finding and adds shared infrastructure to prevent recurrence.

  **New shared hooks** (`src/_hooks/`)
  - `useFocusTrap(containerRef, active, initialFocusRef?)` — moves focus into the container on activation, traps Tab inside, restores focus to the opener on deactivation.
  - `useScrollLock(active)` — ref-counted singleton so stacked dialogs/toasts compose safely.

  **Tooltip** (WCAG 1.4.13 Content on Hover or Focus — Dismissible + Hoverable)
  - Adds Escape-to-dismiss with proper guards (`if (open)` + `stopPropagation`) so it doesn't double-dismiss an enclosing dialog.
  - Adds `dismissed`-state so the tooltip doesn't immediately reopen while the trigger is still hovered/focused; resets on blur/leave so the next interaction starts fresh.
  - Adds `onMouseEnter`/`onMouseLeave` to `TooltipContent` with a 100 ms close delay so the pointer can transit from trigger to content (Hoverable).
  - Replaces `Math.random()` id with `useId()` for SSR-stable identifiers.

  **Dialog / Modal** (focus trap, focus restore, role/ARIA correctness)
  - Wires `useFocusTrap` so focus moves into the dialog on open and returns to the opener on close.
  - Adds `initialFocusRef?: RefObject<HTMLElement>` prop so consumers can land focus on the safe choice (e.g. Cancel) for destructive confirms.
  - `variant="alert"` now produces `role="alertdialog"` (was `dialog`).
  - Adds `aria-modal="true"`.
  - Replaces hardcoded `id="dialog-title"` / `id="dialog-desc"` with `useId()` — multiple dialogs on the same page no longer collide.
  - Backdrop-click detection now uses `e.target === dialog` instead of geometric comparison — works correctly for transformed/scaled dialogs.
  - Adds `closeOnBackdropClick?: boolean` and `closeOnEscape?: boolean` props (both default `true`).
  - Close button now calls `onClose` directly; `useScrollLock` replaces the local boolean and stays in sync across stacked dialogs.

  **Toast** (WCAG 2.2.1 Timing Adjustable, 4.1.3 Status Messages)
  - `error` toasts default to `Infinity` duration (sticky until dismissed).
  - Non-error toasts use a reading-rate-aware duration: `max(5000ms, content.length * 50ms)`.
  - Auto-dismiss timer pauses on hover or focus; resumes on leave/blur.
  - `role` and `aria-live` are now severity-aware: `alert`/`assertive` for error/warning, `status`/`polite` for info/success.
  - `ToastProvider` listens for Escape at the document level and dismisses the most-recent urgent (error/warning) toast.
  - Replaces `Math.random()` id with a monotonic counter ref.

  **NavigationMenu**
  - Adds `aria-controls` linking the trigger button to a stable `useId()` dropdown id.
  - Adds `ArrowDown` on the closed trigger to open the submenu and focus the first item (per APG Disclosure Navigation Menu).
  - Adds focus parity: submenu opens on `onFocus` of the `<li>`, not just hover.
  - Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.
  - JSDoc updated to accurately describe the disclosure pattern (not the menu/menuitem pattern).

  **Combobox** (APG keyboard contract)
  - Adds `Home`, `End`, `PageUp`, `PageDown` to the keyboard handler.
  - Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.

  **Select** (APG Listbox + visual-only focus → AT-announced focus)
  - Adds `aria-controls` on the trigger pointing to the listbox `useId()` id.
  - Adds `aria-activedescendant` on the trigger so screen readers announce the focused option as the user navigates.
  - Adds full APG keyboard support: `Home`, `End`, `PageUp`, `PageDown`, type-ahead with 500 ms reset window.
  - Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.
  - Refactors option tracking from a fragile ref-array (broke on commit-timing) to a DOM-query approach that always reflects the current options.

  **Tests**
  - New per-component test files for Tooltip (9), Dialog (6), Toast (6), Select (5) covering the new keyboard / focus / ARIA behaviour.
  - Total: 162 components tests, all green.

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged. Added `@types/node@^22.10.2` as devDependency. Resolved 27 pre-existing `tsc --noEmit` errors across 5 categories (Node types, vitest-axe matcher augmentation, read-only ref assignment, unused @ts-expect-error, LiveRegionLocale narrowing). Public API byte-equivalent to 2.6.0.
- Updated dependencies [c75ea8a]
  - @holmdigital/standards@2.5.3

## 2.6.1 — 2026-05-12

### Changed — Publish hygiene (PUB-09, Phase 33)

- `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors.
- Added `@types/node@^22.10.2` to devDependencies (matches engine + standards monorepo pin). Dev-side only — does not affect published runtime bundle.
- Resolved 27 pre-existing `tsc --noEmit` errors across 5 categories (all dev-side; public API byte-equivalent to 2.6.0):
  1. Node.js types — `@types/node` resolution for `node:fs` / `node:path` / `node:url` / `__dirname` in test files (Route A1: devDependency install + minimal `tsconfig.json` `types: ["node"]` overlay so TS picks it up)
  2. vitest-axe matcher type augmentation — `declare module 'vitest'` for `toHaveNoViolations` in `src/_test/setup.ts`
  3. Read-only `ref.current` assignment in Phase-22 template-setter pattern — `MutableRefObject` cast applied across 8 files (Button, Checkbox, FormField, Heading, RadioGroup, SkipLink test files + `_test/helpers/expectKeyboardSequence` helper site); expanded from the 2 files originally planned after preflight grep surfaced the same pattern repo-wide
  4. Removed unused `@ts-expect-error` directive in `expectKeyboardSequence.test.ts`
  5. Narrowed `LiveRegionLocale` resolution in `_i18n/live-region-strings.ts` at the two locale-fallback sites (`getAnnouncement` + `getDateAnnouncement`)
- Resolved 5 pre-existing lint errors absorbed into PUB-09 scope (dormant on master because lint wasn't part of any gate pre-Phase-33):
  - 4 × `'React' is not defined` (no-undef) in DatePicker.tsx source + Dialog/Modal/NavigationMenu test files → added `import type React from 'react'` (TS-only namespace import, zero runtime impact)
  - 1 × `Rule react-hooks/exhaustive-deps not found` at DatePicker.tsx:124 inline-disable comment → installed `eslint-plugin-react-hooks@7.1.1` at monorepo root devDeps and narrowly registered ONLY the `exhaustive-deps` rule (full `react-hooks/recommended` set surfaces 18 pre-existing react-compiler violations deferred to a dedicated v0.7 audit plan)
  - Plus 1 × unused React import removed in Breadcrumbs.test.tsx
- No public exports changed. No test behavior changed. No `as any` casts introduced.

## 2.6.0 — 2026-05-12

### Added — Test coverage (TC-15, Phase 32)

- **Tier 1 + Tier 2 test suites for the 7 remaining uncovered components**:
  - Card, Skeleton, Heading, SkipLink, ProgressBar, Switch, Pagination
  - Each new `*.test.tsx` follows the Phase 22 template-setter shape:
    - `// @vitest-environment jsdom` first line
    - `WCAG SCs covered:` JSDoc header
    - `describe('Tier 1: Table Stakes', …)` + `describe('Tier 2: …', …)`
    - ≥ 1 `expectNoAxeViolations` smoke per file
    - D-02a anti-pattern grep gate clean (zero `querySelector` / `configureAxe` / `toMatchSnapshot` / `fireEvent` in the new files)
- **Tooltip.test.tsx audited** and augmented in place: appended Tier 1 + Tier 2 blocks + axe smoke. Legacy SC 1.4.13 hover/escape/aria-describedby suite preserved under a documented D-02a waiver (fake-timer + user-event v14 + vitest 4 deadlock; race-condition surface is the tighter constraint).
- **Test-file count: 22 → 29** colocated component `*.test.tsx` (+7 new files). `check-wcag-headers.mjs` enumerates all test files (including `_hooks/useFocusTrap.test.tsx` and the AccessibilityStatement regression file) carrying the marker.

### ROADMAP arithmetic reconciliation

- Success criterion #4 stated "28 → 36" test files; actual baseline was 22 (excluding `_test/` helpers, `index.test.ts`, `date-utils.test.ts`, `*.regression.test.tsx`, and `useFocusTrap.test.tsx`); actual target is 29. ROADMAP updated.
- Success criterion #5 stated `test:wcag-headers` "24 → 32"; actual baseline 22, target 29. ROADMAP updated.
- Success criterion #1 stated "8 new test files"; actual: 7 new + 1 augmented (Tooltip already existed).

### Not changed

- No source modifications. Public API byte-equivalent to 2.5.0. MINOR bump per project precedent (Phase 22/24/30/31): every test-coverage milestone in this codebase ships as MINOR even when source is untouched, so that downstream consumers see an honest release-train tick.

## 2.5.0 — 2026-05-12

### Added

- **NavigationMenu APG Menubar opt-in (TC-14-IMPL, Phase 31)**
  - New optional prop `pattern?: 'disclosure' | 'menubar'` on `NavigationMenuProps`. Default `'disclosure'` preserves v0.6 byte-for-byte.
  - `pattern="menubar"` enables the full W3C APG Menubar contract:
    - `role="menubar"` / `role="menuitem"` / `role="menu"` / `role="none"` chain
    - Single-`tabindex="0"` roving across top-level items
    - Arrow horizontal/vertical (clamped at first/last), Home/End
    - ArrowDown opens submenu + focuses first; ArrowUp opens + focuses last
    - Inside open submenu: ArrowUp/Down (clamped), ArrowLeft closes + refocuses trigger, ArrowRight crosses to next menubar parent's submenu
    - Escape closes submenu + refocuses trigger + `stopPropagation` (Phase 24 Dialog-ancestor safety)
    - Enter/Space on trigger opens submenu; on leaf `<a>` preserves native activation (D-04)
    - Type-ahead first-character match with 500 ms buffer timeout (D-02); locale-naive `.toLowerCase()` (D-08); scope-aware (buffer resets on menubar↔submenu boundary)
    - WCAG 2.1.1 / 2.4.3 / 4.1.2 claimed in source JSDoc
  - Test surface 20 → 43 tests; new Tier 2 Menubar block is D-02a-clean (zero `fireEvent` / `querySelector` / `configureAxe` / `toMatchSnapshot`). Whole-file `fireEvent` count preserved at pre-phase baseline 23 (legacy Disclosure block byte-equivalent).
- **No breaking changes** — `NavigationMenuProps` adds only `pattern`; `NavItem` byte-identical.

### Deferred

- Default flip to `pattern="menubar"` — future major (3.0.0).
- Locale-aware type-ahead (`toLocaleLowerCase('sv-SE')`).
- Submenu wrap-around.

## 2.4.0 — 2026-05-12

### Added

- **DataTable APG Grid Cell-Wise Keyboard Navigation (TC-12-IMPL, Phase 30)**
  - `<table role="grid">` + `<tr role="row">` + `<th role="columnheader">` + `<td role="gridcell">` overlay on the existing native table semantics.
  - Full APG grid keyboard matrix:
    - Arrow Left/Right/Up/Down — cell-wise navigation (clamped at row/col bounds; header row at `row = -1`)
    - Home / End — first / last column of the current row
    - Ctrl+Home / Ctrl+End — table corners (first `<th>` / last `<td>`)
    - PageUp / PageDown — 10-row paging (`PAGE_SIZE = 10`, module-scope const)
  - Single-`tabindex="0"` roving anchor across header + data rows; click on any cell moves the anchor.
  - Enter / Space on a focused sortable `<th>` delegates to the existing `handleSort` (direct call, not inner-`<button>.click()`).
  - Arrow / Home / End / PageUp / PageDown / Ctrl+Home / Ctrl+End **never** trigger sort (focus-only — D-07).
  - WCAG 2.1.1 Keyboard claimed in source JSDoc; axe-clean smoke passes on default and sorted renders.
- DataTable test surface expanded from 17 to 33 tests; Phase 24 no-throw stubs converted to real focus assertions with `toHaveFocus()` + `tabindex` checks. D-02a anti-pattern gate clean (zero `querySelector` / `configureAxe` / `toMatchSnapshot` / `fireEvent`).

### Unchanged (no breaking changes)

- `DataTableProps` interface body byte-identical — no new prop added (`PAGE_SIZE` is a module-scope const).
- Sortable-header contract (`scope="col"`, `aria-sort` cycling undefined→ascending→descending, inner `<button>` with hidden glyph) preserved byte-equivalent.

## @holmdigital/components — Unreleased (v0.7 Phase 28)

### BREAKING

- **`DatePicker` `value` prop type changed: `string` → `Date`.**
  The previous implementation rendered a native `<input type="date">` and inherited
  `value: string | number | readonly string[]` from `React.InputHTMLAttributes`.
  Phase 28 replaces the native input with a custom W3C APG dialog-grid calendar
  and the public surface is now strongly typed: `value?: Date`, `onChange?: (date: Date) => void`.

  Migration:

  ```diff
  - <DatePicker label="Birthday" value="2026-03-14" onChange={e => setVal(e.target.value)} />
  + <DatePicker label="Birthday" value={new Date('2026-03-14')} onChange={d => setVal(d)} />
  ```

  Other prop changes:
  - Removed `extends React.InputHTMLAttributes<HTMLInputElement>` (the native input is gone).
    Arbitrary HTML attrs (`name`, `min`, `max`, `data-*`) no longer pass through.
  - Added: `minDate?: Date`, `maxDate?: Date`, `locale?: string` (default `'en'`), `placeholder?: string`.
  - `forwardRef` removed (ref target — the native input — is gone). v0.8 will reintroduce
    a typed `triggerRef` prop if consumer demand surfaces.

### Added

- APG dialog-grid calendar UI: `role="grid"` cell grid, `aria-current="date"` on today,
  `aria-selected="true"` on the selected cell, `aria-disabled="true"` on cells outside
  `minDate`/`maxDate` bounds.
- Co-located `DatePicker.css` (custom-property theming surface: `--hd-datepicker-today-bg`,
  `--hd-datepicker-selected-bg`, `--hd-datepicker-focus-ring`, etc.).
- Side-effect CSS subpath: `import '@holmdigital/components/DatePicker.css'`.

### Notes

- Plan 28-02 will add APG keyboard navigation (Arrow / Home / End / PageUp / PageDown / Shift+Page\*).
- Plan 28-03 will add live-region announcement on commit (TC-10-LIVE).

## 2.3.0

### Minor Changes

- 4cb76cd: feat: add Australia as supported jurisdiction (DDA, AHRC, en-au)
  - Extended `LegalFramework` type with `'DDA'` — first non-EU framework
  - Added `'AU'` to `Country` type (17 countries total)
  - DDA + DTA law entries in `national-laws.json` with AHRC enforcement body
  - `en-au` AccessibilityStatement template with voluntary DDA framing and AHRC complaint pathway
  - `en-au.json` engine statement template with DDA-specific prose
  - `.au` TLD auto-detection (.au, .com.au, .gov.au)
  - Critical `{<national_law>}` DDA fallback fix for non-WAD/EAA frameworks
  - 292 tests across 3 packages with full auto-syncing coverage

### Patch Changes

- Updated dependencies [4cb76cd]
  - @holmdigital/standards@2.3.0

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@2.2.0

## 2.1.3

### Patch Changes

- fd94d05: v0.1 Stability Pass — type safety, version accuracy, and locale coverage

  **@holmdigital/standards**
  - Added typed `FailingNode`, `EnrichedReport`, and `LegalContext` interfaces
  - Tightened `HolmDigitalInsight` type (removed index signature, added `reasoning` field)
  - All type exports are now fully typed with zero `as any` casts

  **@holmdigital/components**
  - `AccessibilityStatement` now supports 9 locales: en, sv, no, fi, da, nl, de, fr, es
  - Fixed placeholder substitution across all locales (Norwegian `publiseringsdato` bug)
  - FormField accessibility and ESM compatibility fix
  - Button component now spreads `...props` to `<button>` element (fixes onClick, aria-label, type being silently dropped)

  **@holmdigital/engine**
  - Build-time version injection via tsup `define` — replaces 3 hardcoded version strings
  - Zero `as any` casts in production code (was 4)
  - Scan results return fully typed `EnrichedReport[]` with `failingNodes` and `legalContext`
  - Upgraded axe-core from 4.10.2 to 4.11.1

- Updated dependencies [fd94d05]
  - @holmdigital/standards@2.1.1

## 2.1.1

### Patch Changes

- Fix three known bugs: cloud client now sends correct engine version from package.json instead of hardcoded '1.4.4', CLI --version reports actual version instead of '0.1.0', and AccessibilityStatement component now correctly renders Norwegian (no/nb) locale templates instead of falling back to English.

## 2.1.0

### Minor Changes

- a5f0169: # Accessibility Statement Enhancements

  Significant improvements to the accessibility statement generation system:
  - **Multi-Language Support**: Added comprehensive support for 9 European languages (EN, SV, NO, DA, FI, NL, DE, FR, ES).
  - **Externalized Templates**: Templates are now managed as separate JSON files in `@holmdigital/engine`, allowing for professional legal phrasing and easier localization.
  - **Enhanced Component**: Refactored the `AccessibilityStatement` component in `@holmdigital/components` to support template-driven rendering, localized date formatting, and automatic icon mapping for all supported languages.
  - **Centralized Enforcement Data**: Moved regulatory authority data to `@holmdigital/standards` for consistent use across all packages.
  - **Improved Substitution Logic**: Built-in support for conditional blocks and choice strings in both HTML and Markdown outputs.
  - **Hardened JUnit Generation**: Enhanced the JUnit XML reporter to include rich metadata properties, successful test case counts, and detailed failure information (DOM targets and HTML snippets) in `<system-out>` blocks for better CI diagnostics.

### Patch Changes

- Updated dependencies [a5f0169]
  - @holmdigital/standards@2.1.0

## 2.0.0

### Major Changes

- 7013ff2: # 🚀 Release Overview: Premium Ecosystem & Nordic Expansion

  This release marks a major evolution of the HolmDigital Accessibility Ecosystem, transitioning from a technical scanner to a full-scale regulatory compliance suite.

  ## ⚖️ Standards & Legal Database (National Laws)
  - **Nordic Expansion**: Added full support for **Norway (Forskrift om universell utforming)**, **Finland (Laki digitaalisten palvelujen)**, and **Denmark (Lov om tilgængelighed)**.
  - **National Law Mapping**: New database for 12+ countries mapping WCAG to specific national legislations and enforcement bodies (e.g., Digg in SE, Traficom in FI).
  - **Sanctions & Enforcement**: Integrated data on legal sanctions and maximum fines for non-compliance across EU/Nordic regions.
  - **Statement Tools**: Registry of official national accessibility statement generators.

  ## 🚂 Engine: CI/CD & Reporting
  - **Premium V2 Statements**: Complete overhaul of the accessibility statement generator with glassmorphism card design, embedded Lucide-style icons, and micro-animations.
  - **Automatic Badge**: Sites with 100% compliance now automatically trigger a green Shields.io badge in the CLI and reports.
  - **GitHub Actions Integration**: Added native output formatting for GitHub Actions summary pages.
  - **JUnit Reporting**: Support for standard JUnit XML output for CI/CD dashboards (GitLab, Azure DevOps).
  - **Expanded CLI**: New flags for `--publish-date`, `--org`, `--response-time`, and `--country`.
  - **New Locales**: Added `no`, `fi`, `da` (and `nb`, `dk` aliases) for all engine outputs and statements.

  ## 🧱 Components: Prescriptive UI
  - **29+ Accessible Components**: Full library includes `DataTable`, `Combobox`, `TreeView`, `DatePicker`, `MultiSelect`, `NavigationMenu`, and more.
  - **Compliant by Default**: Built-in ARIA management, focus traps, and WCAG AAA contrast patterns.
  - **Premium V2 Statement Component**: The `AccessibilityStatement` component now supports rich metadata for multi-company deployments.

  ## 📚 Documentation
  - **Centralized Docs**: Moved all package-specific guides to a structured root `/docs` directory.
  - **New Guides**: Added "EU Legal Framework", "Nordic Authorities", and "CI/CD Integration" master guides.

### Patch Changes

- Updated dependencies [7013ff2]
  - @holmdigital/standards@2.0.0

## 1.1.0

### Minor Changes

- 4c06ccf: feat: add Heading component

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.
