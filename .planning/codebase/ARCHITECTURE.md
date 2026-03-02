# Architecture

**Analysis Date:** 2026-03-02

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
- Key exports: `getEN301549Mapping()`, `getConvergenceRule()`, `getRecommendedComponent()`, `getNationalLaws()`, `getStatementTools()`, and 30+ other query functions
- Depends on: `ajv` (JSON Schema validation)
- Used by: `@holmdigital/components`, `@holmdigital/engine`

**Components Layer (`@holmdigital/components`):**
- Purpose: Prescriptive, accessible React UI components that enforce regulatory compliance by design
- Location: `packages/components/`
- Contains: 29 React components (Button, Dialog, Modal, DataTable, AccessibilityStatement, etc.), each in its own PascalCase directory with `.tsx` file
- Design pattern: Each component includes JSDoc comments mapping to WCAG criteria and EN 301 549 sections (e.g., Button enforces WCAG 1.4.3 contrast, 2.1.1 keyboard access, 2.4.7 focus indicators)
- Build: tsup produces both ESM and CJS with individual entry points per component in `package.json` exports
- Depends on: `@holmdigital/standards` (for enforcement body data, statement tools), `lucide-react` (icons), React 18+
- Used by: `@holmdigital/engine` (server-side rendering of AccessibilityStatement component for report generation), external React applications

**Engine Layer (`@holmdigital/engine`):**
- Purpose: Regulatory accessibility scanning engine with CLI, browser automation, reporting, and cloud integration
- Location: `packages/engine/`
- Core modules:
  - `src/core/`: Scanner orchestration, Virtual DOM builder, HTML validator
  - `src/cli/`: CLI entry point with Commander framework, config loading via cosmiconfig
  - `src/reporting/`: Multi-format output generators (PDF, HTML, JUnit XML, accessibility statements, badges)
  - `src/automation/`: Pseudo-automation test script generator for manual verification
  - `src/i18n/`: Language selection and string translation
  - `src/locales/`: 9 language JSON files for CLI/report UI strings
- Depends on: `@holmdigital/standards`, `@holmdigital/components`, `axe-core`, `puppeteer`, `html-validate`, `commander`, `chalk`, `ora`, `cosmiconfig`, `ws` (cloud WebSocket)
- Used by: End users via CLI (`hd-a11y-scan`) or programmatic API in Node.js

## Data Flow

**Scan Flow (CLI invocation):**

1. User runs `hd-a11y-scan <url> [options]` -- CLI entry point at `packages/engine/src/cli/index.ts`
2. `cosmiconfig` loads config from `.a11yrc`, `a11y.config.js`, `package.json`, etc. CLI options override file config; defaults fill missing values.
3. `setLanguage()` sets the i18n locale for the session (affects all subsequent `t()` calls and standards `getData(lang)` calls)
4. `RegulatoryScanner` (`packages/engine/src/core/regulatory-scanner.ts`) is instantiated with merged options (url, headless, standard, viewport, silent mode, severity threshold, certificate validation)
5. Scanner launches headless Puppeteer browser with optional invalid HTTPS cert support
6. Navigates to URL with 3-attempt retry logic (2-second delay between retries)
7. Sets viewport if specified (e.g., "mobile", "desktop", or "1024x768")
8. Waits for network idle (500ms timeout, 10s max) before proceeding
9. `HtmlValidator` (`packages/engine/src/core/html-validator.ts`) validates raw page HTML using `html-validate` library with accessibility-focused rule configuration
10. `VirtualDOMBuilder` (`packages/engine/src/core/virtual-dom.ts`) builds a flat representation of DOM + Shadow DOM via single in-page script evaluation (minimizes Puppeteer IPC overhead)
11. `axe-core` is injected into the page and runs automated accessibility analysis, returns violations
12. `enrichResults()` maps each axe violation to a `ConvergenceRule` from `@holmdigital/standards`:
    - First tries exact `ruleId` match
    - Falls back to tag-based search
    - Creates generic "medium" risk report if no match found
13. `generateResultPackage()` computes weighted compliance score (0-100), stats by severity (critical/high/medium/low), compliance status (PASS/FAIL), and EU legal summary (WAD/EAA applicability)
14. Results returned as `ScanResult` object containing: URL, timestamp, metadata (versions, scan duration), reports array, statistics, score, compliance status, optional HTML validation results, legal summary

