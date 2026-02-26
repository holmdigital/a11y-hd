# Codebase Concerns

**Analysis Date:** 2026-02-26

## Tech Debt

**Pervasive `as any` Type Casts Undermining TypeScript Safety:**
- Issue: The codebase has 40+ instances of `as any` casts and untyped parameters, many in core paths rather than edge-case escape hatches. The `RegulatoryReport` interface in `@holmdigital/standards` does not include `failingNodes` or `legalContext`, yet both are added at runtime and then accessed throughout reporting modules via `(report as any).failingNodes` and `(report as any).legalContext`.
- Files:
  - `packages/standards/src/types.ts` (lines 116-126) -- `RegulatoryReport` missing `failingNodes` and `legalContext`
  - `packages/engine/src/core/regulatory-scanner.ts` (line 233, 267, 272, 365-374) -- `enrichResults` accepts `any`, casts output `as any`
  - `packages/engine/src/cli/index.ts` (lines 102, 216, 263-267, 289, 301) -- repeated `any` casts for report iteration
  - `packages/engine/src/reporting/html-template.ts` (lines 262-263, 269) -- `(report as any).legalContext`
  - `packages/engine/src/reporting/junit-generator.ts` (lines 49-51, 69) -- `(report as any).failingNodes`
  - `packages/engine/src/reporting/github-actions.ts` (line 22) -- `(node: any)`
  - `packages/engine/src/reporting/statement-generator.ts` (lines 32, 97, 294)
  - `packages/engine/src/i18n/index.ts` (lines 16, 47, 55)
  - `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 109, 299, 388)
  - `packages/standards/src/types.ts` (line 57) -- `[key: string]: any` on `HolmDigitalInsight`
- Impact: Bugs slip past the compiler. Any structural change to `RegulatoryReport` will silently break all downstream modules that rely on the untyped `failingNodes`/`legalContext` properties.
- Fix approach:
  1. Extend `RegulatoryReport` (or create `EnrichedReport extends RegulatoryReport`) in `packages/standards/src/types.ts` to include `failingNodes?: FailingNode[]` and `legalContext?: LegalContext`.
  2. Define a `FailingNode` interface with `{ html: string; target: string; failureSummary: string }`.
  3. Replace every `(report as any)` with the properly typed interface throughout all reporting modules.
  4. Remove the index signature `[key: string]: any` from `HolmDigitalInsight` and add explicit optional keys for each language interpretation (e.g., `norwegianInterpretation?: string`).

**Hardcoded/Stale Version Strings in Multiple Locations:**
- Issue: Version numbers are hardcoded in at least three separate places, all out of sync with each other and with the actual `package.json` version (`2.1.2`).
- Files:
  - `packages/engine/src/cli/cloud-client.ts` (line 9) -- `ENGINE_VERSION = '1.4.4'` (should be `2.1.2`)
  - `packages/engine/src/cli/index.ts` (line 36) -- `.version('0.1.0')` (should be `2.1.2`)
  - `packages/engine/src/core/regulatory-scanner.ts` (line 28) -- fallback `'2.1.1'` (close but still stale)
- Impact: Cloud API receives wrong engine version. CLI `--version` flag reports `0.1.0` instead of `2.1.2`. Debugging and auditing are misleading.
- Fix approach: Read version from `package.json` at build time (tsup banner/define) or use `getEngineVersion()` from `regulatory-scanner.ts` everywhere. Remove all hardcoded version strings. Consider a shared `version.ts` module across the engine package.

**Duplicated Template Rendering Logic:**
- Issue: The template rendering engine (conditional blocks, choice blocks, variable substitution) is implemented independently in two separate files with slightly different behavior.
- Files:
  - `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 259-297) -- `renderTemplate()` in the React component
  - `packages/engine/src/reporting/statement-generator.ts` (lines 259-290) -- `processText()` in the generator
- Impact: Fixes or enhancements to template processing must be applied in two places. The React component applies substitution before choices; the generator applies them after. This can produce different outputs for the same input.
- Fix approach: Extract the template processing logic into a shared utility in `@holmdigital/standards` or a shared module in `@holmdigital/components`, then consume it from both places.

