---
"@holmdigital/engine": minor
---

Carry axe-core's `incomplete` results forward (KRAV-3, Intern #12). Until now the engine read only `violations` and `passes` and dropped `incomplete` entirely — checks axe could not decide (for example a contrast node whose background is overlapped) vanished from the report: not flagged, not passed, not "review". A reader asking "do we have a contrast problem?" got an answer that never mentioned the element.

The engine now reads `incomplete` and carries each item into `ScanResult.reports` marked `cantTell` ("needs review" to the user). Marked posts are **excluded from `stats` (`total`, `critical`/`high`/`medium`/`low`), `score`, `complianceStatus` and `legalSummary`** — they are surfaced, never counted as failures. A new informational `stats.needsReview` counts them.

The reason is read from axe's `messageKey`/`message`, not from `contrastRatio`: in the `bgOverlap` case `contrastRatio` is `0`, which means "could not be determined", not "zero contrast" (Intern #20). The carried post therefore reports the real reason and never a fabricated measurement.

Reporter/CLI presentation of "needs review" as a distinct section is a follow-up; this change is the engine data model.
