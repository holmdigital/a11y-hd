# Pitfalls — v0.6 Components Quality Milestone

**Domain:** React component library a11y testing + styling-strategy migration
**Researched:** 2026-05-10
**Confidence:** HIGH for testing/jsdom traps (verified against Testing Library, vitest-axe, jsdom docs); MEDIUM for styling-migration traps (synthesised from Tailwind/inline-style ecosystem patterns and the codebase's own structure).

> Supersedes the previous PITFALLS.md (AU-jurisdiction milestone, 2026-03-27). That research is preserved in git history.

Each pitfall lists: **Warning sign**, **Prevention**, **Where to address** (phase / task / file). Phases continue from v0.5 — v0.6 starts at Phase 22.

---

## Theme 1: Test Coverage Pitfalls

### 1.1 Snapshot Test Addiction

**What goes wrong:** A wave of new tests is added quickly by snapshotting rendered output (`toMatchSnapshot()`, `toMatchInlineSnapshot()`). Coverage skyrockets, but every harmless markup change (className tweak, ARIA attribute reorder, whitespace) breaks dozens of tests at once. Maintainers rubber-stamp `-u` updates; real regressions hide in the diff.

**Warning sign:**
- More than ~2 snapshots per component file.
- Tests named `it('renders correctly')` with only a snapshot assertion.
- Reviewers asking "what changed?" when running `vitest -u`.
- Snapshot files larger than the source file.

**Prevention:**
- Forbid full DOM snapshots in component tests. Use targeted assertions: `expect(getByRole('button', { name: /save/i })).toHaveAttribute('aria-pressed', 'true')`.
- Snapshots are acceptable ONLY for stable serialised data (e.g., the JSON shape of a hook's return value), never for JSX trees.
- Add an ESLint rule via `eslint-plugin-vitest` (or a custom rule) banning `toMatchSnapshot` in `*.test.tsx`.

**Where to address:** Phase 22 task "Test scaffold + conventions" — write a one-page TESTING-CONVENTIONS.md in `packages/components/` and add the lint rule before any new component test file lands.

---

### 1.2 Testing Implementation Details (refs, useState, internal hooks)

**What goes wrong:** Tests reach into React internals (`.instance()`, `useRef` values, internal state setters) and break on any refactor that preserves observable behaviour. The existing `Tooltip.test.tsx` is a good model — it asserts only on DOM output and `document.activeElement`. New test authors may regress to internal-state probing.

**Warning sign:**
- Imports from `react-dom/test-utils` for anything beyond `act`.
- Tests that fail when the component is refactored without behaviour change.
- Assertions on prop values passed to child components (rather than rendered output).

**Prevention:**
- Test from the user's perspective: keyboard input, pointer events, screen-reader-discoverable output.
- Codify the pattern from `Tooltip.test.tsx` (focus trigger → assert role + activeElement) as the house style.
- Forbid `wrapper.instance()` and direct hook-result inspection (use `renderHook` only for utility hooks, asserting return value contract).

**Where to address:** Phase 22 conventions doc; pair-review the first 3 component test files (Button, FormField, Modal) to set tone before scaling out.

---

### 1.3 Brittle Selectors (querySelector chains, test-ids everywhere)

**What goes wrong:** `container.querySelector('.btn > span:nth-child(2)')` couples the test to the DOM tree shape. The Tailwind→inline-style migration will change class names — every querySelector-based test breaks at once.

**Warning sign:**
- Any `container.querySelector` or `getElementsByClassName` in a test.
- `data-testid` on every element rather than reserved for "I genuinely cannot query this any other way" cases.
- Selectors that include className tokens.

**Prevention:**
- Mandate `getByRole` first, `getByLabelText` / `getByText` second, `getByTestId` only as a documented escape hatch (e.g., the wrapper element of a portal-rendered component).
- Install **`eslint-plugin-testing-library`** with `prefer-screen-queries`, `no-container`, `no-node-access`, `prefer-find-by`, `await-async-queries` enabled.
- Migration safety net: a test suite that survives a className overhaul is testing the right thing. Any test that breaks ONLY because className changed is a bad test.

**Where to address:** Phase 22 conventions task adds `eslint-plugin-testing-library` to `packages/components/package.json`. Wire into existing build/lint script. The Phase 24+ styling migration should be a no-op for tests if this is enforced.

---

### 1.4 jest-axe / vitest-axe False Positives & Noise

**What goes wrong:** `axe-core` in jsdom flags rules that need a real layout engine (color-contrast, region detection, link-in-text-block). Authors either:
(a) suppress everything globally — losing real signal in CI when the engine eventually runs in a browser; or
(b) accept the noise and stop reading axe output ("warning fatigue").

Additionally, axe-core fires on missing `<main>`, missing `lang` attribute, etc., when a component is tested in isolation — these are page-level rules, not component rules.

**Warning sign:**
- `axe.run` results never asserted on, or asserted with `expect(results.violations.length).toBeLessThan(50)`.
- Per-test rule disables that drift across files.
- Tests that pass `vitest-axe` but the component fails when rendered in Storybook/browser.

**Prevention:**
- Centralise axe config in a single helper (`packages/components/src/_test/axe.ts`) that disables ONLY the rules that genuinely cannot run in jsdom: `color-contrast`, `region`, `landmark-one-main`, `page-has-heading-one`, `bypass`, `meta-viewport`, `document-title`, `html-has-lang`. Document each disable.
- All component tests must call this shared helper — never call `configureAxe` per-file.
- Plan a Phase-N follow-up that runs axe-core in a real browser (Playwright Component Testing or Storybook test-runner) for the rules jsdom can't cover. Out of scope for v0.6 — flag it in PROJECT.md.

**Where to address:** Phase 22 (axe helper); Phase 23+ component tests use it. Add to PROJECT.md "Out of Scope" — "Real-browser axe-core run for layout-dependent rules — defer to v0.7+".

---

### 1.5 Coverage-Metric Chasing

**What goes wrong:** Team targets 80%/90% line coverage to satisfy a CI gate. Authors write tests that exercise code paths without asserting meaningful behaviour: `render(<Button variant="ghost" />)` with no assertion, just to hit the variant branch.

**Warning sign:**
- Tests with `render()` calls but few `expect()` calls.
- "Coverage went up but I can't say what we'd catch."
- New bugs ship despite 90% coverage.

**Prevention:**
- Frame the milestone goal in PROJECT.md as **bug-surface coverage, not line coverage**. Each component test file must enumerate, in a top-of-file comment, the WCAG SCs / a11y behaviours it covers (the existing `Tooltip.test.tsx` describes "WCAG 2.1 SC 1.4.13" — use this as the template).
- Coverage thresholds, if added, apply per-file at a modest level (e.g., 70%). The goal is "every priority component has at least one focus-management, one keyboard, one ARIA test", not a global percent.
- Code-review checklist: "Does this test describe a user-observable behaviour or a WCAG SC?"

**Where to address:** Phase 22 conventions doc; Phase 26 (or whichever phase introduces CI coverage gating).

---

### 1.6 Async Test Flakiness in jsdom (timers, microtasks, useEffect)

**What goes wrong:** `useEffect` runs asynchronously. Setting state in an effect, then asserting on DOM, races with React's scheduler. Tooltip's setTimeout-based open/close logic is exactly the failure surface — fake-timer tests work for someone, then flake on CI.

The existing Tooltip test pattern (`vi.useFakeTimers()` + `act(() => vi.advanceTimersByTime(ms))`) is correct. New authors copying without understanding mix `setTimeout` (faked) with `Promise.resolve` (microtask, NOT faked by default in vitest) and get phantom-passing tests.

**Warning sign:**
- Test passes locally, fails on CI or vice versa.
- `await new Promise(r => setTimeout(r, 0))` sprinkled to "make it pass".
- Tests that pass when run alone but fail when run with others (state leakage from `cleanup()` not being called).

**Prevention:**
- Standardise on the Tooltip pattern: `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` + `cleanup()` in `afterEach`.
- For microtasks, use `await act(async () => {})` or vitest 4's `vi.useFakeTimers({ toFake: ['setTimeout', 'queueMicrotask', 'Promise'] })` explicitly.
- Wrap focus calls in `act(() => trigger.focus())` — non-act focus changes get warnings AND can race.
- Use `findBy*` (returns Promise, retries) for any state that arrives via `useEffect`; never `getBy*` immediately after a state change.

**Where to address:** Phase 22 conventions doc; specifically Modal, Toast, Combobox, DatePicker tests (Phase 23+) — these all have animation/timing logic.

---

### 1.7 Tests Pass in jsdom, Break in Real Browsers

**What goes wrong:** jsdom does not implement layout, focus advancement on Tab, scroll, or many a11y APIs. Components that use `getBoundingClientRect`, `scrollIntoView`, `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `Element.animate`, `:focus-visible` matching, or `inert` behave differently. A test that asserts a Combobox listbox "scrolls the active option into view" in jsdom is asserting nothing — `scrollIntoView` is a no-op.

**Warning sign:**
- Component uses any of the APIs above and the test asserts the resulting visual/scroll behaviour.
- `window.matchMedia` mocked in `setup.ts` to always return `false` (silently flipping all responsive logic).
- Component uses `dialog.showModal()` — jsdom only partially implements `<dialog>`.

**Prevention:**
- Maintain an explicit jsdom-shim file (`packages/components/src/_test/setup.ts`) that polyfills `IntersectionObserver`, `ResizeObserver`, `matchMedia`, `scrollIntoView`, `Element.animate` with documented stubs (return values must be predictable, not always-falsy).
- For `<dialog>`-using components (Modal, Dialog), test `aria-modal`, `role="dialog"`, focus trap, Escape — NOT `open` attribute behaviour or top-layer rendering.
- Document in TESTING-CONVENTIONS.md: "If your component depends on layout or animation timing for correctness, defer that assertion to a future browser-based test phase. Test the contract (ARIA, keyboard, focus), not the visuals."

**Where to address:** Phase 22 (shim file + doc); flag affected components in Phase 23 task list (Modal, Dialog, Combobox, DatePicker, Tooltip — anything that positions itself).

---

## Theme 2: Styling Migration Pitfalls (Tailwind ↔ inline-style)

### 2.1 Lost Responsive Breakpoints

**What goes wrong:** Tailwind's `md:flex lg:grid` cannot be expressed in a `style` prop. Naive migrations drop responsiveness silently — the desktop layout becomes the only layout. Mobile users get a broken UI; visual tests don't catch it because all viewports are the same in jsdom.

**Warning sign:**
- Any Tailwind class with a breakpoint prefix (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) being removed without a CSS-in-JS or stylesheet replacement.
- After migration, components look identical on desktop but mobile is untested.

**Prevention:**
- Before migration, **audit** every component for breakpoint-prefixed classes. Output an inventory file (`packages/components/STYLING-INVENTORY.md`) listing each component and what breakpoints it uses.
- For components that need responsive behaviour, the inline-style strategy is **insufficient** — use one of:
  (a) a small CSS file shipped with the package and imported (`import './Modal.css'`);
  (b) container queries via inline `@container` rules in a `<style>` element scoped to the component;
  (c) explicitly document "this component is not responsive — wrap it in your own breakpoint logic".
- Decision must be made BEFORE the migration phase starts.

**Where to address:** Phase 22 task "Styling-strategy decision document" must enumerate breakpoint requirements per component and pick a strategy (the milestone goal already calls for this).

---

### 2.2 Pseudo-State Styling Cannot Go Inline (HIGHEST SEVERITY)

**What goes wrong:** `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:disabled`, `::placeholder`, `[aria-expanded="true"]` selectors do not work in `style={{}}`. A naive Tailwind-to-inline rewrite of `hover:bg-blue-700 focus-visible:ring-2` produces a button with no hover state and no focus indicator — **a WCAG 2.4.7 (Focus Visible) violation shipped by the very library that exists to prevent it.**

This is the single highest-severity migration pitfall — it directly contradicts the library's value proposition.

**Warning sign:**
- `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:` Tailwind prefixes anywhere in the source.
- Migration PR diff shows pseudo-state classes deleted with no replacement.
- After migration: tabbing through a form shows no focus ring on any input.

**Prevention:**
- **Pure inline `style` is not viable for prescriptive a11y components.** Pseudo-states and focus indicators are non-negotiable for WCAG compliance.
- Three acceptable strategies, in preference order:
  1. **CSS file per component** (`Button.tsx` + `Button.css`, imported by the component). tsup can bundle CSS or leave it as a side-effect import. Most predictable; works in SSR.
  2. **Single global stylesheet** (`@holmdigital/components/styles.css`) consumers must import once. Smaller bundle, but consumers can forget.
  3. **`onFocus`/`onBlur`/`onMouseEnter`/`onMouseLeave` handlers driving inline-style state** — verbose, ugly, breaks `:focus-visible` semantics (you cannot distinguish keyboard from mouse focus). **Reject this option** unless absolutely no CSS is allowed.
- **Audit gate:** every component touched in migration must have a test that asserts the focus indicator renders (structural assertion that the className/style/data-attribute hook is present; defer real-browser pixel-level verification to v0.7+).

**Where to address:** Phase 22 styling-strategy doc must explicitly pick the pseudo-state strategy. Phase 24+ (the migration phases) must include a "focus-visible smoke test" per component.

---

### 2.3 Theming / Customisation API Breaks

**What goes wrong:** Consumers of the current Tailwind components extend styles with their own classes (`<Button className="my-extra-class">`). After migration to inline-style, `className` may still be accepted but loses precedence — inline-style always wins. Or worse, inline-style is hard-coded with no way for consumers to override colours/spacing.

**Warning sign:**
- `<Button color="primary">` works but `<Button style={{ background: 'red' }}>` is silently overridden.
- No theming tokens exposed.
- Downstream consumers report "I can't change the button colour any more."

**Prevention:**
- Define the theming contract BEFORE migration:
  - Either: accept `style` and `className` props and merge with inline defaults via spread (`style={{ ...defaults, ...userStyle }}`).
  - Or: expose CSS variables (`--hd-button-bg`) that consumers override at any level.
- Document the supported customisation surface in the component's README. Test that `style` and `className` overrides work.
- Treat any breaking change to the theming contract as a major-version bump (component package would go 2.x → 3.x).

**Where to address:** Phase 22 styling-strategy doc; Phase 24+ include "theming contract" tests per migrated component.

---

### 2.4 SSR Hydration Mismatches

**What goes wrong:** Inline-style strategies that derive style from `useEffect`-set state (e.g., reading `window.matchMedia` to pick a breakpoint) render differently on server vs client. React 18 strict-mode hydration warnings appear; the client render flashes an unstyled state.

CSS-in-JS approaches (emotion, styled-components) have their own SSR ceremony — choosing one mid-migration adds peer-dep weight and SSR-config burden on consumers (Next.js App Router, Remix, etc.).

**Warning sign:**
- "Hydration mismatch" warnings in browser console after migration.
- Component looks correct after a beat, but flashes during initial paint.
- `useEffect`-driven className or style changes.

**Prevention:**
- Prefer strategies that work identically server-side and client-side: plain CSS files, CSS variables, or static inline-style.
- If responsive behaviour is needed, prefer CSS media queries (work in SSR) over JS-driven `matchMedia` (does not work in SSR).
- Skip CSS-in-JS runtime libraries (emotion, styled-components) for this milestone — they shift complexity onto consumers and add bundle weight; the library is already self-contained.
- Test SSR with a Next.js or Remix smoke test if any consumer uses SSR (currently unknown — flag for investigation).

**Where to address:** Phase 22 styling-strategy doc must pick an SSR-safe approach. Add to PROJECT.md "Open Questions" — "Do any consumers use the components in SSR / RSC contexts?"

---

### 2.5 Visual Regression That Linting Cannot Catch

**What goes wrong:** Migration completes, all tests pass, axe is green — but the visual output is subtly broken: padding off, colour wrong, icon misaligned. There is no screenshot baseline today (Storybook is dev-only and gated on esbuild patch per CONCERNS.md), so reviewers approve diffs they cannot see.

**Warning sign:**
- Big PR with hundreds of style-only changes, no screenshots in the description.
- Reviewer comments "looks fine to me" with no actual rendering.
- Bug reports the week after release: "the button is the wrong colour now".

**Prevention:**
- For this milestone, accept the limitation: visual regression coverage is out of scope (Storybook test-runner blocked).
- Mitigations within scope:
  - Migrate one component at a time, with a dedicated PR per component, including before/after screenshots in the PR description (run the component in a local Vite playground or the existing engine's HTML report and screenshot manually).
  - Maintain a `visual-spot-check.md` checklist in the milestone folder listing each migrated component with a "spot-checked by" note.
- Flag for follow-up milestone: unblock Storybook and add Chromatic / Playwright Component Testing for visual diffs.

**Where to address:** Phase 22 docs the spot-check process. Add to PROJECT.md "Out of Scope" — "Automated visual regression testing — defer until Storybook esbuild patch lands".

---

## Theme 3: A11y-Specific Test Bugs That Ship Despite Green CI

### 3.1 Asserting aria-label Presence But Not Validity

**What goes wrong:** Test asserts `expect(button).toHaveAttribute('aria-label', 'Close')` and passes. But the actual button also has visible text "Close", producing a redundant accessible name; or the same component is rendered twice in a list, producing duplicate IDs that break `aria-labelledby` resolution; or the label references an `id` that doesn't exist in the DOM.

**Warning sign:**
- Tests assert attribute presence but never the **computed accessible name**.
- `aria-labelledby="some-id"` with no test that "some-id" actually exists in the same render.
- Multiple instances of a component in one render cause duplicate IDs and no test catches it.

**Prevention:**
- Use `getByRole('button', { name: /close/i })` — Testing Library computes the accessible name following the W3C accname algorithm. If the name isn't right, the query fails.
- For ID-referencing attributes (`aria-labelledby`, `aria-describedby`, `aria-controls`, `htmlFor`), write an explicit assertion: `const id = trigger.getAttribute('aria-controls'); expect(container.querySelector('#' + CSS.escape(id))).not.toBeNull();` (the existing Tooltip test does this with describedby — replicate the pattern).
- Render two instances in a "duplicate-IDs" test for any component that auto-generates IDs (`useId`). Assert no duplicate IDs in the document.

**Where to address:** Phase 22 conventions doc adds this as a required test pattern for any component using `useId` or `aria-*` ID references. Targets: FormField (label↔input via `htmlFor`/`id`), Modal (`aria-labelledby`), Combobox (`aria-controls`/`aria-activedescendant`), Tooltip (already done — use as template).

---

### 3.2 Missing Live-Region Announcement Tests

**What goes wrong:** Components like Toast, ErrorSummary, FormField (error state), DatePicker (selected date), Combobox (results count) need `aria-live` regions so screen readers announce changes. Tests assert the visual rendering but never that the live region exists, has the right politeness, and updates when the data changes.

**Warning sign:**
- Toast component test asserts text appears, but no assertion on `role="status"` / `role="alert"` / `aria-live`.
- ErrorSummary updates without `aria-live="polite"` or `role="alert"`.
- FormField error message renders into a `<div>` with no live-region semantics.

**Prevention:**
- For each component with dynamic state visible to users, mandate a test asserting:
  - The live region exists (`getByRole('status')` or `getByRole('alert')`).
  - It has correct politeness (`aria-live="polite"` for status, `assertive` for alerts; `role="alert"` implies `assertive` + `atomic`).
  - It updates when the state changes (re-render, assert new content).
  - For initially-empty regions: the region is in the DOM at mount (some screen readers don't pick up regions added later).

**Where to address:** Phase 23+ tests for Toast, ErrorSummary, FormField, Combobox, DatePicker explicitly require live-region tests. Add to TESTING-CONVENTIONS.md a "Live regions" section.

---

### 3.3 Focus-Management Bugs Surface Only with Keyboard Navigation

**What goes wrong:** Click-based tests (`fireEvent.click(button)`) bypass keyboard semantics entirely. A button that opens a Modal with `onClick` works in a click-test but, if the Modal doesn't move focus inside, a keyboard user is stranded. Conversely, Modal correctly traps focus on Tab — but `fireEvent.keyDown(el, { key: 'Tab' })` does NOT actually move focus in jsdom; `Tab` key handling is a browser behaviour, not a DOM event side-effect.

**Warning sign:**
- Tests use `fireEvent.click` exclusively for triggering opens/closes.
- Focus-trap tests fire `Tab` keydown and assert focus moved — but the move only happens because the component's own keydown handler called `.focus()` (not because Tab moves focus natively in jsdom).
- No test for "what happens when a keyboard user Shift+Tabs out of the focusable element backward".

**Prevention:**
- For interactive components, write keyboard-driven tests using `@testing-library/user-event` v14+ (which simulates more realistic event sequences including focus advancement on Tab). `fireEvent.keyDown` is fine for components that handle Tab themselves (focus trap, roving tabindex), but document that you are testing the handler, not the browser default.
- For focus restoration (Modal close → focus returns to opener), the `useFocusTrap` hook in `_hooks/useFocusTrap.ts` already does this — test it directly: render a Modal, focus a button that opens it, assert focus is inside; close, assert focus returned to the opener button. Pattern is "render → focus opener → open → assert inside → close → assert opener".
- Test Escape, Tab cycling, Shift+Tab cycling, and arrow-key navigation (for Listbox, Menu, Combobox, RadioGroup, Tabs) explicitly per WAI-ARIA Authoring Practices keyboard interactions.

**Where to address:** Phase 22 install `@testing-library/user-event`; conventions doc lists the WAI-ARIA APG keyboard patterns expected for each composite-widget component. Phase 23+ Modal, Combobox, RadioGroup, Tabs, Menu tests must follow.

---

### 3.4 jsdom Does Not Implement Certain a11y APIs

**What goes wrong:** Beyond layout APIs, jsdom is missing or partial on:
- `matchMedia` — undefined; without polyfill, any `prefers-reduced-motion` / `prefers-color-scheme` logic crashes or short-circuits.
- `IntersectionObserver`, `ResizeObserver` — undefined; components that use them for visibility/sizing crash on mount.
- `Element.scrollIntoView` — present but no-op; cannot assert "active option scrolled into view".
- `HTMLDialogElement.showModal()` / `close()` — partially implemented (varies by jsdom version); `inert` attribute support is recent.
- `document.activeElement` — present but quirky: focusing a non-tabbable element silently fails, and focus does not move when an element is removed from the DOM (real browsers move focus to body or fall through; jsdom may leave activeElement dangling).
- `Element.animate` / Web Animations API — undefined.
- Speech Synthesis / Speech Recognition — undefined.
- Clipboard API — partial.

**Warning sign:**
- Test crashes with `IntersectionObserver is not defined`.
- Test for "scroll active option into view" passes trivially (the function is a no-op).
- Focus-trap tests behave differently locally vs CI (different jsdom version).

**Prevention:**
- Single shared setup file `packages/components/src/_test/setup.ts` registered in `vitest.config.ts` `setupFiles`. Polyfill the minimum needed APIs with predictable stubs. Document each.
- For `IntersectionObserver` / `ResizeObserver`: `globalThis.IntersectionObserver = class { observe(){}; unobserve(){}; disconnect(){}; takeRecords(){return [];} };` — components see "observer present, never fires", which is the correct testable contract.
- For `matchMedia`: stub with predictable false-by-default + per-test override hook (`vi.stubGlobal('matchMedia', () => ({ matches: true, ... }))`).
- For `useFocusTrap`: see 4.2 — the `offsetParent` filter has a known jsdom quirk.

**Where to address:** Phase 22 (setup file + documented stubs); Phase 23 useFocusTrap test specifically must include a "container with all-`<button>` children" case to verify focusables are returned correctly under jsdom.

---

### 3.5 Color-Contrast Checks Need a Real Browser

**What goes wrong:** axe-core's `color-contrast` rule needs computed-style + actual rendered colors. jsdom returns empty strings for most computed style properties; axe either silently skips the rule or reports false positives. Tests that "verify color contrast" in jsdom verify nothing.

**Warning sign:**
- Test asserts `expect(violations).toContainEqual(expect.not.objectContaining({ id: 'color-contrast' }))` — passes vacuously because the rule did not run.
- Designer changes a button colour to low-contrast variant; tests pass; ships.

**Prevention:**
- Disable `color-contrast`, `link-in-text-block`, `region`, `landmark-*` in the shared axe config (1.4 above). Document explicitly: "These rules require a layout engine; covered by future browser-based test phase."
- For now, visual contrast is a **manual review** item. Add to the migration spot-check checklist (2.5): "Confirm focus indicator and text contrast meet WCAG AA in a real browser."
- Long-term: Playwright Component Testing or Storybook test-runner with axe; flag as v0.7+ scope.

**Where to address:** Phase 22 axe config; PROJECT.md "Out of Scope" note about real-browser axe.

---

## Theme 4: Library-Specific Pitfalls

### 4.1 lucide-react Runtime Dependency Footprint

**What goes wrong:** `lucide-react` is a peer or runtime dep for components that ship with default icons. Each `import { ChevronDown } from 'lucide-react'` pulls in tree-shakeable icons — but only with proper bundler config. If a consumer's bundler does not tree-shake, the entire icon library ships. Worse: if migration adds more icons mid-rewrite, the bundle grows silently. Test impact: vitest runs lucide-react in Node — every icon import creates an SVG element; lucide-react's API may change between versions.

**Warning sign:**
- `package.json` lists `lucide-react` as `dependencies` (forces install) rather than `peerDependencies` + `devDependencies` (consumer chooses).
- Bundle size jumps after a migration PR with no explanation.
- Tests that snapshot include full SVG path data — brittle to lucide version bumps.

**Prevention:**
- Audit `packages/components/package.json`: `lucide-react` should be `peerDependencies` + `peerDependenciesMeta.optional: true` if components can render without icons (with a fallback like `▾`), or document it as a hard peer dep.
- For tests, never assert on SVG path data. Assert on `aria-hidden="true"` (decorative icons must be hidden from AT) or on a stable test-id wrapping the icon.
- Pin the major version of `lucide-react` in peer range; component tests verify the import surface, not the rendered SVG.

**Where to address:** Phase 22 task "audit runtime deps"; document in STACK.md / styling decision doc.

---

### 4.2 useFocusTrap + jsdom activeElement Quirks

**What goes wrong:** `useFocusTrap` does:
1. `document.activeElement` snapshot for opener — in jsdom, if no element was focused, this returns `<body>`. On unmount, it tries to restore focus to `<body>`, which is harmless but may surface weird behaviour in tests that assert on focus location.
2. `getFocusable` filters by `el.offsetParent !== null` — **jsdom does not implement layout, so `offsetParent` returns `null` for most elements, even visible ones**. This means the hook may find ZERO focusables in jsdom for an element it would correctly trap in a browser.
3. Tab handler reads `document.activeElement` and calls `.focus()` on first/last — works in jsdom because we are explicitly calling focus.

**Warning sign:**
- Modal/Dialog test: "should focus first focusable on open" — fails because `getFocusable` returns `[]`.
- Modal test: "Tab cycles back to first" — fails for the same reason.
- Test passes when a single element is in the container, fails with multiple (or vice versa).

**Prevention:**
- In the shared test setup, provide a jsdom shim that makes `offsetParent` return the element's parent for elements without `display: none` set inline. Or:
- Refactor `getFocusable` to use a more jsdom-friendly visibility check: skip the `offsetParent` filter entirely and rely on `:not([disabled])` + `[tabindex]:not([tabindex="-1"])`. Document the trade-off (real browsers also skip `display:none` elements, but the focusable selector is the right primary filter; visibility is a secondary concern that browsers handle natively when `.focus()` is called on an invisible element — it just no-ops).
- Test `useFocusTrap` directly with a dedicated `useFocusTrap.test.tsx` that exercises:
  (a) container with multiple focusables — assert first gets focus.
  (b) container with `initialFocusRef` — assert that element gets focus.
  (c) Tab/Shift+Tab cycles correctly.
  (d) Restore focus on unmount.
  (e) Container with no focusables — assert no crash, focus moves to container itself.

**Where to address:** Phase 23 (or the phase that introduces shared-hook tests) — add `useFocusTrap.test.tsx` BEFORE testing Modal, Dialog, NavigationMenu (which depend on it). Refactor `_hooks/useFocusTrap.ts` only if the offsetParent issue is reproducible; otherwise polyfill.

---

### 4.3 AccessibilityStatement is 1018 Lines of Locale Conditionals

**What goes wrong:** v0.6 PROJECT.md explicitly puts AccessibilityStatement refactor "out of scope" because it has 131 tests. **However:** if any shared utility (`_hooks`, formatting helpers) is touched during the milestone, AccessibilityStatement may regress in ways the existing 131 tests do not cover (they test prose output, not focus management or interactive behaviour — the component is not very interactive). And: per Known Bugs in CONCERNS.md, `country='US'` already renders empty `{<national_law>}`. Test coverage gives false confidence here.

**Warning sign:**
- A `_hooks` refactor passes all tests but AccessibilityStatement breaks visually.
- The existing 131 tests pass, but the US-broken-national-law bug ships. (It already shipped — the tests do not catch it.)
- Test count cited as evidence of correctness without examining what the tests cover.

**Prevention:**
- Treat AccessibilityStatement as **frozen for shared-utility refactors during v0.6**. If `_hooks/useFocusTrap` or other shared code changes, manually verify AccessibilityStatement still renders all 14 locales without console errors via a script (`packages/components/scripts/render-all-locales.ts` or similar).
- Add ONE missing-data test: render with `country='US'` and assert the rendered output does NOT contain `{<national_law>}` literally. This guard would have caught the existing bug. Same for empty `publishDate` — assert no `2024-01-01` literal appears.
- Document explicitly in v0.6 scope: "AccessibilityStatement source not refactored, but two regression-guard tests added."

**Where to address:** The phase that handles `publishDate` fallback (v0.6 milestone target) — bundle the regression-guard tests into the same task.

---

### 4.4 Shared `_hooks` Refactoring Risk

**What goes wrong:** `_hooks/useFocusTrap` is consumed by Modal, Dialog, NavigationMenu (likely), and possibly Combobox/Menu. A "small" refactor for one consumer's needs ripples to all. Without tests on the hook itself, the only signal is downstream component tests failing — and only if those components are tested (most are not yet).

**Warning sign:**
- `_hooks` file changed in a PR without a corresponding `_hooks/*.test.ts` change.
- Hook change happens in the same PR as a component test that depends on it (the test was written to the new behaviour, not the contract).
- Multiple components quietly diverge in how they use a shared hook.

**Prevention:**
- **Test the hook before refactoring it.** Before any v0.6 work touches `_hooks/`, add `_hooks/useFocusTrap.test.tsx` with a `renderHook`-based suite (the React Testing Library `renderHook` API). Pin the contract.
- Maintain a `_hooks/INDEX.md` listing each hook, what it does, and which components consume it. Refactors must update this index.
- Ban inline hook duplication — if a component needs slightly different behaviour, extract a parameter rather than copy-paste.

**Where to address:** Phase 22 OR 23 (whichever covers shared utilities) — add `useFocusTrap.test.tsx` as the first deliverable. List `_hooks/` consumers explicitly in the phase brief.

---

## Phase-Specific Warning Map

| Phase Topic | Likely Pitfall | Mitigation Task |
|-------------|---------------|-----------------|
| Phase 22 — Test scaffolding & conventions | Authors copy bad patterns | Write TESTING-CONVENTIONS.md; install `eslint-plugin-testing-library`, `@testing-library/user-event`; create `_test/setup.ts` and `_test/axe.ts` |
| Phase 22 — Styling-strategy decision | Picking a strategy that breaks pseudo-states or SSR | Decision doc must address pseudo-states (2.2), SSR (2.4), responsive (2.1), theming (2.3) explicitly |
| Phase 23 — useFocusTrap tests + Button/FormField | Hook untested before consumers tested; offsetParent jsdom quirk | Test the hook FIRST; document jsdom limitations; Button needs focus-visible test |
| Phase 23+ — Modal, Dialog | jsdom `<dialog>` partial impl; focus trap depends on `_hooks` | Test ARIA/keyboard contract, not `<dialog>` open behaviour; rely on hook tests already in place |
| Phase 23+ — Combobox, DatePicker, MultiSelect | `scrollIntoView` no-op; live-region updates untested | Assert listbox role + active-descendant; assert live-region count updates; defer scroll behaviour to browser test |
| Phase 23+ — Toast, ErrorSummary | Live-region politeness untested | Mandatory live-region test (3.2) |
| Phase 23+ — RadioGroup, Tabs, Menu | Roving tabindex / arrow keys untested | Use `user-event` for arrow keys; test per WAI-ARIA APG |
| Phase 24+ — Styling migration per component | Pseudo-states lost (2.2); responsive lost (2.1); visual regression (2.5) | Per-component PR with screenshots; focus-visible smoke test; spot-check checklist |
| Phase N — publishDate fallback fix | Touching AccessibilityStatement; 131 existing tests give false confidence | Add regression-guard tests for empty publishDate and US national_law placeholder (4.3) |
| Phase N — Pre-publish hygiene | Dist gets stale; `_utf8` files in repo root | Add `prepublishOnly` script; update `.gitignore` per CONCERNS.md untracked-files section |

---

## Sources

- **Testing Library guiding principles** — kentcdodds.com/blog/testing-implementation-details, testing-library.com/docs/guiding-principles (HIGH — official)
- **eslint-plugin-testing-library rules** — github.com/testing-library/eslint-plugin-testing-library README (HIGH — official)
- **vitest-axe / jest-axe known limitations** — github.com/NickColley/jest-axe README "what jest-axe does not do" + dequelabs/axe-core docs on rules requiring layout (HIGH — official)
- **jsdom limitations** — github.com/jsdom/jsdom README "Unimplemented parts of the web platform" — explicitly lists layout, IntersectionObserver, ResizeObserver, navigation (HIGH — official)
- **WAI-ARIA Authoring Practices Guide** — w3.org/WAI/ARIA/apg — keyboard interaction patterns for composite widgets (HIGH — W3C)
- **WCAG 2.1 SC 2.4.7 (Focus Visible), 1.4.13 (Content on Hover or Focus)** — w3.org/WAI/WCAG21 (HIGH — W3C)
- **React 18 hydration mismatch behaviour** — react.dev/reference/react-dom/client/hydrateRoot (HIGH — official)
- **vitest fake-timer semantics** — vitest.dev/api/vi.html#vi-usefaketimers (HIGH — official)
- **Codebase analysis** — `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `packages/components/src/_hooks/useFocusTrap.ts`, `packages/components/src/Tooltip/Tooltip.test.tsx` (HIGH — direct file reads)

**Confidence summary:** HIGH for all jsdom + Testing Library + axe pitfalls (well-documented ecosystem behaviour). HIGH for library-specific traps (derived from direct file reads + CONCERNS.md). MEDIUM for the styling-migration pitfalls (general CSS-in-JS / inline-style trade-offs are well-known, but specific impact on this library depends on the strategy chosen in Phase 22 — pitfalls listed cover the common failure modes, not all of which will materialise).
