---
"@holmdigital/standards": patch
---

Rätta felaktiga lagrum i `dosLagenReference` (Intern #28). Fältet pekade på fel paragraf/rättsakt i publicerad regeldata — fel hänvisning bredvid rätt kravnivå, så inga fynd eller bedömningar påverkas, bara hänvisningen. Junos godkända lydelser byggda ordagrant:

- **38 poster på DOS-lagens `§7`** (definitionen av museiföremål) → **10 §** med precisering: `Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A/AA krävs`. I `rules.sv.json` och `wcag-to-en301549.json`.
- **7 poster på `9 §`** (undantagsparagrafen, alla WCAG 1.3.1 nivå A): `rules.sv.json` → svenska 10 §-lydelsen; `rules.en/da/fi.json` och `wcag-to-en301549.json` → filens neutrala mönster `EN 301 549 V3.2.1, WCAG 2.1 Level A required`. Ingen svensk sträng ligger längre i en icke-svensk fil.
- **1 post på `100 §`** (finns inte; lagen har 23 §§) i `wcag-to-en301549.json`, posten är `audio-description` (1.2.5 AA) → `EN 301 549 V3.2.1, WCAG 2.1 Level AA required`.
- **45 spanska poster på det ersatta `UNE 139803:2012`** → `Real Decreto 1112/2018, artículos 5 y 6, mediante UNE-EN 301549:2022 (EN 301 549 V3.2.1) Anexo A, Nivel A/AA requerido`.
- **`legal/national-laws.json` `es-une`**: `law` `UNE 139803` → `Real Decreto 1112/2018`, `fullName` till full BOE-titel (`id` orört).
- **`legal/national-laws.json` italienska AgID-akter**: fel akttyp `Delibera n. 84/2026` / `n. 38/2026` → `Determinazione n. 84 del 15 maggio 2026` / `Determinazione n. 38 del 4 marzo 2026` (ren substringbytning i prosafält; sanktionsfält orörda).

Ett låstest (`doslagen-reference.test.ts`) förhindrar att strängarna glider isär igen. `de/fr/nl/no/en-gb/en-us/en-ca`, `fr-rgaa` och WCAG 2.2-posterna är orörda.
