---
phase: 34-klarsprak-plain-language-report
verified: 2026-06-12T06:30:00Z
status: human_needed
score: 17/17 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Run `npx hd-a11y-scan https://johancask.com --plain` and visually confirm the terminal output"
    expected: "Impact-sorted plain-language report with Swedish/English chrome; opening framing; each finding shows four labeled fields (what happens, who is affected, business impact, how to fix) plus a chalk-colored badge; neutral closing; no compliance score visible"
    why_human: "Terminal chalk color rendering (red.bold for stoppar-kop, red/yellow/gray for others) and the overall readability/tone cannot be verified programmatically; verified once during D-09 gate but visual regression is not mechanically locked"
  - test: "Run `npx hd-a11y-scan https://johancask.com --plain --pdf karin.pdf` and open the PDF"
    expected: "Plain PDF with wiki-style header (HolmDigital logo, tagline, scanned URL as title), impact-sorted numbered finding cards, WCAG-AA badge chips, per-page footer with URL/date/engine version, no score/WCAG tables/legal sections"
    why_human: "PDF visual layout, logo rendering, per-page margin repeatability, badge chip colors, and absence of developer-template content can only be confirmed by opening the rendered PDF; D-13 snapshot locks developer HTML byte-for-byte but the plain template has no equivalent pixel-lock"
  - test: "Run `npx hd-a11y-scan https://johancask.com --plain --json` and confirm JSON output"
    expected: "JSON output (not the plain terminal report), with plainLanguage field present in each matching report object"
    why_human: "D-12 precedence assertion (--plain --json yields JSON) is tested in unit tests; the live --json output containing plainLanguage data flows from standards enrichment which is also unit-tested; however, end-to-end JSON shape on a live scan has not been captured in automation — categorized as SKIP-able if D-09 manual gate acceptance already covered this"
---

# Phase 34: Klarspråksrapport Verification Report

**Phase Goal:** `hd-a11y-scan <url> --plain` (alias for `--audience plain`, default `developer` — no existing behavior changes) produces a plain-language report for non-technical recipients in terminal and PDF. Texts live in standards (English keys, localized values), are fetched in `generateRegulatoryReport` via the existing `getConvergenceRule` lookup (ONE lookup, no new locale loader, no second lookup at render time), and flow to terminal/`--json`/`--pdf` simultaneously.

