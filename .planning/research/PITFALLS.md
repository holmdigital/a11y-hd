# Domain Pitfalls

**Domain:** TypeScript monorepo stability refactoring — removing `as any`, fixing version strings, fixing locale/template handling in published npm packages
**Researched:** 2026-03-02
**Confidence:** HIGH — all pitfalls are grounded in direct codebase analysis; no speculative claims

---

## Critical Pitfalls

Mistakes that cause rewrites, consumer breakage, or legally incorrect output.

---

### Pitfall 1: Extending `RegulatoryReport` Breaks the Published Type Contract

**What goes wrong:** `RegulatoryReport` is exported from `@holmdigital/standards` and consumed by every downstream module. Adding `failingNodes` and `legalContext` as required fields on the interface is a breaking change. Any external consumer that constructs a `RegulatoryReport` literal will fail to compile after they upgrade.

**Why it happens:** When adding fields to fix internal type safety, it is tempting to put them directly on the base type. But `RegulatoryReport` is the public API surface of a published package — consumers construct it, not just consume it.

**Consequences:**
- Semver violation: a minor-version release that adds required fields to a published interface is a breaking change requiring a major bump.
- Downstream consumers who spread `RegulatoryReport` objects get a compile error on their next `npm install`.
- The CONCERNS.md `Fix approach` correctly says "extend" — but the choice between `extends` (new subtype: `EnrichedReport extends RegulatoryReport`) vs. optional fields on the base type determines whether this is breaking or safe.

**Prevention:**
- Make `failingNodes?: FailingNode[]` and `legalContext?: LegalContext` optional on `RegulatoryReport`, **or**
- Create `EnrichedReport extends RegulatoryReport` as a new type in standards, keeping `RegulatoryReport` unchanged.
- Never add required fields to a published interface without a major version bump.

**Detection (warning signs):**
- If `generateRegulatoryReport()` in `packages/standards/src/index.ts` returns `RegulatoryReport` and you add required fields, the return type must now supply them — which it doesn't today. The compiler will catch this in standards itself, but only if you look at all construction sites.
- Check every call to `generateRegulatoryReport()` — currently it does not set `failingNodes` or `legalContext`, meaning those fields cannot be required.

**Phase:** Address in Phase 1 (type system changes). The optional-vs-required decision must be made before any downstream cast removal.

---

### Pitfall 2: Removing `as any` at the Spread Site Silently Corrupts the Object Shape

**What goes wrong:** The core enrichment in `regulatory-scanner.ts` line 272 spreads `...report` and then adds `legalContext` and `failingNodes` via `} as any`. When you remove `as any`, TypeScript will correctly flag the literal as not assignable to `RegulatoryReport[]`. The natural fix is to widen the type — but if the new type is wrong (wrong field names, wrong nesting), the cast removal passes TypeScript while the runtime object is still incorrect.

**Concrete case in this codebase:**
```typescript
// regulatory-scanner.ts line 258-272 (current)
reports.push({
    ...report,
    holmdigitalInsight: { ...report.holmdigitalInsight, reasoning: violation.help },
    legalContext: fullRule?.legalContext,
    failingNodes: violation.nodes.map((node: any) => ({ ... }))
} as any);  // <-- hides the problem
```
The `node: any` on line 267 means `failingNodes` elements are unvalidated at the point of construction. After removing `as any`, a typed `FailingNode` interface is required — but if the axe-core node shape changes, or if `node.target` is an array (it always is in axe-core, `.join(' ')` is applied), the mapping must be verified against the live axe-core type definitions, not assumed.

**Why it happens:** Developers trust that "the code worked before," but `as any` hid the fact that the object shape was never statically verified. Removing the cast without reading axe-core's actual type definitions leads to a type that looks right but is structurally mismatched at runtime on edge-case violations.

**Consequences:** `failingNodes` renders empty in JUnit/HTML reports. Cloud payload sends empty `element_selector` and `element_html`. Debugging is hard because TypeScript says everything is fine.

**Prevention:**
- Import or reference axe-core's `NodeResult` type (it is exported from `axe-core`) when defining `FailingNode`. Do not guess the shape.
- Write a unit test that constructs a minimal `axeResults` mock matching the real axe-core violation structure, runs `enrichResults()`, and asserts `failingNodes[0].target` is a string (not an array).
- The test must use a violation with `nodes[0].target = ['#foo', '.bar']` (array, as axe-core actually returns it) to validate that the `.join(' ')` is preserved after typing.

