---
phase: 34-klarsprak-plain-language-report
reviewed: 2026-06-12T04:35:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - .changeset/engine-plain-report.md
  - .changeset/standards-plain-language-copy.md
  - packages/engine/src/cli/index.ts
  - packages/engine/src/locales/de.json
  - packages/engine/src/locales/dk.json
  - packages/engine/src/locales/en.json
  - packages/engine/src/locales/es.json
  - packages/engine/src/locales/fi.json
  - packages/engine/src/locales/fr.json
  - packages/engine/src/locales/nl.json
  - packages/engine/src/locales/no.json
  - packages/engine/src/locales/sv.json
  - packages/engine/src/reporting/html-template.test.ts
  - packages/engine/src/reporting/html-template.ts
  - packages/engine/src/reporting/plain-report.test.ts
  - packages/engine/src/reporting/plain-report.ts
  - packages/standards/data/rules.en.json
  - packages/standards/data/rules.sv.json
  - packages/standards/src/index.test.ts
  - packages/standards/src/index.ts
  - packages/standards/src/types.ts
findings:
  critical: 1
  warning: 6
  info: 7
  total: 14
status: issues_found
---

# Phase 34: Code Review Report

**Reviewed:** 2026-06-12T04:35:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

Reviewed the klarspråk (plain-language) report mode end to end: PlainLanguageCopy types and 10+10 data blocks in @holmdigital/standards, the D-03 EN fallback in `generateRegulatoryReport`, the `plain.*` i18n chrome in 9 engine locales, the terminal renderer (`plain-report.ts`), the plain PDF template and `audience` param in `html-template.ts`, the `--audience`/`--plain` CLI wiring, and the D-13 snapshot lock.

**Verified as correct (executed, not assumed):** Swedish texts use proper å/ä/ö with no mojibake; tone rules (no em/en dashes, no percent signs, no invented statistics) hold across all 20 plainLanguage blocks; sv/en rule sets and impactLevels are in parity; the D-03 EN fallback covers de/fr/es/nl/fi/da/en-gb/en-us/en-ca; `plainLanguage` flows into `EnrichedReport` via the `...report` spread in `enrichResults`; the plain template HTML-escapes `result.url` at every interpolation point (T-34-08); the plain footer version comes from `getEngineVersion()` (D-16); `tsup shims: true` makes the new `__dirname` usage safe in ESM, and `copy-assets.mjs` ships `logo.jpg` to both `dist/assets` and `dist/cli/assets`; all 9 locales carry an identical 19-key `plain.*` namespace; CLI flag precedence json > light > plain > dashboard is implemented correctly for flags. Engine tests (15) and standards tests (72) pass locally.

**Key concerns:** the D-13 snapshot baseline — the phase's central regression guard — is timezone-dependent and fails deterministically in UTC environments, which will hard-fail the engine's `prepublishOnly` verify chain on the ubuntu-latest release runner (proven by running the suite with `TZ=UTC`). Config-file activation of plain mode is dead code, the `headline` field is written but never rendered, and the plain PDF produces self-contradictory text for zero-finding scans.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: D-13 snapshot baseline is timezone-dependent — engine release publish will fail on CI (UTC)

