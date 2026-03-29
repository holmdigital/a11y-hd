# Requirements: a11y-hd

**Defined:** 2026-03-27
**Core Value:** The type system and tests must catch bugs before users do -- no `as any` escape hatches in core paths, no silent wrong behavior.

## v0.5 Requirements

Requirements for v0.5 Australia Jurisdiction. Each maps to roadmap phases.

### Standards

- [x] **STD-01**: `LegalFramework` type extended with `'DDA'` as third value alongside `'WAD'` and `'EAA'`
- [x] **STD-02**: `Country` type extended with `'AU'` — triggers compile-time completeness across all `Record<Country, ...>` maps
- [x] **STD-03**: `national-laws.json` has `au-dda` entry (scope: both, enforcer: AHRC) and `au-dta` entry (scope: public, enforcer: DTA)
- [x] **STD-04**: `ENFORCEMENT_BODIES['AU']` and `ENFORCEMENT_BODIES_DETAILED['AU']` both route to AHRC for WAD and EAA keys

### Engine

- [x] **ENG-01**: `en-au.json` statement template with DDA-specific prose, voluntary framing, and AHRC complaint pathway
- [x] **ENG-02**: `TLD_MAP` includes `'au': 'AU'` — detects .au, .com.au, .gov.au domains
- [x] **ENG-03**: Engine locale maps (evaluationMethod, statusMap, locale routing) include `en-au` entries

### Components

- [x] **CMP-01**: `TEMPLATES['en-au']` inline template in AccessibilityStatement with AU-specific legislation references
- [x] **CMP-02**: locale-chrome.ts includes en-au entries for BADGE_LABELS, UPDATED_LABEL, FOOTER_TEXT

### Testing

- [x] **TST-01**: AU enforcement body and national law assertions using auto-syncing test pattern
- [x] **TST-02**: en-au engine template placeholder exhaustiveness tests
- [x] **TST-03**: en-au component template rendering and locale routing tests

## Future Requirements

Deferred to future milestones.

### AU Enhancements
- **AU-01**: DTA Digital Experience Policy annotation for `.gov.au` domains
- **AU-02**: AS EN 301 549 procurement reference for state government clients
- **AU-03**: AHRC complaint pathway URL in statement contact section

### EAA Template Prose
- **EAA-04**: EAA-specific intro prose variants (private sector obligation framing differs from WAD)

### New Locales
- **LOC-04**: Irish (ie) locale template
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
| State/territory-level AU policy annotations | No state-specific TLDs; requires explicit metadata beyond TLD detection |
| Mobile app compliance notes for AU | AHRC 2025 scope expansion; requires architecture outside web scanning |
| WCAG 2.2 vs 2.1 delta highlighting | Complexity not justified for v0.5 |
| Native speaker validation of en-au prose | Requires external review |
| Penalty amounts in AU statements | DDA enforcement is complaint/court-driven with no fixed fine cap |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STD-01 | Phase 18 | Complete |
| STD-02 | Phase 18 | Complete |
| STD-03 | Phase 18 | Complete |
| STD-04 | Phase 18 | Complete |
| ENG-01 | Phase 20 | Complete |
| ENG-02 | Phase 20 | Complete |
| ENG-03 | Phase 20 | Complete |
| CMP-01 | Phase 19 | Complete |
| CMP-02 | Phase 19 | Complete |
| TST-01 | Phase 21 | Complete |
| TST-02 | Phase 21 | Complete |
| TST-03 | Phase 21 | Complete |

**Coverage:**
- v0.5 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 — traceability updated after v0.5 roadmap creation (phases 18-21)*
