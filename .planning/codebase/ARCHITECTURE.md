<!-- refreshed: 2026-05-10 -->
# Architecture

**Analysis Date:** 2026-05-10

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        CLI / Programmatic API                        │
│  `packages/engine/src/cli/index.ts`  │  `packages/engine/src/index.ts`│
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        @holmdigital/engine                           │
├──────────────────┬──────────────────┬───────────────────────────────┤
│  RegulatoryScanner│  Reporting       │  Statement Generator          │
│  (axe + html-val │  (HTML/PDF/JUnit │  (renders React component     │
│   + Puppeteer)   │   /Badge)        │   to static HTML/MD)          │
│  `core/`         │  `reporting/`    │  `reporting/statement-*`      │
└────────┬─────────┴────────┬─────────┴──────────┬────────────────────┘
         │                  │                     │
         │ enrichResults    │ getEnforcementBody  │ AccessibilityStatement
         ▼                  ▼                     ▼
┌──────────────────────────────┐    ┌───────────────────────────────┐
│   @holmdigital/standards     │    │   @holmdigital/components     │
│   Convergence DB + EU/US     │    │   React UI primitives +       │
│   national-laws lookups      │    │   AccessibilityStatement      │
│  `packages/standards/src`    │    │  `packages/components/src`    │
│  + `data/*.json`             │    │                                │
└──────────────────────────────┘    └───────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│   JSON data files (rules per locale, legal frameworks, national     │
│   laws, statement tools)  `packages/standards/data/**`              │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `RegulatoryScanner` | Runs Puppeteer + axe-core + html-validate, enriches violations with regulatory context, computes score and stats | `packages/engine/src/core/regulatory-scanner.ts` |
| `VirtualDOMBuilder` | Builds a serialised DOM snapshot from the live page for rule evaluation | `packages/engine/src/core/virtual-dom.ts` |
| `HtmlValidator` | Wraps `html-validate` to produce `ValidationResult`s used in reports | `packages/engine/src/core/html-validator.ts` |
| `PseudoAutomationEngine` | Generates pseudo-automated test scaffolding for manual checks | `packages/engine/src/automation/pseudo-automation.ts` |
| `generateReportHTML` | Renders the full scan report as standalone HTML | `packages/engine/src/reporting/html-template.ts` |
| `generatePDF` | Wraps Puppeteer to print the HTML report to PDF | `packages/engine/src/reporting/pdf-generator.ts` |
| `generateStatement` / `generateStatementContent` | Builds a regulatory accessibility statement (HTML or Markdown) for a country/sector | `packages/engine/src/reporting/statement-generator.ts` |
| `generateBadgeMarkdown` / `generateBadgeUrl` | Produces shields.io-style compliance badges | `packages/engine/src/reporting/badge-generator.ts` |
| `generateJUnitXML` | Emits CI-friendly JUnit XML for failures | `packages/engine/src/reporting/junit-generator.ts` |
| `setLanguage` / `t` | i18n helpers backed by `locales/*.json` | `packages/engine/src/i18n/index.ts` |
| `sendToCloud` | Optional uploader to HolmDigital Cloud | `packages/engine/src/cli/cloud-client.ts` |
| Convergence DB API | Lookups for WCAG → EN 301 549, frameworks, national laws, sanctions | `packages/standards/src/index.ts` |
| `AccessibilityStatement` (React) | Renders the legal accessibility statement for any of 17 countries | `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` |
| All other components (`Button`, `FormField`, `Dialog`, …) | Prescriptive, accessible-by-default React primitives consumed downstream | `packages/components/src/<Component>/<Component>.tsx` |

## Pattern Overview

**Overall:** TypeScript monorepo (`npm workspaces`) with three publishable packages organised as a one-directional dependency chain — `standards` is leaf, `components` depends on `standards`, `engine` depends on both.

