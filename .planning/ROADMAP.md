# Roadmap: a11y-hd

## Milestones

- ✅ **v0.1 Stability Pass** — Phases 1-5 (shipped 2026-03-03)
- ✅ **v0.2 Full Localization** — Phases 6-10 (shipped 2026-03-05)
- 🚧 **v0.3 National Compliance** — Phases 11-13 (in progress)

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

### 🚧 v0.3 National Compliance (In Progress)

**Milestone Goal:** Country-specific enforcement bodies and national law references in all EU locale templates

- [x] **Phase 11: Enforcement Body Data** - Expand ENFORCEMENT_BODIES map with all EU country entries, WAD/EAA dual storage, and getEnforcementBody() helper
- [x] **Phase 12: Engine National Compliance** - Update engine JSON templates with country-specific enforcement bodies, law names, and TLD detection (completed 2026-03-06)
- [ ] **Phase 13: Component National Compliance** - Update component inline TEMPLATES with country-specific enforcement bodies, law names, and verification tests

## Phase Details

### Phase 11: Enforcement Body Data
**Goal**: Every EU country in the system has its correct national enforcement body available as upstream data
**Depends on**: Phase 10 (v0.2 complete)
**Requirements**: STD-01, STD-02
**Success Criteria** (what must be TRUE):
  1. ENFORCEMENT_BODIES map contains entries for all 9 EU countries: SE, NO, FI, DK, DE, FR, ES, NL, IT
  2. Each entry uses Full Official Name (Abbreviation) format in English (e.g., "Federal Network Agency (Bundesnetzagentur)")
  3. Non-EU entries (GB, US, CA) remain unchanged. SE and EU entries updated to English per CONTEXT.md Decision 5
  4. TypeScript compiles with no errors after map expansion
**Plans**: 1 plan

Plans:
- [x] 11-01-PLAN.md — Expand enforcement bodies with IT, WAD/EAA dual storage, and getEnforcementBody() helper

### Phase 12: Engine National Compliance
**Goal**: Every engine-generated statement references the correct national enforcement body and law for its locale
**Depends on**: Phase 11
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04
**Success Criteria** (what must be TRUE):
  1. Each locale's JSON template enforcement section names the correct national enforcement body (not generic Digg or EU fallback)
  2. Each locale's JSON template references the correct national accessibility law (BFSG for de, RGAA for fr, DOS-lagen for sv, etc.)
  3. TLD detection maps .de, .fr, .nl, .fi, .dk, .no, .es, .it to their correct country codes
  4. Automated tests verify every locale produces the correct enforcement body name in generated output
  5. Automated tests verify every locale produces the correct national law name in generated output
**Plans**: TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

### Phase 13: Component National Compliance
**Goal**: Every component-rendered accessibility statement references the correct national enforcement body and law for its locale
**Depends on**: Phase 11
**Requirements**: CMP-01, CMP-02, CMP-03
**Success Criteria** (what must be TRUE):
  1. Each locale's inline TEMPLATE enforcement section names the correct national enforcement body (matching Phase 12 values)
  2. Each locale's inline TEMPLATE references the correct national accessibility law name (matching Phase 12 values)
  3. Automated tests verify each locale's rendered HTML contains the correct enforcement body name
  4. Automated tests verify each locale's rendered HTML contains the correct national law name
**Plans**: TBD

Plans:
- [ ] 13-01: TBD
- [ ] 13-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13
(Phases 12 and 13 both depend on Phase 11 but are ordered sequentially to avoid merge conflicts in shared test patterns)

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
| 11. Enforcement Body Data | v0.3 | Complete    | 2026-03-06 | 2026-03-06 |
| 12. Engine National Compliance | 2/2 | Complete   | 2026-03-06 | - |
| 13. Component National Compliance | v0.3 | 0/? | Not started | - |
