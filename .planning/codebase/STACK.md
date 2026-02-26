# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- TypeScript 5.7.2 - All source code across all three packages
- TSX (TypeScript JSX) - React components in `packages/components/src/`

**Secondary:**
- JSON - Regulatory rule databases (`packages/standards/data/`), i18n locale files (`packages/engine/src/locales/`), statement templates (`packages/engine/src/reporting/templates/`)
- JavaScript (ESM) - Build scripts (`packages/engine/scripts/copy-assets.mjs`, `packages/standards/scripts/add-legal-context.js`)

## Runtime

**Environment:**
- Node.js >= 18.0.0 (declared in root `package.json` engines field)
- CI uses Node.js 20 (GitHub Actions workflows)

**Package Manager:**
- npm >= 9.0.0 (primary, declared in engines)
- pnpm workspace config present (`pnpm-workspace.yaml`, `pnpm-lock.yaml`) but CI uses npm
- Lockfiles: both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm) present

## Monorepo Structure

**Workspace Manager:** npm workspaces + pnpm workspaces (dual config)

**Packages:**
| Package | Name | Version | Published |
|---------|------|---------|-----------|
| `packages/standards` | `@holmdigital/standards` | 2.1.0 | npm (public) |
| `packages/components` | `@holmdigital/components` | 2.1.0 | npm (public) |
| `packages/engine` | `@holmdigital/engine` | 2.1.2 | npm (public) |

**Dependency Order (build chain):**
1. `@holmdigital/standards` (no internal deps)
2. `@holmdigital/components` (depends on `@holmdigital/standards`)
3. `@holmdigital/engine` (depends on both `@holmdigital/standards` and `@holmdigital/components`)

## Frameworks

**Core:**
- React 18.x - UI components in `packages/components/`, server-side rendering in `packages/engine/src/reporting/statement-generator.ts`
- React DOM 18.x - `renderToStaticMarkup` for HTML statement generation

**Testing:**
- Vitest 4.0.16 - Unit test runner across all packages
- `@testing-library/react` 16.3.2 - Component testing in `packages/components/`
- jsdom 28.0.0 - Browser environment for component tests

**Build/Dev:**
- tsup 8.3.5 - Bundle builder for all packages (outputs CJS + ESM + `.d.ts`)
- TypeScript 5.7.2 - Type checking with strict mode enabled
- ESLint 9.17.0 - Linting with flat config (`eslint.config.mjs`)
- Prettier 3.4.2 - Code formatting (no config file found; uses defaults)
- Storybook 10.2.4 - Component development/documentation for `packages/components/`

**Release:**
- Changesets 2.29.8 - Versioning and changelog management

## Key Dependencies

**Critical (engine scanning pipeline):**
- `axe-core` 4.10.2 - Core accessibility rule engine; injected into Puppeteer pages for WCAG violation detection
- `puppeteer` 23.10.4 - Headless Chromium browser automation for page scanning and PDF generation
- `html-validate` 10.4.0 - Structural HTML validation for accessibility-impacting markup issues
- `ajv` 8.17.1 - JSON Schema validation for the convergence rule database

**CLI:**
- `commander` 12.1.0 - CLI argument parsing (`packages/engine/src/cli/index.ts`)
- `chalk` 5.3.0 - Terminal colored output
- `ora` 8.1.1 - Terminal spinner/progress indicators
- `cosmiconfig` 9.0.0 - Configuration file loading (`.a11yrc`, `package.json`, etc.)

**UI/Components:**
- `lucide-react` 0.556.0 - Icon library for accessible React components
- `@storybook/addon-a11y` 10.2.4 - Accessibility testing addon for Storybook
- `@storybook/react-vite` 10.2.4 - Storybook framework integration

**Infrastructure:**
- `ws` 8.18.0 - WebSocket client (listed as engine dependency)
- `rimraf` 5.0.5 - Cross-platform directory cleanup

## TypeScript Configuration

**Base Config:** `tsconfig.base.json` (root)
- Target: ES2022
- Module: ESNext with bundler resolution
- Strict mode: enabled (all strict flags on)
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`: all enabled
- Declaration + declaration maps + source maps: enabled

**Package-specific overrides:**
- `packages/components/tsconfig.json`: adds `"jsx": "react-jsx"`
- `packages/standards/tsconfig.json`: adds `"resolveJsonModule": true, "esModuleInterop": true`
- `packages/engine/tsconfig.json`: minimal, just sets rootDir/outDir

## Build Configuration

**tsup (all packages):**
- Output formats: CJS (`.js`) + ESM (`.mjs`)
- Type declarations: `.d.ts` generated via `--dts`
- Clean builds: `--clean` flag
- Engine entry points: `src/index.ts` and `src/cli/index.ts`
- Components externals: `react`, `@holmdigital/standards`

**ESLint:** `eslint.config.mjs` (flat config, ESLint 9)
- Parser: `@typescript-eslint/parser`
- Key rules: `no-explicit-any: warn`, `no-unused-vars: warn (ignore _prefix)`
- Ignores: `dist/`, `node_modules/`, `coverage/`

## Platform Requirements

**Development:**
- Node.js >= 18.0.0
- npm >= 9.0.0 (or pnpm)
- No `.env` files required for development
- Chromium downloaded automatically by Puppeteer

**Production/CI:**
- Node.js 20 (GitHub Actions)
- npm with `npm ci` for deterministic installs
- OIDC token for npm publishing (trusted publishing, no NPM_TOKEN secret)
- `GITHUB_TOKEN` for changesets PR creation

**CLI Runtime:**
- Requires Chromium (Puppeteer auto-downloads)
- Optionally requires `--api-key` for cloud upload
- Configuration via `.a11yrc`, `package.json` `"a11y"` field, or CLI flags

---

*Stack analysis: 2026-02-26*
