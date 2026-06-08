# Testing Patterns

**Analysis Date:** 2026-06-01

## Test Framework

**Runner:** Vitest 4.x (4.0.16+) — one config per package.

| Package | Config | Environment | Globals |
|---------|--------|-------------|---------|
| `@holmdigital/components` | `packages/components/vitest.config.ts` | `jsdom` | `false` (explicit imports) |
| `@holmdigital/engine` | `packages/engine/vitest.config.ts` | `node` | `true` |
| `@holmdigital/standards` | `packages/standards/vitest.config.ts` | (default node) | per-file |

**Assertion / DOM matchers (components):**
- `@testing-library/jest-dom` — DOM matchers (`toBeInTheDocument`, `toHaveAttribute`, …).
- `@chialab/vitest-axe` — axe-core matcher (`toHaveNoViolations`).
- `@testing-library/react` + `@testing-library/user-event` — render + keyboard simulation.
- `axe-core` 4.11+ — wired directly (see `expectNoAxeViolations`).

**Run commands (per package):**
```bash
npm run test -w @holmdigital/<pkg>        # Vitest watch
npm run test:ci -w @holmdigital/<pkg>     # Headless + extra guards
npm run verify -w @holmdigital/<pkg>      # Full prepublishOnly chain
```

Engine adds `npm run test:integration` (`vitest run --config vitest.integration.config.ts`).

## Test File Layout

**Co-located.** Tests live beside their subject: `src/<Component>/<Component>.test.tsx`, `src/<module>/<module>.test.ts`. Never `__tests__/` folders, never a parallel tree (`packages/components/TESTING-CONVENTIONS.md` §1).

**Shared scaffolding** (`packages/components/src/_test/`):
- `setup.ts` — vitest setup file (jsdom polyfills + matcher wiring).
- `axe.ts` — single source of axe-core config.
- `helpers.ts` — three reusable primitives.
- `helpers/` — meta-tests for the helpers themselves (excluded from WCAG-SC guard).

The `_test/` prefix marks the directory as internal and keeps it out of the published surface. `check:no-test-leak` enforces that nothing from this tree appears in `dist/`.

## Centralised Setup (components)

`packages/components/src/_test/setup.ts` is loaded via `setupFiles` and does two things:

1. **Matcher extension** — `expect.extend({ ...jestDomMatchers, ...axeMatchers })`. Also declares a TypeScript module-augmentation for `vitest`'s `Assertion` so `toHaveNoViolations()` type-checks.
2. **Seven jsdom polyfills** — installed via `Reflect.set(globalThis, …)` (the approved escape hatch from `CLAUDE.md`):
   1. `IntersectionObserver` mock (`setup.ts:36-44`)
   2. `ResizeObserver` mock (`setup.ts:47-52`)
   3. `window.matchMedia` (`setup.ts:55-67`) — false-by-default so prefers-reduced-motion short-circuits
   4. `HTMLElement.offsetParent` (`setup.ts:71-76`) — required by `useFocusTrap`'s focusable filter
   5. `HTMLDialogElement.showModal` / `close` (`setup.ts:80-92`)
   6. `Element.animate` (`setup.ts:95-103`)
   7. `Element.scrollIntoView` (`setup.ts:106-108`)

`afterEach(() => cleanup())` unmounts between tests.

## Axe Configuration

**Single source:** `packages/components/src/_test/axe.ts`. **Per-test `configureAxe` is forbidden** — it would drift from the shared disable list. The 11 disabled rules (jsdom-incompatible or page-level) are documented inline:

```
color-contrast, region, landmark-one-main, landmark-complementary-is-top-level,
landmark-no-duplicate-banner, landmark-no-duplicate-contentinfo, landmark-unique,
bypass, meta-viewport, document-title, html-has-lang
```

The exported helper is:

```ts
await expectNoAxeViolations(container);
```

Real-browser axe coverage (full WCAG 1.4.3 contrast, landmarks) is deferred to v0.7+.

## Test Helpers

`packages/components/src/_test/helpers.ts` exports exactly three primitives:

| Helper | Purpose |
|--------|---------|
| `expectNoAxeViolations(container)` | Run axe-core with shared rule set; assert clean |
| `expectUniqueIds(root)` | Catch duplicate-`id` bugs when a component is rendered twice (breaks aria-labelledby / htmlFor) |
| `expectKeyboardSequence(steps)` | Drive a `user-event` keystroke sequence and assert focus lands on the expected element after each step |

Each helper has a **mandatory failure-mode meta-test** under `src/_test/helpers/<name>.test.ts` (happy path + clear `.toThrow(/regex/)` assertion). Per `TESTING-CONVENTIONS.md` §6.

## WCAG-SC Header Guard

Every `*.test.tsx` under `packages/components/src/*` (excluding `_test/`) **MUST** contain the literal string `WCAG SCs covered:` in the first 30 lines. The marker lives in a JSDoc block at the top of the file:

```tsx
/**
 * WCAG SCs covered:
 * - 1.4.3 Contrast (Minimum) — variant colour assertions
 * - 2.1.1 Keyboard — Space/Enter activation
 * - 2.4.7 Focus Visible — focus ring smoke test
 * - 4.1.2 Name, Role, Value — aria-busy when loading, axe-clean
 */
```

Enforced by `packages/components/scripts/check-wcag-headers.mjs`, chained into `test:ci`. Missing marker = build failure.

## Tier Grammar (components, Phase 22)

Each component test file uses two top-level `describe` blocks named verbatim:

```tsx
describe('Tier 1: Table Stakes', () => { /* mounts, ref forwarding, className merge, prop variants, disabled gating */ });
describe('Tier 2: A11y Differentiators', () => { /* axe-clean, ARIA, unique IDs, APG keyboard, focus mgmt */ });
```

Every test file must include **≥1 `expectNoAxeViolations` smoke** as part of Tier 2. Target depth ~10–15 tests per component; behaviours over cartesian prop matrices.

Tier 3 (full APG conformance for Combobox / DatePicker / MultiSelect / Tree / DataTable) is its own Phase 24+ plan.

## Anti-Patterns (Hard NO — D-02a grep gate)

`TESTING-CONVENTIONS.md` §5 forbids the following in new test files:

- `toMatchSnapshot` / `toMatchInlineSnapshot` (DOM-tree snapshots rot at first refactor).
- `querySelector('.css-class')` — query by role/label/text instead.
- Per-test `configureAxe` — use the centralised helper.
- `fireEvent.click` without a paired keyboard test (WCAG 2.1.1).
- `data-testid` on library components (allowed in consumer apps, not here).
- Internal-state probing (`.instance()`, private-field reach-in).

## Test Counts (current state)

| Package | Test files | Test cases (`it`/`test`) |
|---------|-----------|--------------------------|
| `@holmdigital/components` | 31 `*.test.tsx` | ~476 |
| `@holmdigital/engine` | 6 `*.test.ts` | ~68 |
| `@holmdigital/standards` | 1 `index.test.ts` | ~61 |

The standards suite is small but dense — each `it` walks the entire dataset.

## Standards Suite Patterns

`packages/standards/src/index.test.ts` covers:
- Public API surface (`getAllConvergenceRules`, `getRulesByFramework`, `getNationalLawByFramework`, …).
- **JSON Schema validation via ajv** — `data/national-laws.json` is validated against `schema/national-laws-schema.json` (Draft-07).
- **inForce drift guard** — asserts `inForce === (effectiveDate <= today)` for all 16 supported countries (17 with Australia). When a future-dated law passes its `effectiveDate`, the test flips and forces the maintainer to update `inForce` (referenced in `CLAUDE.md` "inForce drift guard").
- Discriminated-union narrowing on `ComplianceDeadlineEntry`.

## Engine Suite Patterns

- Vitest `globals: true`, environment `node`.
- `vitest.config.ts` injects `__ENGINE_VERSION__` at compile-time from `package.json` so build artefacts carry a version stamp.
- CLI code (`src/cli/**`) is excluded from coverage.
- Integration tests live behind `vitest.integration.config.ts` and run via the separate `test:integration` script (not part of `test:ci`).

## Coverage Philosophy

**No coverage-percent chasing.** `TESTING-CONVENTIONS.md` §5 explicitly forbids padding test counts to hit a number. Instead:

- Components: every test file ties itself to specific WCAG SCs via the header marker — tests trace to compliance criteria, not lines.
- Standards: 100% coverage of compliance logic is a `CONTRIBUTING.md` requirement (§Code Style) because the data is regulatory.
- Engine: v8 coverage reporter is configured (`vitest.config.ts:14-19`) for visibility; no hard threshold gate.

## CI Gates (`.github/workflows/release.yml`)

1. Build all 3 packages in dependency order: standards → components → engine.
2. `changesets/action@v1` opens / updates the "Version Packages" PR.
3. On master with no remaining changesets: publish via OIDC + `--provenance`.
4. Per-package `prepublishOnly` runs the full verify chain locally inside `npm publish` itself — so even if the workflow somehow bypassed CI, publish would still gate on `build && lint && typecheck && check:exports && check:types && test:ci`.

## What These Tests Do NOT Cover

Documented in `TESTING-CONVENTIONS.md` §8 — keep these out of scope:

- **Colour contrast** (jsdom has no layout — `color-contrast` axe rule disabled).
- **Landmark / region rules** (page-level concern, not component scope).
- **Real Tab order** (jsdom focus advancement is not browser-accurate; treat as smoke).
- **Animation timing visuals** (start/end states only).

Real-browser axe and visual coverage are deferred to v0.7+.

---

*Testing analysis: 2026-06-01*
