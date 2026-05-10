# v0.6 Components Quality — Stack Research

**Project:** `@holmdigital/components` v2.3.0
**Researched:** 2026-05-10
**Mode:** Subsequent-milestone targeted research (testing tooling + styling-strategy decision)
**Overall confidence:** HIGH
**Note:** Supersedes prior `STACK.md` (Australia/v0.5) for v0.6 scope. Prior file's content was milestone-specific and is no longer needed at this filename.

---

## 1. Current Stack Snapshot (no re-research)

| Layer | In place | Version |
|------|---------|---------|
| Test runner | Vitest | 4.0.16 |
| DOM | jsdom | 28.0.0 |
| React testing | @testing-library/react | 16.3.2 |
| Bundler | tsup (CJS+ESM+DTS, externalises react) | 8.3.5 |
| TS | strict mode | 5.7.2 |
| Icons | lucide-react | 0.556.0 |
| Styling today | **Mixed** — `className={className}` pass-through (Tailwind-shaped) on most components, inline `style={{}}` on a few (e.g. `Button.tsx:118`). No `tailwind.config`, no `tailwindcss` dep, no `@tailwind` directives in source. Effectively: Tailwind-class-shaped strings without the runtime — relies on consumer to ship Tailwind. |

The styling-strategy ambiguity is real: components emit class names like a Tailwind library would, but ship no CSS, no config, no peer-dep declaration, and no documentation telling consumers what to do. That is the gap v0.6 closes.

---

## 2. Recommended Additions

### Pick a single canonical stack

| Package | Version | Purpose | Bundle impact (consumer) | Recommendation |
|---------|---------|---------|--------------------------|----------------|
| `vitest-axe` (chaance) | 0.1.0 | jest-axe-style `toHaveNoViolations()` matcher for Vitest | devDep only — zero consumer impact | **DO NOT USE.** Unmaintained — last publish 4 years ago, only 8 dependents. |
| **`@chialab/vitest-axe`** | **0.19.1** (published ~Mar 2026) | Active fork; Vitest-native matcher | devDep only — zero consumer impact | **RECOMMENDED.** Drop-in `expect.extend(matchers)` + `toHaveNoViolations`. Active maintenance, supports current Vitest. |
| **`axe-core`** | **^4.11.1** (already in engine package) | Underlying a11y rules engine | devDep only | **REQUIRED.** Peer of `@chialab/vitest-axe`. Same major as engine — keeps rule parity across packages. HIGH confidence. |
| **`@testing-library/user-event`** | **^14.6.1** | Async keyboard / pointer simulation: `{Tab}`, `{ArrowDown}`, `{Escape}`, `{Enter}` etc. | devDep only | **REQUIRED.** v14 is async-only — every call needs `await`. De-facto standard for keyboard-interaction testing. Covers all four key categories the milestone calls out. |
| **`@testing-library/jest-dom`** | **^6.6.x** | DOM-shaped matchers: `toBeVisible`, `toHaveAttribute`, `toHaveAccessibleName`, `toHaveFocus` | devDep only | **REQUIRED.** Critical for ARIA assertions (`toHaveAccessibleName`, `toHaveAccessibleDescription`, `toHaveRole`). Works with Vitest via `expect.extend`. |

### Why this combination, not alternatives