**Report Generation Flow:**

1. `ScanResult` feeds into multiple output generators based on CLI flags:
   - `--json`: Raw JSON to stdout
   - `--pdf <path>`: `generateReportHTML()` -> `generatePDF()` (uses Puppeteer to render HTML to PDF)
   - `--statement <path>`: `generateStatementContent()` renders `AccessibilityStatement` React component server-side using `renderToStaticMarkup()`, with fallback to Markdown from localized templates
   - `--junit <path>`: `generateJUnitXML()` produces CI-compatible JUnit XML with test cases per violation
   - `--ci`: Sets exit code 1 if violations meet threshold; integrates with GitHub Actions via `--threshold`
   - `--api-key <key>`: `CloudClient.sendToCloud()` POSTs results to HolmDigital Cloud API
2. Templates loaded from multiple fallback paths: dist, src, project root
3. All output strings localized based on current language set at CLI startup

**Regulatory Data Flow:**

1. Rule data originates in JSON files: `packages/standards/data/rules.{lang}.json` (12 languages)
2. Each rule follows the Convergence Schema (`packages/standards/schema/convergence-schema.json`) validated with AJV
3. Rules contain: WCAG criteria -> EN 301 549 clauses -> DOS-lagen references, plus remediation guidance, component recommendations, DIGG risk levels, EAA deadline impact, testability flags
4. `getData(lang)` in `packages/standards/src/index.ts` selects the correct locale-specific rule set; falls back to English with console warning if language unsupported
5. Query functions (`getConvergenceRule`, `searchRulesByTags`, `generateRegulatoryReport`, `getRulesByFramework`, `getNationalLaws`, etc.) provide typed access to the data
6. Legal data loaded from `data/legal/*.json`: frameworks, Nordic authorities, statement tools, national laws with sanction information

**Accessibility Statement Generation Flow:**

1. `generateStatementContent()` receives `ScanResult` + optional metadata (org name, email, phone, country, response time, publish date)
2. Loads localized template JSON from `packages/engine/src/reporting/templates/{lang}.json` with fallback chain
3. Determines compliance level based on:
   - Critical violations present → "non-compliant"
   - Score < 100 but no critical → "partial"
   - Score = 100 → "full"
4. Extracts non-compliance items from reports (ruleId + wcagCriteria)
5. Renders React component `AccessibilityStatement` (from `@holmdigital/components`) via `renderToStaticMarkup()` with compliance level, known issues, enforcement body (based on country), and metadata
6. Returns HTML output or converts to Markdown if requested

**State Management:**

- No client-side state management library. Engine is stateless per-scan.
- Scanner holds browser instance state (`this.browser`) during scan lifecycle, released in `close()` method
- i18n uses module-level singleton (`currentLang` variable in `packages/engine/src/i18n/index.ts`) set once at CLI startup
- Components use standard React hooks (`useState`, `useMemo`, `useRef`, `useEffect`) for local component state only (no Redux, Zustand, etc.)

## Key Abstractions

**ConvergenceRule:**
- Purpose: Core data type that maps accessibility standards across WCAG, EN 301 549, and DOS-lagen
- Location: Defined in `packages/standards/src/types.ts`, instantiated from `packages/standards/data/rules.*.json`
- Contains: `ruleId`, `wcagCriteria`, `wcagLevel`, `wcagTitle`, `en301549Criteria`, `en301549Title`, `dosLagenReference`, `dosLagenApplies`, `remediation` (description, component, codeExample, technicalGuidance), `holmdigitalInsight` (diggRisk, eaaImpact, swedishInterpretation), `testability` (automated, requiresManualCheck, pseudoAutomation), `tags`, `legalContext` (frameworks, sectors, eaaDeadline), `componentRecommendation`
- Pattern: Static JSON data queried through functional API (`getConvergenceRule`, `searchRulesByTags`, etc.)

**RegulatoryReport:**
- Purpose: Represents a single violation enriched with regulatory context
- Location: Defined in `packages/standards/src/types.ts`
- Created by: `generateRegulatoryReport()` in standards; enriched by `enrichResults()` in engine with axe-core violations
- Contains: Everything from ConvergenceRule plus runtime data (failing nodes, axe help text, number of instances)

