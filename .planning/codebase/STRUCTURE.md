# Codebase Structure

**Analysis Date:** 2026-05-10

## Directory Layout

```
a11y-hd-project/
├── packages/
│   ├── engine/                    # @holmdigital/engine — scanner + CLI
│   │   ├── src/
│   │   │   ├── cli/               # commander-based CLI + cloud uploader
│   │   │   ├── core/              # RegulatoryScanner, VirtualDOMBuilder, HtmlValidator
│   │   │   ├── automation/        # PseudoAutomationEngine
│   │   │   ├── reporting/         # HTML/PDF/JUnit/badge/statement generators
│   │   │   │   └── templates/     # 16 locale JSON files for report chrome
│   │   │   ├── i18n/              # setLanguage / t() helpers
│   │   │   ├── locales/           # 9 locale JSON files for engine strings
│   │   │   ├── assets/            # logo.jpg etc.
│   │   │   ├── globals.d.ts       # __ENGINE_VERSION__ tsup banner type
│   │   │   └── index.ts           # programmatic API barrel
│   │   ├── scripts/               # copy-assets.mjs, verify-statements.ts
│   │   ├── dist/                  # build output (CJS + ESM + DTS + cli/)
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   ├── components/                # @holmdigital/components — React primitives
│   │   ├── src/
│   │   │   ├── AccessibilityStatement/  # legal statement (consumed by engine)
│   │   │   ├── Button/ Card/ Checkbox/ Combobox/ DataTable/ DatePicker/
│   │   │   ├── Dialog/ ErrorSummary/ FormField/ Heading/ HelpText/
│   │   │   ├── LiveRegion/ Modal/ MultiSelect/ NavigationMenu/ Pagination/
│   │   │   ├── ProgressBar/ RadioGroup/ Select/ Skeleton/ SkipLink/
│   │   │   ├── Switch/ Tabs/ Toast/ Tooltip/ TreeView/
│   │   │   ├── Accordion/ Breadcrumbs/
│   │   │   ├── _hooks/            # shared React hooks
│   │   │   ├── index.ts           # barrel of all components
│   │   │   └── index.test.ts
│   │   ├── .storybook/            # Storybook 10 config
│   │   ├── dist/                  # per-component CJS+ESM+DTS bundles
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   ├── standards/                 # @holmdigital/standards — regulatory DB
│   │   ├── src/
│   │   │   ├── index.ts           # 30+ lookup function exports
│   │   │   ├── types.ts           # ConvergenceRule, NationalLaw, …
│   │   │   └── index.test.ts      # incl. inForce drift guard
│   │   ├── data/
│   │   │   ├── rules.<lang>.json  # 12 locale convergence rule files
│   │   │   ├── ict-manual-checks.json
│   │   │   ├── wcag-to-en301549.json
│   │   │   └── legal/
│   │   │       ├── frameworks.json
│   │   │       ├── national-laws.json
│   │   │       ├── nordic-authorities.json
│   │   │       └── statement-tools.json
│   │   ├── schema/
│   │   │   ├── convergence-schema.json
│   │   │   └── national-laws-schema.json
│   │   ├── scripts/               # validate-schema.js, validate-data.js
│   │   ├── dist/                  # build output
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   └── wordpress-plugin/          # WordPress integration (not workspace-published)
├── .github/workflows/             # CI/CD
├── .changeset/                    # changesets release manifests
├── .planning/                     # GSD planning docs (this file lives here)
├── .skills/                       # AI skill docs (gitignored)
├── docs/
├── public/
├── eslint.config.mjs
├── tsconfig.base.json             # shared TS compiler options
├── package.json                   # workspace root, build/test/release scripts
├── pnpm-workspace.yaml            # legacy (npm workspaces is authoritative)
├── package-lock.json
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── CLAUDE.md                      # project instructions for AI agents
```

## Directory Purposes

**`packages/engine/src/cli/`:**
- Purpose: Command-line entry point and remote-upload client.
- Contains: `index.ts` (the `hd-a11y-scan` binary), `cloud-client.ts` + test.
- Key files: `packages/engine/src/cli/index.ts`, `packages/engine/src/cli/cloud-client.ts`.

**`packages/engine/src/core/`:**
- Purpose: Scan execution layer.
- Contains: `RegulatoryScanner`, `VirtualDOMBuilder`, `HtmlValidator`.
- Key files: `packages/engine/src/core/regulatory-scanner.ts` (477 lines), `packages/engine/src/core/virtual-dom.ts`, `packages/engine/src/core/html-validator.ts`.

