---
phase: 32-tc-15-remaining-component-test-coverage
plan: 08
subsystem: components
tags: [tc-15, tests, tier-1-tier-2, axe-smoke, version-bump, changelog, phase-32, tooltip-waiver]
requires:
  - 32-01 (Card Tier 1+2)
  - 32-02 (Skeleton Tier 1+2)
  - 32-03 (Heading Tier 1+2)
  - 32-04 (SkipLink Tier 1+2)
  - 32-05 (ProgressBar Tier 1+2)
  - 32-06 (Switch Tier 1+2)
  - 32-07 (Pagination Tier 1+2)
provides:
  - TC-15 closure
  - "@holmdigital/components@2.6.0"
  - Tooltip Tier 1 + Tier 2 + axe smoke (appended; legacy SC 1.4.13 block byte-equivalent)
affects:
  - packages/components/CHANGELOG.md
  - packages/components/package.json
  - packages/components/src/Tooltip/Tooltip.test.tsx
tech-stack:
  added: []
  patterns:
    - "append-only test augmentation under documented D-02a waiver"
key-files:
  created: []
  modified:
    - packages/components/src/Tooltip/Tooltip.test.tsx
    - packages/components/package.json
    - packages/components/CHANGELOG.md
decisions:
  - "MINOR bump 2.5.0 → 2.6.0 (Phase 22/24/30/31 precedent — every test-coverage milestone ships MINOR)"
  - "Preserve legacy Tooltip SC 1.4.13 block verbatim; APPEND Tier 1+2+axe smoke under D-02a waiver"
metrics:
  duration: ~10 minutes
  completed: 2026-05-12
---

# Phase 32 Plan 08: Tooltip Audit + Verify + Version Bump Summary

TC-15 closed: Tooltip.test.tsx augmented in place with Tier 1 + Tier 2 + axe smoke (legacy SC 1.4.13 block byte-equivalent under documented D-02a waiver); full components-package verify green (36 files / 634 tests / wcag-headers / no-tailwind-leak / no-test-leak); @holmdigital/components bumped 2.5.0 → 2.6.0 with CHANGELOG entry. Phase 32 complete.

## Commits

| Step                                               | Commit  |
| -------------------------------------------------- | ------- |
| Tooltip Tier 1 + Tier 2 + axe smoke append (32-08) | 752ea7d |
| Components 2.5.0 → 2.6.0 + CHANGELOG (32-08)       | 1a2deb4 |

## Tooltip Audit Findings

