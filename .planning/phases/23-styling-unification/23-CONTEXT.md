---
phase: 23
phase_name: Styling Unification
date: 2026-05-10
requirements: STY-01, STY-02, STY-03, STY-04, STY-05, STY-06
ui_hint: yes
---

# Phase 23 Context

## Domain

Migrate three Tailwind-utility-class components (`Tabs`, `Accordion`, `Breadcrumbs`) from inline Tailwind `className=` strings to a hybrid pattern: structural/visual CSS lives in a co-located `.css` file imported as a side-effect from the component file; theming is exposed via CSS custom properties with inline-style fallbacks; `className` becomes a passthrough-only prop. Plus configure tsup's CSS pipeline to emit `.css` files alongside `.js` in `dist/`, and add a build-time regression guard that fails the build if any Tailwind utility pattern leaks back into shipped JS.

The goal is consumer correctness regardless of whether the consumer has Tailwind installed. Today, a consumer without Tailwind gets unstyled components; after this phase they get fully-styled, themable components out of the box.

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 23 goal + 5 success criteria
- `.planning/REQUIREMENTS.md` — STY-01..06
- `.planning/PROJECT.md` — milestone v0.6 Components Quality scope; locked styling decisions
- `.planning/phases/22-test-infra-and-first-7-components/22-CONTEXT.md` — Phase 22 conventions inherited (WCAG-SC marker, D-02a anti-pattern gate, helper imports)
- `packages/components/TESTING-CONVENTIONS.md` — Phase 22 test conventions
- `packages/components/src/Tabs/Tabs.tsx` — 4 `className=` sites with Tailwind utilities (lines 53, 117, 147, 185)
- `packages/components/src/Accordion/Accordion.tsx` — 6 `className=` sites with Tailwind utilities (lines 11, 51, 71, 98, 106, 125)
- `packages/components/src/Breadcrumbs/Breadcrumbs.tsx` — 7 `className=` sites with Tailwind utilities (lines 18, 25, 27, 39, 47, 48, 58)
- `packages/components/package.json` — current tsup invocation (long CLI; Phase 23 migrates this to `tsup.config.ts`)
- `packages/components/scripts/check-wcag-headers.mjs` — Phase 22 reference for repo-level guard scripts
- `.planning/phases/22-test-infra-and-first-7-components/22-03-SUMMARY.md` — SSR consumer audit confirming engine's `statement-generator.ts` is the only SSR consumer (relevant for confirming CSS side-effect imports are SSR-safe in this codebase)
- Commit `b04917d` — Phase 22 `_test/setup.ts` with all 7 jsdom polyfills (test setup baseline)

## Code Context

**Current Tailwind usage (the actual migration surface):**

`Tabs/Tabs.tsx` className targets:
- Line 53 (root): `flex flex-col / flex-col md:flex-row gap-4` — layout container
- Line 117 (TabList): `flex flex-col border-r border-slate-200` (vertical) / `border-b border-slate-200` (horizontal)
- Line 147 (Tab trigger): multiline; includes active-state classes (template-literal)
- Line 185 (TabPanel): `py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md`

`Accordion/Accordion.tsx` className targets:
- Line 11 (Root): passthrough only
- Line 51 (AccordionGroup): `space-y-1`
- Line 71 (AccordionItem): `border border-slate-200 rounded-lg overflow-hidden`
- Line 98 (AccordionTrigger): `w-full flex items-center justify-between px-4 py-3 text-left font-medium text-slate-900 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset`
- Line 106 (ChevronIcon): `h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`
- Line 125 (AccordionContent): `px-4 py-3 bg-white text-slate-600 border-t border-slate-100 text-sm leading-relaxed ${!isOpen ? 'hidden' : ''}`

`Breadcrumbs/Breadcrumbs.tsx` className targets:
- Line 18 (current page li): `flex items-center text-slate-900 font-semibold`
- Line 25 (link li): `flex items-center text-slate-500 hover:text-slate-700 transition-colors`
- Line 27 (link a): `hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-sm`
- Line 39 (separator svg): `text-slate-400 mx-2`
- Line 47 (nav): passthrough only
- Line 48 (ol): `flex items-center flex-wrap`
- Line 58 (aria-hidden li): `flex items-center select-none`

**Pseudo-class / state surface that MUST live in `.css` (cannot be inline-style):**
- `:hover` (Accordion trigger, Breadcrumbs link)
- `:focus-visible` (Tabs panel, Accordion trigger, Breadcrumbs link) — STY-04 mandates `.css` over JS handlers
- `transition-*` properties (Accordion trigger, ChevronIcon, Breadcrumbs link)
- Conditional classes driven by JS state (`rotate-180` when `isOpen`, `hidden` when collapsed) — these become inline `style={{ transform: ..., display: ... }}` toggled by React state

