# Codebase Concerns

**Analysis Date:** 2026-06-01
**Scope:** HolmDigital accessibility monorepo — `@holmdigital/engine`, `@holmdigital/components`, `@holmdigital/standards`

---

## Active Technical Debt

### Storybook for components (deferred)

- **Issue:** Karin's Doc 2 (2026-05-18) proposed a Tailwind-based Storybook story format, but Phase 23 explicitly migrated the components package away from Tailwind to BEM-style classnames. The two are incompatible.
- **Files:** `packages/components/` (no `.stories.tsx` files committed), `wiki/components/*Demo.tsx` (current demo pattern)
- **Impact:** No interactive component playground for contributors / design reviewers. Demos live in the wiki only.
- **Fix approach:** Pick one of (a) BEM-compatible story authoring pattern, or (b) formalise `wiki/components/*Demo.tsx` as the canonical demo surface and drop Storybook from the roadmap. Decision blocks any further investment in Storybook tooling.

### Engine DTS build sensitivity

- **Issue:** Engine's tsup DTS generation transitively pulls component types. If `@holmdigital/components` ships without DTS, engine's DTS build fails.
- **Files:** `packages/engine/tsup.config.ts` (env-guard on `TSUP_NO_DTS=1`), `.github/workflows/deploy-wiki.yml` (workflow-level guard)
- **Impact:** Brittle to workflow changes — especially if pnpm workflows are reinstated (see `pnpm-workspace.yaml` gotcha below).
- **Fix approach:** Monitor on every CI workflow edit. Long-term: extract a thin engine public-API surface that doesn't transitively reference component internals.

### `react-hooks/recommended` violations (deferred)

- **Issue:** Enabling the full `react-hooks/recommended` rule set surfaces 18 pre-existing react-compiler violations. Only `exhaustive-deps` is currently active in `packages/components/eslint.config.*`.
- **Files:** `packages/components/eslint.config.js`, sources flagged across `packages/components/src/`
- **Impact:** Latent risk of stale closures / missing deps in component hooks. Zero-warning lint state (PUB-09, commit `d415d90`) is achieved only because the broader rule set is off.
- **Fix approach:** Dedicated audit phase — enable rules one by one, fix call sites, re-lock zero-warning state.

### Dev-only npm-audit advisories

- **Issue:** Storybook 8.x → esbuild moderate vulnerabilities, plus Vite/Storybook chain advisories (3 moderate, 4 high, 1 critical).
- **Files:** Root `package-lock.json`, `packages/components/package.json` devDeps
- **Impact:** None on published packages — strictly dev-only. Audit noise on every CI run.
- **Fix approach:** Wait for Storybook 8.x patch upstream. Do not pin transitively; revisit if/when the Storybook deferral above resolves.

---

## Regulatory Drift Risk (Data Freshness)

The `@holmdigital/standards` package encodes time-sensitive legal data. Each item below has a known upcoming change that will require a coordinated data update.

> **⚠ DOJ ADA Title II IFR — comment period closes 2026-06-22**
> Juno bedömer. Currently encoded: `largeEntity: 2027-04-26`, `smallEntity: 2028-04-26` in the US ADA Title II entry. If the final rule diverges from the IFR, update the `us-ada-title-ii` entry in `packages/standards/src/data/national-laws/` and ship a minor bump.

> **⚠ HHS Section 504 — comment period closes 2026-07-06**
> Juno bedömer. Currently encoded post-2.5.6: `largeEntity: 2027-05-11`, `smallEntity: 2028-05-10`, `effectiveDate: 2027-05-11` (WCAG benchmark trigger). If the final rule diverges from the IFR, update `us-hhs-section-504`; the `inForce` drift-guard test will continue to auto-validate dates.

> **⚠ FR RGAA 5 — publication expected Q4 2026**
> Will require: WCAG 2.2 baseline upgrade, mobile-app scope added, ARCOM (replacing DINUM) as enforcement authority. Update `fr-rgaa` national-law entry plus any RGAA-specific mapping in `wcag-to-en301549.json`.

> **⚠ EN 301 549 V4.1.1 — expected Oct 2026**
> Will require updates to `packages/standards/src/data/frameworks.json` (WAD + EAA framework entries) and `packages/standards/src/data/wcag-to-en301549.json`. Likely a minor or major bump depending on mapping changes.

> **⚠ NL new declaration template — 2026-10-01**
> Affects client-side accessibility-statement checklists, NOT the standards package directly. Document in component README / wiki when finalised.

---

## Workflow Gotchas (Codify so future contributors don't trip)

