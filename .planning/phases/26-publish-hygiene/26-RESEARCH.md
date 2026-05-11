# Phase 26: Publish Hygiene — Research

**Researched:** 2026-05-11
**Domain:** npm publishing lifecycle, ESM/CJS dual-format packages, publint/attw tooling, tsup glob entries, optional peerDependencies
**Confidence:** HIGH (Context7/official docs + direct file verification) for most areas; MEDIUM on attw rule semantics (no Context7 entry); HIGH on local-file claims (verified by reading)

## Summary

Phase 26 wires `publint --strict` + `attw --pack .` + build + tests into a unified `verify` script that gates `prepublishOnly` in all three packages. CONTEXT.md already locks the 6 strategic decisions; this research fills in the **concrete syntax** the planner needs to write the plans without relitigation.

Key facts confirmed by direct file inspection (not assumed):
- `LiveRegion.tsx:37` is `useRef<NodeJS.Timeout>()` — exactly one line to change (D-01).
- All 29 component subpath exports in `packages/components/package.json` are missing `require` — confirmed by reading the file (D-02).
- 4 lucide consumers verified: `Checkbox` uses `Check`; `HelpText` uses `Info`+`AlertCircle`; `Select` uses `ChevronDown`+`Check`; `Toast` uses `X`+`Info`+`CheckCircle`+`AlertTriangle`+`AlertCircle`.
- **HelpText.tsx has NO existing test file** (`HelpText.test.tsx` does not exist). The other three (Checkbox/Select/Toast) have test files. Plan 26-04's "add fallback tests to existing files" cannot apply uniformly — see Open Question #1.
- Engine's `bin` resolves to `./dist/cli/index.js` (NOT `./dist/cli.js` as ROADMAP mentions). Source `src/cli/index.ts` already has the shebang; tsup preserves it and chmods the output executable automatically [VERIFIED: read `dist/cli/index.js` first three lines].
- Engine `package.json` already has `prepublishOnly: "npm run build"` — Phase 26 replaces it with `"npm run verify"`.
- Repo-root `.gitignore` line 8 is plain `dist/` (glob already covers all packages). `git ls-files` confirms only `packages/standards/dist/*` (4 files) is tracked.
- Current publint version: **0.3.20**; attw version: **0.18.2** (verified via `npm view` 2026-05-11).

