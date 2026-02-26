# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Monorepo with layered package architecture (Standards -> Components -> Engine)

**Key Characteristics:**
- Three-package monorepo with strict dependency hierarchy: `standards` (base) -> `components` (depends on standards) -> `engine` (depends on both)
- Data-driven regulatory rules stored as JSON, exposed through typed TypeScript API
- CLI-first scanning tool that orchestrates browser automation (Puppeteer), accessibility testing (axe-core), HTML validation (html-validate), and regulatory enrichment
- Components are "prescriptive" -- they enforce accessibility compliance by design (contrast, touch targets, ARIA attributes)
- Internationalization throughout: 12+ language/locale variants for rules data, 9 locales for CLI/report UI strings, and localized accessibility statement templates

## Layers

**Standards Layer (`@holmdigital/standards`):**
- Purpose: Machine-readable regulatory database mapping WCAG -> EN 301 549 -> DOS-lagen (Swedish accessibility law), plus EU legal framework data
- Location: `packages/standards/`
- Contains: JSON rule data files (`data/rules.*.json`), legal data (`data/legal/*.json`), JSON Schema (`schema/convergence-schema.json`), TypeScript types (`src/types.ts`), and query/lookup functions (`src/index.ts`)
- Depends on: `ajv` (JSON Schema validation)
- Used by: `@holmdigital/components`, `@holmdigital/engine`

**Components Layer (`@holmdigital/components`):**
- Purpose: Prescriptive, accessible React UI components that enforce regulatory compliance by design
- Location: `packages/components/`
- Contains: 28 React components (Button, Dialog, Modal, DataTable, AccessibilityStatement, etc.), each in its own PascalCase directory
- Depends on: `@holmdigital/standards` (for enforcement body data, statement tools), `lucide-react` (icons), React 18+
- Used by: `@holmdigital/engine` (server-side rendering of AccessibilityStatement component for report generation)

**Engine Layer (`@holmdigital/engine`):**
- Purpose: Regulatory accessibility scanning engine with CLI, browser automation, reporting, and cloud integration
- Location: `packages/engine/`
- Contains: Core scanner (`src/core/`), CLI (`src/cli/`), reporting generators (`src/reporting/`), automation test generator (`src/automation/`), i18n system (`src/i18n/`)
- Depends on: `@holmdigital/standards`, `@holmdigital/components`, `axe-core`, `puppeteer`, `html-validate`, `commander`, `chalk`, `ora`, `cosmiconfig`
- Used by: End users via CLI (`hd-a11y-scan`) or programmatic API

## Data Flow

**Scan Flow (CLI invocation):**

1. User runs `hd-a11y-scan <url>` -- CLI entry point at `packages/engine/src/cli/index.ts`
2. `cosmiconfig` loads config from `.a11yrc`, `package.json`, etc. CLI options override file config.
3. `setLanguage()` sets the i18n locale for the session
4. `RegulatoryScanner` (`packages/engine/src/core/regulatory-scanner.ts`) is instantiated with merged options
5. Scanner launches headless Puppeteer browser, navigates to URL (with retry logic, 3 attempts)
6. `HtmlValidator` (`packages/engine/src/core/html-validator.ts`) validates raw page HTML using `html-validate`
7. `VirtualDOMBuilder` (`packages/engine/src/core/virtual-dom.ts`) builds a flat representation of DOM + Shadow DOM
8. `axe-core` is injected into the page and runs accessibility analysis
9. `enrichResults()` maps each axe violation to a `ConvergenceRule` from `@holmdigital/standards` -- first by exact `ruleId` match, then by tag-based search. Unknown rules get a generic fallback report.
10. `generateResultPackage()` computes weighted compliance score (0-100), stats by severity, compliance status, and EU legal summary
11. Results are returned as `ScanResult` object

**Report Generation Flow:**

1. `ScanResult` feeds into multiple output generators based on CLI flags:
   - `--json`: Raw JSON to stdout
   - `--pdf`: `generateReportHTML()` -> `generatePDF()` (uses Puppeteer to render HTML to PDF)
   - `--statement`: `generateStatement()` renders `AccessibilityStatement` React component server-side (or generates Markdown from localized templates)
   - `--junit`: `generateJUnitXML()` produces CI-compatible XML
   - `--ci`: `generateGitHubActionsAnnotations()` outputs `::error`/`::warning` workflow commands
   - `--api-key`: `sendToCloud()` POSTs results to HolmDigital Cloud API

**Regulatory Data Flow:**

1. Rule data originates in JSON files: `packages/standards/data/rules.{lang}.json`
2. Each rule follows the Convergence Schema (`packages/standards/schema/convergence-schema.json`)
3. Rules map WCAG criteria -> EN 301 549 clauses -> DOS-lagen references, with remediation guidance and component recommendations
4. `getData(lang)` in `packages/standards/src/index.ts` selects the correct locale-specific rule set
5. Query functions (`getConvergenceRule`, `searchRulesByTags`, `generateRegulatoryReport`, etc.) provide typed access to the data

**State Management:**
- No client-side state management library. Engine is stateless per-scan.
- Scanner holds browser instance state (`this.browser`) during scan lifecycle, released in `close()`
- i18n uses module-level singleton (`currentLang` variable in `packages/engine/src/i18n/index.ts`)
- Components use standard React hooks (`useState`, `useMemo`, `useRef`, `useEffect`) for local component state

## Key Abstractions