**File:** `packages/engine/src/reporting/html-template.test.ts:86-98`, `packages/engine/src/reporting/__snapshots__/html-template.test.ts.snap:181,402`
**Issue:** The committed snapshot contains `Generated: February 8, 2026 at 02:51 AM` — the Europe/Stockholm (UTC+1) rendering of the fixture timestamp `2026-02-08T01:51:29Z`. `formatDate()` uses `toLocaleDateString(...)` with `hour`/`minute`, which formats in the host machine's local timezone. **Proven by execution:** running `TZ=UTC npx vitest run src/reporting/html-template.test.ts` fails both D-13 snapshot tests (`01:51 AM` vs snapshot's `02:51 AM`). A timezone west of UTC would even shift the date to February 7. Consequences: (1) `.github/workflows/release.yml` runs on `ubuntu-latest` (UTC) and `npm publish` triggers `prepublishOnly` → `verify` → `test:ci`, so the next engine release will deterministically fail to publish; (2) if anyone "fixes" CI by regenerating the snapshot in UTC, every CET dev machine fails instead, and the byte-for-byte baseline the phase depends on gets silently rewritten. The version string was correctly normalized via `replaceAll(getEngineVersion(), '__VERSION__')`; the date was not.
**Fix:** Normalize the date out of the snapshot the same way the version is normalized — do NOT change `formatDate` itself (that would alter the developer output the snapshot is meant to freeze):
```typescript
const normalized = html
    .replaceAll(getEngineVersion(), '__VERSION__')
    .replace(/Generated: [^<]+</g, 'Generated: __DATE__<');
```
Then regenerate the snapshot once (`vitest -u`) and confirm it passes under both `TZ=UTC` and `TZ=Europe/Stockholm`. Alternative: pin `env: { TZ: 'UTC' }` in `vitest.config.ts` test config — but that masks rather than removes the environment dependency and silently changes what all other tests see.

## Warnings

### WR-01: Plain mode cannot be enabled via config file — `fileConfig.audience` is unreachable and `fileConfig.plain` is read but never used

**File:** `packages/engine/src/cli/index.ts:68,100-103`
**Issue:** Two interacting defects break the documented "CLI > File > Defaults" merge for the new options:
1. `.option('--audience <mode>', '...', 'developer')` gives Commander a default, so `cliOptions.audience` is always the truthy string `'developer'` when the flag is omitted. In `cliOptions.audience || fileConfig.audience || 'developer'`, the `fileConfig.audience` branch is therefore dead code — `"audience": "plain"` in `.a11yrc` does nothing.
2. The `audience` ternary tests only `cliOptions.plain` (the raw CLI flag). The merged `options.plain` value (which honors `fileConfig.plain`) is computed at line 100 and then never consumed anywhere in the file — `"plain": true` in `.a11yrc` also does nothing.
Net effect: plain mode is CLI-flag-only, while the code visibly reads both config keys and carries a `plain` property, implying file-config support that does not exist. (Same Commander-default-shadows-file-config pattern pre-exists for `--format` and `--sector`, but `--audience` is introduced by this phase.)
**Fix:**
```typescript
// Drop the Commander default for --audience:
.option('--audience <mode>', 'Output audience: developer (default) or plain')
// Merge using the merged plain value:
const plain = cliOptions.plain ?? fileConfig.plain ?? false;
const audience = plain ? 'plain' : (cliOptions.audience ?? fileConfig.audience ?? 'developer');
```

### WR-02: `--audience` accepts arbitrary values silently — typos produce the developer report with no warning

**File:** `packages/engine/src/cli/index.ts:68,101-103,127`
**Issue:** `--audience plian`, `--audience Plain`, or any other string passes straight through; every `options.audience === 'plain'` check fails and the user silently gets the developer dashboard and developer PDF. The `as ... { audience: 'developer' | 'plain' }` assertion erases the invalid value at the type level, so TypeScript cannot catch it either. For a flag whose whole purpose is to switch the customer-facing artifact, silent fallback is a trap.
**Fix:** Use Commander's built-in validation:
```typescript
import { Command, Option } from 'commander';
program.addOption(
    new Option('--audience <mode>', 'Output audience').choices(['developer', 'plain'])
);
```
or validate the merged value and `process.exit(1)` with a clear message on anything other than `developer`/`plain`.

### WR-03: `headline` field is dead data — plain reports lead with the technical ruleId instead

