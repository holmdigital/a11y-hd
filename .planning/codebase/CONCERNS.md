# Codebase Concerns

**Analysis Date:** 2026-05-10

---

## Documented Gotchas (from CLAUDE.md)

These are first-class footguns that any contributor or downstream consumer must understand before changing code in the affected areas. They are reproduced here so codebase-aware tooling and planning agents pick them up automatically.

**ADA Title II vs. Title III scope filtering (US):**
- Issue: `getNationalLawByFramework('ADA', 'US')` returns the FIRST match — which is Title II (public scope). Private-sector / Title III lookups silently get the wrong law.
- Files: `packages/standards/src/index.ts` (`getNationalLawByFramework`), `packages/engine/src/reporting/statement-generator.ts` (handles correctly via dedicated US branch)
- Impact: Any downstream consumer that doesn't scope-filter will reference Title II in private-sector statements. Legally incorrect.
- Fix approach: Use `getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private')` for Title III. Long-term: ship a `getNationalLawByFrameworkAndScope(framework, country, scope)` helper in the standards API.

**HHS Section 504 (REHAB) discriminated-union compliance deadline (US, 2.5.1):**
- Issue: US has a fourth national law `us-hhs-section-504` with `euFramework: 'REHAB'` (a non-EU value) and `scope: 'private'`. Its `complianceDeadlines.largeEntity` carries `employeeThreshold: 15` instead of the usual `populationThreshold`.
- Files: `packages/standards/data/legal/national-laws.json`, `packages/standards/dist/index.d.ts` (published `ComplianceDeadlineEntry` discriminated union), `packages/engine/src/reporting/statement-generator.ts` (US private-sector branch references both ADA Title III AND Section 504)
- Impact: Consumers MUST narrow on the discriminant before reading the threshold field. Type-blind code reading `populationThreshold` will get `undefined` and silently skip the deadline.
- Fix approach: Always switch on the discriminant (`'employeeThreshold' in entry`) before accessing threshold properties. The published type already enforces this at the type level — runtime consumers in JS need explicit guards.

**EAA microbusiness exemption — both conditions are cumulative (2.5.1):**
- Issue: All 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL) expose `exemptions.microbusiness` per EAA Article 4(5): services-providing organisations with <10 employees AND ≤2M EUR turnover are exempt. The conditions are CUMULATIVE — both must be true.
- Files: `packages/standards/data/legal/national-laws.json` (7 EAA entries)
- Impact: Single-condition checks (e.g. `if (employees < 10) exempt`) over-apply the exemption to organisations that exceed the turnover threshold.
- Fix approach: Always evaluate both `employeeThreshold` AND `turnoverThreshold` together. Microenterprises providing PRODUCTS (not services) are NEVER exempt regardless of size.

**`inForce` drift guard test (2.5.1):**
- Issue: A vitest test asserts `inForce === (effectiveDate <= today)` for all 16 supported countries. Adding a national law with a future `effectiveDate` and `inForce: true` will fail CI.
- Files: `packages/standards/src/__tests__/in-force-drift.test.ts` (or equivalent), `packages/standards/data/legal/national-laws.json`
- Impact: Future-dated laws must be added with `inForce: false`. The test will flip-validate on the effective date — the constant will need to be updated then.
- Fix approach: When adding a new law, set `inForce: false` if `effectiveDate` is in the future. The drift test is the safety net.

**TS2590 union-type complexity in `Heading.tsx`:**
- Issue: Dynamic JSX tags built with `keyof JSX.IntrinsicElements` produce TS2590 "Type instantiation is excessively deep and possibly infinite".
- Files: `packages/components/src/Heading/Heading.tsx`
- Workaround in place: Narrow union literal + `React.createElement`:
  ```tsx
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return React.createElement(Tag, { ref, className, ...props }, children);
  ```
- Do NOT regress this to `<Tag>...</Tag>` JSX — the type checker will fail.

**npm publish bin-name warning (benign):**
- Symptom: `npm warn publish "bin[hd-a11y-scan]" script name was invalid` during `npm publish -w @holmdigital/engine`.
- Files: `packages/engine/package.json` (line 17–19, `"bin": {"hd-a11y-scan": "./dist/cli/index.js"}`)
- Status: The warning is cosmetic. The bin entry installs and resolves correctly. Do not rename — published consumers depend on `hd-a11y-scan`.

