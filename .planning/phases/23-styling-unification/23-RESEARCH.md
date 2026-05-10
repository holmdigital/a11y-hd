# Phase 23: Styling Unification - Research

**Researched:** 2026-05-10
**Domain:** tsup CSS pipeline, React component library distribution, CSS custom-property theming, regression-guard scripting
**Confidence:** HIGH on core mechanics; MEDIUM on consumer-bundler edge cases; LOW on tsup's experimental CSS dts interactions
**Phase requirements:** STY-01, STY-02, STY-03, STY-04, STY-05, STY-06

## Summary

Phase 23 migrates 3 components (Tabs, Accordion, Breadcrumbs) from Tailwind utility `className` strings to inline-style + co-located `.css` files imported as side-effects, with theming via CSS custom properties and a build-time grep guard against Tailwind regression in `dist/`.

The mechanics are well-understood: tsup (powered by esbuild) emits a `.css` file next to the entry's `.js` automatically when the entry imports CSS — `injectStyle: false` (default) is exactly what's wanted. The non-obvious risks are: (1) tsup's CSS support is officially "experimental" and has historical bugs with `dts: true`; (2) consumer bundlers will silently drop CSS side-effect imports unless `"sideEffects": ["**/*.css"]` is declared in the published `package.json`; (3) the regex proposed in CONTEXT D-05 has substantial false-positive surface (`font-family`, `grid-template`, `gap-` matches generic identifiers) AND the current `dist/` already contains many Tailwind hits in NON-phase-23 components (NavigationMenu, RadioGroup, Toast, Dialog, Modal, Select all use Tailwind classes in their JSX) — running the guard tree-wide would make it red before AND after this phase, defeating its purpose. The guard MUST be scoped to the 3 migrated components' dist paths, or written as a delta-counting guard against a frozen baseline. **This is the single most important planner-visible decision the CONTEXT did not lock.**