**Inline Hardcoded Template Strings in Component:**
- Issue: The `AccessibilityStatement` component contains hardcoded template strings for `sv`, `en`, and `no` languages directly in the source code (lines 110-149), despite external JSON templates existing at `packages/engine/src/reporting/templates/*.json` for 9 languages. The component only supports `sv` and `en` via the internal `TEMPLATES` constant (line 205: `const lang = (locale === 'sv' ? 'sv' : 'en')`), silently falling back to English for all other locales including `no` which has a template defined.
- Files:
  - `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 109-149, 205)
  - `packages/engine/src/reporting/templates/` (9 JSON files: da, de, en, es, fi, fr, nl, no, sv)
- Impact: Norwegian template in the component source is dead code. Users passing `locale="de"` or `locale="fi"` always get English. The JSON templates and inline templates can diverge.
- Fix approach: Remove inline `TEMPLATES` from the component. Accept template data as a prop or load JSON templates dynamically. Expand the `lang` type guard to all supported locales.

**Monorepo Build Script Fragility (Components package.json):**
- Issue: The `build` and `dev` scripts in `packages/components/package.json` enumerate every single component entry point as a long inline list in the tsup command. Adding a new component requires editing this 400+ character command string.
- Files:
  - `packages/components/package.json` (lines for `build` and `dev` scripts)
- Impact: Easy to forget adding a new component to the build. Error-prone and hard to read. The `exports` map in `package.json` also needs manual update for each new component.
- Fix approach: Use a glob pattern with tsup (e.g., `tsup src/*/index.ts`) or create a build script that reads the `src/` directory. Alternatively, generate the `exports` map from the filesystem.

## Known Bugs

**Cloud Client Sends Wrong Engine Version:**
- Symptoms: HolmDigital Cloud receives `engine_version: "1.4.4"` instead of the actual version `2.1.2`.
- Files: `packages/engine/src/cli/cloud-client.ts` (line 9)
- Trigger: Any scan with `--api-key` flag that uploads to cloud.
- Workaround: None. The wrong version is always sent.

**CLI `--version` Reports 0.1.0:**
- Symptoms: Running `hd-a11y-scan --version` outputs `0.1.0` instead of `2.1.2`.
- Files: `packages/engine/src/cli/index.ts` (line 36)
- Trigger: Any user running `--version` or `-V`.
- Workaround: None.

**AccessibilityStatement Ignores Norwegian Locale:**
- Symptoms: Passing `locale="no"` renders the English template, despite the component having a Norwegian template defined at line 136.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (line 205)
- Trigger: `<AccessibilityStatement locale="no" ... />`
- Workaround: None. The lang guard is `(locale === 'sv' ? 'sv' : 'en')`, meaning only `sv` gets Swedish; everything else falls through to English.

## Security Considerations

**`--no-sandbox` Puppeteer Flag:**
- Risk: Both the scanner and PDF generator launch Chromium with `--no-sandbox` and `--disable-setuid-sandbox`. While commonly used in CI/Docker, this disables Chrome's process sandbox, which could allow malicious page content to escape the browser process.
- Files:
  - `packages/engine/src/core/regulatory-scanner.ts` (lines 211-213)
  - `packages/engine/src/reporting/pdf-generator.ts` (lines 9-10)
- Current mitigation: None. The flags are always applied regardless of environment.
- Recommendations: Only apply `--no-sandbox` when running inside a container (detect via environment variable). Document the security implications. Consider running the browser in a separate network namespace.

**API Key Passed as CLI Argument:**
- Risk: API keys passed via `--api-key` appear in process listings, shell history, and CI/CD logs.
- Files: `packages/engine/src/cli/index.ts` (line 56)
- Current mitigation: The key can alternatively be placed in an `.a11yrc` config file (via cosmiconfig).
- Recommendations: Support `HD_API_KEY` environment variable as the primary method. Warn users if the key appears in CLI arguments. Redact it from any debug output.

**User-Agent Spoofing:**
- Risk: The scanner sets a fake Chrome User-Agent to avoid bot detection (line 224). While useful for accurate scans, this could be seen as deceptive by site operators.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (line 224)
- Current mitigation: None.
- Recommendations: Add an option to use an honest User-Agent that identifies as HolmDigital Engine. Document the default behavior.

**`--invalid-https-cert` Suppresses Certificate Validation:**
- Risk: When enabled, Chrome ignores all certificate errors (`--ignore-certificate-errors`, `--allow-insecure-localhost`). A user scanning a staging site might not realize this also affects any sub-resources loaded from external origins.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (line 215)
- Current mitigation: The flag is opt-in.
- Recommendations: Add a warning when the flag is active. Consider restricting it to `localhost` only.

**Hardcoded Default Contact Details in Statements:**
- Risk: The statement generator falls back to hardcoded placeholder contact details (`hej@holmdigital.se`, `070-123 45 67`) if none are provided. Users may unknowingly publish compliance documents with HolmDigital's placeholder email and a fake phone number.
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 153-155)
- Current mitigation: CLI accepts `--email` and `--phone` flags.
- Recommendations: Make contact email a required field when generating statements. At minimum, emit a warning if defaults are used.

## Performance Bottlenecks

**PDF Generation Spawns a Second Browser Instance:**
- Problem: `generatePDF()` launches a new Puppeteer browser instance even though the scanner already has one running. For a scan that also generates a PDF, two full Chrome processes run sequentially.
- Files: `packages/engine/src/reporting/pdf-generator.ts` (lines 8-10)
- Cause: The PDF generator is a standalone module with no access to the scanner's browser instance.
- Improvement path: Refactor to accept a `Page` or `Browser` parameter, allowing reuse of the scanner's existing browser. Alternatively, use a lightweight HTML-to-PDF library for simple report pages.

**Virtual DOM Built But Never Used:**
- Problem: `VirtualDOMBuilder.build()` is called during every scan (line 168-169 in `regulatory-scanner.ts`), serializing the entire DOM tree including computed styles. The result is never stored or referenced after the call.
- Files:
  - `packages/engine/src/core/regulatory-scanner.ts` (lines 168-169) -- builds vDOM
  - `packages/engine/src/core/virtual-dom.ts` -- entire module
- Cause: Built for "future advanced rules" as stated in a comment (line 167), but no rules consume it.
- Improvement path: Remove the `vDomBuilder.build()` call until it is actually needed. This saves one full DOM traversal per scan.

**JUnit Generates Individual Test Cases for Each Pass:**
- Problem: The JUnit generator creates one `<testcase>` XML element per passed rule (line 33-34). With hundreds of axe passes, this creates very large XML files that CI systems must parse.
- Files: `packages/engine/src/reporting/junit-generator.ts` (lines 32-35)
- Cause: Design choice to show passes individually rather than as a count.
- Improvement path: Group passes into a single `<testcase>` or omit them entirely. CI systems care about failures, not individual pass entries.

## Fragile Areas

**Statement Generator Template Loading:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 33-68)
- Why fragile: Template loading tries 6 different file paths across 3 directory structures (`__dirname`, `../src/`, `process.cwd()`), relying on runtime path resolution that changes between development, built (`dist/`), and monorepo-root execution contexts. All failures are silently caught and retried.
- Safe modification: Add tests that verify template loading in both dev and dist modes. Use a `require.resolve` or bundler-time import instead of filesystem probing.
- Test coverage: No tests exist for the statement generator module.

**Logo Loading Path Resolution:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 108-136)
- Why fragile: Logo loading probes 2 filesystem paths relative to `process.cwd()`. If the working directory changes (e.g., running from a CI pipeline or Docker container), the logo silently fails to load. The error handling catches all exceptions including actual bugs.
- Safe modification: Bundle the logo at build time or accept a logo path as a CLI argument.
- Test coverage: No tests.

**CLI Module Monolith:**
- Files: `packages/engine/src/cli/index.ts` (405 lines)
- Why fragile: The entire CLI is a single action handler with viewport parsing, dashboard rendering, PDF generation, statement generation, cloud upload, JUnit export, and GitHub Actions annotations all inline. Any change to one output format risks breaking others.
- Safe modification: Extract each output format into its own handler function. The current inline structure makes it hard to test individual behaviors.
- Test coverage: No tests for the CLI action handler itself.

**i18n Global Mutable State:**
- Files: `packages/engine/src/i18n/index.ts` (line 33) -- `let currentLang = 'en'`
- Why fragile: Language is stored as a module-level mutable global. In any concurrent or library usage (e.g., running two scans with different languages), language state would leak between callers.
- Safe modification: Pass language as a parameter through the call chain rather than relying on global state. Alternatively, use a context/scope pattern.
- Test coverage: `packages/engine/src/i18n/index.test.ts` exists but does not test concurrent usage.

## Scaling Limits

**Single-Page Scanning Only:**
- Current capacity: The scanner processes exactly one URL per invocation.
- Limit: Scanning an entire website requires external orchestration (shell loops, CI matrix).
- Scaling path: Add a multi-URL or sitemap crawling mode to `RegulatoryScanner`. The Puppeteer browser instance is already created once and could be reused for multiple pages.

**In-Memory Report Accumulation:**
- Current capacity: All axe violations and enriched reports are held in memory.
- Limit: Extremely large pages with thousands of violations could cause memory pressure.
- Scaling path: Stream results to disk or a callback as they are processed rather than accumulating in an array.

## Dependencies at Risk

**Puppeteer 23.10.4 (Heavy/Bundled Browser):**
- Risk: Puppeteer bundles a full Chromium download (~280MB), making install times long and Docker images large. Version 23.x requires Node 18+.
- Impact: Slows CI/CD. Makes the package very heavy as an npm dependency.
- Migration plan: Consider `puppeteer-core` with a user-supplied browser, or investigate lighter alternatives for axe injection (e.g., Playwright, or direct axe-core Node API for server-rendered pages).

**React 18 Peer Dependency (Components):**
- Risk: Components require React 18+. As React 19 adoption grows, peer dependency ranges should be tested. The engine also has a direct React 18 dependency (not a peer) for server-side rendering of statements.
- Impact: Users on React 19 may encounter peer dependency warnings or runtime issues.
- Migration plan: Test with React 19. Widen peer dependency range. Consider removing React from the engine's direct dependencies by using a framework-agnostic template approach for statement generation.

**axe-core 4.10.2 Pinned:**
- Risk: The axe-core version is pinned exactly (`4.10.2`). New axe-core releases include updated WCAG rules and bug fixes. Being pinned means missing improvements.
- Impact: The scanner may not catch violations that newer axe-core versions detect.
- Migration plan: Use a caret range (`^4.10.2`) and add integration tests that verify scan results remain consistent across minor axe-core updates.

## Missing Critical Features

**No Component-Level Tests:**
- Problem: Out of 24 React components, only `LiveRegion` has a dedicated test file (`packages/components/src/LiveRegion/LiveRegion.test.tsx`). The only other component test is `packages/components/src/index.test.ts` which merely checks that exports exist.
- Blocks: Cannot verify that accessible components actually produce correct ARIA attributes, keyboard interactions, or screen reader announcements. For an accessibility component library, this is a critical gap.

**No Integration Tests for the Scanner:**
- Problem: A vitest integration config is referenced in `package.json` (`test:integration`) but no integration test files exist in the codebase. The core scanning flow (launch browser, inject axe, enrich results) has zero test coverage.
- Blocks: Cannot catch regressions in the scanning pipeline without manually running against a live site.

**No `--output` / File Output for JSON Mode:**
- Problem: The `--json` flag only outputs to stdout. For CI pipelines that need both human-readable output and a JSON artifact, there is no way to write JSON to a file without shell redirection.
- Blocks: Clean CI integration where both console and file outputs are needed.

## Test Coverage Gaps

**Engine Core (0% coverage):**
- What's not tested: `RegulatoryScanner.scan()`, `RegulatoryScanner.enrichResults()`, `VirtualDOMBuilder.build()`, `HtmlValidator.validate()`, score calculation, compliance status determination.
- Files:
  - `packages/engine/src/core/regulatory-scanner.ts` (399 lines, 0 tests)
  - `packages/engine/src/core/virtual-dom.ts` (157 lines, 0 tests)
  - `packages/engine/src/core/html-validator.ts` (50 lines, 0 tests)
- Risk: The most critical path in the entire application (scan + enrich + score) has no automated verification. Score calculation bugs, enrichment mapping errors, and browser lifecycle issues would go undetected.
- Priority: High

**Statement Generator (0% coverage):**
- What's not tested: Template loading, variable substitution, conditional blocks, choice blocks, country detection, markdown generation, HTML generation, file writing.
- Files: `packages/engine/src/reporting/statement-generator.ts` (321 lines, 0 tests)
- Risk: Accessibility statements have legal implications. A bug in template processing could produce legally non-compliant documents.
- Priority: High

**CLI Action Handler (0% coverage):**
- What's not tested: Option merging, viewport parsing, dashboard output, error formatting, cloud integration flow, JUnit generation triggering.
- Files: `packages/engine/src/cli/index.ts` (405 lines, 0 tests)
- Risk: User-facing bugs in CLI output, option handling, or exit codes.
- Priority: Medium

**Components (1 of 24 tested):**
- What's not tested: Button, FormField, Dialog, Modal, SkipLink, NavigationMenu, Checkbox, RadioGroup, Breadcrumbs, Accordion, Tabs, Select, Switch, Toast, Tooltip, Heading, AccessibilityStatement, ErrorSummary, Combobox, DatePicker, MultiSelect, DataTable, Pagination, Card, TreeView, ProgressBar, Skeleton, HelpText.
- Files: All files in `packages/components/src/*/` except `LiveRegion/`
- Risk: For a library whose entire purpose is delivering accessible components, having no tests to verify ARIA attributes, keyboard navigation, or focus management is a fundamental gap.
- Priority: High

**Pseudo-Automation Engine (0% coverage):**
- What's not tested: Playwright test script generation, manual checklist generation.
- Files: `packages/engine/src/automation/pseudo-automation.ts` (77 lines, 0 tests)
- Risk: Low -- output is informational only.
- Priority: Low

**Overall Ratio:** 7 test files covering ~49 source files. Estimated line coverage: <15%.

---

*Concerns audit: 2026-02-26*
