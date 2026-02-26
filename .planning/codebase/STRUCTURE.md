# Codebase Structure

**Analysis Date:** 2026-02-26

## Directory Layout

```
a11y-hd/
├── .changeset/               # Changesets for versioned releases
├── .github/
│   └── workflows/
│       ├── release.yml       # CI/CD: build, version, publish to NPM
│       └── release-wiki.yml  # Wiki release automation
├── .planning/
│   └── codebase/             # GSD codebase analysis documents
├── docs/
│   ├── architecture/         # Architecture documentation
│   │   └── ci-cd-strategy.md
│   ├── guides/               # User/developer guides
│   │   ├── accessibility-statement.md
│   │   ├── developer-cookbooks.md
│   │   ├── eu-legal-framework.md
│   │   └── nordic-authorities.md
│   └── reference/            # API reference docs
│       ├── components.md
│       ├── engine.md
│       └── standards.md
├── packages/
│   ├── standards/            # @holmdigital/standards (Layer 1 - base)
│   ├── components/           # @holmdigital/components (Layer 2)
│   └── engine/               # @holmdigital/engine (Layer 3 - top)
├── eslint.config.mjs         # Root ESLint config (flat config format)
├── package.json              # Root workspace config (npm workspaces)
├── package-lock.json         # npm lockfile
├── pnpm-lock.yaml            # pnpm lockfile (alternative)
├── pnpm-workspace.yaml       # pnpm workspace definition
├── tsconfig.base.json        # Shared TypeScript config
├── CONTRIBUTING.md           # Contribution guidelines
├── LICENSE                   # MIT license
└── README.md                 # Project overview
```

### packages/standards/

```
packages/standards/
├── data/
│   ├── legal/
│   │   ├── frameworks.json         # EU directives (WAD, EAA) metadata
│   │   ├── national-laws.json      # Country-specific law implementations
│   │   ├── nordic-authorities.json # Nordic enforcement authorities
│   │   └── statement-tools.json    # Accessibility statement generator tools
│   ├── ict-manual-checks.json      # ICT manual verification checklist
│   ├── rules.en.json               # English convergence rules
│   ├── rules.sv.json               # Swedish convergence rules
│   ├── rules.de.json               # German convergence rules
│   ├── rules.fr.json               # French convergence rules
│   ├── rules.es.json               # Spanish convergence rules
│   ├── rules.nl.json               # Dutch convergence rules
│   ├── rules.no.json               # Norwegian convergence rules
│   ├── rules.fi.json               # Finnish convergence rules
│   ├── rules.da.json               # Danish convergence rules
│   ├── rules.en-gb.json            # British English convergence rules
│   ├── rules.en-us.json            # US English convergence rules
│   ├── rules.en-ca.json            # Canadian English convergence rules
│   └── wcag-to-en301549.json       # WCAG to EN 301 549 mapping
├── schema/
│   └── convergence-schema.json     # JSON Schema for rule validation
├── scripts/
│   ├── add-legal-context.js        # Script to add legal context to rules
│   ├── add-legal-context-all-langs.js
│   └── validate-data.js            # Data validation script
│   └── validate-schema.js          # Schema validation script
├── src/
│   ├── index.ts                    # Main entry: all query/lookup functions
│   ├── index.test.ts               # Tests for standards API
│   └── types.ts                    # All TypeScript type definitions
├── package.json
└── tsconfig.json
```

### packages/components/