**Phase 22 conventions in scope:**
- WCAG-SC JSDoc header marker required on every modified `*.test.tsx` (the `npm run test:wcag-headers` CI gate)
- D-02a anti-pattern gate: 0 `querySelector`, 0 `configureAxe`, 0 `toMatchSnapshot` in test files
- Existing tests for Tabs (16 tests, Phase 22 Plan 09) must continue to pass
- No existing tests for Accordion or Breadcrumbs — Phase 23 is not adding behavior tests for them; just smoke tests for `:focus-visible` style hook presence per STY-04 success criterion #3
- `_test/helpers.ts` available: `expectNoAxeViolations`, etc.

**Build setup observations:**
- `packages/components/package.json` invokes tsup via a long CLI command listing every component file. There is no `tsup.config.ts`. Adding one is a Phase 23 task (migrating from CLI to config file).
- Current `package.json` has `"main": "./dist/index.js"`, ESM `"module": "./dist/index.mjs"`, full subpath exports for each component. CSS pipeline must respect this multi-entry shape — tsup emits `Tabs.css`, `Accordion.css`, `Breadcrumbs.css` when components import their respective `.css` files.

**Carryover from prior phases:**
- Phase 22 SSR audit: engine's `statement-generator.ts` is the ONLY SSR consumer of `@holmdigital/components`. CSS side-effect imports are SSR-safe in this codebase because the only SSR path is engine's `renderToStaticMarkup` call — bundler resolution of CSS side-effect imports happens at engine build time, not at SSR time. (Recorded in `.planning/PROJECT.md` SSR Consumer Audit section.)
- Phase 22 test stack: `@chialab/vitest-axe`, `@testing-library/user-event` v14, `@testing-library/jest-dom` v6 — all available for Phase 23 test additions.

## Decisions

### D-01 — tsup CSS pipeline: migrate CLI to `tsup.config.ts`
Replace the long inline tsup CLI command in `package.json` (`"build"` and `"dev"` scripts) with a `tsup.config.ts` file at `packages/components/tsup.config.ts`. The config encodes the existing entry list, format, dts, externals, AND adds CSS support so tsup emits `Tabs.css`, `Accordion.css`, `Breadcrumbs.css` alongside their respective JS bundles when each component file uses `import './Tabs.css'` style side-effect imports.

**Rationale:** the current CLI invocation is unmaintainable (every component addition extends the line). Migrating to a config file cleanly accommodates the new CSS entries, future component additions, and Phase 26's planned `verify` pipeline (publint/attw need predictable build output).

**Implementation note:**
- tsup's default behavior emits CSS as separate files; consumers' bundlers pick them up via the side-effect import. NO `--inject-style` flag (would inline CSS into JS, blocking tree-shaking and breaking the consumer-CSS-bundler contract).
- `package.json` "exports" map needs a `"./Tabs.css"`, `"./Accordion.css"`, `"./Breadcrumbs.css"` entry so consumers can deep-import the CSS file if their bundler doesn't follow side-effect imports automatically. Or rely on the side-effect import being processed by the consumer's bundler — confirm during execution.
- Verify with `npm run build -w @holmdigital/components` that `dist/Tabs.css`, `dist/Accordion.css`, `dist/Breadcrumbs.css` (or per-folder equivalents) are emitted.

### D-02 — Theming surface: brand/state only, prefixed `--hd-{component}-{role}`
Expose CSS custom properties ONLY for surfaces a consumer would realistically theme:
- Active / selected colors (e.g., `--hd-tabs-active-color`, `--hd-tabs-active-border`)
- Hover / focus state colors (e.g., `--hd-accordion-hover-bg`, `--hd-accordion-focus-ring`)
- Border / separator colors (e.g., `--hd-accordion-border`, `--hd-breadcrumbs-separator-color`)
- Text foreground/background brand colors (e.g., `--hd-breadcrumbs-link-color`, `--hd-breadcrumbs-link-hover-color`)

Layout/spacing values (padding, margin, gap, line-height) stay hardcoded in the `.css` file. Naming pattern: `--hd-{component}-{role}` where `{component}` is `tabs|accordion|breadcrumbs` and `{role}` describes the surface (`active-color`, `hover-bg`, `focus-ring`, `separator-color`, etc.). Each custom property MUST have a default value embedded in the `.css` rule via `var(--hd-tabs-active-color, #1d4ed8)` so the component renders correctly without consumer overrides.

**Rationale:** smaller theming API to maintain/document/version, lower risk of consumers breaking layout by overriding a structural token, and matches the ROADMAP success-criterion examples verbatim.

