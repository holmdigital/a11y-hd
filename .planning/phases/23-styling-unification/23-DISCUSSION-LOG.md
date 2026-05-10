# Phase 23 Discussion Log

**Date:** 2026-05-10
**Phase:** 23 — Styling Unification

## Areas Discussed

### tsup CSS pipeline
**Question:** How should the tsup CSS pipeline be configured?

**Options presented:**
- Migrate CLI to `tsup.config.ts` (recommended)
- Add `--inject-style` flag to existing CLI
- Emit separate `.css` files via CLI flags

**User choice:** Migrate CLI to `tsup.config.ts`

**Rationale:** the current CLI invocation is unmaintainable (every component addition extends the line); a config file cleanly accommodates new CSS entries, future component additions, and Phase 26's `verify` pipeline. Default tsup behavior emits `.css` alongside `.js` — bundler-friendly side-effect import strategy.

### Theming token granularity
**Question:** How granular should the CSS custom-property theming surface be?

**Options presented:**
- Brand/state surface only (recommended)
- Everything theme-able
- Brand surface + spacing scale

**User choice:** Brand/state surface only

**Rationale:** smaller theming API to maintain/document/version, lower risk of consumers breaking layout by overriding a structural token, matches ROADMAP success-criterion examples verbatim. Naming pattern: `--hd-{component}-{role}`.

### Plan shape
**Question:** Should the migration ship as one plan or three (one per component)?

**Options presented:**
- Three plans, one per component (recommended) — actually 4 plans: 1 infra + 3 component migrations in parallel
- Single plan, all three components + guard
- Two plans — infrastructure first, then migration

**User choice:** Three plans, one per component (4 plans total: 23-01 infra, 23-02..04 component migrations in parallel after 23-01)

**Rationale:** smaller diffs per PR, easier review, atomic rollback per component, parallelism in execution (Tabs/Accordion/Breadcrumbs share no files). Mirrors Phase 22's wave structure success.

## Deferred Ideas

- Migrate remaining 26 components — STY-07, deferred to v0.7
- Spacing scale design tokens (`--hd-space-1`, ...) — adds a layer that doesn't exist today; revisit if v0.7 introduces broader token system
- Theming everything (colors + spacing + typography) — too large for v0.6 patch milestone
- `--inject-style` tsup option — inlining CSS into JS blocks consumer custom-property overrides, prevents tree-shaking
- Storybook visual regression — blocked on upstream esbuild patch
- Real-browser axe-core (PUB-07) — deferred to v0.7+

## Claude's Discretion (not asked)

- D-04: Pseudo-classes (`:hover`, `:focus-visible`, `:active`) and transitions live in `.css`; JS-driven conditional state (`isOpen`, `rotate-180`) becomes inline `style={{ transform: ..., display: ... }}`. This is the natural consequence of D-01 + STY-04 — not a separate decision worth interrupting the user for.
- D-05 implementation choice: STY-05 guard as a Node script (`scripts/check-no-tailwind-leak.mjs`) chained into `test:ci`, mirroring Phase 22's `check-wcag-headers.mjs` pattern. The ROADMAP suggested "regression-guard test in `src/index.test.ts`"; chose the script pattern instead because the guard reads `dist/` (post-build), and a vitest test would require building before every test run. Documented the deviation in CONTEXT.md.
- Smoke-test shape per component: read the `.css` file via `fs.readFileSync` and assert `.includes(':focus-visible')`. This is the cheapest way to satisfy STY-04 success criterion #3 without spinning up a full visual test rig.
- Custom-property API documentation: planner instructed to add JSDoc at the top of each component file listing the full theming-API surface so consumers have a discoverable reference.
- Plans 23-02..04 declared as parallel (no shared files among Tabs/Accordion/Breadcrumbs source dirs). 23-01 is the synchronization barrier.
