---
"@holmdigital/standards": patch
---

Fix HHS Section 504 type contract, framework metadata gaps, and EAA inForce drift (post-2.5.0 review)

**Type contract fix (was a published-API break in 2.5.0)**
- Widen `NationalLaw.complianceDeadlines` to a discriminated union covering both `populationThreshold` (ADA Title II) and `employeeThreshold` (HHS Section 504). The 2.5.0 entry shipped `employeeThreshold` against a type that only declared `populationThreshold`, leaving downstream TypeScript consumers with `undefined` where the type promised `number`. New `ComplianceDeadlineEntry` type is exported.
- Stop excluding `**/*.test.ts` from `tsc` so this class of defect is caught at build time. Updated existing tests to narrow on the new discriminant.

**Framework metadata symmetry**
- Add `REHAB` (Rehabilitation Act of 1973 / Section 504) and `DDA` (Disability Discrimination Act 1992) entries to `frameworks.json`. Previously `getLegalFramework('REHAB')` and `getLegalFramework('DDA')` were callable per the union type but returned `null` because the data file had no entries.

**inForce semantics correction**
- HHS Section 504 entry is now `inForce: true` with `effectiveDate: "2024-07-08"` (when the HHS Final Rule took effect). The previous `inForce: false` was incorrect — Section 504 obligations are active; only the WCAG 2.1 AA technical benchmark is staged on `complianceDeadlines.largeEntity.deadline` (2026-05-11).
- Same drift fix applied to four EAA private-sector entries (SE/lptt, FI/fi-eaa, DE/de-bfsg, NL/nl-eaa) which carried `inForce: false` despite `effectiveDate: "2025-06-28"` having passed almost a year ago.

**Convergence rules tagging**
- Add `"REHAB"` to the `legalContext.appliesTo` array of all 46 WCAG 2.1 A/AA convergence rules across 12 locale files (552 changes). `getRulesByFramework('REHAB')` now returns the same coverage set as ADA Title II/III. Level AAA rules are excluded (Section 504 does not mandate AAA).

**EAA microbusiness exemption metadata**
- New `MicrobusinessExemption` type and `NationalLaw.exemptions.microbusiness` field. Encodes the EAA Article 4(5) exemption: services-providing microenterprises with fewer than 10 employees AND annual turnover or balance sheet at or below 2 million EUR are exempt from accessibility requirements. Both conditions must be met cumulatively. Applied to all 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL).

**Schema validation**
- New `schema/national-laws-schema.json` (JSON Schema Draft-07) for structural validation of `national-laws.json`. Vitest now validates the data file against the schema on every run via `ajv`.

**Test coverage additions**
- Date-driven `inForce` assertion across all 16 supported countries replaces the brittle entity-ID exclusion filter. Catches future drift like the EAA inForce gap.
- Direct coverage of the public framework API: `getNationalLawByFramework('REHAB', 'US')`, `getLegalFramework('REHAB')`, `getLegalFramework('DDA')`, `getRulesByFramework('REHAB')`.
- Regression guard: filtering `euFramework === 'ADA' && scope === 'private'` returns only Title III, not the new Section 504 entry.
- New tests asserting microbusiness exemption presence and EAA-mandated thresholds across all 7 EAA private-sector entries.
- Schema validation test fails the suite if any future law entry violates the structural contract.
