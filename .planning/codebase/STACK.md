# Technology Stack

**Analysis Date:** 2026-05-10

## Languages

**Primary:**
- TypeScript ^5.7.2 — All three packages (`packages/engine`, `packages/components`, `packages/standards`)

**Secondary:**
- JavaScript (ESM) — Build/validation scripts (`packages/engine/scripts/copy-assets.mjs`, `packages/standards/scripts/validate-*.js`)
- JSON — Regulatory data (`packages/standards/data/`) and JSON Schema (`packages/standards/schema/`)
- TSX — React component sources (`packages/components/src/<Component>/<Component>.tsx`)
- YAML — GitHub Actions workflows (`.github/workflows/*.yml`)

## Runtime

**Environment:**
- Node.js >=18.0.0 (declared in root `package.json` `engines`)
- CI runs on Node.js 20 (`.github/workflows/release.yml`, `release-wiki.yml`, `deploy-wiki.yml`)
- Browser runtime: Chromium (bundled via Puppeteer 23.10.4) for headless scanning
- Browser runtime: jsdom ^28.0.0 (test-only, components)

**Package Manager:**
- npm >=9.0.0 with workspaces (declared in root `package.json` `engines`)
- Lockfile: `package-lock.json` present at repo root
- Workspaces: `packages/engine`, `packages/components`, `packages/standards`

## Frameworks

**Core:**
- React ^18.3.1 || ^19.0.0 — UI components (`packages/components`); also a runtime/peer of `packages/engine` for report rendering helpers
- axe-core ^4.11.1 — Accessibility rules engine (`packages/engine`)
- html-validate 10.4.0 (pinned) — Static HTML validation (`packages/engine/src/core/html-validator.ts`)
- Puppeteer 23.10.4 (pinned) — Headless browser scanning (`packages/engine/src/core/regulatory-scanner.ts`)

**Testing:**
- Vitest ^4.0.16 — Unit and integration test runner (all packages)
- @testing-library/react ^16.3.2 — React component testing (`packages/components`)
- jsdom ^28.0.0 — DOM environment for component tests
- @vitest/coverage v8 (provider configured in `packages/engine/vitest.config.ts`)

**Build/Dev:**
- tsup ^8.3.5 — Bundler producing CJS + ESM + DTS (all packages)
- TypeScript Compiler 5.7+ — Type checking + DTS emission via tsup
- Storybook ^10.2.13 + @storybook/react-vite ^10.2.4 + @storybook/addon-a11y ^10.2.4 — Component dev environment (`packages/components`)
- ESLint ^9.17.0 + @typescript-eslint/{parser,eslint-plugin} ^8.18.1 — Linting
- Prettier ^3.4.2 — Formatting (root devDependency)
- rimraf ^5.0.5 — Cross-platform clean
- @changesets/cli ^2.29.8 — Versioning + release automation

## Key Dependencies

### `@holmdigital/engine` v2.5.2 (`packages/engine/package.json`)

**Production:**
- `@holmdigital/components` ^2.3.0 — Internal: rendered into HTML reports
- `@holmdigital/standards` * (workspace) — Internal: regulatory rule database
- `axe-core` ^4.11.1 — Accessibility rules
- `chalk` ^5.3.0 — Terminal colour output (CLI)
- `commander` ^12.1.0 — CLI argument parsing (`src/cli/index.ts`)
- `cosmiconfig` ^9.0.0 — Loads `.hd-a11yrc` / `hd-a11y.config.*` files
- `html-validate` 10.4.0 (pinned) — Static HTML conformance
- `ora` ^8.1.1 — CLI spinners
- `puppeteer` 23.10.4 (pinned) — Headless Chromium driver
- `react` / `react-dom` ^18.3.1 || ^19.0.0 — Report rendering
- `ws` ^8.18.0 — WebSocket (Puppeteer transport)

**Dev:**
- `@types/cosmiconfig`, `@types/node` ^22.10.2, `@types/react`, `@types/react-dom`, `@types/ws`, `tsup`, `typescript`, `vitest`