**Key Characteristics:**
- Strict layered separation: data (`standards`) → presentation primitives (`components`) → orchestration (`engine`).
- Dual build (CJS + ESM + DTS) via `tsup` for every package.
- Engine is both a library and a CLI (`hd-a11y-scan` bin) sharing the same exports surface.
- Regulatory data is JSON-first: locale rule files + machine-readable legal database; runtime code is a thin lookup/enrichment layer.
- Server-side React rendering (`renderToStaticMarkup`) is used inside the engine to reuse the components package for HTML output.

## Layers

**Data Layer (`@holmdigital/standards`):**
- Purpose: Pure regulatory database + lookup API. No DOM, no I/O beyond JSON imports.
- Location: `packages/standards/src`, data in `packages/standards/data/`.
- Contains: Convergence rules per locale, EU/US frameworks, national laws (EAA, WAD, ADA Title II/III, REHAB §504, DOS-lagen, BITV, RGAA, AODA), enforcement bodies, statement tools, JSON schemas.
- Depends on: `ajv` only (schema validation in scripts).
- Used by: `engine`, `components`.

**Presentation Layer (`@holmdigital/components`):**
- Purpose: Accessible React primitives used both by end-user apps and by the engine when rendering statements/reports.
- Location: `packages/components/src`.
- Contains: 29 component folders, shared `_hooks/`, single `index.ts` barrel.
- Depends on: `react` (peer), `lucide-react`, `@holmdigital/standards` (for `AccessibilityStatement`).
- Used by: `engine` (server-side render), external consumers.

**Orchestration Layer (`@holmdigital/engine`):**
- Purpose: Runs scans, enriches results with regulatory metadata, and emits multi-format reports + statements.
- Location: `packages/engine/src`.
- Contains: `core/` (scanner), `automation/`, `reporting/`, `cli/`, `i18n/`, `locales/`, `assets/`.
- Depends on: `axe-core`, `puppeteer`, `html-validate`, `commander`, `cosmiconfig`, `chalk`, `ora`, `@holmdigital/standards`, `@holmdigital/components`, `react`, `react-dom`.
- Used by: end users via CLI or programmatic import.

## Data Flow

### Primary Scan → Report Path

1. CLI parses args + cosmiconfig file (`.a11yrc`, `package.json#a11y`) — `packages/engine/src/cli/index.ts:38`.
2. `RegulatoryScanner.scan()` launches Puppeteer, navigates to URL, optionally sets viewport — `packages/engine/src/core/regulatory-scanner.ts` (`class RegulatoryScanner`).
3. axe-core is injected and executed in-page (`page.evaluate`) producing `AxeScanOutput`.
4. `HtmlValidator` runs html-validate on the page source (skipped in `--light` mode) — `packages/engine/src/core/html-validator.ts`.
5. Each axe violation is enriched: `getEN301549Mapping`, `getConvergenceRule`, `getHolmDigitalInsight` from `@holmdigital/standards` produce `EnrichedReport[]`.
6. Stats + score + `complianceStatus` aggregated into `ScanResult` — `regulatory-scanner.ts:65` (`interface ScanResult`).
7. CLI dispatches `ScanResult` to one or more emitters: `generateReportHTML`, `generatePDF`, `generateStatement`, `generateBadgeMarkdown`, `generateJUnitXML`, optionally `sendToCloud`.
8. CI mode: process exits with code 1 when `complianceStatus === 'FAIL'` (or threshold breached).

### Statement Generation Flow

1. `generateStatement(scanResult, metadata, lang, outPath)` invoked by CLI `--statement` or programmatically — `packages/engine/src/reporting/statement-generator.ts`.
2. `metadata.country` + `metadata.sector` resolve enforcement body via `getEnforcementBody(country, sector)`.
3. National law(s) looked up via `getNationalLawByFramework` / `getNationalLaws` — note the **US private-sector branch** must reference both ADA Title III AND `us-hhs-section-504` (REHAB) per CLAUDE.md.
4. `<AccessibilityStatement {...props} />` rendered via `renderToStaticMarkup` from `@holmdigital/components`.
5. HTML (or Markdown via `--format md`) written to disk with `fs/promises`.