**ScanResult:**
- Purpose: Complete result package from a scan operation
- Location: Defined in `packages/engine/src/core/regulatory-scanner.ts`
- Contains: `url`, `timestamp`, `metadata` (engineVersion, axeCoreVersion, standardsVersion, scanDuration, pageTitle, pageLanguage), `reports` array, `stats` (passed/critical/high/medium/low counts, total), `score` (0-100), `complianceStatus` (PASS/FAIL), `htmlValidation` (optional), `legalSummary` (WAD/EAA/EAA deadline violation counts)

**RegulatoryScanner:**
- Purpose: Orchestrates the full scan pipeline
- Location: `packages/engine/src/core/regulatory-scanner.ts`
- Pattern: Class-based with lifecycle management (init browser, scan, close)
- Constructor takes: `ScannerOptions` (url, headless, standard, failOnCritical, viewport, silent, severityThreshold, invalidHttpsCert)
- Key methods: `scan()` -> Promise<ScanResult>, `enrichResults()`, `generateResultPackage()`, `close()`

**VirtualDOMBuilder:**
- Purpose: Creates a flat `VirtualNode` tree including Shadow DOM for advanced analysis beyond Axe-core's Light DOM-only capabilities
- Location: `packages/engine/src/core/virtual-dom.ts`
- Pattern: Injects browser-side script via Puppeteer `page.evaluate()` for efficient single-pass traversal (minimizes IPC round-trips)
- Returns: Root `VirtualNode` with full tree of nodes containing tagName, attributes, children, parentId, isShadowRoot flag, shadowMode, bounding rect, computed style, textContent
- Used for: Shadow DOM penetration, custom element inspection, computed style analysis

**HtmlValidator:**
- Purpose: Validates structural HTML issues that impact accessibility tool accuracy
- Location: `packages/engine/src/core/html-validator.ts`
- Pattern: Wraps `html-validate` library with custom configuration disabling non-accessibility rules
- Returns: `ValidationResult` object with valid flag and array of errors (rule, message, line, column, selector)

**PseudoAutomationEngine:**
- Purpose: Generates Playwright test script stubs and manual verification checklists for rules requiring human judgment
- Location: `packages/engine/src/automation/pseudo-automation.ts`
- Methods: `generateTestScript(report, url)` -> Playwright test skeleton, `generateManualChecklist(report)` -> Markdown checklist

## Entry Points

**CLI Entry (`hd-a11y-scan`):**
- Location: `packages/engine/src/cli/index.ts`
- Triggers: `hd-a11y-scan <url> [options]` from command line or via NPM script `npm run scan:local`
- Responsibilities: Parse args via Commander, load config via cosmiconfig, merge with defaults, instantiate scanner, run scan, generate outputs (JSON, PDF, HTML, JUnit, statement, cloud upload), handle errors with user-friendly messages, set exit codes for CI (0 on pass, 1 on critical violations if `--ci` flag set)
- Outputs: Spinner feedback via ora, colored output via chalk, file writes for reports, console JSON output, HTTP cloud upload

**Engine Programmatic API:**
- Location: `packages/engine/src/index.ts`
- Triggers: `import { RegulatoryScanner, ... } from '@holmdigital/engine'`
- Exports: `RegulatoryScanner` (class), `VirtualDOMBuilder`, `VirtualNode` (type), `PseudoAutomationEngine`, i18n functions (`setLanguage`, `t`), `generateStatement`, `generateStatementContent`
- Use case: Node.js applications that need to programmatically scan pages and generate reports

**Standards API:**
- Location: `packages/standards/src/index.ts`
- Triggers: `import { getConvergenceRule, ... } from '@holmdigital/standards'`
- Exports: 30+ query functions (getEN301549Mapping, getConvergenceRule, getRecommendedComponent, getNationalLaws, getLegalFrameworks, getNordicAuthorities, getStatementTools, searchRulesByTags, etc.), all types, `ENFORCEMENT_BODIES` constant, legal framework data
- Use case: Applications needing regulatory data lookup independent of scanning engine

