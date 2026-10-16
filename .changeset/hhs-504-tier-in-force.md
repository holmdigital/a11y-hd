---
"@holmdigital/standards": minor
---

HHS Section 504 (`us-hhs-section-504`) is now marked `inForce: true` with `effectiveDate: "2024-07-08"`, the date the revised HHS Section 504 regulations took effect. The WCAG 2.1 AA dates stay in `complianceDeadlines` (15+ employees: 2027-05-11, fewer than 15: 2028-05-10) and are no longer read as a whole-entry flag. Use the new `isComplianceTierInForce(law, tier, today?)` to check whether a tier's WCAG deadline has passed. `true` only means that the date has passed, not that the requirement applies to whoever uses the package: 45 CFR Part 84 applies only to recipients of federal financial assistance from HHS (45 CFR 84.2(a)). The WCAG citation changes from 45 CFR 84.85 to 84.84(b).
