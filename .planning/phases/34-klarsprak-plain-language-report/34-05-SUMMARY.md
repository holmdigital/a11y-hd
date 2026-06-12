---
phase: 34-klarsprak-plain-language-report
plan: "05"
subsystem: engine/cli + engine/reporting + standards/data
tags: [plain-language, cli-flags, plain-pdf, d-08, d-09, d-12, d-13, d-16, sector-neutral, fixed-footer, logo]
dependency_graph:
  requires: [34-02 (plainLanguage enrichment data), 34-04 (renderPlainReport + D-13 snapshot baseline)]
  provides: [--plain / --audience CLI flags, plain-language PDF (generateReportHTML audience param), D-09-approved design + copy, two release changesets]
  affects: [Version Packages release PR (standards 2.7.0, engine 2.6.0)]
tech_stack:
  added: []
  patterns: [defaulted param for byte-stable API extension, author-level @page overriding pdf() margins per-document, position:fixed print-repeating footer, base64 data-URI asset embedding via copy-assets pipeline, dynamic import in CLI branch]
key_files:
  created:
    - .changeset/standards-plain-language-copy.md
    - .changeset/engine-plain-report.md
  modified:
    - packages/engine/src/cli/index.ts (--audience/--plain flags, merge+cast, D-12 print branch, plain PDF branch)
    - packages/engine/src/reporting/html-template.ts (audience param + generatePlainReportHTML, four design rounds)
    - packages/engine/src/reporting/html-template.test.ts (D-08/D-16 + H1/H2/I structural assertions)
    - packages/engine/src/reporting/plain-report.ts (attribution + fallback framing in terminal renderer)
    - packages/engine/src/reporting/plain-report.test.ts (attribution/fallback assertions)
    - packages/engine/src/locales/en.json (plain.attribution, plain.fallback_framing, plain.report_tagline)
    - packages/engine/src/locales/sv.json (same keys, Swedish values)
    - packages/engine/src/locales/de.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/fr.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/es.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/nl.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/fi.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/dk.json (same keys, English-valued per D-02)
    - packages/engine/src/locales/no.json (same keys, English-valued per D-02)
    - packages/standards/data/rules.sv.json (landmark-one-main + region plainLanguage; sector-neutral sweep)
    - packages/standards/data/rules.en.json (landmark-one-main + region plainLanguage; sector-neutral sweep)
    - packages/standards/src/index.test.ts (D-10 guard coverage for the new rules)
decisions:
  - "Plain PDF carries its own @page rule (14mm 12mm 22mm): author-level CSS overrides the zero margins passed to Puppeteer's pdf() per-document, so the developer PDF keeps its full-bleed layout untouched"
  - "Per-page footer via position:fixed bottom:0 — Chromium print-to-PDF repeats fixed elements on every page; old in-flow footer removed to avoid doubling on the last page; @page bottom margin reserves the space"
  - "Real HolmDigital logo embedded as base64 data URI: src/assets/logo.jpg (already in-repo, byte-identical to wiki.holmdigital.se/logo.jpg) read module-relative via the existing copy-assets.mjs pipeline (dist/assets + dist/cli/assets), cached after first read, '' fallback never crashes generation"
  - "Impact badge chips are solid-background with white text — WCAG AA verified: #b91c1c 7.5:1, #c2410c 5.6:1, #a16207 4.6:1, #475569 5.9:1"
  - "Sector-neutral copy across all 10 plainLanguage rules in sv+en: besokare/visitors replaces shopping-specific prose; business-first cost tone kept (Karin lock); impactLevel values + badge labels untouched per D-04"
  - "plain.report_tagline i18n key added to all 9 locales (en/sv real, other 7 English-valued per D-02) because LocaleData structural typing requires key parity"
metrics:
  duration: "multi-session, 2026-06-11 -> 2026-06-12, 4 D-09 review rounds"
  completed: "2026-06-12T04:08:42Z"
  tasks_completed: 13
  tasks_total: 13
  files_changed: 19
---

# Phase 34 Plan 05: CLI Flags + Plain PDF + D-09 Delivery Gate Summary

