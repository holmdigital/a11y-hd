---
"@holmdigital/standards": minor
---

**Canada federal ACA + France RGAA authority correction** (Juno 2026-06-05 lagbevakning):

1. **New: Accessible Canada Act (`ca-aca`)** — Adds the Canadian federal accessibility framework that was missing entirely. Previously only `ca-aoda` (Ontario provincial) was encoded. Canadian users now resolve the federal layer via `getNationalLawByFramework('ACA', 'CA')`.
   - Law: Accessible Canada Act (S.C. 2019, c. 10) + Accessible Canada Regulations (SOR/2021-241), ICT amendments in force **2025-12-05**
   - Technical standard: **CAN/ASC-EN 301 549:2024** (WCAG 2.1 Level AA)
   - Primary authority: Accessibility Commissioner (Canadian Human Rights Commission)
   - Sector authorities: CRTC (broadcasting + telecom), Canadian Transportation Agency (federally-regulated transport)
   - Compliance deadlines: federal public sector **2027-12-05**, federally-regulated private sector **2028-12-05**
   - Sanctions: up to **250 000 CAD per violation** via administrative monetary penalties (ACA Part 6)
   - Scope: `both` (covers both federal public and federally-regulated private)

2. **New `LegalFramework` value: `'ACA'`** — added to the union type and registered in `frameworks.json`. `getLegalFramework('ACA')` now returns metadata. This is the MINOR-bump driver (new type union member).

3. **Schema updated** — `national-laws-schema.json` `euFramework` enum extended with `"ACA"`.

4. **Fix: France RGAA authority** — `fr-rgaa.enforcement.authorityName` corrected from `'Arcom'` to `'DINUM (Direction interministérielle du numérique)'`. DINUM is the current supervisory authority for RGAA 4.1.2; Arcom only takes over when RGAA 5 publishes (expected late 2026). Previous Arcom designation pre-empted a not-yet-effective transition. `ENFORCEMENT_BODIES.FR` and `ENFORCEMENT_BODIES_DETAILED.FR.wad` updated to match. A new `note` on the `fr-rgaa` entry documents the upcoming RGAA 5 transition (WCAG 2.2 + mobile + documents + Arcom authority).

5. **Regression tests added** — `getEnforcementBody('FR')` must NOT return Arcom; `fr-rgaa.enforcement.authorityName` must contain DINUM. CA federal layer is asserted with explicit deadlines and `ACA` framework resolution.

**Items intentionally NOT changed this release** (per Juno's 2026-06-05 spec, deferred for separate triggers):
- SE: DIGG + PTS → Digitaliseringsmyndigheten (effective 2027-01-01) — wait for autumn 2026 proposition.
- EU: EN 301 549 V4.1.x — do not switch until OJEU citation, not just ETSI publication.

**Sources verified:** Canadian Human Rights Commission, Government of Canada accessible-canada regulations summary, numerique.gouv.fr, DesignGouv RGAA 5 article.
