# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Monorepo with layered package architecture (Standards -> Components -> Engine)

**Key Characteristics:**
- Three npm packages with strict dependency hierarchy: `@holmdigital/standards` (data layer) -> `@holmdigital/components` (UI layer) -> `@holmdigital/engine` (orchestration layer)
- The "Convergence Schema" is the core abstraction: maps WCAG criteria to EN 301 549 clauses, national laws (DOS-lagen), and enforcement risk levels
- Engine drives headless browser scanning via Puppeteer + axe-core, enriches raw violations with regulatory context from standards, and generates multi-format reports
- Components are prescriptive React components that enforce accessibility compliance by design (contrast, touch targets, ARIA, focus management)
- Internationalization (i18n) spans all packages: standards data in 12 locales, engine CLI/reports in 9 languages, statement templates in 9 languages

## Layers

**Standards (Data Layer):**
- Purpose: Machine-readable regulatory database mapping WCAG to EN 301 549 to national laws
- Location: `packages/standards/`
- Contains: JSON data files for rules (per locale), legal framework data, ICT manual checks, TypeScript types, query/filter functions
- Depends on: `ajv` (JSON schema validation)
- Used by: `@holmdigital/components`, `@holmdigital/engine`

**Components (UI Layer):**
- Purpose: Prescriptive accessible React components for regulatory compliance
- Location: `packages/components/`
- Contains: 28 React components (Button, FormField, Dialog, Modal, DataTable, etc.) and AccessibilityStatement generator component
- Depends on: `@holmdigital/standards` (for enforcement body data, statement tools), `lucide-react` (icons)
- Used by: `@holmdigital/engine` (SSR for statement generation), end-user applications

**Engine (Orchestration Layer):**
- Purpose: Automated accessibility scanning with regulatory context enrichment and report generation
- Location: `packages/engine/`
- Contains: Core scanner, Virtual DOM builder, HTML validator, CLI, reporting generators (HTML/PDF/JUnit/Markdown/Badge), cloud client, i18n, pseudo-automation test generator
- Depends on: `@holmdigital/standards`, `@holmdigital/components`, `axe-core`, `puppeteer`, `html-validate`, `commander`, `chalk`, `ora`, `cosmiconfig`, `ws`
- Used by: CLI users (`hd-a11y-scan`), CI/CD pipelines, programmatic API consumers

## Data Flow

**CLI Scan Flow:**

1. User runs `hd-a11y-scan <url>` (entry: `packages/engine/src/cli/index.ts`)
2. `cosmiconfig` loads config from `.a11yrc` / `package.json` / etc., CLI options override file config
3. `RegulatoryScanner` instantiated with merged options (`packages/engine/src/core/regulatory-scanner.ts`)
4. Puppeteer launches headless browser, navigates to URL with retry logic (3 attempts)
5. `VirtualDOMBuilder` traverses DOM including Shadow DOM (`packages/engine/src/core/virtual-dom.ts`)
6. `HtmlValidator` validates page HTML structure (`packages/engine/src/core/html-validator.ts`)
7. axe-core injected into page and run to detect WCAG violations
8. `enrichResults()` maps each axe violation to a `ConvergenceRule` from `@holmdigital/standards` via `generateRegulatoryReport()` and `searchRulesByTags()`, attaching legal context
9. `generateResultPackage()` computes compliance score (weighted by severity), stats, compliance status, and legal summary
10. CLI outputs dashboard, generates optional artifacts: PDF, HTML report, accessibility statement, JUnit XML, badge markdown
11. Optional: results sent to HolmDigital Cloud via `sendToCloud()` REST API

**Regulatory Report Enrichment Flow:**

1. Raw axe-core violation received (has `id`, `tags`, `help`, `description`, `nodes`)
2. Direct lookup by rule ID in standards database: `generateRegulatoryReport(violation.id, lang)` (`packages/standards/src/index.ts`)
3. Fallback: search by axe tags via `searchRulesByTags(violation.tags, lang)`
4. If matched: merge report with axe-specific data (help text, failing nodes with HTML/selectors)
5. If unmatched: create generic report with `'Unknown'` criteria and default `'medium'` risk
6. Full `ConvergenceRule` fetched via `getConvergenceRule()` to attach `legalContext` (WAD/EAA applicability, deadlines)
7. Result: `RegulatoryReport` enriched with WCAG criteria, EN 301 549 mapping, DOS-lagen reference, DIGG risk, EAA impact, remediation guidance, component recommendation

**Accessibility Statement Generation Flow:**

1. `ScanResult` passed to `generateStatementContent()` (`packages/engine/src/reporting/statement-generator.ts`)
2. Loads language-specific template JSON from `packages/engine/src/reporting/templates/{lang}.json`
3. Determines compliance level: `full` (score 100), `partial` (no critical), `non-compliant` (critical issues)
4. For HTML format: creates `AccessibilityStatementProps`, renders `AccessibilityStatement` React component via `renderToStaticMarkup()` (SSR)
5. For Markdown format: processes template with substitution engine (conditional blocks, choice blocks, variable replacement)
6. Country-specific enforcement body resolved from `ENFORCEMENT_BODIES` map in standards package

