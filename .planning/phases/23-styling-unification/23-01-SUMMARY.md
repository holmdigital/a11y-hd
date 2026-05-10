---
phase: 23-styling-unification
plan: 01
subsystem: components-build
tags: [tsup, css-extraction, guard-script, sty-02, sty-05, wave-1]
requires:
  - Phase 22 final tree (master HEAD f2b5fd1)
provides:
  - tsup.config.ts (declarative build config replacing inline CLI)
  - sideEffects: ["**/*.css"] declaration
  - 3 CSS subpath exports (./Tabs.css, ./Accordion.css, ./Breadcrumbs.css)
  - check-no-tailwind-leak.mjs guard script (STY-05, scoped, layout-aware)
  - check:no-tailwind-leak npm script (NOT yet wired into test:ci)
affects:
  - Plans 23-02, 23-03, 23-04 (Wave 2 — Tabs, Accordion, Breadcrumbs migrations depend on this)
tech-stack:
  added: []
  patterns:
    - "Per-component CSS extraction via tsup (injectStyle: false)"
    - "Guard script scoped to migrated dirs (deny-list extension via SCOPED_DIRS array)"
key-files:
  created:
    - packages/components/tsup.config.ts
    - packages/components/scripts/check-no-tailwind-leak.mjs
  modified:
    - packages/components/package.json
decisions:
  - "CSS layout: NESTED (dist/<Name>/<Name>.css) — empirically detected by Task 1 smoke probe"
  - "Guard NOT yet wired into test:ci — bootstrap-deferred to Plan 23-04"
metrics:
  completed: 2026-05-10
  tasks: 3
  files_created: 2
  files_modified: 1
---

# Phase 23 Plan 01: Build Infrastructure & STY-05 Guard Summary

Migrated `@holmdigital/components` from a 30-entry inline `tsup` CLI invocation to a declarative `tsup.config.ts`, declared `sideEffects: ["**/*.css"]` for consumer bundler tree-shaking safety, consolidated all three CSS subpath exports (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) into the exports map upfront to eliminate Wave 2 parallel-write conflicts, and shipped a scoped `check-no-tailwind-leak.mjs` regression guard.

## CSS Layout Decision (LOAD-BEARING for Wave 2)

**Layout: NESTED**

The Task 1 smoke probe (temporary `src/_smoke/Smoke.{tsx,css}` added to tsup entries, built, observed, removed) confirmed that tsup emits CSS in a **nested** layout that mirrors the source-tree subdirectory:

- Source: `src/_smoke/Smoke.{tsx,css}` → emitted: `dist/_smoke/Smoke.{js,mjs,css}`
- Therefore for real components: `src/Tabs/Tabs.tsx` + `src/Tabs/Tabs.css` → `dist/Tabs/Tabs.{js,mjs,css}`

**Wave 2 executors (Plans 23-02, 23-03, 23-04) MUST use this layout** when:
- Writing the per-component `.css` source file (place at `packages/components/src/<Name>/<Name>.css`)
- Verifying the build output (look for `packages/components/dist/<Name>/<Name>.css`)
- Cross-checking `package.json` exports paths (already set to `./dist/<Name>/<Name>.css` shape)