**Storybook esbuild moderate vulnerabilities (dev-only):**
- Risk: Storybook 10.2.13 transitively depends on a vulnerable esbuild version flagged at moderate severity.
- Files: `packages/components/package.json` (line 154, `"storybook": "^10.2.13"`)
- Current mitigation: Dev-only — does not affect any published artifact (`dist/`). Storybook is excluded from build output.
- Plan: Wait for Storybook 10.x patch. No production action required.

---

## Version Drift

**`CLAUDE.md` version table lags actual `package.json` values:**
- `CLAUDE.md` "Current Package Versions" lists `@holmdigital/engine 2.5.0 → 2.5.1` but `packages/engine/package.json` is already at `2.5.2`.
- `@holmdigital/standards` is at `2.5.1` in both — aligned.
- `@holmdigital/components` is at `2.3.0` in both — aligned.
- Files: `CLAUDE.md`, `packages/engine/package.json`
- Impact: Anyone reading CLAUDE.md to understand the current published surface will under-report the engine version. Plans referencing "the next engine release" may collide with an already-shipped patch.
- Fix approach: Bump `CLAUDE.md` version line to `2.5.1 → 2.5.2` and document what 2.5.2 changed; or replace the static table with a generated section.

**Engine 2.5.2 release notes not captured in CLAUDE.md:**
- The bump from 2.5.1 to 2.5.2 is not described anywhere in the project memory or CLAUDE.md gotchas. Whatever shipped in 2.5.2 is not retrievable without `git log`.
- Fix approach: Add a one-line summary to the version table or a CHANGELOG entry.

---

## Untracked / Loose Files in Repo Root

**Cruft files present and untracked (visible in `git status`):**
- `output.json`, `output.txt`, `output_utf8.json` — local CLI scan output dumps
- `releases.json`, `releases.txt`, `releases_utf8.json`, `releases_utf8.txt` — release-notes scratch files
- `changelog.md`, `changelog_utf8.md`, `changelog_v4110.md`, `changelog_v4110_utf8.md` — manual changelog drafts (project uses changesets, not manual changelogs)
- `REVIEW-components-2026-05-09.md`, `REVIEW-hhs-section-504-2026-05-09.md`, `brief-hhs-section-504-2026-05-05.md` — one-off review/brief documents in repo root

**Issue:** None of these match `.gitignore` patterns. A careless `git add .` will commit them. The `_utf8` duplicates suggest someone is round-tripping files through an encoding-fix step rather than writing UTF-8 directly (see Swedish-characters memory).

**Fix approach:**
- Add to `.gitignore`:
  ```
  output*.json
  output*.txt
  releases*.json
  releases*.txt
  changelog_*.md
  changelog_v*.md
  *_utf8.*
  REVIEW-*.md
  brief-*.md
  ```
- Or move review/brief documents into `docs/reviews/` and commit intentionally.
- Stop generating `_utf8` duplicates — write UTF-8 directly per the project's Swedish-characters convention.

---

## Tech Debt

**VirtualDOM built but result never used:**
- Issue: `VirtualDOMBuilder.build()` is called in `regulatory-scanner.ts` (lines 172–173) but its return value is discarded. The Virtual DOM tree is traversed via Puppeteer browser evaluation on every non-light scan, yet no downstream analysis consumes it.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 172–173), `packages/engine/src/core/virtual-dom.ts`
- Impact: Wasted scan time (~20–100ms per page depending on DOM size).
- Fix approach: Either wire VirtualDOM output into a rule that uses it, or remove the `build()` call from the hot path.

**axe-core `runOnly` is commented out:**
- Issue: The `runOnly` filter in `regulatory-scanner.ts` (lines 189–195) is commented out. axe-core now runs every rule including experimental, best-practice, and non-WCAG rules.
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 186–196)
- Impact: Scan output is noisier than intended.
- Fix approach: Restore `runOnly` with `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']` or make it configurable.

