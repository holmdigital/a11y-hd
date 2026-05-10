---
phase: 23-styling-unification
plan: 02
subsystem: components/Tabs
tags: [styling, css, tabs, bem, var-tokens, focus-visible, wcag-2-4-7]
dependency_graph:
  requires: [23-01]
  provides:
    - Tabs.css co-located stylesheet (BEM hooks + var() theming + attribute-state selectors)
    - hd-tabs theming-API surface (8 custom properties)
  affects:
    - packages/components/src/Tabs/Tabs.tsx (Tailwind removed)
    - packages/components/src/Tabs/Tabs.test.tsx (3 new smoke tests, 2.4.7 added to WCAG header)
tech_stack:
  added: []
  patterns:
    - "Co-located <Component>.css side-effect import per RESEARCH.md Section 4 (Option A)"
    - "var(--hd-tabs-{role}, <default>) inline defaults (post-research A1 — defaults live INSIDE .css, not as inline style={{}})"
    - "Attribute-state styling: [aria-selected=\"true\"] + [data-orientation=\"vertical\"] (no className state duplication)"
key_files:
  created:
    - packages/components/src/Tabs/Tabs.css
  modified:
    - packages/components/src/Tabs/Tabs.tsx
    - packages/components/src/Tabs/Tabs.test.tsx
decisions:
  - Active-tab style hook uses existing [aria-selected="true"] attribute selector (NOT a duplicated hd-tabs__trigger--active class) — keeps state single-sourced in ARIA
  - Theming defaults embedded via var(--prop, default) syntax inside Tabs.css (NOT inline style={{}}) so :hover/:focus-visible cascade is not specificity-clobbered
  - data-orientation="vertical" set on Tabs root, TabsList, and TabTrigger to give CSS three independent hooks (replaces 3 Tailwind conditional class strings)
  - Plan 23-02 introduced NO package.json diff (entries owned by 23-01 + 23-04); enforced via `git diff f1cbca5 HEAD -- packages/components/package.json` == empty
metrics:
  duration_seconds: 295
  date_completed: 2026-05-10
  tasks_completed: 3
  files_changed: 3
  lines_added: 170
  lines_removed: 12
  commits: 3
  tests_before: 294
  tests_after: 297
  test_files_before: 19
  test_files_after: 19
---

# Phase 23 Plan 02: Tabs Styling Migration Summary

Migrated `packages/components/src/Tabs/Tabs.tsx` from inline Tailwind utility class strings to a co-located `Tabs.css` stylesheet with BEM-style hooks, attribute-driven state variants (`[aria-selected="true"]`, `[data-orientation="vertical"]`), and a `var(--hd-tabs-*, default)` theming surface — validating the hybrid pattern that Plans 23-03 (Accordion) and 23-04 (Breadcrumbs) will follow.

## What Changed

| File                                       | Status   | Lines (+/-) | Purpose                                                                                   |
| ------------------------------------------ | -------- | ----------- | ----------------------------------------------------------------------------------------- |
| `packages/components/src/Tabs/Tabs.css`    | created  | +113 / -0   | Structural + state CSS; 10 `var(--hd-tabs-*)` refs; `:focus-visible`, `[aria-selected]` hooks |
| `packages/components/src/Tabs/Tabs.tsx`    | modified | +32 / -12   | Side-effect CSS import; JSDoc theming-API block; 4 className= sites → `hd-tabs__*` BEM    |
| `packages/components/src/Tabs/Tabs.test.tsx` | modified | +25 / -0    | 3 new smoke tests for Tabs.css; `2.4.7 Focus Visible` added to WCAG-SC header             |

## Theming API (locked surface for consumers)

The 8 CSS custom properties exposed by `Tabs.css` — all with inline defaults via `var(--prop, default)`:

| Custom Property              | Default                       | Intent                                       |
| ---------------------------- | ----------------------------- | -------------------------------------------- |
| `--hd-tabs-divider-color`    | `#e2e8f0`                     | List/border-side color between list & panels |
| `--hd-tabs-inactive-color`   | `#64748b`                     | Inactive trigger text                        |
| `--hd-tabs-hover-color`      | `#334155`                     | Trigger hover text                           |
| `--hd-tabs-hover-bg`         | `#f8fafc`                     | Trigger hover background                     |
| `--hd-tabs-focus-ring`       | `#3b82f6`                     | `:focus-visible` outline color               |
| `--hd-tabs-active-color`     | `#1d4ed8`                     | Active trigger text                          |
| `--hd-tabs-active-border`    | `#1d4ed8`                     | Active trigger underline/border              |
| `--hd-tabs-active-bg`        | `rgba(29, 78, 216, 0.05)`     | Active trigger background tint               |

Override pattern (consumer side):

```css
:root {
  --hd-tabs-focus-ring: #ff0066;
  --hd-tabs-active-color: #006633;
}
```

…or scoped to a single Tabs instance via wrapper selector.

## Class-Name Test Updates

