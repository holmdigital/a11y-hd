# Phase 26 Discussion Log

**Date:** 2026-05-11
**Phase:** 26 — Publish Hygiene

## Areas Discussed

### Subpath require strategy (PUB-04)
**Question:** How should we close the subpath `require` gap?

**Options presented:**
- Add CJS `require` to all 29 subpaths (recommended)
- Mark package ESM-only via `"type": "module"`
- Hybrid (components ESM-only, standards + engine keep dual)

**User choice:** Add CJS `require` to all 29 subpaths

**Rationale:** maximum compatibility (React Server Components, Vite, webpack, Jest, Vitest, Node.js require() all work). tsup already emits both formats. One-time +30 LOC in package.json.

### LiveRegion TS2503 fix timing
**Question:** When should the LiveRegion fix land? It blocks the DTS build, which blocks attw, which blocks the verify pipeline.

**Options presented:**
- Plan 26-01 (recommended) — unblocks everything downstream
- Add `@types/node` devDependency
- Refactor LiveRegion to a different timeout pattern

**User choice:** Plan 26-01 first plan

**Rationale:** keystone of the phase. `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` is a one-line fix that works in both browser and Node lib contexts. Doesn't pull in Node types we don't need. Unblocks attw and the entire verify chain.

### Lucide-react fallback pattern (PUB-06)
**Question:** How should lucide-react become optional?

**Options presented:**
- Optional peerDep + try-import + text-glyph fallback (recommended)
- Optional peerDep + static import with try/catch
- Replace lucide entirely with inline SVG strings

**User choice:** Optional peerDep + try-import + text-glyph fallback

**Rationale:** bundle size shrinks for consumers who don't install lucide; text-glyph fallback is genuinely usable visual UI; async import handles install-time absence cleanly. The 4 consumer components (Checkbox, HelpText, Select, Toast) each get an init-time try-import with a React state to track resolution.

## Deferred Ideas

- PUB-07 real-browser axe-core (already v0.7+)
- PUB-08 visual regression (blocked on Storybook esbuild)
- Engine CLI bin smoke-test (future patch milestone if needed)
- Migrating to tsdown (out of scope)
- `packages/wordpress-plugin/` empty dir — ignored

## Claude's Discretion (not asked)

- **D-04 plan structure:** 5 plans (1 foundation + 3 parallel + 1 final gate). 26-01 unblocks everything; 26-02/03/04 share no source files; 26-05 is the verify-chain gate that exercises everything.
- **D-05 test additions:** ~4-8 new tests in Plan 26-04 for lucide fallback rendering; NO new test files. Existing 27/439 baseline preserved.
- **D-06 engine copy-assets ordering:** preserved as-is. `npm run build && check:exports && check:types && test:ci` chains run in the right order; copy-assets is part of the engine build script and runs first.
- Top-level await import pattern in components: planner picks between immediate-render-with-state-update vs lazy/Suspense after reading the 4 source files. Both work; one fits the existing codebase style better.
- check-no-test-leak.mjs implementation mirrors Phase 22 check-wcag-headers.mjs and Phase 23 check-no-tailwind-leak.mjs script-not-test pattern.
- `git rm --cached -r packages/standards/dist/` rather than file deletion — preserves working-tree dist files; only stops future tracking. Then add path-specific `.gitignore` entry.
