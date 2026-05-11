---
phase: 26
phase_name: Publish Hygiene
date: 2026-05-11
requirements: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
---

# Phase 26 Context

## Domain

Gate `npm publish` for all 3 packages (`@holmdigital/standards`, `@holmdigital/components`, `@holmdigital/engine`) behind a unified `verify` pipeline (build + tests + type-check + publint + attw). Eliminate committed `dist/` as a drift source. Close the subpath `require` export gap publint flags. Prevent test code from leaking into shipped `dist/`. Move `lucide-react` from hard runtime dependency to optional `peerDependencies` with text-glyph fallbacks. Finally, fix the long-deferred `LiveRegion.tsx:37` TS2503 that's been blocking the DTS build since Phase 22 — this fix is the keystone that unblocks the entire `verify` chain.

This is the last phase of milestone v0.6 Components Quality.

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 26 goal + 5 success criteria
- `.planning/REQUIREMENTS.md` — PUB-01..06; deferred-items section listing v0.7 backlog
- `.planning/PROJECT.md` — milestone v0.6 scope; "Dist policy: stop committing `packages/*/dist/`" locked decision
- `.planning/phases/22-test-infra-and-first-7-components/deferred-items.md` — LiveRegion TS2503 documented since Phase 22
- `.planning/phases/23-styling-unification/23-CONTEXT.md` — tsup.config.ts pattern + sideEffects + CSS subpath exports (already in components/package.json from Phase 23)
- `packages/standards/package.json` — current state: tsup CLI build, no publint/attw/verify scripts
- `packages/components/package.json` — current state: tsup.config.ts (Phase 23), 29 component subpath exports with ONLY `types` + `import` (no `require`)
- `packages/engine/package.json` — current state: tsup + `node scripts/copy-assets.mjs`, has `bin` entry (`hd-a11y-scan` CLI)
- `packages/components/src/LiveRegion/LiveRegion.tsx:37` — pre-existing TS2503 (`NodeJS.Timeout` not in lib types)
- `packages/components/tsup.config.ts` — created in Phase 23; currently has fixed entry list (will become glob in PUB-05)
- `packages/components/src/{Checkbox,HelpText,Select,Toast}/*.tsx` — 4 components that import from `lucide-react`
- publint docs: https://publint.dev/rules
- attw (`@arethetypeswrong/cli`): https://www.npmjs.com/package/@arethetypeswrong/cli

## Code Context

**Build pipeline today (after Phase 23):**
- `packages/components/`: `tsup.config.ts` (config-file form); entries are an explicit 30-item list; CSS pipeline emits `dist/{Tabs,Accordion,Breadcrumbs}/X.css`; `sideEffects: ["**/*.css"]` declared
- `packages/standards/`: CLI invocation `tsup src/index.ts --format cjs,esm --dts --clean` (single entry; no config file)
- `packages/engine/`: CLI invocation `tsup && node scripts/copy-assets.mjs`; bin entry `"hd-a11y-scan": "./dist/cli.js"`; has tsup.config.ts

**Dist tracking state:**
- `packages/standards/dist/` IS tracked in git (4 files: `index.d.ts`, `index.d.mts`, `index.js`, `index.mjs`). Drift visible in earlier `git status` snapshots throughout this session.
- `packages/components/dist/` and `packages/engine/dist/` are already gitignored (via repo-root `.gitignore` line `dist/`)
- Standards is the outlier — needs `git rm --cached -r packages/standards/dist` plus a path-specific exclusion in `.gitignore`

**LiveRegion.tsx:37 TS2503 (long-deferred):**
```ts
const timeoutRef = useRef<NodeJS.Timeout>();
```
This compiles at runtime (jsdom + Node both define `Timeout`) but fails `tsc --noEmit` strict-mode type-check because `NodeJS` namespace isn't in `lib: ['dom', 'esnext']`. tsup's DTS step fails on this. Currently 5 LiveRegion tests pass, build CJS+ESM succeeds, only DTS fails. Phase 26 MUST fix this — the `verify` chain depends on `attw --pack .` which depends on a complete dist including `.d.ts` files.