**Implementation note:**
- The exact list of custom properties per component is part of the planner's job — the planner reads the current Tailwind values and decides which become tokens vs hardcoded. Brand-state surface is the boundary, not a fixed list.
- Document the full custom-property API for each component in JSDoc at the top of the component file so consumers have a discoverable theming reference.
- **Defaults live in the `.css` file via `var()` syntax**, NOT as literal inline `style={{}}` props (clarified post-research, A1). Example: `color: var(--hd-tabs-active-color, #1d4ed8);` inside a `.css` rule. This preserves `:hover`/`:focus-visible` interactivity — inline-style defaults would always beat CSS rules via specificity and silently break STY-04 / WCAG 2.4.7.

### D-03 — Plan shape: 4 plans (3 component migrations in parallel after infrastructure)

**Plan 23-01 (Wave 1, no deps) — Infrastructure:**
- Migrate `package.json` tsup CLI to `tsup.config.ts`
- Configure tsup CSS pipeline (separate-file emit, no inject-style)
- Add `scripts/check-no-tailwind-leak.mjs` (or equivalent vitest test) — STY-05 regression guard
- Wire the guard into `npm run test:ci` (mirror Phase 22's `test:wcag-headers` pattern)
- Verification: `npm run build` still produces working dist; existing 18 test files / 292 tests still pass; STY-05 guard passes on the current tree (tree has Tailwind in source but no Tailwind classes leaking into `dist/**/*.{js,mjs}` because the source is JSX `className` strings that DO end up in dist — expect the guard to find them today and the count to drop after each component migration)

**Plan 23-02 (Wave 2, depends on 23-01) — Tabs migration:**
- Add `packages/components/src/Tabs/Tabs.css`
- Refactor `Tabs.tsx` to inline-style + side-effect CSS import + custom-property theming surface
- Update Tabs tests for `:focus-visible` style hook presence smoke test
- Verification: 16 existing Tabs tests still pass; 0 Tailwind utilities remain in `Tabs.tsx`'s `className=`; STY-05 guard count drops; visual sanity check via Storybook or manual

**Plan 23-03 (Wave 2, depends on 23-01) — Accordion migration:**
- Add `packages/components/src/Accordion/Accordion.css`
- Refactor `Accordion.tsx` (handles `:hover`, `transition-*`, conditional classes for `rotate-180`/`hidden`)
- Add minimal smoke tests for `:focus-visible` style hook (no full Accordion test suite — out of scope; Phase 24 may add full Tier 1+2)
- Verification: existing tests (if any) pass; 0 Tailwind in `Accordion.tsx`; STY-05 guard count drops

**Plan 23-04 (Wave 2, depends on 23-01) — Breadcrumbs migration:**
- Add `packages/components/src/Breadcrumbs/Breadcrumbs.css`
- Refactor `Breadcrumbs.tsx` (handles `:hover`, `:focus-visible`, `transition-*`, separator svg color)
- Add minimal smoke tests for `:focus-visible` style hook
- Verification: existing tests (if any) pass; 0 Tailwind in `Breadcrumbs.tsx`; STY-05 guard count drops

Plans 23-02, 23-03, 23-04 share NO files with each other and can run in parallel after 23-01 lands. Final wave-level state: STY-05 guard returns 0 matches across the entire `dist/`.

**Rationale:** smaller diffs per PR, easier review, atomic rollback per component, parallelism in execution. Mirrors Phase 22's wave structure success.

### D-04 — `:focus-visible` lives in `.css`, conditional state lives in inline `style`
Per STY-04's locked decision (rejecting JS event-handler `:focus-visible` workarounds), all pseudo-class styling (`:hover`, `:focus-visible`, `:active`) MUST live in the `.css` file. JS-driven conditional state (Accordion's `isOpen` toggling `rotate-180` / `hidden`) becomes inline `style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: isOpen ? 'block' : 'none' }}` — driven by React state, not pseudo-class.

**Implementation note:** a smoke test per migrated component MUST assert the `:focus-visible` selector appears in the corresponding `.css` content (read the file via `fs.readFileSync` and `.includes(':focus-visible')`) so a future refactor can't silently drop the keyboard-focus styling and pass tests.

### D-05 — STY-05 regression guard implementation
Implement as a Node script `packages/components/scripts/check-no-tailwind-leak.mjs` chained into `test:ci` (mirror the Phase 22 `check-wcag-headers.mjs` pattern). The script:
- Recursively reads ONLY the migrated component build outputs: `packages/components/dist/Tabs/**/*.{js,mjs}`, `dist/Accordion/**/*.{js,mjs}`, `dist/Breadcrumbs/**/*.{js,mjs}` (clarified post-research, A3 — NOT tree-wide)
- Greps for Tailwind utility patterns INSIDE `className:` or `className="..."` JSX-compiled output (NOT free-text matches — researcher empirically verified that tree-wide unscoped grep produced 901 false matches against current dist due to substring collisions with `font-family`, `grid-template`, `data-gap-id`, etc.). Recommended pattern shape: scope match to characters between `className:` or `className="` and the closing quote/brace.
- Exits non-zero with a clear offender list if any pattern matches
- Exits 0 if the 3 component dirs are clean

