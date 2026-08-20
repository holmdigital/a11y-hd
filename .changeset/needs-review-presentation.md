---
"@holmdigital/engine": minor
---

Present "needs review" (KRAV-3 `cantTell`, Intern #12) as a distinct category across every reporter — the follow-up promised by the engine data-model change. Items axe-core could not decide are surfaced separately and are never mixed into the violation lists or counts:

- **CLI dashboard & light output:** category scores, legal-risk heuristics and the "Top Violations" list are computed from real violations only; a new "Needs review" section lists the `cantTell` items, and the light output/JSON keep them out of `topIssues` (the count rides on `stats.needsReview`).
- **HTML (developer & plain-language):** violations and the impact breakdown exclude `cantTell`; a separate, low-alarm "needs review" section renders them. A page whose only finding is "needs review" no longer claims "0 issues".
- **JUnit:** `cantTell` becomes `<skipped>` (and a `skipped=` count), never `<failure>`.
- **GitHub Actions:** `cantTell` is annotated as `::notice`, never `::error`/`::warning`, so it can never fail a build.
- **Cloud payload:** violations exclude `cantTell`; new `needs_review` and `needs_review_count` fields carry them separately.
- **Accessibility statement:** the legal non-compliance list excludes `cantTell` (a "could not determine" is not a declared failure).

New localised strings (`plain.needs_review_*`, `report.needs_review_*`) added for all nine locales.
