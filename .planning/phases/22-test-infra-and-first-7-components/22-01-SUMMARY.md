---
phase: 22-test-infra-and-first-7-components
plan: 01
subsystem: testing
tags: [vitest, jsdom, axe-core, testing-library, react, components]

requires:
  - phase: prior
    provides: "@holmdigital/components v2.3.0 baseline (vitest 4.0.16, @testing-library/react 16.3.2, jsdom 28 already installed)"
provides:
  - "v0.6 test stack devDependencies pinned in @holmdigital/components"
  - "Centralised vitest config with jsdom environment + setupFiles wiring"
  - "src/_test/setup.ts: 7 jsdom polyfills + jest-dom and @chialab/vitest-axe matcher extensions"
  - "tsconfig.json compilerOptions.types resolves toHaveAccessibleName / toHaveNoViolations / vitest globals"
affects: [22-02, 22-03, 22-04, 22-05, 22-06, 22-07, 22-08, 22-09, phase-24]

tech-stack:
  added:
    - "@chialab/vitest-axe ^0.19.1"
    - "axe-core ^4.11.4 (resolved from ^4.11.1)"
    - "@testing-library/user-event ^14.6.1"
    - "@testing-library/jest-dom ^6.9.1 (resolved from ^6.6.3)"
    - "eslint-plugin-testing-library ^7.16.2 (resolved from ^7.0.0)"
  patterns:
    - "Centralised _test/ directory mirrors _hooks/ underscore-prefix convention (D-07)"
    - "expect.extend in setup.ts spreads jest-dom + axe matchers in a single call"
    - "jsdom polyfills feature-gated with `if (!Element.prototype.x)` to stay idempotent across re-runs"

key-files:
  created:
    - "packages/components/vitest.config.ts"
    - "packages/components/src/_test/setup.ts"
  modified:
    - "packages/components/package.json (devDependencies, lockfile)"
    - "packages/components/tsconfig.json (compilerOptions.types)"

key-decisions:
  - "Imported axe matchers via default import from @chialab/vitest-axe (not /matchers subpath) — package's ./matchers export is types-only"
  - "Dialog.test.tsx inline showModal polyfill left in place (belt-and-braces) until TC-04 (Modal plan) per plan instruction"
  - "offsetParent polyfill returns this.parentElement so useFocusTrap's `el.offsetParent !== null` filter passes in jsdom"

patterns-established:
  - "Centralised setup file: any new component test inherits all 7 jsdom polyfills + a11y matchers automatically"
  - "Dual matcher namespace: jest-dom (DOM assertions) + @chialab/vitest-axe (a11y assertions) coexist via a single expect.extend call"

requirements-completed: [TI-01, TI-02]

duration: ~4 min
completed: 2026-05-10
---

# Phase 22 Plan 01: Test Infrastructure Foundation Summary

**Wired @chialab/vitest-axe + jest-dom matchers into vitest 4 with a single setup.ts that polyfills 7 jsdom gaps (IntersectionObserver, ResizeObserver, matchMedia, offsetParent, HTMLDialogElement, Element.animate, scrollIntoView) — all 165 existing component tests stay green.**

## Performance

- **Duration:** ~4 minutes
- **Started:** 2026-05-10T16:50:55Z
- **Completed:** 2026-05-10T16:54:54Z
- **Tasks:** 3 of 3
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments

- v0.6 test stack installed in `@holmdigital/components` with caret-pinned ranges (5 new devDependencies)
- `vitest.config.ts` created — `environment: 'jsdom'`, `setupFiles: ['./src/_test/setup.ts']`, `globals: false`
- `src/_test/setup.ts` registers all 7 required jsdom polyfills and extends Vitest's `expect` with both jest-dom and axe matchers in a single call
- `tsconfig.json` `compilerOptions.types` now includes `vitest/globals` and `@testing-library/jest-dom` so `toHaveAccessibleName`, `toHaveNoViolations`, and Vitest globals type-check
- Existing test suites (Dialog, Select, Tooltip, AccessibilityStatement, LiveRegion, Toast, index) remain green: **7 files / 165 tests passing** under the new setup

## Task Commits

1. **Task 1: Install devDependencies (TI-01)** — `1f79376` (chore)
2. **Task 2: Create vitest config + tsconfig types update** — `3a89e6b` (chore)
3. **Task 3: Create _test/setup.ts with 7 jsdom polyfills + matcher extension (TI-02)** — `b04917d` (feat)

