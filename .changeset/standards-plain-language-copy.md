---
"@holmdigital/standards": minor
---

**Plain-language copy (klarspråksläge)** (2026-06-12):

New public API for non-technical recipients — the plain-language data layer that feeds the `--plain` report mode in `@holmdigital/engine`.

**New types:**
- `BusinessImpactLevel`: `'stoppar-kop' | 'hindrar' | 'forsamrar' | 'putsning'` — business-impact severity used for sorting plain reports
- `PlainLanguageCopy`: interface with six fields (`headline`, `whatHappens`, `whoIsAffected`, `businessImpact`, `howToFix`, `impactLevel`) — plain-language copy for non-technical recipients

**New optional fields:**
- `ConvergenceRule.plainLanguage?: PlainLanguageCopy` — plain-language copy on each rule
- `RegulatoryReport.plainLanguage?: PlainLanguageCopy` — copied through by `generateRegulatoryReport`

**Data:**
- 10 Swedish plain-language texts in `rules.sv.json` (`form-labels`, `alt-text`, `name-role-value`, `keyboard-accessible`, `color-contrast`, `link-purpose`, `heading-order`, `language-of-page`, `landmark-one-main`, `region`)
- 10 English plain-language texts in `rules.en.json` (same rule set, same tone rules: you-address, business-first, no em/en dashes, no invented statistics)

**Enrichment (D-03):**
- `generateRegulatoryReport` now copies `plainLanguage` from the rule, with a silent English fallback for languages without translated texts (`lang !== 'en'` and rule missing `plainLanguage`)

**Deferred (D-02):** Real translations for de/fr/es/nl/fi/dk/no pending native editorial review. The D-03 EN fallback activates automatically for those languages until texts land.