**PseudoAutomationEngine generates incomplete Playwright tests:**
- Issue: `pseudo-automation.ts` line 37 has `// TODO: Add specific selectors based on report details`. Generated tests use a generic template with no real selectors.
- Files: `packages/engine/src/automation/pseudo-automation.ts` (line 37)
- Impact: `--generate-tests` output is not directly usable.
- Fix approach: Use `report.failingNodes[].target` to inject real CSS selectors.

**Duplicated template rendering logic across three implementations:**
- Issue: Template placeholder substitution exists independently in three places.
- Files:
  - `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (render-time `replacements` map ~408–520)
  - `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (inline `TEMPLATES` record ~123–399)
  - `packages/engine/src/reporting/statement-generator.ts` (`substitutions` map 243–354)
- Impact: Locale variable changes must be applied in three locations.
- Fix approach: Extract shared template processor into `@holmdigital/standards` or a shared module.

**Hardcoded placeholder contact details in statement generator:**
- Issue: `statement-generator.ts` lines 205–206 fall back to `'hej@holmdigital.se'` and `'070-123 45 67'` when no contact info is provided. These are HolmDigital's own details.
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 205–206)
- Impact: Generated statements for other organisations contain HolmDigital contact info — legally incorrect.
- Fix approach: Use empty string with `[YOUR EMAIL]`/`[YOUR PHONE]` placeholders, or require fields when `--statement` is used.