### Convergence Lookup Flow

1. WCAG criterion (e.g. `1.1.1`) arrives from axe violation tag.
2. `getConvergenceRule(ruleId, lang)` → returns `ConvergenceRule` with `wcagCriteria`, `en301549Criteria`, `dosLagenReference`, `legalContext` — `packages/standards/src/index.ts:237`.
3. `legalContext` resolves applicable frameworks (WAD/EAA/DDA/ADA/REHAB) and risk metadata (`diggRisk`, `eaaImpact`).
4. Locale-specific interpretation field (e.g. `swedishInterpretation`, `usInterpretation`) selected by `lang`.

**State Management:**
- Engine: per-scan instance state on `RegulatoryScanner` (browser handle + options); no global mutable state.
- i18n: module-level `currentLang` set via `setLanguage()` — single global, **must be set before reporting calls**.
- Standards: pure functions over imported JSON; no runtime mutation.

## Key Abstractions

**`ConvergenceRule`:**
- Purpose: Single record mapping one WCAG criterion → EN 301 549 clause → DOS-lagen reference + remediation + risk + legal context.
- Examples: `packages/standards/data/rules.en.json`, type at `packages/standards/src/types.ts:21`.
- Pattern: JSON document validated against `packages/standards/schema/convergence-schema.json`.

**`EnrichedReport` / `RegulatoryReport`:**
- Purpose: Output shape passed between scanner and reporters. Carries axe violation + convergence metadata + enforcement context.
- Re-exported from `@holmdigital/standards` and consumed everywhere in `engine/src/reporting/`.

**`NationalLaw` (discriminated union via `ComplianceDeadlineEntry`):**
- Purpose: Country/framework-specific regulation metadata including `effectiveDate`, `inForce`, `complianceDeadlines`, `exemptions`, `sanctions`.
- Examples: `packages/standards/data/legal/national-laws.json`.
- Pattern: Looked up by id, country, or framework; consumers MUST narrow on the deadline discriminant before reading threshold fields (see CLAUDE.md REHAB gotcha).