**File:** `packages/engine/src/reporting/plain-report.ts:110-117`, `packages/engine/src/reporting/html-template.ts:444-459`, `packages/standards/src/types.ts:133`
**Issue:** All 20 authored headlines (10 sv, e.g. "Knapptexten är för svag mot bakgrunden"; 10 en) are never rendered. Grep across both packages confirms `headline` appears only in types, data files, and test fixtures. Both renderers title each item with the raw `report.ruleId` (`name-role-value`, `landmark-one-main`) — exactly the developer jargon the klarspråk mode exists to remove, shown to recipients defined as non-technical. The changesets claim "5 business-first labeled fields"; `PlainLanguageCopy` has 5 text fields (headline, whatHappens, whoIsAffected, businessImpact, howToFix) but only 4 are rendered. Tests include `headline` in fixtures yet never assert it appears, which is why this slipped through.
**Fix:** In both renderers, use `pl.headline` as the item title when plainLanguage exists, demoting `ruleId` to secondary metadata (or omitting it in plain mode). Terminal: `console.log(\`${index + 1}. ${badgeText} — ${pl.headline}\`)`. HTML: render `<strong class="issue-headline">${escapeHtml(pl.headline)}</strong>` in place of (or above) the monospace ruleId. Add a test asserting headline text appears in both outputs.

### WR-04: Plain PDF emits self-contradictory text for zero-finding scans — empty state not mirrored from terminal

**File:** `packages/engine/src/reporting/html-template.ts:432-433,689-696`
**Issue:** `renderPlainReport` early-returns on `reports.length === 0`, printing only `plain.empty_state` + attribution. `generatePlainReportHTML` does not: for an empty result it renders the full intro framing ("…Here is what is worth starting with, sorted by what costs you the most customers."), then "Found 0 issues", then "No barriers found this time.", then the unconditional closing "Start at the top. The items highest up cost you the most customers." — instructions referencing a list that does not exist, in a customer-facing PDF. This also breaks the changeset's claim that the plain PDF "mirrors the terminal".
**Fix:** Branch the body on the empty case, mirroring the terminal:
```typescript
const bodyHtml = sortedReports.length === 0
    ? `<p>${t('plain.empty_state')}</p>`
    : `<div class="intro"><p>${t('plain.intro_framing')}</p><p>${t('plain.intro_found', { count, unit })}</p></div>
       ${itemsHtml}
       <p class="closing">${t('plain.closing')}</p>`;
```
Add a test asserting the empty-result plain HTML does NOT contain the closing/intro strings.

### WR-05: Invalid-URL guard is an empty block — validation result discarded (pre-existing)

**File:** `packages/engine/src/cli/index.ts:132-134`
**Issue:** `if (!isValidUrl(url)) { /* // ... validation ... */ }` has a comment-only body. Invalid URLs (e.g. `htp://x`, bare hostnames) are not rejected; `isValidUrl` is computed and ignored, and the scan proceeds until Puppeteer fails with an opaque error. The placeholder comments at lines 41-43 (`// ... imports ...`, `// ... program setup ...`) indicate this file was regenerated from an elided snippet at some point and the validation body was lost. Pre-existing at the phase diff base (confirmed via `git show c32a532:...`), not introduced by this phase — but it sits in a file this phase modified and should not survive another release.
**Fix:**
```typescript
if (!isValidUrl(url)) {
    console.error(chalk.red(`Error: Invalid URL '${url}'. Expected http:// or https://`));
    process.exit(1);
}
```

### WR-06: `result.url` interpolated unescaped in the developer template (pre-existing, frozen by D-13)

**File:** `packages/engine/src/reporting/html-template.ts:68,238`
**Issue:** The developer template still interpolates the raw URL: `t('report.title', { url: result.url })` and `t('report.scan_target', { url: result.url })`. A URL string containing markup is injected into HTML that `generatePDF` loads into Puppeteer launched with `--no-sandbox` — in CLI usage the URL is operator-supplied (self-injection), but `generateReportHTML` is a published library API; any service generating developer PDFs for arbitrary scanned URLs executes attacker-influenced markup during PDF generation. This phase fixed exactly this in the plain template (T-34-08: `escapeHtml(result.url)` at every interpolation) but the developer path was consciously frozen byte-for-byte by the D-13 snapshot, so the gap is now locked in with no tracking marker in code.
**Fix:** Schedule `escapeHtml(result.url)` for the developer template as a deliberate baseline revision (one-time snapshot regeneration with the escaping in place), and add a `// TODO(T-34-08): escape result.url when D-13 baseline is next revised` marker so the debt is visible. Note `escapeHtml` should also handle `"` if any value is ever placed in an attribute context.