```
packages/components/
├── .storybook/
│   ├── main.ts                     # Storybook configuration
│   └── preview.ts                  # Storybook preview decorators
├── src/
│   ├── AccessibilityStatement/
│   │   └── AccessibilityStatement.tsx  # Legal-compliant statement component
│   ├── Accordion/
│   │   └── Accordion.tsx
│   ├── Breadcrumbs/
│   │   └── Breadcrumbs.tsx
│   ├── Button/
│   │   └── Button.tsx              # Primary button with contrast/touch compliance
│   ├── Card/
│   │   └── Card.tsx
│   ├── Checkbox/
│   │   └── Checkbox.tsx
│   ├── Combobox/
│   │   └── Combobox.tsx
│   ├── DataTable/
│   │   └── DataTable.tsx           # Sortable accessible table
│   ├── DatePicker/
│   │   └── DatePicker.tsx
│   ├── Dialog/
│   │   └── Dialog.tsx              # Native <dialog> with focus trap
│   ├── ErrorSummary/
│   │   └── ErrorSummary.tsx
│   ├── FormField/
│   │   └── FormField.tsx
│   ├── Heading/
│   │   └── Heading.tsx
│   ├── HelpText/
│   │   └── HelpText.tsx
│   ├── LiveRegion/
│   │   ├── LiveRegion.tsx
│   │   └── LiveRegion.test.tsx     # Component-level test
│   ├── Modal/
│   │   └── Modal.tsx
│   ├── MultiSelect/
│   │   └── MultiSelect.tsx
│   ├── NavigationMenu/
│   │   └── NavigationMenu.tsx
│   ├── Pagination/
│   │   └── Pagination.tsx
│   ├── ProgressBar/
│   │   └── ProgressBar.tsx
│   ├── RadioGroup/
│   │   └── RadioGroup.tsx
│   ├── Select/
│   │   └── Select.tsx
│   ├── Skeleton/
│   │   └── Skeleton.tsx
│   ├── SkipLink/
│   │   └── SkipLink.tsx
│   ├── Switch/
│   │   └── Switch.tsx
│   ├── Tabs/
│   │   └── Tabs.tsx
│   ├── Toast/
│   │   └── Toast.tsx
│   ├── Tooltip/
│   │   └── Tooltip.tsx
│   ├── TreeView/
│   │   └── TreeView.tsx
│   ├── index.ts                    # Barrel file re-exporting all components
│   └── index.test.ts               # Smoke test for exports
├── package.json
└── tsconfig.json (inherited from base)
```

### packages/engine/

```
packages/engine/
├── scripts/
│   └── copy-assets.mjs            # Post-build: copies assets to dist
├── src/
│   ├── assets/
│   │   └── logo.jpg               # HolmDigital logo for reports
│   ├── automation/
│   │   └── pseudo-automation.ts    # Playwright test script generator
│   ├── cli/
│   │   ├── index.ts               # CLI entry point (hd-a11y-scan)
│   │   ├── cloud-client.ts        # HolmDigital Cloud API client
│   │   └── cloud-client.test.ts   # Cloud client tests
│   ├── core/
│   │   ├── regulatory-scanner.ts  # Main scanner class (orchestrator)
│   │   ├── html-validator.ts      # HTML validation wrapper
│   │   └── virtual-dom.ts         # Virtual DOM + Shadow DOM builder
│   ├── i18n/
│   │   ├── index.ts               # i18n functions (setLanguage, t)
│   │   └── index.test.ts          # i18n tests
│   ├── locales/
│   │   ├── en.json                # English CLI strings
│   │   ├── sv.json                # Swedish CLI strings
│   │   ├── de.json                # German CLI strings
│   │   ├── dk.json                # Danish CLI strings
│   │   ├── es.json                # Spanish CLI strings
│   │   ├── fi.json                # Finnish CLI strings
│   │   ├── fr.json                # French CLI strings
│   │   ├── nl.json                # Dutch CLI strings
│   │   └── no.json                # Norwegian CLI strings
│   ├── reporting/
│   │   ├── templates/
│   │   │   ├── en.json            # English statement template
│   │   │   ├── sv.json            # Swedish statement template
│   │   │   ├── da.json            # Danish statement template
│   │   │   ├── de.json            # German statement template
│   │   │   ├── es.json            # Spanish statement template
│   │   │   ├── fi.json            # Finnish statement template
│   │   │   ├── fr.json            # French statement template
│   │   │   ├── nl.json            # Dutch statement template
│   │   │   └── no.json            # Norwegian statement template
│   │   ├── badge-generator.ts     # shields.io badge URL generator
│   │   ├── badge-generator.test.ts
│   │   ├── github-actions.ts      # GitHub Actions annotation output
│   │   ├── html-template.ts       # HTML report template
│   │   ├── junit-generator.ts     # JUnit XML report generator
│   │   ├── junit-generator.test.ts
│   │   ├── pdf-generator.ts       # PDF generation via Puppeteer
│   │   └── statement-generator.ts # Accessibility statement generator
│   └── index.ts                   # Programmatic API barrel file
├── package.json
└── tsconfig.json (inherited from base)
```

## Directory Purposes

**`packages/standards/data/`:**
- Purpose: All machine-readable regulatory data
- Contains: Locale-specific convergence rules (`rules.*.json`), legal framework data (`legal/*.json`), ICT manual checks, WCAG-to-EN301549 mappings
- Key files: `rules.en.json` (English rules, ~12 locale variants), `legal/frameworks.json`, `legal/national-laws.json`

