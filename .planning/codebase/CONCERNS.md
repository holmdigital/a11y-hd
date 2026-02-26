# Codebase Concerns

**Analysis Date:** 2026-02-26

## Tech Debt

**Duplicated Template Rendering Logic:**
- Issue: The template variable substitution and conditional block rendering logic is implemented independently in two places with different approaches. `AccessibilityStatement.tsx` uses `renderTemplate()` with inline `TEMPLATES` object (sv, en, no only), while `statement-generator.ts` uses `processText()` with external JSON templates (9 languages). The replacement variable maps differ in coverage and naming conventions.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 109-297), `packages/engine/src/reporting/statement-generator.ts` (lines 190-294)
- Impact: Bugs fixed in one renderer may not be fixed in the other. Language support diverges: the component only supports `sv`, `en`, `no` inline while the engine loads from 9 JSON template files. Adding a new template variable requires updating two separate replacement maps.
- Fix approach: Extract a shared template rendering utility into `@holmdigital/standards` or a new shared package. The component should load templates from the same JSON files the engine uses rather than hardcoding them inline.

**Hardcoded ENGINE_VERSION in Cloud Client:**
- Issue: `packages/engine/src/cli/cloud-client.ts` line 9 hardcodes `const ENGINE_VERSION = '1.4.4'` while the actual package version in `package.json` is `2.1.2`. The `regulatory-scanner.ts` reads version dynamically from `package.json` (correct approach), but the cloud client does not.
- Files: `packages/engine/src/cli/cloud-client.ts` (line 9)
- Impact: Cloud analytics receive incorrect engine version data, making it impossible to correlate scan results with the actual engine version deployed. Every release requires manual version bump in this file (which has clearly been forgotten).
- Fix approach: Use the same `getEngineVersion()` pattern from `packages/engine/src/core/regulatory-scanner.ts` or import from a shared location.

**Hardcoded Fallback Dates:**
- Issue: When `publishDate` is not provided, the code falls back to the literal string `'2024-01-01'` in multiple places rather than using a computed default or omitting the field.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 229-230, 254), `packages/engine/src/reporting/statement-generator.ts` (lines 226-233)
- Impact: Generated accessibility statements will contain factually incorrect dates for any website not published on 2024-01-01. Since these are legal compliance documents, incorrect dates could have regulatory consequences.
- Fix approach: Either require `publishDate` as a mandatory prop or omit the publish date section when it is not provided.