**Plan metadata commit:** see final commit covering this SUMMARY.md + STATE.md.

## Files Created/Modified

- `packages/components/vitest.config.ts` — vitest config: jsdom + setupFiles wiring (created)
- `packages/components/src/_test/setup.ts` — centralised jsdom polyfills + matcher extensions (created)
- `packages/components/package.json` — 5 new devDependencies (modified)
- `packages/components/tsconfig.json` — `compilerOptions.types` array (modified)
- `package-lock.json` — lockfile sync (modified)

## Decisions Made

- **Axe matcher import path:** Plan instructed `import * as axeMatchers from '@chialab/vitest-axe/matchers'` but `@chialab/vitest-axe@0.19.1`'s `./matchers` subpath only exposes `types`, not a runtime `default`. Switched to `import axeMatchers from '@chialab/vitest-axe'` (the package ships matchers as the default export of its main entry). Documented inline in setup.ts.
- **Dialog.test.tsx polyfill kept:** Per plan instruction, the existing inline `showModal` polyfill in Dialog.test.tsx stays put as belt-and-braces until TC-04 (Modal plan).
- **offsetParent polyfill:** Returns `this.parentElement` (not `document.body`) — minimal change that satisfies `useFocusTrap`'s `el.offsetParent !== null` filter without giving false positives for detached nodes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @chialab/vitest-axe matcher import path mismatch**
- **Found during:** Task 3 (running `npm run test:ci` to verify setup.ts loads)
- **Issue:** Plan-specified `import * as axeMatchers from '@chialab/vitest-axe/matchers'` failed at module resolution time with `No known conditions for "./matchers" specifier in "@chialab/vitest-axe" package`. Inspecting `node_modules/@chialab/vitest-axe/package.json` shows the `./matchers` subpath only carries `types`, no `default`/runtime export. Matchers (`toHaveNoViolations`) live as the default export of the main entry (`./lib/index.js`).
- **Fix:** Switched the import to `import axeMatchers from '@chialab/vitest-axe'` and documented the package's quirk inline so future plans don't hit it.
- **Files modified:** `packages/components/src/_test/setup.ts`
- **Verification:** `npm run test:ci -w @holmdigital/components` → 7 files / 165 tests pass.
- **Committed in:** `b04917d` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug — upstream package shape mismatch)
**Impact on plan:** No scope creep. The fix was purely a syntactic adjustment to match the actual package's runtime export shape; semantics are identical (same matchers extended onto `expect`).

## Issues Encountered

- **Pre-existing TS2503 in `LiveRegion.tsx:37` (Cannot find namespace 'NodeJS')** — not introduced by this plan; reproduced on the parent commit before any 22-01 changes were applied. The new `compilerOptions.types` array narrows the implicit type roots (which previously included `node` if hoisted), surfacing the latent gap. Logged to `.planning/phases/22-test-infra-and-first-7-components/deferred-items.md` for follow-up in 22-09 or Phase 26. **Does not block Wave 2** — vitest's pipeline is green, and the components package's `build` script (tsup) is unaffected.

## Threat Flags

None — this plan only touches devDependencies and test scaffolding; no new network, auth, file, or schema surface.

## Next Phase Readiness

- Wave 2 plans (22-02 through 22-09) can now `import userEvent from '@testing-library/user-event'`, write `expect(container).toHaveNoViolations()`, and assume all 7 jsdom polyfills are present.
- The `@chialab/vitest-axe` default-import quirk is captured inline in `setup.ts` and in the deviation log so downstream plans pattern-match the working import shape.
- No blockers. The existing pre-existing TS2503 in LiveRegion.tsx is documented and deferred.

## Self-Check: PASSED

Verified the following before submitting:

- `packages/components/vitest.config.ts` — FOUND
- `packages/components/src/_test/setup.ts` — FOUND
- `packages/components/package.json` devDeps include all 5 entries (caret ranges) — FOUND
- `packages/components/tsconfig.json` `compilerOptions.types` includes `vitest/globals` + `@testing-library/jest-dom` — FOUND
- Commit `1f79376` (Task 1, TI-01) — FOUND in `git log`
- Commit `3a89e6b` (Task 2, vitest config + tsconfig) — FOUND in `git log`
- Commit `b04917d` (Task 3, TI-02 setup.ts) — FOUND in `git log`
- `npm run test:ci -w @holmdigital/components` — 7 files / 165 tests pass

---
*Phase: 22-test-infra-and-first-7-components*
*Completed: 2026-05-10*
