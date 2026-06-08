<!-- refreshed: 2026-06-01 -->
# Architecture

**Analysis Date:** 2026-06-01

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                       Consumer applications                          │
│  (CI pipelines • React apps • Manual scans • Cloud submitters)       │
└───────────┬───────────────────────────────┬──────────────────────────┘
            │ npx hd-a11y-scan              │ import { Button, ... }
            ▼                               ▼
┌────────────────────────────┐   ┌──────────────────────────────────┐
│   @holmdigital/engine      │   │   @holmdigital/components        │
│   Puppeteer + axe-core     │   │   29 prescriptive React widgets  │
│   `packages/engine/src/`   │   │   `packages/components/src/`     │
│   CLI: `dist/cli/index.js` │   │   APG-aligned, BEM CSS modules   │
└───────────┬────────────────┘   └─────────────┬────────────────────┘
            │ enrich(), generateStatement()    │ AccessibilityStatement
            │ + national-law lookup            │ legal-text generation
            ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  @holmdigital/standards                              │
│  Pure-data regulatory database (no runtime).                         │
│  `packages/standards/src/index.ts` + `packages/standards/data/*`     │
│  Convergence rules • National laws • Frameworks • Statement tools    │
└──────────────────────────────────────────────────────────────────────┘
```

## Package Dependency Graph

```text
                  ┌─────────────────────────────┐
                  │  @holmdigital/standards     │  ← leaf, zero workspace deps
                  │   data + helpers + types    │
                  └──────┬───────────────┬──────┘
                         │               │
            depends on   │               │   depends on
                         ▼               ▼
       ┌──────────────────────┐   ┌────────────────────────┐
       │ @holmdigital/        │   │ @holmdigital/engine    │
       │ components           │   │ (also depends on       │
       │ (React peer)         │◄──│  components — engine   │
       └──────────────────────┘   │  consumes statement    │
                                  │  templates)            │
                                  └────────────────────────┘
