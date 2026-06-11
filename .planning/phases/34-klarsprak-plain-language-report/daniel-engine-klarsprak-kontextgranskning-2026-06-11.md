# Engine: Klarspråksrapport (fas 34), kontextgranskning

**Datum:** 2026-06-11
**Från:** KarinsTeam (Amanda, teknisk verifiering av Meja)
**Gäller:** `34-CONTEXT.md` (planeringskontext för `--plain`-läget i hd-a11y-scan)
**Status:** Kontexten är verifierad mot koden och håller. Redo för planering. Fyra tillägg rekommenderas innan exekvering.

---

## Sammanfattning

Vi har gått igenom hela planeringskontexten för klarspråksläget och verifierat varje tekniskt påstående mot den faktiska koden i `a11y-hd` (synkad 2026-06-11). Allt stämmer. Arkitekturbesluten är korrekta, och den största buggrisken i fasen är redan upptäckt och hanterad i underlaget.

Vår dom: kör igång bygget enligt kontexten, men lägg in de fyra punkterna under "Att lägga till" i planen så att exekveringen inte snubblar på dem.

---

## Vad vi verifierade mot koden (allt bekräftat)

| Påstående i kontexten | Resultat |
|---|---|
| 9 locale-filer, `LocaleData = typeof en` | Bekräftat: de, dk, en, es, fi, fr, nl, no, sv |
| `generateReportHTML(result, sector)` tar 2 argument, anropas på rad 174 i cli/index.ts | Bekräftat, behöver tredje `audience`-argument |
| CLI-grenkedjan json/light och sist else-dashboard | Bekräftat: rad 203/218/220/240. Plain-grenen ska in före rad 240 |
| Semantiskt regel-id är `alt-text`, inte `image-alt` | Bekräftat: `image-alt` finns inte i datan. CLI-exemplet i underlaget hade fel id |
| Alla 8 regel-id finns i rules.sv.json | Bekräftat |
| `impactLevel` och `plainLanguage` finns inte redan i koden | Bekräftat: 0 träffar, allt är additivt |

### Det viktigaste fyndet (kontexten får rätt)

`generateRegulatoryReport` (standards/src/index.ts rad 274) **spreadar inte** regeln. Den plockar tio fält explicit och returnerar dem. Det betyder att `plainLanguage` och `impactLevel` tyst försvinner om de inte kopieras in för hand i just det returobjektet, med EN-fallbacken (D-03). Detta är den enskilt största buggrisken i fasen, och kontexten fångar den exakt. Missa inte den raden vid exekvering.

### D-04-tabellen stämmer mot datan

Vi kollade faktiska `diggRisk`-värden mot den föreslagna härledningsregeln (critical→stoppar-kop, high→hindrar, medium→forsamrar, low→putsning):

| ruleId | diggRisk i datan | härledning hade gett | redaktionell nivå (explicit) | stämmer? |
|---|---|---|---|---|
| form-labels | high | hindrar | stoppar-kop | nej |
| alt-text | high | hindrar | hindrar | ja |
| name-role-value | critical | stoppar-kop | hindrar | nej |
| keyboard-accessible | critical | stoppar-kop | hindrar | nej |
| color-contrast | high | hindrar | forsamrar | nej |
| link-purpose | medium | forsamrar | forsamrar | ja |
| heading-order | medium | forsamrar | putsning | nej |
| language-of-page | high | hindrar | putsning | nej |

Härledning hade gett fel nivå för 6 av 8 regler. Beslutet att sätta explicit `impactLevel` på alla 8 är alltså korrekt, inte överarbete. Behåll härledningen som fallback för framtida regler utan explicit nivå.

---

## Styrkor i upplägget

- Bakåtkompatibiliteten är vattentät: `developer` förblir default, JSON är additivt (D-11), developer-PDF:en lämnas orörd (D-08).
- Fallback-kedjan (sv, sedan en, sedan remediation.description) ligger i rätt lager. All degradering sker vid enrichment i standards. Renderaren gör aldrig en andra uppslagning. Ren arkitektur.
- Tonreglerna är mekaniserade till tester (D-10), inte bara önskemål: encoding-vakt mot mojibake och lint mot tankstreck.

---

## Att lägga till innan exekvering (fyra punkter)

1. **Snapshot-test som låser developer-PDF:en.** D-08 lovar att utvecklar-PDF:en är oförändrad byte för byte, men ingen av de fyra vakterna i D-10 bevisar det. En `audience`-param är precis där en regression kan smyga in. Lägg ett snapshot-test på `generateReportHTML(result, sector)` utan tredje argument.

2. **Typkedjan är det sköraste steget, inte texterna.** Eftersom `LocaleData = typeof en` ändras typen i samma sekund nya nycklar läggs i en.json, och alla 8 övriga locale-filer måste få samma nycklar annars failar `check:types` (kör i `prepublishOnly`). Här går bygget sönder, inte på å/ä/ö. Lägg chrome-nycklarna i alla 9 filer samtidigt, som en egen uppgift.

3. **Utöka två befintliga typer explicit.** Förutom den nya PlainLanguageCopy-datatypen måste `RegulatoryReport`-typen och `ConvergenceRule`-typen få det optionella `plainLanguage`-fältet, annars kompilerar inte enrichment. Trivialt i koden, lätt att missa i planen.

4. **Säkra PDF-fotnotens versionskälla.** D-08 nämner verktygsversion i sidfoten. Bekräfta att den läser rätt package.json i monorepot, annars blir fotnoten missvisande.

Inget av detta ändrar besluten i kontexten. Det är fyra rader att foga in i planen.

---

## Nästa steg

1. Planering av fas 34 med de fyra punkterna inlagda som uppgifter.
2. Bygg enligt kontexten (Meja + Ebba).
3. Leveransgrind: testskanning av johancask.com med `--plain --pdf`, Karin granskar svenska och engelska texterna.
4. Minor-release av standards + engine via changesets efter Karins godkännande (Version Packages-PR-mergen är grinden).
