---
"@holmdigital/standards": minor
"@holmdigital/engine": minor
---

Add ADA Title II and Title III support for US accessibility compliance

**Background:** DOJ's final rule (28 CFR Part 35, published 2024-04-24) requires
state and local governments to meet WCAG 2.1 Level AA by 2026-04-24 (entities
serving 50,000+ population) or 2027-04-24 (smaller entities).

**@holmdigital/standards:**
- New `LegalFramework` value: `'ADA'`
- Two new US laws in `national-laws.json`: `us-ada-title-ii` (public sector) and
  `us-ada-title-iii` (private sector)
- New DOJ authority id `us-doj`
- New optional `NationalLaw.complianceDeadlines` field (Title II: 2026-04-24 /
  2027-04-24)
- ADA framework added to `frameworks.json` with WCAG 2.1 AA
- 46 convergence rules across all 12 rule-locale files now tagged with `"ADA"`
  in `legalContext.appliesTo`
- Fixed inconsistency: `ENFORCEMENT_BODIES_DETAILED.US.wad` is now
  `'General Services Administration (GSA)'` to align with the Section 508
  enforcement entry. `.eaa` remains DOJ. `ENFORCEMENT_BODIES.US` unchanged (DOJ).
- New statement tool: ITIC VPAT template (`itic-vpat`)

**@holmdigital/engine:**
- Statement generator is now sector-aware for US: `--country US --sector public`
  references ADA Title II + Section 508 with DOJ as enforcement body;
  `--sector private` references ADA Title III with DOJ as enforcement body
- en-us.json template's intro and enforcement sections now use
  `{<national_law>}` placeholder for dynamic law resolution

**Migration:** No breaking changes. Consumers using
`getNationalLawByFramework('WAD', 'US')` still receive Section 508.
