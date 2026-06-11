---
phase: 34-klarsprak-plain-language-report
plan: "03"
subsystem: engine/i18n
tags: [i18n, plain-language, locale, atomic]
dependency_graph:
  requires: []
  provides: [plain.* i18n namespace in all 9 engine locale files]
  affects: [plan-04 (terminal renderer), plan-05 (PDF template)]
tech_stack:
  added: []
  patterns: [LocaleData = typeof en exhaustiveness, atomic 9-file locale update]
key_files:
  created: []
  modified:
    - packages/engine/src/locales/en.json
    - packages/engine/src/locales/sv.json
    - packages/engine/src/locales/de.json
    - packages/engine/src/locales/fr.json
    - packages/engine/src/locales/es.json
    - packages/engine/src/locales/nl.json
    - packages/engine/src/locales/fi.json
    - packages/engine/src/locales/dk.json
    - packages/engine/src/locales/no.json
decisions:
  - "plain.* namespace added to all 9 locale files in one atomic commit (D-14 compliance)"
  - "en/sv carry real translations; de/fr/es/nl/fi/dk/no carry English verbatim (D-01)"
  - "Swedish badge values use raw UTF-8: Stoppar köp, Hindrar kunder, Försämrar upplevelsen, Värt att putsa"
  - "D-06 satisfied: closing is a neutral priority line with no sales CTA"
  - "D-07 satisfied: sv intro_framing has no 15/40 number claim and no 'vi skannar'"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-11T20:46:43Z"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 9
---

# Phase 34 Plan 03: Plain-Language i18n Chrome Namespace Summary

Plain-language i18n chrome namespace added to all 9 engine locale files in a single atomic commit, with real English and Swedish translations and English verbatim values for the 7 deferred locales.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add plain.* namespace to ALL 9 locale files (D-14) | 0e2fc2e | en/sv/de/fr/es/nl/fi/dk/no locale JSON files |

## What Was Built

The `plain` namespace (16 keys) was added to all 9 engine locale files simultaneously in one atomic pass per the D-14 constraint. The `LocaleData = typeof en` type chain in `packages/engine/src/i18n/index.ts` means any partial update would have caused `typecheck` and `check:types` to fail.

### Key set (identical across all 9 files)

`what_happens`, `who_is_affected`, `business_impact`, `how_to_fix`, `badge_stoppar_kop`, `badge_hindrar`, `badge_forsamrar`, `badge_putsning`, `intro_framing`, `sorted_by`, `intro_found`, `intro_unit_singular`, `intro_unit_plural`, `closing`, `empty_state`, `report_title`

### en.json (real English chrome)

- Field labels: "What happens:", "Who is affected:", "What it costs you:", "How to fix it:"
- Badges: "Blocks purchases", "Excludes customers", "Degrades experience", "Worth polishing"
- Opening: no-blame framing without the stripped 15/40 number claim
- Closing: neutral priority line, no sales CTA
- Empty state: "No barriers found this time."

### sv.json (real Swedish chrome, raw UTF-8)

- Field labels: "Vad som händer:", "Vem det drabbar:", "Vad det kostar:", "Så fixar du:"
- Badges: "Stoppar köp", "Hindrar kunder", "Försämrar upplevelsen", "Värt att putsa"
- Opening: "Det betyder inte att du gjort något fel. De flesta som bygger en webbplats får aldrig veta att tillgänglighet ens är en sak. Nu vet du..."
- Closing: "Börja uppifrån. Punkterna högst upp kostar dig mest kunder."
- Empty state: "Vi hittade inga hinder den här gången."

### de/fr/es/nl/fi/dk/no (English values verbatim)

All 7 carry the same values as en.json per D-01. Real translations deferred until native-speaker review.

## Verification Results

All acceptance criteria satisfied:

- `npm run typecheck -w @holmdigital/engine`: exit 0
- `npm run verify -w @holmdigital/engine`: exit 0 (build + lint zero warnings + typecheck + check:exports + check:types + test:ci)
- `npm run test:ci -w @holmdigital/engine`: 123 tests / 6 files, all passing
- All 9 files contain a top-level "plain" object with identical 16-key set
- `sv.plain.badge_stoppar_kop === "Stoppar köp"` and `sv.plain.badge_forsamrar === "Försämrar upplevelsen"` (raw UTF-8 confirmed)
- All 7 mirror files' `badge_stoppar_kop === "Blocks purchases"` (English verbatim)
- D-07: `sv.plain.intro_framing` contains no "15" and no "vi skannar"
- Tone rule: zero em/en dashes (`—`/`–`) in any `plain.*` value in any of the 9 files
- `intro_found` contains both `{count}` and `{unit}` interpolation placeholders

## Deviations from Plan

None. Plan executed exactly as written.

The single-task D-14 constraint was met: all 9 files were written before any verification command was run.

## Known Stubs

None. All values are real draft chrome per tone rules; no hardcoded placeholders.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. Changes are static locale JSON strings only (T-34-04 encoding threat mitigated by Write-tool-only approach; T-34-05 mitigated by D-07 compliance; T-34-11 mitigated by D-14 atomic-task execution). No new threat surface introduced.

## Self-Check

Checking created/modified files exist:

- packages/engine/src/locales/en.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/sv.json: FOUND (modified, contains "plain" with å/ä/ö)
- packages/engine/src/locales/de.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/fr.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/es.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/nl.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/fi.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/dk.json: FOUND (modified, contains "plain")
- packages/engine/src/locales/no.json: FOUND (modified, contains "plain")

Checking commit exists: 0e2fc2e

## Self-Check: PASSED