**ConvergenceRule:**
- Purpose: Core data type that maps accessibility standards across WCAG, EN 301 549, and DOS-lagen
- Defined in: `packages/standards/src/types.ts`
- Contains: `ruleId`, `wcagCriteria`, `wcagLevel`, `en301549Criteria`, `dosLagenReference`, `remediation`, `holmdigitalInsight`, `testability`, `tags`, `legalContext`
- Pattern: Static JSON data queried through functional API

**RegulatoryReport:**
- Purpose: Represents a single violation enriched with regulatory context
- Defined in: `packages/standards/src/types.ts`
- Created by: `generateRegulatoryReport()` in standards, enriched by `enrichResults()` in engine
- Contains: Everything from ConvergenceRule plus runtime data (failing nodes, axe help text)

**ScanResult:**
- Purpose: Complete result package from a scan
- Defined in: `packages/engine/src/core/regulatory-scanner.ts`
- Contains: URL, timestamp, metadata (versions, duration), reports array, stats, score, compliance status, HTML validation, legal summary

**RegulatoryScanner:**
- Purpose: Orchestrates the full scan pipeline
- Defined in: `packages/engine/src/core/regulatory-scanner.ts`
- Pattern: Class-based with lifecycle management (init browser, scan, close)
- Key methods: `scan()`, `enrichResults()`, `generateResultPackage()`, `close()`

**VirtualDOMBuilder:**
- Purpose: Creates a flat VirtualNode tree including Shadow DOM for advanced analysis
- Defined in: `packages/engine/src/core/virtual-dom.ts`
- Pattern: Injects browser-side script via Puppeteer `page.evaluate()` for efficient traversal

**HtmlValidator:**
- Purpose: Validates structural HTML issues that impact accessibility tool accuracy
- Defined in: `packages/engine/src/core/html-validator.ts`
- Pattern: Wraps `html-validate` with accessibility-focused configuration

## Entry Points

**CLI Entry (`hd-a11y-scan`):**
- Location: `packages/engine/src/cli/index.ts`
- Triggers: `hd-a11y-scan <url> [options]` from command line
- Responsibilities: Parse args, load config via cosmiconfig, instantiate scanner, run scan, generate outputs (JSON, PDF, HTML, JUnit, statement, cloud upload), handle errors with user-friendly messages, set exit codes for CI

**Engine Programmatic API:**
- Location: `packages/engine/src/index.ts`
- Triggers: `import { RegulatoryScanner } from '@holmdigital/engine'`
- Exports: `RegulatoryScanner`, `VirtualDOMBuilder`, `VirtualNode`, `PseudoAutomationEngine`, i18n functions, `generateStatement`/`generateStatementContent`

**Standards API:**
- Location: `packages/standards/src/index.ts`
- Triggers: `import { getConvergenceRule, ... } from '@holmdigital/standards'`
- Exports: All query functions (30+), all types, enforcement body constants, legal framework data

**Components API:**
- Location: `packages/components/src/index.ts`
- Triggers: `import { Button, Dialog, ... } from '@holmdigital/components'`
- Exports: All 28 components (barrel file re-exports from individual component directories)
- Also supports tree-shaking via per-component exports: `import { Button } from '@holmdigital/components/Button'`

## Error Handling

**Strategy:** Defensive error handling with user-friendly messages, graceful degradation, and fallback behavior

**Patterns:**
- Scanner uses try/catch with specific error type detection (ERR_NAME_NOT_RESOLVED, ERR_CONNECTION_REFUSED, Timeout) to provide actionable CLI messages
- Navigation has 3-attempt retry logic with 2-second delays between attempts
- Network idle wait is best-effort (catches timeout, proceeds anyway)
- `enrichResults()` always produces a report for every violation -- if no matching ConvergenceRule is found, a generic fallback report is created with "medium" risk
- Standards `getData()` falls back to English for unsupported languages with a console warning
- i18n `t()` function falls back to English locale if key is missing, and returns the raw key string as last resort
- Statement template loading tries multiple file paths (dist, src, cwd-relative) before throwing
- Cloud client catches network errors (ENOTFOUND, ECONNREFUSED) and returns structured `CloudResponse` with error messages
- Browser is always closed in `finally` block to prevent resource leaks

## Cross-Cutting Concerns

**Logging:** Console-based logging with `chalk` for colored output. Scanner has `silent` mode (controlled by `--json` flag) that suppresses debug logs. `ora` spinner for progress indication in CLI. No structured logging framework.

**Validation:** JSON Schema validation for rule data (`packages/standards/schema/convergence-schema.json`). HTML validation via `html-validate` in the engine. TypeScript strict mode (`strict: true`) across all packages. No runtime input validation middleware.

**Authentication:** API key authentication for HolmDigital Cloud integration (`x-api-key` header). No user authentication in the open-source packages themselves.

**Internationalization:** Dual-layer i18n system:
1. Standards data: 12 locale-specific JSON rule files (`rules.en.json`, `rules.sv.json`, etc.)
2. Engine UI strings: 9 locale JSON files (`packages/engine/src/locales/*.json`) with typed key paths
3. Statement templates: 9 language template JSON files (`packages/engine/src/reporting/templates/*.json`)

**Configuration:** cosmiconfig-based config loading in CLI (supports `.a11yrc`, `a11y.config.js`, `package.json` field). CLI options take precedence over file config, with sensible defaults.

**Build:** tsup for all packages (CJS + ESM dual output with `.d.ts` declarations). Standards builds first, then Components, then Engine (respecting dependency order). Copy-assets script for engine (`scripts/copy-assets.mjs`).

---

*Architecture analysis: 2026-02-26*