**What was already there (preserved verbatim):**
- Line 1: `// @vitest-environment jsdom` ✓
- Lines 2–7: JSDoc `WCAG SCs covered:` listing 1.4.13 / 2.1.1 / 4.1.2 ✓
- Lines 23–165: single top-level describe `Tooltip — WCAG 2.1 SC 1.4.13 (Content on Hover or Focus)` with 4 sub-describes (Dismissible / Hoverable / Persistent / aria-describedby) and 8 `it(` blocks
- 12 `fireEvent` calls (verifying timing-sensitive surface: Escape-doesn't-poison-dismissed-flag, hover-bridge cancel, reopen-after-blur, ancestor-Escape stopPropagation)

**What was missing vs Phase 22 template-setter shape:**
1. No `describe('Tier 1: Table Stakes', …)` block
2. No `describe('Tier 2: …', …)` block
3. No `expectNoAxeViolations` smoke

**What was APPENDED (no edits to lines 1–165 of the legacy block — only header import line modified to add `screen` + `expectNoAxeViolations`):**
1. D-02a waiver JSDoc explaining why the legacy block keeps `fireEvent` (cites STATE.md Plan 27-01 fake-timer + user-event v14 + vitest 4 deadlock)
2. `describe('Tier 1: Table Stakes', …)` with 4 `it()` blocks: mounts, no-render-before-interaction, content-text-when-open, className passthrough
3. `describe('Tier 2: A11y Differentiators (role=tooltip + axe smoke)', …)` with 2 `it()` blocks: role=tooltip exposure, axe-clean smoke

**File-wide tokens after append:**
- `fireEvent`: 12 (legacy block, preserved under waiver)
- `querySelector`: 0
- `configureAxe`: 0
- `toMatchSnapshot`: 0
- `expectNoAxeViolations`: 1
- `describe('Tier 1: Table Stakes'`: 1
- `describe('Tier 2:`: 1
- `D-02a waiver`: 1

The new Tier 1 + Tier 2 blocks themselves are D-02a-clean (use `screen` + `act(() => trigger.focus())` only — no fireEvent / querySelector / configureAxe / toMatchSnapshot).

## Per-File `it()` Counts (Phase 32 final)

| File                | Pre-phase | After Phase 32 | Δ      |
| ------------------- | --------- | -------------- | ------ |
| Card.test.tsx       | 0         | 13             | +13    |
| Skeleton.test.tsx   | 0         | 13             | +13    |
| Heading.test.tsx    | 0         | 13             | +13    |
| SkipLink.test.tsx   | 0         | 11             | +11    |
| ProgressBar.test.tsx | 0        | 18             | +18    |
| Switch.test.tsx     | 0         | 15             | +15    |
| Pagination.test.tsx | 0         | 16             | +16    |
| Tooltip.test.tsx    | 8         | 15             | +7     |
| **Total new tests** |           |                | **+106** |

## Full-Suite Test Count Delta

- **Pre-phase baseline:** 22 colocated `*.test.tsx` files / ~528 tests (634 − 106)
- **After Phase 32:** 29 colocated `*.test.tsx` files + 2 special (`_hooks/useFocusTrap.test.tsx`, `AccessibilityStatement.regression.test.tsx`) + 4 in-`_test/helpers/` + 1 `_hooks/` + `index.test.ts` + `date-utils.test.ts` = 36 vitest test files / 634 tests
- **Delta:** +7 new files + 1 augmented file; +106 tests
- Range check: plan target [+40, +110] — actual +106 lands at the upper end (within bounds; ProgressBar/Switch/Pagination contributed the most as planned).

## ROADMAP Success Criteria Status (with reconciliation footnote)

| #   | Criterion (as originally stated)          | Actual outcome                                                                                                                                                                | Status |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | "8 new test files"                         | **7 new + 1 augmented** (Tooltip.test.tsx pre-existed at 165 lines; APPEND-only edit preserved the legacy SC 1.4.13 block). Spirit of criterion satisfied.                  | ✅ (reconciled) |
| 2   | All 8 carry WCAG SCs covered header        | All 8 carry the marker; `test:wcag-headers` reports `ok — 31 test file(s) all carry the marker.`                                                                            | ✅      |
| 3   | ≥ 1 `expectNoAxeViolations` per new file   | All 7 new + 1 augmented Tooltip carry ≥ 1 axe smoke                                                                                                                          | ✅      |
| 4   | Test files: "28 → 36"                      | **Actual baseline 22 → target 29** colocated (excludes `_test/`, `_hooks/useFocusTrap`, `*.regression.test.tsx`). `check-wcag-headers.mjs` scope sees 31 (incl. those two).   | ✅ (arithmetic reconciled in CHANGELOG) |
| 5   | `test:wcag-headers` "24 → 32"              | Actual baseline 22 → 29 colocated (script reports 31 incl. useFocusTrap + regression). Reconciled in CHANGELOG.                                                              | ✅ (arithmetic reconciled) |

## Verify Pipeline (final)

```
npm run verify -w @holmdigital/components
```

- Build (tsup CJS+ESM+DTS): green
- check:exports (publint --strict): green
- check:types (attw --pack): green
- test:ci:
  - vitest run: **36 test files / 634 tests passed** (24.31s)
  - test:wcag-headers: ok — 31 test file(s) all carry the marker
  - check:no-tailwind-leak: ok — 6 file(s) across 3 scoped dir(s) free of leaks
  - check:no-test-leak: ok — 91 dist file(s) free of test-code imports

## Version Bump

- `packages/components/package.json`: `"version": "2.5.0"` → `"version": "2.6.0"` (single-line, no other changes)
- MINOR per Phase 22/24/30/31 precedent: every test-coverage milestone ships MINOR even when source bytes are unchanged, so downstream consumers see an honest release-train tick.
- CHANGELOG.md gained `## 2.6.0 — 2026-05-12` entry above `## 2.5.0`, listing all 7 new files + Tooltip augmentation + ROADMAP arithmetic reconciliation.

## Deviations from Plan

### Auto-fixed / observations

- **[Note] `check-wcag-headers.mjs` scope wider than plan estimate.** The script walks ALL `*.test.tsx` under `src/` excluding `_test/`, which includes `_hooks/useFocusTrap.test.tsx` and `AccessibilityStatement.regression.test.tsx`. Plan assumed exclusion. Reported count = 31, not 29. Both extra files already carry the marker (Phase 22-04 and Phase 25), so no fix required — just a documentation reconciliation in this summary + CHANGELOG.
- **[Note] Tier 1 has 4 `it()` blocks, not 3** as the plan stub suggested. Added a fourth (`className passthrough on TooltipContent when open`) because TooltipContent does accept `className` (verified in `Tooltip.tsx:138`). Trivially within budget.

### Skipped

- The forwardRef test the plan permitted on `TooltipTrigger` was SKIPPED: `Tooltip.tsx` does NOT use `forwardRef` on either `Tooltip`, `TooltipTrigger`, or `TooltipContent` (all are plain function components that clone-children or render `<span>` / `<div>` inline). Per plan instruction "do NOT assume forwardRef without checking", the ref test is omitted. This is faithful to Tooltip.tsx's actual surface.

## Wave 1 Commit-Bundling Race (process improvement recommendation)

**Observation:** Wave 1 launched Card / Skeleton / Heading / SkipLink in parallel. Card and Heading landed in the SAME commit (`43cf5ad`) because both agents called `git commit` without `git add -- <pathspec>` scope, so each picked up the other's staged files. Both files survived (no data loss), but the commit history is muddied (32-01 commit contains 32-03's file).

