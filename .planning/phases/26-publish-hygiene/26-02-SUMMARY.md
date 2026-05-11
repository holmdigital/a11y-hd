---
phase: 26-publish-hygiene
plan: 02
subsystem: build-tooling
tags: [tsup, glob-entries, build-guard, lucide-react, PUB-05]
requires:
  - 26-01 (LiveRegion TS2503 fix + standards/dist untrack — clean DTS build baseline)
  - Phase 22 (test:wcag-headers script + scripts/ infra)
  - Phase 23 STY-02 (tsup.config.ts extraction from inline CLI)
  - Phase 23 STY-05 (check-no-tailwind-leak.mjs guard pattern to mirror)
provides:
  - Glob-based tsup entry list (self-maintaining as new components land)
  - lucide-react externalization (forward-compat with Plan 26-04 peerDep move)
  - check-no-test-leak.mjs build guard (PUB-05)
  - 4-stage test:ci chain (vitest + wcag-headers + tailwind-leak + test-leak)
affects:
  - All future components dropped into src/<Name>/<Name>.tsx (auto-discovered)
tech-stack:
  added: []  # No new deps; lucide-react already a dep, just externalized
  patterns:
    - "tsup glob entries with !-prefix negation (per Phase 26 researcher §5)"
    - "Tight import-shape regex for build guards (avoids JSDoc false positives)"
key-files:
  created:
    - packages/components/scripts/check-no-test-leak.mjs
  modified:
    - packages/components/tsup.config.ts
    - packages/components/package.json
decisions:
  - "Use !-prefix glob negation, not extglob !(...) — universal globby support per researcher §5"
  - "Add _hooks/ and AccessibilityStatement/locale-*.{ts,tsx} exclusions beyond the plan body to preserve exact 30-entry parity (Rule 2 deviation)"
  - "Scan ALL of dist/ (not scoped) — a test leak is a regression at any path"
metrics:
  duration: ~25 minutes
  completed: 2026-05-11
requirements:
  - PUB-05
---

# Phase 26 Plan 02: tsup Glob Entries + Test-Leak Guard — Summary

PUB-05 closed: `packages/components/tsup.config.ts` now auto-discovers new components via a glob entry pattern with `!`-prefix negation, `lucide-react` is externalized for forward-compat with Plan 26-04, and a new `check-no-test-leak.mjs` guard (mirroring Phase 22/23 script patterns) protects against test-framework code accidentally shipping in `dist/`. The four-stage `test:ci` chain runs green: 27 test files / 439 tests + WCAG-SC header check + Tailwind-leak check + test-leak check.

## Tasks Completed

| # | Task | Commit |
| --- | --- | --- |
| 1 | Migrate tsup.config.ts to glob entries + externalize lucide-react | `2b5afa9` |
| 2 | Create check-no-test-leak.mjs script | `d88adf8` |
| 3 | Wire check:no-test-leak into package.json test:ci | `549ae71` |

## tsup.config.ts Diff

Replaced the 30-item `components` array with five glob entries:

```ts
entry: [
    'src/index.ts',
    'src/*/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/_test/**',
    '!src/_hooks/**',                              // [Rule 2 deviation]
    '!src/AccessibilityStatement/locale-*.{ts,tsx}', // [Rule 2 deviation]
],
external: ['react', 'react-dom', '@holmdigital/standards', 'lucide-react'],
```

Net: `1 file changed, 21 insertions(+), 34 deletions(-)`.

## Dist Parity Proof

Build after migration produces the canonical set with **no extras, no leaks**:

- `dist/index.{js,mjs}` ✓
- 29 component pairs `dist/<Name>/<Name>.{js,mjs}` for: Button, FormField, Dialog, Modal, SkipLink, NavigationMenu, Checkbox, RadioGroup, Select, Switch, Toast, Tooltip, Heading, AccessibilityStatement, ErrorSummary, Combobox, DatePicker, MultiSelect, DataTable, Pagination, Card, TreeView, LiveRegion, Tabs, Accordion, ProgressBar, Skeleton, HelpText, Breadcrumbs ✓
- 0 `*.test.*` files ✓
- 0 `*.stories.*` files ✓
- 0 `dist/_test/` directory ✓
- 0 `dist/_hooks/` directory ✓ (after Rule 2 fix)
- 0 `dist/AccessibilityStatement/locale-chrome.{js,mjs}` ✓ (after Rule 2 fix; helper remains bundled into AccessibilityStatement.{js,mjs})

Total scannable `.js`+`.mjs` files in `dist/`: 89 (60 component+index entries + 29 tsup-emitted code-split chunks).

## check-no-test-leak.mjs

Path: `packages/components/scripts/check-no-test-leak.mjs` (99 lines).

Patterns array (verbatim per researcher Area 6):