**Primary recommendation:** Use tsup with explicit `injectStyle: false` and `loader: { '.css': 'css' }` (the default CSS loader, made explicit for stability against tsup's experimental flag drift). Add `"sideEffects": ["**/*.css"]` to `packages/components/package.json`. Scope the STY-05 guard regex to only `dist/Tabs/**`, `dist/Accordion/**`, `dist/Breadcrumbs/**`, plus the shared `dist/index.{js,mjs}` entry — and bound the regex to `className`-adjacent context to suppress false positives. Use `[data-state]` attribute for Accordion open/closed visibility (cleanest cross-prop pattern). Use file-content `.includes(':focus-visible')` for the smoke test (option a) — jsdom can't reliably observe `:focus-visible` matching.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STY-01 | Tabs/Accordion/Breadcrumbs migrated to inline-style + co-located CSS | Section 4 (fallback strategy), Section 7 (Accordion `display`) |
| STY-02 | Tsup CSS pipeline emits separate `.css` per component | Section 1 (tsup config), Section 2 (exports map) |
| STY-03 | CSS custom-property theming with inline fallbacks | Section 4 (fallback strategy resolution) |
| STY-04 | `:focus-visible` in `.css`, smoke test asserts presence | Section 5 (test approach — option a confirmed) |
| STY-05 | Regression guard greps dist for Tailwind utilities | Section 6 (regex correction + scope correction — critical) |
| STY-06 | `className` passthrough only; no visual classes | Mechanical; covered by Sections 1+4 |

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Migrate tsup CLI to `tsup.config.ts`. CSS pipeline emits separate `.css` files (NO `--inject-style`). Verify `dist/Tabs.css`, `dist/Accordion.css`, `dist/Breadcrumbs.css` (or per-folder equivalents) are emitted after build.
- **D-02:** Theming surface = brand/state only. Naming `--hd-{component}-{role}`. Layout/spacing hardcoded in `.css`. Each custom property MUST have a default embedded via `var(--hd-tabs-active-color, #1d4ed8)` so default render works without consumer overrides.
- **D-03:** 4 plans — 23-01 (infra, Wave 1) → 23-02 Tabs / 23-03 Accordion / 23-04 Breadcrumbs (Wave 2, parallel).
- **D-04:** `:hover`, `:focus-visible`, `:active`, transitions live in `.css`. JS-driven conditional state (`isOpen`, `rotate-180`) becomes inline `style={{ transform: ..., display: ... }}`.
- **D-05:** STY-05 guard as Node script `packages/components/scripts/check-no-tailwind-leak.mjs`, chained into `test:ci` mirroring `check-wcag-headers.mjs`. Skip cleanly if `dist/` absent.

### Claude's Discretion
- Exact custom-property list per component (planner reads current Tailwind values and decides which become tokens)
- Smoke-test shape per component
- Custom-property JSDoc API documentation placement (planner instructed to put at top of component file)

### Deferred Ideas (OUT OF SCOPE)
- STY-07 migrate remaining 26 components — v0.7
- Spacing-scale design tokens — v0.7+ if widget set demands it
- `--inject-style` (CSS-in-JS) option — rejected
- Storybook visual regression — blocked on upstream esbuild patch
- Real-browser axe-core (PUB-07) — v0.7+

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSS emission (`.css` files in `dist/`) | Build tool (tsup/esbuild) | — | Bundling responsibility; per-entry CSS extraction is esbuild's job |
| CSS theming surface (custom properties) | Component runtime (`.css` rule + inline-style fallback) | Consumer (`:root` overrides) | Cascade naturally — consumer overrides via `:root { --hd-... }` |
| Conditional UI state (`isOpen`, focus) | React component (inline `style` for state-driven properties) | CSS (for `:hover`, `:focus-visible`) | State that changes per render → inline; state that changes per interaction → CSS |
| Side-effect CSS application | Consumer bundler (Vite/webpack/Next/Rollup) | — | The consumer's bundler must follow `import './X.css'` — depends on the library's `package.json` `sideEffects` field |
| Tailwind regression detection | Build/CI script | — | Post-build static analysis; not a runtime test |

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Installed Version | Latest | Purpose | Why Standard |
|---------|------------------|--------|---------|--------------|
| `tsup` | ^8.3.5 (lockfile may resolve to 8.5.1) | 8.5.1 (2025-11-12) `[VERIFIED: npm view tsup version]` | Bundle TS/TSX + emit CSS | Already in devDependencies; multi-format CJS/ESM/DTS support |
| `vitest` | (via root) | — | Test runner | Already in use; tests are JS unit-level |
| `react` | ^18.2.0 || ^19.0.0 peer | — | Component runtime | Already a peer dep |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs` + `node:path` (built-ins) | — | STY-05 guard file traversal | Mirror `check-wcag-headers.mjs` pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsup CSS pipeline | tsdown (Rolldown-based successor, mentioned in tsup README as upstream rec) | tsup README itself recommends tsdown; HOWEVER changing build tool is OUT OF SCOPE for Phase 23 — note this for Phase 26 (`verify` pipeline). `[ASSUMED]` based on tsup README excerpt; tsdown maturity in late-2025 not verified for production use here. |
| CSS Modules | None recommended | Adds class-name hashing complexity, conflicts with custom-property theming surface; CONTEXT locks plain CSS |
| `style-loader` / `vanilla-extract` | — | CSS-in-JS — rejected per D-01 |

**Installation:** No new packages needed.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────┐
                    │  src/Tabs/Tabs.tsx              │
                    │   - inline style={{ ... }}      │
                    │   - import './Tabs.css'  ◄──────┼─ side-effect import
                    │   - className passthrough only  │
                    └────────────┬────────────────────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  tsup build   │  ──── tsup.config.ts: entry list
                         │  (esbuild)    │       format: ['cjs','esm']
                         │               │       dts: true
                         │  injectStyle: │       loader: {'.css':'css'} (default)
                         │  false        │       external: ['react','@holmdigital/standards']
                         └───────┬───────┘
                                 │ emits
                ┌────────────────┼─────────────────────────┐
                ▼                ▼                         ▼
        dist/Tabs/Tabs.js   dist/Tabs/Tabs.mjs    dist/Tabs/Tabs.css
        dist/Tabs/Tabs.d.ts                       (CSS variables + :hover + :focus-visible)
                │
                ▼
        Consumer's bundler (Vite/Next/webpack)
                │
                │  follows `import './Tabs.css'`  ──── REQUIRES library's
                │                                        package.json
                │                                        "sideEffects": ["**/*.css"]
                ▼
        Consumer app bundle includes Tabs.css
                │
                ▼  optional consumer override
        Consumer's :root { --hd-tabs-active-color: #ff6600 }


                    ┌─────────────────────────────────┐
                    │  scripts/check-no-tailwind-     │
                    │  leak.mjs                       │
                    │   - walks dist/Tabs/**          │
                    │           dist/Accordion/**     │
                    │           dist/Breadcrumbs/**   │  ◄── scoped, NOT tree-wide
                    │   - regex against className     │       (see Section 6)
                    │     context only                │
                    │   - exits non-zero on match     │
                    └─────────────────────────────────┘
                                 │
                                 │ chained into
                                 ▼
                         npm run test:ci
                         = vitest run
                         + check-wcag-headers
                         + check-no-tailwind-leak  ◄── new
```

### Recommended Project Structure
```
packages/components/
├── tsup.config.ts                       # NEW — Plan 23-01
├── scripts/
│   ├── check-wcag-headers.mjs           # existing
│   └── check-no-tailwind-leak.mjs       # NEW — Plan 23-01
├── src/
│   ├── Tabs/
│   │   ├── Tabs.tsx                     # MODIFIED — Plan 23-02
│   │   ├── Tabs.css                     # NEW — Plan 23-02
│   │   └── Tabs.test.tsx                # MODIFIED — add :focus-visible smoke test
│   ├── Accordion/
│   │   ├── Accordion.tsx                # MODIFIED — Plan 23-03
│   │   ├── Accordion.css                # NEW — Plan 23-03
│   │   └── Accordion.test.tsx           # NEW — minimal smoke test
│   └── Breadcrumbs/
│       ├── Breadcrumbs.tsx              # MODIFIED — Plan 23-04
│       ├── Breadcrumbs.css              # NEW — Plan 23-04
│       └── Breadcrumbs.test.tsx         # NEW — minimal smoke test
```

### Pattern 1: Component-co-located CSS with custom-property theming

**What:** Each visual/structural rule lives in `Component.css`. Component imports it as a side-effect. JS-driven state uses inline `style`. Theming surface is `--hd-{component}-{role}` custom properties with fallbacks.

**When to use:** Components with `:hover`, `:focus-visible`, transitions, or pseudo-element styling that can't be expressed inline.

**Example (Tabs):**

```tsx
// src/Tabs/Tabs.tsx
import './Tabs.css';
// ...
export const TabTrigger = ({ value, children, className, style, ...props }: TabTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');
  const isActive = context.activeTab === value;

  return (
    <button
      className={`hd-tabs__trigger${isActive ? ' hd-tabs__trigger--active' : ''}${className ? ' ' + className : ''}`}
      style={style}  // consumer style passthrough merges naturally
      role="tab"
      aria-selected={isActive}
      // ...
      {...props}
    >
      {children}
    </button>
  );
};
```

```css
/* src/Tabs/Tabs.css */
.hd-tabs__trigger {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--hd-tabs-inactive-color, #64748b);
  border-bottom: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: color 150ms, background-color 150ms, border-color 150ms;
}
.hd-tabs__trigger:hover {
  color: var(--hd-tabs-hover-color, #334155);
  background-color: var(--hd-tabs-hover-bg, #f8fafc);
}
.hd-tabs__trigger:focus-visible {
  outline: 2px solid var(--hd-tabs-focus-ring, #3b82f6);
  outline-offset: 2px;
}
.hd-tabs__trigger--active {
  color: var(--hd-tabs-active-color, #1d4ed8);
  border-bottom-color: var(--hd-tabs-active-border, #1d4ed8);
  background-color: var(--hd-tabs-active-bg, rgba(29, 78, 216, 0.05));
}
```

**Source:** Standard CSS custom-property fallback pattern; `[VERIFIED: codebase grep of current Tabs.tsx for migration mapping]`.

### Anti-Patterns to Avoid

- **Inlining CSS via `injectStyle: true`:** Blocks consumer overrides via `:root` cascade (CSS-in-JS bypasses `:root`), prevents tree-shaking, defeats the entire point of the migration. Rejected per CONTEXT D-01.
- **Using BEM-style class names AND inline `style` for the same property:** Confuses the cascade. Choose: structural visuals in CSS (default value via `var(..., fallback)`), JS-state in inline `style`.
- **`focus:` event handlers in JS instead of `:focus-visible` in CSS:** WCAG 2.4.7 failure mode, mouse-click focus rings shown to mouse users. Rejected per CONTEXT D-04.
- **Setting `"sideEffects": false` in package.json:** Causes consumer bundlers to strip the CSS imports. The library MUST declare `"sideEffects": ["**/*.css"]` for consumer bundlers to retain them. `[VERIFIED: webpack docs, multiple library cases (Material Components, Polaris)]`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS-to-JS coupling | Custom bundler plugin emitting CSS | tsup default behavior (`injectStyle: false`) | esbuild already emits `.css` next to `.js` when JS imports CSS — no plugin needed |
| Conditional `display` toggle | Multiple inline-style spreads | `[data-state="open"]` / `[data-state="closed"]` attribute selector | Doesn't conflict with consumer `style` prop; CSS owns the visibility rule (see Section 7) |
| `:focus-visible` polyfill | JS handlers adding/removing classes | Native CSS `:focus-visible` | Supported in all evergreen browsers; WCAG 2.4.7 expects keyboard-only focus indicator |
| `package.json` exports map generation | Hand-edit per new component | (defer to Phase 26) tools like `tsdown`'s auto-generate or `tsup`'s entry inference | Already hand-edited today; Phase 23 adds 3 CSS entries — not worth automating now |
| Tailwind detection regex | Hand-written negative-lookahead AST walker | Simple scoped regex (Section 6) on `className:` context, file-path-restricted | The dist surface is small (3 files); scope > sophistication |

**Key insight:** This phase is mostly mechanical migration. The build-tool primitives (tsup CSS extraction, CSS custom properties, `:focus-visible`) already exist and behave correctly when used with their defaults. The only original code is the 30-line Node guard script. Don't over-engineer.

## Runtime State Inventory

This is a refactor phase. The relevant question: what runtime systems still carry "Tailwind utility classes" after files are migrated?

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no datastore stores Tailwind classes | None |
| Live service config | None — no external service references class names | None |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | `packages/components/dist/**` — must be rebuilt after each component migration to verify guard passes. Existing `dist/` has Tailwind in 26+ files (not just Tabs/Accordion/Breadcrumbs — see Section 6). | Each plan ends with `npm run build -w @holmdigital/components` to refresh dist, then `npm run check:no-tailwind-leak` to verify. The guard MUST be scoped to the 3 migrated component paths (see Section 6) or it will fail on unmigrated components. |
| Consumer applications | Engine SSR consumer's own dist (`packages/engine/dist/`) embeds `AccessibilityStatement` via SSR — Phase 23 does NOT touch AccessibilityStatement; engine dist rebuild not required unless tsup config change breaks AS rendering | After Plan 23-01, run `npm run build -w @holmdigital/engine` once and grep its `dist/` HTML output for any obvious regressions. (Smoke check — engine doesn't import the 3 migrated components.) |

