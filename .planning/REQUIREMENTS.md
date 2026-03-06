# Requirements: a11y-hd

**Defined:** 2026-03-05
**Core Value:** The type system and tests must catch bugs before users do -- no `as any` escape hatches in core paths, no silent wrong behavior.

## v0.3 Requirements

Requirements for v0.3 National Compliance. Each maps to roadmap phases.

### Standards

- [x] **STD-01**: ENFORCEMENT_BODIES map includes correct enforcement body for all 9 EU countries (SE, NO, FI, DK, DE, FR, ES, NL + IT)
- [x] **STD-02**: Each enforcement body entry uses the Full Official Name (Abbreviation) format in English

### Engine Templates

- [x] **ENG-01**: Each locale's JSON template enforcement section references the correct national enforcement body (not generic Digg)
- [ ] **ENG-02**: Each locale's JSON template references the correct national accessibility law name (BFSG, RGAA, DOS-lagen, etc.)
- [x] **ENG-03**: TLD detection extended for .de, .fr, .nl, .fi, .dk, .no, .es, .it country mapping
- [ ] **ENG-04**: Automated tests verify each locale produces the correct enforcement body and law name

### Component Templates

- [ ] **CMP-01**: Each locale's inline TEMPLATE enforcement section references the correct national enforcement body
- [ ] **CMP-02**: Each locale's inline TEMPLATE references the correct national accessibility law name
- [ ] **CMP-03**: Automated tests verify each locale's enforcement body and law name in rendered HTML

## Future Requirements

Deferred to future milestones.

### New Locales
- **LOC-01**: Italian (it) locale with full template, chrome, and tests
- **LOC-02**: Portuguese (pt) locale
- **LOC-03**: Polish (pl) locale

### SaaS Features
- **SAAS-01**: Hosted statement page with scheduled rescanning
- **SAAS-02**: CI/CD integration (GitHub Action)
- **SAAS-03**: Multi-site monitoring dashboard

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| New locale additions (it, pt, pl, etc.) | Separate milestone -- different scope (new templates, not updating existing) |
| Penalty amounts in statements | Legal risk -- amounts change and could be inaccurate |
| Complaint filing URLs/links | URLs change frequently, maintenance burden |
| Private sector vs public sector distinction | Data layer stores both WAD/EAA; CLI flag deferred to future phase |
| Native speaker validation of translations | Requires external review, not automatable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STD-01 | Phase 11 | Complete (2026-03-06) |
| STD-02 | Phase 11 | Complete (2026-03-06) |
| ENG-01 | Phase 12 | Complete |
| ENG-02 | Phase 12 | Pending |
| ENG-03 | Phase 12 | Complete |
| ENG-04 | Phase 12 | Pending |
| CMP-01 | Phase 13 | Pending |
| CMP-02 | Phase 13 | Pending |
| CMP-03 | Phase 13 | Pending |

**Coverage:**
- v0.3 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-06 after Phase 11-01 execution (STD-01, STD-02 complete)*