```js
const PATTERNS = [
    { name: 'vitest-import',          re: /from\s+['"]vitest['"]/ },
    { name: 'testing-library-import', re: /from\s+['"]@testing-library\// },
    { name: 'vi.mock call',           re: /\bvi\.mock\s*\(/ },
    { name: 'top-level describe',     re: /^\s*describe\s*\(\s*['"]/m },
    { name: 'top-level it',           re: /^\s*it\s*\(\s*['"]/m },
];
```

First-run output against the post-Task-1 dist:

```
[check-no-test-leak] ok — 89 dist file(s) free of test-code imports.
```

Exit code 0. Bootstrap concern (CONTEXT D-04 / RESEARCH Area 6) addressed before wiring into `test:ci`.

## test:ci Chain (4-stage)

`package.json` `scripts` diff:

```diff
 "check:no-tailwind-leak": "node scripts/check-no-tailwind-leak.mjs",
+"check:no-test-leak": "node scripts/check-no-test-leak.mjs",
 "test": "vitest",
-"test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak",
+"test:ci": "vitest run && npm run test:wcag-headers && npm run check:no-tailwind-leak && npm run check:no-test-leak",
```

Full chain output (final lines):

```
Test Files  27 passed (27)
     Tests  439 passed (439)
  Duration  26.18s

[check-wcag-headers]    ok — 23 test file(s) all carry the marker.
[check-no-tailwind-leak] ok — 6 file(s) across 3 scoped dir(s) free of Tailwind utility leaks.
[check-no-test-leak]    ok — 89 dist file(s) free of test-code imports.
```

All 4 stages exit 0. No regression to STY-05 or Phase 22 WCAG headers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 — missing critical functionality] Added `_hooks/` and locale-helper exclusions to preserve dist parity**

- **Found during:** Task 1 first build attempt
- **Issue:** The plan's exclusion list (`!src/_test/**`, `!src/**/*.test.{ts,tsx}`, `!src/**/*.stories.{ts,tsx}`) did NOT match the actual `src/` tree shape. Three real source files matched the `src/*/*.{ts,tsx}` glob but were absent from the prior 30-item explicit list:
  - `src/_hooks/useFocusTrap.ts`
  - `src/_hooks/useScrollLock.ts`
  - `src/AccessibilityStatement/locale-chrome.ts`
  These would have emitted as new top-level dist entries, breaking per-component parity (Task 1 `<done>` mandates "No dist/_test/ directory" — symmetric reasoning applies to `_hooks` since it is also underscore-prefixed-private; locale-chrome was previously inlined into AccessibilityStatement).
- **Fix:** Added two extra `!`-prefix exclusions:
  - `!src/_hooks/**` (mirrors the `_test/` pattern)
  - `!src/AccessibilityStatement/locale-*.{ts,tsx}` (preserves bundling behavior)
- **Files modified:** `packages/components/tsup.config.ts`
- **Commit:** `2b5afa9`
- **Verification:** Post-fix build produces zero entries from these paths; AccessibilityStatement.{js,mjs} still inline the locale helper (parity holds).

## Bootstrap-Note Resolution

The plan flagged a bootstrap concern (CONTEXT D-04): the guard must not be wired into `test:ci` until it can pass against the current dist, otherwise CI would fail on first run. Task 2 verified `check-no-test-leak.mjs` exits 0 (89/89 files clean) BEFORE Task 3 wired the script into the `test:ci` chain. Order preserved; chain stays green.

## Scope Confirmation (No Cross-Plan Conflicts)

- `package.json` `exports` keys: **untouched** (Plan 26-03 territory — subpath `require` conditions).
- `package.json` `peerDependencies` / `dependencies` for `lucide-react`: **untouched** (Plan 26-04 territory — optional-peer move). Externalization in `tsup.config.ts` is independent of the dep classification.
- `package.json` `prepublishOnly` / `verify` / `check:exports` / `check:types`: **untouched** (Plan 26-05 territory).
- Only `scripts.check:no-test-leak` (new) and `scripts.test:ci` (chain extension) changed in `package.json`.

## Self-Check: PASSED

- `packages/components/tsup.config.ts` modified — ✓ verified via `git diff --stat HEAD~3..HEAD~2`
- `packages/components/scripts/check-no-test-leak.mjs` created — ✓ verified via `git diff --stat HEAD~2..HEAD~1`
- `packages/components/package.json` modified — ✓ verified via `git diff --stat HEAD~1..HEAD`
- Commit `2b5afa9` present in `git log` — ✓
- Commit `d88adf8` present in `git log` — ✓
- Commit `549ae71` present in `git log` — ✓
- `npm run test:ci -w @holmdigital/components` exits 0 — ✓ (27 tests files / 439 tests + 3 guards)