**Excessive Inline Styles in AccessibilityStatement Component:**
- Issue: The `AccessibilityStatement` component defines a massive inline `styles` object (lines 391-559) with ~170 lines of CSS-in-JS using `React.CSSProperties`. The component file is 701 lines total, making it the largest in the codebase.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`
- Impact: No CSS class names means styles cannot be overridden by consumers, no tree-shaking of unused styles, poor developer experience when debugging in browser DevTools, and the component is difficult to maintain.
- Fix approach: Extract styles to a CSS module or use the same unstyled pattern as other components. At minimum, expose a `classNames` prop or use `data-*` attributes for external styling hooks.

**Dead Comments and Thinking-Out-Loud Comments in JSX:**
- Issue: Lines 641-661 of `AccessibilityStatement.tsx` contain multi-line JSX comments that appear to be developer thinking/reasoning notes left in production code ("Wait, the template starts with...", "I will modify renderTemplate to...", "Let's let renderTemplate handle it"). These are not documentation; they are stream-of-consciousness notes.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 641-661)
- Impact: Confusing for contributors, increases file size, signals unfinished design decisions.
- Fix approach: Remove all thinking-out-loud comments. If design decisions need documentation, add a proper `@remarks` JSDoc comment.

**Both pnpm-lock.yaml and package-lock.json Present:**
- Issue: The repository root contains both `pnpm-lock.yaml` and `package-lock.json`. The CI workflow (`release.yml`) uses `npm ci`, and `package.json` uses npm workspaces. The `pnpm-workspace.yaml` file also exists.
- Files: `pnpm-lock.yaml`, `package-lock.json`, `pnpm-workspace.yaml`
- Impact: Ambiguity about which package manager is canonical. Lock files may drift, leading to "works on my machine" issues. Contributors may accidentally use the wrong package manager.
- Fix approach: Remove `pnpm-lock.yaml` and `pnpm-workspace.yaml` if npm is the canonical package manager (as indicated by CI), or switch CI to pnpm and remove `package-lock.json`. Add an `engines` field with `packageManager` or use corepack.

**Commented-Out Axe Configuration:**
- Issue: The axe-core `runOnly` configuration is commented out in the scanner with the note "Vi tar bort runOnly tillfälligt for att se ALLA fel". This means the scanner runs ALL axe rules including AAA and best-practices, not just the WCAG 2.1 AA rules that the tool is designed around.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 183-190)
- Impact: Scan results may include violations outside the regulatory scope (WCAG AAA, best-practices). This inflates violation counts and confuses the scoring system, which is calibrated for AA compliance. Legal reports could include irrelevant findings.
- Fix approach: Restore the `runOnly` filter or make it configurable via `ScannerOptions`. If running all rules is desired, separate the results by scope.

## Known Bugs

**AccessibilityStatement Language Selection Only Supports sv/en:**
- Symptoms: The `AccessibilityStatement` component's `locale` prop accepts any string, but the internal `lang` variable on line 205 collapses everything to either `'sv'` or `'en'`: `const lang = (locale === 'sv' ? 'sv' : 'en')`. Norwegian templates exist in `TEMPLATES.no` but are never selected.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (line 205)
- Trigger: Pass `locale="no"` to the component. The Norwegian template at line 136 is never used because the ternary always falls through to `'en'`.
- Workaround: None. The Norwegian template data (lines 136-148) is dead code in the component.

**Sector Prop is Unused:**
- Symptoms: The `sector` prop (`'public' | 'private'`) is destructured then immediately discarded via `sector: _sector` with an eslint-disable comment. The component generates identical output regardless of sector.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 185-186)
- Trigger: Pass `sector="private"` -- output is identical to `sector="public"`.
- Workaround: None. The prop is part of the public API but does nothing.

**Country Detection by TLD is Unreliable:**
- Symptoms: In `statement-generator.ts`, country is guessed from the URL's TLD (`result.url.endsWith('.no')`, `.dk`, `.fi`, `.de`). This fails for sites using `.com`, `.eu`, `.org`, or subdomains. Also notably missing: `.se` (the primary target market) and `.fr`, `.es`, `.nl`, `.ie`.
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 97-103)
- Trigger: Scan a Swedish `.se` site without passing `--country SE`. The country defaults to `'SE'` only because it is the hardcoded fallback, not because `.se` is detected.
- Workaround: Always pass `--country` flag explicitly.

## Security Considerations

**API Key Passed via CLI Argument:**
- Risk: The `--api-key` CLI option means the API key appears in shell history, process lists (`ps aux`), and CI logs unless explicitly masked.
- Files: `packages/engine/src/cli/index.ts` (line 56), `packages/engine/src/cli/cloud-client.ts`
- Current mitigation: None. The key is passed directly to the HTTP header.
- Recommendations: Support reading the API key from an environment variable (e.g., `HD_API_KEY`) as the primary method. Add documentation warning against passing secrets via CLI arguments. In CI, use `${{ secrets.HD_API_KEY }}` as env var instead.

**Puppeteer --no-sandbox Flag:**
- Risk: Both `regulatory-scanner.ts` and `pdf-generator.ts` launch Chromium with `--no-sandbox`. This disables the browser's security sandbox, which could be exploited if scanning malicious URLs.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (line 212), `packages/engine/src/reporting/pdf-generator.ts` (line 10)
- Current mitigation: None.
- Recommendations: Only use `--no-sandbox` when running as root in Docker (where it is required). Make it configurable or detect the runtime environment. Document the security implications for users running the scanner against untrusted URLs.

**No Input Sanitization for HTML Template Output:**
- Risk: The `html-template.ts` report generator interpolates scan result data directly into HTML strings without escaping. If a scanned page contains malicious content in its title, element HTML, or violation descriptions, this could result in XSS in the generated HTML report.
- Files: `packages/engine/src/reporting/html-template.ts` (lines 198-283)
- Current mitigation: Reports are generated as local files, not served dynamically. However, if reports are uploaded to a web dashboard or shared, the XSS vector exists.
- Recommendations: HTML-escape all interpolated values using a utility function. The `report.ruleId`, `report.wcagCriteria`, `report.holmdigitalInsight.swedishInterpretation`, and `report.remediation.description` fields should all be escaped before insertion into the template.

## Performance Bottlenecks

**All 12 Rule JSON Files Imported at Module Load:**
- Problem: `packages/standards/src/index.ts` statically imports all 12 language-specific rule JSON files (each ~110KB) at the top of the module. Every consumer of `@holmdigital/standards` loads ~1.3MB of JSON data into memory at import time, regardless of which language they need.
- Files: `packages/standards/src/index.ts` (lines 6-16)
- Cause: Static imports of large JSON files. The `getData()` function at line 92 switches on language, but all files are already loaded.
- Improvement path: Use dynamic `import()` in `getData()` to lazily load only the requested language file. This reduces initial memory footprint by ~90% for single-language use cases. Alternatively, provide a `configure({ lang: 'sv' })` API that preloads only the needed language.

**PDF Generation Launches a Separate Browser Instance:**
- Problem: `pdf-generator.ts` launches a new Puppeteer browser just for PDF generation, even when a browser is already running in `RegulatoryScanner`. Each Puppeteer instance consumes ~100-200MB of memory.
- Files: `packages/engine/src/reporting/pdf-generator.ts` (line 8), `packages/engine/src/core/regulatory-scanner.ts` (line 209)
- Cause: The PDF generator has no way to reuse the scanner's browser instance.
- Improvement path: Accept an optional `browser` parameter in `generatePDF()` to reuse an existing instance. The CLI could pass the scanner's browser before closing it.

**Linear Search for Rule Lookups:**
- Problem: Functions like `getConvergenceRule()`, `generateRegulatoryReport()`, and `searchRulesByTags()` all use `Array.find()` or `Array.filter()` on the full rules array (~60+ rules per language). During a scan, these are called for every violation.
- Files: `packages/standards/src/index.ts` (lines 199-260)
- Cause: No indexing or Map-based lookup.
- Improvement path: Build a `Map<ruleId, ConvergenceRule>` index on first access for O(1) lookups. For tag-based searches, build an inverted index.

## Fragile Areas

**AccessibilityStatement Icon Matching by Content String:**
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 307-318)
- Why fragile: Icons are selected by checking if the rendered content includes translated strings in 10 languages (e.g., `trimmed.includes('Hur tillgänglig')`, `trimmed.includes('How accessible')`, `trimmed.includes('Hvor tilgjengelig')`, etc.). Any change to template wording in any language could break icon rendering. The section `id` check exists but is checked alongside string matching.
- Safe modification: Always match on `section.id` first. Only fall back to string matching if `id` is missing. Currently both checks exist in the same `if` chain with `||`.
- Test coverage: No tests exist for this component's rendering logic.

**Template Path Resolution in statement-generator.ts:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 33-69)
- Why fragile: Template JSON files are located via three hardcoded path guesses using `__dirname`, `../src/reporting/templates`, and `process.cwd()`. This means the code behaves differently depending on whether it runs from source, from `dist/`, from the monorepo root, or from a consumer's `node_modules`. The CHANGELOG notes this was already a source of `ENOENT` errors in CI/CD.
- Safe modification: Use `require.resolve()` or bundle templates as JS modules instead of reading them from disk.
- Test coverage: No tests for template loading paths.

**Global Mutable State in i18n Module:**
- Files: `packages/engine/src/i18n/index.ts` (line 33)
- Why fragile: `let currentLang = 'en'` is module-level mutable state. `setLanguage()` mutates it globally. If two concurrent scan operations use different languages, they will interfere with each other. This is not a problem in CLI mode (single scan) but would break in any server/library usage.
- Safe modification: Pass language as a parameter to `t()` instead of relying on global state, or use a context/scope pattern.
- Test coverage: Basic tests exist in `packages/engine/src/i18n/index.test.ts`, but no concurrency tests.

## Scaling Limits

**Puppeteer Memory per Scan:**
- Current capacity: Each scan launches one Chromium instance (~150-300MB). PDF generation launches a second instance.
- Limit: On a 1GB container, running more than 2-3 concurrent scans would cause OOM. Even a single scan + PDF generation can consume 500MB+.
- Scaling path: Implement browser pooling, reuse browser instances across scans, and support remote browser connections via `puppeteer.connect()` to a shared Chrome instance.

**Rule Database Size Growing per Language:**
- Current capacity: 12 language files, each ~110KB JSON. Total ~1.3MB loaded into memory.
- Limit: Adding more languages or expanding rule sets will linearly increase memory. At 30 languages, this would be ~3.3MB of JSON always in memory.
- Scaling path: Lazy-load language files. Only load the language(s) requested.

## Dependencies at Risk

**Puppeteer Version Pinning:**
- Risk: `puppeteer` is pinned to `23.10.4` in `packages/engine/package.json`. Puppeteer bundles its own Chromium and has breaking changes frequently. The pinned version may have known security vulnerabilities in the bundled Chromium.
- Impact: Security advisories in bundled Chromium affect scan security. Upgrading may break API compatibility.
- Migration plan: Evaluate `puppeteer-core` with a system-installed Chrome for production deployments. Keep Puppeteer for development. Add a CI step to check for Chromium security updates.

**html-validate Pinned to 10.4.0:**
- Risk: `html-validate` is pinned to exact version `10.4.0`. This package is actively developed and may have bugfixes or rule updates.
- Impact: New HTML validation rules or bugfixes are not picked up automatically.
- Migration plan: Switch to `^10.4.0` or use a range. Test on upgrade.

## Missing Critical Features

**No Test Runner for Components:**
- Problem: Out of 27 exported components in `@holmdigital/components`, only `LiveRegion` has a unit test (`LiveRegion.test.tsx`). The package-level test (`index.test.ts`) only checks that exports exist, not that components render correctly or meet accessibility requirements.
- Blocks: Cannot verify that accessibility-focused components are actually accessible. Any refactoring of components has zero safety net.

**No E2E or Integration Tests for the Scanner:**
- Problem: The scanner (`RegulatoryScanner`) has no integration tests. The CLI has no tests. There are unit tests for `cloud-client`, `badge-generator`, `junit-generator`, and `i18n`, but the core scanning pipeline (Puppeteer + axe-core + enrichment) is untested.
- Blocks: Cannot verify scan accuracy. Puppeteer API changes or axe-core updates could silently break scanning.

**No Validation of Rule JSON Data Against Schema:**
- Problem: A schema exists at `packages/standards/schema/convergence-schema.json` and validation scripts exist (`scripts/validate-schema.js`, `scripts/validate-data.js`), but these are not run as part of `npm test` or CI. Rule JSON files could diverge from the schema without detection.
- Blocks: Data quality assurance for the regulatory database.

## Test Coverage Gaps

**Components Package (Critical Gap):**
- What's not tested: 26 of 27 components have zero tests. No render tests, no accessibility tests, no interaction tests.
- Files: All files in `packages/components/src/` except `LiveRegion/LiveRegion.test.tsx`
- Risk: An accessibility component library with no accessibility tests. Any change could introduce WCAG violations in the very components designed to prevent them.
- Priority: High

**Scanner Core Pipeline:**
- What's not tested: `RegulatoryScanner.scan()`, `enrichResults()`, `VirtualDOMBuilder.build()`, `HtmlValidator.validate()` (integration), `generatePDF()`, `generateReportHTML()`, `generateStatement()` / `generateStatementContent()`
- Files: `packages/engine/src/core/regulatory-scanner.ts`, `packages/engine/src/core/virtual-dom.ts`, `packages/engine/src/core/html-validator.ts`, `packages/engine/src/reporting/pdf-generator.ts`, `packages/engine/src/reporting/html-template.ts`, `packages/engine/src/reporting/statement-generator.ts`
- Risk: The entire value proposition of the product (accurate regulatory scanning) has no automated verification.
- Priority: High

**CLI Command Handling:**
- What's not tested: Argument parsing, option merging (CLI > file > defaults), viewport parsing, error handling for invalid URLs, cosmiconfig integration
- Files: `packages/engine/src/cli/index.ts`
- Risk: CLI is the primary user interface. Regression in option handling would break user workflows silently.
- Priority: Medium

**Standards Data Integrity:**
- What's not tested: Whether all 12 rule JSON files conform to the schema, whether all rule IDs are unique, whether all referenced WCAG criteria exist, whether tag arrays are consistent across languages
- Files: `packages/standards/data/rules.*.json`, `packages/standards/schema/convergence-schema.json`
- Risk: Inconsistent or invalid rule data leads to incorrect regulatory reports. Given there are 3000+ lines per language file across 12 languages, manual review is impractical.
- Priority: Medium

---

*Concerns audit: 2026-02-26*