**`AccessibilityStatement` (React component):**
- Purpose: Single source of truth for the legal accessibility statement UI; works for all 17 supported countries plus `EU`.
- Location: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`.
- Pattern: Consumes country + sector + complianceLevel props; renders semantically correct WAD/EAA boilerplate.

## Entry Points

**CLI (`hd-a11y-scan`):**
- Location: `packages/engine/src/cli/index.ts` (built to `dist/cli/index.js`, exposed via `bin` in `package.json`).
- Triggers: User shell, CI workflows, npm scripts.
- Responsibilities: Arg parsing, config merge, scan orchestration, multi-format output.

**Programmatic Engine API:**
- Location: `packages/engine/src/index.ts` — re-exports scanner, virtual DOM, automation, i18n, statement-generator.
- Triggers: `import { RegulatoryScanner } from '@holmdigital/engine'`.

**Standards API:**
- Location: `packages/standards/src/index.ts` — 30+ named exports for lookups.
- Triggers: `import { getConvergenceRule, getNationalLaws, … } from '@holmdigital/standards'`.

**Components API:**
- Location: `packages/components/src/index.ts` — barrel export of all 29 components plus per-component subpath exports declared in `package.json`.

## Architectural Constraints

- **Threading:** Single-threaded Node event loop. Puppeteer spawns a child Chromium process; axe runs inside the browser context, not the engine process.
- **Global state:** `i18n` keeps a module-level current language in `packages/engine/src/i18n/index.ts`. No other shared mutables.
- **Circular imports:** None. Dependency graph is strictly `standards → components → engine`.
- **Browser dependency:** Puppeteer ships its own Chromium; CI must allow downloading it (or set `PUPPETEER_SKIP_DOWNLOAD`).
- **React version:** Engine and components both accept React 18 or 19; React is `peerDependencies` in components and a hard dep in engine for SSR rendering.
- **JSON-as-source-of-truth:** Adding a new country/law requires updating both `data/legal/national-laws.json` AND ensuring `inForce` matches `effectiveDate <= today` (drift-guard test in `packages/standards/src/index.test.ts`).
- **Public API stability:** `tsup --dts` ships `.d.ts` files; breaking changes to types in `standards` cascade to engine and downstream consumers — bump major.

## Anti-Patterns

### Hardcoded enforcement body strings in reports

**What happens:** Tempting to inline `'Digg'` or `'DoJ'` in HTML templates instead of routing through `getEnforcementBody(country, sector)`.
**Why it's wrong:** Enforcement bodies differ between WAD (public) and EAA (private) sectors and across 17 countries; hardcoding silently produces wrong statements for the other sector.
**Do this instead:** Call `getEnforcementBody(country, sector)` from `@holmdigital/standards` — see `packages/engine/src/reporting/statement-generator.ts` and `html-template.ts`.

### `getNationalLawByFramework('ADA', 'US')` for private-sector statements

**What happens:** First match is ADA Title II (public). Private-sector callers get the wrong scope.
**Why it's wrong:** US private-sector statements must reference Title III AND HHS §504 (REHAB) for HHS-funded orgs.
**Do this instead:** Use `getNationalLaws('US').filter(l => l.scope === 'private')` and handle ADA + REHAB explicitly. See `statement-generator.ts` US branch.

### Reading `complianceDeadlines.largeEntity.populationThreshold` without narrowing

**What happens:** Section 504 entry uses `employeeThreshold: 15`, not `populationThreshold`. Direct field access yields `undefined`.
**Why it's wrong:** `ComplianceDeadlineEntry` is a discriminated union; field shape depends on `kind`.
**Do this instead:** Narrow on the discriminant before reading. See REHAB gotcha in CLAUDE.md.

### Bypassing the convergence DB

**What happens:** Reporter code looks up WCAG → law mapping by ad-hoc `if/else` chains.
**Why it's wrong:** Drifts away from JSON-validated source; new countries/laws never surface in reports.
**Do this instead:** Always go through `@holmdigital/standards` exports.

### Mutating JSON data at runtime

**What happens:** Helper accidentally pushes to an array returned by `getAllConvergenceRules()`.
**Why it's wrong:** JSON imports are shared by reference across the process; mutation poisons subsequent lookups.
**Do this instead:** Treat lookup return values as readonly; clone before mutation.

## Error Handling

**Strategy:** Fail-soft for individual rule lookups (return `null`), fail-hard at the scan level (throw).

**Patterns:**
- Standards lookups return `null` on miss (e.g. `getEN301549Mapping`, `getConvergenceRule`); callers must null-check.
- `RegulatoryScanner.scan()` throws on Puppeteer/network failure; CLI catches and prints via `chalk.red`.
- `--invalid-https-cert` flag opts into ignoring TLS errors during scan.
- CI mode (`--ci` or `failOnCritical`) maps `complianceStatus === 'FAIL'` to `process.exit(1)`.
- Statement generator throws on missing required `metadata.country`.

## Cross-Cutting Concerns

**Logging:** `console.log` + `chalk` for human output; `ora` for spinners during long operations. `silent: true` ScannerOption suppresses output for `--json` mode.

**Validation:** `ajv` (in `packages/standards/scripts/validate-data.js` + `validate-schema.js`) gate-keeps JSON before publish; html-validate gate-keeps scanned pages.

**Authentication:** Optional `--api-key` for HolmDigital Cloud upload, handled in `packages/engine/src/cli/cloud-client.ts`.

**i18n:** `packages/engine/src/i18n/index.ts` loads from `packages/engine/src/locales/<lang>.json`; reporting templates additionally pull from `packages/engine/src/reporting/templates/<lang>.json` (16 locales incl. regional variants).

---

*Architecture analysis: 2026-05-10*
