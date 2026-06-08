# Codebase Structure

**Analysis Date:** 2026-06-01

## Directory Layout

```
a11y-hd-project/
├── packages/
│   ├── standards/           # @holmdigital/standards — regulatory data
│   ├── components/          # @holmdigital/components — React widgets
│   └── engine/              # @holmdigital/engine — scanner + CLI
├── .planning/               # GSD workflow folder (project mgmt)
│   ├── PROJECT.md           # Project charter
│   ├── ROADMAP.md           # Long-range plan
│   ├── REQUIREMENTS.md      # Stable requirements
│   ├── MILESTONES.md
│   ├── RETROSPECTIVE.md
│   ├── STATE.md             # Current state snapshot
│   ├── config.json
│   ├── codebase/            # ← THIS folder (auto-mapped)
│   ├── milestones/
│   ├── phases/              # Phase folders (03-* through 33-*)
│   └── research/
├── .changeset/              # Pure Changesets release flow
│   ├── config.json
│   └── pub-09-*.md          # Pending changesets
├── .github/workflows/       # CI (build + verify + release)
├── docs/
│   ├── architecture/        # ci-cd-strategy.md
│   ├── guides/              # accessibility-statement.md, ci-cd-integration.md, eu-legal-framework.md, nordic-authorities.md, developer-cookbooks.md
│   ├── reference/
│   └── releases/
├── eslint.config.mjs        # Flat config, shared across packages
├── tsconfig.base.json       # Extended by each package
├── package.json             # Root workspaces + build orchestration
├── CLAUDE.md                # AI agent project memory (gitignored copy)
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Per-Package Layout

### `packages/standards/`

```
standards/
├── src/
│   ├── index.ts             # All helpers + re-exports
│   ├── index.test.ts        # inForce drift guard + helper tests
│   └── types.ts             # All public types
├── data/
│   ├── rules.<locale>.json  # 12 locale rule bundles
│   ├── ict-manual-checks.json
│   ├── wcag-to-en301549.json
│   └── legal/
│       ├── frameworks.json
│       ├── national-laws.json     # 17 jurisdictions
│       ├── nordic-authorities.json
│       └── statement-tools.json
├── schema/
│   ├── convergence-schema.json
│   └── national-laws-schema.json
├── scripts/
│   ├── add-legal-context.js
│   └── add-legal-context-all-langs.js
├── dist/                    # Build output (gitignored)
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md             # Changesets-generated
```

### `packages/components/`

```
components/
├── src/
│   ├── index.ts             # Re-exports all 29 components
│   ├── index.test.ts
│   ├── <Name>/
│   │   ├── <Name>.tsx       # Component implementation
│   │   ├── <Name>.test.tsx  # Co-located tests
│   │   ├── <Name>.css       # Optional, per-component BEM
│   │   └── <Name>.regression.test.tsx  # Optional
│   ├── AccessibilityStatement/
│   │   ├── AccessibilityStatement.tsx
│   │   ├── AccessibilityStatement.test.tsx
│   │   ├── AccessibilityStatement.regression.test.tsx
│   │   └── locale-chrome.ts          # Helper, NOT a public subpath
│   ├── DatePicker/
│   │   └── date-utils.ts             # Helper, excluded from entries
│   ├── _hooks/              # useFocusTrap, useScrollLock
│   ├── _i18n/               # live-region-strings.ts (12 locales)
│   └── _test/               # setup.ts, axe.ts, helpers.ts, helpers/
├── scripts/
│   ├── check-no-tailwind-leak.mjs
│   ├── check-no-test-leak.mjs
│   └── check-wcag-headers.mjs
├── dist/
├── package.json             # 30+ subpath exports
├── tsup.config.ts           # Glob entry list (Phase 26 PUB-05)
├── tsconfig.json
├── TESTING-CONVENTIONS.md   # Phase 22 test infrastructure
└── README.md
```

### `packages/engine/`

```
engine/
├── src/
│   ├── index.ts             # Public surface
│   ├── globals.d.ts         # __ENGINE_VERSION__ ambient declaration
│   ├── core/
│   │   ├── regulatory-scanner.ts
│   │   ├── regulatory-scanner.test.ts
│   │   ├── virtual-dom.ts
│   │   └── html-validator.ts
│   ├── automation/
│   │   └── pseudo-automation.ts
│   ├── reporting/
│   │   ├── statement-generator.ts
│   │   ├── statement-generator.test.ts
│   │   ├── pdf-generator.ts
│   │   ├── junit-generator.ts
│   │   ├── junit-generator.test.ts
│   │   ├── badge-generator.ts
│   │   ├── badge-generator.test.ts
│   │   ├── github-actions.ts
│   │   ├── html-template.ts
│   │   └── templates/           # Per-locale statement templates
│   ├── cli/
│   │   ├── index.ts             # bin: hd-a11y-scan
│   │   ├── cloud-client.ts
│   │   └── cloud-client.test.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── index.test.ts
│   │   └── <locale>.json        # 16 locale bundles
│   ├── locales/                 # Additional locale assets
│   └── assets/                  # Static assets copied at build
├── scripts/                     # copy-assets.mjs etc.
├── dist/
├── package.json
├── tsup.config.ts               # Two entries: index + cli
├── vitest.config.ts
├── vitest.integration.config.ts
└── README.md
```

## Directory Purposes

**`packages/<pkg>/src/`** — TypeScript source. Built by tsup to `dist/`.
**`packages/<pkg>/dist/`** — Generated. Committed to npm tarball but gitignored locally.
**`packages/<pkg>/scripts/`** — Build-time / lint-time Node scripts (`.mjs` or `.js`).
**`packages/standards/data/`** — Source-of-truth JSON. Shipped in published tarball (not just `dist/`).
**`packages/standards/schema/`** — JSON Schema files for runtime validation via `ajv`.
**`packages/components/src/_*/`** — Underscore-prefixed = internal. Excluded from tsup entries; no subpath export.
**`.planning/phases/<NN>-<slug>/`** — One folder per GSD phase, e.g. `30-datatable-apg-grid-cell-wise-keyboard/`.
**`.changeset/`** — Pending version bumps; consumed by `changeset publish` on release.
**`docs/`** — Long-form human documentation; never imported by code.

## Key File Locations

**Entry points:**
- Standards root: `packages/standards/src/index.ts`
- Components root: `packages/components/src/index.ts`
- Engine library root: `packages/engine/src/index.ts`
- Engine CLI: `packages/engine/src/cli/index.ts` (`bin: hd-a11y-scan`)

**Configuration:**
- Monorepo TS base: `tsconfig.base.json`
- Lint (flat config, all packages): `eslint.config.mjs`
- Engine build: `packages/engine/tsup.config.ts`
- Components build: `packages/components/tsup.config.ts` (glob entries)
- Standards build: inline in `packages/standards/package.json#scripts.build`
- Vitest configs: per-package `vitest.config.ts`

