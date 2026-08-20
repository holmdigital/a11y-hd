---
"@holmdigital/standards": patch
---

Add two optional fields to `EnrichedReport` for KRAV-3 (Intern #12): `cantTell` (marks a "needs review" post carried from axe's `incomplete`, which must be excluded from stats/score/complianceStatus) and `reviewReason` (axe's `messageKey`, e.g. `bgOverlap`, so a `contrastRatio: 0` is not mistaken for zero contrast). Both are optional and additive — no change for existing consumers.
