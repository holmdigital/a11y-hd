# @holmdigital/engine

## 2.4.0

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
  - @holmdigital/components@2.3.0

## 2.3.0

### Minor Changes

- Add --light CLI flag for fast score-only scanning. Skips HTML validation and Virtual DOM build, uses direct axe severity mapping. Returns compact output ideal for API consumption via --json --light.

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@2.2.0
  - @holmdigital/components@2.2.0

## 2.1.7

### Patch Changes

- dd9a7b8: Fix unresolved choice blocks in Markdown statement output when templates contain nested placeholders

## 2.1.6

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
  - @holmdigital/components@2.1.3

## 2.1.4

### Patch Changes

- Upgrade axe-core from 4.10.2 to 4.11.1 for improved color contrast detection (oklch/oklab), Shadow DOM support, and RGAA standard tags. Updated fallback version and dynamic test assertions.

## 2.1.3

### Patch Changes

- Fix three known bugs: cloud client now sends correct engine version from package.json instead of hardcoded '1.4.4', CLI --version reports actual version instead of '0.1.0', and AccessibilityStatement component now correctly renders Norwegian (no/nb) locale templates instead of falling back to English.
- Updated dependencies
  - @holmdigital/components@2.1.1

## 2.1.2

### Patch Changes

- 38763da: fix(engine): replace hardcoded engineVersion with dynamic package.json read

  The internal `engineVersion` metadata was stuck at `1.4.7` and `standardsVersion` at `1.2.2` regardless of the actual published version. Now reads versions dynamically from `package.json` at runtime using `readFileSync` with CJS/ESM compatibility.

## 2.1.1

### Patch Changes

- bc43b05: # Jenkins Build Fix
  - **Improved Build Process**: Added cross-platform asset copying to ensure accessibility statement templates and logos are correctly bundled and resolved in production builds, resolving `ENOENT` errors in CI/CD environments like Jenkins.
  - **Robust Path Resolution**: Hardened path resolution for assets to support multiple execution environments (src, dist, CI).

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
  - @holmdigital/components@2.1.0
  - @holmdigital/standards@2.1.0

## 2.0.1

### Patch Changes

- e574824: harden junit generation and fallback logic

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
  - @holmdigital/components@2.0.0
  - @holmdigital/standards@2.0.0

## 1.2.0

### Minor Changes

- 4c06ccf: feat: add cloud integration and CLI options

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

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@1.0.0

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

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@1.0.0

## 0.3.0

### Minor Changes

- feat: localize accessibility rules to Swedish, German, French, and Spanish
  fix: correct legal references in localized rules

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@0.3.0

## 0.2.2

### Patch Changes

- chore: ensure license files are included in package
- Updated dependencies
  - @holmdigital/standards@0.2.2

## 0.2.1

### Patch Changes

- docs: update README with HTML validation feature
- Updated dependencies
  - @holmdigital/standards@0.2.1

## 0.2.0

### Minor Changes

- Initial public release of the engine and standards packages.

### Patch Changes

- Updated dependencies
  - @holmdigital/standards@0.2.0