The probe was cleaned up: `src/_smoke/` removed, `tsup.config.ts` contains zero `_smoke` references, `dist/_smoke/` removed (the empty stub directory left by `clean: true` mid-build was rmdir'd).

## Literal CSS Exports Paths (for Wave 2 cross-check)

The following entries were added to `packages/components/package.json` `exports` map:

```json
"./Tabs.css": "./dist/Tabs/Tabs.css",
"./Accordion.css": "./dist/Accordion/Accordion.css",
"./Breadcrumbs.css": "./dist/Breadcrumbs/Breadcrumbs.css"
```

String-form (not conditional-export objects) per publint guidance for plain-asset subpath exports.

## Tasks Completed

### Task 1 — tsup.config.ts migration + CSS-layout probe + 3 CSS exports
**Commit:** `b35887c`

- Created `packages/components/tsup.config.ts` with the 30-entry list (29 components + `src/index.ts`), `format: ['cjs', 'esm']`, `dts: true`, `clean: true`, `external: ['react', 'react-dom', '@holmdigital/standards']`, `injectStyle: false` (explicit), `loader: { '.css': 'css' }` (explicit).
- `package.json`: collapsed `"build"` to `"tsup"`, `"dev"` to `"tsup --watch"`, added `"sideEffects": ["**/*.css"]` at top level (sibling of `main`/`module`).
- Smoke probe ran cleanly; layout decision recorded above.
- Added the 3 CSS subpath exports adjacent to their JS-subpath siblings in alphabetical order.

### Task 2 — STY-05 guard script (scoped, NOT yet wired into test:ci)
**Commit:** `3e73005`

- Created `packages/components/scripts/check-no-tailwind-leak.mjs`.
- Mirrors `check-wcag-headers.mjs` shape: shebang + JSDoc header + Windows-safe path resolution (`new URL(...).pathname.replace(...)` pattern).
- `SCOPED_DIRS = ['Tabs', 'Accordion', 'Breadcrumbs']` (deny-list per A3 / D-05; STY-07 extension instructions documented in header).
- `TAILWIND_PATTERN` covers all utilities used in current components: `flex`, `grid`, `text-slate`, `bg-white`, `bg-slate`, `hover:*`, `focus:*`, `focus-visible:*`, `ring-*`, `rounded-*`, `border-slate`, `border-primary`, `space-y-*`, `gap-*`, `px-*`, `py-*`, `mx-*`, `my-*`, `leading-*`, `font-*`. Bound by `\b` word boundaries.
- `CLASSNAME_CTX` regex: `/className\s*[:=]\s*(['"\`])([\s\S]*?)\1/g` — scopes Tailwind matches to `className: "..."` and `className="..."` contexts only (suppresses tree-wide false positives).
- Layout-aware: `filesForComponent(name)` checks both nested (`dist/<name>/*.{js,mjs}`) and flat (`dist/<name>.{js,mjs}`) shapes. Currently only the nested branch fires.
- Skip behavior verified: with `dist/` absent, exits 0 with `[check-no-tailwind-leak] skipped — dist/ not built. Run \`npm run build\` first.`
- `npm run check:no-tailwind-leak` exits 1 with **15 leaks** in the unmigrated tree (4 in Tabs, 5 in Accordion, 6 in Breadcrumbs) — exactly the expected pre-migration state. Plans 23-02..04 will each drive their dir's count to 0.
- `test:ci` script LEFT UNCHANGED at `"vitest run && npm run test:wcag-headers"` — wire-in deferred to Plan 23-04 per bootstrap rationale (D-05).

### Task 3 — Verification (no file modifications)

| Check | Result |
|-------|--------|
| `npx vitest run` (components) | **PASS** — 19 test files, 294 tests, all green |
| `npm run test:wcag-headers` (components) | **PASS** — 15 test files all carry the WCAG SC marker |
| `npm run check:no-tailwind-leak` (components) | **EXIT 1** with 15 offenders (expected pre-migration state) |
| `npm run check:no-tailwind-leak` with no `dist/` | **EXIT 0** with skipped message (verified by temp dist mv/restore) |
| `npm run build -w @holmdigital/components` (CJS/ESM) | **PASS** for CJS+ESM emission; DTS step fails on **pre-existing** LiveRegion.tsx:37 TS2503 (per plan context — DEFERRED, NOT a regression) |

## Engine SSR Smoke Check

`npm run build -w @holmdigital/engine` fails with `TS2724: '"@holmdigital/components"' has no exported member named 'AccessibilityStatementProps'`.

**This is PRE-EXISTING at f2b5fd1, NOT a regression introduced by this plan.** Verified by temporarily checking out the f2b5fd1 `package.json` and re-running both builds — components DTS step also failed there (LiveRegion error), and the engine build also fails downstream because no `.d.ts` files are emitted for components when DTS halts. Same root cause both before and after this plan: pre-existing `LiveRegion.tsx:37` TS2503 in the components DTS pipeline. Plan context explicitly directed: **"Do NOT auto-fix this."**

The engine's CJS/ESM compilation (the actual JS code) is unaffected — only its DTS step trips on the missing type re-export. Engine runtime behavior, tests, and published JS were not touched by this plan.

## Deviations from Plan

### Auto-fixed Issues

None. Plan executed exactly as written.

### Notes / Observations

1. **`tsup` `clean: true` artifact:** The probe build leaves `dist/_smoke/` as an empty directory after the source files are deleted and rebuild runs (because `clean: true` purges contents but `dist/_smoke` was created by the next post-clean build only if entries reference it; subsequent rebuild without the entry leaves the prior empty subdir if it exists). I rmdir'd the empty leftover after the post-cleanup rebuild. Final state confirmed: no `_smoke` anywhere on disk.

2. **vitest `--reporter=basic` not supported in vitest 4.x:** The plan's verification command suggested `--reporter=basic` but vitest 4.x dropped this reporter name. Used the default reporter — same 19/294 result.

3. **Engine build was already broken at f2b5fd1** (not noted in plan context, but confirmed by checkout). The plan-provided assumption that "engine doesn't import LiveRegion, so engine build should succeed independently" was inaccurate — engine imports `AccessibilityStatementProps` which lives in `.d.ts` files that aren't emitted because the DTS pipeline halts on LiveRegion. Same failure mode pre- and post-this-plan.

## Tsup CSS-loader / DTS Interaction Warnings

None. The CJS/ESM builds emit CSS cleanly (verified by smoke probe `dist/_smoke/Smoke.css`). The DTS failure is unrelated to CSS — it's the LiveRegion TS2503.

## Note for Plan 23-04

When Plan 23-04 wires the guard into `test:ci`, the resulting line should be:

```json
"test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak"
```

Per RESEARCH.md final example. By that point, Plans 23-02..04 should have driven all 15 current offenders to 0.

## Self-Check: PASSED

- `packages/components/tsup.config.ts` exists — FOUND
- `packages/components/scripts/check-no-tailwind-leak.mjs` exists — FOUND
- `packages/components/package.json` has `"./Tabs.css"` export — FOUND
- `packages/components/package.json` has `"./Accordion.css"` export — FOUND
- `packages/components/package.json` has `"./Breadcrumbs.css"` export — FOUND
- `packages/components/package.json` has `"sideEffects": ["**/*.css"]` — FOUND
- `packages/components/package.json` has `"build": "tsup"` — FOUND
- Commit `b35887c` (Task 1) — FOUND in git log
- Commit `3e73005` (Task 2) — FOUND in git log
- `src/_smoke/` cleanup verified — no source remnants, no dist remnants
