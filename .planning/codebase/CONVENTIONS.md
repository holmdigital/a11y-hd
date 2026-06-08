# Coding Conventions

**Analysis Date:** 2026-06-01

## TypeScript

**Strict mode** — `tsconfig.base.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `isolatedModules`, `forceConsistentCasingInFileNames`.

- `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`.
- Each package extends the base via its own `tsconfig.json`.
- Use `interface` for public APIs/component props; `type` for unions, intersections, discriminated unions (e.g. `ComplianceDeadlineEntry`).
- Export types alongside implementations from `src/index.ts`.

## No `as any` Policy (Phase 33 PUB-09)

ESLint rule `@typescript-eslint/no-explicit-any` is set to `warn` in `eslint.config.mjs:36`, and the verify chain treats warnings as a publish-blocker. All 3 packages are currently at **zero ESLint warnings** and must stay there.

**Approved escape hatches** (codified in `CONTRIBUTING.md:90`):

| Situation | Use | Example |
|-----------|-----|---------|
| Writing to globals in test setup | `Reflect.set(globalThis, …)` | `packages/components/src/_test/setup.ts:44` polyfills `IntersectionObserver` |
| Widening a partial fixture in a test | `as unknown as T` | Preferred over `as any` when stubbing |
| Intentionally-invalid input to a negative-path test | `// @ts-expect-error` with reason | Comment must explain why the input is invalid |

Anything else — `as any`, unused `catch (e)`, `(x as any).y` — must be fixed at source rather than suppressed.

## ESLint

Flat config at `eslint.config.mjs`:
- Base: `@eslint/js` recommended + `@typescript-eslint/eslint-plugin` recommended.
- `react-hooks/exhaustive-deps: warn` (the full `react-hooks` recommended set is deferred to a dedicated audit — see comment block in `eslint.config.mjs:30-34`).
- `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`.
- Ignores: `**/dist/**`, `**/node_modules/**`, `**/coverage/**`.

Each package exposes `npm run lint` (e.g. `eslint src --ext .ts,.tsx` in components).

## React Component Patterns

**`React.forwardRef` is mandatory** for all functional components in `@holmdigital/components` (`CONTRIBUTING.md:82`). Consumers depend on being able to ref the underlying DOM element.

**Stable IDs via `useId()`** — never `Math.random()`. Example: `packages/components/src/Tabs/Tabs.tsx:60` (`const baseId = useId();`) feeds aria-controls/aria-labelledby pairs and stays SSR-safe.

**Strict, required a11y props** — if a visible label is missing, `aria-label` is `string` (required), not `string | undefined` (`CONTRIBUTING.md:81`).

**Semantic HTML first** — `<nav>`, `<main>`, `<article>` rather than `<div>` soup.

**Heading TS2590 workaround** — for dynamic heading levels, use `React.createElement` with a narrow tag union (see `CLAUDE.md` Known Issues).

## Component Styling

**BEM class names** — `hd-<component>__<element>--<modifier>`. Example: `packages/components/src/Tabs/Tabs.css` uses `hd-tabs__tab--active`.

**CSS custom properties for theming** — every component documents its `--hd-<component>-*` knobs in a JSDoc block at the top of the component file (see `packages/components/src/Tabs/Tabs.tsx:7-16` for the canonical example). Consumers override at `:root` or component scope; the component never reads JS-side theme objects.

**Attribute-driven state, not class-driven** — `[aria-selected="true"]`, `[data-orientation="vertical"]` are the styling selectors, not `.is-active` (`Tabs.tsx:17-19`).

**Co-located CSS** — `Component.css` sits beside `Component.tsx` and is imported as a side effect. The package's `sideEffects: ["**/*.css"]` declaration preserves it through bundler tree-shaking.

**No Tailwind in dist** — `check:no-tailwind-leak` (`packages/components/scripts/check-no-tailwind-leak.mjs`) scans dist for Tailwind utility leaks in migrated components (Tabs, Accordion, Breadcrumbs). Extend the deny-list when migrating further components.

## Package Layout & Exports

Every package: `src/`, `dist/`, `package.json`, `README.md`, single entry `src/index.ts`. Build output: CJS + ESM + DTS via `tsup`.

**Exports configuration** — `types` always first within each condition (CLAUDE.md), then dual `import`/`require` blocks. `@holmdigital/components` ships per-component subpath exports (`./Button`, `./Tabs`, `./Tabs.css`, etc.) — see `packages/components/package.json:22-326`.

`publint --strict` (`check:exports`) and `@arethetypeswrong/cli` (`check:types`) both gate publish.

## Commits

