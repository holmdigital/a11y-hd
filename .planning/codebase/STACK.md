# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- TypeScript 5.7.2 - All source code across all three workspace packages
- JSON - Regulatory rules database (13 locale files), legal frameworks, JSON schemas

**Secondary:**
- JavaScript (ESM) - Build scripts (`packages/engine/scripts/copy-assets.mjs`), data transformation scripts (`packages/standards/scripts/add-legal-context.js`)
- TSX - React components in `packages/components/src/`

## Runtime

**Environment:**
- Node.js >= 18.0.0 (enforced via `engines` in root `package.json`)
- Node.js 20 used in CI (GitHub Actions)
- Browser runtime via Puppeteer (Chromium) for scanning

**Package Manager:**
- npm >= 9.0.0 (enforced via `engines`)
- Lockfile: `package-lock.json` present (384KB)
- pnpm workspace config exists (`pnpm-workspace.yaml`, `pnpm-lock.yaml`) but npm workspaces are the primary mechanism

## Monorepo Structure

**Workspace Manager:** npm workspaces (configured in root `package.json`)

**Packages:**
| Package | Name | Version | Public |
|---------|------|---------|--------|
| `packages/standards` | `@holmdigital/standards` | 2.1.0 | Yes |
| `packages/components` | `@holmdigital/components` | 2.1.0 | Yes |
| `packages/engine` | `@holmdigital/engine` | 2.1.2 | Yes |

**Dependency Order (build must follow this):**
1. `@holmdigital/standards` (no internal deps)
2. `@holmdigital/components` (depends on `@holmdigital/standards`)
3. `@holmdigital/engine` (depends on both `@holmdigital/standards` and `@holmdigital/components`)

## Frameworks

**Core:**
- React 18.3.1 - Used in `packages/components` (peer dep >= 18.0.0) and `packages/engine` for server-side rendering of accessibility statements
- React DOM 18.3.1 - Server-side rendering via `renderToStaticMarkup` in `packages/engine/src/reporting/statement-generator.ts`

**Accessibility Testing:**
- axe-core 4.10.2 - Core accessibility rule engine, injected into Puppeteer pages (`packages/engine/src/core/regulatory-scanner.ts`)
- html-validate 10.4.0 - Structural HTML validation (`packages/engine/src/core/html-validator.ts`)

**Browser Automation:**
- Puppeteer 23.10.4 - Headless Chromium for page scanning and PDF generation (`packages/engine/src/core/regulatory-scanner.ts`, `packages/engine/src/reporting/pdf-generator.ts`)

**Testing:**
- Vitest 4.0.16 - Unit and integration tests across all packages
- @testing-library/react 16.3.2 - Component testing in `packages/components`
- jsdom 28.0.0 - DOM environment for component tests

**Build/Dev:**
- tsup 8.3.5 - TypeScript bundler for all three packages, outputs CJS + ESM + DTS
- TypeScript 5.7.2 - Strict mode enabled globally via `tsconfig.base.json`

**Documentation/Design:**
- Storybook 10.2.4 - Component documentation with a11y addon (`packages/components/.storybook/`)
- @storybook/react-vite 10.2.4 - Storybook framework (Vite-based)
- @storybook/addon-a11y 10.2.4 - Accessibility testing within Storybook

**CLI:**
- Commander 12.1.0 - CLI argument parsing for `hd-a11y-scan` command (`packages/engine/src/cli/index.ts`)
- chalk 5.3.0 - Terminal colors
- ora 8.1.1 - Terminal spinners

**Versioning/Release:**
- @changesets/cli 2.29.8 - Monorepo versioning and changelog management

## Key Dependencies

**Critical (packages/engine):**
- `axe-core` 4.10.2 - The actual accessibility rule engine that finds violations. Injected into browser pages via `page.evaluate(axeCore.source)`
- `puppeteer` 23.10.4 - Headless browser for navigating to URLs, building virtual DOM, running axe-core, and generating PDFs
- `html-validate` 10.4.0 - Structural HTML validation separate from axe-core
- `commander` 12.1.0 - Powers the `hd-a11y-scan` CLI binary
- `cosmiconfig` 9.0.0 - Config file discovery (`.a11yrc`, `package.json` a11y key, etc.)
- `ws` 8.18.0 - WebSocket client (likely for Puppeteer communication)

**Critical (packages/standards):**
- `ajv` 8.17.1 - JSON Schema validation for the convergence schema (`packages/standards/schema/convergence-schema.json`)

**Critical (packages/components):**
- `lucide-react` 0.556.0 - Icon library for accessible components
- `react` >= 18.0.0 (peer dependency)

**Infrastructure:**
- `rimraf` 5.0.5 - Cross-platform clean scripts

**Linting/Formatting:**
- `eslint` 9.17.0 - Flat config format (`eslint.config.mjs`)
- `@typescript-eslint/eslint-plugin` 8.18.1 + `@typescript-eslint/parser` 8.18.1
- `prettier` 3.4.2 - Code formatting (no config file detected, using defaults)

## Configuration

**TypeScript:**
- Base config: `tsconfig.base.json` - Target ES2022, strict mode, bundler module resolution
- Per-package overrides: `packages/*/tsconfig.json` (each extends base)
- Components package adds `"jsx": "react-jsx"`
- Standards package adds `"resolveJsonModule": true`

**ESLint:**
- Flat config: `eslint.config.mjs`
- Key rules: `@typescript-eslint/no-explicit-any: "warn"`, `@typescript-eslint/no-unused-vars: ["warn", { argsIgnorePattern: "^_" }]`
- Ignores: `dist/`, `node_modules/`, `coverage/`

**Build (tsup):**
- All packages use tsup for building
- Output formats: CJS (`.js`) + ESM (`.mjs`) + DTS (`.d.ts`)
- Engine has a post-build script: `scripts/copy-assets.mjs` (copies templates + assets to dist)

**Cosmiconfig (Runtime):**
- The CLI searches for config via cosmiconfig with module name `'a11y'`
- Supports: `.a11yrc`, `.a11yrc.json`, `.a11yrc.yaml`, `a11y.config.js`, `package.json` `a11y` key

**Environment:**
- `.env` file listed in `.gitignore` - existence not confirmed
- No `.env.example` detected
- API key for cloud integration passed via `--api-key` CLI flag

**Changesets:**
- Config: `.changeset/config.json`
- Base branch: `master`
- Access: `public`
- Publish with provenance

## Platform Requirements

**Development:**
- Node.js >= 18.0.0, npm >= 9.0.0
- Chromium (auto-downloaded by Puppeteer)
- Git

**Production/Runtime:**
- Published to npm registry as three public packages
- CLI binary: `hd-a11y-scan` (installed via `@holmdigital/engine`)
- Requires Chromium at runtime for scanning (Puppeteer downloads it)

**CI:**
- GitHub Actions on `ubuntu-latest`
- Node.js 20
- NPM publishing with OIDC Trusted Publishing (no npm token needed)

---

*Stack analysis: 2026-02-26*