- **`vitest-axe` (chaance)** — known/popular but dead. Last publish 2021. Has not tracked Vitest's evolution from 0.x → 4.x. Snyk and Socket both flag it as low-attention.
- **`jest-axe`** — original, still maintained (10.0.0). Works in Vitest in practice (Vitest's `expect.extend` is Jest-compatible), but ships Jest type globals that pollute the Vitest TS environment. The whole point of `vitest-axe` was to avoid that. Use `@chialab/vitest-axe` for clean types.
- **`@axe-core/react`** — runtime dev-mode checker (logs to console in your dev app). Different tool — for use *inside* a consuming app, not in unit tests. Out of scope for v0.6.
- **`keyboard-testing-library` (grunet)** — interesting but niche; aimed at full keyboard-traversal flows in real browsers. Overkill for a unit-test suite of 22 untested components. user-event v14 covers this milestone's needs.

### What you do NOT need to add

- Any new test runner — Vitest 4 stays.
- Any new DOM — jsdom 28 is fine. **Do not switch to happy-dom**: vitest-axe (and the chialab fork) are documented to break under happy-dom because of `Node.prototype.isConnected` quirks. HIGH confidence, multiple sources.
- A separate ARIA-assertion library — `@testing-library/jest-dom`'s `toHaveAccessibleName`, `toHaveAccessibleDescription`, `toHaveAccessibleErrorMessage`, and `toHaveRole` cover everything `aria-*` testable in jsdom. Anything beyond that (true screen-reader output) requires a real AT and is out of scope for unit tests — see §3.

### Total devDependency cost

Four small packages, all devDependencies. Zero impact on the published bundle. No change to peer dependencies. No change to tsup config.

---

## 3. Screen-reader-aware testing in Vitest + jsdom — reality check

There is no library in 2026 that runs a real screen reader inside vitest+jsdom. Honest landscape:

- **jsdom does not implement the accessibility tree.** It exposes `aria-*` attributes as DOM, but does not compute accessible name/role the way Chrome's accessibility inspector does.
- **`@testing-library/jest-dom`** computes accessible names *partially* via the same DOM-text walking heuristic — good enough to catch missing labels, mismatched `aria-labelledby` ids, missing `aria-describedby` wiring. This is what "screen-reader-aware" means in jsdom.
- **`axe-core`** (via `@chialab/vitest-axe`) catches the categories of violation that screen readers care about: missing labels, broken landmarks, name-from-content on icon-only buttons, role conflicts, contrast (when colour info is present).
- **Real AT testing** belongs in a different layer: Playwright + `@axe-core/playwright`, or Guidepup (NVDA/VoiceOver driver) in a separate e2e suite. **Out of scope for v0.6 unit testing.**

**Pragmatic guidance for the planner:** the Vitest test for each component should make three classes of assertion — (1) `toHaveAccessibleName` / `toHaveRole` from jest-dom for the static ARIA contract, (2) keyboard-interaction assertions via user-event (Tab traversal, Escape closes, Arrow navigates roving tabindex), (3) `expect(await axe(container)).toHaveNoViolations()` smoke check. That triad is the 2026 best practice for accessible-component unit tests.

---

## 4. Keyboard-interaction testing — beyond user-event?

**No, and you don't need it.** `@testing-library/user-event` v14.6.1 covers every key category v0.6 needs:

- `userEvent.tab()` and `userEvent.tab({ shift: true })` — tab order assertions
- `userEvent.keyboard('{Tab}{ArrowDown}{ArrowUp}{Home}{End}{Enter}{Escape}{Space}')` — covers Modal, NavigationMenu, Combobox, Select, RadioGroup, MultiSelect, DatePicker, TreeView, Tabs, Accordion, Pagination — i.e. every interactive component in the package.
- Async-by-default in v14 — matches Vitest's async-friendly assertions.

Niche options exist (`keyboard-testing-library` for keyboard-only e2e flows in real browsers; Vitest's experimental browser-mode interactivity API) but they target a different problem (real-browser end-to-end traversal) and add operational complexity (real browser binary in CI). **Skip them for v0.6.**

---

## 5. Tailwind decision — concrete recommendation

### Recommendation: **Convert to inline styles. Drop the Tailwind shape entirely.**

### Why this fits THIS library

| Factor | Bearing on the decision |
|--------|------------------------|
| **The product is "accessible by default"** | Consumers should get correct output the moment they `npm install`. A peer-dep on Tailwind means a fresh install renders unstyled — directly contradicts the value prop. |
| **Consumers are heterogeneous** | Government compliance buyers, public-sector CMS integrations, agency teams. Many will not be Tailwind shops, and will not be willing to add a build-time CSS framework just to render an accessibility statement. |
| **Tailwind v4 changed configuration model** | Anyone you ship Tailwind-v3-shaped classes to in 2026 has to migrate. Anyone on v4 needs `@source` directives pointing at your `node_modules`. Both are friction the library should not impose. (Source: Tailwind Labs Discussion #18545.) |
| **The components today already mix `className` pass-through with `style={{}}`** | The "Tailwind library" claim is half-true at best. You're not abandoning a working system — you're committing to the inline path that's already half-built. |
| **Bundle cost of inline styles is small for this surface** | 29 components, mostly simple. Inline-style runtime cost ≈ a few hundred bytes per component of style objects. No CSS-in-JS runtime needed (no styled-components, no emotion). Just plain `style={{}}` literals. Zero new deps. |
| **Tree-shaking already works per-component** | Subpath exports mean a consumer pulling `@holmdigital/components/Button` should ship one component's bytes, not 29. Inline styles preserve this; a shared CSS file would not. |
| **Storybook is currently broken (esbuild vuln)** | Eliminating Tailwind also eliminates one whole class of Storybook integration headaches (Tailwind+Storybook+Vite-builder PostCSS config). |

### What the alternative buys you, and why it loses

| Path | Benefit | Cost | Verdict |
|------|---------|------|---------|
| **Hard peer-dep on Tailwind** + ship a config preset + document `@source` directive | Smaller per-component output; consumer can theme with their own design tokens | Mandatory consumer setup step; v3 vs v4 split; breaks for non-Tailwind consumers; documentation burden across 14 locales of statement output | **Reject.** Setup-cost-to-benefit ratio is wrong for a regulatory-compliance library whose buyers are not necessarily front-end shops. |
| **Ship a compiled CSS file** (`@holmdigital/components/styles.css`) | Works for any consumer with a CSS pipeline | Defeats per-component tree-shaking; requires consumers to remember a side-effect import; pollutes their cascade | **Reject.** Side-effect imports are an anti-pattern for a typed-API library. |
| **shadcn-style copy-paste registry** | Maximum consumer ownership, on-trend for 2026 | Wrong distribution model — accessibility statements are a contract, not a starter; updates would be lossy | **Reject.** Doesn't fit a versioned-compliance product where you *want* consumers on your latest patch. |
| **Inline styles (recommended)** | Zero consumer setup; renders correct on first install; preserves subpath tree-shaking; no version conflict surface | Small runtime cost; theming requires an explicit prop API (already partially present via `className`); design-token story has to be re-thought | **ACCEPT.** Aligns with "prescriptive, accessible by default." |

### Migration shape (for the planner)

1. Audit components for current Tailwind-shaped class usage.
2. Convert utility classes → inline `style={{}}` objects, keeping `className` as an additive pass-through (`className={[baseClass, className].filter(Boolean).join(' ')}`) so consumers can still override.
3. Define a tiny shared `tokens.ts` (spacing, focus-ring colour, error red) — single source of truth, reused across components.
4. Document the prop-based theming surface in each component's README.

---

## 6. Integration notes — slotting into existing tsup/vitest/jsdom

**No tsup changes required.** Test-only deps don't enter the bundle. The `--external react` / `--external @holmdigital/standards` flags stay as-is.

**Vitest config (currently absent in `packages/components`)** — add a minimal `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',          // not happy-dom (axe incompatibility)
    setupFiles: ['./test/setup.ts'],
    globals: false,                 // explicit imports; matches engine package
  },
});
```

**`test/setup.ts`:**

```ts
import * as matchers from '@chialab/vitest-axe/matchers';
import * as jestDom from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
expect.extend({ ...jestDom, ...matchers });
```

**`tsconfig.json` types array** — append `"@chialab/vitest-axe/matchers"` and `"@testing-library/jest-dom"` so `toHaveNoViolations` and `toHaveAccessibleName` type-check.

**Per-component test pattern** — colocate as `src/Button/Button.test.tsx`, mirroring the existing 7 test files. tsup already excludes `*.test.*` from the build.

**CI** — `npm run test:ci -w @holmdigital/components` already exists. No workflow change needed.

---

## 7. Confidence assessment

| Claim | Confidence | Why |
|-------|------------|-----|
| `vitest-axe` (chaance) is unmaintained | HIGH | npm metadata + Snyk + Socket all confirm last publish 4 years ago |
| `@chialab/vitest-axe` is the active fork to use | HIGH | npm shows recent 0.19.1 publish; official chialab/rna docs cover Vitest setup |
| user-event v14 covers all required keyboard categories | HIGH | Official testing-library docs enumerate every key in `keyMap.ts` |
| jsdom + axe + jest-dom is the unit-test ceiling for a11y | HIGH | Multiple sources; vitest-axe README warns about happy-dom incompatibility |
| Tailwind peer-dep is the wrong choice for THIS library | HIGH | Composite of: tailwindlabs/tailwindcss#18545 (consumer-side config burden), v3↔v4 split, and the product's "works on install" promise |
| Inline-style migration is tractable | MEDIUM | Verified Button.tsx already uses inline styles in spots; full audit of all 29 components is a planning-phase task, not done here |

---

## Sources

- [@chialab/vitest-axe on npm](https://www.npmjs.com/package/@chialab/vitest-axe)
- [chaance/vitest-axe (unmaintained fork) on npm](https://www.npmjs.com/package/vitest-axe)
- [chaance/vitest-axe README](https://github.com/chaance/vitest-axe/blob/main/README.md)
- [jest-axe on npm](https://www.npmjs.com/package/jest-axe)
- [@testing-library/user-event v14 docs](https://testing-library.com/docs/user-event/intro/)
- [user-event keyboard API](https://testing-library.com/docs/user-event/keyboard/)
- [user-event keyMap source](https://github.com/testing-library/user-event/blob/main/src/keyboard/keyMap.ts)
- [Tailwind Labs Discussion #18545 — distributing libraries with Tailwind v4](https://github.com/tailwindlabs/tailwindcss/discussions/18545)
- [React Component Libraries 2026 (Builder.io)](https://www.builder.io/blog/react-component-libraries-2026)
- [Top Headless UI libraries for React 2026 (GreatFrontEnd)](https://www.greatfrontend.com/blog/top-headless-ui-libraries-for-react-in-2026)
- [Best React Component Libraries 2026 (PkgPulse)](https://www.pkgpulse.com/blog/best-react-component-libraries-2026)
- [vitest-axe Snyk advisor](https://snyk.io/advisor/npm-package/vitest-axe)
