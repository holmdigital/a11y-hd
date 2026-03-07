---
phase: 15-new-locale-engine-templates
plan: 01
subsystem: engine
tags: [locale, templates, italian, portuguese, polish, tld-map, substitutions, tests]
dependency_graph:
  requires: [14-01]
  provides: [it.json, pt.json, pl.json, TLD_MAP-PT-PL, substitutions-carenze-deficiencias-braki]
  affects: [engine-statement-generator, engine-tests, phase-16-component-templates]
tech_stack:
  added: []
  patterns: [auto-syncing-tests, locale-json-template, choice-block, conditional-block]
key_files:
  created:
    - packages/engine/src/reporting/templates/it.json
    - packages/engine/src/reporting/templates/pt.json
    - packages/engine/src/reporting/templates/pl.json
  modified:
    - packages/engine/src/reporting/statement-generator.ts
    - packages/engine/src/reporting/statement-generator.test.ts
    - packages/standards/dist/index.js (rebuilt to expose PT/PL in Country type)
    - packages/standards/dist/index.mjs
    - packages/standards/dist/index.d.ts
    - packages/standards/dist/index.d.mts
decisions:
  - "Standards dist rebuilt during Task 1 (Rule 3 auto-fix) — Country type in dist did not include PT/PL causing tsc errors"
  - "Italian, Portuguese, Polish templates use shared placeholder names throughout (organisation, e-mail address, telephone number, response time, assessment date, publish date, update date, method, third party, enforcement_body, national_law)"
  - "Locale-specific issues placeholders: {<carenze>} for Italian, {<deficiências>} for Portuguese, {<braki>} for Polish"
  - "TLD_MAP: 'pt' -> 'PT', 'pl' -> 'PL' added; '.it' was already mapped"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-07"
  tasks_completed: 2
  files_created: 3
  files_modified: 5
---

# Phase 15 Plan 01: New Locale Engine Templates Summary

One-liner: Italian, Portuguese, and Polish engine JSON templates with TLD routing, locale maps, locale-specific issues substitutions, and 11 new auto-syncing tests (95 → 106).

## What Was Built

### Three New JSON Templates

Each template follows the 6-section schema (`how-accessible`, `what-to-do`, `reporting`, `enforcement`, `technical`, `testing`) and uses:
- `{ A / B / C }` choice blocks in `how-accessible` and `technical` sections
- `[ ... ]` conditional blocks for response time and telephone number in `what-to-do`
- `{<enforcement_body>}` and `{<national_law>}` in the enforcement section (no hardcoded names)
- Locale-specific issues placeholder in the `what-to-do` conditional block

| Locale | File | Issues placeholder |
|--------|------|--------------------|
| Italian | `it.json` | `{<carenze>}` |
| Portuguese | `pt.json` | `{<deficiências>}` |
| Polish | `pl.json` | `{<braki>}` |

### statement-generator.ts Changes

| Map | Keys added |
|-----|-----------|
| `TLD_MAP` | `'pt': 'PT'`, `'pl': 'PL'` |
| `EVALUATION_METHOD` | `it`, `pt`, `pl` |
| `STATUS_LABELS` | `it`, `pt`, `pl` |
| `RESPONSE_TIME_DEFAULT` | `it`, `pt`, `pl` |
| substitutions table | `{<carenze>}`, `{<deficiências>}`, `{<braki>}` |
| `processText` conditional | `{<carenze>}`, `{<deficiências>}`, `{<braki>}` alongside existing issues keys |

### Native-Language Strings

**EVALUATION_METHOD:**
- `it`: `'Scansione automatizzata tramite @holmdigital/engine'`
- `pt`: `'Verificação automatizada via @holmdigital/engine'`
- `pl`: `'Automatyczne skanowanie za pomocą @holmdigital/engine'`

**STATUS_LABELS:**
- `it`: `{ full: 'Pienamente conforme', partial: 'Parzialmente conforme', 'non-compliant': 'Non conforme' }`
- `pt`: `{ full: 'Totalmente conforme', partial: 'Parcialmente conforme', 'non-compliant': 'Não conforme' }`
- `pl`: `{ full: 'W pełni zgodny', partial: 'Częściowo zgodny', 'non-compliant': 'Niezgodny' }`

**RESPONSE_TIME_DEFAULT:**
- `it`: `'2 giorni'`, `pt`: `'2 dias'`, `pl`: `'2 dni'`

### New Tests (Task 2)

Appended to `statement-generator.test.ts`:

1. `describe('TLD detection — pt and pl')` — 2 tests
   - `.pt` TLD resolves to PT enforcement body (auto-syncing)
   - `.pl` TLD resolves to PL enforcement body (auto-syncing)

2. `describe('New locale enforcement body and national law verification (it/pt/pl)')` — 6 tests via `it.each`
   - Enforcement body for it/IT, pt/PT, pl/PL (auto-syncing via `getEnforcementBody`)
   - National law for it/IT, pt/PT, pl/PL (auto-syncing via `getNationalLawByFramework`)

3. Template file count assertion updated from 12 to 15, `arrayContaining` extended with `'it'`, `'pl'`, `'pt'`

## Test Count

| Metric | Before | After |
|--------|--------|-------|
| statement-generator.test.ts | 63 | 74 |
| Engine total | 95 | 106 |
| Delta | — | +11 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt standards dist to include PT/PL Country type**
- **Found during:** Task 1 — TypeScript compile
- **Issue:** `tsc --noEmit` failed with `Type '"PT"' is not assignable to type 'Country'` because the installed dist of `@holmdigital/standards` had not been rebuilt after 14-01 added PT/PL to the `Country` union in source
- **Fix:** Ran `npm run build` in `packages/standards` to regenerate dist (index.js, index.mjs, index.d.ts, index.d.mts)
- **Files modified:** `packages/standards/dist/*` (4 files)
- **Commit:** 7c81c67

## Self-Check: PASSED

Files verified:
- `packages/engine/src/reporting/templates/it.json` — FOUND
- `packages/engine/src/reporting/templates/pt.json` — FOUND
- `packages/engine/src/reporting/templates/pl.json` — FOUND
- `packages/engine/src/reporting/statement-generator.ts` — FOUND (modified)
- `packages/engine/src/reporting/statement-generator.test.ts` — FOUND (modified)

Commits verified:
- 7c81c67 — feat(15-01): add it/pt/pl engine JSON templates and update locale maps
- 41f1a1c — test(15-01): add auto-syncing tests for it/pt/pl locales

Test results: 106/106 passing.
