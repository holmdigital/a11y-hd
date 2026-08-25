---
"@holmdigital/engine": patch
---

Fix: a `--sector private` accessibility statement no longer renders an empty national-law reference (Intern #31). Six countries without an EAA post in the data (NO, DK, FR, ES, GB, CA) produced sentences like "…complies with , any known accessibility issues…" — a broken clause in a document the customer hands over as their own.

The national-law logic is extracted into `resolveNationalLawReference(country, sector, lang)`, which never returns an empty string: when no naming law exists in the data it rewords the sentence to be true **without** naming a law (a localised "applicable accessibility requirements" phrase). It never invents a law and never claims an EU directive is a country's national law. Naming the actual transposition for DK/FR/ES is tracked separately (Intern #32, awaiting Juno's wording); this is the safety net that must survive even after the data is complete.

Added a test that walks all 16 countries × both sectors asserting the reference is non-empty — the test that would have caught this — plus statement-level checks for FR/GB/NO private. No data or `euFramework` values were changed.
