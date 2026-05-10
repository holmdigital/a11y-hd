# Research Synthesis — v0.6 Components Quality

**Synthesised:** 2026-05-10
**Inputs:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, PROJECT.md
**Overall confidence:** HIGH on testing approach and stack additions; HIGH on the existence of the styling problem; MEDIUM on the optimal styling-pattern resolution.

> Prior content (v0.5 — Australia jurisdiction, 2026-03-27) overwritten; preserved in git history.

---

## 1. Headline

v0.6 takes `@holmdigital/components` from "ships and renders" to "production-grade prescriptive UI library." Success means three things land together: (a) a unified, SSR-safe styling strategy that no longer ships silently un-styled DOM to non-Tailwind consumers, (b) APG-conformant test coverage on the seven highest-stakes untested components plus reusable test scaffolding, and (c) publish-hygiene gates (publint, attw, `prepublishOnly`) that prevent dist drift from re-occurring. The milestone is **not** about chasing a coverage percentage — it's about closing the gap between the library's regulatory-compliance promise and what consumers actually receive on `npm install`.

---

## 2. Phase Recommendation

| Phase | Scope | Components / Deliverables | Est. |
|---|---|---|---|
| **A — Test infra + first-7 batch** | Add `@chialab/vitest-axe`, `@testing-library/user-event`, `@testing-library/jest-dom`, `eslint-plugin-testing-library`. Create `_test/setup.ts` (jsdom shims), `_test/axe.ts` (centralised disables), three reusable helpers (`expectNoAxeViolations`, `expectUniqueIds`, `expectKeyboardSequence`). Tests for **Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, Tabs**. `useFocusTrap.test.tsx` BEFORE Modal. Author TESTING-CONVENTIONS.md. | ~2 days |
| **B — Styling unification** | Migrate Tabs, Accordion, Breadcrumbs from Tailwind to chosen pattern. Add `tokens.ts`. Regression-guard test grepping `dist/**` for Tailwind utilities. | 4–8 hrs (gated on §3.1) |
| **C — Complex APG widgets** | Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu. Reuses Phase A helpers. | ~3 days |
| **D — AccessibilityStatement publishDate fix** | 14 locales: `'2024-01-01'` → empty + `[YOUR PUBLISH DATE]`. Two regression-guard tests. | ~30 min + tests |
| **E — Publish hygiene** | `publint`, `@arethetypeswrong/cli`, `prepublishOnly` to all three packages. Stop committing `dist/` (or CI guard). Fix subpath exports `require` gap. CI guard for shipped test code. | 4–6 hrs |

**Parallelism:** A, B, D parallel. C depends on A's helpers. E last.

---

## 3. Cross-Cutting Decisions Required Before Planning

### 3.1 Pseudo-state pattern (HARD GATE — blocks Phase B)

**The conflict:** ARCHITECTURE recommends "inline-style only" with three options for pseudo-states. PITFALLS calls pseudo-states "the highest-severity migration trap" and **explicitly rejects** the JS-event-handler approach (Option A) because it cannot distinguish keyboard from mouse focus and breaks `:focus-visible` semantics.

