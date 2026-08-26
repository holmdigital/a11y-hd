---
"@holmdigital/standards": patch
---

KRAV-13 data cleanup (Intern #27, Karin's decisions 2026-08-26). Two changes:

**The seven axe best-practice rules no longer claim WCAG 1.3.1.** `region`, `heading-order`, `page-has-heading-one`, `landmark-one-main`, `landmark-unique`, `landmark-banner-is-top-level` and `landmark-no-duplicate-banner` are best-practice rules in axe with no WCAG tag — but our data labelled them 1.3.1 nivå A with a DOS-lagen reference, i.e. a legal requirement they are not. They are now reported as **"Best Practice" (no criterion)** in all twelve locale files: `wcagCriteria: "Best Practice"`, `en301549Criteria: "N/A"`, `dosLagenApplies: false`, and a per-language best-practice reference instead of a legal one (Vilma's ruling — 1.3.1 may live on as advisory text, never in the conformance field). The general 1.3.1 rule `info-and-relationships` is unchanged and remains the single, unambiguous holder of that criterion.

**Removed the dead `data/wcag-to-en301549.json`.** No runtime code reads it; it duplicated legal strings already locked in `rules.*.json` (and still carried a duplicate `audio-description`). Its assertions are dropped from `doslagen-reference.test.ts`.

Recomputed KRAV-13 outcome over axe-core 4.13.0 (105 rules): 9 exact id-match, 66 criterion-match, 23 best practice, 7 honestly unmapped, **0 silent errors**.