```

Build order is enforced top-level in `package.json`:
`standards` → `components` → `engine`.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `@holmdigital/standards` | Regulatory database. Pure JSON + thin TS helpers. No I/O. | `packages/standards/src/index.ts` |
| `@holmdigital/components` | Accessible-by-default React widgets (APG patterns). Reads standards for legal copy. | `packages/components/src/index.ts` |
| `@holmdigital/engine` | Scan orchestration: Puppeteer drives a page, axe-core + html-validate produce findings, standards enriches them. | `packages/engine/src/core/regulatory-scanner.ts` |
| Engine CLI (`hd-a11y-scan`) | User-facing command. JSON/PDF/JUnit/badge reporters + GitHub Actions output. | `packages/engine/src/cli/index.ts` |
| Engine cloud-client | Optional submission to HolmDigital Cloud after a scan. | `packages/engine/src/cli/cloud-client.ts` |

## Pattern Overview

**Overall:** Layered, data-driven monorepo. Standards is the immutable source of truth; the runtime packages (engine, components) are thin consumers that compose the data into reports and UI.

**Key Characteristics:**
- **Data/runtime separation** — `standards` is publish-safe pure data. Engine and components are stateless consumers.
- **Cascading workspace deps** — `^2.5.x` floats inside the monorepo, locked at publish via Changesets.
- **APG-pattern adherence** — every interactive component implements the matching WAI-ARIA Authoring Practices pattern (Disclosure, Menubar, Grid, Listbox, Dialog, Dialog+Grid).
- **Prescriptive defaults** — components don't expose toggles that allow inaccessible configurations.
- **Test-as-spec** — APG keyboard semantics are encoded in `expectKeyboardSequence` helpers per component.

## Layers

**Standards layer (`packages/standards/src/`):**
- Purpose: Regulatory truth — WCAG ↔ EN 301 549 ↔ national law mapping.
- Contains: `index.ts` (helpers), `types.ts` (public types), `../data/*.json` (rules per locale + legal artifacts).
- Depends on: `ajv` only.
- Used by: `components` (AccessibilityStatement), `engine` (enrichment + statement generator).

**Components layer (`packages/components/src/`):**
- Purpose: Accessible React widget library (29 components).
- Per-component folder: `<Name>/<Name>.tsx`, `<Name>.test.tsx`, optional `<Name>.css`, optional regression test.
- Shared internals (excluded from public exports via `_` prefix): `_hooks/`, `_i18n/`, `_test/`.
- Depends on: `@holmdigital/standards` (for AccessibilityStatement legal text), `react` peer, optional `lucide-react`.

**Engine layer (`packages/engine/src/`):**
- Purpose: Scan + report.
- Sub-layers:
  - `core/` — scanner (`regulatory-scanner.ts`), `virtual-dom.ts`, `html-validator.ts`
  - `automation/` — `pseudo-automation.ts` (semi-automated checks)
  - `reporting/` — `statement-generator.ts`, `pdf-generator.ts`, `junit-generator.ts`, `badge-generator.ts`, `github-actions.ts`, `templates/`
  - `cli/` — Commander-based CLI with `cloud-client.ts`
  - `i18n/` — locale bundles (16 files) for report copy
- Depends on: `@holmdigital/standards`, `@holmdigital/components`, `puppeteer`, `axe-core`, `html-validate`, `commander`, `ora`, `chalk`, `cosmiconfig`.

## Data Flow

### Primary scan flow

1. CLI parses args → `ScannerOptions` (`packages/engine/src/cli/index.ts`).
2. `RegulatoryScanner` launches Puppeteer, navigates to URL (`packages/engine/src/core/regulatory-scanner.ts`).
3. In-page: axe-core runs; raw `AxeScanOutput` is serialized back.
4. `html-validator.ts` runs structural checks; `virtual-dom.ts` builds an accessibility tree.
5. Findings are passed to `enrichResults()` from `@holmdigital/standards`, producing an `EnrichedReport` with WCAG ↔ EN 301 549 ↔ national-law mapping + `diggRisk` + `eaaImpact`.
6. Reporters in `reporting/` emit JSON / PDF / JUnit / SARIF-style badge / GitHub Actions annotations.
7. Optional: `cloud-client.ts` POSTs the report to HolmDigital Cloud.

### Statement generation flow (engine)

1. Caller provides `{ country, sector, ... }`.
2. `statement-generator.ts` looks up national law via `getNationalLawByFramework(framework, country)`.
3. **Sector-aware US routing**: for `country='US'`, the generator branches on `scope` to pick Title II (public), Title III (private), and additionally Section 504 / REHAB when private + HHS-funded.
4. Locale template (`reporting/templates/`) is rendered with the law's effective date, threshold, sanctions, and enforcement body.

### Statement generation flow (component)

1. `<AccessibilityStatement country="…" sector="…" />` mounts.
2. `locale-chrome.ts` selects copy bundle.
3. National-law data is read directly from `@holmdigital/standards` (no engine round-trip).
4. Output is server-renderable HTML aligned with the EU model statement.

## Key Abstractions

**`ConvergenceRule`** (`packages/standards/src/types.ts`):
- Maps one WCAG criterion to EN 301 549, DOS-lagen ref, remediation, testability, and Nordic-authority risk grading.
- ~470 rules across 12 locale files (`data/rules.<locale>.json`).

**`NationalLaw`** (`packages/standards/src/types.ts`, `data/legal/national-laws.json`):
- Discriminated by `(country, scope, euFramework)`.
- 17 jurisdictions × `LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA' | 'REHAB'`.
- Carries `effectiveDate`, `inForce`, `complianceDeadlines` (discriminated union `ComplianceDeadlineEntry`), `sanctions`, optional `exemptions.microbusiness`.

**`EnrichedReport`** (`packages/standards/src/types.ts`):
- Output of enrichment: `RegulatoryReport` + per-failure `legalContext`, `holmdigitalInsight`, `componentRecommendation`.
- Consumed by every engine reporter.

**`AccessibilityStatementProps`** (`packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`):
- Public prop surface; `country` accepts all 17 `Country` values incl. `'EU'`.

**`Country`, `LegalFramework`, `Sector`** unions (`packages/standards/src/types.ts:12-14`):
- Shared vocabulary across all 3 packages.

## Public API Surface

| Package | Root export | Subpath exports |
|---------|-------------|-----------------|
| `@holmdigital/standards` | `./` → types + helpers + data | `./data/*`, `./schema/*` (raw JSON access) |
| `@holmdigital/components` | `./` → all 29 components | `./<Name>` per component (29 entries), `./DatePicker.css`, `./Tabs.css`, `./Accordion.css`, `./Breadcrumbs.css` |
| `@holmdigital/engine` | `./` → scanner + types + statement generator | `./cli` (bin: `hd-a11y-scan`) |

All packages publish dual ESM/CJS with `types` placed FIRST in every conditional export block (per project convention).

## Architectural Constraints

- **Threading:** Engine is single-process; Puppeteer spawns a Chromium child. Reporters are synchronous.
- **No runtime in standards:** `standards` must remain pure data + sync helpers — no `fs`, no network. Enforced by it being importable in browser bundles (components consume it).
- **No Tailwind in components:** Phase 23 unified styling on per-component BEM CSS modules. A `check:no-tailwind-leak` script gates `test:ci`.
- **No test artifacts in dist:** `check:no-test-leak` script asserts `_test/`, `*.test.*`, `*.stories.*` are absent from the published bundle.
- **WCAG header consistency:** `check:wcag-headers` script asserts every component file declares the WCAG criteria it satisfies.
- **Underscore-prefixed dirs are internal:** `_hooks/`, `_i18n/`, `_test/` are excluded from tsup entry globs and have no subpath export.
- **No circular workspace deps:** `standards` is a leaf. Components depends on standards. Engine depends on both.

## Anti-Patterns

### Looking up `ADA` without scope filtering

**What happens:** `getNationalLawByFramework('ADA', 'US')` returns Title II (public), masking Title III for private callers.
**Why it's wrong:** Private-sector statements then quote the wrong scope and enforcement body.
**Do this instead:** Use scope-aware filtering: `getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private')`. The engine's `packages/engine/src/reporting/statement-generator.ts` US branch already does this — replicate the pattern downstream.

### Reading `complianceDeadlines.largeEntity.populationThreshold` directly

**What happens:** TS error because HHS Section 504 uses `employeeThreshold: 15` instead.
**Why it's wrong:** `ComplianceDeadlineEntry` is a discriminated union — fields differ per framework.
**Do this instead:** Narrow on the discriminant before reading the threshold field.

### Importing from `dist/`

**What happens:** Bypasses the public `exports` map and breaks dual ESM/CJS resolution.
**Why it's wrong:** Subpath exports are the contract; deep imports break on minor bumps.
**Do this instead:** Always import from `@holmdigital/<pkg>` or `@holmdigital/<pkg>/<Subpath>`.

### Adding `as any` in components or engine

**What happens:** Phase 33 hardened both packages to zero-warning lint. New `as any` reintroduces drift.
**Why it's wrong:** `prepublishOnly` chains gate on lint + typecheck; CI fails the publish.
**Do this instead:** `Reflect.set` for global mock writes, `as unknown as T` for partial test fixtures, `// @ts-expect-error` for intentionally-invalid inputs.

## inForce Drift-Guard Pattern

`packages/standards/src/index.test.ts` asserts, for all 17 jurisdictions:

```ts
expect(law.inForce).toBe(law.effectiveDate <= todayISO);
```

When a future `effectiveDate` passes, the test flips and forces an explicit `inForce: true` data update. This is the canonical pattern for any time-sensitive regulatory data in standards — replicate it for new framework additions (e.g., AU FTA jurisdictions).

## APG-Pattern Adherence (components)

| Component | APG pattern | Phase |
|-----------|-------------|-------|
| `NavigationMenu` | Disclosure + Menubar | 31 |
| `DataTable` | Grid (cell-wise keyboard nav) | 30 |
| `MultiSelect` | Listbox (multi-select completeness) | 29 |
| `DatePicker` | Dialog + Grid | 28 |
| `Dialog`, `Modal` | Dialog (modal) | core |
| `Combobox` | Combobox + Listbox | core |
| `Tabs` | Tabs | core |
| `TreeView` | Tree | core |
| `Accordion` | Accordion | core |
| `Toast`, `LiveRegion` | Live region (`_i18n/live-region-strings.ts`, 12 locales) | 27 |

Each component's `*.test.tsx` uses `expectKeyboardSequence` (`_test/helpers/`) to encode the APG keyboard contract as executable spec.

## Cross-Cutting Concerns

- **Logging:** Engine uses `ora` spinners + `chalk` colours; suppressed via `--silent` / `--json`. Components log nothing.
- **Validation:** Standards JSON validated against `schema/*.json` via `ajv` in `scripts/validate-*.js`.
- **i18n:** Engine has 16 locale bundles in `src/i18n/`. Components have 12 in `_i18n/live-region-strings.ts`. Standards has 12 in `data/rules.<locale>.json`.
- **Release:** Pure Changesets flow (`.changeset/*.md` → `changeset publish --provenance` from repo root). `prepublishOnly` runs the full `verify` chain.

---

*Architecture analysis: 2026-06-01*