## Info

### IN-01: Changeset key count wrong — `plain.*` namespace has 19 keys, not 18

**File:** `.changeset/engine-plain-report.md:29`
**Issue:** "plain.* namespace (18 keys) in all 9 locale files" — programmatic count: 19 keys, identical set across all 9 locales.
**Fix:** Update the changeset text to 19 before `changeset version` consumes it into CHANGELOG.md.

### IN-02: `plain.sorted_by` rendered in terminal but absent from the plain PDF

**File:** `packages/engine/src/reporting/plain-report.ts:100` vs `packages/engine/src/reporting/html-template.ts:689-692`
**Issue:** The terminal prints the "Sorted by business impact" line; the PDF intro omits it. Minor divergence from the "mirrors the terminal" contract (D-08).
**Fix:** Add `<p>${t('plain.sorted_by')}</p>` to the PDF intro, or document the intentional omission.

### IN-03: Inconsistent escaping discipline inside the plain template

**File:** `packages/engine/src/reporting/html-template.ts:440,458,679,690-696,701`
**Issue:** `escapeHtml(t(...))` is applied to badge text, tagline, attribution, and fallback framing, but NOT to `intro_framing`, `intro_found`, `closing`, `empty_state`, or the `<dt>` labels. All values are first-party locale strings today, so there is no vulnerability — but the mixed pattern invites a future mistake when someone adds a key containing interpolated data.
**Fix:** Apply `escapeHtml` uniformly to every `t()` output in the HTML template, or document which sink classes are trusted.

### IN-04: `renderPlainReport` silently resets global i18n language to 'en' by default

**File:** `packages/engine/src/reporting/plain-report.ts:75-76`
**Issue:** `lang: string = 'en'` + unconditional `setLanguage(lang)` means a library caller who previously ran `setLanguage('sv')` and then calls `renderPlainReport(result)` gets English output AND a mutated global language for everything afterwards. The CLI always passes `options.lang`, so only library consumers are exposed.
**Fix:** Default to the current language instead: `lang: string = getCurrentLang()`.

### IN-05: Stale comment and vacuous-pass risk in the negative plainLanguage test

**File:** `packages/standards/src/index.test.ts:610-614`
**Issue:** Comment says "Any rule not in the 8-rule set" — the set has 10 rules. Also, `expect(report?.plainLanguage).toBeUndefined()` would pass vacuously if `focus-order` were ever removed from the database (report would be `null`). The rule exists today, so the test is currently meaningful.
**Fix:** Correct the comment to 10 and add `expect(report).not.toBeNull();` before the plainLanguage assertion.

### IN-06: `convergence-schema.json` not updated with `plainLanguage` (schema already stale)

**File:** `packages/standards/schema/convergence-schema.json`
**Issue:** The published schema (`$id: https://a11y.holmdigital.se/schema/convergence-schema.json`) has no `plainLanguage` definition. It is referenced nowhere in the repo and already fails to validate the rules files at the root level ("must be object" vs array data), so nothing breaks — but external consumers resolving the `$id` get a schema that neither matches the data shape nor the new field.
**Fix:** Either update the schema (root array shape + `plainLanguage` object with the six fields and the `impactLevel` enum) and add a validation test mirroring the national-laws one, or delete/deprecate the schema explicitly.

### IN-07: Pre-existing data issue — duplicate ruleId `audio-description` in rules files

**File:** `packages/standards/data/rules.en.json` (and siblings)
**Issue:** Discovered while validating the new data: `audio-description` appears twice; `getConvergenceRule` uses `.find` so the first entry silently wins. Not introduced by this phase and none of the 10 plainLanguage rules are affected — recorded for data hygiene.
**Fix:** Deduplicate in a follow-up; consider a uniqueness test over `ruleId` per locale file.

---

_Reviewed: 2026-06-12T04:35:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
