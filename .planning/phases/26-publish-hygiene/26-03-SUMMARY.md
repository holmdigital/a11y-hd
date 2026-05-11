---
phase: 26-publish-hygiene
plan: 03
subsystem: packaging
tags: [packaging, exports, publint, cjs, esm]
requires: [26-01]
provides: ["publint-strict subpath-export readiness for components + engine"]
affects:
  - packages/components/package.json
  - packages/engine/package.json
tech_stack:
  added: []
  patterns:
    - "Conditional exports with types -> import -> require ordering (CLAUDE.md rule)"
key_files:
  created: []
  modified:
    - packages/components/package.json
    - packages/engine/package.json
decisions:
  - "Components: added require field to all 29 conditional subpaths; the 3 CSS plain-string subpaths (./Tabs.css, ./Accordion.css, ./Breadcrumbs.css) remain plain strings (publint accepts string asset mappings)."
  - "Engine ./cli: converted plain-string CJS reference to conditional shape; bin.hd-a11y-scan stays on CJS .js for shebang compatibility (Node's binary launcher does not consult exports)."
  - "Standards .: verified already correct (types/import/require trio present); no edit required, per researcher Open Q #1."
metrics:
  duration_seconds: 1756
  duration_human: "~29 minutes (includes one-time npm install ~2 min)"
  tasks_completed: 2
  files_modified: 2
  completed_date: "2026-05-11"
requirements_completed:
  - PUB-04
---

# Phase 26 Plan 03: Subpath require fields + engine ./cli conditional — Summary

Closed the `publint --strict` subpath-export gap by adding `require` fields to all 29 component subpath exports and converting engine's `./cli` from a plain-string CJS reference to the conditional `types`/`import`/`require` shape. Standards verified as already correct.

## What Changed

### Task 1: 29 component subpaths gained `require` field
**File:** `packages/components/package.json`
**Commit:** `479cdf8`

Sample (first / last by file order):
- `./Button` → `require: "./dist/Button/Button.js"`
- `./Breadcrumbs` → `require: "./dist/Breadcrumbs/Breadcrumbs.js"`

All 29 conditional exports now follow the order `types` → `import` → `require`. The 3 CSS plain-string subpaths (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) and the root `.` export are unchanged.

Net: +58 / −29 lines.

### Task 2: Engine `./cli` converted to conditional shape
**File:** `packages/engine/package.json`
**Commit:** `d24b16f`

Before:
```json
"./cli": "./dist/cli/index.js"
```

After:
```json
"./cli": {
    "types": "./dist/cli/index.d.ts",
    "import": "./dist/cli/index.mjs",
    "require": "./dist/cli/index.js"
}
```

`bin.hd-a11y-scan` retained: `"./dist/cli/index.js"` (unchanged — Node's binary launcher does not consult `exports`, and CJS is faster on CLI cold start than the ESM loader).

### Standards: no edit required
`packages/standards/package.json` `.` export already exposes the correct trio:
```json
"./": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
}
```
The data/schema subpath entries are intentional plain-string mappings (raw assets, not modules). No change applied — matches researcher Area 1 finding.

## Build Verification

Both builds succeeded after the package.json edits, and all referenced files exist on disk:

```
packages/components/dist/Button/Button.js          (exists)
packages/components/dist/Breadcrumbs/Breadcrumbs.js (exists)
... (all 29 verified by automated script)
packages/engine/dist/cli/index.js                  (exists)
packages/engine/dist/cli/index.mjs                 (exists)
packages/engine/dist/cli/index.d.ts                (exists)
```

Automated component check:
```
ok: all 29 subpaths have correctly ordered require + file exists
```

Automated engine check:
```
ok: ./cli conditional, all 3 files exist, bin preserved
```

End-to-end ordering check across all 30 conditional exports in components:
```
ok: all 30 conditional exports types,import,require
```
(30 = 29 component subpaths + the `.` root export, all consistent.)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ran `npm install` because worktree had no node_modules**
- **Found during:** Task 2 verification (`npm run build -w @holmdigital/engine`)
- **Issue:** Engine DTS build failed with `TS2307: Cannot find module 'puppeteer'`. The worktree fork from `cc743da` carried no `node_modules/` for any package. Components Task 1 happened to build via cached tsup binary and minimal dependency footprint, but engine's `puppeteer` import in `regulatory-scanner.ts` could not resolve without an install.
- **Fix:** Ran `npm install --no-audit --no-fund` at the workspace root once. Build succeeded immediately afterward.
- **Files modified:** None tracked (only `node_modules/` and `package-lock.json` — `package-lock.json` was unchanged since the lockfile already matched, no commit needed).
- **Commit:** Not applicable (environment setup, no tracked files modified).

### Authentication Gates
None.

### Architectural changes
None.

## Files / Commits

| Task | Description                                | Commit  | Files                              |
| ---- | ------------------------------------------ | ------- | ---------------------------------- |
| 1    | 29 component subpaths gain `require` field | 479cdf8 | packages/components/package.json   |
| 2    | Engine `./cli` → conditional shape         | d24b16f | packages/engine/package.json       |

## Known Stubs
None. No source code or runtime data touched.

## Success Criteria Confirmation
- [x] 29 component subpath exports each carry the trio `types` → `import` → `require`.
- [x] All referenced `.js` files exist after `npm run build -w @holmdigital/components`.
- [x] Engine `./cli` is conditional with the same trio; `bin.hd-a11y-scan` unchanged.
- [x] Standards verified-as-correct (no edit).
- [x] No source code changes. No new files. No tests added (per D-05).
- [x] Plan 26-05's `publint --strict` will pass for all three packages on the subpath dimension.

## Self-Check: PASSED

- FOUND: `packages/components/package.json` (modified)
- FOUND: `packages/engine/package.json` (modified)
- FOUND commit: `479cdf8` (Task 1)
- FOUND commit: `d24b16f` (Task 2)
- FOUND file: `packages/components/dist/Button/Button.js`
- FOUND file: `packages/engine/dist/cli/index.mjs`
- FOUND file: `packages/engine/dist/cli/index.js`
- FOUND file: `packages/engine/dist/cli/index.d.ts`