--plain/--audience CLI flags and the plain-language PDF shipped through four D-09 review rounds (attribution + missing rules, visual design with wiki palette, sector-neutral copy, per-page margins, light wiki header with the real logo, fixed per-page footer); Karin/Daniel approved terminal + PDF for johancask.com; developer PDF byte-identical throughout (D-13 snapshot never updated).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1+2 | --audience/--plain flags, D-12 print branch, plain PDF branch, plain HTML template + D-08/D-16 tests | 945bd47 | cli/index.ts, html-template.ts, html-template.test.ts |
| 3 | Two minor changesets (standards 2.7.0, engine 2.6.0) | aa05346 | .changeset/standards-plain-language-copy.md, .changeset/engine-plain-report.md |
| A | Attribution + fallback framing i18n, terminal renderer parity | 743e6b2 | plain-report.ts, plain-report.test.ts, 9 locale files |
| B | landmark-one-main + region plainLanguage blocks (sv+en) | b183305 | rules.sv.json, rules.en.json, standards index.test.ts |
| C+D | Plain PDF fallback framing, attribution footer, page-break CSS | 86354d6 | html-template.ts |
| E | Visual design pass: finding cards, WCAG AA badge chips, typographic hierarchy | df8c423 | html-template.ts |
| F | Sector-neutral copy sweep, all 10 plainLanguage rules en+sv | 316a080 | rules.en.json, rules.sv.json |
| G | @page per-page margins (14mm/12mm), inter-card air | 0162cf0 | html-template.ts |
| H | Light wiki-style header + fixed per-page footer, plain.report_tagline key | 653729d | html-template.ts, html-template.test.ts, 9 locale files |
| I | Real HolmDigital logo embedded as base64 data URI | 62905a6 | html-template.ts, html-template.test.ts |
| 4 | D-09 delivery gate: johancask.com terminal + PDF approved | (checkpoint, no commit) | — |

## What Was Built

### CLI wiring (Tasks 1+2)

`hd-a11y-scan <url> --plain` (or `--audience plain`) renders the plain-language terminal report; default stays `developer`. The D-12 precedence holds: the plain branch sits after the `json` and `light` branches and before the dashboard else — `--plain --json` yields JSON, `--plain --light` yields light output. The PDF branch passes `'plain'` as the third argument to `generateReportHTML` only when audience is plain; the two-arg developer call path is untouched.

### Plain PDF template (Tasks 2, C-I — final state)

`generateReportHTML(result, sector, audience = 'developer')` returns `generatePlainReportHTML(result)` when audience is `'plain'`; the defaulted param keeps every existing two-arg caller compiling and the developer HTML byte-identical (D-13 proof). The plain document, after four review rounds:

- **Header (page 1, in-flow):** white wiki-style band with a 3px #0369a1 accent line, the real HolmDigital logotype embedded as a `data:image/jpeg;base64` URI (160px, alt "Holm Digital logotyp"), localized tagline beneath, scanned URL as the large dark title, scan date + engine version muted right.
- **Body:** impact-sorted finding cards (same levelOf/IMPACT_ORDER logic as the terminal renderer) with left accent borders per severity, solid WCAG-AA badge chips, five labeled plainLanguage fields, fallback framing (`plain.fallback_framing`) before `remediation.description` when plainLanguage is absent, neutral closing.
- **Per-page layout:** `@page { margin: 14mm 12mm 22mm }` gives every printed page top whitespace and reserves the footer strip; `break-inside: avoid` keeps cards atomic.
- **Footer (every page):** `position: fixed; bottom: 0` repeats in Chromium print-to-PDF — URL, formatted date, `v` + `getEngineVersion()` (D-16: `__ENGINE_VERSION__` from engine package.json), and the attribution line. Exactly one footer element in the document.
- **Excluded by design (D-08):** no score, no WCAG/EN 301 549 tables, no DIGG/legal sections. `result.url` and all dynamic strings HTML-escaped (T-34-08).

### Standards copy (Tasks B, F)

`landmark-one-main` and `region` gained full plainLanguage blocks in sv+en (10 rules total). The sector-neutral sweep removed every assumption that the scanned site sells things: "alla som handlar pa mobilen" -> "alla som besoker sidan pa mobilen", "Lagg i varukorg" -> "sidans viktigaste knapp", checkout/varukorgar -> neutral conversion framing, "skip to the product or checkout area" -> "skip straight to the main content", "cannot find the product" -> "cannot find what they came for". The business-first cost tone (Karin team lock) and the four D-04 badge labels/impactLevel values are unchanged.

### Release artifacts (Task 3)

Two minor changesets: `@holmdigital/standards` (PlainLanguageCopy/BusinessImpactLevel API, 16 plain texts, EN fallback; de/fr/es/nl/fi/dk/no translations deferred per D-02) and `@holmdigital/engine` (renderPlainReport, --plain/--audience flags, plain PDF mode, plain.* chrome in 9 locales, D-13 snapshot guard). Components untouched — no changeset. npm publish was NOT run; release goes through the Version Packages PR per D-09.

## D-09 Delivery Gate

Round-trip with the product owner (Daniel) over four review rounds on the johancask.com scan:

1. **Round 1:** attribution line missing, fallback framing wording, landmark/region rules lacked plainLanguage -> Tasks A-D.
2. **Round 2:** "PDF ser ganska b ut" + copy presumed e-commerce -> Tasks E-F.
3. **Round 3:** pages 2+ started flush at the page edge ("ingen luft ovanfor, bara inklamt") -> Task G; then header should match the real wiki (light, not navy) + "fast fot pa varje sida" -> Task H.
4. **Round 4:** replace the CSS monogram with the real logo -> Task I.

Final response: **"approved"** — Karin/Daniel signed off on tone, copy, and layout for both the plain terminal output and karin.pdf. The Version Packages PR merge remains the release gate.

## Deviations from Plan

### Checkpoint-feedback scope additions (user-directed, Tasks A-I)

