---
"@holmdigital/standards": minor
---

HHS Section 504 (`us-hhs-section-504`) is now marked `inForce: true` with `effectiveDate: "2024-07-08"`, the date the basic rule took effect. The WCAG 2.1 AA dates stay in `complianceDeadlines` (15+ employees: 2027-05-11, fewer than 15: 2028-05-10) and are no longer read as a whole-entry flag. Use the new `isComplianceTierInForce(law, tier, today?)` to check whether a tier's WCAG deadline has passed. The WCAG citation changes from 45 CFR 84.85 to 84.84(b).
