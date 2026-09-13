---
"@holmdigital/standards": patch
---

Intern #66 — två påståenden jag inte kan belägga, borttagna.

**`ENFORCEMENT_NO_SINGLE_AUTHORITY.PT.private` påstod ett antal.** Strängen som når kundtext sa *"nine bodies by sector"* medan kodkommentaren ovanför den räknade upp **tio** namn. Siffran kom ur underlaget jag fick — Junos text säger *"nio sektorsorgan"* och listar sedan tio — och jag byggde den troget. Artigo 28.º n.º 1 har nio *alíneas*, men alínea c) namnger två myndigheter, så *"nine bodies"* är fel medan *"nine paragraphs"* hade varit rätt.

I stället för att välja en siffra i en lagtext jag inte kan läsa är påståendet borttaget. Att namnge artikeln räcker, och det kan inte bli fel. En siffra läggs tillbaka bara med Junos lydelse.

**`dk-eaa.note` hade blivit falsk.** Den sa att `retsinformation.dk` och `sik.dk` svarar 403 Forbidden och att lagtexten därför aldrig öppnats. Båda svarade 200, och hela texten hämtades som en 422 kB PDF. Noten sa också att `enforcement` är avsiktligt frånvarande, fast fältet lades in 2026-09-11.

Att lagen faktiskt namnger kontrollmyndigheter i § 45 och en sanktions**art** i § 57 står nu i noten. **Om** fälten ska fyllas är Junos avgörande, inte en mekanisk fix — men skälet att lämna dem tomma kan inte längre vara att källan är oåtkomlig. Noten var det som motiverade tomheten, och ett test låser den, så en inaktuell not höll ett fält stängt på fel grund.

Båda fynden kommer ur en oberoende granskning av mitt eget bygge, inte ur min egen genomläsning.
