---
"@holmdigital/standards": minor
---

Intern #63 — lydelsetabellen från 2026-09-12 16:29, en ny brittisk post, och de två saknade uppslagsfunktionerna.

## Jag missade en kommentar och byggde från en äldre version

Karins team postade *"Färdiga lydelser för alla femton poster. Skriv av, du behöver inte fråga."* klockan 16:29, plus ett avgörande om `nl-eaa` och `au-dta` klockan 16:07. **Mitt bygge utgick från kommentarerna till och med 15:18.** Åtta av de femton lydelserna avvek därför från den beslutade.

Rättat nu, ordagrant efter tabellen:

| Post | Ändring |
|---|---|
| `fi-eaa.law` | `EAA-implementering` → `Lag om tillhandahållande av digitala tjänster (306/2019), 3 a kap.` Platshållaren var rätt beteende när den skrevs, men lydelsen finns nu |
| `dk-wad.law` | Vår avkortning `Lov om tilgængelighed` → hela titeln. Danska lagar har inget officiellt kortnamn, och avkortningen läste som en titel utan att vara någon |
| `dk-wad.fullName`, `dk-eaa.fullName` | LOV-citeringen tillagd |
| `es-eaa.fullName` | Hela slutledet om Ley 12/2011 var avkortat |
| `pt-eaa.fullName` | Bara beteckningen; sumário till `note` |
| `us-ada-title-iii.fullName` | Bindestreck → komma |
| `us-hhs-section-504` | Vår etikett `(HHS Final Rule)` ut ur **båda** fälten; FR-citeringarna till `note` |

Junos linje för `law`-fältet, som gör att nästa land inte behöver frågas: **officiell korttitel när utgivaren publicerar en, annars hela titeln. Vi hittar aldrig på en förkortning och kortar aldrig en titel på egen hand.**

## Ny post: `gb-eqa2010`

Brittisk privat sektor fick tidigare fallback-frasen, och jag rapporterade det som korrekt beteende. **Det var fel** — Juno hade levererat ett färdigt block för Equality Act 2010 s. 29, belagt mot primärkälla.

Två förbehåll hon själv reste följer med i postens `note`: `effectiveDate` är lagens allmänna ikraftträdande och inte specifikt för s. 29, och `minAmount`/`maxAmount` är 0/0 därför att lagen saknar lagfäst tak — samma platshållarmönster som sexton andra poster, som `getMaxSanction` numera hoppar över.

## `findNationalLaw(id)` och `getAllNationalLaws()`

Punkt 4 i issuens ursprungsanalys, ospecad sedan dess och aldrig byggd. `getNationalLaw(id, country = 'SE')` defaultar till Sverige, så `getNationalLaw('de-bfsg')` returnerar **`null` i stället för ett fel** — en validering skriven som "finns lagrummet" underkänner varje utländsk rad, tyst.

`findNationalLaw(id)` tar inget land och kan därför inte glömma det; landet följer med i svaret. `getAllNationalLaws()` ger hela mängden med land påhängt. Båda additiva, därav minor. Ett test låser att id är unika över alla länder, annars är uppslag på id meningslöst.

## Ett test jag själv skrev låste in en defekt

Spärren mot tankstreck hade en regressionsvakt som krävde `fi-eaa.law === 'EAA-implementering'`. Den var rätt när jag skrev den och blev fel samma dag lydelsen levererades — den som byggde rättelsen fick rött i sviten.

**Fjärde gången i det här repot ett test kodifierade felet det skulle skydda mot, och första gången jag skrev det själv.** Raden är vänd: den låser nu att **ingen** platshållare står i ett namnfält, vilket är den invariant som faktiskt ska hålla.
