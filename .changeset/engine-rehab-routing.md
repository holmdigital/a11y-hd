---
"@holmdigital/engine": patch
---

Add HHS Section 504 (REHAB framework) routing for US private-sector statements

`statement-generator.ts` now references both ADA Title III and Section 504 (HHS Final Rule) when rendering accessibility statements with `--country US --sector private`. Healthcare and HHS-funded private organisations (hospitals, FQHCs, research institutions, health plans) previously got a statement that omitted their primary obligation under 45 C.F.R. Part 84.

Output format mirrors the existing US public-sector pattern (ADA Title II + Section 508):

> Americans with Disabilities Act Title III (ADA Title III) & Section 504 of the Rehabilitation Act of 1973 (Section 504 (HHS Final Rule))

Requires `@holmdigital/standards@2.5.1` for the Section 504 entry and the `'REHAB'` framework value.