**Detection (warning signs):**
- If your `FailingNode` interface has `target: string` but axe-core's `NodeResult.target` is `string[]`, TypeScript will not error because you have an untyped intermediate `node: any` — the mapping function is still `any`.
- Look for `node: any` remaining after the cast removal; that is the remaining escape hatch hiding the problem.

**Phase:** Phase 1. Must be addressed before removing `as any` from reporting modules.

---

### Pitfall 3: Template Processing Order Divergence Produces Different HTML vs Markdown Output

**What goes wrong:** The React component `AccessibilityStatement` (line 260-298) and `statement-generator.ts` (line 264-295) implement template processing with opposite ordering:

- **Component:** Conditionals `[ ... ]` → Variable substitution → Choices `{ A / B / C }`
- **Generator:** Conditionals → Choices → (substitutions happen via the `substitutions` dict but choice regex runs on `{...}` which overlaps with substitution keys)

The generator's `processText()` (line 281) applies the choice regex `/{([^{}]*?)}/g` which matches `{<brister>}` before substitution happens for that key — meaning the substitution dict is checked as a fallback inside the choice handler, not in a dedicated pass. The component does explicit substitution first via `replaceAll`, then choice extraction. This means the same template string produces different output from each path when a `{...}` block contains both a substitution variable and slashes.

**Consequences:** An accessibility statement generated as HTML (via React component) will differ from one generated as Markdown (via `processText()`). This is a legally significant document. A compliance statement that says "fully compliant" in HTML but "partially compliant" in Markdown output from the same data is a defect, not just a cosmetic issue.

**Prevention:**
- Before touching any template logic, write a test that runs both code paths with identical inputs and asserts identical text output for the substantive content (ignoring HTML tags).
- This test will reveal the current divergence and become the regression guard after the fix.
- Any fix to locale handling must run through this test. Do not fix one path without fixing the other.

**Detection (warning signs):**
- Run `--statement output.md` and then render the component with identical props and compare the compliance status strings. They will diverge on `{ A / B / C }` blocks when `complianceLevel` is `partial` or `non-compliant`.

**Phase:** Phase 3 (locale/template fix). This divergence must be documented and tested before any locale expansion work.

---

### Pitfall 4: Locale Expansion Adds Dead Template Variables for Non-Nordic Languages

**What goes wrong:** The current substitution maps in both the component (line 216-256) and the generator (line 195-261) are built for sv/en/no. Languages like `de`, `fi`, `fr`, `nl`, `es` have template JSON files in `packages/engine/src/reporting/templates/` but the variable placeholders in those templates (e.g., `{<Bewertungsdatum>}`, `{<Methode>}`) may not match the substitution keys in the component. The component's `replacements` dict does not include German, Finnish, Dutch, French, or Spanish keys — only the generator's `substitutions` dict does (lines 215-260).

**Concrete example:**
- Template `de.json` uses `{<Bewertungsdatum>}` — the generator maps this via `'{<bewertungsdatum>}': dateStr` (lowercase) but the template files may use mixed case.
- The component TEMPLATES constant only has sv/en/no — passing `locale="de"` falls through to the English template entirely.

**Consequences:** Users passing `locale="de"` to the component get an English-language document despite the German JSON template existing. No error, no warning — silent wrong output.

**Prevention:**
- When expanding locales, use the same template JSON files for both the component and the generator. The component should load from the same JSON source, not from the hardcoded `TEMPLATES` constant.
- Write a parameterized test that iterates all 9 locales, renders the component and/or runs `generateStatementContent()`, and asserts: (1) the output contains locale-appropriate strings (e.g., German output contains "Bewertungsdatum"), (2) no unresolved `{<...>}` placeholders remain in the output.
- The placeholder-leakage test is the most important guard — a regex like `/{<[^>]+>}/` on the output string will catch missing substitutions instantly.

**Detection (warning signs):**
- Check the generator's `processText()` — any unresolved substitution key is returned as literal `{<key>}` in the output document. Run the 9 locales through the generator and grep the output for `{<`.