**Hardcoded `'2024-01-01'` as publish date fallback:**
- Issue: Both `AccessibilityStatement.tsx` and `statement-generator.ts` (lines 282–289) fall back to `'2024-01-01'`. As of 2026-05-10 this is over two years stale.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx`, `packages/engine/src/reporting/statement-generator.ts`
- Fix approach: Use `new Date().toISOString().split('T')[0]` or require `--publish-date`.

**CLI scored category progress bars use hard-coded WCAG criteria strings:**
- Files: `packages/engine/src/cli/index.ts` (lines 260–296)
- Impact: Category scores are misleading for sites with only ARIA or time-based violations.
- Fix approach: Derive categories from `ConvergenceRule.tags` or expand to the four WCAG principles.

**`@types/cosmiconfig` stale version:**
- Issue: `packages/engine/package.json` includes `"@types/cosmiconfig": "^5.0.3"` but runtime is `^9.0.0`. cosmiconfig v9 ships its own types.
- Fix approach: Remove `@types/cosmiconfig` entirely.

**`@ts-ignore` in hot scan path:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (line 185)
- Fix approach: Use `(window as unknown as { axe: AxeCore }).axe.run(...)` with a local interface.

**Monorepo build script enumerates every component individually:**
- Files: `packages/components/package.json` (`scripts.build`, `scripts.dev`)
- Impact: Adding a component requires editing a 400+ char command and the `exports` map.
- Fix approach: Use a glob pattern with tsup.

**`verify-statements.ts` uses `any` casts:**
- Files: `packages/engine/scripts/verify-statements.ts` (lines 11, 14)
- Fix approach: Replace with `Partial<ScanResult>` and a typed fixture helper.

---

## Known Bugs

**AccessibilityStatement component renders empty `{<national_law>}` for US:**
- Symptoms: `country="US"` triggers `getNationalLawByFramework(sector === 'private' ? 'EAA' : 'WAD', country)` which returns `null` for US, then falls back to DDA (also `null`).
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 430–434)
- Workaround: The engine's `statement-generator.ts` correctly handles US via a dedicated branch — only the React component is broken for US.
- Note: This intersects with the ADA Title II/III gotcha above. Fixing one without the other still leaves the component half-broken.

**Norway (`no`) locale required reactive placeholder fixes:**
- Symptoms: Comment at line 468 says "NO placeholder bug fixes (4 missing mappings)" — patched but indicates the locale shipped incomplete.
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (line 468)

---

## Security Considerations

**Puppeteer runs with `--no-sandbox` and `--disable-setuid-sandbox` unconditionally:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 220–223), `packages/engine/src/reporting/pdf-generator.ts` (lines 9–11)
- Recommendations: Conditionally apply sandbox flags via `PUPPETEER_NO_SANDBOX=true`. Warn when sandbox disabled.

**Bot-detection bypass flag is always on:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (line 223, `--disable-blink-features=AutomationControlled`)
- Recommendations: Document third-party scan authorisation requirements.

**`--invalid-https-cert` silently disables certificate verification:**
- Files: `packages/engine/src/cli/index.ts` (line 59), `packages/engine/src/core/regulatory-scanner.ts` (lines 224–226)
- Recommendations: Emit a stderr warning when active.

**API key transmitted with no client-side validation; `--cloud-url` can be overridden:**
- Files: `packages/engine/src/cli/cloud-client.ts` (lines 86–94), `packages/engine/src/cli/index.ts` (line 87)
- Recommendations: Warn if `--cloud-url` differs from default. Validate key format before sending.

**API key visible in process listing and shell history:**
- Files: `packages/engine/src/cli/index.ts` (line 57)
- Recommendations: Support `HD_API_KEY` env var as primary method. Redact in debug output.

**PDF generation passes HTML directly to `page.setContent()`:**
- Files: `packages/engine/src/reporting/pdf-generator.ts`, `packages/engine/src/reporting/html-template.ts`
- Recommendations: Audit `html-template.ts` for unescaped `result.url` and `result.metadata.pageTitle`.

**Google Fonts loaded via external CDN in HTML report:**
- Files: `packages/engine/src/reporting/html-template.ts` (line 51)
- Recommendations: Bundle the font or use system-font stack.

---

## Dependency Risks

**`html-validate` pinned to exact `10.4.0`:**
- Files: `packages/engine/package.json` (line 69)
- Migration: Change to `"^10.4.0"`.

**`puppeteer` pinned to exact `23.10.4`:**
- Files: `packages/engine/package.json` (line 71)
- Migration: Change to `"^23.10.4"`. Consider `puppeteer-core` to reduce install size.

**`@holmdigital/standards` depended on with `"*"`:**
- Files: `packages/engine/package.json` (line 64)
- Risk: npm consumers may resolve any future major version.
- Migration: Pin to `"^2.5.0"` (matching current minor).

**Storybook esbuild moderate vulnerability (dev-only):** see Documented Gotchas above.

**React 18 peer dep with growing React 19 adoption:**
- Files: `packages/components/package.json`, `packages/engine/package.json` (line 67)
- Migration: Test with React 19. Widen peer range. Engine arguably should not have React as a direct dep.

---

## Performance Bottlenecks

**VirtualDOM traversal on every full scan (no consumer):**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 171–174)
- See Tech Debt above.

**PDF generation spawns a second independent Chromium instance:**
- Files: `packages/engine/src/reporting/pdf-generator.ts` (lines 8–10)
- Improvement: Reuse the scanner's browser/page.

**axe-core runs all rules including non-WCAG:** see Tech Debt above.

---

## Fragile Areas

**`en-au` locale supported in engine but missing from standards rules database:**
- Files: `packages/engine/src/i18n/index.ts` (line 29), `packages/engine/src/reporting/statement-generator.ts` (line 44), `packages/standards/src/index.ts` (lines 131–151)
- Why fragile: `--lang en-au` falls back to English rules with a warning. AU-specific regulatory mapping (DDA, AHRC) absent from rule output.
- Note: AU is now an active jurisdiction following the EU-Australia FTA conclusion (March 2026, see project memory). This gap blocks AU rollout.

**Component sub-path exports missing for newer components:**
- Files: `packages/components/package.json`
- Why fragile: `Tabs`, `Accordion`, `ProgressBar`, `Skeleton`, `HelpText`, `Breadcrumbs` are built and exported from `src/index.ts` but have no `package.json` sub-path entry. `import '@holmdigital/components/Tabs'` fails.

**Statement generator template loading is runtime path-dependent:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 103–113)
- Why fragile: Templates loaded via `path.join(__dirname, 'templates', ...)`. `scripts/copy-assets.mjs` must keep `dist/templates/` in sync.

**Logo loading relies on `process.cwd()` probing:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 160–187)
- Why fragile: Silent failure if `cwd` differs from project root (CI, Docker).

**i18n global mutable state (`let currentLang = 'en'`):**
- Files: `packages/engine/src/i18n/index.ts` (line 33)
- Why fragile: Concurrent scans with different languages leak state.

**CLI action handler is a 449-line monolith with zero test coverage:**
- Files: `packages/engine/src/cli/index.ts`
- Why fragile: Viewport parsing, dashboard, PDF, statements, cloud upload, JUnit, GitHub annotations all inline.

---

## Legal / Compliance Edge Cases

**ADA Title II vs Title III scope gap in `AccessibilityStatement` component:** see Documented Gotchas + Known Bugs above.

**TLD-based country detection is unreliable:**
- Files: `packages/engine/src/reporting/statement-generator.ts` (lines 140–155)
- Issue: `.com`/`.io`/`.app`/`.dev` default to `'EU'`. `.uk` always maps to `'GB'`.
- Fix approach: Remove TLD inference or warn prominently when used.

**ADA Title II compliance deadlines not surfaced in scan output:**
- Files: `packages/standards/data/legal/national-laws.json` (lines 432–443), `packages/engine/src/core/regulatory-scanner.ts`
- Issue: Large-entity (50,000+) deadline was 2026-04-24 — already passed. Engine never reports this.
- Fix approach: Surface in US country branch analogous to `eaaDeadlineViolations`.

**HHS Section 504 deadlines (REHAB):** see Documented Gotchas — same pattern, threshold field uses `employeeThreshold`.

**Australia DTA policy section renders unconditionally for all AU users:**
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 285–287)
- Issue: DTA section claims Commonwealth-agency applicability but renders for state/private too.

**`en-us` template hardcodes Section 508 for all US sectors:**
- Files: `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` (lines 251–262)
- Issue: Section 508 only applies to federal agencies. State/local need ADA Title II, private need ADA Title III + (now) Section 504.

---

## Missing Features / Gaps

**Planned three-layer scoring model not implemented:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (interface `ScanResult`, line 65)
- Project memory describes `complianceScore + riskIndicator + testCoverage`; current `ScanResult.score` is a single number.

**WCAG 2.2 new success criteria absent from rules database:**
- Files: `packages/standards/data/rules.*.json` (all locales)
- Missing IDs: `2.4.11`, `2.4.12`, `2.4.13`, `3.2.6`, `3.3.7`, `3.3.8`, `3.3.9`. Any `wcag22aa` axe violation maps to a generic fallback.

**No `--output` flag for JSON mode:**
- Files: `packages/engine/src/cli/index.ts`
- Currently shell redirection only.

**Single-page scanning only:**
- Files: `packages/engine/src/core/regulatory-scanner.ts`
- No sitemap or multi-URL crawling. Browser instance could be reused.

**`getStandardsVersion()` uses CJS `require.resolve` — breaks in pure ESM:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (lines 33–42)
- Fix approach: Export a `VERSION` constant from `@holmdigital/standards`.

---

## Test Coverage Gaps

**Component library has tests for only 2 of 29 exported components:**
- Untested: `Button`, `Select`, `Dialog`, `Modal`, `NavigationMenu`, `Checkbox`, `RadioGroup`, `Combobox`, `DatePicker`, `MultiSelect`, `DataTable`, `Pagination`, `Card`, `TreeView`, `ProgressBar`, `Skeleton`, `HelpText`, `Accordion`, `Tabs`, `Toast`, `Tooltip`, `Heading`, `ErrorSummary`, `SkipLink`, `Switch`, `FormField`, `Breadcrumbs`.
- Files: `packages/components/src/*/`
- Risk: Accessibility regressions undetected in a library marketed as "accessible by default".
- Priority: High

**Engine core has no unit tests:**
- Files: `packages/engine/src/core/regulatory-scanner.ts` (477 lines), `packages/engine/src/core/virtual-dom.ts` (157 lines), `packages/engine/src/core/html-validator.ts` (50 lines)
- Untested: `scan()`, `enrichResults()`, score calculation, compliance status logic.
- Priority: High

**No integration test for PDF generation path:**
- Files: `packages/engine/src/reporting/pdf-generator.ts`
- Priority: Medium

**CLI action handler has no tests:**
- Files: `packages/engine/src/cli/index.ts` (449 lines)
- Priority: Medium

**Cloud client tested only with mocked `fetch`:**
- Files: `packages/engine/src/cli/cloud-client.ts`, `packages/engine/src/cli/cloud-client.test.ts`
- Priority: Low

---

*Concerns audit: 2026-05-10*
