# Testing Conventions — `@holmdigital/components`

This document codifies how component tests are written in this package. It exists so that reviewers, contributors, and downstream phase plans share a single, prescriptive grammar — not a buffet of styles. The conventions are **enforced** by a CI grep guard (`npm run test:wcag-headers`) and by reviewer judgement.

If a rule here disagrees with something a test author wants to do, the rule wins. Open a PR to change the convention first; do not work around it inline.

## Test File Layout

- Tests are **colocated** with their component: `src/<Component>/<Component>.test.tsx`. Never use `__tests__/` folders, never split tests under a parallel tree.
- Shared test scaffolding lives under `src/_test/`:
  - `src/_test/setup.ts` — jsdom polyfills, global `expect.extend` wiring.
  - `src/_test/axe.ts` — axe-core configuration (rule disable list).
  - `src/_test/helpers.ts` — the three reusable assertion primitives (see below).
- Helper meta-tests live at `src/_test/helpers/<helper-name>.test.ts`. They are **not** component tests and are explicitly excluded from the WCAG-SC header guard.
- The leading underscore on `_test/` mirrors the existing `_hooks/` convention and signals "internal, not part of the public surface". The `tsup` build excludes test files by entry-list construction; Phase 26 will harden this.

## WCAG SCs Covered Header

Every `*.test.tsx` under `packages/components/src/*` (excluding `_test/`) **MUST** contain the literal marker `WCAG SCs covered:` within the first 30 lines. The marker lives inside a JSDoc block at the very top of the file:

```tsx
/**
 * WCAG SCs covered:
 * - 1.4.3 Contrast (Minimum) — variant colour assertions
 * - 2.1.1 Keyboard — Space/Enter activation
 * - 2.4.7 Focus Visible — focus ring smoke test
 * - 4.1.2 Name, Role, Value — aria-busy when loading, axe-clean
 */
```

This is enforced by `npm run test:wcag-headers` (script source: `scripts/check-wcag-headers.mjs`). The script is chained into `test:ci`, so a missing marker fails the build the same way a failing test does. The header has two purposes: (1) it forces the author to think about *which* WCAG criteria a test file actually exercises, and (2) it gives reviewers and downstream consumers a one-screen traceability view from test → standard.

## Tier Grammar

Each component test file uses **two top-level `describe` blocks**, named verbatim:

```tsx
describe('Tier 1: Table Stakes', () => { /* ... */ });
describe('Tier 2: A11y Differentiators', () => { /* ... */ });
```

- **Tier 1: Table Stakes** — the contract any sane component must meet:
  - Mounts without throwing.
  - Forwards `ref` to the right element.
  - Merges (does not replace) the `className` prop.
  - Honours documented props (variant/size/state) by rendering distinguishably.
  - `disabled` (or equivalent) prevents interaction.
- **Tier 2: A11y Differentiators** — what makes this library *prescriptive*:
  - axe-clean across each meaningful state (`expectNoAxeViolations`).
  - Required ARIA attributes are present and correctly valued.
  - Generated IDs are unique across multiple instances on one page (`expectUniqueIds`).
  - APG keyboard contract: Space/Enter, arrow keys, Home/End, Escape — whichever the role demands (`expectKeyboardSequence`).
  - Focus management (initial focus, restoration, trap behaviour) where the component's role requires it.

**Tier 3 (full APG conformance for complex widgets)** lives in Phase 24 plans (Combobox, DatePicker, MultiSelect, Tree, DataTable). Do not introduce a Tier 3 block in this phase.

## Helper Usage

Three primitives are exported from `src/_test/helpers.ts`. **Do not configure axe per-test** — use the helper. Per-test `configureAxe` is forbidden because it drifts from the shared rule disable list and produces silently inconsistent CI signal.

```tsx
import { expectNoAxeViolations, expectUniqueIds, expectKeyboardSequence } from '../_test/helpers';

// 1. Axe scan against the configured rule set
const { container } = render(<Button>Save</Button>);
await expectNoAxeViolations(container);

// 2. ID uniqueness across multiple mounted instances
const { container: c } = render(<><FormField label="A" /><FormField label="B" /></>);
expectUniqueIds(c);

// 3. APG keyboard contract — sequence of keys → expected focused element
await expectKeyboardSequence(user, [
  { key: '{ArrowDown}', expectFocused: () => screen.getByRole('option', { name: 'Banana' }) },
  { key: '{Enter}',     expectFocused: () => screen.getByRole('combobox') },
]);
```

## Anti-Patterns (Hard NO)

These are the six anti-patterns flagged for v0.6. Any of them blocks PR review:

- **No DOM snapshots** — `toMatchSnapshot` and `toMatchInlineSnapshot` for JSX trees lock structure rather than behaviour and rot at the first refactor.
- **No CSS-class selectors** — `querySelector('.btn')` couples the test to styling internals; use `getByRole` / `getByLabelText` / `getByText`.
- **No internal-state probing** — `.instance()`, hook-result inspection beyond the documented `renderHook` contract, or any reach into private fields.
- **No `data-testid` on library components** — Tier 1 and Tier 2 forbid them; query by accessible role, label, or text. (Tests for *consumer* apps may use them; the library itself does not.)
- **No `fireEvent.click` without a paired keyboard test** — every clickable widget gets a Space and/or Enter equivalence test (WCAG 2.1.1 Keyboard).
- **No coverage-percent chasing** — tie tests to specific WCAG SCs in the file header; do not pad to hit a number.

## Test Depth (~10–15 tests/component)

Aim for ~10–15 tests per component. Test **behaviours**, not the cartesian product of props. A `variant × size × state` matrix is almost always wrong; a handful of representative parametrised assertions plus the bug classes you actually care about is right. If a test file balloons past 25 cases, that is a smell — split into Tier 1/2 sub-describes or push exhaustive matrix work into a property-based suite (deferred to Phase 24+).

## Helper Meta-Tests

Per D-04, each helper in `src/_test/helpers.ts` has a sibling test at `src/_test/helpers/<helper-name>.test.ts`. Each meta-test covers:

1. **Happy path** — helper returns successfully on valid input.
2. **Failure-mode assertion** — helper throws clearly when its invariant is violated. This is **non-negotiable**: it is what prevents a buggy helper from producing silent green CI. Use the `toThrow(/regex/)` style for clarity:

   ```ts
   expect(() => expectUniqueIds(containerWithDuplicateIds)).toThrow(/duplicate id/i);
   ```

3. Any helper-specific edge cases (e.g. empty container, single element, async boundaries).

Meta-tests live under `_test/helpers/` and are **excluded** from the WCAG-SC header guard — they exercise the helper, not a component, and the WCAG mapping would be artificial.

## What This Library Does NOT Test

Be explicit about what is out of scope so authors do not waste effort or, worse, write a test that gives false confidence:

- **Colour-contrast (WCAG 1.4.3)** — jsdom has no layout engine; axe-core's contrast rule is disabled. Real-browser axe runs are deferred to v0.7+.
- **Region / landmark rules** — page-level concerns; component tests render in isolation, so landmark structure cannot be meaningfully asserted here.
- **Real focus advancement on Tab** — `user-event` simulates focus, but jsdom's tab order is not the browser's. Treat tab-order tests as smoke checks; trust real-browser runs (v0.7+) for the contract.
- **Animation timing visuals** — no snapshot of the in-flight transition; only the start/end states.

When in doubt, write the test, run it, then ask: "would this test fail if the component were broken in the way I care about?" If the answer is "no", delete the test rather than leave it as decoration.