**Phase:** Phase 3 (locale fix). Must add the placeholder-leakage test before writing any new locale code.

---

## Moderate Pitfalls

---

### Pitfall 5: Version Injection via `readFileSync` Is Not Reliable Across Distribution Modes

**What goes wrong:** `getEngineVersion()` in `regulatory-scanner.ts` (lines 18-30) reads `package.json` from `resolve(dir, '..', 'package.json')` at runtime. This works when the dist structure is `dist/core/regulatory-scanner.js` → `../package.json` = `dist/package.json`. But the `files` array in `package.json` is `["dist", "README.md"]` — `package.json` itself is included in the npm tarball automatically, but it lives at the package root, not inside `dist/`. So the path `dist/package.json` does not exist. The fallback returns `'2.1.1'` (a stale hardcoded value), defeating the purpose.

**Why it happens:** The `dist/` output directory contains compiled JS files, but tsup does not copy `package.json` into `dist/`. The path assumption is incorrect for both the published tarball and the built-in-place local case.

**Consequences:** After fixing the three hardcoded version strings, if `readFileSync` fails (wrong path), the fallback `'2.1.1'` is returned everywhere — cloud API, JUnit metadata, CLI `--version`. The fix appears to work but is silently broken in production installs.

**Prevention:**
- Use tsup's `define` option to inject the version at build time: `define: { '__ENGINE_VERSION__': JSON.stringify(pkg.version) }` in `tsup.config.ts`. This bakes the version string into the bundle with zero runtime filesystem dependency.
- Or use tsup's `banner` option to prepend `const __ENGINE_VERSION__ = '...'`.
- Write a test that calls `getEngineVersion()` and asserts the result is a semver string matching `package.json` version — run in both the source context (Vitest) and after build (integration test or `node dist/...` assertion in CI).

**Detection (warning signs):**
- `readFileSync(resolve(dir, '..', 'package.json'))` — verify `dir` is `dist/core/` after build. The parent is `dist/`, not the package root. Check `ls dist/` after `npm run build` to confirm no `package.json` there.
- The fallback `return '2.1.1'` on the catch branch is the warning sign — any catch means the primary path is failing.

**Phase:** Phase 2 (version fix). Verify the chosen approach works in `dist/` context before removing the hardcoded fallbacks.

---

### Pitfall 6: `[key: string]: any` Removal Breaks Spread Operations on `HolmDigitalInsight`

**What goes wrong:** `HolmDigitalInsight` has `[key: string]: any` (types.ts line 57). This index signature is used implicitly in `enrichResults()` at line 260-262 where `...report.holmdigitalInsight` is spread and `reasoning: violation.help` is added. After removing the index signature and adding explicit optional keys, TypeScript may reject the spread-and-extend pattern if `reasoning` is not in the explicit interface definition (it currently is not).

**Consequences:** Removing the index signature causes a compile error at `{ ...report.holmdigitalInsight, reasoning: violation.help }` if `reasoning` is not added to the `HolmDigitalInsight` interface.

**Prevention:**
- Add `reasoning?: string` to `HolmDigitalInsight` in `types.ts` at the same time as removing the index signature. This field is used in at least: `enrichResults()`, `junit-generator.ts` (line 41: `report.holmdigitalInsight.reasoning`), and the CLI dashboard (line 304).
- Search for all accesses of `holmdigitalInsight.*` before removing the index signature to enumerate all fields actually used.

**Detection (warning signs):**
- Run `grep -r 'holmdigitalInsight\.' packages/` and list every key accessed. Any key not in the explicit interface becomes a compile error after index signature removal.

**Phase:** Phase 1 (type changes). Must enumerate all `holmdigitalInsight` property accesses before removing the index signature.

---

### Pitfall 7: i18n Module-Level Global State Fails in Test Isolation

