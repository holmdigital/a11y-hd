# Requirements: a11y-hd

**Defined:** 2026-03-06
**Core Value:** The type system and tests must catch bugs before users do -- no `as any` escape hatches in core paths, no silent wrong behavior.

## v0.4 Requirements

Requirements for v0.4 Locale Expansion + EAA Sector. Each maps to roadmap phases.

### Standards Expansion

- [x] **STD-03**: Portugal (PT) and Poland (PL) added to Country type with WAD + EAA enforcement bodies in ENFORCEMENT_BODIES and ENFORCEMENT_BODIES_DETAILED
- [x] **STD-04**: National law data (WAD entry + EAA entry) added to national-laws.json for IT, PT, and PL

### Engine Templates

- [x] **ENG-05**: Italian (it), Portuguese (pt), Polish (pl) engine JSON templates with `{<enforcement_body>}` and `{<national_law>}` placeholders
- [x] **ENG-06**: TLD detection extended for .pt and .pl in TLD_MAP (it already mapped from v0.3)
- [ ] **ENG-07**: `--sector` CLI flag (public | private) passed through to `getEnforcementBody(country, sector)` and `getNationalLawByFramework(sector, country)` in statement generation
- [x] **ENG-08**: Automated tests verify new locale enforcement bodies + laws and EAA sector output

### Component Templates

- [x] **CMP-04**: Italian (it), Portuguese (pt), Polish (pl) inline TEMPLATES in AccessibilityStatement.tsx using `{<enforcement_body>}` and `{<national_law>}` placeholders
- [x] **CMP-05**: Chrome strings (badge labels, updated label, footer text) for it, pt, pl locales in locale-chrome.ts
- [x] **CMP-06**: Automated tests verify rendered HTML for new locales (enforcement body + law name per locale)

## Future Requirements

Deferred to future milestones.

### EAA Template Prose
- **EAA-04**: EAA-specific intro prose variants (private sector obligation framing differs from WAD) — data is correct, prose fine-tuning deferred

### New Locales
- **LOC-04**: Irish (ie) locale template — Country type + enforcement body exist, template not yet authored
- **LOC-05**: Romanian (ro) locale
- **LOC-06**: Hungarian (hu) locale
- **LOC-07**: Czech (cs) locale

### SaaS Features
- **SAAS-01**: Hosted statement page with scheduled rescanning
- **SAAS-02**: CI/CD integration (GitHub Action)
- **SAAS-03**: Multi-site monitoring dashboard

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| EAA template prose rewrite | Data-driven approach (enforcement body + law name) is sufficient for v0.4; prose fine-tuning is v0.5+ |
| Native speaker validation (it, pt, pl) | Requires external review; template prose translations are the developer's responsibility |
| Penalty amounts in EAA statements | Legal risk — amounts vary by country and change over time |
| Complaint filing URLs | URLs change frequently, maintenance burden |
| IE, RO, HU, CS locale templates | Out of v0.4 scope; deferred to future locale milestones |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STD-03 | Phase 14 | Complete |
| STD-04 | Phase 14 | Complete |
| ENG-05 | Phase 15 | Complete |
| ENG-06 | Phase 15 | Complete |
| ENG-07 | Phase 17 | Pending |
| ENG-08 | Phase 15 + 17 | Complete |
| CMP-04 | Phase 16 | Complete |
| CMP-05 | Phase 16 | Complete |
| CMP-06 | Phase 16 | Complete |

**Coverage:**
- v0.4 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 — initial v0.4 definition*