## 1. tsup CSS Configuration

**Verified behavior `[VERIFIED: esbuild docs + tsup 8.5.1 jsDocs.io]`:**

- tsup is a thin wrapper around esbuild.
- esbuild emits a separate `.css` file next to each entry's JS output when the JS imports CSS. This is the default behavior; no flag is required.
- `injectStyle: false` (the default) keeps CSS as a separate file.
- `injectStyle: true` inlines CSS as a runtime `<style>` injection — REJECTED per CONTEXT D-01.

**Known issues `[CITED: github.com/egoist/tsup/issues/1194, /discussions/621]`:**

- `injectStyle: true` with `dts: true` causes a `DataCloneError` (issue #1194). Our config uses `injectStyle: false` so this is N/A.
- Some users reported CSS not being applied when imported as side-effect in TS (discussion #621); the root cause traced to consumer bundler `sideEffects` config, NOT tsup itself. Solved by adding `"sideEffects": ["**/*.css"]` to package.json (see Section 2).
- tsup README itself states CSS support is "experimental" and recommends `tsdown` as the long-term replacement `[CITED: tsup README]`. For Phase 23 we stay on tsup; flag for Phase 26 (`verify` pipeline) whether to migrate.

**Working `tsup.config.ts`:**

```ts
// packages/components/tsup.config.ts
import { defineConfig } from 'tsup';

// Component entry list — every component that previously appeared in the CLI invocation
// plus src/index.ts. Each component file may import a co-located .css; tsup emits the CSS
// next to the JS in dist/{Component}/{Component}.css.
const components = [
  'Button', 'FormField', 'Dialog', 'Modal', 'SkipLink', 'NavigationMenu',
  'Checkbox', 'RadioGroup', 'Select', 'Switch', 'Toast', 'Tooltip',
  'Heading', 'AccessibilityStatement', 'ErrorSummary', 'Combobox',
  'DatePicker', 'MultiSelect', 'DataTable', 'Pagination', 'Card',
  'TreeView', 'LiveRegion', 'Tabs', 'Accordion', 'ProgressBar',
  'Skeleton', 'HelpText', 'Breadcrumbs',
];

export default defineConfig({
  entry: [
    'src/index.ts',
    ...components.map(c => `src/${c}/${c}.tsx`),
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@holmdigital/standards'],
  // CSS handling: keep as separate files (default). Explicit for clarity and to guard
  // against any future default flip in tsup. DO NOT set `injectStyle: true` —
  // would break consumer custom-property overrides and tree-shaking.
  injectStyle: false,
  // Optional: explicit loader map. The default already maps .css -> 'css' loader;
  // setting it explicitly documents intent and shields against tsup default churn.
  loader: {
    '.css': 'css',
  },
  // Important for consumer bundlers (Vite/webpack/Next) to retain CSS side-effect
  // imports under tree-shaking — see also package.json "sideEffects" field.
  // No tsup option for this; set in package.json directly.
});
```

Then `package.json` scripts collapse to:

```json
"build": "tsup",
"dev": "tsup --watch"
```

**Confidence:** HIGH on `entry`, `format`, `dts`, `external` (these are tsup core, in use since project start). MEDIUM on `injectStyle: false` + `loader` interaction with `dts: true` for the 3 CSS-importing components — flag for Plan 23-01 verification: actually run `npm run build` and assert `dist/Tabs/Tabs.css`, `dist/Accordion/Accordion.css`, `dist/Breadcrumbs/Breadcrumbs.css` exist AND `dist/Tabs/Tabs.d.ts` is still emitted cleanly.

**Pitfall surfaced:** tsup may emit CSS files with a hashed filename or to `dist/` root instead of `dist/Tabs/Tabs.css` — depends on entry path resolution. Plan 23-01 verification step MUST inspect actual emitted layout and adjust the `package.json` exports map accordingly. If CSS lands at `dist/Tabs.css` (flat) instead of `dist/Tabs/Tabs.css` (nested), the exports map and side-effect import paths must match.

## 2. `package.json` "exports" map for emitted `.css`

**Two requirements, both MUST be satisfied:**

### (a) `"sideEffects": ["**/*.css"]` at the package.json root

Without this, consumer bundlers (Vite, webpack, Next.js, Rollup, Parcel) treat the library's modules as side-effect-free and DROP the `import './Tabs.css'` line during tree-shaking. Consumer's app renders unstyled components. `[VERIFIED: webpack tree-shaking docs, Material Components issue #4702, Gatsby issue #31388]`.

The current `package.json` has NO `sideEffects` field. Default behavior is "all modules have side effects" — which means consumer bundlers MAY include the CSS but ALSO can't tree-shake the JS efficiently. Setting `["**/*.css"]` is the precise and standard pattern.

### (b) CSS subpath exports for explicit-import fallback

For consumers whose bundler doesn't follow CSS side-effect imports (rare but exists — some Next.js configurations, some Rollup setups without the right plugin), allow explicit deep-import:

```jsonc
{
  "name": "@holmdigital/components",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./Tabs": {
      "types": "./dist/Tabs/Tabs.d.ts",
      "import": "./dist/Tabs/Tabs.mjs"
    },
    "./Tabs.css": "./dist/Tabs/Tabs.css",
    "./Accordion": {
      "types": "./dist/Accordion/Accordion.d.ts",
      "import": "./dist/Accordion/Accordion.mjs"
    },
    "./Accordion.css": "./dist/Accordion/Accordion.css",
    "./Breadcrumbs": {
      "types": "./dist/Breadcrumbs/Breadcrumbs.d.ts",
      "import": "./dist/Breadcrumbs/Breadcrumbs.mjs"
    },
    "./Breadcrumbs.css": "./dist/Breadcrumbs/Breadcrumbs.css"
    // ... other components unchanged
  }
}
```

**Note:** the `./Tabs.css` style export deliberately does NOT use conditional exports (no `types`/`import`/`require` object) — CSS is not a JS module, and publint flags conditional exports for non-JS assets as warnings `[CITED: publint.dev/rules]`.

**Confidence:** HIGH on `sideEffects` (battle-tested across multiple library cases). HIGH on subpath CSS export string-form (standard pattern; Tailwind, MUI, Mantine, react-day-picker all use it). MEDIUM on `attw` (Phase 26 tool) tolerance for `.css` subpaths — `attw` has `--exclude-entrypoints` for non-JS files; flag for Plan 23-01 to add `attw` config later if Phase 26 needs it. `[CITED: npmjs.com/package/@arethetypeswrong/cli]`

## 3. Consumer Bundler Compatibility

**Question:** When the library's published `Tabs.mjs` does `import './Tabs.css'`, does the consumer's bundler reliably pick it up?

**Answer (`[VERIFIED: webpack tree-shaking docs, multi-source cross-check]`):**

| Bundler | Follows CSS side-effect import in dependencies? | Requires lib `sideEffects: ["**/*.css"]`? |
|---------|------------------------------------------------|-------------------------------------------|
| Vite (dev) | Yes | No (dev disables tree-shaking) |
| Vite (prod build / Rollup) | Yes | YES — without it, CSS may be dropped |
| webpack 5 | Yes | YES — explicit requirement per webpack docs |
| Next.js (webpack) | Yes | YES |
| Next.js (Turbopack, experimental) | Likely yes | YES (same model as webpack) `[ASSUMED]` |
| Parcel | Yes | Helpful but Parcel is more lenient |
| Rollup (raw, no plugin) | NO — needs a CSS plugin (rollup-plugin-postcss etc.) | Plugin-dependent |
| esbuild (consumer using esbuild directly) | Yes | YES |

**Failure mode without `sideEffects` declaration:**
Component renders unstyled. No error, no warning. Developer sees broken visuals only after deploy.

**Recommended pattern (matches what Mantine, Radix, react-day-picker do):**
1. Declare `"sideEffects": ["**/*.css"]` in `package.json` — the side-effect import works for most consumers.
2. Document in README and JSDoc that consumers using non-side-effect-tracking bundlers can also do:
   ```ts
   import { Tabs } from '@holmdigital/components/Tabs';
   import '@holmdigital/components/Tabs.css';  // explicit fallback
   ```
3. Both work in parallel — no harm in importing CSS twice; CSS is idempotent.

**Confidence:** HIGH on Vite/webpack/Next behavior (well-documented). MEDIUM on Parcel/Turbopack (less consumer testing surface in our user base). `[CITED: webpack.js.org/guides/tree-shaking, dev.to/markliu2013/deep-dive-into-sideeffects]`

## 4. CSS Custom-Property Fallback Strategy

**The CONTEXT said "inline-style fallbacks." Three interpretations were possible — resolved as follows:**

**Resolution: Use `var(--hd-{component}-{role}, <default>)` INSIDE the `.css` file. Do NOT use inline-style fallbacks.**

**Rationale:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| (A) `var()` defaults in `.css` only | Single source of truth; consumer overrides via `:root` cascade cleanly; cascade works correctly | If `.css` fails to load (rare — bundler misconfig), component renders unstyled | **CHOSEN** |
| (B) Inline-style defaults + `var()` in `.css` for override hook | Component renders styled even if `.css` is missing | Inline `style` always wins over external CSS — defeats `.css`-based pseudo-class styling (`:hover` can't override an inline `color`); breaks the cascade model | Rejected — conflicts with `:hover`/`:focus-visible` requirement |
| (C) Inline-style with `var()` references: `style={{ color: 'var(--hd-tabs-color, #1d4ed8)' }}` | Both override hook and a default | Same cascade-loser problem as (B) for pseudo-class styling | Rejected |

**Concretely (option A):**

```css
/* Tabs.css */
.hd-tabs__trigger {
  color: var(--hd-tabs-inactive-color, #64748b);
}
.hd-tabs__trigger:hover {
  color: var(--hd-tabs-hover-color, #334155);
}
.hd-tabs__trigger--active {
  color: var(--hd-tabs-active-color, #1d4ed8);
}
```

A consumer who completely fails to load `Tabs.css` gets unstyled tabs — but that's a build-config issue surfaced by the regression guard and `sideEffects` declaration, not a runtime concern. If we wanted true zero-CSS-fallback rendering, that's CSS-in-JS territory (CONTEXT explicitly rejected).

**Where inline `style` IS used (still required):**
- Conditional state driven by React state (Accordion's `isOpen` chevron rotation): `style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}` — these are NOT theming defaults; they're JS-driven visual state that can't be expressed in pure CSS (no parent-state selector). This is consistent with CONTEXT D-04.

**Recommendation for the planner:** Reword STY-03 success criterion in the plan as "CSS custom properties define theming surface with **`var()` fallbacks in the `.css` file**" — to disambiguate from "inline-style" which CONTEXT used loosely. `[ASSUMED interpretation; user should confirm during planner review if ambiguity matters.]`

## 5. `:focus-visible` Smoke Test Approach

**Recommended: Option (a) — `fs.readFileSync(componentCssPath).includes(':focus-visible')`.**

**Why (a) over (b):**

| Approach | Pros | Cons |
|----------|------|------|
| (a) Read `.css` file as string, assert `.includes(':focus-visible')` | Trivial, deterministic, fast, no jsdom dependency, runs in any Node context | Doesn't verify the rule actually APPLIES — just verifies the selector EXISTS |
| (b) Render in jsdom, focus element, check matched pseudo-class | "Real" behavioral test | jsdom's `:focus-visible` support is incomplete `[VERIFIED: jsdom changelog historical issues]`; user-event focus simulation doesn't trigger `:focus-visible` matching in jsdom; would require Playwright Component Testing (out of scope — blocked Storybook prerequisite per CONTEXT) |

**Implementation pattern (drop into each component's `.test.tsx`):**

```tsx
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Tabs :focus-visible style hook (STY-04 smoke test)', () => {
  it('Tabs.css contains a :focus-visible selector', () => {
    const cssPath = resolve(__dirname, 'Tabs.css');
    const css = readFileSync(cssPath, 'utf8');
    expect(css).toMatch(/:focus-visible\s*\{/);
  });
});
```

**Pitfalls:**
- `__dirname` is a CommonJS global. Vitest typically supports it via Node compat; if the test files are pure ESM with `"type": "module"`, swap for `import.meta.url` + `fileURLToPath`. The existing test files use `__dirname` patterns OR `import.meta.url` — planner should match the existing convention in the test file being modified.
- The regex `:focus-visible\s*\{` is preferred over `.includes(':focus-visible')` to avoid matching the substring inside a comment (`/* TODO: add :focus-visible */`). Cheap correctness win.
- Don't assert on the rule's *content* — only that the SELECTOR exists. The point is a regression guard against future "I'll just remove that line" refactors; rule content tests get brittle.

**Confidence:** HIGH (this is standard practice for CSS-as-asset assertions; mirrors the `check-wcag-headers.mjs` "marker is present" pattern).

## 6. STY-05 Grep Pattern — Two Material Issues

This is the section the planner needs to read most carefully. The CONTEXT-proposed implementation has two problems verified empirically against the current dist.

### Issue 1: Regex is too aggressive (false positives)

The proposed regex `\b(flex|grid|text-slate|bg-white|bg-slate|hover:|focus:|focus-visible:|ring-|rounded-|border-slate|border-primary|space-y-|gap-|px-|py-|mx-|my-|leading-|font-)\b` matches benign identifiers `[VERIFIED: empirical regex test]`:

| Input | Matches? | Why this matters |
|-------|----------|------------------|
| `font-medium` (Tailwind class) | ✓ | True positive — intended |
| `font-family: serif` (real CSS in a `style=` string) | ✓ FALSE POSITIVE | A migrated component using `style={{ fontFamily: 'serif' }}` could compile to a string containing `font-family` — though unlikely with React's camelCase, edge cases exist for CSS-in-JS libraries |
| `grid-template-columns` | ✓ FALSE POSITIVE | Same risk: a future inline-style with `gridTemplateColumns` becomes `grid-template-columns` in serialized CSS-in-JS or in a `dangerouslySetInnerHTML` string |
| `data-gap-id` (user-supplied prop) | ✓ FALSE POSITIVE | Consumer passes `data-gap-id="foo"` through `...props` → compiles to literal in dist |
| `my-custom-prop` | ✓ FALSE POSITIVE | Any prop name starting `my-` |
| `gap-4` (Tailwind) | ✓ | True positive |

**Recommendation: scope the regex to `className`-bounded context.**

A practical heuristic: only match when the pattern appears inside a `className:` or `className="..."` quote string. This dramatically reduces noise:

```js
// Inside scripts/check-no-tailwind-leak.mjs
// Match TAILWIND_PATTERN only inside a className context (rough heuristic).
const TAILWIND_PATTERN = /\b(flex|grid|text-slate|bg-white|bg-slate|hover:|focus:|focus-visible:|ring-|rounded-|border-slate|border-primary|space-y-|gap-|px-|py-|mx-|my-|leading-|font-)\b/;

function findOffenders(source) {
  const offenders = [];
  // Find className: '...' or className: `...` or className="..." contexts.
  // Compiled JSX in dist uses: className: "literal" or className: `template${expr}`
  const CLASSNAME_CONTEXT = /className\s*[:=]\s*(['"`])([\s\S]*?)\1/g;
  let m;
  while ((m = CLASSNAME_CONTEXT.exec(source)) !== null) {
    const str = m[2];
    if (TAILWIND_PATTERN.test(str)) {
      offenders.push(str.slice(0, 80));
    }
  }
  return offenders;
}
```

Empirical test against the current dist (`[VERIFIED: ran in research]`):
- Unscoped regex: **901 matches across 44 files** (massive false-positive load)
- `className`-scoped regex: **177 matches across 26 files** (still > 0 because of Issue 2)

### Issue 2: Scope must be the 3 migrated components, not all of `dist/`

The current dist `[VERIFIED: ran the scoped regex empirically]` shows Tailwind class strings inside `className:` literals in MANY components beyond Phase 23's scope: NavigationMenu (6), RadioGroup (7), Toast (7), Dialog (6), Modal (6), Select, etc.

Running a tree-wide guard would:
- Fail the build BEFORE this phase (it should pass — current state is the baseline)
- Continue to fail AFTER this phase (Phase 23 only fixes 3 components; STY-07 defers the other ~10 to v0.7)

**Two viable scoping strategies:**

**Strategy A (RECOMMENDED): Path allowlist**

The guard walks only:
- `dist/Tabs/**/*.{js,mjs}`
- `dist/Accordion/**/*.{js,mjs}`
- `dist/Breadcrumbs/**/*.{js,mjs}`

Skips `dist/index.{js,mjs}` (re-export barrel — contains every component's source).
Skips all `dist/chunk-*.{js,mjs}` (tsup shared chunks — contain other components' code).

The script can be extended in v0.7 to add more component paths as STY-07 lands. Cheap, explicit, debuggable.

**Strategy B: Baseline-counting**

The guard counts matches against a checked-in baseline file (`scripts/tailwind-leak-baseline.json`). Build fails if count > baseline for any component path. Each migrated component drops its entry to 0.

More complex; better for an "improving-over-time" metric. Not warranted for 3 components in one phase. Defer to v0.7.

**Recommended guard skeleton:**

```js
#!/usr/bin/env node
// packages/components/scripts/check-no-tailwind-leak.mjs
// STY-05: regression guard against Tailwind utility leakage in dist/ for migrated components.
// Scoped to Tabs/Accordion/Breadcrumbs per Phase 23 — extend as STY-07 lands per-component.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SCOPED_DIRS = ['Tabs', 'Accordion', 'Breadcrumbs'];

if (!existsSync(DIST)) {
  console.log('[check-no-tailwind-leak] skipped — dist/ not built. Run `npm run build` first.');
  process.exit(0);
}

const TAILWIND_PATTERN = /\b(flex|grid|text-slate|bg-white|bg-slate|hover:|focus:|focus-visible:|ring-|rounded-|border-slate|border-primary|space-y-|gap-|px-|py-|mx-|my-|leading-|font-)\b/;
const CLASSNAME_CTX = /className\s*[:=]\s*(['"`])([\s\S]*?)\1/g;

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(js|mjs)$/.test(name)) acc.push(full);
  }
  return acc;
}

const offenders = [];
for (const sub of SCOPED_DIRS) {
  for (const f of walk(join(DIST, sub))) {
    const src = readFileSync(f, 'utf8');
    let m;
    CLASSNAME_CTX.lastIndex = 0;
    while ((m = CLASSNAME_CTX.exec(src)) !== null) {
      const str = m[2];
      const hit = str.match(TAILWIND_PATTERN);
      if (hit) offenders.push({ file: relative(process.cwd(), f), hit: hit[0], snippet: str.slice(0, 80) });
    }
  }
}

if (offenders.length) {
  console.error(`\n[check-no-tailwind-leak] ${offenders.length} Tailwind utility match(es) found inside className contexts in migrated components:`);
  for (const o of offenders) console.error(`  - ${o.file}: matched "${o.hit}" in "${o.snippet}..."`);
  console.error('\nMigrate these className strings to inline-style + co-located .css file per Phase 23 pattern.');
  process.exit(1);
}
console.log(`[check-no-tailwind-leak] ok — no Tailwind utilities in className context for ${SCOPED_DIRS.join(', ')}.`);
```

**Confidence:** HIGH (empirically validated against current dist; both scoping and regex behavior tested in research).

**Open question for planner:** does the guard also need to scan `dist/index.{js,mjs}`? The barrel re-exports include every component's JS source — running the guard there would still find Tailwind utilities from NavigationMenu/etc. **Recommendation: skip `index.{js,mjs}` for Phase 23; revisit when STY-07 is in flight.** The plan should explicitly document this scope limitation in 23-01's deliverables.

## 7. Accordion Conditional `display: none` Strategy

Current pattern: `${!isOpen ? 'hidden' : ''}` (Tailwind `hidden` = `display: none`).

**Three candidates evaluated:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| (1) Inline `style={{ display: isOpen ? 'block' : 'none' }}` | Direct, no CSS rule needed | Clashes with consumer `style` prop merge order; locks display to `block` (breaks if consumer wants `flex` or `grid`) | Rejected |
| (2) Render `null` when collapsed | Trivial | Breaks ARIA semantics — content with `aria-labelledby` must exist in DOM; assistive tech queries collapsed regions; `hidden` HTML attribute is the standard | Rejected |
| (3) `[data-state]` attribute + CSS rule | Clean separation; consumer can override via `:root` or attribute selector; preserves DOM presence for ARIA | One extra CSS rule | **CHOSEN** |
| (4) Native HTML `hidden` attribute (currently used on the same element AS WELL) | Already there; standards-based | Browser default `hidden` styling can be overridden by other `display` rules — fragile when CSS gets richer | Hybrid: keep `hidden={!isOpen}` for semantics AND use `[data-state]` for visual transition control if needed |

**Recommended Accordion content pattern:**

```tsx
// AccordionContent
return (
  <div
    id={`accordion-content-${value}`}
    role="region"
    aria-labelledby={`accordion-trigger-${value}`}
    hidden={!isOpen}  // HTML semantics — assistive tech and default display:none
    data-state={isOpen ? 'open' : 'closed'}  // styling hook
    className={`hd-accordion__content${className ? ' ' + className : ''}`}
    style={style}  // consumer passthrough
  >
    {children}
  </div>
);
```

```css
.hd-accordion__content {
  padding: 0.75rem 1rem;
  color: var(--hd-accordion-content-color, #475569);
  background: var(--hd-accordion-content-bg, #ffffff);
  border-top: 1px solid var(--hd-accordion-border, #f1f5f9);
  font-size: 0.875rem;
  line-height: 1.625;
}
/* `hidden` attribute already sets display: none in user-agent stylesheet.
   The data-state hook is reserved for future transition support without breaking ARIA. */
.hd-accordion__content[data-state="closed"] {
  display: none;
}
```

For the ChevronIcon rotation (transform property), inline `style` is unambiguously correct (consumer never themes a chevron rotation; pure JS state):

```tsx
<ChevronIcon
  className="hd-accordion__chevron"
  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
/>
```

```css
.hd-accordion__chevron {
  height: 1rem;
  width: 1rem;
  color: var(--hd-accordion-chevron-color, #64748b);
  transition: transform 200ms ease;
}
```

**Confidence:** HIGH (`data-state` is the Radix/Headless UI convention; ARIA `hidden`/`aria-expanded` semantics preserved).

## 8. Phase 22 SSR Audit Relevance

**Confirmed: side-effect CSS imports are SSR-safe in this codebase.** `[VERIFIED: re-reading Phase 22 SSR audit + reasoning about engine build pipeline]`

**Why:**

1. Engine's `statement-generator.ts` is the ONLY SSR consumer of `@holmdigital/components` `[CITED: Phase 22 SSR audit recorded in .planning/PROJECT.md]`.
2. Engine imports `AccessibilityStatement` only — does NOT import Tabs/Accordion/Breadcrumbs.
3. Even if it DID, side-effect CSS imports in the JS bundle are processed at **engine build time** (when tsup builds the engine package), not at **runtime SSR time**. The engine pulls in the compiled `@holmdigital/components` dist; the CSS side-effect import in the compiled JS is a hint to consumer bundlers — not an action that fires during `renderToStaticMarkup`.
4. The engine's HTML report output is a complete static HTML document. If a future engine consumer ever included Tabs/Accordion/Breadcrumbs in their report, they'd need to also include the CSS — solvable by importing `@holmdigital/components/Tabs.css` explicitly in the engine's HTML template (currently N/A).

**Caveat:** The tsup config change (CLI → `tsup.config.ts`) applies to the components package. The engine package is separate. **Verify in Plan 23-01: after rebuilding components and engine, run engine's existing tests (whatever exists for `statement-generator.ts`) to ensure HTML output hasn't shifted.** This is a Plan 23-01 verification step (smoke check), not a separate plan.

**Confidence:** HIGH on no SSR breakage (the audit was thorough and the engine doesn't touch the migrated components).

## Code Examples (consolidated)

### Tabs migration example (TabsList portion)

```tsx
// src/Tabs/Tabs.tsx (excerpt — pattern to apply to all 4 sub-components)
import './Tabs.css';
// ...
export const TabsList = ({ children, className, ariaLabel }: TabsListProps) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsList must be used within Tabs');
  const listRef = useRef<HTMLDivElement>(null);
  // ... handleKeyDown unchanged ...

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation={context.orientation}
      aria-label={ariaLabel}
      data-orientation={context.orientation}
      className={`hd-tabs__list${className ? ' ' + className : ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};
```

```css
/* src/Tabs/Tabs.css */
.hd-tabs__list {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid var(--hd-tabs-divider-color, #e2e8f0);
}
.hd-tabs__list[data-orientation="vertical"] {
  flex-direction: column;
  border-bottom: 0;
  border-right: 1px solid var(--hd-tabs-divider-color, #e2e8f0);
}
```

### package.json patch (Plan 23-01)

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": ["**/*.css"],
  "exports": {
    "./Tabs": { ... },
    "./Tabs.css": "./dist/Tabs/Tabs.css",
    "./Accordion": { ... },
    "./Accordion.css": "./dist/Accordion/Accordion.css",
    "./Breadcrumbs": { ... },
    "./Breadcrumbs.css": "./dist/Breadcrumbs/Breadcrumbs.css"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak",
    "check:no-tailwind-leak": "node scripts/check-no-tailwind-leak.mjs"
  }
}
```

## State of the Art

| Old Approach (in this codebase) | Current Approach | When Changed | Impact |
|---------------------------------|------------------|--------------|--------|
| Long inline tsup CLI in `package.json` scripts | `tsup.config.ts` config file | This phase | Maintainability; future Phase 26 publint/attw integration |
| Tailwind utility `className` strings | Inline-style + co-located CSS + custom properties | This phase | Consumers without Tailwind get styled components |
| `:focus` (legacy mouse + keyboard ring) | `:focus-visible` (keyboard-only) | This phase | WCAG 2.4.7 compliance, no mouse-click ring artifacts |
| Tailwind `hidden` class for conditional display | Native `hidden` attribute + `[data-state]` hook | This phase | Preserves ARIA semantics; consumer style-prop compatible |

**Tooling drift to flag for Phase 26:**
- tsup README explicitly recommends `tsdown` as the actively-maintained successor `[CITED: github.com/egoist/tsup README]`. Phase 23 stays on tsup (don't combine refactors). Phase 26 should evaluate the migration.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `tsup` | All plans | ✓ (devDep) | 8.3.5+ (latest 8.5.1) | — |
| `vitest` | Tests | ✓ | (root) | — |
| Node.js | Guard script | ✓ | — | — |
| `node:fs`, `node:path` | Guard script | ✓ (built-in) | — | — |

No missing dependencies.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (root-installed; jsdom env per components/_test/setup.ts) |
| Config file | `packages/components/vitest.config.ts` (existing) |
| Quick run command | `npm run test -w @holmdigital/components` |
| Full suite command | `npm run test:ci -w @holmdigital/components` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| STY-01 | Components have zero Tailwind classes in `className=` | static-grep | `npm run check:no-tailwind-leak -w @holmdigital/components` (after build) | ❌ Plan 23-01 creates |
| STY-02 | tsup emits separate `.css` files in dist | post-build assert | Manual ls + ad-hoc node script in Plan 23-01 verification | ❌ — verification step in Plan 23-01 description (not a recurring test) |
| STY-03 | CSS custom properties present with `var()` fallbacks | static-grep | smoke test in each `*.test.tsx`: `expect(fs.readFileSync(componentCss, 'utf8')).toMatch(/var\(--hd-/)` | ❌ Plan 23-02/03/04 add |
| STY-04 | `:focus-visible` selector present in each `.css` | static-grep | smoke test: `expect(fs.readFileSync(componentCss, 'utf8')).toMatch(/:focus-visible\s*\{/)` | ❌ Plan 23-02/03/04 add |
| STY-05 | No Tailwind leakage in scoped dist paths | static-grep | `npm run check:no-tailwind-leak` (chained into `test:ci`) | ❌ Plan 23-01 creates |
| STY-06 | `className` prop merges with default classes | unit | Existing Tabs tests cover; add minimal merge test for Accordion/Breadcrumbs | partial — Tabs ✓, Accordion ❌, Breadcrumbs ❌ |

### Sampling Rate
- **Per task commit:** `npm run test -w @holmdigital/components` (fast vitest run; jsdom)
- **Per wave merge:** `npm run build -w @holmdigital/components && npm run test:ci -w @holmdigital/components` (full suite + guard)
- **Phase gate:** `npm run build` (whole repo) + components `test:ci` green; engine SSR smoke (build engine, run any AS-statement tests) green

### Wave 0 Gaps
- [ ] `packages/components/scripts/check-no-tailwind-leak.mjs` — created in Plan 23-01
- [ ] `packages/components/tsup.config.ts` — created in Plan 23-01
- [ ] `packages/components/src/Accordion/Accordion.test.tsx` — created in Plan 23-03 (with WCAG SC header per Phase 22 D-03a)
- [ ] `packages/components/src/Breadcrumbs/Breadcrumbs.test.tsx` — created in Plan 23-04 (with WCAG SC header)
- [ ] No framework install needed

## Security Domain

> `security_enforcement` is not configured (treat as enabled). However, this is a pure-presentational refactor with no auth/data/input-validation surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | no — `className`/`style` are passthrough; React escapes them | React JSX escaping (built-in) |
| V6 Cryptography | no | N/A |
| V14 Configuration | indirect | `package.json` `sideEffects` declaration affects consumer build correctness |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via consumer-supplied `className` or `style` | Tampering | React's JSX escapes strings; no `dangerouslySetInnerHTML`. Consumer-supplied `style` object can carry CSS expression injection in legacy IE — N/A (project targets evergreen browsers per peer dep React 18+) |
| CSS injection via custom-property override | Tampering | Custom properties are scoped to property values; cannot break out of the CSS rule. Standard behavior. |

No security-domain action items.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CONTEXT's "inline-style fallbacks" phrase actually means "fallbacks in `var()` syntax inside the `.css` file" (Section 4 option A), NOT literal inline `style={{}}` defaults | 4 | If user meant literal inline defaults, the `:hover` and `:focus-visible` styling would have to fight inline-style specificity — breaking D-04. Flag for planner: ask user during plan review if STY-03 success criterion text should be amended. |
| A2 | tsdown migration is OUT OF SCOPE for Phase 23, deferred to Phase 26 (`verify` pipeline) | 1, State of the Art | If user wants the tooling migration sooner, it merges into this phase's scope and 23-01 grows substantially. |
| A3 | STY-05 guard scope is the 3 migrated component dirs only — NOT tree-wide. The script's `SCOPED_DIRS` array is extended as STY-07 lands. | 6 | If user expects tree-wide guard from day 1, Phase 23 fails because ~10 unmigrated components contain Tailwind. **Highest-risk assumption — verify with user.** |
| A4 | `index.{js,mjs}` (barrel) is excluded from STY-05 guard | 6 | Per A3, excluding it is the natural consequence. |
| A5 | Phase 22 SSR audit's conclusion (engine only consumes `AccessibilityStatement`) still holds — Phase 23 doesn't change which components the engine imports | 8 | If a recent commit added new component imports to engine's SSR path, the audit may be stale. `[ASSUMED based on CONTEXT.md, not re-verified by grepping engine src in this research.]` |
| A6 | tsup 8.5.1 with `injectStyle: false` + `dts: true` + 3 CSS-importing entries produces the expected layout `dist/Tabs/Tabs.css` / `Accordion/Accordion.css` / `Breadcrumbs/Breadcrumbs.css` next to their JS siblings | 1 | If tsup emits to a flat `dist/Tabs.css` or hashes the filename, the exports map paths must adjust. Plan 23-01 verification MUST inspect actual output before finalizing exports map. |
| A7 | The standard side-effect declaration `"sideEffects": ["**/*.css"]` is correctly honored by all consumers we care about (Vite/webpack/Next/Rollup-with-plugin) | 2, 3 | If a major consumer in the ecosystem doesn't honor it, the explicit `./Tabs.css` subpath export is the documented fallback — so worst case is "consumer adds one more import." Low risk. |

**Decisions needing user confirmation (planner: surface in plan review):**

- **A1 (highest):** Confirm STY-03 success-criterion language for "inline-style fallbacks" — is `var()` defaults inside `.css` the right interpretation?
- **A3 (highest):** Confirm STY-05 guard scope = 3 components only (Strategy A), not tree-wide.

## Open Questions

1. **Should `dist/index.{js,mjs}` be in the STY-05 scope?**
   - What we know: it's a barrel re-export that contains code from all components; will have Tailwind matches from unmigrated components.
   - What's unclear: user's mental model of "regression guard" — strict (any leak fails) vs. scoped (only phase-23 components fail).
   - Recommendation: scoped (per A3); document the limitation in Plan 23-01's deliverables and a TODO comment in the script.

2. **Are there existing tests for Accordion or Breadcrumbs?**
   - CONTEXT states "no existing tests for Accordion or Breadcrumbs."
   - Recommendation: Plans 23-03 and 23-04 each create a new `.test.tsx` with WCAG SC header (per Phase 22 D-03a) and a minimal `:focus-visible` smoke test + a `className` passthrough test. Don't expand to full Tier 1+2 — that's Phase 24.

3. **Does the existing engine build still work after tsup CLI → config migration?**
   - The engine package has its own tsup invocation; Plan 23-01 only touches components/package.json + tsup.config.ts. Engine is unaffected.
   - Recommendation: smoke step in Plan 23-01 verification — run `npm run build` at repo root and ensure both packages build clean.

## Sources

### Primary (HIGH confidence)
- esbuild Content Types — `https://esbuild.github.io/content-types/` — CSS extraction behavior, loaders
- webpack tree-shaking guide — `https://webpack.js.org/guides/tree-shaking/` — `sideEffects` declaration semantics
- tsup 8.5.1 jsDocs.io — `https://www.jsdocs.io/package/tsup` — `injectStyle`, `loader`, options surface
- publint rules — `https://publint.dev/rules` — package.json exports validation
- arethetypeswrong CLI — `https://www.npmjs.com/package/@arethetypeswrong/cli` — type entrypoint validation
- Codebase grep + empirical regex tests against current `packages/components/dist/` (research session)

### Secondary (MEDIUM confidence)
- tsup README — `https://github.com/egoist/tsup` — recommends tsdown as successor; CSS support marked experimental
- tsup discussions/issues #621, #1194 — historical CSS+dts bugs (mostly resolved in 8.x; `injectStyle: false` path is unaffected)
- Material Components issue #4702 — real-world cost of missing `sideEffects: ["**/*.css"]`
- Gatsby issue #31388 — same pattern, different consumer-bundler

### Tertiary (LOW confidence)
- Parcel/Turbopack `sideEffects` behavior — inferred from webpack parity; not directly verified `[ASSUMED]`
- tsdown maturity vs tsup for production component-library use in late 2025 `[ASSUMED]`

## Metadata

**Confidence breakdown:**
- tsup CSS pipeline mechanics: HIGH — esbuild-level behavior is well-documented; specific config syntax verified against jsDocs API surface
- `package.json` `sideEffects` / exports map: HIGH — multi-source verification (webpack, Material Components, Gatsby cases all consistent)
- Consumer bundler compatibility: MEDIUM — covered the big four (Vite/webpack/Next/Rollup); edge bundlers inferred
- STY-05 regex correctness: HIGH — empirically tested against current dist; both unscoped and scoped variants measured
- Accordion `display` strategy: HIGH — `data-state` is well-established (Radix, Headless UI use it); ARIA semantics analyzed
- `:focus-visible` smoke test: HIGH — file-content assertion is standard CI practice
- SSR safety: HIGH — Phase 22 audit conclusion + reasoning about engine build-time-vs-runtime
- Theming fallback interpretation (A1): MEDIUM — depends on user intent; flagged for confirmation

**Research date:** 2026-05-10
**Valid until:** 2026-06-10 (30-day stable window; tsup/esbuild behavior is mature)