**Core logic:**
- Regulatory data: `packages/standards/data/legal/national-laws.json`
- Public types: `packages/standards/src/types.ts`
- Scanner: `packages/engine/src/core/regulatory-scanner.ts`
- Statement generator: `packages/engine/src/reporting/statement-generator.ts`

**Testing:**
- Components shared setup: `packages/components/src/_test/setup.ts` (jsdom polyfills + axe matchers)
- Keyboard helper: `packages/components/src/_test/helpers/expectKeyboardSequence.test.ts`
- ID uniqueness helper: `packages/components/src/_test/helpers/expectUniqueIds.test.ts`
- Axe helper: `packages/components/src/_test/axe.ts`

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Co-located tests: `<Name>.test.tsx` / `<Name>.test.ts`
- Regression tests: `<Name>.regression.test.tsx`
- Stories: `<Name>.stories.tsx`
- Non-React modules: `kebab-case.ts` (e.g., `regulatory-scanner.ts`, `live-region-strings.ts`, `cloud-client.ts`)
- Build/lint scripts: `kebab-case.mjs` or `.js`

**Directories:**
- Component folder: `PascalCase/` matching the component name
- Engine subsystems: lowercase single word (`core`, `cli`, `reporting`, `automation`, `i18n`)
- Shared internal helpers in components: `_<area>/` (underscore prefix)
- Planning phase folders: `<NN>-<kebab-slug>/`

**Data files:**
- Locale rules: `rules.<bcp47>.json` (e.g., `rules.en-gb.json`, `rules.sv.json`)
- Legal artifacts: `data/legal/<kebab>.json`

## Where to Add New Code

**New regulatory framework or country:**
- Add entry to `packages/standards/data/legal/national-laws.json`.
- Extend `Country` / `LegalFramework` unions in `packages/standards/src/types.ts` if new.
- Add a changeset under `.changeset/`.
- The inForce drift-guard test in `packages/standards/src/index.test.ts` will validate dates.

**New React component:**
- Create `packages/components/src/<Name>/<Name>.tsx` (picked up automatically by tsup glob).
- Co-locate `<Name>.test.tsx` — use `expectKeyboardSequence` for APG patterns.
- Optional `<Name>.css` is auto-extracted to `dist/<Name>/<Name>.css` (per Phase 23 — no Tailwind).
- Add `./` re-export to `packages/components/src/index.ts`.
- Add subpath export block to `packages/components/package.json#exports`.
- Add WCAG header comment to top of `.tsx` (validated by `check:wcag-headers`).

**New scanner check or reporter:**
- Scanner extension: `packages/engine/src/core/` or `packages/engine/src/automation/`.
- New reporter format: `packages/engine/src/reporting/<name>-generator.ts` + co-located test.

**New CLI flag:**
- `packages/engine/src/cli/index.ts` (Commander). Threaded into `ScannerOptions` in `packages/engine/src/core/regulatory-scanner.ts`.

**Shared component hook:**
- `packages/components/src/_hooks/use<Name>.ts` (e.g., `useFocusTrap.ts`).
- NOT exported from `index.ts` — internal only.

**Engine locale bundle:**
- `packages/engine/src/i18n/<locale>.json` + register in `src/i18n/index.ts`.

**New planning phase:**
- `.planning/phases/<NN>-<slug>/` with `<NN>-PLAN.md`, `<NN>-CONTEXT.md`, `<NN>-EXECUTE.md` per GSD convention.

## Special Directories

**`packages/standards/data/`:**
- Purpose: Pure JSON regulatory data shipped in the published package.
- Generated: No (hand-curated, schema-validated).
- Committed: Yes.
- Published: Yes (declared in `files`).

**`packages/components/src/_test/`:**
- Purpose: Shared test setup, axe wrapper, keyboard/id helpers.
- Excluded from build: Yes (tsup `!src/_test/**`).
- Excluded from publish: Asserted by `check:no-test-leak`.

**`packages/engine/src/locales/` + `assets/`:**
- Purpose: Runtime locale chrome and static assets.
- Copied to `dist/` by `scripts/copy-assets.mjs` post-build.

**`.changeset/`:**
- Purpose: Pending version bumps; pure Changesets workflow.
- Generated: Authored by humans, consumed by `changeset publish --provenance`.
- Committed: Yes (until consumed; CHANGELOGs are then regenerated per package).

**`dist/` (each package):**
- Purpose: Build output (dual ESM/CJS + `.d.ts` / `.d.mts`).
- Generated: Yes (tsup).
- Committed: No (gitignored).
- Published: Yes.

---

*Structure analysis: 2026-06-01*