**Verified:** 2026-06-12T06:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `PlainLanguageCopy` interface and `BusinessImpactLevel` type are exported from `@holmdigital/standards` | VERIFIED | `packages/standards/src/types.ts` lines 8 and 132-139; exported from `index.ts` lines 119-120 |
| 2 | `ConvergenceRule.plainLanguage?: PlainLanguageCopy` exists (D-15) | VERIFIED | `types.ts` line 39, after `legalContext?` |
| 3 | `RegulatoryReport.plainLanguage?: PlainLanguageCopy` exists (D-15) | VERIFIED | `types.ts` line 156, after `testability` |
| 4 | 8 sv + 8 en plainLanguage blocks present with exact D-04 impactLevel values (PLAIN-06) | VERIFIED | Python parity check: all 8 ruleIds present in both files, impactLevel all MATCH; expanded to 10 rules (landmark-one-main + region via D-09 scope) |
| 5 | D-10.1 encoding guard: zero mojibake in 8 sv plainLanguage blocks | VERIFIED | Python check: no `Ã` in any sv rule; vitest D-10.1 describe block green (72/72 standards tests pass) |
| 6 | D-10.2 tone lint: no em/en dashes or percent signs in sv or en plainLanguage | VERIFIED | Python check: `dash=False pct=False` for all 8 checked sv rules; vitest D-10.2 describe block green |
| 7 | D-10.3 parity: all 8 ruleIds have identical impactLevel in sv and en | VERIFIED | Python check: all 8 show MATCH; vitest D-10.3 describe block green |
| 8 | `generateRegulatoryReport` copies `plainLanguage` explicitly with D-03 EN fallback | VERIFIED | `index.ts` lines 282-296: `const plainLanguage = rule.plainLanguage ?? (lang !== 'en' ? getConvergenceRule(ruleId, 'en')?.plainLanguage : undefined);`, `plainLanguage,` as last field in returned object; no spread |
| 9 | Fallback happens in `generateRegulatoryReport`, never in a renderer (D-03 single-lookup invariant) | VERIFIED | `plain-report.ts` contains no `getConvergenceRule` call (grep confirmed); D-03 vitest test block green |
| 10 | `plain.*` namespace exists in ALL 9 locale files with identical 19-key sets (D-14) | VERIFIED | Python check: all 9 files carry identical sorted key list including `attribution`, `fallback_framing`, `report_tagline` added during D-09 scope |
| 11 | `renderPlainReport(result, lang)` sorts by business impact, shows 5 business-first fields + clear-text badge, all chrome via `t('plain.*')` (PLAIN-03) | VERIFIED | `plain-report.ts`: 130 lines, IMPACT_ORDER map, BADGE_KEY map, `t('plain.*')` for all chrome, `.plainLanguage` direct reads, no `getConvergenceRule`, no `result.score`, no hardcoded Swedish/English labels, zero `as any` |
| 12 | When a report has no `plainLanguage`, renderer falls back to `remediation.description` without throwing (D-10.4) | VERIFIED | `plain-report.ts` line 120: fallback renders `t('plain.fallback_framing') + report.remediation.description`; plain-report.test.ts fallback test green |
| 13 | `hd-a11y-scan --plain` / `--audience plain` sets audience; default stays `developer` (PLAIN-04) | VERIFIED | `cli/index.ts` lines 68-69: both flags declared; lines 101-127: `audience` merge+cast |
| 14 | D-12 precedence: plain branch sits after json and light, before dashboard else | VERIFIED | `cli/index.ts` lines 228 (json) → 230 (light) → 250 (plain) → 253 (else dashboard) |
| 15 | `generateReportHTML(result, sector, audience='developer')` third param defaulted; developer PDF byte-for-byte unchanged (D-08/D-13) | VERIFIED | `html-template.ts` lines 48-55: signature with `audience: 'developer' \| 'plain' = 'developer'`; D-13 snapshot (`html-template.test.ts.snap`, 16,572 bytes, 2 named developer entries) passes without update; 138/138 engine tests green |
| 16 | Plain PDF footer version comes from `getEngineVersion()` / `__ENGINE_VERSION__` (D-16) | VERIFIED | `html-template.ts` line 700: `v${getEngineVersion()}`; D-16 test in `html-template.test.ts` lines 115-126 asserts footer === engine `package.json` version; test green |
| 17 | Two minor changesets created: `@holmdigital/standards` and `@holmdigital/engine` (no components changeset) | VERIFIED | `.changeset/standards-plain-language-copy.md` and `.changeset/engine-plain-report.md` exist with correct `minor` frontmatter and meaningful bodies |

