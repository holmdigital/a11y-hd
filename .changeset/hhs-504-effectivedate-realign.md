---
"@holmdigital/standards": patch
---

HHS Section 504: realign `effectiveDate` and `inForce` to reflect the WCAG benchmark enforcement trigger, not the underlying rule's 2024 effective date. Per HHS Interim Final Rule 2026-09266 (published 2026-05-11), the WCAG 2.1 AA compliance benchmark for large entities (15+ employees) starts 2027-05-11. `us-hhs-section-504` now publishes `effectiveDate: "2027-05-11"` and `inForce: false` — the `inForce` flag will flip to true automatically when the drift-guard validates `effectiveDate <= today` on 2027-05-11. Note field expanded to document the field-semantic choice. Compliance deadlines and all other metadata unchanged.