**Lucide-react usage (4 components):**
- `Checkbox.tsx`: probably `Check` icon for checked state
- `HelpText.tsx`: probably `Info` icon
- `Select.tsx`: probably `ChevronDown` icon
- `Toast.tsx`: probably `AlertCircle` / `CheckCircle` / `XCircle` per variant
Will be confirmed by planner reading each source file.

**Subpath exports state (`packages/components/package.json`):**
29 component subpath exports, each shaped as:
```json
"./Button": {
  "types": "./dist/Button/Button.d.ts",
  "import": "./dist/Button/Button.mjs"
}
```
Missing `require: "./dist/Button/Button.js"`. publint --strict flags every one of them.

**Test baseline post-Phase-24:**
- 27 test files / 439 tests in `@holmdigital/components` — must stay green
- WCAG-SC marker: 23 files
- STY-05 check-no-tailwind-leak: clean
- Other packages: standards has its own vitest suite (16 countries × inForce + EAA microbusiness + REHAB tests); engine has scattered test fixtures

## Decisions

### D-01 — LiveRegion TS2503 fix lands FIRST (Plan 26-01)

The fix is the keystone of the entire phase: `attw --pack .` requires a complete dist (including `.d.ts`), and the current DTS build fails on this single line. Change `useRef<NodeJS.Timeout>()` → `useRef<ReturnType<typeof setTimeout>>()` in `packages/components/src/LiveRegion/LiveRegion.tsx:37`. The new type works in both browser and Node lib contexts (matches the runtime `setTimeout` return type wherever the code runs), so no `@types/node` dependency is added. All 5 LiveRegion tests must continue to pass — verify with `npx vitest run src/LiveRegion`.

**Rationale:** smallest possible fix that unblocks the entire pipeline. `@types/node` would pull in Node's whole type surface for a one-line need. Refactoring the timeout pattern entirely is out of scope.

**Side effects:**
- Removes the deferred-items.md entry for LiveRegion.tsx:37
- `npm run build -w @holmdigital/components` will succeed end-to-end (DTS phase no longer fails)
- Phase 24 deferred-items.md entry is closed inline

### D-02 — Subpath `require` strategy: add CJS `require` to all 29 component subpaths (PUB-04)

Each of the 29 component subpaths gets a `require` field pointing to the CJS bundle:
```json
"./Button": {
  "types": "./dist/Button/Button.d.ts",
  "import": "./dist/Button/Button.mjs",
  "require": "./dist/Button/Button.js"
}
```

The 3 CSS subpath exports (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) stay as plain string mappings — they don't need conditional exports.

**Rationale:** maximum consumer compatibility. tsup already emits both `.js` (CJS) and `.mjs` (ESM). React Server Components, Vite, webpack, Jest, Vitest, Node.js require() consumers all work. Larger package.json (~30 extra lines) is a one-time cost.

**Order in exports map:** publint requires `types` FIRST, then `import`, then `require`. CLAUDE.md already documents this rule for the project. The planner enforces ordering when applying the edit across all 29 subpaths.

### D-03 — `lucide-react` becomes optional peerDep with try-import + text-glyph fallback (PUB-06)

Move from `dependencies` → `peerDependencies` + `peerDependenciesMeta` flagging it optional. Each of the 4 consumer components (Checkbox, HelpText, Select, Toast) attempts an async import at module init; if it throws or returns undefined, the component renders a text-glyph fallback. Patterns:

```tsx
// Pattern: per-component
let LucideIcon: React.ComponentType<{ className?: string; size?: number }> | null = null;
try {
  // dynamic import; webpack/Vite treat this as code-splittable but synchronous-ish for top-level
  const lucide = await import('lucide-react');
  LucideIcon = lucide.ChevronDown; // or whichever icon
} catch {
  LucideIcon = null;
}
```

Components render `LucideIcon` if non-null, else a span with the appropriate text glyph (`▾`, `⚠`, `ℹ`, `✓`, `✗`). The text glyphs are visually accessible AND screen-reader-detectable; aria-hidden on the lucide icon (current pattern) extends to the text-glyph fallback.

**README documentation:** add a "Optional dependencies" section explaining that installing `lucide-react` enables Lucide icons; without it, components render text glyphs.

**Rationale:** matches user preference; bundle size shrinks for consumers who don't install lucide; the fallback is genuinely usable (text glyphs are valid visual UI). Async import handles install-time absence cleanly.