**Conventional commits** — `feat(scope): …`, `fix(scope): …`, `chore(scope): …`, `docs: …`. Scopes are package names (`engine`, `standards`, `components`), phase IDs (`33-04`), or area (`ci`, `standards`). Recent examples in `git log`:

```
fix(standards): IT/US/IE/REHAB compliance data updates
chore(33-04): eliminate remaining ESLint warnings — zero-warning closure (PUB-09)
fix(ci): remove stray pnpm-workspace.yaml that broke npm publish on CI
```

PRs include the changeset file when user-facing (`CONTRIBUTING.md:98-106`).

## Versioning & Release Flow

**Pure changesets — never edit `package.json#version` or `CHANGELOG.md` by hand.** The project moved off the previous hybrid manual+changesets flow after repeated double-bump incidents. Workflow:

1. Author runs `npx changeset`, picks packages + bump level, writes a summary → commits the resulting `.changeset/<name>.md`.
2. `.github/workflows/release.yml` on push-to-master runs `changesets/action@v1` which opens (or updates) a "Version Packages" PR with the computed `package.json` + `CHANGELOG.md` deltas.
3. Merging that PR triggers the same workflow; with no changesets remaining, it publishes each package via `npm publish --provenance --access public` (Sigstore-signed via GitHub Actions Trusted Publishing — OIDC, no `NPM_TOKEN`).
4. Already-published versions are skipped by the `publish_if_needed` helper (`release.yml:83-96`).
5. Engine-version dispatch fans out to `holmdigital-website` and `accessibility-wiki` repos (`release.yml:105-124`).

**Internal dependency propagation** — `.changeset/config.json` sets `updateInternalDependencies: "patch"`. When `@holmdigital/standards` bumps, `@holmdigital/engine` and `@holmdigital/components` receive an automatic "Updated dependencies" patch bump.

## Verify Chain (Phase 33 PUB-09)

Every package wires `prepublishOnly` → `verify`:

```
build && lint && typecheck && check:exports && check:types && test:ci
```

`npm publish` fails if lint or typecheck reports errors. Run `npm run verify -w @holmdigital/<pkg>` locally before merging anything publish-relevant. `packages/components/package.json:347` is the canonical example. Each package's `verify` script is identical in structure.

## Build Guards (CI fails on regression)

| Guard | Script | Scope | Purpose |
|-------|--------|-------|---------|
| WCAG-SC header | `packages/components/scripts/check-wcag-headers.mjs` | components `*.test.tsx` | Every test file must declare which WCAG SCs it covers |
| No-tailwind-leak | `packages/components/scripts/check-no-tailwind-leak.mjs` | components `dist/{Tabs,Accordion,Breadcrumbs}` | No Tailwind utility classes in migrated components |
| No-test-leak | `packages/components/scripts/check-no-test-leak.mjs` | components `dist/**` | No vitest / `@testing-library` imports leak into published bundles |
| Schema | `packages/standards/scripts/validate-data.js` | standards | `national-laws.json` validates against `schema/national-laws-schema.json` (Draft-07, via ajv) |

## Imports & Modules

- ES module style (`import … from`).
- Group order in practice: React/Node built-ins → third-party → workspace (`@holmdigital/*`) → relative → CSS side-effect imports last.
- Side-effect CSS imports are explicit: `import './Tabs.css';`.

## Naming

- **Files:** `PascalCase.tsx` for components, `kebab-case.ts` for engine modules, `*.test.tsx` for component tests, `*.test.ts` for engine/standards tests.
- **Directories:** `PascalCase` per component (`src/Button/`), leading underscore for internal-only groups (`src/_test/`, `src/_hooks/`).
- **Types:** `PascalCase`. Discriminated unions documented in `CLAUDE.md` (e.g. `ComplianceDeadlineEntry`).
- **CSS variables:** `--hd-<component>-<token>` (e.g. `--hd-tabs-active-bg`).

## Internationalisation

Swedish characters `å`, `ä`, `ö` are **preserved as UTF-8 literals** in source, tests, changelogs, and docs. Never strip or ASCII-fold them.

## Country / Framework Lookup Discipline

When querying `@holmdigital/standards`, scope-aware filtering is mandatory for ambiguous frameworks:

- `getNationalLawByFramework('ADA', 'US')` returns Title II (public). For Title III (private), use `getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private')`.
- US private-sector statements reference **both** ADA Title III and HHS Section 504 (REHAB).
- `ComplianceDeadlineEntry` is a discriminated union — narrow on the discriminant before reading `employeeThreshold` vs `populationThreshold`.

Full context in `CLAUDE.md` "Known Issues & Solutions".

---

*Convention analysis: 2026-06-01*