**What goes wrong:** `currentLang` is a module-level `let` in `packages/engine/src/i18n/index.ts` (line 33). Vitest runs tests in the same process by default. If one test calls `setLanguage('sv')`, all subsequent tests in the same suite (and any test suite that doesn't reset language) will run with Swedish. This is an existing problem, but it becomes acute when writing new tests for locale handling.

**Consequences:** Locale tests that set a non-English language and fail mid-test leave global state dirty. Other tests (version tests, enrichment tests) that call `t()` or use standards query functions relying on `getCurrentLang()` silently return Swedish strings, causing unrelated test failures with confusing error messages.

**Prevention:**
- Every test file that calls `setLanguage()` must have an `afterEach(() => setLanguage('en'))` reset.
- Vitest's `--isolate` flag (or `isolate: true` in vitest config) runs each test file in its own worker — this prevents cross-file contamination but not within-file contamination.
- The existing `i18n/index.test.ts` should be audited for missing cleanup.

**Detection (warning signs):**
- If a test failure in locale-related tests causes a different, unrelated test to start failing, module state contamination is the cause. Run with `--reporter=verbose` and check test execution order.

**Phase:** Phase 3 (locale tests). Apply the `afterEach` reset pattern in all new locale test files from day one.

---

### Pitfall 8: tsup CJS/ESM Dual Build Breaks Runtime `import.meta.url` in CJS Context

**What goes wrong:** `regulatory-scanner.ts` line 22 uses `dirname(fileURLToPath(import.meta.url))` inside a ternary that checks `typeof __dirname`. In the ESM bundle (`dist/index.mjs`), `__dirname` is undefined so it falls back to `import.meta.url`. In the CJS bundle (`dist/index.js`), `__dirname` is defined and used. But if tsup transforms `import.meta.url` literally into the CJS bundle (some versions of tsup do this), the runtime CJS bundle has `import.meta.url` as a literal string that Node.js CJS does not support, causing a runtime `SyntaxError`.

**Consequences:** `getEngineVersion()` and `getStandardsVersion()` throw at runtime in CJS consumers, falling back to the stale hardcoded version. This is another reason to prefer build-time version injection over runtime filesystem reads.

**Prevention:**
- This is a strong argument for the `define` injection approach (Pitfall 5). Eliminate `import.meta.url` from version resolution entirely.
- If filesystem reading is kept, use the `__dirname` branch only (remove the ESM branch) and ensure the CJS output is the primary consumer path for the CLI binary.

**Detection (warning signs):**
- After build, run `node -e "require('./dist/index.js')"` in the package directory. A `SyntaxError: Cannot use 'import.meta' outside a module` means the ESM branch leaked into CJS.

**Phase:** Phase 2 (version fix). If using runtime reads, test the CJS path explicitly.

---

## Minor Pitfalls

---

### Pitfall 9: Hardcoded `'2024-01-01'` Default Publish Date Appears in Legal Documents

**What goes wrong:** `statement-generator.ts` line 231 and `AccessibilityStatement.tsx` line 230 both fall back to the literal string `'2024-01-01'` when no `publishDate` prop is provided. For a published component used by external consumers who do not pass `publishDate`, every generated accessibility statement says the website was published on January 1, 2024 — incorrect for all sites published on any other date.

**Consequences:** Users unknowingly publish accessibility statements with a false publish date. Since accessibility statements have legal standing under WAD and DOS-lagen, a fabricated date is a compliance risk for end consumers.

**Prevention:**
- Change the fallback to an empty string or omit the field entirely when not provided.
- Emit a console warning when `publishDate` is not provided and the statement is being generated.
- This is in scope only if statement generation is touched during the locale fix (Phase 3); otherwise track it as a follow-on issue.

**Detection:** Review the rendered output of a statement generated without `--publish-date` flag. Look for `'2024-01-01'` in the output.

**Phase:** Phase 3 (locale fix) — fix opportunistically when touching the statement generator.

---

### Pitfall 10: `escapeXML` in JUnit Generator Accepts `any` — Still Unsafe After Cast Removal

**What goes wrong:** `junit-generator.ts` line 69: `function escapeXML(unsafe: any): string`. This function is called with `report.holmdigitalInsight.reasoning` (line 41), which after typing will be `string | undefined`. The current `escapeXML` already handles `undefined` gracefully (line 70: `if (unsafe === undefined || unsafe === null) return ''`). However, line 49 uses `(report as any).failingNodes` — after proper typing, this cast needs removal but `failingNodes` must come from the new `EnrichedReport` type.

**Consequences:** After removing `(report as any).failingNodes`, the `forEach` on line 51 uses `(node: any)` — the `node` parameter remains untyped even after the outer cast is removed. This is a partial fix that leaves runtime type safety incomplete.

**Prevention:**
- When removing `(report as any)` in `junit-generator.ts`, also type the `node` parameter using the `FailingNode` interface. Both casts must be removed together.
- Change `escapeXML(unsafe: any)` to `escapeXML(unsafe: string | null | undefined)` to close the remaining escape hatch.

**Phase:** Phase 1 (type changes). Both casts in this file should be addressed in a single commit.

---

### Pitfall 11: `renderSections` Icon Detection Uses Language-Specific String Matching

**What goes wrong:** `AccessibilityStatement.tsx` lines 308-319 use hardcoded Swedish, English, and Norwegian section title strings to determine which icon to display. When additional locales are rendered (de, fi, fr, nl, es), the `trimmed.includes(...)` checks will not match — the section gets no icon, producing inconsistent visual output.

**Consequences:** Adding locale support reveals missing icon mappings. Not a functional defect, but noticed by visual regression.

**Prevention:**
- Icon selection should use `section.id` (e.g., `'how-accessible'`, `'reporting'`) which is locale-independent, not the rendered text. The current code already has `section.id === 'how-accessible'` checks but falls through to text matching for languages without explicit id checks.
- When adding locale support, remove all `trimmed.includes(...)` fallbacks and rely solely on `section.id`.

**Phase:** Phase 3 (locale fix). Low effort, high correctness payoff.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Adding `failingNodes`/`legalContext` to standards types | Breaking published interface (Pitfall 1) | Make fields optional; choose EnrichedReport pattern |
| Removing `as any` from `enrichResults()` | Shape mismatch on axe-core node structure (Pitfall 2) | Import axe-core `NodeResult` type; test with real axe violation shape |
| Removing index signature from `HolmDigitalInsight` | Missing `reasoning` field causes compile error (Pitfall 6) | Enumerate all accessed keys first; add explicit fields |
| Fixing version to use `getEngineVersion()` | Runtime path resolution fails in dist context (Pitfall 5, 8) | Prefer build-time `define` injection via tsup |
| Removing hardcoded versions in cloud-client.ts | cloud-client already imports `getEngineVersion()` — check it works | Verify after build with `node dist/cli/index.js --version` |
| Adding locale support to AccessibilityStatement | Silent fallback to English for all non-sv/no locales (Pitfall 4) | Test with placeholder-leakage regex on all 9 locales |
| Writing locale/template tests | Global i18n state contaminating test isolation (Pitfall 7) | `afterEach(() => setLanguage('en'))` in every locale test file |
| Fixing template processing | HTML vs Markdown output divergence (Pitfall 3) | Write cross-path equality test before touching any template logic |
| Fixing locale guard in component | Icon detection breaks for new locales (Pitfall 11) | Switch to `section.id`-based icon selection |
| Removing `as any` from JUnit generator | Partial removal leaves `node: any` parameter (Pitfall 10) | Remove both casts in the same commit; type the `node` parameter |

---

## Sources

All findings are grounded in direct static analysis of the codebase (HIGH confidence):

- `packages/standards/src/types.ts` — `RegulatoryReport` interface structure, `HolmDigitalInsight` index signature
- `packages/engine/src/core/regulatory-scanner.ts` — `getEngineVersion()` filesystem path resolution, `enrichResults()` cast sites
- `packages/engine/src/reporting/statement-generator.ts` — `processText()` template ordering, fallback path chain, `'2024-01-01'` default
- `packages/components/src/AccessibilityStatement/AccessibilityStatement.tsx` — `TEMPLATES` constant, locale guard `?? 'en'`, `renderTemplate()` ordering, icon string-matching
- `packages/engine/src/reporting/junit-generator.ts` — `(report as any).failingNodes`, `(node: any)`, `escapeXML(unsafe: any)`
- `packages/engine/src/cli/cloud-client.ts` — already uses `getEngineVersion()` (the version fix is partially done here)
- `packages/engine/src/i18n/index.ts` — module-level `let currentLang`
- `packages/engine/package.json` — `files: ["dist", "README.md"]` confirms `package.json` is not inside `dist/`
- `.planning/codebase/CONCERNS.md` — codebase audit identifying all `as any` locations and impact
- `.planning/PROJECT.md` — milestone scope, constraints, and backwards compatibility requirements
