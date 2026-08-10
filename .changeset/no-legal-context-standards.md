---
"@holmdigital/standards": patch
---

Fix Norwegian legal context (Intern #23). Corrections to law-reference data, six of them customer-visible via generated accessibility statements:

- **Enforcement body (customer-facing):** `ENFORCEMENT_BODIES.NO` and `ENFORCEMENT_BODIES_DETAILED.NO.wad` now name the body a Norwegian reader files complaints with — `Tilsynet for universell utforming av ikt (uu-tilsynet)` — instead of the parent directorate `Digdir`. `getEnforcementBody('NO', 'public')` reads `.wad`, so this is the value that reaches a public-sector statement.
- **EAA field emptied, not guessed:** `ENFORCEMENT_BODIES_DETAILED.NO.eaa` was `Nkom` (unverified). Norway is EEA, not EU, and the EAA has not been incorporated into the EEA agreement, so no EAA enforcement body exists in Norwegian law. The field is now empty and must not be filled with an authority name until status is verified against regjeringen.no.
- **Law title:** `no-ikt.law` restored to the exact Lovdata short title `Forskrift om universell utforming av IKT-løsninger` (the `-løsninger` suffix was missing).
- **Sanction wording:** `no-ikt.sanctions` no longer calls Norwegian *tvangsmulkt* (an administrative coercive measure) Swedish *dagsböter* (a criminal penalty). Now `Löpande vite (tvangsmulkt)`.
- **Cross-jurisdiction data leak:** seven WCAG 1.3.1 rules in `rules.no.json` carried a Swedish `dosLagenReference` (`9 § (Struktur och relationer)`); replaced with the file's own EN 301 549 phrasing.