**`packages/engine/src/reporting/`:**
- Purpose: All output emitters.
- Contains: HTML, PDF, JUnit, GitHub Actions, badge, statement generators + locale templates.
- Key files: `packages/engine/src/reporting/html-template.ts` (317 lines), `packages/engine/src/reporting/statement-generator.ts` (429 lines), `packages/engine/src/reporting/pdf-generator.ts`, `packages/engine/src/reporting/badge-generator.ts`, `packages/engine/src/reporting/junit-generator.ts`, `packages/engine/src/reporting/github-actions.ts`.

**`packages/engine/src/reporting/templates/`:**
- Purpose: Per-locale strings for report chrome (16 files: en, sv, no, da, fi, de, fr, es, nl, it, pt, pl, en-gb, en-us, en-ca, en-au).

**`packages/engine/src/automation/`:**
- Purpose: Generators for pseudo-automated test scaffolds.
- Key files: `packages/engine/src/automation/pseudo-automation.ts`.

**`packages/engine/src/i18n/` + `src/locales/`:**
- Purpose: Engine-internal translation layer (separate from reporting templates).
- Key files: `packages/engine/src/i18n/index.ts`, `packages/engine/src/locales/<lang>.json`.

**`packages/engine/scripts/`:**
- Purpose: Build helpers run via `npm run build`.
- Key files: `packages/engine/scripts/copy-assets.mjs` (copies `src/assets/` into `dist/`), `packages/engine/scripts/verify-statements.ts`.

**`packages/components/src/<Component>/`:**
- Purpose: One folder per component, each with `<Component>.tsx`, optional `.stories.tsx`, optional `.test.tsx`.
- Key files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (consumed by engine for SSR statement output), `packages/components/src/index.ts` (barrel).

**`packages/components/src/_hooks/`:**
- Purpose: Shared React hooks used by multiple components.

**`packages/standards/src/`:**
- Purpose: Lookup API + types over the JSON regulatory database.
- Key files: `packages/standards/src/index.ts` (508 lines, 30+ exports), `packages/standards/src/types.ts`, `packages/standards/src/index.test.ts` (includes inForce drift guard).

**`packages/standards/data/`:**
- Purpose: Source-of-truth JSON. Edited by hand and validated by scripts.
- Contains: `rules.<lang>.json` (12 locales), `ict-manual-checks.json`, `wcag-to-en301549.json`.
- Key files: `packages/standards/data/legal/national-laws.json` (EAA, WAD, ADA Title II/III, REHAB §504, DOS-lagen, BITV, RGAA, AODA, …), `packages/standards/data/legal/frameworks.json`, `packages/standards/data/legal/nordic-authorities.json`, `packages/standards/data/legal/statement-tools.json`.

**`packages/standards/schema/`:**
- Purpose: ajv-validated JSON Schemas used by `validate-data.js` / `validate-schema.js` in `scripts/`.
- Key files: `packages/standards/schema/convergence-schema.json`, `packages/standards/schema/national-laws-schema.json`.

**`packages/wordpress-plugin/`:**
- Purpose: WordPress integration. Not part of the npm workspaces (`package.json` only lists engine/components/standards).

## Key File Locations

**Entry Points:**
- `packages/engine/src/cli/index.ts`: CLI binary `hd-a11y-scan`.
- `packages/engine/src/index.ts`: Engine programmatic API barrel.
- `packages/components/src/index.ts`: Components barrel.
- `packages/standards/src/index.ts`: Standards lookup API.

**Configuration:**
- `tsconfig.base.json`: shared compiler options (strict, ES2022, bundler resolution).
- `packages/<pkg>/tsconfig.json`: per-package TS overrides.
- `packages/engine/tsup.config.ts`: engine bundling (CJS + ESM + DTS, separate `cli` entry, defines `__ENGINE_VERSION__` banner).
- `packages/engine/vitest.config.ts`: unit test config; `vitest.integration.config.ts` for integration suite.
- `eslint.config.mjs`: flat-config root ESLint.
- `.changeset/`: release manifests consumed by `npm run release`.

**Core Logic:**
- `packages/engine/src/core/regulatory-scanner.ts`: Puppeteer + axe + html-validate + enrichment pipeline.
- `packages/engine/src/reporting/html-template.ts`: standalone HTML report rendering.
- `packages/engine/src/reporting/statement-generator.ts`: regulatory accessibility statement generation (HTML/MD), incl. US ADA-Title-III + REHAB §504 branch.
- `packages/standards/src/index.ts`: WCAG → EN 301 549 → national-law lookups.

**Testing:**
- `packages/engine/src/**/*.test.ts`: unit tests co-located with source.
- `packages/engine/scripts/verify-statements.ts`: integration helper for statement output.
- `packages/standards/src/index.test.ts`: convergence + inForce drift guard.
- `packages/components/src/index.test.ts` and per-component `.test.tsx`.