**Recommendation:** **CSS-file-per-component** (PITFALLS' preferred Option 1). tsup emits CSS as side-effect import; SSR-safe; preserves `:focus-visible`; preserves per-component tree-shaking. JS event handlers off the table for any focusable element.

### 3.2 Dist commit policy

ARCHITECTURE recommends stopping committing `dist/`. Visible drift in `standards/dist/` confirms the problem. **Decision needed:** stop committing OR keep with CI `git diff --exit-code` guard.

### 3.3 Theming contract

Decide before Phase B: consumers override via `style` + `className` merge, OR CSS variables (`--hd-button-bg`)?

### 3.4 Responsive strategy

Inventory components using Tailwind breakpoint prefixes. Pure inline-style cannot express breakpoints. Affects styling pattern.

### 3.5 lucide-react classification

Currently in `dependencies`. Decide: keep, move to `peerDependencies` + optional, or extract to slim local set.

---

## 4. Stack Additions (tight)

All four are devDependencies — **zero impact on the published bundle.**

| Package | Version | Purpose |
|---|---|---|
| `@chialab/vitest-axe` | ^0.19.1 | `toHaveNoViolations()`. **NOT `vitest-axe` (chaance) — dead since 2021.** |
| `axe-core` | ^4.11.1 | Peer of vitest-axe |
| `@testing-library/user-event` | ^14.6.1 | Async keyboard / pointer simulation |
| `@testing-library/jest-dom` | ^6.6.x | `toHaveAccessibleName`, `toHaveRole`, `toHaveFocus` |
| `eslint-plugin-testing-library` | latest | `prefer-screen-queries`, `no-container`, `no-node-access` |
| `publint` | ^0.3.0 | Validate `package.json` exports |
| `@arethetypeswrong/cli` | ^0.17.0 | Validate `.d.ts` resolution |

**Stay on:** Vitest 4.0.16, jsdom 28, tsup 8.x, lucide-react 0.556 (pending §3.5).
**Do NOT switch to:** happy-dom, jest-axe, `@axe-core/react`.

---

## 5. Test Scope Summary

### First 7 (Phase A — milestone-critical)
**Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, Tabs.** Plus `useFocusTrap.test.tsx` BEFORE Modal. ~80–100 tests.

### Next 6 (Phase C — complex APG widgets)
**Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu.** ~100–130 tests.

### Deferred to v0.7+
Card, Skeleton, HelpText, Heading, ProgressBar, Pagination, SkipLink, Switch (test coverage only). Failure modes are visible (rendering wrong) rather than silent (a11y broken).

### Tier categories
- **Tier 1 — Table stakes:** mounts, ref forwarding, className/HTML-prop pass-through, disabled honoured
- **Tier 2 — Differentiators:** axe-clean, ARIA roles/states, ID uniqueness, keyboard interaction matrix, focus management, focus trap, Escape boundaries, live-region announcements, form association, error/required state, reduced-motion, target size
- **Tier 3 — APG conformance:** W3C contracts for combobox, listbox, grid, tree, tabs, dialog, accordion

### Anti-features (hard NO)
No DOM snapshot tests. No CSS-class selectors. No internal-state probing. No `data-testid` on library components. No `fireEvent.click` without paired keyboard test. No coverage-percent chasing — tie tests to specific WCAG SCs at top of file.

---

## 6. Top 5 Pitfalls to Inject Into Specific Phases

| # | Pitfall | Phase | Specific injection |
|---|---|---|---|
| 1 | **Pseudo-state styling cannot go inline** | Phase B prerequisite | Decision §3.1. Per-component focus-visible smoke test mandatory. |
| 2 | **`useFocusTrap` + jsdom `offsetParent` quirk** | Phase A, before Modal | `_test/setup.ts` polyfills `offsetParent`. Test the hook directly with 5 cases BEFORE Modal/Dialog. |
| 3 | **axe-core false positives in jsdom** | Phase A scaffolding | Centralised `_test/axe.ts` disables 8 layout-dependent rules. Per-test `configureAxe` forbidden. Real-browser axe deferred to v0.7+. |
| 4 | **Live-region announcement tests missing** | Phase C, Phase D | Mandatory live-region test for Toast, ErrorSummary, FormField (error), Combobox (results count), DatePicker (selected date). |
| 5 | **AccessibilityStatement frozen-but-not-safe** | Phase D | Two regression-guards with publishDate fix: assert no literal `2024-01-01` anywhere; assert no `{<national_law>}` for `country='US'`. The 131 existing tests do NOT catch the live US bug. |

---

## 7. Out of Scope (Reaffirmation)

- AccessibilityStatement refactor (2 regression-guards added in Phase D)
- Engine and Standards work — separate milestones
- Storybook — blocked on upstream esbuild patch
- Real-browser axe-core — defer to v0.7+
- Automated visual regression (Chromatic / Playwright CT) — defer until Storybook unblocks
- New component additions — quality-on-existing
- CSS-in-JS runtime libraries — disproportionate burden
- shadcn-style copy-paste registry — wrong distribution model

---

## 8. Open Questions for the User

1. **SSR audit** — Engine is a known SSR consumer. Are there others (Next.js App Router/RSC, Remix, downstream HTML-renderers)? Affects styling decision (§3.1).
2. **lucide-react peer-dep status** — Move to optional peer dep, keep as hard dep, or extract to slim local set?
3. **Dist commit policy** — Stop committing `dist/` or keep with CI guard?
4. **Pseudo-state pattern (sign-off)** — Confirm CSS-file-per-component as Phase B approach?
5. **Theming contract** — `style`+`className` merge or CSS variables override?

---

## Confidence Assessment

| Area | Confidence |
|---|---|
| Test stack (vitest-axe, user-event, jest-dom) | HIGH |
| jsdom limitation list and shims | HIGH |
| First-7 component priority | HIGH (5 named in PROJECT.md; ErrorSummary + Tabs derived) |
| APG keyboard contracts | HIGH (W3C-stable) |
| Tailwind-without-CSS-or-peer-dep is a real bug | HIGH |
| **Optimal pseudo-state pattern** | **MEDIUM** — explicit ARCH/PITFALLS conflict; recommendation favours PITFALLS |
| Per-component test count estimates | MEDIUM (±30%) |
| Migration cost (4–8 hrs for 3 components) | MEDIUM — depends on §3.1 |

**Hard gate:** Pseudo-state pattern (§3.1) blocks Phase B. Questions 1, 4, 5 must be answered before Phase B; question 3 before Phase E; question 2 can ride along with Phase A.
