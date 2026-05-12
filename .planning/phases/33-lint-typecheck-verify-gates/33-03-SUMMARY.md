---
phase: 33-lint-typecheck-verify-gates
plan: 03
subsystem: components
tags: [lint, typecheck, verify-gate, pub-09, dx]
requires: [33-01, 33-02]
provides:
  - "components verify chain gates on lint + typecheck"
  - "components package tsc --noEmit clean (27 + 5 absorbed errors resolved)"
  - "eslint-plugin-react-hooks installed at monorepo root (exhaustive-deps only)"
affects: [packages/components/package.json, packages/components/tsconfig.json, eslint.config.mjs, package.json, package-lock.json]
tech-stack:
  added: [eslint-plugin-react-hooks@7.1.1, "@types/node@^22.10.2 (components devDep)"]
  patterns: ["TS-only React namespace import (`import type React from 'react'`)", "MutableRefObject cast for ref.current writes", "narrow rule registration over full plugin recommended sets"]
key-files:
  modified:
    - packages/components/package.json
    - packages/components/tsconfig.json
    - packages/components/src/_test/setup.ts
    - packages/components/src/_i18n/live-region-strings.ts
    - packages/components/src/_test/helpers/expectKeyboardSequence.test.ts
    - packages/components/src/Button/Button.test.tsx
    - packages/components/src/Checkbox/Checkbox.test.tsx
    - packages/components/src/FormField/FormField.test.tsx
    - packages/components/src/Heading/Heading.test.tsx
    - packages/components/src/RadioGroup/RadioGroup.test.tsx
    - packages/components/src/SkipLink/SkipLink.test.tsx
    - packages/components/src/Breadcrumbs/Breadcrumbs.test.tsx
    - packages/components/src/DatePicker/DatePicker.tsx
    - packages/components/src/Dialog/Dialog.test.tsx
    - packages/components/src/Modal/Modal.test.tsx
    - packages/components/src/NavigationMenu/NavigationMenu.test.tsx
    - eslint.config.mjs
    - package.json
    - package-lock.json
decisions:
  - "Route A1 preserved (devDep install) AND minimal A2 applied (tsconfig types += 'node') — preflight showed __dirname + node globals were not resolving through plain module resolution alone"
  - "Cat C ref.current fix expanded from 2 → 8 files (preflight grep surfaced template-setter pattern across Phase 22 suite)"
  - "MutableRefObject cast chosen over line deletion (semantics-preserving, supports future ref.current reads)"
  - "react-hooks plugin registered with exhaustive-deps rule ONLY (full recommended set surfaces 18 pre-existing react-compiler violations out of Phase 33 scope)"
  - "5 pre-existing lint errors absorbed into Phase 33 scope (lint wasn't part of verify pre-Phase-33; errors lived dormant on master)"
metrics:
  completed: 2026-05-12
---

# Phase 33 Plan 03: Components verify chain — lint + typecheck gates wired

**One-liner:** Wire `lint` + `typecheck` into `@holmdigital/components` `verify` script; resolve all 27 pre-existing tsc errors across 5 categories + 5 absorbed lint errors (React namespace + react-hooks plugin gap).

## What changed

### Category A — `@types/node` (Route A1 + minimal A2)
- `packages/components/package.json`: added `"@types/node": "^22.10.2"` to devDeps (Route A1, matching engine + standards convention).
- `packages/components/tsconfig.json`: `types` array gained `"node"` entry. **Route A1 was locked at plan time, but preflight tsc showed `__dirname` and node globals still unresolved without the explicit `types` entry.** This is a Rule 4 architectural correction documented inline — Route A1 INTENT preserved (devDep install is the source of truth; the `types` array now references it). Minimal A2 overlay applied to make resolution work.

### Category B — vitest-axe matcher augmentation
`packages/components/src/_test/setup.ts` now contains:
```ts
declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> {
        toHaveNoViolations(): T;
    }
    interface AsymmetricMatchersContaining {
        toHaveNoViolations(): unknown;
    }
}
```
(The `<T = any>` default mirrors the underlying chai-style matcher signature; with `<T = unknown>` the typecheck flagged a default-parameter incompatibility downstream.)

### Category C — `ref.current` readonly assignment (expanded 2 → 8 files)
Preflight grep surfaced the same template-setter `ref.current = node` pattern across the Phase 22 colocated test tree, not just the 2 files flagged by the plan. All 8 fixed with `MutableRefObject` cast (semantics-preserving):

```ts
(ref as MutableRefObject<HTML*Element | null>).current = node;
```

Files: Button, Checkbox, FormField, Heading, RadioGroup, SkipLink, plus the `_test/helpers/expectKeyboardSequence` helper site.

### Category D — Unused `@ts-expect-error`
Removed at `_test/helpers/expectKeyboardSequence.test.ts:28`.

### Category E — `LiveRegionLocale` narrowing
Both lines 141 and 164 of `src/_i18n/live-region-strings.ts`:
```ts
const canonical: LiveRegionLocale =
    (locale ? LOCALE_ALIASES[locale] : undefined) ?? 'en';
```

### Verify chain rewired
`packages/components/package.json`:
```
"typecheck": "tsc --noEmit",
"verify": "npm run build && npm run lint && npm run typecheck && npm run check:exports && npm run check:types && npm run test:ci"
```
`prepublishOnly` unchanged (still `npm run verify`).

## Pre-existing lint debt absorbed

