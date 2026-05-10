# Architecture Research — v0.6 Components Quality

**Researched:** 2026-05-10
**Mode:** Project research (architectural decision support)
**Confidence:** HIGH (styling, publish hygiene); MEDIUM (API surface — partly project judgement)

> Note: This file overwrote v0.5 (AU jurisdiction) architecture research from 2026-03-27. Prior content preserved in git history.

## Executive Summary

The library's central architectural inconsistency is the **styling-strategy split**: 26 of 29 components use inline `style={...}` objects (zero-setup, SSR-safe, runtime-priced), while 3 components (`Tabs`, `Accordion`, `Breadcrumbs`) emit Tailwind utility class strings. Because the package ships **no CSS file** and declares **no Tailwind peer-dep / preset**, those three components render as un-styled DOM in any consumer that does not happen to have Tailwind configured with a compatible theme. This is not a styling preference — it is a **shipped-broken bug** for a non-trivial subset of consumers, including `renderToStaticMarkup` from inside the engine.

Other architectural issues are smaller: (a) `dist/` can drift from `src/` because there is no `prepublishOnly` build gate, (b) two internal hooks live in `src/_hooks/` and are correctly excluded from the public API surface today, and (c) test files are colocated but excluded from `dist/` only because the `tsup` script enumerates entry points explicitly — there's no guard.

**Recommended path:** unify on **inline-style** for the 3 Tailwind components, and add **publint + arethetypeswrong + `prepublishOnly`** as a single hygiene phase.

---

## 1. Styling Architecture — Approaches × Tradeoffs

| Approach | Bundle (consumer) | SSR | Consumer setup | Theming | Migration cost | Fit for "accessible-by-default" |
|---|---|---|---|---|---|---|
| **Inline-style only** (current majority) | +0 KB CSS, ~0.5–1 KB JS per component | Native | Zero | Limited | 4–8 hrs (3 files) | **Excellent** |
| **Tailwind classes + documented peer dep** (current minority) | 0 KB shipped | Native | High | High | Already there | **Poor** — silent un-styled DOM for non-Tailwind consumers |
| **Tailwind preset published with library** | Same | Native | Medium | High | 6–8 hrs | **Medium** — still requires consumer Tailwind |
| **Plain CSS file** (`import 'styles.css'`) | +5–15 KB | Native | Low | Medium | 6–10 hrs | **Good** — but new failure mode (forgot import) |
| **CSS-in-JS (vanilla-extract / panda)** | +2–8 KB runtime | Mixed | Low | High | 12–20 hrs | **Poor** — disproportionate tooling burden |

### Recommendation: **Inline-style only**

1. Library promise = zero consumer setup. Inline styles hold in 100% of environments.
2. Engine depends on this. `statement-generator.ts` calls `renderToStaticMarkup` and writes HTML directly. CSS-file/Tailwind approaches break this.
3. Bundle-size argument against inline-style is weak at 29 components (~10–20 KB total).
4. Tailwind v4 is excellent for *applications*, problematic for *libraries* — failure mode is silent un-styled DOM.

### ⚠️ Critical caveat from PITFALLS

Pseudo-states (`:hover`, `:focus-visible`, `:focus-within`) **cannot be expressed in `style={{}}` directly**. Naive Tailwind→inline rewrite would ship a WCAG 2.4.7 violation. Three resolution options:

- **Option A:** `onMouseEnter`/`onMouseLeave` + `onFocus`/`onBlur` with local `useState`. Pure inline, SSR-safe.
- **Option B:** Inject a single `<style>` tag at module load with scoped class names. Side effect at import.
- **Option C (rejected):** Document hover/focus as consumer responsibility.

The styling phase MUST resolve this with a project-wide pattern decision before migrating any component.

### Migration plan (3 components)

1. Inventory Tailwind utilities in `Tabs.tsx`, `Accordion.tsx`, `Breadcrumbs.tsx`.
2. Translate to `baseStyles` / `variants` / `states` matching `Button.tsx` (existing house style).
3. Apply chosen pseudo-state pattern.
4. Keep `className` as passthrough only.
5. Update tests if they assert Tailwind classes.
6. Add regression-guard test in `src/index.test.ts`: regex-grep `dist/**/*.{js,mjs}` for `\b(flex|text-slate|bg-white|hover:|focus:|ring-)\b` inside `className=`.

