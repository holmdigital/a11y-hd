# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- ✅ **v0.2 Full Localization** — Phases 6-10 (shipped 2026-03-05)
- ✅ **v0.3 National Compliance** — Phases 11-13 (shipped 2026-03-06)
- ✅ **v0.4 Locale Expansion + EAA Sector** — Phases 14-17 (shipped 2026-03-07)
- 🚧 **v0.5 Australia Jurisdiction** — Phases 18-21 (in progress)

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

<details>
<summary>✅ v0.2 Full Localization (Phases 6-10) — SHIPPED 2026-03-05</summary>

- [x] Phase 6: ESM Fix and Foundation (1/1 plan) — completed 2026-03-04
- [x] Phase 7: Engine Generator Locale Expansion (2/2 plans) — completed 2026-03-04
- [x] Phase 8: Component UI Chrome Localization (1/1 plan) — completed 2026-03-04
- [x] Phase 9: en-gb/en-us/en-ca Statement Templates (2/2 plans) — completed 2026-03-04
- [x] Phase 10: Verification and Test Coverage (2/2 plans) — completed 2026-03-05

See: `.planning/milestones/v0.2-ROADMAP.md` for full details

</details>

<details>
<summary>✅ v0.3 National Compliance (Phases 11-13) — SHIPPED 2026-03-06</summary>

- [x] Phase 11: Enforcement Body Data (1/1 plan) — completed 2026-03-06
- [x] Phase 12: Engine National Compliance (2/2 plans) — completed 2026-03-06
- [x] Phase 13: Component National Compliance (1/1 plan) — completed 2026-03-06

See: `.planning/milestones/v0.3-ROADMAP.md` for full details

</details>

<details>
<summary>✅ v0.4 Locale Expansion + EAA Sector (Phases 14-17) — SHIPPED 2026-03-07</summary>

- [x] Phase 14: Locale Standards Data (1/1 plan) — completed 2026-03-06
- [x] Phase 15: New Locale Engine Templates (1/1 plan) — completed 2026-03-07
- [x] Phase 16: New Locale Component Templates (1/1 plan) — completed 2026-03-07
- [x] Phase 17: EAA Sector Support (1/1 plan) — completed 2026-03-07

See: `.planning/milestones/v0.4-ROADMAP.md` for full details

</details>

### 🚧 v0.5 Australia Jurisdiction (In Progress)

**Milestone Goal:** Add Australia as a fully supported jurisdiction across all three packages — standards (DDA + DTA), components (en-au UI chrome and inline template), engine (en-au statement template + .au TLD detection), and sector-aware enforcement routing for AU. All output for Australian clients must reference DDA 1992 and AHRC, not EU law.

- [x] **Phase 18: AU Standards Foundation** - `LegalFramework` extended to `'DDA'`, `Country` extended to `'AU'`, DDA + DTA law data, AHRC enforcement bodies (completed 2026-03-28)
- [ ] **Phase 19: AU Component Locale** - `TEMPLATES['en-au']` inline template and locale-chrome entries for en-au
- [ ] **Phase 20: AU Engine Integration** - `en-au.json` statement template, `.au`/`.com.au` TLD detection, engine locale maps
- [ ] **Phase 21: AU Test Coverage** - Auto-syncing enforcement/law tests, en-au template placeholder exhaustiveness, component rendering and locale routing tests

## Phase Details

### Phase 18: AU Standards Foundation
**Goal**: The standards package contains all AU type entries and data required for downstream packages to compile — `'DDA'` in `LegalFramework`, `'AU'` in `Country`, DDA and DTA law records in `national-laws.json`, and AHRC in both enforcement body maps — committed atomically so the TypeScript build never breaks mid-update.
**Depends on**: Phase 17 (v0.4 complete)
**Requirements**: STD-01, STD-02, STD-03, STD-04
**Success Criteria** (what must be TRUE):
  1. `LegalFramework` type includes `'DDA'` as a valid value alongside `'WAD'` and `'EAA'`
  2. `Country` type includes `'AU'` and the build fails if any `Record<Country, ...>` map is missing the `'AU'` key
  3. `national-laws.json` has an `au-dda` entry (scope both, enforcer AHRC) and an `au-dta` entry (scope public, enforcer DTA)
  4. `ENFORCEMENT_BODIES['AU']` and `ENFORCEMENT_BODIES_DETAILED['AU']` are present with both `wad` and `eaa` fields pointing to AHRC
  5. `getEnforcementBody('AU', 'private')` returns AHRC (not DTA) — DDA applies to both sectors under one body
**Plans**: 1 plan
Plans:
- [ ] 18-01-PLAN.md — Extend types, add AU enforcement bodies, national law entries, and tests