**State Management:**
- No shared mutable state between packages; each scan creates a fresh `RegulatoryScanner` instance
- `i18n` module uses module-level `currentLang` variable set once per CLI invocation via `setLanguage()`
- Standards data loaded at module init time (static JSON imports)

## Key Abstractions

**ConvergenceRule:**
- Purpose: The central data type mapping WCAG criteria to European standards, national laws, and enforcement risk
- Defined in: `packages/standards/src/types.ts`
- Used in: `packages/standards/data/rules.{locale}.json`, `packages/standards/src/index.ts`, `packages/engine/src/core/regulatory-scanner.ts`
- Pattern: Static JSON data queried via functional API (`getConvergenceRule()`, `searchRulesByTags()`, `getRulesByFramework()`)

**RegulatoryReport:**
- Purpose: Scan-time report combining a ConvergenceRule with actual violation data from axe-core
- Defined in: `packages/standards/src/types.ts`
- Created in: `packages/engine/src/core/regulatory-scanner.ts` (`enrichResults()` method)
- Pattern: Generated per-violation, enriched with failing node details, used across all reporting

**ScanResult:**
- Purpose: Complete scan output including all reports, stats, score, metadata, legal summary
- Defined in: `packages/engine/src/core/regulatory-scanner.ts`
- Pattern: Returned from `RegulatoryScanner.scan()`, consumed by all report generators and cloud client

**VirtualNode:**
- Purpose: Flattened representation of DOM tree including Shadow DOM for accessibility analysis
- Defined in: `packages/engine/src/core/virtual-dom.ts`
- Pattern: Built via browser-injected script to minimize round-trips; captures attributes, computed styles, bounding rects

**LegalContext:**
- Purpose: Links a rule to EU directives (WAD/EAA), sector applicability, and deadline information
- Defined in: `packages/standards/src/types.ts`
- Pattern: Optional field on `ConvergenceRule`, enables legal risk assessment in scan results

## Entry Points

**CLI (`hd-a11y-scan`):**
- Location: `packages/engine/src/cli/index.ts`
- Triggers: `npx hd-a11y-scan <url>`, `npm run scan:local` from monorepo root
- Responsibilities: Parse CLI args, load cosmiconfig, orchestrate scan, output dashboard, generate report artifacts, upload to cloud

**Engine Library API:**
- Location: `packages/engine/src/index.ts`
- Triggers: `import { RegulatoryScanner } from '@holmdigital/engine'`
- Responsibilities: Exports `RegulatoryScanner`, `VirtualDOMBuilder`, `PseudoAutomationEngine`, `generateStatementContent`, i18n functions

**Standards Library API:**
- Location: `packages/standards/src/index.ts`
- Triggers: `import { getConvergenceRule } from '@holmdigital/standards'`
- Responsibilities: Exports all query functions for rules, legal frameworks, national laws, enforcement bodies, ICT checks

**Components Library:**
- Location: `packages/components/src/index.ts`
- Triggers: `import { Button, FormField } from '@holmdigital/components'`
- Responsibilities: Exports all 28 accessible React components via barrel file; also supports tree-shakeable individual imports (e.g., `@holmdigital/components/Button`)

## Error Handling

**Strategy:** Defensive with graceful degradation

**Patterns:**
- Scanner retries page navigation 3 times with 2-second delays before failing (`packages/engine/src/core/regulatory-scanner.ts`, lines 129-143)
- Network idle timeout is best-effort (10s timeout, continues scan on failure)
- If axe finds violations with no matching ConvergenceRule, a generic fallback report is created with `'Unknown'` criteria and `'medium'` risk (lines 276-301)
- Cloud client handles specific HTTP status codes (401, 403) with user-friendly messages and returns `CloudResponse` with `success: boolean` rather than throwing (`packages/engine/src/cli/cloud-client.ts`)
- CLI maps common error types (DNS resolution, connection refused, timeout) to human-readable messages (lines 382-394)
- Browser is always closed in `finally` block to prevent resource leaks
- Statement template loading tries multiple paths (dist, src, cwd-relative) before falling back to English
- i18n `t()` function falls back to English if key missing in current locale, returns raw key if missing entirely

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.warn` / `console.error` throughout. Engine scanner has `silent` mode that suppresses debug output (for `--json` mode). CLI uses `chalk` for colored output and `ora` for spinners.

**Validation:** JSON schema validation for standards data (`packages/standards/schema/convergence-schema.json` validated via `ajv`). HTML validation via `html-validate` library during scans. URL validation in CLI entry point.

**Authentication:** API key-based auth for HolmDigital Cloud (`x-api-key` header). OIDC-based npm publishing in CI. No user authentication in the library itself.

**Internationalization:** Three-tier i18n:
1. Standards data: 12 locale variants of `rules.{lang}.json` with localized descriptions/interpretations
2. Engine CLI/reports: 9 locale JSON files in `packages/engine/src/locales/` with UI strings
3. Statement templates: 9 locale JSON files in `packages/engine/src/reporting/templates/` for accessibility statement generation
4. Components: `AccessibilityStatement` component supports `sv`, `en`, and `no` templates inline, with configurable locale

**Configuration:** `cosmiconfig` supports `.a11yrc`, `a11y.config.js`, `package.json` `a11y` key. CLI flags override file config. Viewport, threshold, language, cloud settings all configurable.

---

*Architecture analysis: 2026-02-26*