> **⚠ Pure changesets only — never edit `package.json#version` or `CHANGELOG.md` by hand**
> The repo experienced 3 double-bump incidents in May 2026 before locking onto pure-changesets. If a release seems "off by one", check for hybrid history (manual `version` edits competing with `changeset version`). All bumps must originate from a `.changeset/*.md` file consumed by the `changeset-release/master` PR.

> **⚠ `pnpm-workspace.yaml` MUST NOT exist at repo root**
> publint v0.3.20+ bundles `package-manager-detector` v1.6+, which treats this file as a pnpm marker. CI then attempts `pnpm pack` and fails because pnpm isn't installed. The file was removed in commit `b68758c` (2026-05-12). Do not reintroduce it even as a stub for editor tooling.

> **⚠ ADA Title II vs Title III scope filtering**
> `getNationalLawByFramework('ADA', 'US')` returns the FIRST match — which is Title II (public scope). For Title III private-sector lookups use:
> ```ts
> getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private')
> ```
> Engine's `packages/engine/src/.../statement-generator.ts` handles this in a dedicated US branch. Any downstream consumer doing its own law lookup MUST be scope-aware.

> **⚠ HHS Section 504 `effectiveDate` semantics (post-2.5.6)**
> `effectiveDate` reflects the WCAG benchmark trigger date (`2027-05-11`), NOT the original Final Rule publication date (`2024-07-08`). `inForce: false` until the trigger date; the drift-guard vitest test will auto-flip `inForce` validation when the date passes. Do not "correct" this to 2024-07-08 — that would break the drift guard.

> **⚠ HHS Section 504 deadline field shape**
> `complianceDeadlines.largeEntity` carries `employeeThreshold: 15` (not `populationThreshold` as ADA Title II uses). The published type is a discriminated union `ComplianceDeadlineEntry`. Consumers MUST narrow on the discriminant before reading the threshold field.

> **⚠ AccessibilityStatement `publishDate`**
> Phase 25 replaced 13 misleading `2024-01-01` fallbacks with `[YOUR PUBLISH DATE]` placeholder strings. Consumers MUST pass a real `publishDate` prop — there is no longer a silent default that "looks plausible".

> **⚠ Swedish characters (å, ä, ö) must be preserved verbatim**
> All source files, markdown, and changesets containing Swedish text. Some editors / git filters corrupt these silently. There is no CI encoding guard yet — manual vigilance only. Never normalise to `aa`/`ae`/`oe` or strip diacritics.

> **⚠ EAA microbusiness exemption is cumulative**
> All 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL) expose `exemptions.microbusiness` from EAA Article 4(5): services-providing orgs with <10 employees AND ≤2M EUR turnover are exempt. Both conditions must be met. Microenterprises providing PRODUCTS are NOT exempt.

---

## Known Issues with Workarounds (from CLAUDE.md)

### TS2590: Union type too complex on dynamic JSX tags

- **Symptom:** TypeScript chokes on `keyof JSX.IntrinsicElements`-typed dynamic tag in `Heading.tsx` (and similar dynamic-tag components).
- **Files:** `packages/components/src/components/Heading.tsx`
- **Workaround:** Specific union type + `React.createElement`:
  ```tsx
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return React.createElement(Tag, { ref, className, ...props }, children);
  ```

### NPM bin warning during publish

- **Symptom:** `npm warn publish "bin[hd-a11y-scan]" script name was invalid`
- **Files:** `packages/engine/package.json` `bin` entry
- **Status:** Benign — the bin entry still resolves correctly post-publish. No fix required.

### Vitest 4.x upgrade (Dependabot)

- **Status:** Tests pass on 4.0.16. Dependabot PRs that bump vitest 2.x → 4.x are safe to merge.

---

## Mirror / Infrastructure

> **⚠ Forgejo mirror down**
> `forgejo.serverdigital.net` returned HTTP 530 as of 2026-05-19 — server may be down. GitHub is the authoritative remote. Do not rely on the Forgejo mirror for fetches or backup until confirmed up.

---

## Test Coverage Gaps

### Swedish-character encoding guard

- **What's not tested:** No CI assertion that å/ä/ö survive a round-trip through commit / publish.
- **Risk:** Silent corruption in published packages or changesets.
- **Priority:** Medium — manual vigilance has held so far, but the failure mode is invisible until a Swedish-speaking user reports it.

### react-hooks rules beyond `exhaustive-deps`

- **What's not tested:** 18 pre-existing react-compiler violations in `packages/components/src/`.
- **Risk:** Stale closures, missed re-renders.
- **Priority:** Medium — covered by deferred audit plan above.

---

*Concerns audit: 2026-06-01*
