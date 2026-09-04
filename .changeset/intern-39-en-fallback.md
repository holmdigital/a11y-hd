---
"@holmdigital/engine": patch
---

Intern #39 — EN-9.x-taggen som `en301549Criteria`-fallback för ärligt omappade fynd.

För ett fynd utan mappning i vår databas (t.ex. `meta-viewport`, vars WCAG 1.4.4 inte finns i DB) blev `en301549Criteria` `'Unknown'` — trots att axe bär EN-referensen ordagrant i taggmängden (`EN-9.1.4.4`). Ny exporterad `en301549FromTags(tags)` parsar `EN-9.x[.x[.x]]` ur taggarna (framework-taggen `EN-301-549` matchas medvetet inte) och används som **fallback endast** i violation-vägarna (full + light) när vi annars skulle sätta `'Unknown'`.

Rör aldrig matchade fynd — regeldatan går alltid först (`report?.en301549Criteria || en301549FromTags(...) || 'Unknown'`). Best practice behåller `'N/A'`. `enrichIncompletes` (needs-review, sätter `''`, inte `'Unknown'`) lämnas orörd. Uppföljning av #27 (Mejas EN-9.x-fråga), utanför KRAV-13.

Tester: 10 i `intern-39.test.ts` (parser + omappat→EN-9.x i båda vägar + matchat behåller regeldata + saknad tagg→Unknown).