**Bin:**
- `hd-a11y-scan` → `./dist/cli/index.js`

### `@holmdigital/components` v2.3.0 (`packages/components/package.json`)

**Production:**
- `@holmdigital/standards` ^2.3.0 — Country/framework metadata for `AccessibilityStatement`
- `lucide-react` ^0.556.0 — Icon set

**Peer:**
- `react` >=18.0.0
- `react-dom` >=18.0.0

**Dev:**
- `@testing-library/react` ^16.3.2, `jsdom` ^28.0.0, `react`/`react-dom` ^18.2.0, `storybook` ^10.2.13, `tsup`, `typescript`

**Subpath exports:** Each component is independently importable (e.g. `@holmdigital/components/Button`, `/AccessibilityStatement`, `/DataTable`, etc.; 24 subpath exports total).

### `@holmdigital/standards` v2.5.1 (`packages/standards/package.json`)

**Production:**
- `ajv` ^8.18.0 — JSON Schema validation of regulatory data

**Dev:**
- `@types/node` ^22.10.2, `tsup`, `typescript`, `vitest`

**Data exports:** `./data/*` and `./schema/*` are exposed as raw subpath exports for downstream consumers.

## Configuration

**Environment:**
- No `.env` file required by any package at runtime
- CLI-side: `--api-key` / `HD_A11Y_API_KEY` (referenced in `packages/engine/src/cli/index.ts`) and `cloudUrl` default `https://cloud.holmdigital.se` for optional cloud ingest
- Config files loaded via cosmiconfig (engine): `hd-a11y.config.{js,ts,json}`, `.hd-a11yrc`, `package.json#hd-a11y`
- CI env vars: `GITHUB_TOKEN`, `DISPATCH_TOKEN` (workflow-only, used by `release.yml`)

**Build:**
- `tsconfig.base.json` — Shared TS config (`target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `isolatedModules`)
- Per-package `tsconfig.json` extending the base
- `packages/engine/tsup.config.ts` — Two entries (`src/index.ts`, `src/cli/index.ts`), CJS+ESM, DTS, `shims: true`, injects `__ENGINE_VERSION__` define
- `packages/components` — Inline tsup CLI in `package.json` build script enumerates each component as a separate entry; externalises `react` and `@holmdigital/standards`
- `packages/standards` — Inline tsup CLI: `src/index.ts` only, CJS+ESM+DTS

**Test:**
- `packages/engine/vitest.config.ts` — `environment: node`, includes `src/**/*.{test,spec}.ts`, v8 coverage excluding `src/cli/**` and test files
- `packages/engine/vitest.integration.config.ts` — Integration suite (referenced by `test:integration` script)
- Components/standards: default Vitest discovery

**Versioning / Release:**
- `.changeset/config.json` — `baseBranch: master`, `access: public`, `updateInternalDependencies: patch`, default changelog generator

## Platform Requirements

**Development:**
- Node.js >=18 (CI uses 20)
- npm >=9
- OS: cross-platform; Puppeteer downloads a Chromium build matching host OS
- Disk: Puppeteer's bundled Chromium adds significant `node_modules` weight under `packages/engine/node_modules/puppeteer`

**Production / Consumers:**
- `@holmdigital/engine` ships as an npm package with both CJS and ESM; CLI runs under any Node >=18
- `@holmdigital/components` consumed by React 18+ apps (browser); ships as CJS + ESM with per-component subpath ESM bundles
- `@holmdigital/standards` is runtime-agnostic (pure TS/JSON); CJS + ESM + DTS

**Deployment Targets:**
- npm registry (`https://registry.npmjs.org/`) via `changesets` + npm OIDC Trusted Publishing in `release.yml`
- Downstream consumers: `holmdigital/holmdigital-website`, `holmdigital/accessibility-wiki` (triggered via `repository_dispatch` from `release.yml`)
- GitHub Pages (wiki) deploy in `deploy-wiki.yml`

---

*Stack analysis: 2026-05-10*
