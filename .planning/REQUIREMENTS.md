# Requirements: a11y-hd

**Defined:** 2026-03-04
**Core Value:** The type system and tests must catch bugs before users do — no `as any` escape hatches in core paths, no silent wrong behavior.

## v0.2 Requirements

Requirements for the Full Localization milestone. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: ESM `import.meta` warning eliminated from statement-generator build output
- [x] **FOUND-02**: Placeholder exhaustiveness test ensures all template variables are substituted for every locale

### Engine Generator i18n

- [x] **ENGI-01**: `evaluationMethod` returns locale-appropriate text for all 9 EU locales (sv, en, no, fi, da, de, fr, es, nl)
- [x] **ENGI-02**: `statusMap` returns locale-appropriate compliance status for all 9 EU locales
- [x] **ENGI-03**: HTML report date formatting uses locale-aware `Intl.DateTimeFormat` instead of sv/en binary

### Component UI Chrome

- [x] **CHRM-01**: Status badge text localized for all 9 EU locales + en-gb/en-us/en-ca
- [x] **CHRM-02**: Footer "Generated using" text localized for all 9 EU locales + en-gb/en-us/en-ca
- [x] **CHRM-03**: "Updated:" label localized for all 9 EU locales + en-gb/en-us/en-ca

### Statement Templates

- [x] **TMPL-01**: en-gb statement template with UK PSBAR 2018 legal references (engine JSON + component inline)
- [x] **TMPL-02**: en-us statement template with Section 508/ADA legal references (engine JSON + component inline)
- [x] **TMPL-03**: en-ca statement template with AODA/ACA legal references (engine JSON + component inline)
- [x] **TMPL-04**: Country detection extended for en-gb/en-us/en-ca (TLD + explicit locale)

### Verification

- [ ] **VRFY-01**: Automated tests for evaluationMethod, statusMap, and UI chrome across all 12 locales
- [ ] **VRFY-02**: Manual output review of generated statements for representative locales

## Future Requirements

### Localization Depth

- **LDEP-01**: Native speaker / regulatory expert validation of de/fr/es/fi/nl translations
- **LDEP-02**: Template rendering dedup between engine and component (accepted tech debt)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Template rendering dedup (engine vs component) | Accepted architecture decision — different dependency directions |
| Performance fixes (vDOM removal, browser reuse) | Not a localization concern |
| New React components | Separate milestone focus |
| Cloud dashboard improvements | Separate milestone focus |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 6 | Complete |
| FOUND-02 | Phase 6 | Complete |
| ENGI-01 | Phase 7 | Complete |
| ENGI-02 | Phase 7 | Complete |
| ENGI-03 | Phase 7 | Complete |
| CHRM-01 | Phase 8 | Complete |
| CHRM-02 | Phase 8 | Complete |
| CHRM-03 | Phase 8 | Complete |
| TMPL-01 | Phase 9 | Complete |
| TMPL-02 | Phase 9 | Complete |
| TMPL-03 | Phase 9 | Complete |
| TMPL-04 | Phase 9 | Complete |
| VRFY-01 | Phase 10 | Pending |
| VRFY-02 | Phase 10 | Pending |

**Coverage:**
- v0.2 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation*
