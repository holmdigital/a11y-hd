# @holmdigital/engine

## 2.6.1

### Patch Changes

- Updated dependencies
  - @holmdigital/components@3.0.0

## 2.6.0

### Minor Changes

- aa05346: **Plain-language report mode (klarspråksläge)** (2026-06-12):

  Opt-in plain-language report for non-technical recipients — `--plain` / `--audience plain`.

  **CLI flags (PLAIN-04):**
  - `--audience <developer|plain>` — explicit audience selector (default `developer`)
  - `--plain` — alias for `--audience plain`; takes precedence over `--audience` when both are set
  - Flag precedence: `--json > --light > --plain > dashboard` (D-12)
  - `--plain --json` outputs JSON (with `plainLanguage` data); `--plain --light` outputs light report

  **Terminal renderer:**
  - `renderPlainReport(result, lang)` — business-impact-sorted terminal report
  - Opening framing (no blame, no invented statistics), per-issue list (5 business-first labeled fields + chalk badge), neutral closing
  - Badge colors: `stoppar-kop` = red bold, `hindrar` = red, `forsamrar` = yellow, `putsning` = gray
  - All chrome via `t('plain.*')` i18n keys (D-01)
  - No compliance score (D-05)

  **Plain PDF (PLAIN-05, D-08):**
  - `generateReportHTML(result, sector, audience?)` — third param `audience` defaulted to `'developer'`; existing two-arg callers compile and produce byte-for-byte identical output (D-13 snapshot guard)
  - `audience='plain'` generates a plain HTML document mirroring the terminal: opening + impact-sorted numbered list (5 fields + badge) + neutral closing + footer with URL/scan date/engine version (D-16)
  - No score, no WCAG/DIGG tables, no legal sections in the plain PDF
  - `result.url` HTML-escaped before interpolation (T-34-08 mitigation)

  **i18n chrome:**
  - `plain.*` namespace (19 keys) in all 9 locale files (en/sv real translations; de/fr/es/nl/fi/dk/no English-valued pending native review)
  - `plain.attribution` — discreet report attribution line rendered in terminal footer and plain PDF footer
  - `plain.fallback_framing` — framing line rendered before technical description for findings without plainLanguage copy

  **D-13 developer-PDF regression lock:**
  - Snapshot test on `generateReportHTML(result, sector)` (two-arg calls) ensures the developer HTML is byte-for-byte unchanged when the `audience` param lands

  **D-16 footer version source:**
  - Plain PDF footer version comes from `getEngineVersion()` (`__ENGINE_VERSION__` injected at build time from `packages/engine/package.json` via tsup define) — never a root or standards version

  **PDF page-break safety:**
  - Plain HTML template sets `break-inside: avoid; page-break-inside: avoid` on each finding item, ensuring findings shorter than a full page are never split across a page boundary in the PDF

### Patch Changes

- Updated dependencies [aa05346]
  - @holmdigital/standards@2.7.0

## 2.5.6

### Patch Changes

- 5d7716e: Public discoverability pass (npm metadata only, no runtime changes):
  - **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
  - **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
  - **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
  - All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).

- Updated dependencies [5d7716e]
  - @holmdigital/standards@2.6.1
  - @holmdigital/components@2.7.2

## 2.5.4

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged. Fixed 2 pre-existing lint errors in `src/core/regulatory-scanner.ts` (`__ENGINE_VERSION__` ESLint readonly global, `@ts-ignore` → `@ts-expect-error`). Public API byte-equivalent to 2.5.2.
- Updated dependencies [0b911ef]
- Updated dependencies [c75ea8a]
- Updated dependencies [c75ea8a]
  - @holmdigital/components@2.7.0
  - @holmdigital/standards@2.5.3

## 2.5.3

### Patch Changes

- PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors.
- Resolved 2 pre-existing lint errors in `src/core/regulatory-scanner.ts`:
  - Declared `__ENGINE_VERSION__` as an ESLint readonly global via source-level `/* global __ENGINE_VERSION__ */` comment (chosen over `package.json#eslintConfig` because the repo uses flat config `eslint.config.mjs` which does NOT read legacy `eslintConfig`; the type was already declared via `src/globals.d.ts`).
  - Swapped `// @ts-ignore` for `// @ts-expect-error` with rationale comment (per `@typescript-eslint/ban-ts-comment` rule defaults). The directive remains needed — `window.axe` is injected by the axe-core script tag at runtime and is not part of `lib.dom`.