**Scope rationale:** other components (NavigationMenu, RadioGroup, Toast, Dialog, Modal, Select, etc.) still use Tailwind utility classes — STY-07 defers their migration to v0.7. A tree-wide guard would fail BOTH before Phase 23 (preventing the guard from ever being introduced) AND after Phase 23 (because non-Phase-23 components still leak). Scoping to the 3 migrated dirs lets the guard ship now and start enforcing on the components Phase 23 actually owns.

**Future-proofing:** when STY-07 eventually migrates the remaining 26 components, the guard script's allow-list of dirs is extended (or removed entirely once dist is fully Tailwind-free).

**Why a script not a vitest test:** the guard reads `dist/`, which only exists after `npm run build`. Wiring it as a vitest test would require building before testing in every CI run; a separate script makes the build→guard ordering explicit and matches Phase 22's pattern.

**Wire it in:** `"test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak"` and `"check:no-tailwind-leak": "node scripts/check-no-tailwind-leak.mjs"`. The guard can be skipped (with a clear message) if `dist/` doesn't exist yet, so `npm run test` (without `:ci`) doesn't require a build.

## Deferred Ideas

- **Migrate the remaining 26 components to inline-style + CSS** — STY-07 explicitly defers this to v0.7. Scope risk: the 3 components in Phase 23 are the Tailwind-using ones; the other 26 already use inline-style and don't need CSS extraction.
- **Spacing scale design tokens** (`--hd-space-1`, `--hd-space-2`, ...) — discussed and rejected. Adds a layer that doesn't exist today; revisit if Phase 24 widgets demand it or v0.7 introduces a broader token system.
- **Theming everything (colors + spacing + typography)** — discussed and rejected. Maintenance/documentation surface too large for v0.6 patch milestone; brand/state surface is the right scope.
- **`--inject-style` (CSS-in-JS) tsup option** — discussed and rejected. Inlining CSS into JS blocks consumer overrides via `:root` custom properties, prevents tree-shaking, and pollutes the JS bundle. Side-effect import + separate `.css` files is the bundler-friendly choice.
- **Storybook visual regression for the migrated components** — out of scope; blocked on upstream Storybook esbuild patch (recorded in STATE.md Blockers).
- **Real-browser axe-core run for layout-dependent rules** — PUB-07, deferred to v0.7+.

## Constraints

- 18 test files / 292 tests baseline (Phase 22 final state) must stay green
- 16 existing Tabs tests (Plan 22-09) must continue to pass after Tabs migration
- `:focus-visible` MUST live in `.css`, never JS event handlers (STY-04, WCAG 2.4.7)
- No API changes to component prop interfaces (ROADMAP success criterion #5: `className` stays a passthrough; `style` merges)
- `dist/` must contain ZERO Tailwind utility patterns after the migration (STY-05 guard enforces)
- SSR consumer (engine's `statement-generator.ts`) must continue to render `AccessibilityStatement` correctly — Phase 23 doesn't touch `AccessibilityStatement`, but the tsup pipeline change applies package-wide so verify the engine's report HTML renders cleanly after rebuild
- New `.css` files MUST be included in `package.json` exports map so consumers can deep-import them if their bundler doesn't follow side-effect imports automatically

## Success Criteria (from ROADMAP)

1. `Tabs.tsx`, `Accordion.tsx`, `Breadcrumbs.tsx` contain zero Tailwind utility class strings inside `className=`; each ships a co-located `.css` file imported as side-effect; tsup emits the CSS to `dist/`
2. Each component exposes a CSS custom-property theming surface with inline-style fallbacks (so default render is correct without consumer overrides)
3. `:focus-visible` styling preserved via `.css` (not JS); a smoke test in each component's test file asserts the `:focus-visible` style hook is present in the `.css`
4. STY-05 regression-guard greps `dist/**/*.{js,mjs}` for Tailwind utility patterns and fails the build if any leak through
5. `className` on each migrated component remains passthrough-only — all visual/layout class strings removed; consumer-supplied `className` and `style` merge with inline defaults so theming overrides work

## Next Steps

`/gsd-plan-phase 23` — produces 4 plans (23-01 infrastructure, 23-02..04 component migrations in parallel).

If `/gsd-ui-phase 23` would be valuable for this phase (component visual refactor with theming-API surface), consider running it before `/gsd-plan-phase 23` — but the migration is mostly mechanical (one-to-one Tailwind→CSS mapping with theming-API extraction), so plain `/gsd-plan-phase 23` is likely sufficient. The user will decide.
