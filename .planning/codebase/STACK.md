# Technology Stack

**Analysis Date:** 2026-06-01

## Languages

**Primary:**
- TypeScript `^5.7.2` — strict mode across all 3 packages; `tsconfig.json` per package
- JavaScript (ESM) — build scripts in `packages/*/scripts/*.mjs` (e.g. `packages/engine/scripts/copy-assets.mjs`, `packages/components/scripts/check-no-tailwind-leak.mjs`)

**Secondary:**
- JSON Schema — regulatory data schemas in `packages/standards/schema/`
- Markdown — per-package `README.md`, `CHANGELOG.md`, changeset files under `.changeset/`

## Runtime

**Node.js:**
- Minimum: `>=18.0.0` (root `engines` field)
- CI: Node 20 (`.github/workflows/release.yml`, `deploy-wiki.yml`, `release-wiki.yml`)

**npm:**
- Minimum: `>=9.0.0`
- Workspaces enabled (`workspaces: ["packages/engine", "packages/components", "packages/standards"]`)
- Note: no pnpm — only npm workspaces (any leftover pnpm artifacts have been removed)

## Build Tooling

**Bundler:** `tsup ^8.3.5` — per-package config in `packages/*/tsup.config.ts`
- Outputs: CJS (`dist/*.js`), ESM (`dist/*.mjs`), DTS for both (`dist/*.d.ts` + `dist/*.d.mts`)
- `@holmdigital/standards`: inline CLI form — `tsup src/index.ts --format cjs,esm --dts --clean` (no config file)
- `@holmdigital/engine`: builds main + `cli` entry; post-build `node scripts/copy-assets.mjs`
- `@holmdigital/components`: per-component subpath exports — every component compiled to its own `dist/<Name>/<Name>.{js,mjs,d.ts,d.mts}` for tree-shaking

**Root build order** (`npm run build` at root):
1. `@holmdigital/standards` (no internal deps)
2. `@holmdigital/components` (depends on standards)
3. `@holmdigital/engine` (depends on standards + components)

## Test Stack

**Runner:** `vitest ^4.0.16` — all packages
- Configs: `packages/{engine,components}/vitest.config.ts`; standards uses inline defaults
- Engine also has `vitest.integration.config.ts` for integration suite (`npm run test:integration`)
- CI script: `npm run test:ci` → `vitest run`

**Component testing additions (`@holmdigital/components`):**
- `@testing-library/react ^16.3.2`
- `@testing-library/jest-dom ^6.9.1`
- `@testing-library/user-event ^14.6.1`
- `@chialab/vitest-axe ^0.19.1` — axe-core assertions in vitest
- `jsdom ^28.0.0`
- `axe-core ^4.11.4` (dev)
- Additional CI gates: `check:no-tailwind-leak`, `check:no-test-leak`, `test:wcag-headers` (custom node scripts in `packages/components/scripts/`)

**Storybook:** `storybook ^10.2.13` + `@storybook/react-vite` + `@storybook/addon-a11y` (root devDeps) — used in `@holmdigital/components` (`npm run storybook`, `build-storybook`)

## Lint / Types / Publish Gates

**ESLint:** `eslint ^9.17.0` (flat config era) + `@typescript-eslint/{eslint-plugin,parser} ^8.18.1` + `eslint-plugin-react-hooks ^7.1.1` + `eslint-plugin-testing-library ^7.16.2` (components only)
- Per-package: `npm run lint` → `eslint src` (engine, standards) or `eslint src --ext .ts,.tsx` (components)
- All 3 packages currently lint-clean at zero warnings (per PUB-09 closure, Phase 33)

**TypeScript checking:** `tsc --noEmit` (`npm run typecheck`) — strict mode

**Formatter:** `prettier ^3.4.2`

**Publish gates** (all 3 packages — `prepublishOnly` → `verify`):
1. `build` (tsup)
2. `lint` (eslint)
3. `typecheck` (tsc --noEmit)
4. `check:exports` → `publint --strict ^0.3.20`
5. `check:types` → `attw --pack . --ignore-rules no-resolution` (`@arethetypeswrong/cli ^0.18.2`)
6. `test:ci` (vitest run)

Publishing fails if any gate fails.

## Package Manager

- **npm workspaces** — root `package.json` defines 3 workspaces
- Lockfile: `package-lock.json` (committed)
- Install: `npm ci` in CI, `npm install` locally
- Workspace-targeted commands: `npm run <script> -w @holmdigital/<pkg>`

## Key Runtime Dependencies

### `@holmdigital/standards@2.5.7`
- `ajv ^8.18.0` — JSON Schema validation for regulatory data

### `@holmdigital/components@2.7.1`
- `@holmdigital/standards ^2.5.3` (workspace dep)
- **Peer deps:** `react >=18.0.0`, `react-dom >=18.0.0`, `lucide-react >=0.400.0` (lucide-react is **optional**, marked via `peerDependenciesMeta`)
- `sideEffects: ["**/*.css"]` — CSS subpath exports (`./DatePicker.css`, `./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) are preserved through tree-shaking

### `@holmdigital/engine@2.5.5`
- `@holmdigital/standards ^2.5.3`, `@holmdigital/components ^2.7.0` (workspace deps)
- `axe-core ^4.11.1` — accessibility rule engine
- `html-validate 10.4.0` (pinned) — HTML structural validation
- `puppeteer 23.10.4` (pinned) — headless browser for live scans
- `commander ^12.1.0` — CLI argument parsing
- `cosmiconfig ^9.0.0` — config file loading
- `chalk ^5.3.0` — terminal coloring
- `ora ^8.1.1` — spinners
- `ws ^8.18.0` — WebSocket client (cloud API)
- `react ^18.3.1 || ^19.0.0` + `react-dom` (peer-aligned; renders statement components for PDF output)

## Notable Choices / Non-Choices

- **No Tailwind in `@holmdigital/components`** — BEM styling only (decision locked in Phase 23). Enforced by `scripts/check-no-tailwind-leak.mjs` in `test:ci`.
- **No test code in production bundle** — enforced by `scripts/check-no-test-leak.mjs`.
- **`lucide-react` is optional** — components that use icons fall back gracefully if the peer is missing.
- **Per-component subpath exports** in `@holmdigital/components` (28+ entries) for granular tree-shaking; main barrel `.` is also exported.
- **`types`-first in exports conditions** — every export condition puts `types` before `default` to satisfy `attw` and TS resolution.
- **React 18 + React 19 dual support** — peer/dev ranges accept both major versions.
- **Pinned heavyweight binaries** — `puppeteer 23.10.4` and `html-validate 10.4.0` are pinned (not `^`) to avoid surprise Chromium/rule-set changes.
- **`@types/node ^22.10.2`** added as devDep in all 3 packages (resolves 27 tsc errors in components, per PUB-09).
- **Changesets-based releases** — `@changesets/cli ^2.29.8`; root `release` script: `changeset publish --provenance`.

---

*Stack analysis: 2026-06-01*