**Components API:**
- Location: `packages/components/src/index.ts`
- Triggers: `import { Button, Dialog, ... } from '@holmdigital/components'`
- Exports: All 29 components (barrel file re-exports from individual component directories)
- Also supports tree-shaking via per-component exports in `package.json`: `import { Button } from '@holmdigital/components/Button'`
- Use case: React applications embedding accessible, compliance-ready UI components

## Error Handling

**Strategy:** Defensive error handling with user-friendly messages, graceful degradation, and fallback behavior

**Patterns:**

- **Scanner Initialization:** Try/catch with specific error type detection (ERR_NAME_NOT_RESOLVED = DNS failure, ERR_CONNECTION_REFUSED = server not running, Timeout = slow/unreachable) to provide actionable CLI messages
- **Navigation:** 3-attempt retry logic with 2-second delays between attempts; throws if all retries fail
- **Network Idle:** Best-effort wait (500ms idle time, 10s absolute timeout); catches timeout and proceeds anyway
- **Enrichment:** `enrichResults()` always produces a report for every violation -- if no matching `ConvergenceRule` is found, a generic fallback report is created with "medium" risk
- **Standards Lookup:** `getData()` falls back to English for unsupported languages with console warning; `t()` i18n function falls back to English locale if key missing, returns raw key string as last resort
- **Template Loading:** `generateStatementContent()` tries multiple file paths (dist, src, cwd-relative) before throwing
- **Cloud Integration:** `CloudClient` catches network errors (ENOTFOUND, ECONNREFUSED) and returns structured `CloudResponse` with error messages
- **Resource Cleanup:** Browser always closed in `finally` block to prevent resource leaks
- **Exit Codes:** 0 on clean scan, 1 on violations meeting `--threshold` severity (default "high" = critical + high violations)

## Cross-Cutting Concerns

**Logging:**
- Console-based logging with `chalk` for colored output
- Scanner has `silent` mode (controlled by `--json` flag) that suppresses debug logs
- Progress indication via `ora` spinner for long-running operations
- No structured logging framework (no Winston, Pino, etc.)

**Validation:**
- JSON Schema validation for rule data via AJV (`packages/standards/schema/convergence-schema.json`)
- HTML structure validation via `html-validate` in the engine core
- TypeScript strict mode (`strict: true`) across all packages for type safety
- No runtime input validation middleware (URL format checked in CLI, browser errors caught by Puppeteer)

**Authentication:**
- API key authentication for HolmDigital Cloud integration (`x-api-key` header)
- No user authentication in the open-source packages themselves
- `--api-key` flag or `.a11yrc` config file for cloud credentials

**Internationalization:**
- Dual-layer i18n system:
  1. Standards data: 12 locale-specific JSON rule files (`rules.en.json`, `rules.sv.json`, `rules.de.json`, `rules.fr.json`, `rules.es.json`, `rules.nl.json`, `rules.no.json`, `rules.fi.json`, `rules.da.json`, `rules.en-gb.json`, `rules.en-us.json`, `rules.en-ca.json`)
  2. Engine UI strings: 9 locale JSON files (`packages/engine/src/locales/*.json`) with typed key paths and template variable support (e.g., `{url}`, `{path}`, `{score}`)
  3. Statement templates: 9 language template JSON files (`packages/engine/src/reporting/templates/*.json`) for compliance statements
- Language selection: `--lang <code>` CLI flag or `.a11yrc` config; global `currentLang` state in i18n module
- Fallback chain: Requested language → English (with warning)

**Configuration:**
- cosmiconfig-based config loading in CLI (supports `.a11yrc`, `a11y.config.js`, `a11y.config.json`, `package.json` field `a11y`)
- CLI options take precedence over file config, with sensible defaults
- Config key names match CLI option names (e.g., `--lang` maps to `config.lang`)

**Build & Bundling:**
- tsup for all packages (CJS + ESM dual output with `.d.ts` declaration maps for source map support)
- Standards builds first, then Components, then Engine (respecting dependency order in root `package.json` build script)
- Copy-assets script for engine (`packages/engine/scripts/copy-assets.mjs`) to copy locales and templates into dist
- Individual component entry points via `package.json` exports for tree-shaking
- Source maps enabled for debugging (`sourceMap: true` in tsconfig)

---

*Architecture analysis: 2026-03-02*