---

## 2. Publish Hygiene

### Tools

| Tool | Role |
|---|---|
| **publint** | Validates `package.json` exports/main/module/types vs actual file set |
| **`@arethetypeswrong/cli`** | Validates `.d.ts` resolves correctly under all module-resolution modes |
| **`npm pack --dry-run`** | Lists exact file set that would be published |
| **changesets** | Already in use; add `verify` dep before publish |
| **`prepublishOnly` script** | Hard gate before npm publish |

### Concrete additions per package.json

```json
{
  "scripts": {
    "check:exports": "publint --strict",
    "check:types": "attw --pack .",
    "verify": "npm run build && npm run check:exports && npm run check:types && npm run test:ci",
    "prepublishOnly": "npm run verify"
  },
  "devDependencies": {
    "publint": "^0.3.0",
    "@arethetypeswrong/cli": "^0.17.0"
  }
}
```

### Dist-vs-source drift

**Recommendation: stop committing `dist/`.** Build only in CI for publish. Add `packages/*/dist/` to `.gitignore`. Eliminates the entire drift class. (Currently `standards/dist/` is committed and shows in git diff right now — confirms the problem.)

If team prefers committed `dist/`: CI alternative `git diff --exit-code packages/*/dist/` after build.

**Estimate: 4–6 hours for all three packages.**

---

## 3. API Surface Decisions

### `useFocusTrap` and `useScrollLock` — keep private
- Naming convention (`_hooks/`) signals intent
- Public API = forever maintenance
- Better ecosystem alternatives exist (`focus-trap-react`, `react-focus-lock`)

### Subpath exports — keep the 29-entry per-component map
**Gap:** root has `types`+`import`+`require`, but subpaths only `types`+`import`. publint will flag. Add `require` to subpaths or document ESM-only.

---

## 4. Test Colocation

`.test.tsx` files are excluded from dist by accident-of-construction (explicit entry list). Add a CI guard: grep `dist/**/*` for `vitest`, `@testing-library`, `describe(`, `it(` — fail if any test code shipped.

---

## 5. Phase Sizing for the Roadmapper

| Phase | Scope | Estimate | Dependencies |
|---|---|---|---|
| **A — Test infrastructure + 7-component first batch** | `@chialab/vitest-axe` + 3 helpers + setup.ts + Button, FormField, Modal, Checkbox, RadioGroup, ErrorSummary, Tabs | ~2 days | None |
| **B — Styling unification** | 3 Tailwind components → inline-style + pseudo-state pattern + regression-guard test | 4–8 hrs | Independent |
| **C — Complex APG widgets** | Combobox, DatePicker, MultiSelect, DataTable, TreeView, NavigationMenu | ~3 days | Builds on A's helpers |
| **D — AccessibilityStatement publishDate fix** | 14 locales: `'2024-01-01'` → empty + `[YOUR PUBLISH DATE]` | 30 min | Independent |
| **E — Publish hygiene** | publint + attw + `prepublishOnly` + stop committing dist/ + CI verify + tsup glob exclusion | 4–6 hrs | Last (so all prior fixes pass verification) |

A, B, D can run in parallel. C depends on A's helpers. E last.

---

## Confidence Assessment

| Claim | Confidence |
|---|---|
| Inline-style is right for an a11y-first library shipping SSR HTML | HIGH |
| Tailwind classes shipped without CSS or peer-dep are broken for non-Tailwind consumers | HIGH |
| publint + attw are 2026 npm-package-hygiene standard | HIGH |
| Pseudo-state inline-style trap is real and must be resolved before migration | HIGH (corroborated by PITFALLS) |
| Migration cost (4–8 hrs) | MEDIUM — depends on chosen pseudo-state pattern |
| Stop-committing-`dist/` is right default | MEDIUM — flag for team discussion |