**Wave 2 mitigation:** Plans 32-04 / 32-05 / 32-06 / 32-07 added explicit pathspec scoping: `git add -- <path>` and `git commit -- <path>`. All four committed cleanly to their own SHA.

**Recommendation for future parallel waves:** Always use pathspec-scoped commits in parallel-executor plans. The orchestrator's plan template should include the `git commit -- <pathspec>` form in the example commit lines. Already enforced for Phase 32 Wave 2 — apply universally going forward.

## Deferred / Out-of-Scope

- **Pre-existing infra bug:** `npm run test -w @holmdigital/components -- <pattern>` on Windows does not forward the pattern through the workspace boundary (the `--` is consumed by npm). Workaround: `cd packages/components && npx vitest run [pattern]`. Confirmed during Wave 1 + 2 + 3 executions. **Deferred** — out of scope for TC-15; suggest filing as a separate npm/Windows infra ticket against Phase 33+ tooling pass.
- The CHANGELOG line counting "29 colocated" vs the wcag-headers script's "31" is a documentation-only divergence (the script's scope is wider by intent — it covers hooks + regression too). No code change needed.

## STATE.md / ROADMAP.md Updates

- `STATE.md` `stopped_at`: updated to reflect Phase 32 COMPLETE (TC-15 closed, components 2.6.0 shipped).
- `ROADMAP.md`: Phase 32 marked complete in v0.7 section.

## Self-Check: PASSED

Created files:
- `.planning/phases/32-tc-15-remaining-component-test-coverage/32-08-SUMMARY.md` — this file ✓

Modified files (committed):
- `packages/components/src/Tooltip/Tooltip.test.tsx` (commit 752ea7d) — confirmed via `git log --oneline -3` ✓
- `packages/components/package.json` (commit 1a2deb4) — confirmed ✓
- `packages/components/CHANGELOG.md` (commit 1a2deb4) — confirmed ✓

Verify pipeline: `npm run verify -w @holmdigital/components` exit 0 — confirmed ✓
Tooltip isolated test run: 15/15 pass — confirmed ✓
Full suite: 634/634 pass across 36 files — confirmed ✓