### Phase 19: AU Component Locale
**Goal**: The `AccessibilityStatement` React component renders a legally accurate Australian statement for `locale="en-au"` — referencing DDA 1992 and AHRC, using complaint-based enforcement framing (not mandatory statement framing), and displaying correct AU-specific badge labels and footer text.
**Depends on**: Phase 18
**Requirements**: CMP-01, CMP-02
**Success Criteria** (what must be TRUE):
  1. `TEMPLATES['en-au']` exists in `AccessibilityStatement.tsx` and references DDA legislation and AHRC (no EU Web Accessibility Directive references)
  2. `locale-chrome.ts` contains `en-au` entries for `BADGE_LABELS`, `UPDATED_LABEL`, and `FOOTER_TEXT`
  3. Rendering `<AccessibilityStatement locale="en-au" />` produces HTML with DDA and AHRC text and zero placeholder leakage (`{<` must not appear in output)
**Plans**: 1 plan
Plans:
- [ ] 18-01-PLAN.md — Extend types, add AU enforcement bodies, national law entries, and tests

### Phase 20: AU Engine Integration
**Goal**: The engine automatically detects Australian domains via `.au` and `.com.au` TLD matching, routes them to the `en-au` locale, and generates a legally accurate accessibility statement referencing DDA 1992, AHRC, and WCAG 2.2 AA — with correct evaluationMethod and statusMap entries for the en-au locale.
**Depends on**: Phase 19
**Requirements**: ENG-01, ENG-02, ENG-03
**Success Criteria** (what must be TRUE):
  1. `TLD_MAP` maps `'au'` to `'AU'` and the existing `hostname.split('.').pop()` parser correctly routes `.au`, `.com.au`, and `.gov.au` domains to country `AU`
  2. `en-au.json` statement template exists in `packages/engine/src/reporting/templates/` with DDA-specific prose, voluntary framing, and AHRC complaint pathway — no "disproportionate burden" or mandatory statement language from EU/UK templates
  3. Engine locale maps (`evaluationMethod`, `statusMap`, locale routing) include `en-au` entries
  4. The risk-level display label for `en-au` reads "Risk level" (not "DIGG Risk") in CLI output
**Plans**: 1 plan
Plans:
- [ ] 18-01-PLAN.md — Extend types, add AU enforcement bodies, national law entries, and tests

### Phase 21: AU Test Coverage
**Goal**: The test suite verifies all AU additions end-to-end — enforcement body routing, national law retrieval, TLD detection, statement template placeholder exhaustiveness, and component rendering — using the auto-syncing pattern so tests call standards functions directly and do not hardcode law or enforcement body names.
**Depends on**: Phase 20
**Requirements**: TST-01, TST-02, TST-03
**Success Criteria** (what must be TRUE):
  1. Tests assert `getEnforcementBody('AU')` and `getEnforcementBody('AU', 'private')` both return AHRC using the auto-syncing pattern (no hardcoded strings)
  2. Tests assert `getNationalLawByFramework('DDA', 'AU')` returns a non-null result with correct `.law` and `.fullName` fields
  3. en-au engine template placeholder exhaustiveness tests confirm every `{<placeholder>}` is substituted and no placeholder leakage occurs in generated output
  4. Component tests confirm `<AccessibilityStatement locale="en-au" />` renders AU-specific content and all 225 pre-existing tests continue to pass
**Plans**: 1 plan
Plans:
- [ ] 18-01-PLAN.md — Extend types, add AU enforcement bodies, national law entries, and tests

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Standards Types | v0.1 | 2/2 | Complete | 2026-03-02 |
| 2. Version Fix | v0.1 | 2/2 | Complete | 2026-03-03 |
| 3. Engine Casts | v0.1 | 2/2 | Complete | 2026-03-03 |
| 4. Locale Routing | v0.1 | 1/1 | Complete | 2026-03-03 |
| 5. Test Coverage | v0.1 | 2/2 | Complete | 2026-03-03 |
| 6. ESM Fix and Foundation | v0.2 | 1/1 | Complete | 2026-03-04 |
| 7. Engine Generator Locale Expansion | v0.2 | 2/2 | Complete | 2026-03-04 |
| 8. Component UI Chrome Localization | v0.2 | 1/1 | Complete | 2026-03-04 |
| 9. en-gb/en-us/en-ca Statement Templates | v0.2 | 2/2 | Complete | 2026-03-04 |
| 10. Verification and Test Coverage | v0.2 | 2/2 | Complete | 2026-03-05 |
| 11. Enforcement Body Data | v0.3 | 1/1 | Complete | 2026-03-06 |
| 12. Engine National Compliance | v0.3 | 2/2 | Complete | 2026-03-06 |
| 13. Component National Compliance | v0.3 | 1/1 | Complete | 2026-03-06 |
| 14. Locale Standards Data | v0.4 | 1/1 | Complete | 2026-03-06 |
| 15. New Locale Engine Templates | v0.4 | 1/1 | Complete | 2026-03-07 |
| 16. New Locale Component Templates | v0.4 | 1/1 | Complete | 2026-03-07 |
| 17. EAA Sector Support | v0.4 | 1/1 | Complete | 2026-03-07 |
| 18. AU Standards Foundation | 1/1 | Complete   | 2026-03-28 | - |
| 19. AU Component Locale | v0.5 | 0/TBD | Not started | - |
| 20. AU Engine Integration | v0.5 | 0/TBD | Not started | - |
| 21. AU Test Coverage | v0.5 | 0/TBD | Not started | - |