**Concern:** top-level `await import()` in module init is async — components that render before the import resolves should fall back to text-glyph in the meantime. Use React state + useEffect to track import resolution, OR use lazy/Suspense pattern. The planner picks the cleanest version after reading the 4 source files.

### D-04 — Plan structure: 5 plans with mixed sequencing

- **Plan 26-01 (Wave 1, no deps) — Foundation: LiveRegion fix + standards/dist untracking + `.gitignore` cleanup**
  - Fix `LiveRegion.tsx:37` type (D-01)
  - `git rm --cached -r packages/standards/dist/` 
  - Add `packages/*/dist/` glob to repo-root `.gitignore` (currently has `dist/` only; tighten to be explicit per-package per ROADMAP success criterion #2)
  - Remove `packages/components/.planning/phases/22-test-infra-and-first-7-components/deferred-items.md` LiveRegion entry (now resolved)
  - Verification: `npm run build -w @holmdigital/components` succeeds end-to-end (no DTS failure); all 439 tests still pass; `git status` shows standards/dist no longer tracked

- **Plan 26-02 (Wave 2, depends_on: [26-01]) — tsup glob entries + test-code dist guard (PUB-05)**
  - Components: convert `tsup.config.ts` entries from explicit 30-item list to glob `['src/index.ts', 'src/*/!(*.test|*.stories).{ts,tsx}']`. Verify dist output is identical (same files produced).
  - Standards + engine: review entries (probably already single-entry, no change needed)
  - Add `packages/components/scripts/check-no-test-leak.mjs` (mirror Phase 22 / Phase 23 guard script pattern). Greps `dist/**/*.{js,mjs}` for `vitest`, `@testing-library`, `describe(`, `it(`. Exits non-zero with offender list if matches found.
  - Wire into `test:ci`: `vitest run && test:wcag-headers && check:no-tailwind-leak && check:no-test-leak`
  - Verification: glob entries produce same dist file set; new guard exits 0 against current clean dist; full test:ci passes
  - **Bootstrap concern:** if any test code currently leaks (unlikely given current entry list excludes test files), the guard fails CI immediately. Verify clean BEFORE wiring into test:ci.

- **Plan 26-03 (Wave 2, depends_on: [26-01]) — Subpath `require` for 29 components (PUB-04)**
  - Add `require: "./dist/X/X.js"` to all 29 component subpath exports in `packages/components/package.json`
  - Preserve ordering: `types` → `import` → `require`
  - Standards + engine main entries: verify they already have `types`/`import`/`require` (likely fine)
  - Verification: tsup build still emits matching `.js` and `.mjs` files at the declared paths

- **Plan 26-04 (Wave 2, depends_on: [26-01]) — lucide-react peer dep + fallbacks (PUB-06)**
  - Move `lucide-react` in `packages/components/package.json`: `dependencies` → `peerDependencies` + `peerDependenciesMeta`
  - Refactor 4 components (Checkbox, HelpText, Select, Toast) to use the optional-peer + text-glyph fallback pattern per D-03
  - Update README with "Optional dependencies" section
  - Add fallback-rendering smoke tests to the 4 components' test files (assert text glyph renders when lucide stub returns null/undefined — use vitest module mock)
  - Verification: tests pass with AND without lucide-react installed (verify with `npm uninstall lucide-react -w @holmdigital/components` then `npx vitest run`); 27/439 tests preserved + ~4-8 new fallback tests

- **Plan 26-05 (Wave 3, depends_on: [26-01, 26-02, 26-03, 26-04]) — publint + attw + `verify` + `prepublishOnly` in all 3 packages (PUB-01, PUB-02)**
  - Install `publint` and `@arethetypeswrong/cli` as devDeps at repo root (workspace-shared)
  - Add to each of the 3 packages' `package.json`:
    - `"check:exports": "publint --strict"`
    - `"check:types": "attw --pack ."`
    - `"verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci"`
    - `"prepublishOnly": "npm run verify"`
  - Each package's `verify` script must exit 0 with all preceding Phase 26 plans landed
  - Verification: `npm run verify -w @holmdigital/components` exits 0; same for `-w @holmdigital/standards` and `-w @holmdigital/engine`; trying `npm publish --dry-run` runs the `prepublishOnly` hook

Plans 26-02, 26-03, 26-04 share NO source files (different dirs / different package.json sections). 26-05 is the final gate that exercises all the prior work.

### D-05 — Test additions per plan

- Plan 26-01 adds NO tests (fix is a one-line type change verified by existing 5 LiveRegion tests)
- Plan 26-02 adds `check-no-test-leak.mjs` as a script, not a vitest test (mirrors Phase 22 / Phase 23 script-not-test pattern). No new `*.test.tsx` files.
- Plan 26-03 adds NO tests (config-only change)
- Plan 26-04 adds ~4-8 fallback-rendering smoke tests to existing Checkbox/HelpText/Select/Toast test files (with WCAG-SC marker + D-02a clean). These tests assert text-glyph rendering when lucide stub is null. May need a vitest module mock (`vi.mock('lucide-react', () => ({}))`).
- Plan 26-05 adds NO tests (script-wiring change)

After Phase 26: 27 test files / ~443-447 tests (no new test files; only +4-8 tests in existing files).

### D-06 — Engine `copy-assets.mjs` interaction

Engine has a custom build step `node scripts/copy-assets.mjs` chained after tsup. This currently sits in the engine `build` script:
```json
"build": "tsup && node scripts/copy-assets.mjs"
```

Plan 26-05's `verify` script chains `npm run build` first, so `copy-assets.mjs` runs before `check:exports` (publint) and `check:types` (attw). publint and attw need the full dist (including copied assets), so this ordering is correct. The planner does NOT change the engine build script.

## Deferred Ideas

- **PUB-07** real-browser axe-core run (already deferred to v0.7+)
- **PUB-08** automated visual regression (blocked on Storybook esbuild patch, deferred)
- **Engine CLI shipped binary verification** — ensure `hd-a11y-scan` resolves correctly after publish (smoke-test the bin via `npm pack` + `npm install ./pack.tgz` in a temp dir). Out of Phase 26 scope; can be added to `verify` in a future patch milestone if needed.
- **Switching to tsdown** (tsup's successor, flagged during Phase 23 research) — out of scope; tsup works for Phase 26's needs.
- **`packages/wordpress-plugin/`** — empty directory in the repo; not a Node package, no package.json. Phase 26 ignores it entirely. If it becomes a real package later, it would need its own verify chain.

## Constraints

- 27 test files / 439 tests baseline (post-Phase-24) must stay green
- All 5 LiveRegion tests must continue to pass after D-01 fix
- No new test files (D-05); only ~4-8 new tests added to existing files in Plan 26-04
- `packages/components/dist/` must NOT contain Tailwind utility patterns (STY-05 guard from Phase 23 stays in effect)
- `package.json` exports map ordering: `types` → `import` → `require` (CLAUDE.md rule)
- No source modifications to the 30+ components beyond:
  - LiveRegion (D-01 one-line fix)
  - Checkbox, HelpText, Select, Toast (Plan 26-04 lucide refactor)
- Engine `bin` field MUST continue to work post-Phase-26 (hd-a11y-scan CLI is a public surface)
- `prepublishOnly` MUST gate all 3 packages — `npm publish` from a non-clean state fails
- `packages/*/dist/` must end up gitignored (including standards which is currently tracked)
- The dist-tracking removal MUST be done via `git rm --cached -r` (preserves working-tree files; only stops future tracking)

## Success Criteria (from ROADMAP)

1. `package.json` in all 3 packages: `check:exports`, `check:types`, `verify`, `prepublishOnly` all defined and chained correctly. `npm publish` fails if any verify step fails.
2. `packages/*/dist/` gitignored; standards dist drift resolved (`git rm --cached`); CI builds dist from clean tree before publish.
3. 29 component subpath exports expose `require` field (per D-02) — publint --strict passes.
4. tsup entry config uses glob exclusion; CI guard greps `dist/**` for test-code patterns; build fails if leak.
5. lucide-react in `peerDependencies` + `peerDependenciesMeta.optional: true`; 4 consumer components fall back to text glyphs; README documents the fallback.

## Next Steps

`/gsd-plan-phase 26` — produces 5 plans (1 foundation + 3 parallel + 1 final gate). Researcher likely useful for publint/attw best practices and the exact `peerDependenciesMeta` syntax interactions.