## Build Outputs

**`packages/engine/dist/`:**
- `index.js` (CJS), `index.mjs` (ESM), `index.d.ts` (types).
- `cli/index.js` — executable bin (`hd-a11y-scan`).
- `assets/` copied from `src/assets/` by `scripts/copy-assets.mjs`.

**`packages/components/dist/`:**
- `index.js`, `index.mjs`, `index.d.ts` — full barrel.
- Per-component subdirectories: `dist/<Component>/<Component>.{js,mjs,d.ts}` matching the subpath exports map in `package.json`.

**`packages/standards/dist/`:**
- `index.js` (CJS), `index.mjs` (ESM), `index.d.ts` + `index.d.mts` (types for both module systems).
- `data/` and `schema/` shipped via `files` field, served through `./data/*` and `./schema/*` exports.

## Naming Conventions

**Files:**
- TypeScript source: `kebab-case.ts` (engine, standards) — e.g. `regulatory-scanner.ts`, `statement-generator.ts`.
- React components: `PascalCase.tsx` matching the folder — e.g. `AccessibilityStatement/AccessibilityStatement.tsx`.
- Tests: co-located, `.test.ts` / `.test.tsx`.
- JSON data: lowercase with locale codes — `rules.en-gb.json`, `national-laws.json`.

**Directories:**
- Packages: lowercase under `packages/`.
- Components: `PascalCase/` per component.
- Internal/shared: `_underscore-prefix/` (e.g. `_hooks`).

## Where to Add New Code

**New scanner rule / enrichment field:**
- Update `packages/standards/data/rules.<lang>.json` for every locale that needs it.
- Update `packages/standards/src/types.ts` if shape changes.
- Update `packages/standards/schema/convergence-schema.json` and re-run `npm run validate-schema -w @holmdigital/standards`.
- Add test in `packages/standards/src/index.test.ts`.

**New national law / country:**
- Add entry to `packages/standards/data/legal/national-laws.json`.
- Update `Country` union in `packages/standards/src/types.ts` if a new country.
- Add enforcement body in `ENFORCEMENT_BODIES` + `ENFORCEMENT_BODIES_DETAILED` in `packages/standards/src/index.ts`.
- Set `inForce` correctly relative to `effectiveDate` (drift-guard test will assert).
- Update statement generator US/EU branches in `packages/engine/src/reporting/statement-generator.ts` if it needs special routing (see ADA / REHAB precedent).

**New report format:**
- Create `packages/engine/src/reporting/<name>-generator.ts` exporting a single `generate*` function consuming `ScanResult`.
- Wire into CLI in `packages/engine/src/cli/index.ts` (add `--<name>` option).
- Add unit test alongside.

**New React component:**
- Create `packages/components/src/<Name>/<Name>.tsx`.
- Re-export from `packages/components/src/index.ts`.
- Add subpath export entry to `packages/components/package.json` `exports` AND to the `tsup` entry list in `scripts.build` and `scripts.dev`.
- Optional: add `<Name>.stories.tsx` and `<Name>.test.tsx`.

**New CLI option:**
- Add `.option(...)` in `packages/engine/src/cli/index.ts`.
- Plumb through `ScannerOptions` (`packages/engine/src/core/regulatory-scanner.ts`) or to the relevant reporter.

**Shared utilities (engine):**
- No `utils/` exists today. If introducing one, place under `packages/engine/src/utils/` and avoid leaking into the published API surface unless intentional.

**Shared hook (components):**
- Add to `packages/components/src/_hooks/` and import locally; do not re-export from the barrel unless meant as public API.

## Special Directories

**`packages/<pkg>/dist/`:**
- Purpose: tsup build output.
- Generated: Yes (`npm run build`).
- Committed: Yes for `standards` (some `.d.ts` / `.mjs` files appear in git status), historically tracked. Treat as build artefact otherwise.

**`packages/<pkg>/node_modules/`:**
- Purpose: per-workspace symlinks managed by npm.
- Generated: Yes. Committed: No.

**`.changeset/`:**
- Purpose: pending release notes.
- Generated: by `changeset` CLI. Committed: Yes.

**`.planning/`:**
- Purpose: GSD planning docs (this file).
- Generated: by GSD commands. Committed: Yes.

**`.skills/`:**
- Purpose: AI agent procedural docs.
- Committed: No (gitignored per CLAUDE.md).

**`packages/engine/src/locales/` vs `packages/engine/src/reporting/templates/`:**
- Two distinct locale stores: `locales/` for engine runtime strings (9 langs), `reporting/templates/` for report chrome (16 langs incl. regional variants). When adding a new language, decide which (often both) needs the file.

---

*Structure analysis: 2026-05-10*