The original plan had 3 automated tasks + 1 checkpoint. The D-09 gate produced four feedback rounds adding nine tasks (A-I, eight commits). All stayed inside plan-owned surfaces (plain template, plain copy, plain i18n chrome); the developer template, pdf-generator.ts, and the D-13 snapshot were never touched.

### Auto-fixed Issues

**1. [Rule 1 - Bug] Container padding does not survive page breaks (Task G)**
- **Found during**: Round-3 review (screenshot of karin.pdf page 2)
- **Issue**: The plain template relied on element padding for page margins; padding applies to the element, not the page, so pages 2+ started flush against the page edge.
- **Fix**: Author-level `@page { margin: 14mm 12mm }` (later 22mm bottom for the fixed footer) — overrides the `margin: 0` passed to Puppeteer's `pdf()` for this document only; the developer PDF keeps its own `@page { margin: 0 }` full-bleed behavior.
- **Files modified**: packages/engine/src/reporting/html-template.ts
- **Commit**: 0162cf0

**2. [Discovery] Logo already in the repository (Task I)**
- **Found during**: Task I implementation
- **Issue**: The instruction provided a downloaded copy of wiki.holmdigital.se/logo.jpg to embed; checking the engine first revealed `src/assets/logo.jpg` already committed (912480e) and byte-identical (same md5) to the wiki file, already shipped to `dist/assets` + `dist/cli/assets` by `copy-assets.mjs`.
- **Fix**: No new asset added — `getLogoDataUri()` reads the existing asset module-relative (`__dirname/assets` in dist, `__dirname/../assets` in src), mirroring the statement-generator resolution pattern.
- **Files modified**: packages/engine/src/reporting/html-template.ts
- **Commit**: 62905a6

**3. [Rule 2 - Scope completeness] Sector-neutral sweep wider than the cited examples (Task F)**
- **Found during**: Task F audit of all plainLanguage blocks
- **Issue**: Beyond the color-contrast example in the feedback, shopping assumptions existed in keyboard-accessible, alt-text, form-labels, link-purpose ("Se hela vinterkollektionen"), heading-order, landmark-one-main, and region — in both languages.
- **Fix**: All 10 rules x 2 languages swept; cost-focused tone preserved; D-04 badge labels and impactLevel values untouched.
- **Files modified**: packages/standards/data/rules.en.json, packages/standards/data/rules.sv.json
- **Commit**: 316a080

## Verification Results

- `npm run verify -w @holmdigital/engine`: **exit 0** — build + lint (zero warnings) + typecheck + check:exports + check:types + test:ci, **138/138 tests** (8 files)
- `npm run verify -w @holmdigital/standards`: **exit 0** — **72/72 tests**
- **D-13**: `__snapshots__/html-template.test.ts.snap` content-diff empty against the plan-04 baseline after every round — the developer PDF HTML is byte-for-byte unchanged; snapshot never regenerated
- **D-16**: plain footer version assertion green (footer contains engine package.json version via `getEngineVersion()`)
- **D-12**: precedence assertions green (--plain --json -> JSON, --plain --light -> light)
- **D-10 guards**: encoding (a-ring/a-uml/o-uml intact), tone lint (no em-dashes in rules data), sv/en parity green after Tasks B/F
- `npx changeset status`: standards minor + engine minor pending; components absent
- **D-09**: human gate satisfied — "approved" (2026-06-12)

## Known Stubs

None. The plain PDF renders live `plainLanguage` data (plan 02 enrichment) with the D-10.4 remediation fallback for unenriched rules; the 7 non-en/sv locale values for plain chrome are English-valued by design (D-02 deferral), not stubs.

## Threat Surface Scan

No new network endpoints, auth paths, or dependencies. The logo embed reads a repo-internal asset at generation time (no network fetch — T-34-SC unchanged). Threat register dispositions hold:
- **T-34-08**: result.url and all dynamic strings escaped before interpolation into the plain template
- **T-34-09**: no score/WCAG/legal content in generatePlainReportHTML (asserted by tests)
- **T-34-12**: D-13 snapshot passed without update after every template edit
- **T-34-13**: footer version sourced from getEngineVersion() only; test asserts equality with engine package.json
- **T-34-10**: npm publish never executed; release gated on the Version Packages PR

## Self-Check

Checking created files exist:
- .changeset/standards-plain-language-copy.md: FOUND
- .changeset/engine-plain-report.md: FOUND
- .planning/phases/34-klarsprak-plain-language-report/34-05-SUMMARY.md: FOUND (this file)

Checking commits exist (git log):
- 945bd47 (Tasks 1+2): FOUND
- aa05346 (Task 3): FOUND
- 743e6b2 (Task A): FOUND
- b183305 (Task B): FOUND
- 86354d6 (Tasks C+D): FOUND
- df8c423 (Task E): FOUND
- 316a080 (Task F): FOUND
- 0162cf0 (Task G): FOUND
- 653729d (Task H): FOUND
- 62905a6 (Task I): FOUND

## Self-Check: PASSED