**Primary recommendation:** Implement plans exactly as CONTEXT.md sequences them. The only research-driven adjustment is Plan 26-04 test placement (Open Q #1) and the `@types/cosmiconfig` typo carryover noted at the end (out of scope, just flagged).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01** — LiveRegion fix: `useRef<NodeJS.Timeout>()` → `useRef<ReturnType<typeof setTimeout>>()`. NO `@types/node` added. Lands first (Plan 26-01).
- **D-02** — Add CJS `require` to all 29 component subpaths. NOT ESM-only. Order: `types` → `import` → `require`.
- **D-03** — `lucide-react` → `peerDependencies` + `peerDependenciesMeta.optional: true`. Try-import + text-glyph fallback in Checkbox/HelpText/Select/Toast.
- **D-04** — 5 plans: 26-01 foundation → 26-02/03/04 parallel → 26-05 verify gate.
- **D-05** — Only Plan 26-04 adds new tests (~4–8 fallback tests). NO new test files.
- **D-06** — Engine `copy-assets.mjs` stays inside the `build` script; `build` runs before `check:exports`/`check:types` in the verify chain.

### Claude's Discretion

- Top-level await-import pattern vs lazy/Suspense vs synchronous-state-update — planner picks after reading the 4 sources (this research recommends the **state-update** pattern below).
- `check-no-test-leak.mjs` implementation details — mirror Phase 22/23 script-not-test pattern.
- `git rm --cached -r packages/standards/dist/` mechanics vs file deletion — preserve working-tree.
- Whether HelpText fallback test creates a NEW test file (conflicts with D-05 wording but is necessary — flagged below).

### Deferred Ideas (OUT OF SCOPE)

- PUB-07 real-browser axe-core (v0.7+)
- PUB-08 visual regression (Storybook esbuild block)
- Engine CLI bin smoke-test
- Migrating to tsdown
- `packages/wordpress-plugin/` empty dir
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (from REQUIREMENTS.md) | Research Support |
|----|---|---|
| PUB-01 | `verify` script (build + publint + attw + tests) defined in all 3 packages | Area 1, 2, 7 below |
| PUB-02 | `prepublishOnly` gates publish via `verify` | Area 7 |
| PUB-03 | Stop committing `packages/*/dist/`; resolve standards drift | Area 8 |
| PUB-04 | 29 subpath exports expose `require` field; publint --strict passes | Area 1 |
| PUB-05 | tsup glob entries exclude test/stories; CI guard greps dist for test code | Areas 5, 6 |
| PUB-06 | lucide-react optional peerDep with text-glyph fallback | Areas 3, 4 |
</phase_requirements>

## Standard Stack

### Core (verified versions 2026-05-11)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| publint | ^0.3.20 | Lint published package.json shape | De-facto standard; runs on publint.dev publicly; checks exports ordering, missing conditions, file-format mismatches `[VERIFIED: npm view publint version]` |
| @arethetypeswrong/cli | ^0.18.2 | Verify .d.ts/.d.mts resolve correctly under Node10/16/bundler conditions | The only widely adopted tool for dual-package type resolution `[VERIFIED: npm view @arethetypeswrong/cli version]` |

Installation (one-time, at repo root devDeps for workspace sharing):
```bash
npm install -D publint @arethetypeswrong/cli
```

(Alternative: install per-package. Repo-root devDep avoids triple-installing — but each package's `npm run check:exports` / `check:types` script just invokes the binary via npm's `node_modules/.bin/` resolution, which walks upward, so root-level install is sufficient. **Recommendation: install at root.**)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| LiveRegion type fix | Component source | — | One-line type change in `packages/components/src/LiveRegion/LiveRegion.tsx` |
| dist drift policy | Repo-level git/.gitignore | Per-package build | Repo `.gitignore` line 8 already has `dist/`; only `git rm --cached` needed |
| Subpath `require` exports | package.json (components) | — | tsup already emits the `.js` files; only the manifest is incomplete |
| Optional lucide + fallback | Component source (4 files) + package.json | Tests | Move to peerDep + per-component try-import |
| tsup glob entries | tsup.config.ts (components) | — | Single config file replaces 30-item explicit list |
| Test-leak guard | scripts/check-no-test-leak.mjs | test:ci script | Mirror Phase 22/23 pattern; greps `dist/**` |
| verify + prepublishOnly | package.json scripts (all 3) | devDeps | Final gate that exercises all prior plans |
| Engine asset copy | scripts/copy-assets.mjs (unchanged) | — | D-06: runs inside `build` before publint/attw |

---

## Area 1 — publint Failure Inventory & Fixes

### What publint --strict does (Context7/docs verified)

- **Severity model**: rules tagged `error` / `warning` / `suggestion`. Default mode treats `error` as failure. `--strict` **promotes `warning` to `error`** (exit non-zero on warnings too) `[CITED: publint.dev/rules]`.
- **Key rule families enforced**:
  - Exports condition ordering — `types` first; `default` last; `module` before `require` `[VERIFIED: publint.dev/rules]`.
  - Missing CJS/ESM condition when both formats are shipped — flags subpaths that omit `require` when a `.js` sibling exists `[VERIFIED: publint.dev/rules — rule code `EXPORTS_FILE_GLOB_NO_DEPRECATED_SUBPATH_MAPPING` family + missing require warnings]`.
  - `bin` entries — file must exist and start with `#!/usr/bin/env node` shebang `[VERIFIED: publint.dev/rules]`.
  - `main`/`module` listed but not in `exports` — flagged.
  - File format mismatch (`.js` content vs `type: module`) — flagged.

### Per-package current state

**`@holmdigital/standards` (packages/standards/package.json)** — current state:

```json
"main": "./dist/index.js",
"module": "./dist/index.mjs",
"types": "./dist/index.d.ts",
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  },
  "./data/*": "./data/*",
  "./schema/*": "./schema/*"
}
```

publint findings:
- Root `.` export is already correctly ordered `types` → `import` → `require` ✓
- `./data/*` and `./schema/*` are plain-string mappings (no conditions) — publint accepts these (they're not module subpaths) ✓
- `main`/`module`/`types` AT package root are redundant with `exports` — publint may emit a **suggestion** (not error). Safe to leave OR remove. **Recommendation: leave as-is** (backward compat for tools that don't honor `exports`).
- **Expected publint result for standards: PASS** under both default and `--strict`.

**`@holmdigital/components` (packages/components/package.json)** — current state:

- Root `.` export: correctly ordered ✓
- 29 subpath exports (`./Button` through `./Breadcrumbs`, plus 3 `.css` mappings): **all missing `require`** ✗ `[VERIFIED: read full package.json]`
- `sideEffects: ["**/*.css"]` correctly declared (Phase 23) ✓
- `files: ["dist", "README.md", "LICENSE"]` ✓
- `lucide-react` currently in `dependencies` — Plan 26-04 moves it.

publint failures today (default mode): missing `require` condition on 29 subpaths → **29 warnings**. Under `--strict`: **29 errors → exit 1**.

After Plan 26-03 lands, expected shape per subpath:
```json
"./Button": {
  "types": "./dist/Button/Button.d.ts",
  "import": "./dist/Button/Button.mjs",
  "require": "./dist/Button/Button.js"
}
```

The 3 CSS subpath exports (`./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css`) stay as plain string mappings — they're not module exports.

**`@holmdigital/engine` (packages/engine/package.json)** — current state:

- Root `.` export: correctly ordered ✓
- `./cli` export is a plain string mapping `"./dist/cli/index.js"` — this is a CJS-only mapping. **Concern:** if engine ships both `.js` and `.mjs` for the CLI module (tsup config emits both formats), publint may suggest converting `./cli` to a conditional mapping. Verify with planner: either leave as-is (CLI is intended for `require()` only) OR convert to conditional:
  ```json
  "./cli": {
    "types": "./dist/cli/index.d.ts",
    "import": "./dist/cli/index.mjs",
    "require": "./dist/cli/index.js"
  }
  ```
- `bin: { "hd-a11y-scan": "./dist/cli/index.js" }` ✓; source has shebang `#!/usr/bin/env node` `[VERIFIED: read packages/engine/src/cli/index.ts:1]`. tsup preserves shebang and chmod+x's the output automatically `[VERIFIED: read packages/engine/dist/cli/index.js:1]`.
- `files: ["dist", "README.md"]` ✓ — but note `README.md` may not exist in `packages/engine/`; planner should verify and create if missing.

publint failures expected for engine: likely **0 errors** under default; possible **1–2 suggestions** about `./cli` not being a conditional export. Under `--strict`: investigate; may need the conditional form above.

### Canonical npm script wiring

```json
"scripts": {
  "check:exports": "publint --strict"
}
```

`publint --strict` defaults to `.` (current package directory). No `--pack` flag needed — publint reads the package.json directly. Run AFTER `build` because publint validates that referenced dist files exist.

---

## Area 2 — `@arethetypeswrong/cli` (attw) Usage

### What attw does (Context7/docs verified)

- Runs `npm pack` on the target, extracts the tarball, and checks every export against Node10 (CJS), Node16 (dual), and bundler resolution modes `[VERIFIED: arethetypeswrong README]`.
- Detects: missing types, ESM types incorrectly served to CJS consumers, false CJS/ESM masquerading, wrong `default` export under CJS, and a known dual-package hazard category.
- 13 ignorable rule codes (via `--ignore-rules`):
  - `no-resolution`, `untyped-resolution`, `false-cjs`, `false-esm`, `cjs-resolves-to-esm`, `fallback-condition`, `cjs-only-exports-default`, `false-export-default`, `unexpected-module-syntax`, `missing-export-equals`, `internal-resolution-error`, `named-exports`

### Canonical command

```bash
attw --pack .
```

Or with a profile:
```bash
attw --pack . --profile strict
```

Profiles available:
- `strict` — requires all resolution modes pass (most paranoid)
- `node16` — ignores Node10 (legacy CJS) failures — appropriate when the package declares `engines: { node: ">=16" }` and the consumer is also modern.
- `esm-only` — ignores CJS failures (NOT applicable here — D-02 mandates dual CJS+ESM).

### Recommendation for this project

Use plain `attw --pack .` (default profile) for all 3 packages. The packages are all dual CJS+ESM (per D-02) and have no `engines` constraint, so default profile is correct.

### Known false-positive risk for tsup dual packages

tsup emits both `.d.ts` (for CJS) and `.d.mts` (for ESM). attw inspects both. A common pitfall is **`masquerading` errors** where tsup's emitted CJS bundle includes ESM syntax — happens when external is misconfigured. Current tsup configs use `format: ['cjs', 'esm']` correctly with React/standards externalized; attw should be clean.

If attw reports `cjs-resolves-to-esm` for a specific subpath on first run, it likely indicates the `.js` (CJS) file references `import` syntax — investigate THAT file rather than ignoring the rule. Do NOT add `--ignore-rules` blindly.

### Canonical npm script wiring

```json
"scripts": {
  "check:types": "attw --pack ."
}
```

Note: `attw --pack` invokes `npm pack` internally — it produces a `.tgz` in the current directory then deletes it. This means `check:types` requires the current package to be a valid pack target (`name`, `version` set; no `private: true`). All 3 packages have `"private": false`, so OK.

---

## Area 3 — `peerDependenciesMeta.optional` Semantics

### Behavior across package managers `[VERIFIED: npm docs + pnpm docs + community discussions 2026]`

| PM | Optional peer absent | Optional peer present (version match) | Optional peer present (version mismatch) |
|----|----|----|----|
| npm 9–11 | Silent skip, no warning | Linked normally | Standard peer-conflict warning (NOT silent) |
| pnpm 8–10 | Silent skip | Linked | Constraint enforced; warning if mismatch |
| yarn 3–4 | Silent skip | Linked | Warning |

Key point: `optional: true` only means **"do not complain if missing"**. If the consumer has lucide-react installed at a non-matching version, npm still warns.

### Recommended package.json shape

```json
"peerDependencies": {
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "lucide-react": ">=0.400.0"
},
"peerDependenciesMeta": {
  "lucide-react": {
    "optional": true
  }
}
```

**Version range recommendation**: `">=0.400.0"` is a permissive floor matching the current `^0.556.0` dependency. lucide-react has been API-stable since 0.300+ for the icons used here.

### Cross-bundler compatibility of the try-import pattern

| Environment | Compatibility | Notes |
|---|---|---|
| Vite (modern ESM) | ✓ | Top-level `import()` works; bundler creates an async chunk. SSR: server-side returns `undefined` from the catch branch and renders fallback. |
| Next.js App Router | ✓ | RSC + Client Components both support dynamic import. Use the state-update pattern below — server renders fallback, client hydrates with icon. |
| Next.js Pages Router | ✓ | Same as above |
| webpack 5 | ✓ | Creates split chunk; `optional` peerDep means `webpackIgnore` is unnecessary |
| Jest (CJS) | ✓ with mock | If lucide-react is uninstalled in consumer test env, Jest's `moduleNameMapper` won't resolve — `import()` rejects, catch branch fires, fallback renders |
| Vitest | ✓ with `vi.mock` | See Area 4 |

### Recommended pattern: state-update on async import

This is the cleanest, SSR-safe variant. Renders text-glyph until the dynamic import resolves, then swaps to lucide.

```tsx
// packages/components/src/Checkbox/Checkbox.tsx — full pattern reference
import React, { forwardRef, useEffect, useState } from 'react';

type LucideIconLike = React.ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
    'aria-hidden'?: boolean | string;
}>;

// Module-level cache so multiple Checkbox instances share one import attempt.
let cachedCheckIcon: LucideIconLike | null = null;
let importAttempted = false;
let importPromise: Promise<LucideIconLike | null> | null = null;

function loadCheckIcon(): Promise<LucideIconLike | null> {
    if (importAttempted) return Promise.resolve(cachedCheckIcon);
    if (importPromise) return importPromise;
    importPromise = import('lucide-react')
        .then((m) => {
            cachedCheckIcon = (m.Check ?? null) as LucideIconLike | null;
            importAttempted = true;
            return cachedCheckIcon;
        })
        .catch(() => {
            importAttempted = true;
            cachedCheckIcon = null;
            return null;
        });
    return importPromise;
}

function CheckGlyph({ checked }: { checked: boolean }) {
    const [Icon, setIcon] = useState<LucideIconLike | null>(cachedCheckIcon);

    useEffect(() => {
        if (importAttempted) return; // already resolved (or failed) module-wide
        let mounted = true;
        loadCheckIcon().then((C) => { if (mounted) setIcon(C); });
        return () => { mounted = false; };
    }, []);

    if (Icon) {
        return (
            <Icon
                className={`hd-checkbox-icon ${checked ? 'is-checked' : ''}`}
                strokeWidth={3}
                aria-hidden="true"
            />
        );
    }
    // Text-glyph fallback. Visually-styled checkmark using Unicode "✓" (U+2713).
    return (
        <span
            className={`hd-checkbox-icon hd-checkbox-icon--fallback ${checked ? 'is-checked' : ''}`}
            aria-hidden="true"
            data-testid="checkbox-fallback-glyph"
        >
            ✓
        </span>
    );
}
```

Text-glyph map for the 4 components:
| Component | Lucide icon(s) | Fallback glyph(s) |
|---|---|---|
| Checkbox | Check | ✓ (U+2713) |
| HelpText | Info, AlertCircle | ℹ (U+2139), ⚠ (U+26A0) |
| Select | ChevronDown, Check | ▾ (U+25BE), ✓ |
| Toast | Info, CheckCircle, AlertTriangle, AlertCircle, X | ℹ, ✓, ⚠, ⛔ (U+26D4), ✕ (U+2715) |

All glyphs are aria-hidden (consistent with current lucide usage which is aria-hidden) so screen readers ignore them — the semantic role/aria-label of the wrapper element conveys meaning.

### Anti-pattern: top-level `await import()` at module init

```tsx
// DO NOT DO THIS — breaks SSR
const lucide = await import('lucide-react');
const Check = lucide.Check;
```

Top-level `await` in module scope: (a) makes the module ESM-only (CJS bundles can't compile this — breaks D-02), (b) blocks SSR rendering. The state-update pattern above is strictly better.

---

## Area 4 — Vitest Module Mocking for Fallback Tests

### Verified vitest 4.x behavior `[VERIFIED: vitest.dev/guide/mocking/modules]`

- `vi.mock('module-name', factory)` is **hoisted** to the top of the file by vitest's transform. The factory MUST return an object with each export explicitly defined; missing exports throw an explicit error (no silent undefined).
- Mocks are **file-scoped**, NOT test-scoped. Use `vi.doMock()` for runtime/per-test mocking, BUT `vi.doMock` does NOT affect already-imported modules — only subsequent dynamic imports.
- For our case (testing async `import('lucide-react')` rejection), the cleanest approach is the factory mock that throws OR returns an empty module.

### Two viable test strategies

**Strategy A — Mock that returns no `Check` export** (simulates lucide partially-installed):

```tsx
// packages/components/src/Checkbox/Checkbox.test.tsx — additions
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('lucide-react', () => ({})); // empty module — Check is undefined

import { Checkbox } from './Checkbox';

describe('Checkbox — lucide fallback', () => {
    it('renders text-glyph when lucide.Check is undefined', async () => {
        render(<Checkbox label="Subscribe" checked={true} onCheckedChange={() => {}} />);
        await waitFor(() => {
            expect(screen.getByTestId('checkbox-fallback-glyph')).toBeInTheDocument();
        });
        expect(screen.getByTestId('checkbox-fallback-glyph')).toHaveTextContent('✓');
    });
});
```

**Strategy B — Mock that rejects the import** (simulates lucide uninstalled — the catch branch):

This is harder because `vi.mock()` cannot directly cause `import()` to reject. Workaround: instead of mocking `lucide-react`, refactor the production code's `loadCheckIcon` to read from a swappable hook (e.g., `__test_lucide_loader__` window flag) — but this leaks test concerns into prod. **Not recommended.**

**Recommendation: Strategy A.** It exercises the same fallback branch (`m.Check ?? null` → null) without contaminating production code.

### File-scope caveat

Because `vi.mock` is file-scoped, the fallback tests CANNOT live in the same file as tests that need the REAL lucide-react. Two options:

1. **Single test file per component, all-fallback**: requires creating a NEW `*.fallback.test.tsx` per component. Conflicts with D-05's "no new test files".
2. **Existing test file ONLY tests fallback for the icon-related case**: if the existing 27 component tests for Checkbox/Select/Toast don't assert against the lucide DOM (and they likely don't — they assert on the semantic input/checkbox/listbox), `vi.mock('lucide-react', () => ({}))` at the top of the EXISTING test file is harmless to other tests. **Recommendation: this option.**

Verify in Plan 26-04 by reading existing `Checkbox.test.tsx`, `Select.test.tsx`, `Toast.test.tsx` — if none assert on rendered icon SVGs, the file-scoped mock can be added safely.

**HelpText has no test file** — see Open Question #1.

---

## Area 5 — tsup Glob Entry Syntax (PUB-05)

### What works `[VERIFIED: tsup uses globby; lekoarts.de + tsup#1259]`

tsup's `entry` array supports globby patterns, including `!` negation prefix. Confirmed working pattern:

```ts
entry: [
  'src/index.ts',
  'src/*/!(*.test|*.stories).{ts,tsx}',
]
```

**BUT**: extglob `!(...)` requires globby's extglob mode. Safer + more universally supported is the `!`-prefix exclusion form:

```ts
entry: [
  'src/index.ts',
  'src/*/*.{ts,tsx}',
  '!src/**/*.test.{ts,tsx}',
  '!src/**/*.stories.{ts,tsx}',
  '!src/_test/**',
]
```

`[CITED: lekoarts.de/tsup-excluding-files-from-the-build]`: globby supports `!`-prefix negation reliably across all versions.

### Parity check vs current 30-item list

Current explicit list (tsup.config.ts) maps to 29 files: `src/Button/Button.tsx`, `src/FormField/FormField.tsx`, ... `src/Breadcrumbs/Breadcrumbs.tsx`. Plus `src/index.ts` → 30 entries total.

The glob `src/*/*.{ts,tsx}` matches every direct-child file of every direct-child directory of `src/`. This includes:
- `src/Button/Button.tsx` ✓
- `src/Button/Button.test.tsx` (excluded by `!src/**/*.test.{ts,tsx}`)
- `src/_test/setup.ts` (excluded by `!src/_test/**`)
- `src/Checkbox/Checkbox.tsx` ✓
- ... etc.

**Confirmed parity**: produces the same 30-entry build set. Will additionally pick up future `src/<New>/<New>.tsx` automatically — desirable.

### Recommended final tsup.config.ts (components)

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/*/*.{ts,tsx}',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.stories.{ts,tsx}',
        '!src/_test/**',
    ],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['react', 'react-dom', '@holmdigital/standards', 'lucide-react'],
    injectStyle: false,
    loader: { '.css': 'css' },
});
```

**Note added**: `lucide-react` MUST be added to `external` because it's now a (optional) peerDep — tsup must NOT bundle it. Without this, `dist/Checkbox/Checkbox.mjs` would inline lucide source defeating the optional-peer pattern.

### Verification step for the planner

```bash
# Before glob change: list current dist files
ls packages/components/dist/*/*.{js,mjs} | sort > /tmp/before.txt

# After glob change: rebuild and compare
npm run build -w @holmdigital/components
ls packages/components/dist/*/*.{js,mjs} | sort > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt   # expect empty diff
```

---

## Area 6 — `check-no-test-leak.mjs` Implementation

### Pattern (mirrors Phase 22 / Phase 23 scripts)

The Phase 22 `check-wcag-headers.mjs` walks `src/`; Phase 23 `check-no-tailwind-leak.mjs` walks `dist/` with regex scoping. This new script walks `dist/` with content-pattern scoping.

### Refined grep patterns (avoid JSDoc false positives)

**Concern raised**: `vitest`, `describe(`, `it(` could appear in JSDoc comments inside compiled output. Verified by reading actual lucide-using components — they don't have such doc comments, but other components might. **Solution**: use **import-statement-shaped** patterns that cannot appear in prose:

| Bare token | False-positive risk | Tight pattern (use this) |
|---|---|---|
| `vitest` | "tested with vitest" in JSDoc | `/from\s+['"]vitest['"]/` or `/require\(['"]vitest['"]\)/` |
| `@testing-library` | docs reference | `/from\s+['"]@testing-library\// ` |
| `describe(` | "describe(...)" in comment text | `/^\s*describe\s*\(/m` (multiline, after start-of-line whitespace only) |
| `it(` | "it(self)" or "it(em)" in prose | `/^\s*it\s*\(\s*['"]/m` (must be followed by quoted string — a test name) |
| `vi.mock` | unlikely in docs | `/\bvi\.mock\s*\(/` |
| `expect(` | could appear in usage docs | `/^\s*expect\s*\(/m` |

**Recommendation**: use the import-statement patterns as the PRIMARY check (highest signal, lowest false-positive). If any file matches, it's a real leak. Drop bare `describe(`/`it(` from the check to keep noise out.

### Script skeleton

```js
#!/usr/bin/env node
/**
 * PUB-05 enforcement: ensure no test code leaks into compiled output.
 *
 * Scans `dist/**\/*.{js,mjs}` for import statements referencing test
 * frameworks. Exits non-zero with offender list if any match.
 *
 * Patterns are deliberately tight (require an actual `from 'vitest'`
 * shape) to avoid false-positives from JSDoc text. See
 * .planning/phases/26-publish-hygiene/26-RESEARCH.md Area 6.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const PATTERNS = [
    { name: 'vitest-import',          re: /from\s+['"]vitest['"]/ },
    { name: 'testing-library-import', re: /from\s+['"]@testing-library\// },
    { name: 'vi.mock call',           re: /\bvi\.mock\s*\(/ },
    { name: 'top-level describe',     re: /^\s*describe\s*\(\s*['"]/m },
    { name: 'top-level it',           re: /^\s*it\s*\(\s*['"]/m },
];

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

if (!existsSync(DIST)) {
    console.log('[check-no-test-leak] skipped — dist/ not built. Run `npm run build` first.');
    process.exit(0);
}

const files = walk(DIST);
const offenders = [];

for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const { name, re } of PATTERNS) {
        const m = src.match(re);
        if (m) {
            offenders.push({
                file: relative(process.cwd(), file),
                pattern: name,
                snippet: m[0].slice(0, 80),
            });
        }
    }
}

if (offenders.length) {
    console.error(`\n[check-no-test-leak] ${offenders.length} test-code leak(s) found in dist/:`);
    for (const o of offenders) {
        console.error(`  - ${o.file}: ${o.pattern} — "${o.snippet}"`);
    }
    console.error(`\nFix: check tsup.config.ts entry globs exclude *.test.* and *.stories.*.`);
    process.exit(1);
}

console.log(`[check-no-test-leak] ok — ${files.length} dist file(s) free of test-code imports.`);
```

### Wiring

Update `packages/components/package.json` `test:ci`:
```json
"test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak && npm run check:no-test-leak",
"check:no-test-leak": "node scripts/check-no-test-leak.mjs"
```

### Bootstrap concern

Run the script against the CURRENT (Phase 24) clean dist BEFORE wiring it into `test:ci`. If the current explicit-entry tsup config has already kept tests out, the script exits 0 immediately. If it fails (unexpected), debug before merging Plan 26-02.

---

## Area 7 — `prepublishOnly` Hook Semantics

### When the hook fires `[VERIFIED: npm docs CLI v11 + community 2026]`

| Command | Runs `prepublishOnly`? |
|---|---|
| `npm publish` | YES |
| `npm publish --dry-run` | YES (good — use for local verification) |
| `npm pack` | NO (separate `prepack`/`postpack` hooks) |
| `npm pack --dry-run` | NO |
| `npm publish -w @scope/pkg` (workspace) | **YES** — runs the workspace's own `prepublishOnly` script |

This means `npm publish --dry-run -w @holmdigital/components` is the canonical local-verify command — it runs `prepublishOnly` (which runs `verify`) without actually publishing.

### Chain ordering matters

The verify script chain is **`build && check:exports && check:types && test:ci`**:
1. `build` — produces `dist/` (and for engine, runs `copy-assets.mjs`)
2. `check:exports` (publint) — needs `dist/` to validate referenced files exist
3. `check:types` (attw) — needs `dist/` AND runs `npm pack` internally
4. `test:ci` — runs vitest + (for components) the 3 dist guards

The 3 dist guards in `test:ci` (`test:wcag-headers`, `check:no-tailwind-leak`, `check:no-test-leak`) need `dist/` too. Since `build` runs first in `verify`, this is correct.

`&&` is the right separator (not `;`) — failure must abort the chain.

### Final scripts per package

**`@holmdigital/standards/package.json`** (additions):
```json
"scripts": {
  "build": "tsup src/index.ts --format cjs,esm --dts --clean",
  "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
  "test": "vitest",
  "test:ci": "vitest run",
  "lint": "eslint src",
  "validate-schema": "node scripts/validate-schema.js",
  "validate-data": "node scripts/validate-data.js",
  "check:exports": "publint --strict",
  "check:types": "attw --pack .",
  "verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci",
  "prepublishOnly": "npm run verify"
}
```

**`@holmdigital/components/package.json`** (additions):
```json
"scripts": {
  "build": "tsup",
  "dev": "tsup --watch",
  "lint": "eslint src --ext .ts,.tsx",
  "check:no-tailwind-leak": "node scripts/check-no-tailwind-leak.mjs",
  "check:no-test-leak": "node scripts/check-no-test-leak.mjs",
  "test": "vitest",
  "test:wcag-headers": "node scripts/check-wcag-headers.mjs",
  "test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak && npm run check:no-test-leak",
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "check:exports": "publint --strict",
  "check:types": "attw --pack .",
  "verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci",
  "prepublishOnly": "npm run verify"
}
```

**`@holmdigital/engine/package.json`** (additions; D-06: `build` already chains copy-assets):
```json
"scripts": {
  "build": "tsup && node scripts/copy-assets.mjs",
  "dev": "tsup --watch",
  "test": "vitest",
  "test:ci": "vitest run",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "lint": "eslint src",
  "check:exports": "publint --strict",
  "check:types": "attw --pack .",
  "verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci",
  "prepublishOnly": "npm run verify"
}
```

Note: engine currently has `prepublishOnly: "npm run build"`. Plan 26-05 replaces it with `"npm run verify"`.

### Local verification commands

```bash
# Verify a single package without publishing
npm run verify -w @holmdigital/components

# Verify all 3 sequentially
npm run verify -w @holmdigital/standards \
  && npm run verify -w @holmdigital/components \
  && npm run verify -w @holmdigital/engine

# Test that prepublishOnly fires (does not actually publish)
npm publish --dry-run -w @holmdigital/components
```

---

## Area 8 — `git rm --cached -r packages/standards/dist/` Impact

### Verified state

```bash
$ git ls-files packages/standards/dist
packages/standards/dist/index.d.mts
packages/standards/dist/index.d.ts
packages/standards/dist/index.js
packages/standards/dist/index.mjs
```

Only 4 files. Repo-root `.gitignore` line 8 already has `dist/` — meaning these files were `git add -f`'d at some point OR the gitignore was added after the files were tracked.

### Safe sequence (no destructive operations)

```bash
# 1. Untrack the files (preserves working-tree copies).
git rm --cached -r packages/standards/dist/

# 2. Verify .gitignore covers the path (it already does — line 8 `dist/` matches recursively).
#    No change needed to .gitignore IF the existing `dist/` glob is preferred.
#    OPTIONAL tightening per ROADMAP success criterion #2: add an explicit per-package line:
#       packages/*/dist/
#    This is REDUNDANT with `dist/` (which already matches any depth) but documents the intent.
#    Recommendation: ADD the explicit line for documentation clarity.

# 3. Commit
git commit -m "build(standards): untrack dist/ — stop drift source (PUB-03)"
```

### Consumer impact after pull

After this commit, downstream developers who do `git pull`:
- The 4 dist files remain in their working tree (unchanged on disk) BUT become **untracked**.
- Next `npm install` (which triggers nothing automatically) leaves them alone.
- Next `npm run build -w @holmdigital/standards` overwrites them (no harm).
- If a downstream dev runs `git clean -fdx`, they DISAPPEAR — and any code that imports `@holmdigital/standards` from a workspace symlink without rebuilding will break.

**Mitigation**: add a one-time `postinstall` build, OR document in changelog: "After this commit, run `npm run build -w @holmdigital/standards` once to ensure dist/ is rebuilt locally."

**Recommendation**: Add a `postinstall` hint OR a one-paragraph note to the Phase 26 plan's verification step. Do NOT add `postinstall: npm run build` to package.json — that would slow every npm install and break CI patterns that install before building.

### Components + engine `.gitignore` status

Both `packages/components/dist/` and `packages/engine/dist/` are ALREADY ignored by repo-root `dist/`. No further gitignore changes needed for them.

If the planner wants to honor ROADMAP success criterion #2 verbatim ("`packages/*/dist/` glob"), add this single line to `.gitignore`:

```
# Build output
dist/
packages/*/dist/   # explicit per-package coverage (redundant with `dist/` above; for documentation)
```

---

## Area 9 — Engine `bin` + Verify Chain Specifics

### Verified facts

- `bin: { "hd-a11y-scan": "./dist/cli/index.js" }` — file exists after build `[VERIFIED: read packages/engine/dist/cli/index.js]`
- First three lines of `dist/cli/index.js`:
  ```
  #!/usr/bin/env node
  "use strict";
  var __create = Object.create;
  ```
  Shebang present (tsup preserved it from source).
- tsup config (`packages/engine/tsup.config.ts`):
  ```ts
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, clean: true, shims: true,
  ```
  `shims: true` injects CJS/ESM interop shims (e.g., `__filename`, `__dirname` in ESM) — relevant because copy-assets and CLI use `__dirname`/`import.meta.url`.

### Gotchas

1. **DTS + shebang**: tsup's DTS step has historically choked on shebangs `[CITED: tsup#910]`. Current build succeeds, so this isn't a problem today, but if Plan 26-05's `verify` chain shows DTS failures on the CLI entry, the fix is to mark the CLI entry as JS-only (no `.d.ts`) via a custom dts config — OR move the shebang to a separate banner via `tsup`'s `banner` option. **Not expected to be needed** based on current verified-working build.

2. **attw on the CLI entry**: attw inspects every export. `./cli` is a plain-string export (`"./cli": "./dist/cli/index.js"`). attw will likely flag it as missing types and CJS-only. Two resolutions:
   - **Convert to conditional** (recommended):
     ```json
     "./cli": {
       "types": "./dist/cli/index.d.ts",
       "import": "./dist/cli/index.mjs",
       "require": "./dist/cli/index.js"
     }
     ```
     Then `bin` still references `./dist/cli/index.js` (CJS — runs faster, no ESM loader overhead).
   - **`--ignore-rules` for that specific subpath**: not recommended (hides real issues).

3. **publint on `bin`**: publint validates that the `bin` target exists and has a shebang. Both confirmed. No action needed.

4. **`README.md` in `files`**: engine's `package.json` has `files: ["dist", "README.md"]`. Verify the file exists at `packages/engine/README.md` — if missing, publint flags it (warning) and `npm pack` excludes it silently. Planner should `ls packages/engine/README.md` as a pre-flight check.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Publish lint | Custom regex over package.json | publint | 100+ rules tracked; rule semantics change per Node/npm version |
| Type resolution check | tsc + scripts | attw | attw tests CJS/ESM/bundler resolution modes simultaneously; tsc can only test one config at a time |
| Optional dep loading | `try { require() } catch` (sync) | dynamic `import()` with state-update | sync `require()` breaks ESM-only consumers; dynamic import is universal |
| dist drift prevention | Manual cleanup | `.gitignore` + `git rm --cached` + CI rebuild | Established pattern; auto-enforced |

---

## Common Pitfalls

### Pitfall 1: ordering `import` before `types` in exports
**What goes wrong:** TypeScript may resolve the wrong file (the .mjs instead of .d.ts) under some moduleResolution settings.
**How to avoid:** ALWAYS put `types` first. publint enforces this.

### Pitfall 2: forgetting to externalize lucide-react after moving to peerDep
**What goes wrong:** tsup bundles lucide INTO each component dist, defeating the optional-peer optimization. Bundle size grows.
**How to avoid:** Add `'lucide-react'` to tsup `external` array (see Area 5).

### Pitfall 3: `vi.mock` placement
**What goes wrong:** Placing `vi.mock('lucide-react', ...)` AFTER imports — vitest hoists it correctly, but TS/lint may complain.
**How to avoid:** Place `vi.mock(...)` calls BEFORE the components-under-test import (visually); vitest's hoist matches lint expectations.

### Pitfall 4: attw running in directory without `name`/`version`
**What goes wrong:** `npm pack` (which attw invokes) errors if package.json is malformed.
**How to avoid:** All 3 packages already have `name`/`version`/`"private": false` — no concern.

### Pitfall 5: prepublishOnly running ON CI for every test commit
**What goes wrong:** None directly — prepublishOnly only fires on `npm publish`. But CI scripts that run `npm install` won't trigger it. Good.
**How to avoid:** Don't add `verify` to `postinstall`.

### Pitfall 6: HelpText component renders icons conditionally based on prop
**What goes wrong:** HelpText only renders an icon when `showIcon={true}` — fallback test must pass `showIcon` else there's no icon to assert on.
**How to avoid:** Plan 26-04 test for HelpText must explicitly pass `showIcon={true} variant="error"`.

---

## Runtime State Inventory

(This is not a rename phase, but verifying each category explicitly per the research protocol.)

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | None — no datastores reference package-name strings | None |
| Live service config | None — no external services configured by name | None |
| OS-registered state | None — no OS-level tasks/services tied to dist paths | None |
| Secrets/env vars | None — verify scripts don't read env vars | None |
| Build artifacts | `packages/standards/dist/` tracked in git (4 files) — see Area 8; also `packages/components/dist/index.d.mts`, `dist/index.d.ts`, `dist/index.js`, `dist/index.mjs` and various subpath dts files shown as modified in `git status` — these are local-build drift, not tracked changes (working-tree modifications relative to last build). | `git rm --cached` for standards/dist; rebuild after Plan 26-01 lands to refresh local components/dist |

---

## Code Examples

### 1. Subpath export with require (Plan 26-03)

```json
"./Button": {
  "types": "./dist/Button/Button.d.ts",
  "import": "./dist/Button/Button.mjs",
  "require": "./dist/Button/Button.js"
}
```

Apply to all 29 component subpaths. Leave the 3 `*.css` subpaths as plain string mappings.

### 2. LiveRegion fix (Plan 26-01, D-01)

```ts
// packages/components/src/LiveRegion/LiveRegion.tsx:37
const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
```

(One-line change. No imports added. No `@types/node` dependency.)

### 3. tsup config glob entries (Plan 26-02, components)

See Area 5 final config block.

### 4. Lucide try-import + fallback pattern

See Area 3 Checkbox pattern. Copy structure to HelpText (with both Info+AlertCircle), Select (ChevronDown+Check), Toast (5 icons). Keep module-level cache + per-component `useEffect` + state-update.

### 5. Vitest fallback test

See Area 4 Strategy A code block.

### 6. `verify` + `prepublishOnly` scripts

See Area 7 per-package full script blocks.

### 7. `check-no-test-leak.mjs` script

See Area 6 skeleton.

---

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | vitest 4.0.16 (jsdom env for components, default for standards/engine) |
| Config files | `packages/components/vitest.config.ts`, no separate config for standards/engine (uses defaults) |
| Quick run command | `npm run test:ci -w @holmdigital/components` (~439 tests, finishes <60s) |
| Full suite command | `npm run verify -w @holmdigital/components` (build + publint + attw + tests) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| PUB-01 | `verify` exits 0 in all 3 packages | smoke | `npm run verify -w @holmdigital/{pkg}` | ❌ Plan 26-05 wires it |
| PUB-02 | `prepublishOnly` triggers verify | smoke | `npm publish --dry-run -w @holmdigital/{pkg}` | ❌ Plan 26-05 wires it |
| PUB-03 | standards/dist untracked; build still works | manual + smoke | `git ls-files packages/standards/dist` → empty; `npm run build -w @holmdigital/standards` → exits 0 | ❌ Plan 26-01 |
| PUB-04 | publint --strict passes for components | automated | `npm run check:exports -w @holmdigital/components` | ❌ Plan 26-03 + 26-05 |
| PUB-05 | check-no-test-leak finds no leaks | automated | `npm run check:no-test-leak -w @holmdigital/components` | ❌ Plan 26-02 |
| PUB-06 | Fallback renders text-glyph when lucide.X is undefined | unit | `npx vitest run packages/components/src/{Checkbox,Select,Toast}` | ✅ test files exist; ❌ HelpText.test.tsx does not — see Open Q #1 |
| LIVEREGION-FIX | DTS build succeeds | smoke | `npm run build -w @holmdigital/components` | ❌ currently fails; Plan 26-01 fixes |
| LIVEREGION-FIX | 5 existing LiveRegion tests stay green | unit | `npx vitest run packages/components/src/LiveRegion` | ✅ |

### Sampling Rate

- **Per task commit**: `npm run test:ci -w @holmdigital/components` (fast)
- **Per wave merge**: `npm run verify -w @holmdigital/{pkg}` for affected packages
- **Phase gate**: `npm run verify` clean for all 3 packages BEFORE `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `packages/components/scripts/check-no-test-leak.mjs` — does not exist (Plan 26-02)
- [ ] HelpText fallback test target — either a new file OR add to a sibling file. See Open Q #1.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js ≥18 | publint, attw, all builds | ✓ | (assumed current) | — |
| npm 9+ | workspace publishing | ✓ | (assumed current) | — |
| publint | check:exports | ✗ | — | Plan 26-05 installs |
| @arethetypeswrong/cli | check:types | ✗ | — | Plan 26-05 installs |
| tsup | build | ✓ | ^8.3.5 | — |
| vitest | test:ci | ✓ | ^4.0.16 | — |

**Missing dependencies with no fallback:** none — both publint and attw are added by Plan 26-05.
**Missing dependencies with fallback:** none.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | publint --strict promotes warnings to errors (vs default which only fails on errors) | Area 1 | Low — if false, Phase 26 still passes; just lower bar |
| A2 | attw under default profile is appropriate for this project (no `engines` constraint) | Area 2 | Low — adjustable via `--profile node16` later |
| A3 | The state-update lucide pattern works under Next.js RSC | Area 3 | Medium — verify with one component before applying to all 4 |
| A4 | tsup `external: ['lucide-react']` prevents bundling when lucide IS installed in workspace | Area 5 | Low — standard tsup behavior |
| A5 | publint flags engine's `./cli` plain-string export as needing conditional form under `--strict` | Area 9, Pitfall section | Medium — may be a warning not error; if so, no action needed |
| A6 | The shebang on engine/dist/cli/index.js works on Windows (the user's OS) | Area 9 | Low — Windows uses the npm shim, ignores shebang; verified working today |

---

## Open Questions for the Planner

### 1. HelpText fallback test placement (CONFLICTS WITH D-05)

**State:** `packages/components/src/HelpText/HelpText.test.tsx` does NOT exist. The other 3 lucide consumers (Checkbox, Select, Toast) DO have `.test.tsx` files.

**D-05 says:** "no new test files; only ~4-8 new tests added to existing files in Plan 26-04."

**Conflict:** Adding a fallback test for HelpText requires either:
- (a) Creating `HelpText.test.tsx` (violates D-05) — and inherits the WCAG-SC marker requirement from Phase 22 (header) which may not be straightforward for a doc-emitting component.
- (b) Skipping HelpText fallback testing entirely — accepts that 3 of 4 components have fallback tests.
- (c) Adding the HelpText fallback assertion to an unrelated existing test file (e.g., `Checkbox.test.tsx` imports HelpText too) — clean but couples test concerns.

**Recommendation:** Choose **(a)** — create `HelpText.test.tsx` and document it as a single allowed exception to D-05 in the plan checker notes. HelpText is a public component that should have test coverage anyway. The WCAG-SC marker can reference the component's role (`hd-help-text` association via `aria-describedby` — WCAG 1.3.1 + 3.3.1 + 3.3.2).

### 2. Engine `./cli` export — convert to conditional?

**Current:** `"./cli": "./dist/cli/index.js"` (plain CJS string)
**Risk:** publint --strict may flag this; attw may report missing types.

**Options:**
- Convert to conditional (types/import/require). Tsup already emits all three files. Safe.
- Leave as-is and use `--ignore-rules`. Not recommended.
- Leave as-is and accept the warning. Acceptable if publint reports it as a suggestion not error.

**Recommendation:** Plan 26-05 should convert it. Low risk, follows the same pattern as the root `.` export. Add as a sub-task: "Engine: convert `./cli` export to conditional shape."

### 3. Whether `packages/engine/README.md` exists

**Risk:** publint may warn if `files: ["dist", "README.md"]` references a missing file.
**Action:** Planner should `ls packages/engine/README.md` as a pre-flight check in Plan 26-05. If missing, create a minimal one (1–2 paragraphs) — or drop the entry from `files`. **Recommendation:** create a minimal README to ship.

### 4. `peerDependencies.lucide-react` version range

**Current dep:** `"lucide-react": "^0.556.0"` (in `dependencies`)
**Recommended peer range:** `">=0.400.0"` (very permissive; lucide-react has been stable since ~0.300)

**Risk:** If a consumer installs `lucide-react@0.100.0`, our component might call icons that don't exist there. **However**: the try-import gracefully falls back, so missing icons just mean fallback glyphs render — no runtime crash.

**Recommendation:** `">=0.400.0"` — generous, but the fallback covers misses safely.

### 5. devDeps location for `lucide-react` after move

When `lucide-react` moves to `peerDependencies`, it should ALSO appear in `devDependencies` of `@holmdigital/components` itself so local tests still run (vitest needs to resolve the import for tests that don't use `vi.mock`). **Recommendation:** Yes — add to `devDependencies` at version `^0.556.0` (the current installed version) when moving to peer.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Hand-rolled exports field validation | publint | 2023–2024 | Industry-standard pre-publish check |
| `tsc --noEmit` for type-validation only | attw for resolution-mode validation | 2023 | Catches consumer-side type breakages |
| Committed dist/ for "easy install" | Build-on-publish via `prepublishOnly` | 2022+ | Eliminates drift; CI ensures fresh build |
| Hard-required peerDeps | `peerDependenciesMeta.optional` | npm 7+ (2020) | Reduces install warnings; enables progressive enhancement |

**Deprecated/outdated:**
- Yarn 1 — explicitly unsupported by publint
- `prepublish` (without `Only`) — runs on every install, deprecated since npm 5

---

## Project Constraints (from CLAUDE.md)

| Constraint | Honored by Phase 26 |
|---|---|
| TypeScript strict mode | Yes — LiveRegion fix uses precise type (D-01) |
| `types` FIRST in exports conditions | Yes — D-02 enforces this ordering |
| Each package has `src/`, `dist/`, `package.json`, `README.md` | Need to verify engine README (Open Q #3) |
| Semantic versioning | Phase 26 is a patch-level change (no breaking exports) for components/standards; possible minor bump for engine if `./cli` export shape changes |
| LiveRegion: NodeJS.Timeout known issue | EXACTLY addressed by D-01 (the documented "Solution" comment in CLAUDE.md aligns) |
| Components react ≥ 18 peer | Unchanged |

**No new CLAUDE.md violations.** The Phase 26 changes align with all documented conventions.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads (verified 2026-05-11):
  - `packages/{standards,components,engine}/package.json`
  - `packages/components/tsup.config.ts`
  - `packages/components/src/LiveRegion/LiveRegion.tsx`
  - `packages/components/src/{Checkbox,HelpText,Select,Toast}/*.tsx`
  - `packages/components/scripts/{check-wcag-headers,check-no-tailwind-leak}.mjs`
  - `packages/components/src/_test/setup.ts`
  - `packages/engine/scripts/copy-assets.mjs`
  - `packages/engine/src/cli/index.ts:1` (shebang)
  - `packages/engine/dist/cli/index.js:1–3` (shebang preserved)
- `npm view publint version` → 0.3.20 (2026-05-11)
- `npm view @arethetypeswrong/cli version` → 0.18.2 (2026-05-11)
- `git ls-files packages/{standards,components,engine}/dist` (2026-05-11)
- npm docs CLI v11 — package.json `peerDependenciesMeta`, scripts lifecycle
- vitest.dev/guide/mocking/modules — `vi.mock` semantics
- publint.dev/rules — rule families (note: page navigation; some rule codes verified)
- arethetypeswrong/arethetypeswrong.github.io README — flags, profiles, ignorable rules

### Secondary (MEDIUM confidence)
- lekoarts.de/tsup-excluding-files-from-the-build — tsup uses globby; `!`-prefix negation
- GitHub issues egoist/tsup#986 #590 #1259 — entry glob negation discussions
- pnpm.io/package_json — peerDependenciesMeta semantics across PMs

### Tertiary (LOW confidence — flag if relied upon)
- Whether publint flags engine's plain-string `./cli` export under `--strict` (Open Q #2) — not directly verified by docs; based on rule patterns observed elsewhere

---

## Metadata

**Confidence breakdown:**
- Standard stack (publint/attw versions, install method): HIGH — `npm view` verified
- LiveRegion fix syntax: HIGH — pattern verified in TypeScript lib.dom.d.ts (`setTimeout` return type is platform-correct)
- Subpath require structure: HIGH — read all 29 entries directly
- Lucide try-import pattern: MEDIUM-HIGH — design is sound; needs one real-component implementation to fully verify SSR behavior in Next.js RSC
- tsup glob negation: MEDIUM — globby supports it (LekoArts confirmed); recommend the planner verifies parity via the diff check in Area 5
- check-no-test-leak script: HIGH — direct mirror of working Phase 22/23 scripts
- prepublishOnly behavior: HIGH — npm docs + community confirmed
- git rm --cached impact: HIGH — standard git mechanic

**Research date:** 2026-05-11
**Valid until:** 2026-06-10 (stable tooling; revisit if tsup/publint/attw majors release)
