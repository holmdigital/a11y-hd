# @holmdigital/standards

## 2.5.3

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors. No source changes.

## 2.5.2

### Patch Changes

- PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — npm publish now fails if lint or typecheck reports errors. No source changes; current source was already clean against both new gates.

## 2.5.1

### Patch Changes

- ef3d381: Fix HHS Section 504 type contract, framework metadata gaps, and EAA inForce drift (post-2.5.0 review)

  **Type contract fix (was a published-API break in 2.5.0)**
  - Widen `NationalLaw.complianceDeadlines` to a discriminated union covering both `populationThreshold` (ADA Title II) and `employeeThreshold` (HHS Section 504). The 2.5.0 entry shipped `employeeThreshold` against a type that only declared `populationThreshold`, leaving downstream TypeScript consumers with `undefined` where the type promised `number`. New `ComplianceDeadlineEntry` type is exported.
  - Stop excluding `**/*.test.ts` from `tsc` so this class of defect is caught at build time. Updated existing tests to narrow on the new discriminant.

  **Framework metadata symmetry**
  - Add `REHAB` (Rehabilitation Act of 1973 / Section 504) and `DDA` (Disability Discrimination Act 1992) entries to `frameworks.json`. Previously `getLegalFramework('REHAB')` and `getLegalFramework('DDA')` were callable per the union type but returned `null` because the data file had no entries.

  **inForce semantics correction**
  - HHS Section 504 entry is now `inForce: true` with `effectiveDate: "2024-07-08"` (when the HHS Final Rule took effect). The previous `inForce: false` was incorrect — Section 504 obligations are active; only the WCAG 2.1 AA technical benchmark is staged on `complianceDeadlines.largeEntity.deadline` (2026-05-11).
  - Same drift fix applied to four EAA private-sector entries (SE/lptt, FI/fi-eaa, DE/de-bfsg, NL/nl-eaa) which carried `inForce: false` despite `effectiveDate: "2025-06-28"` having passed almost a year ago.

  **Convergence rules tagging**
  - Add `"REHAB"` to the `legalContext.appliesTo` array of all 46 WCAG 2.1 A/AA convergence rules across 12 locale files (552 changes). `getRulesByFramework('REHAB')` now returns the same coverage set as ADA Title II/III. Level AAA rules are excluded (Section 504 does not mandate AAA).

  **EAA microbusiness exemption metadata**
  - New `MicrobusinessExemption` type and `NationalLaw.exemptions.microbusiness` field. Encodes the EAA Article 4(5) exemption: services-providing microenterprises with fewer than 10 employees AND annual turnover or balance sheet at or below 2 million EUR are exempt from accessibility requirements. Both conditions must be met cumulatively. Applied to all 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL).

  **Schema validation**
  - New `schema/national-laws-schema.json` (JSON Schema Draft-07) for structural validation of `national-laws.json`. Vitest now validates the data file against the schema on every run via `ajv`.

  **Test coverage additions**
  - Date-driven `inForce` assertion across all 16 supported countries replaces the brittle entity-ID exclusion filter. Catches future drift like the EAA inForce gap.
  - Direct coverage of the public framework API: `getNationalLawByFramework('REHAB', 'US')`, `getLegalFramework('REHAB')`, `getLegalFramework('DDA')`, `getRulesByFramework('REHAB')`.
  - Regression guard: filtering `euFramework === 'ADA' && scope === 'private'` returns only Title III, not the new Section 504 entry.
  - New tests asserting microbusiness exemption presence and EAA-mandated thresholds across all 7 EAA private-sector entries.
  - Schema validation test fails the suite if any future law entry violates the structural contract.

## 2.5.0

### Minor Changes

- f2e722e: Add HHS Section 504 Final Rule (US) to national laws database

  Adds `us-hhs-section-504` — the HHS Digital Accessibility Final Rule (45 C.F.R. Part 84, 89 FR 40066) — as a new US law entry. Covers private organizations receiving federal financial assistance from HHS (hospitals, FQHCs, research institutions, health plans). Enforcement deadline for entities with 15+ employees is 2026-05-11; smaller entities by 2027-05-10. Technical standard: WCAG 2.1 Level AA (45 C.F.R. § 84.85).

  Also adds `'REHAB'` to the `LegalFramework` union type to represent the Rehabilitation Act framework (no direct EU equivalent).

## 2.4.0

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

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

## 2.1.1

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

## 0.3.0

### Minor Changes

- feat: localize accessibility rules to Swedish, German, French, and Spanish
  fix: correct legal references in localized rules

## 0.2.2

### Patch Changes

- chore: ensure license files are included in package

## 0.2.1

### Patch Changes

- docs: update README with HTML validation feature

## 0.2.0

### Minor Changes

- Initial public release of the engine and standards packages.
