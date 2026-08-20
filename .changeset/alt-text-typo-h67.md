---
"@holmdigital/standards": patch
---

Fix alt-text rule data (Intern #13). Two live, customer-facing corrections in all 12 language files:

- **Typo:** `remediation.codeExample` said `// Bad: Msising alt` — corrected to `Missing`. It shipped in every report on every language.
- **Missing technique:** added `H67` (null `alt` for decorative images) to `remediation.wcagTechnique`, which listed only `G94`, `G95`, `H37`. `H67` is the sufficient technique for exactly the decorative-image case the rule covers.

`rules.es.json` included — the typo and technique list were identical across all twelve files. No wording change to `remediation.description` here; that is handled separately.
