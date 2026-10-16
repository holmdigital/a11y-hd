---
'@holmdigital/engine': patch
'@holmdigital/components': patch
---

Tillgänglighetsutlåtandet: tre fel i hur mallens val `{A / B / C}` löstes. Alla tre har funnits i publicerade versioner och når kunddokument, både i CLI:ts Markdown- och HTML-utlåtanden och i komponenten på webbplatser.

**1. Utlåtandet påstod en granskning som aldrig gjorts.** Sektionen om hur webbplatsen testats har ett eget val: självskattning, extern granskning eller uppskattning utan granskning. Det valet löstes på kundens efterlevnadsutfall, precis som valet om hur väl webbplatsen uppfyller kraven.

- En kund som var **delvis förenlig** fick "HolmDigital Engine har gjort en oberoende granskning av …", alltså en extern granskning som aldrig ägde rum. Det gällde alla 16 språk.
- En kund som **inte var förenlig** fick "Vi har uppskattat tillgängligheten utan granskning", fast en automatisk granskning just hade gjorts.

Metodvalet ger nu alltid självskattning, eftersom ett verktyg som kunden själv kör är en självskattning.

**2. Lagnamn med snedstreck klövs.** Värdena byttes in i mallen innan valen löstes, och valparsern delar på "/". Ett lagnamn som "Real Decreto 1112/2018" eller "(Tillgänglighetslagen / LPTT)" delades därför mitt i. Så här blev det för svensk privat sektor:

| Kundens utfall | Före rättelsen |
|---|---|
| Förenlig | Lagnamnet klipptes av |
| Delvis förenlig | Meningen blev "LPTT)." |
| Inte förenlig | Kunden fick meningen för **delvis** förenlig |

Samma fel fanns för Spanien, Portugal, Irland, Finland, Tyskland (privat), Nederländerna (privat) och för varje organisationsnamn som innehåller "/". Värdena byts nu in först efter att valen lösts.

**3. Komponentens engelska mallar gick förbi lagvalet (bara `@holmdigital/components`).** Mallarna för en-gb, en-us och en-ca hårdkodade lagnamn, samma fel som motorns mallar rättades för i 3.3.8. Den rättelsen nådde aldrig komponenten, och CLI:ts HTML-utlåtanden renderas med komponenten. Följden var:

- Brittisk privat sektor fick regleringen för offentlig sektor.
- Amerikansk privat sektor fick Section 508, som bara gäller federala myndigheter.
- Kanada fick Ontarios AODA som landets lag.

Mallarna använder nu `{<national_law>}` som resten.

Ett komponenttest krävde att AODA skulle stå i det kanadensiska utlåtandet, och det passerade just därför att mallen gick förbi lagvalet. Testet är nu omvänt. Nya tester läser mallarna i stället för att räkna upp fraser per språk, så en ny mall omfattas automatiskt. Mot den gamla koden fäller de 37 komponenttester och alla metodtester för delvis och ej förenlig i motorn.
