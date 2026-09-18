---
"@holmdigital/standards": patch
---

Intern #70 — ta bort obelagda sanktionsbelopp ur `de-bitv` och ur README.

De två delar av #70 som inte väntar på Junos utredning av `de-bfsg`s belopp eller på MAJOR-schemat. Ingen schemaändring, och ingenting av det renderas.

**`de-bitv.sanctions` borttagen.** Posten bar ett tak på 500 000 EUR och exempeltexten *"Böter upp till 500 000 EUR för allvarliga brott mot EAA"* — en EAA-sanktion hängd på en **WAD-förordning**. Enligt Bevakning#7 har BITV 2.0 noll träffar på `Bußgeld`, `Geldbuße`, `Ordnungswidrig` och `Sanktion`. Fältet är valfritt sedan 4.0.0 och fyra poster saknar det redan (`dk-eaa`, `fr-eaa`, `es-eaa`, `pt-eaa`), så mönstret är etablerat: utelämnat i stället för gissat. Skälet ligger i postens `note`.

Verifierat före borttaget att **ingen kod i motorn eller komponenten läser `.sanctions`** — varken `getSanctions` eller `getMaxSanction` anropas därifrån — så det kan inte ändra något kunddokument. Standards-sviten: 362 gröna, oförändrat.

**Sanktionstabellen dragen ur README.** Den publicerade en maxsanktion per land, och flera var fel: `100k PLN` för Polen (motbevisad — art. 73 ust. 1 ger en formel, inte ett belopp: det största av tio genomsnittliga månadslöner eller 10 % av föregående års omsättning), `Up to 5% of turnover` för Italien utan de villkor som gäller, `500k EUR` för Tyskland på en rad som parade BITV 2.0 med BFSG, och `44k EUR` för Portugal. Även de två kodexemplen som publicerade `maxAmount: 10000000` och `amount: 500000` i löptext är rensade — de missas lätt eftersom de står utanför tabellen.

Ersatt med en landlista utan beloppskolumn och en förklaring av **varför** kolumnen inte kan finnas: en sanktion är inte ett tal per land. En lag kan ange ett spann, en formel i stället för ett belopp, en art utan belopp, ingen egen sanktion alls, eller inget tak. Att platta till det i en cell gav siffror vår egen data inte stöder. Belopp läses via `getSanctions()`, som ger `undefined` där inget är belagt — och frånvaro betyder "inte belagt mot primärkälla", aldrig "ingen sanktion finns".

Avsnittet innehåller efter ändringen noll beloppsliknande strängar, maskinellt kontrollerat.