- TS2724 / `--skipLibCheck` contingency NOT triggered: `tsc --noEmit` exits 0 cleanly under puppeteer 23.10.4 + TypeScript 5.7.2. No skipLibCheck flag applied.
- No source-behavior changes. Public API byte-equivalent to 2.5.2.

## 2.5.2

### Patch Changes

- ef3d381: Add HHS Section 504 (REHAB framework) routing for US private-sector statements

  `statement-generator.ts` now references both ADA Title III and Section 504 (HHS Final Rule) when rendering accessibility statements with `--country US --sector private`. Healthcare and HHS-funded private organisations (hospitals, FQHCs, research institutions, health plans) previously got a statement that omitted their primary obligation under 45 C.F.R. Part 84.

  Output format mirrors the existing US public-sector pattern (ADA Title II + Section 508):

  > Americans with Disabilities Act Title III (ADA Title III) & Section 504 of the Rehabilitation Act of 1973 (Section 504 (HHS Final Rule))

  Requires `@holmdigital/standards@2.5.1` for the Section 504 entry and the `'REHAB'` framework value.

- Updated dependencies [ef3d381]
  - @holmdigital/standards@2.5.1

## 2.5.1

### Patch Changes

- Fix: PDF-rapport och violation-badges filtreras nu korrekt baserat på `--sector`.

  Tidigare visades alltid både WAD och EAA oavsett vald sektor. Nu gäller:
  - `--sector public` (default): visar enbart WAD-violations och WAD-badges
  - `--sector private`: visar enbart EAA-violations, EAA deadline-stats och EAA-badges

  GitHub Actions-exemplet i README uppdaterat med `--sector` och förklarande kommentar.

## 2.5.0

### Minor Changes

- b30249a: Add ADA Title II and Title III support for US accessibility compliance

  **Background:** DOJ's final rule (28 CFR Part 35, published 2024-04-24) requires
  state and local governments to meet WCAG 2.1 Level AA by 2026-04-24 (entities
  serving 50,000+ population) or 2027-04-24 (smaller entities).

  **@holmdigital/standards:**
  - New `LegalFramework` value: `'ADA'`
  - Two new US laws in `national-laws.json`: `us-ada-title-ii` (public sector) and
    `us-ada-title-iii` (private sector)
  - New DOJ authority id `us-doj`
  - New optional `NationalLaw.complianceDeadlines` field (Title II: 2026-04-24 /
    2027-04-24)
  - ADA framework added to `frameworks.json` with WCAG 2.1 AA
  - 46 convergence rules across all 12 rule-locale files now tagged with `"ADA"`
    in `legalContext.appliesTo`
  - Fixed inconsistency: `ENFORCEMENT_BODIES_DETAILED.US.wad` is now
    `'General Services Administration (GSA)'` to align with the Section 508
    enforcement entry. `.eaa` remains DOJ. `ENFORCEMENT_BODIES.US` unchanged (DOJ).
  - New statement tool: ITIC VPAT template (`itic-vpat`)

  **@holmdigital/engine:**
  - Statement generator is now sector-aware for US: `--country US --sector public`
    references ADA Title II + Section 508 with DOJ as enforcement body;
    `--sector private` references ADA Title III with DOJ as enforcement body
  - en-us.json template's intro and enforcement sections now use
    `{<national_law>}` placeholder for dynamic law resolution

  **Migration:** No breaking changes. Consumers using
  `getNationalLawByFramework('WAD', 'US')` still receive Section 508.

### Patch Changes

- Updated dependencies [b30249a]
  - @holmdigital/standards@2.4.0

## 2.4.1

### Patch Changes

- 43aaaf3: fix(engine): distinguish best-practice rules from unmapped WCAG rules
  - axe-core rules tagged as 'best-practice' (e.g. aria-allowed-role, presentation-role-conflict) now show 'Best Practice' instead of 'WCAG Unknown' with risk level 'low' instead of 'medium'
  - Fallback messages for best-practice and unmapped rules are now localized across all 9 supported languages (en, sv, no, fi, da, de, fr, es, nl)
  - Previously all fallback strings were hardcoded in Swedish regardless of the --lang flag

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
