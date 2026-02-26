# Codebase Structure

**Analysis Date:** 2026-02-26

## Directory Layout

```
a11y-hd/
├── .changeset/                # Changesets versioning config
│   └── config.json
├── .github/
│   └── workflows/
│       ├── release.yml        # CI: build + publish to npm on master
│       └── release-wiki.yml   # CI: wiki publishing
├── .planning/                 # GSD planning documents
│   └── codebase/              # Architecture analysis docs
├── docs/                      # Project documentation (Markdown)
│   ├── architecture/
│   │   └── ci-cd-strategy.md
│   ├── guides/
│   │   ├── accessibility-statement.md
│   │   ├── developer-cookbooks.md
│   │   ├── eu-legal-framework.md
│   │   └── nordic-authorities.md
│   └── reference/
│       ├── components.md
│       ├── engine.md
│       └── standards.md
├── packages/
│   ├── standards/             # @holmdigital/standards - regulatory data layer
│   ├── components/            # @holmdigital/components - accessible React UI
│   └── engine/                # @holmdigital/engine - scanning engine + CLI
├── eslint.config.mjs          # Root ESLint config (flat config)
├── package.json               # Root workspace config (npm workspaces)
├── package-lock.json          # npm lockfile
├── pnpm-lock.yaml             # pnpm lockfile (alternate)
├── pnpm-workspace.yaml        # pnpm workspace config
└── tsconfig.base.json         # Shared TypeScript config
```

## Directory Purposes

### `packages/standards/`

```
packages/standards/
├── data/
│   ├── legal/
│   │   ├── frameworks.json        # EU directive definitions (WAD, EAA)
│   │   ├── national-laws.json     # Country-specific laws (SE, NO, DK, FI, etc.)
│   │   ├── nordic-authorities.json # Nordic enforcement bodies
│   │   └── statement-tools.json   # Accessibility statement generation tools
│   ├── ict-manual-checks.json     # ICT manual verification checklist
│   ├── wcag-to-en301549.json      # WCAG-to-EN301549 mapping reference
│   ├── rules.en.json              # Convergence rules (English)
│   ├── rules.sv.json              # Convergence rules (Swedish)
│   ├── rules.de.json              # Convergence rules (German)
│   ├── rules.fr.json              # Convergence rules (French)
│   ├── rules.es.json              # Convergence rules (Spanish)
│   ├── rules.nl.json              # Convergence rules (Dutch)
│   ├── rules.no.json              # Convergence rules (Norwegian)
│   ├── rules.fi.json              # Convergence rules (Finnish)
│   ├── rules.da.json              # Convergence rules (Danish)
│   ├── rules.en-gb.json           # Convergence rules (British English)
│   ├── rules.en-us.json           # Convergence rules (US English)
│   └── rules.en-ca.json           # Convergence rules (Canadian English)
├── schema/
│   └── convergence-schema.json    # JSON Schema for rule validation
├── scripts/
│   ├── add-legal-context.js       # Script to add legal context to rules
│   └── add-legal-context-all-langs.js
├── src/
│   ├── index.ts                   # API: query functions, type exports
│   ├── index.test.ts              # Unit tests
│   └── types.ts                   # TypeScript type definitions
├── package.json
└── tsconfig.json
```

- Purpose: Machine-readable regulatory database and type definitions
- Contains: JSON data files (rules per locale, legal frameworks, enforcement data), TypeScript query API, JSON schema
- Key files: `src/index.ts` (all query functions), `src/types.ts` (all shared types), `data/rules.en.json` (canonical rule data)

### `packages/components/`

```
packages/components/
├── .storybook/
│   ├── main.ts                    # Storybook config
│   └── preview.ts                 # Storybook preview config
├── src/
│   ├── index.ts                   # Barrel export for all components
│   ├── index.test.ts              # Barrel export tests
│   ├── AccessibilityStatement/
│   │   └── AccessibilityStatement.tsx   # Legal statement React component
│   ├── Accordion/
│   │   └── Accordion.tsx
│   ├── Breadcrumbs/
│   │   └── Breadcrumbs.tsx
│   ├── Button/
│   │   └── Button.tsx
│   ├── Card/
│   │   └── Card.tsx
│   ├── Checkbox/
│   │   └── Checkbox.tsx
│   ├── Combobox/
│   │   └── Combobox.tsx
│   ├── DataTable/
│   │   └── DataTable.tsx
│   ├── DatePicker/
│   │   └── DatePicker.tsx
│   ├── Dialog/
│   │   └── Dialog.tsx
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
│   │   └── LiveRegion.test.tsx
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
│   └── TreeView/
│       └── TreeView.tsx
├── package.json
└── tsconfig.json
```

- Purpose: Prescriptive accessible React components for WCAG/EN 301 549 compliance
- Contains: 28 React components, each in its own PascalCase directory with a single `.tsx` file
- Key files: `src/index.ts` (barrel export), `src/AccessibilityStatement/AccessibilityStatement.tsx` (largest/most complex component), `src/Button/Button.tsx` (canonical component example)

### `packages/engine/`

