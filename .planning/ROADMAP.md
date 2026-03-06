# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- ✅ **v0.2 Full Localization** — Phases 6-10 (shipped 2026-03-05)
- ✅ **v0.3 National Compliance** — Phases 11-13 (shipped 2026-03-06)
- 🚧 **v0.4 Locale Expansion + EAA Sector** — Phases 14-17 (in progress)

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

### 🚧 v0.4 Locale Expansion + EAA Sector (In Progress)

**Milestone Goal:** Add Italian, Portuguese, and Polish locale support (engine templates, component templates, chrome strings, tests) and wire the `--sector private` CLI flag to generate EAA-compliant accessibility statements.

- [ ] **Phase 14: Locale Standards Data** — PT and PL Country type entries + WAD/EAA enforcement bodies; IT/PT/PL national laws
- [ ] **Phase 15: New Locale Engine Templates** — it/pt/pl JSON templates + TLD .pt/.pl + engine locale tests
- [ ] **Phase 16: New Locale Component Templates** — it/pt/pl inline TEMPLATES + chrome strings + component locale tests
- [ ] **Phase 17: EAA Sector Support** — `--sector` CLI flag wired to enforcement body + law selection + EAA tests

## Phase Details

### Phase 14: Locale Standards Data
**Goal**: The standards package contains complete, authoritative data for Italian, Portuguese, and Polish — Country type entries, WAD and EAA enforcement bodies, and national law records — so engine and component packages can reference them without hardcoding.
**Depends on**: Phase 13 (v0.3 complete)
**Requirements**: STD-03, STD-04
**Success Criteria** (what must be TRUE):
  1. `Country` type in `packages/standards/src/types.ts` includes `PT` and `PL` as valid values
  2. `ENFORCEMENT_BODIES` and `ENFORCEMENT_BODIES_DETAILED` in `packages/standards/src/index.ts` have entries for PT and PL with both WAD and EAA enforcement body names
  3. `getEnforcementBody('PT', 'private')` and `getEnforcementBody('PL', 'private')` return the correct EAA body names
  4. `national-laws.json` contains WAD and EAA entries for IT, PT, and PL with correct `.law` and `.fullName` fields
  5. `getNationalLawByFramework('EAA', 'IT')`, `getNationalLawByFramework('EAA', 'PT')`, `getNationalLawByFramework('EAA', 'PL')` each return a non-null result
**Plans**: 1 plan
Plans:
- [ ] 14-01-PLAN.md — Expand Country type, add PT/PL enforcement bodies, add IT/PT/PL national laws, add tests

### Phase 15: New Locale Engine Templates
**Goal**: The engine generates correct, localized accessibility statements for Italian, Portuguese, and Polish locales — with the right enforcement body and national law referenced — and TLD detection routes `.pt` and `.pl` domains to the correct country.
**Depends on**: Phase 14
**Requirements**: ENG-05, ENG-06, ENG-08 (locale tests)
**Success Criteria** (what must be TRUE):
  1. Engine JSON templates exist for `it`, `pt`, and `pl` locales in `packages/engine/src/reporting/templates/`
  2. Each template uses `{<enforcement_body>}` and `{<national_law>}` placeholders (no hardcoded law names)
  3. `TLD_MAP` in `statement-generator.ts` maps `.pt` to `PT` and `.pl` to `PL`
  4. A report generated for a `.pt` domain produces a Portuguese statement referencing the correct PT enforcement body and law
  5. Automated tests confirm correct enforcement body and national law output for it, pt, and pl locales
**Plans**: TBD

### Phase 16: New Locale Component Templates
**Goal**: The `AccessibilityStatement` React component renders correct, localized statements for Italian, Portuguese, and Polish — with the correct enforcement body, national law, and UI chrome (badge labels, footer text) displayed in each locale.
**Depends on**: Phase 14
**Requirements**: CMP-04, CMP-05, CMP-06
**Success Criteria** (what must be TRUE):
  1. `AccessibilityStatement.tsx` TEMPLATES object includes `it`, `pt`, and `pl` inline templates using `{<enforcement_body>}` and `{<national_law>}` placeholders
  2. `locale-chrome.ts` contains badge labels, updated label, and footer text for `it`, `pt`, and `pl`
  3. Rendering `<AccessibilityStatement locale="it" />` produces HTML containing the Italian enforcement body name and IT national law name
  4. Rendering `<AccessibilityStatement locale="pt" />` and `<AccessibilityStatement locale="pl" />` each produce HTML with their respective enforcement body and law name
  5. Automated component tests verify rendered HTML for all three new locales with zero placeholder leakage (`{<` strings must not appear in output)
**Plans**: TBD

### Phase 17: EAA Sector Support
**Goal**: Passing `--sector private` to the CLI produces an accessibility statement that references the EAA enforcement body and law instead of the WAD equivalents — fully data-driven, using the existing `getEnforcementBody(country, sector)` and `getNationalLawByFramework('EAA', country)` helpers.
**Depends on**: Phase 15 (engine templates in place)
**Requirements**: ENG-07, ENG-08 (EAA tests)
**Success Criteria** (what must be TRUE):
  1. The CLI (`hd-a11y-scan`) accepts a `--sector` flag with values `public` and `private`
  2. When `--sector private` is passed, the generated statement calls `getEnforcementBody(country, 'private')` and resolves the EAA enforcement body name
  3. When `--sector private` is passed, the generated statement calls `getNationalLawByFramework('EAA', country)` and resolves the EAA law name
  4. Automated tests confirm that EAA sector output differs from WAD output (different enforcement body and law names) for at least two countries
**Plans**: TBD

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
| 14. Locale Standards Data | v0.4 | 0/1 | Not started | - |
| 15. New Locale Engine Templates | v0.4 | 0/? | Not started | - |
| 16. New Locale Component Templates | v0.4 | 0/? | Not started | - |
| 17. EAA Sector Support | v0.4 | 0/? | Not started | - |
