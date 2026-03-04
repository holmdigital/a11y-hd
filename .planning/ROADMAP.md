# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- 🚧 **v0.2 Full Localization** — Phases 6-10 (in progress)

## Phases

<details>
<summary>✅ v0.1 Stability Pass (Phases 1-5) — SHIPPED 2026-03-03</summary>

- [x] Phase 1: Standards Types (2/2 plans) — completed 2026-03-02
- [x] Phase 2: Version Fix (2/2 plans) — completed 2026-03-03
- [x] Phase 3: Engine Casts (2/2 plans) — completed 2026-03-03
- [x] Phase 4: Locale Routing (1/1 plan) — completed 2026-03-03
- [x] Phase 5: Test Coverage (2/2 plans) — completed 2026-03-03

See: `.planning/milestones/v0.1-ROADMAP.md` for full details

</details>

### 🚧 v0.2 Full Localization (In Progress)

**Milestone Goal:** Expand all deferred i18n (evaluationMethod, statusMap, UI chrome) to all 9 EU locales, add en-gb/en-us/en-ca statement support, and fix ESM warning.

- [x] **Phase 6: ESM Fix and Foundation** - Fix import.meta warning and establish placeholder exhaustiveness testing
- [x] **Phase 7: Engine Generator Locale Expansion** - Expand evaluationMethod, statusMap, and date formatting to all 9 EU locales
- [ ] **Phase 8: Component UI Chrome Localization** - Expand status badges, footer, and labels from sv/en to all 12 locales
- [ ] **Phase 9: en-gb/en-us/en-ca Statement Templates** - Add jurisdiction-specific statement templates with country detection
- [ ] **Phase 10: Verification and Test Coverage** - Automated tests across all 12 locales and manual output review

## Phase Details

### Phase 6: ESM Fix and Foundation
**Goal**: Clean build output and regression baseline before any locale content changes
**Depends on**: Phase 5 (v0.1 complete)
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):
  1. Engine package builds with zero warnings in both CJS and ESM output
  2. A test verifies that every template (all 9 EU locales) has all placeholder variables substituted with no leftover `{<...>}` markers
  3. Template path resolution uses a single canonical path that throws a clear error when a template file is missing
**Plans:** 1 plan
Plans:
- [x] 06-01-PLAN.md — Fix ESM warning, simplify template path, fix placeholder mismatches, add exhaustiveness test

### Phase 7: Engine Generator Locale Expansion
**Goal**: Markdown statement output uses correct locale-specific text for all 9 EU locales
**Depends on**: Phase 6
**Requirements**: ENGI-01, ENGI-02, ENGI-03
**Success Criteria** (what must be TRUE):
  1. `evaluationMethod` returns text in the correct language for each of the 9 EU locales (sv, en, no, fi, da, de, fr, es, nl)
  2. `statusMap` returns locale-appropriate compliance status labels (compliant/partially/non-compliant) for all 9 EU locales
  3. HTML report dates are formatted using locale-aware `Intl.DateTimeFormat` instead of the binary sv/en check
  4. Markdown output for a German locale scan contains German evaluation method text and German compliance labels, not English fallbacks
**Plans:** 2 plans
Plans:
- [x] 07-01-PLAN.md — Expand evaluationMethod, statusMap, responseTime, and date formatting to 9-locale lookup maps
- [x] 07-02-PLAN.md — Add locale-specific content verification tests for all 9 EU locales

### Phase 8: Component UI Chrome Localization
**Goal**: HTML statement output shows correct locale-specific chrome (badges, footer, labels) for all supported locales
**Depends on**: Phase 6
**Requirements**: CHRM-01, CHRM-02, CHRM-03
**Success Criteria** (what must be TRUE):
  1. Status badge text displays the correct translation for each of the 12 locales (9 EU + en-gb/en-us/en-ca)
  2. "Generated using" footer text displays the correct translation for each of the 12 locales
  3. "Updated:" label displays the correct translation for each of the 12 locales
  4. A Finnish locale statement renders Finnish chrome text, not English or Swedish fallback
**Plans:** 1 plan
Plans:
- [ ] 08-01-PLAN.md — Create locale-chrome.ts lookup maps, replace sv/en ternaries, add chrome localization tests

### Phase 9: en-gb/en-us/en-ca Statement Templates
**Goal**: Legally correct accessibility statements for UK, US, and Canadian websites with jurisdiction-specific references
**Depends on**: Phase 7, Phase 8
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04
**Success Criteria** (what must be TRUE):
  1. en-gb statement references UK PSBAR 2018 and EHRC as enforcement body (both HTML and Markdown output)
  2. en-us statement references Section 508/ADA and DOJ Civil Rights Division (both HTML and Markdown output)
  3. en-ca statement references AODA/ACA and Accessibility Commissioner (both HTML and Markdown output)
  4. Country detection correctly identifies .uk/.gov.uk, .us/.gov, and .ca/.gc.ca TLDs and assigns the right enforcement body
  5. Both template pipelines (component HTML and engine Markdown) produce consistent enforcement body and legislation references for each en-* locale
**Plans:** 2 plans
Plans:
- [ ] 09-01-PLAN.md — Create en-gb/en-us/en-ca engine JSON templates, extend TLD detection, update engine locale maps and tests
- [ ] 09-02-PLAN.md — Add en-gb/en-us/en-ca component TEMPLATES entries, update supportedLocales, chrome maps, and component tests

### Phase 10: Verification and Test Coverage
**Goal**: Comprehensive automated and manual verification that all 12 locales produce correct output
**Depends on**: Phase 9
**Requirements**: VRFY-01, VRFY-02
**Success Criteria** (what must be TRUE):
  1. Automated tests cover evaluationMethod, statusMap, and UI chrome for all 12 locales
  2. Automated tests verify en-gb/en-us/en-ca routing, template rendering, and enforcement body references
  3. Manual review of generated statements for at least sv, en, en-gb, de, and fi confirms correct output
  4. Full test suite (74+ existing tests plus new locale tests) passes with zero failures
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7 -> 8 -> 9 -> 10
(Phases 7 and 8 can execute in parallel; both depend only on Phase 6)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Standards Types | v0.1 | 2/2 | Complete | 2026-03-02 |
| 2. Version Fix | v0.1 | 2/2 | Complete | 2026-03-03 |
| 3. Engine Casts | v0.1 | 2/2 | Complete | 2026-03-03 |
| 4. Locale Routing | v0.1 | 1/1 | Complete | 2026-03-03 |
| 5. Test Coverage | v0.1 | 2/2 | Complete | 2026-03-03 |
| 6. ESM Fix and Foundation | v0.2 | 1/1 | Complete | 2026-03-04 |
| 7. Engine Generator Locale Expansion | v0.2 | 2/2 | Complete | 2026-03-04 |
| 8. Component UI Chrome Localization | v0.2 | 0/1 | Not started | - |
| 9. en-gb/en-us/en-ca Statement Templates | v0.2 | 0/2 | Not started | - |
| 10. Verification and Test Coverage | v0.2 | 0/? | Not started | - |
