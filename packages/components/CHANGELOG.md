# @holmdigital/components

## 2.4.0

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