**`packages/standards/src/`:**
- Purpose: TypeScript API layer over raw JSON data
- Contains: Type definitions, query/lookup functions, exports
- Key files: `index.ts` (30+ exported functions), `types.ts` (all interface/type definitions)

**`packages/components/src/`:**
- Purpose: React component implementations, one component per directory
- Contains: 28 component directories, each with a single `.tsx` file
- Key files: `index.ts` (barrel), `AccessibilityStatement/AccessibilityStatement.tsx` (most complex, ~700 lines)

**`packages/engine/src/core/`:**
- Purpose: Core scanning logic
- Contains: The `RegulatoryScanner` class, HTML validator, Virtual DOM builder
- Key files: `regulatory-scanner.ts` (main orchestrator, ~400 lines)

**`packages/engine/src/cli/`:**
- Purpose: Command-line interface and cloud integration
- Contains: CLI entry point with commander, cloud API client
- Key files: `index.ts` (CLI, ~400 lines), `cloud-client.ts`

**`packages/engine/src/reporting/`:**
- Purpose: Output generation in multiple formats
- Contains: HTML, PDF, JUnit, Markdown, GitHub Actions, badge generators, statement templates
- Key files: `html-template.ts`, `statement-generator.ts`, `junit-generator.ts`

**`packages/engine/src/i18n/`:**
- Purpose: Internationalization for CLI/report UI strings
- Contains: i18n functions and locale data
- Key files: `index.ts` (setLanguage, t, getCurrentLang)

**`docs/`:**
- Purpose: Human-readable documentation
- Contains: Architecture docs, developer guides, API reference
- Key files: `guides/eu-legal-framework.md`, `reference/engine.md`, `reference/components.md`

## Key File Locations

**Entry Points:**
- `packages/engine/src/cli/index.ts`: CLI binary entry point (`hd-a11y-scan`)
- `packages/engine/src/index.ts`: Engine programmatic API
- `packages/standards/src/index.ts`: Standards data API
- `packages/components/src/index.ts`: Component library barrel

**Configuration:**
- `tsconfig.base.json`: Shared TypeScript compiler options (ES2022, strict mode, bundler resolution)
- `eslint.config.mjs`: Root ESLint flat config
- `package.json`: Root workspace definition and build scripts
- `pnpm-workspace.yaml`: pnpm workspace packages declaration

**Core Logic:**
- `packages/engine/src/core/regulatory-scanner.ts`: Scan orchestration (browser launch, axe injection, result enrichment, scoring)
- `packages/standards/src/index.ts`: All data query functions (getConvergenceRule, searchRulesByTags, generateRegulatoryReport, etc.)
- `packages/standards/src/types.ts`: All TypeScript interfaces and type aliases
- `packages/engine/src/reporting/statement-generator.ts`: Accessibility statement generation (HTML + Markdown)

**Testing:**
- `packages/standards/src/index.test.ts`: Standards API tests
- `packages/components/src/index.test.ts`: Component export smoke tests
- `packages/components/src/LiveRegion/LiveRegion.test.tsx`: Component unit test
- `packages/engine/src/i18n/index.test.ts`: i18n function tests
- `packages/engine/src/cli/cloud-client.test.ts`: Cloud client tests
- `packages/engine/src/reporting/badge-generator.test.ts`: Badge generator tests
- `packages/engine/src/reporting/junit-generator.test.ts`: JUnit generator tests

## Naming Conventions

**Files:**
- Components: `PascalCase` directory with matching `PascalCase.tsx` file (e.g., `Button/Button.tsx`)
- Engine modules: `kebab-case.ts` (e.g., `regulatory-scanner.ts`, `cloud-client.ts`)
- Tests: Co-located with source, suffixed `.test.ts` or `.test.tsx` (e.g., `index.test.ts`, `LiveRegion.test.tsx`)
- JSON data: `kebab-case.json` with optional locale suffix (e.g., `rules.en.json`, `rules.sv.json`)
- Locale data: `{lang-code}.json` (e.g., `en.json`, `sv.json`, `en-gb.json`)

**Directories:**
- Component directories: `PascalCase` (e.g., `Button/`, `AccessibilityStatement/`)
- Engine subdirectories: `kebab-case` (e.g., `core/`, `reporting/`, `i18n/`)
- Standards subdirectories: `kebab-case` (e.g., `data/`, `schema/`, `scripts/`)