**None required.** The 16 existing tests in `Tabs.test.tsx` (Phase 22 Plan 09, TC-08) assert on ARIA (`role`, `aria-selected`, `aria-controls`, `aria-labelledby`), keyboard contract (`tabIndex`, ArrowKeys, Home/End, Enter/Space), and `expectNoAxeViolations` / `expectUniqueIds` — NOT on Tailwind class names. They survived the className refactor unchanged. Only the `className={...}` passthrough test (`'passes className through additively on the Tabs wrapper'`) reads `wrapper.className` and asserts the consumer's class is `.toContain(...)` — still passes because the new template `\`hd-tabs${className ? ' ' + className : ''}\`` concatenates the consumer string verbatim.

## Verification Results

| Gate                                                                  | Result                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `npm run test:ci -w @holmdigital/components`                          | **PASS** — 19 files / 297 tests (was 294; +3 smoke)                 |
| `npx vitest run src/Tabs/Tabs.test.tsx`                               | **PASS** — 19 tests (16 existing + 3 new)                           |
| `node scripts/check-no-tailwind-leak.mjs` (Tabs dist only)            | **PASS** — 0 Tabs offenders (Accordion/Breadcrumbs unchanged here)  |
| `grep` Tailwind tokens in `src/Tabs/Tabs.tsx`                         | **PASS** — 0 hits                                                   |
| `grep -c hd-tabs` in `src/Tabs/Tabs.tsx`                              | **PASS** — 12 (≥4 className sites)                                  |
| `git diff f1cbca5 HEAD -- packages/components/package.json`           | **PASS** — empty (23-02 introduces no package.json diff)            |
| `npm run test:wcag-headers`                                           | **PASS** — 15 test files all carry the marker                       |
| `dist/Tabs/Tabs.css` emitted at path declared by `exports['./Tabs.css']` | **PASS** — `./dist/Tabs/Tabs.css` exists; 1.68 KB                  |
| CJS/ESM Tabs.js emitted                                               | **PASS** — `dist/Tabs/Tabs.js` 5.06 KB, `Tabs.mjs` present          |

### Known Build Limitation (Pre-existing, Deferred)

`npm run build -w @holmdigital/components` exits non-zero on the DTS step due to **pre-existing** TS2503 in `src/LiveRegion/LiveRegion.tsx:37` (`Cannot find namespace 'NodeJS'`). The CJS/ESM/CSS bundles ARE built successfully before the DTS error — the Tabs artifacts emit correctly. Per execution prompt: "Pre-existing TS2503 in `LiveRegion.tsx:37` is deferred — DTS build step fails on it, that's KNOWN, do not auto-fix."

## CSS Dist Path (for downstream)

Resolved via `package.json exports['./Tabs.css']` (set by 23-01): `./dist/Tabs/Tabs.css` (nested layout, confirmed in this plan's build output).

Side-effect import path (consumer fallback): `import '@holmdigital/components/Tabs.css';`

## Deviations from Plan

None — plan executed exactly as written. No Rule 1–4 deviations.

One precondition adjustment was required before execution could begin: the worktree was forked from `master@5ce4646` (a stale ref) but the plan assumes `master@f1cbca5` (Wave 1 complete). I `git reset --hard f1cbca5` to align with the plan's stated baseline. This is environmental setup, not a code deviation — no commits were rewritten.

## Manual `:focus-visible` Verification

**Deferred** — not performed in this autonomous run. The CSS rule `.hd-tabs__trigger:focus-visible { outline: 2px solid var(--hd-tabs-focus-ring, #3b82f6); outline-offset: 2px; }` is asserted to be present in `Tabs.css` by the new smoke test, and `:focus-visible` is a native browser pseudo-class (no JS state to validate). The regression guard is the test. Manual browser verification can occur during Phase 23 close-out QA.

## Commits

| # | Hash      | Type     | Summary                                                                  |
| - | --------- | -------- | ------------------------------------------------------------------------ |
| 1 | `2cde291` | feat     | Add `Tabs.css` with structural + state rules and `var()` theming surface |
| 2 | `b7605a3` | refactor | Migrate `Tabs.tsx` to `hd-tabs__*` BEM + CSS side-effect import          |
| 3 | `2c959ae` | test     | Add 3 `Tabs.css` smoke tests (`:focus-visible` + `var()` + active-state) |

## Self-Check: PASSED

- `packages/components/src/Tabs/Tabs.css` exists: FOUND
- `packages/components/src/Tabs/Tabs.tsx` modified: FOUND (12 `hd-tabs` refs, 0 Tailwind tokens)
- `packages/components/src/Tabs/Tabs.test.tsx` modified: FOUND (19 tests, 0 anti-patterns)
- Commit `2cde291`: FOUND
- Commit `b7605a3`: FOUND
- Commit `2c959ae`: FOUND
- `dist/Tabs/Tabs.css` (built): FOUND
- `dist/Tabs/Tabs.js` + `Tabs.mjs` (built): FOUND