```
packages/engine/
├── scripts/
│   └── copy-assets.mjs           # Build script: copies assets to dist
├── src/
│   ├── index.ts                   # Library entry: re-exports core modules
│   ├── assets/
│   │   └── logo.jpg               # Logo for accessibility statements
│   ├── automation/
│   │   └── pseudo-automation.ts   # Playwright test script generator
│   ├── cli/
│   │   ├── index.ts               # CLI entry point (hd-a11y-scan)
│   │   ├── cloud-client.ts        # HolmDigital Cloud API client
│   │   └── cloud-client.test.ts   # Cloud client tests
│   ├── core/
│   │   ├── regulatory-scanner.ts  # Main scanner class (Puppeteer + axe-core)
│   │   ├── virtual-dom.ts         # Virtual DOM builder (Shadow DOM support)
│   │   └── html-validator.ts      # HTML structure validator (html-validate)
│   ├── i18n/
│   │   ├── index.ts               # i18n module (setLanguage, t())
│   │   └── index.test.ts          # i18n tests
│   ├── locales/
│   │   ├── en.json                # English UI strings
│   │   ├── sv.json                # Swedish UI strings
│   │   ├── de.json                # German UI strings
│   │   ├── fr.json                # French UI strings
│   │   ├── es.json                # Spanish UI strings
│   │   ├── nl.json                # Dutch UI strings
│   │   ├── fi.json                # Finnish UI strings
│   │   ├── dk.json                # Danish UI strings
│   │   └── no.json                # Norwegian UI strings
│   └── reporting/
│       ├── badge-generator.ts     # shields.io badge URL generator
│       ├── badge-generator.test.ts
│       ├── github-actions.ts      # GitHub Actions annotation output
│       ├── html-template.ts       # HTML report template
│       ├── junit-generator.ts     # JUnit XML report generator
│       ├── junit-generator.test.ts
│       ├── pdf-generator.ts       # PDF generation via Puppeteer
│       ├── statement-generator.ts # Accessibility statement (HTML/MD) generator
│       └── templates/
│           ├── en.json            # English statement template
│           ├── sv.json            # Swedish statement template
│           ├── de.json            # German statement template
│           ├── fr.json            # French statement template
│           ├── es.json            # Spanish statement template
│           ├── nl.json            # Dutch statement template
│           ├── fi.json            # Finnish statement template
│           ├── da.json            # Danish statement template
│           └── no.json            # Norwegian statement template
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

- Purpose: Accessibility scanning engine, CLI tool, and report generation
- Contains: Core scanner, Virtual DOM builder, CLI, 6 report generators, cloud client, i18n, pseudo-automation
- Key files: `src/core/regulatory-scanner.ts` (main scanning logic), `src/cli/index.ts` (CLI entry point), `src/reporting/statement-generator.ts` (statement generation)

## Key File Locations

**Entry Points:**
- `packages/engine/src/cli/index.ts`: CLI binary entry point (`hd-a11y-scan`)
- `packages/engine/src/index.ts`: Engine library exports
- `packages/standards/src/index.ts`: Standards library exports
- `packages/components/src/index.ts`: Components barrel export

**Configuration:**
- `tsconfig.base.json`: Shared TypeScript config (ES2022, strict mode, bundler resolution)
- `packages/*/tsconfig.json`: Per-package TypeScript extending base
- `packages/engine/vitest.config.ts`: Test runner config for engine
- `eslint.config.mjs`: Root ESLint flat config
- `packages/components/.storybook/main.ts`: Storybook config
- `.changeset/config.json`: Changesets versioning config
- `.github/workflows/release.yml`: CI/CD release pipeline

**Core Logic:**
- `packages/engine/src/core/regulatory-scanner.ts`: Main `RegulatoryScanner` class - scan orchestration, axe-core execution, result enrichment, scoring
- `packages/engine/src/core/virtual-dom.ts`: `VirtualDOMBuilder` - DOM + Shadow DOM traversal
- `packages/engine/src/core/html-validator.ts`: `HtmlValidator` - structural HTML validation
- `packages/standards/src/index.ts`: All standards query functions (40+ exported functions)
- `packages/standards/src/types.ts`: All shared TypeScript interfaces and types

**Data:**
- `packages/standards/data/rules.en.json`: Canonical English convergence rules (WCAG -> EN 301 549 -> DOS-lagen)
- `packages/standards/data/legal/frameworks.json`: EU directive definitions (WAD, EAA)
- `packages/standards/data/legal/national-laws.json`: Country-specific accessibility laws and sanctions
- `packages/standards/schema/convergence-schema.json`: JSON Schema for rule validation

**Reporting:**
- `packages/engine/src/reporting/statement-generator.ts`: Accessibility statement generation (HTML + Markdown)
- `packages/engine/src/reporting/html-template.ts`: Scan result HTML report template
- `packages/engine/src/reporting/pdf-generator.ts`: PDF generation via Puppeteer
- `packages/engine/src/reporting/junit-generator.ts`: JUnit XML for CI/CD
- `packages/engine/src/reporting/github-actions.ts`: GitHub Actions annotation commands

**Testing:**
- `packages/engine/src/cli/cloud-client.test.ts`: Cloud client tests
- `packages/engine/src/i18n/index.test.ts`: i18n tests
- `packages/engine/src/reporting/badge-generator.test.ts`: Badge generator tests
- `packages/engine/src/reporting/junit-generator.test.ts`: JUnit generator tests
- `packages/components/src/index.test.ts`: Component barrel export tests
- `packages/components/src/LiveRegion/LiveRegion.test.tsx`: LiveRegion component tests
- `packages/standards/src/index.test.ts`: Standards API tests

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `FormField.tsx`, `AccessibilityStatement.tsx`)
- TypeScript modules: `kebab-case.ts` (e.g., `regulatory-scanner.ts`, `virtual-dom.ts`, `badge-generator.ts`)
- Test files: `{name}.test.ts` or `{name}.test.tsx` co-located with source (e.g., `cloud-client.test.ts`)
- JSON data: `rules.{locale}.json` for localized rules, `kebab-case.json` for other data
- Locale files: `{lang-code}.json` (e.g., `en.json`, `sv.json`, `en-gb.json`)

**Directories:**
- Components: `PascalCase/` matching component name (e.g., `Button/`, `FormField/`, `AccessibilityStatement/`)
- Engine modules: `kebab-case/` by domain (e.g., `core/`, `cli/`, `reporting/`, `automation/`, `i18n/`, `locales/`)
- Standards: `data/`, `schema/`, `scripts/`, `src/`

## Where to Add New Code

**New React Component:**
1. Create directory: `packages/components/src/{ComponentName}/`
2. Create file: `packages/components/src/{ComponentName}/{ComponentName}.tsx`
3. Export from barrel: add `export * from './{ComponentName}/{ComponentName}';` to `packages/components/src/index.ts`
4. Add tree-shakeable export in `packages/components/package.json` under `"exports"` field
5. Add to build script entry points in `packages/components/package.json` `"scripts.build"`
6. Add test file: `packages/components/src/{ComponentName}/{ComponentName}.test.tsx`
7. Use `forwardRef`, include WCAG compliance comments, enforce accessibility props (aria-*, tabIndex, minimum touch targets)

**New Accessibility Rule (Convergence Rule):**
1. Add rule object to ALL locale files: `packages/standards/data/rules.{locale}.json`
2. Follow schema: `packages/standards/schema/convergence-schema.json`
3. Include: `ruleId`, `wcagCriteria`, `en301549Criteria`, `remediation`, `holmdigitalInsight`, `testability`, `tags`
4. Optionally include `legalContext` with `appliesTo` (WAD/EAA), `sectors`, `eaaDeadline`
5. Validate: `npm run validate-schema -w @holmdigital/standards`

**New Report Format:**
1. Create generator: `packages/engine/src/reporting/{format}-generator.ts`
2. Export function signature: `generate{Format}(result: ScanResult): string`
3. Add CLI option in `packages/engine/src/cli/index.ts`
4. Add test: `packages/engine/src/reporting/{format}-generator.test.ts`

**New CLI Command/Option:**
1. Edit `packages/engine/src/cli/index.ts`
2. Add `.option()` to the commander program
3. Handle in the `.action()` callback
4. Add i18n strings to all locale files in `packages/engine/src/locales/`

**New Language/Locale:**
1. Create `packages/standards/data/rules.{lang}.json` (copy from `rules.en.json`, translate)
2. Create `packages/engine/src/locales/{lang}.json` (CLI UI strings)
3. Create `packages/engine/src/reporting/templates/{lang}.json` (statement template)
4. Register in `packages/standards/src/index.ts` `getData()` switch
5. Register in `packages/engine/src/i18n/index.ts` imports and `locales` map

**New Legal Framework Data:**
1. Add to appropriate JSON in `packages/standards/data/legal/`
2. Add TypeScript types in `packages/standards/src/types.ts`
3. Add query functions in `packages/standards/src/index.ts`
4. Export new types from `packages/standards/src/index.ts`

## Special Directories

**`packages/standards/data/`:**
- Purpose: Static JSON regulatory data (rules, legal frameworks, enforcement bodies)
- Generated: Partially (scripts can add legal context to all langs)
- Committed: Yes - this IS the product data

**`packages/standards/schema/`:**
- Purpose: JSON Schema for validating convergence rules
- Generated: No
- Committed: Yes

**`packages/engine/src/locales/`:**
- Purpose: i18n translation files for CLI and report UI strings
- Generated: No (manually authored translations)
- Committed: Yes

**`packages/engine/src/reporting/templates/`:**
- Purpose: Language-specific accessibility statement templates following EU/national formats
- Generated: No (manually authored per legal requirements)
- Committed: Yes

**`packages/engine/src/assets/`:**
- Purpose: Static assets (logo) embedded in generated reports
- Generated: No
- Committed: Yes

**`dist/` (per package, not committed):**
- Purpose: Build output (CJS + ESM + type declarations)
- Generated: Yes, via `tsup`
- Committed: No (in `.gitignore`)

**`node_modules/` (root + per package):**
- Purpose: npm dependencies
- Generated: Yes, via `npm ci`
- Committed: No

---

*Structure analysis: 2026-02-26*