**Package Names:**
- Scoped under `@holmdigital/`: `@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`

**Exports:**
- Types: `PascalCase` (e.g., `ConvergenceRule`, `RegulatoryReport`, `ScanResult`)
- Functions: `camelCase` (e.g., `getConvergenceRule`, `generateRegulatoryReport`, `searchRulesByTags`)
- Components: `PascalCase` (e.g., `Button`, `Dialog`, `AccessibilityStatement`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `ENFORCEMENT_BODIES`)

## Where to Add New Code

**New Accessibility Component:**
- Create directory: `packages/components/src/{ComponentName}/`
- Create file: `packages/components/src/{ComponentName}/{ComponentName}.tsx`
- Add export to: `packages/components/src/index.ts`
- Add to tsup build entry in: `packages/components/package.json` (scripts.build)
- Add export map entry in: `packages/components/package.json` (exports field)
- Add Storybook story: `packages/components/src/{ComponentName}/{ComponentName}.stories.tsx` (if following Storybook patterns)
- Add test: `packages/components/src/{ComponentName}/{ComponentName}.test.tsx`

**New Convergence Rule:**
- Add rule JSON to ALL locale files: `packages/standards/data/rules.*.json` (12 files)
- Validate against schema: `packages/standards/schema/convergence-schema.json`
- Run validation script: `npm run validate-data -w @holmdigital/standards`

**New Report Format:**
- Create generator: `packages/engine/src/reporting/{format}-generator.ts`
- Add CLI option: `packages/engine/src/cli/index.ts` (add `.option()` and handler in `.action()`)
- Add test: `packages/engine/src/reporting/{format}-generator.test.ts`
- Export from: `packages/engine/src/index.ts` (if part of public API)

**New Language/Locale:**
- Standards rules: Add `packages/standards/data/rules.{lang}.json`
- Standards index: Add import and switch case in `packages/standards/src/index.ts` `getData()`
- Engine CLI strings: Add `packages/engine/src/locales/{lang}.json`
- Engine i18n: Add import and map entry in `packages/engine/src/i18n/index.ts`
- Statement template: Add `packages/engine/src/reporting/templates/{lang}.json`

**New Legal/Regulatory Data:**
- Add data file: `packages/standards/data/legal/{category}.json`
- Add query functions: `packages/standards/src/index.ts`
- Add types: `packages/standards/src/types.ts`

**New CLI Command or Sub-command:**
- Implement in: `packages/engine/src/cli/index.ts` (add new `program.command()`)
- For complex commands, extract to: `packages/engine/src/cli/{command-name}.ts`

**Utilities/Helpers:**
- Engine utilities: `packages/engine/src/{category}/{name}.ts`
- Standards utilities: `packages/standards/src/{name}.ts`
- No shared utility package exists; each package is self-contained

## Special Directories

**`packages/standards/data/`:**
- Purpose: Machine-readable regulatory JSON data
- Generated: Partially (scripts can add legal context), but primarily hand-authored
- Committed: Yes
- Note: Published to NPM and exposed via `@holmdigital/standards/data/*` export

**`packages/standards/schema/`:**
- Purpose: JSON Schema for validating rule data
- Generated: No
- Committed: Yes
- Note: Published to NPM and exposed via `@holmdigital/standards/schema/*` export

**`packages/engine/src/assets/`:**
- Purpose: Static assets (logo image) used in reports
- Generated: No
- Committed: Yes
- Note: Copied to dist via `scripts/copy-assets.mjs` post-build

**`packages/engine/src/locales/`:**
- Purpose: i18n string files for CLI and reports
- Generated: No (hand-translated)
- Committed: Yes

**`packages/engine/src/reporting/templates/`:**
- Purpose: Localized accessibility statement templates (Markdown-like with template syntax)
- Generated: No (hand-translated)
- Committed: Yes
- Note: Uses custom template syntax with conditionals `[...]`, choices `{A / B / C}`, and variable substitutions `{<var>}`

**`.changeset/`:**
- Purpose: Changeset files for versioned releases
- Generated: Via `npx changeset` command
- Committed: Yes (consumed by changesets/action in CI)

**`dist/` (in each package):**
- Purpose: Build output (CJS, ESM, type declarations)
- Generated: Yes (via tsup)
- Committed: No (gitignored)

---

*Structure analysis: 2026-02-26*