When verify started running lint, 5 dormant errors surfaced — they lived on master but had never been exercised because lint wasn't part of any gate. Per Phase 33's stated mission ("verify exit 0 with lint + typecheck wired in") these errors belong to PUB-09 scope. All 5 fixed:

| # | Error | File | Fix |
|---|-------|------|-----|
| 1 | `'React' is not defined` (no-undef) | `DatePicker/DatePicker.tsx:224` (source) | Added `import type React from 'react';` (TS-only, zero runtime) |
| 2 | `'React' is not defined` | `Dialog/Dialog.test.tsx:21` | Added `import type React from 'react';` |
| 3 | `'React' is not defined` | `Modal/Modal.test.tsx:44` | Added `import type React from 'react';` |
| 4 | `'React' is not defined` | `NavigationMenu/NavigationMenu.test.tsx:551` | Added `import type React from 'react';` |
| 5 | Rule `react-hooks/exhaustive-deps` not found | `DatePicker/DatePicker.tsx:124` (inline-disable comment) | Installed `eslint-plugin-react-hooks@7.1.1` at root devDeps; registered ONLY the `exhaustive-deps` rule in `eslint.config.mjs` |

**Provenance note:** Files 1–4 reference React via type namespace (`React.KeyboardEvent`, `React.ComponentProps`) without importing the React value/namespace identifier. The new automatic JSX runtime made the value-import unnecessary for JSX, but the type-namespace references still need the identifier in scope. A type-only import is the minimal-impact resolution.

**react-hooks rule scope decision:** The full `react-hooks/recommended` set (which now includes react-compiler rules in v7.x) surfaced 18 additional pre-existing violations (`Calling setState synchronously within an effect`, `Cannot create components during render`, etc.). These are deep architectural patterns out of Phase 33 scope. Registering only `exhaustive-deps` honors the intent of the existing inline-disable comment without expanding the plan into a hooks audit. A dedicated react-hooks audit plan should be considered for v0.7 backlog.

### Rule 3 deviation — Breadcrumbs unused React import
`Breadcrumbs/Breadcrumbs.test.tsx:17`: `import React from 'react';` was unused (no JSX value-reference, no type-namespace reference). Pure removal.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 4 → A2-minimal] tsconfig types array gained `"node"` entry**
- Found during: Cat A install verification
- Issue: After `@types/node` install (Route A1), `tsc --noEmit` still reported `__dirname` and node global references unresolved.
- Fix: Added `"node"` to `tsconfig.json` `compilerOptions.types`. This is a minimal A2 overlay on top of A1 — the devDep install remains the source of truth; the types array entry just makes TS pick it up. Route A1 INTENT preserved.
- Files: `packages/components/tsconfig.json`
- Commit: `14400e8`

**2. [Rule 1 - Pattern Expansion] Cat C expanded 2 → 8 files**
- Found during: Cat C preflight grep
- Issue: Plan listed only RadioGroup + SkipLink. Grep showed the identical Phase 22 template-setter pattern (`ref.current = node` inside ref callback) in Button, Checkbox, FormField, Heading, plus the helper test.
- Fix: Applied same `MutableRefObject` cast pattern to all 8 sites.
- Commit: `b9e3ed1`

**3. [Rule 3 - Blocker] Breadcrumbs unused React import**
- Found during: lint after Cat A–E fixes
- Fix: Removed `import React from 'react';`.
- Commit: `1cb9f99`

**4. [Rule 1 - Pre-existing] 5 lint errors absorbed (see "Pre-existing lint debt absorbed" section above)**
- Commits: `4a01fc8` (4 React TS-namespace imports), `958b74b` (eslint-plugin-react-hooks install + narrow registration)

## Verification

- `npx tsc --noEmit` from `packages/components/`: **0 errors**
- `npm run lint -w @holmdigital/components`: **0 errors, 20 warnings** (warnings out of scope per plan)
- `npm run test:ci -w @holmdigital/components`: **634 passed, 36 test files**
- `npm run verify -w @holmdigital/components`: **EXIT 0** end-to-end
- `prepublishOnly` literal: `npm run verify` (unchanged)
- `test:wcag-headers` count: **31 files** (plan said 29; actual disk count is 31 — drift exists but is not introduced by this plan)
- No `as any` introduced. `MutableRefObject<…>` casts only.

## Commits

| Hash | Message |
|------|---------|
| `b9e3ed1` | fix(33-03): resolve TS2540 ref.current readonly across 8 test files via MutableRefObject cast (PUB-09) |
| `afe3727` | fix(33-03): vitest-axe matcher type augmentation + LiveRegionLocale narrowing (PUB-09) |
| `14400e8` | chore(33-03): add @types/node + typecheck script + wire lint/typecheck into verify (PUB-09) |
| `1cb9f99` | fix(33-03): remove unused React import in Breadcrumbs.test.tsx (PUB-09) |
| `4a01fc8` | fix(33-03): add TS-namespace React imports (DatePicker source + Dialog/Modal/NavigationMenu tests) (PUB-09) |
| `958b74b` | fix(33-03): install eslint-plugin-react-hooks + register exhaustive-deps rule only (PUB-09) |

## Self-Check: PASSED

- All 19 modified files exist on disk and are committed
- All 6 commit hashes resolve in `git log`
- `npm run verify -w @holmdigital/components` returns EXIT 0
- No uncommitted changes in scope (only out-of-scope: `.planning/phases/30-.../30-CONTEXT.md`, untracked `.claude/`, untracked `changelog.md`)