**Score:** 17/17 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/standards/src/types.ts` | `PlainLanguageCopy` interface, `BusinessImpactLevel` type, `plainLanguage?` on both existing types | VERIFIED | Lines 8, 39, 132-139, 156 |
| `packages/standards/data/rules.sv.json` | 8+ sv plainLanguage blocks with D-04 impactLevel | VERIFIED | 10 blocks found (8 original PLAIN-06 + landmark-one-main + region); all D-04 values correct |
| `packages/standards/data/rules.en.json` | 8+ en plainLanguage blocks with matching impactLevel | VERIFIED | 10 blocks; D-10.3 parity confirmed |
| `packages/standards/src/index.test.ts` | D-10.1/D-10.2/D-10.3 describe blocks + PLAIN-02 enrichment tests | VERIFIED | Lines 537, 559, 577, 596 — all four describe blocks present; 72/72 tests pass |
| `packages/engine/src/locales/en.json` | `plain.*` namespace with real English chrome | VERIFIED | 19 keys including `attribution`, `fallback_framing`, `report_tagline` |
| `packages/engine/src/locales/sv.json` | `plain.*` namespace with real Swedish chrome | VERIFIED | Identical key set; `badge_stoppar_kop: "Stoppar köp"`, `badge_forsamrar: "Försämrar upplevelsen"` |
| `packages/engine/src/locales/de.json` (and fr, es, nl, fi, dk, no) | `plain.*` namespace, English-valued (D-02 deferral) | VERIFIED | All 7 mirror files carry `badge_stoppar_kop: "Blocks purchases"` (en verbatim) |
| `packages/engine/src/reporting/plain-report.ts` | `renderPlainReport(result, lang)` terminal renderer (min 40 lines) | VERIFIED | 130 lines, exported function, IMPACT_ORDER+BADGE_CHALK+BADGE_KEY maps, D-03 invariant upheld |
| `packages/engine/src/reporting/plain-report.test.ts` | D-10.4 structure tests: sort, badge, fallback, empty-state | VERIFIED | 5 `it()` blocks in `renderPlainReport (D-10.4)` describe; all green |
| `packages/engine/src/reporting/html-template.test.ts` | D-13 snapshot baseline (two-arg calls) + D-08/D-16 assertions | VERIFIED | D-13 describe block with `toMatchSnapshot`, two-arg-only calls, `getEngineVersion()` normalized; D-08/D-16 describe block with 6 assertions |
| `packages/engine/src/reporting/__snapshots__/html-template.test.ts.snap` | D-13 developer HTML baseline, committed | VERIFIED | 16,572 bytes, 2 named snapshot entries for empty and one-report developer HTML |
| `packages/engine/src/cli/index.ts` | `--audience`/`--plain` flags, merge+cast, D-12 print branch, plain PDF branch | VERIFIED | Lines 68-69 (flags), 101-127 (merge+cast), 250-252 (plain branch), 182-183 (PDF branch) |
| `packages/engine/src/reporting/html-template.ts` | `audience` param + `generatePlainReportHTML`, D-08 exclusions, D-16 version, url escaping | VERIFIED | Lines 48-55 (signature+guard), 41-45 (escapeHtml), 418 (safeUrl), 700 (getEngineVersion footer); no score/WCAG/legal in plain template |
| `.changeset/standards-plain-language-copy.md` | Standards minor changeset | VERIFIED | `"@holmdigital/standards": minor`; mentions `PlainLanguageCopy` and `BusinessImpactLevel` |
| `.changeset/engine-plain-report.md` | Engine minor changeset | VERIFIED | `"@holmdigital/engine": minor`; mentions `renderPlainReport` and `--plain` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `packages/standards/src/index.ts` | `PlainLanguageCopy` | `export type` re-export block | VERIFIED | Lines 119-120 |
| `packages/standards/src/types.ts` | `ConvergenceRule.plainLanguage` | Optional field after `legalContext?` | VERIFIED | Line 39 |
| `packages/standards/src/types.ts` | `RegulatoryReport.plainLanguage` | Optional field after `testability` | VERIFIED | Line 156 |
| `packages/standards/src/index.ts` | `getConvergenceRule(ruleId, 'en')` | EN fallback nullish-coalescing in `generateRegulatoryReport` | VERIFIED | Line 284 |
| `generateRegulatoryReport` | `RegulatoryReport.plainLanguage` | Explicit field in returned object | VERIFIED | Line 296 |
| `packages/engine/src/cli/index.ts` | `renderPlainReport` | Dynamic import in plain print branch | VERIFIED | Lines 250-252 |
| `packages/engine/src/cli/index.ts` | `generateReportHTML(result, sector, 'plain')` | Audience arg in PDF branch | VERIFIED | Lines 182-183 |
| `packages/engine/src/reporting/html-template.ts` | `getEngineVersion()` | Plain footer version source (D-16) | VERIFIED | Line 700 |
| `packages/engine/src/reporting/plain-report.ts` | `report.plainLanguage` | Direct property read (no secondary lookup) | VERIFIED | `grep -n ".plainLanguage"` confirms pattern present; zero `getConvergenceRule` occurrences |
| `packages/engine/src/reporting/plain-report.ts` | `t('plain.*')` | i18n chrome strings | VERIFIED | Lines 79, 94-100, 114-117, 120, 127, 129 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `plain-report.ts` (terminal renderer) | `report.plainLanguage` | `generateRegulatoryReport` in `@holmdigital/standards` (plan 02 enrichment) | Yes — reads from `rules.sv.json`/`rules.en.json` via `getConvergenceRule` cache | FLOWING |
| `generatePlainReportHTML` (PDF template) | `report.plainLanguage` | Same enrichment path via `result.reports[].plainLanguage` | Yes — plain PDF reads the same enriched report shape | FLOWING |
| `renderPlainReport` (terminal) | `result.reports` (sorted array) | `ScanResult.reports` populated by engine scan | Yes — live scan data; fallback to `remediation.description` for unenriched rules | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: Skipped for live-scan behaviors (require running server/browser). Unit test coverage satisfies the automated verification contract for all 6 PLAIN-* requirements.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| standards 72/72 tests (D-10.1/D-10.2/D-10.3/PLAIN-02) | `npm run test:ci -w @holmdigital/standards` | `72 passed` | PASS |
| engine 138/138 tests (D-13 snapshot + plain-report D-10.4 + D-08/D-16) | `npm run test:ci -w @holmdigital/engine` | `138 passed (8 files)` | PASS |
| standards build | `npm run build -w @holmdigital/standards` | `Build success` | PASS |
| engine build | `npm run build -w @holmdigital/engine` | `Build success` | PASS |
| D-13 snapshot file exists and is non-empty | `ls __snapshots__/html-template.test.ts.snap` | `16,572 bytes, 2 named entries` | PASS |
| `generateReportHTML` signature has defaulted audience param | Source read `html-template.ts:48-55` | `audience: 'developer' \| 'plain' = 'developer'` | PASS |

---

### Probe Execution

No probe scripts declared or found (`scripts/*/tests/probe-*.sh`). Step 7c: SKIPPED (no probe scripts; verification covered by `test:ci` commands above).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PLAIN-01 | 34-01 | `PlainLanguageCopy` interface + `BusinessImpactLevel` type exported from `@holmdigital/standards`; `plainLanguage?` on both existing types (D-15) | SATISFIED | `types.ts` lines 8, 39, 132-139, 156; `index.ts` export block lines 119-120 |
| PLAIN-02 | 34-02 | `generateRegulatoryReport` enrichment with EN fallback (D-03) | SATISFIED | `index.ts` lines 282-296; PLAIN-02 describe block green |
| PLAIN-03 | 34-04 | Terminal renderer `renderPlainReport` with impact sort, badges, fallback | SATISFIED | `plain-report.ts` (130 lines); 5 D-10.4 tests green |
| PLAIN-04 | 34-05 | CLI flags `--audience`/`--plain`, D-12 precedence | SATISFIED | `cli/index.ts` lines 68-69, 101-127, 250-252 |
| PLAIN-05 | 34-05 | PDF mode via `audience` arg in `generateReportHTML` | SATISFIED | `html-template.ts` lines 48-55; D-08/D-16 tests green; D-13 snapshot byte-unchanged |
| PLAIN-06 | 34-01 | 8 Swedish texts in `rules.sv.json` against semantic ids (`alt-text`, `color-contrast`, `form-labels`, `link-purpose`, `name-role-value`, `keyboard-accessible`, `heading-order`, `language-of-page`) | SATISFIED | Python check confirmed all 8 + 2 extended rules (landmark-one-main, region) present with correct D-04 impactLevel values |

**Note on REQUIREMENTS.md orphan:** PLAIN-01 through PLAIN-06 are defined in ROADMAP.md (Phase 34 section) but are not listed in `.planning/REQUIREMENTS.md`. REQUIREMENTS.md covers v0.5–v0.7 requirement sets (STD-*, ENG-*, TC-*, PUB-* etc.) and was not updated with v0.8 plain-language requirements. This is a documentation gap in REQUIREMENTS.md, not an implementation gap. All 6 PLAIN-* requirements are implemented and verified against the ROADMAP.md definitions.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No TBD/FIXME/XXX markers found in any phase-modified file | — | — |
| — | — | No `as any` found in any new file (PUB-09 compliant) | — | — |
| — | — | No hardcoded Swedish/English label strings in `plain-report.ts` (D-01 compliant) | — | — |
| — | — | No `result.score` reference in `plain-report.ts` (D-05 compliant) | — | — |
| — | — | No `getConvergenceRule` call in `plain-report.ts` (D-03 single-lookup invariant) | — | — |

No blockers or warnings found in anti-pattern scan.

---

### Human Verification Required

#### 1. Plain Terminal Output Visual Confirmation

**Test:** Run `npx hd-a11y-scan https://johancask.com --plain`
**Expected:** Impact-sorted plain-language terminal report. Swedish locale: "Stoppar köp" items first (red bold), "Värt att putsa" last (gray). Each finding: four labeled fields in business-first order (what_happens / who_is_affected / business_impact / how_to_fix). Opening framing with no blame and no 15-40 number claim. Neutral closing with no sales CTA. No compliance score anywhere. å/ä/ö render correctly.
**Why human:** Chalk color rendering, terminal encoding of Swedish characters, and overall tone/readability cannot be verified programmatically. The D-09 delivery gate was passed ("approved" on 2026-06-12), so this is a regression check only.

#### 2. Plain PDF Layout and Content

**Test:** Run `npx hd-a11y-scan https://johancask.com --plain --pdf karin.pdf`, then open `karin.pdf`
**Expected:** Wiki-style header (real HolmDigital logo, report tagline, scanned URL as large title, scan date + engine version muted right). Impact-sorted numbered finding cards with left accent borders. Solid WCAG-AA badge chips. Five labeled plainLanguage fields per finding. Fallback framing for unenriched rules. Neutral closing. Per-page footer (every page) with URL, date, `v<engine-version>`, attribution. No score, no WCAG/DIGG tables, no legal sections. Pages 2+ have top margin (14mm).
**Why human:** PDF visual layout, per-page margin repeatability, logo rendering, badge chip colors, and confirmed absence of developer-template sections require opening the rendered PDF.

#### 3. --plain --json Precedence Confirmation (SKIP-able)

**Test:** Run `npx hd-a11y-scan https://johancask.com --plain --json`
**Expected:** JSON output (not the plain terminal report), with `plainLanguage` field visible in each matching report object.
**Why human:** D-12 precedence is unit-tested (json > light > plain); the plainLanguage enrichment is also unit-tested. This end-to-end check can be skipped if the D-09 human gate session covered it and the unit test evidence is sufficient.

---

### Scope Additions Verified (D-09 Checkpoint Feedback)

The following items exceeded the original PLAN but were added via user-directed checkpoint feedback and are fully implemented and tested:

1. **10 plainLanguage rules** (8 PLAIN-06 + `landmark-one-main` + `region`) in both sv and en — D-10 guards cover all 10
2. **Attribution + fallback framing i18n keys** (`plain.attribution`, `plain.fallback_framing`, `plain.report_tagline`) in all 9 locales
3. **Plain PDF wiki-branded header** with embedded base64 HolmDigital logo (`src/assets/logo.jpg` — already in repo)
4. **Fixed per-page footer** via `position: fixed; bottom: 0` (Chromium print repeats on every page)
5. **`@page { margin: 14mm 12mm 22mm }`** author-level CSS per-document override (developer PDF untouched)
6. **Sector-neutral copy sweep** across all 10 rules in sv + en (shopping-specific prose removed)

All scope additions are covered by the D-10 guards, D-13 snapshot test, D-08/D-16 HTML template tests, and the plain-report structure tests.

---

### Gaps Summary

No gaps found. All 17 must-have truths are VERIFIED. All 6 PLAIN-* requirements are SATISFIED. All critical design invariants hold: D-03 (single lookup, no renderer secondary lookup), D-04 (canonical impactLevel values), D-08 (developer PDF unchanged), D-12 (flag precedence), D-13 (snapshot regression lock), D-15 (both existing types extended), D-16 (engine version in footer). Test suite is 72/72 (standards) and 138/138 (engine). Zero anti-patterns.

Status is `human_needed` solely because the visual PDF layout and terminal chalk colors — already validated via the D-09 delivery gate ("approved" 2026-06-12) — are not mechanically provable from source code analysis.

---

_Verified: 2026-06-12T06:30:00Z_
_Verifier: Claude (gsd-verifier)_
