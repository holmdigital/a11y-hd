# @holmdigital/standards

## 5.2.0

### Minor Changes

- c155bc0: WCAG 2.5.3 Label in Name, och axe-core 4.14.

  axe-core 4.14 slår på regeln `label-content-name-mismatch` som standard. Den saknade mappning i standards, och referenskörningen (Intern #25, 2026-11-10) visade vad det gav: fyndet räknades in i score (scb 87 → 82, jo 100 → 95, apotea 65 → 60), men rapporten visade kriteriet "Unknown", engelsk text och inga felnoder.

  **standards:** ny regel `label-in-name` (WCAG 2.5.3, nivå A, WCAG 2.1, EN 301 549 9.2.5.3) i alla 12 språkfiler.
  - Lagrumstexten och `legalContext` är desamma som för 2.1.4 i varje språkfil, eftersom båda är WCAG 2.1 nivå A och ingår i EN 301 549 V3.2.1. Testerna räknar därför 22 nivå A-regler, inte 21, och 39 lagkrav, inte 38.
  - Klarspråk finns på svenska och engelska (`impactLevel: hindrar`).

  **engine:**
  - **Omappade fynd har nu sina felnoder.** Förut räknades fyndet in i score, men noderna saknades.
  - **Kriteriet för omappade fynd** tas ur axes `wcagNNN`-taggar, lägsta först, som light-läget redan gör. "Unknown" blir det bara när taggen saknas.
  - **axe-core** ^4.13.0 → ^4.14.0, html-validate 11.16.0 → 11.18.0, chalk ^6.0.1 och ws ^8.22.1 (ersätter Dependabot #255).

## 5.1.0

### Minor Changes

- aed787c: Intern #146: lagdata kontrollerad mot primärkälla. nl-eaa och pt-wad är rättade, och en dold dubbelparentes i lagfrasen är borta.

  **Data (`national-laws.json`)**
  - **nl-eaa:** det tidigare namnet "Warenwetbesluit toegankelijkheidseisen producten en diensten" finns inte, och `fullName` ("Implementatie van de Richtlijn (EU) 2019/882 (EAA)") var ingen titel.
    - `law` är nu citeertiteln "Implementatiewet toegankelijkheidsvoorschriften producten en diensten".
    - `fullName` är opschrift, ordagrant från wetten.overheid.nl.
    - `lawUrl` är nu `https://wetten.overheid.nl/BWBR0049571/`. Posten hade ingen länk tidigare.
    - En `note` förklarar att Warenwetbesluit toegankelijkheidsvoorschriften 2024 (BWBR0049688) bara gäller produkter, och att kraven för e-handel står i BW 6:230fa–230fd. Vilket instrument ett utlåtande ska namnge avgör Juno.
  - **pt-wad:**
    - `lawUrl` ledde till felsidan på diariodarepublica.pt. Den pekar nu på ELI-adressen `https://data.dre.pt/eli/dec-lei/83/2018/10/19/p/dre/pt/pdf`, som leder till PDF:en.
    - `law` "DL 83/2018" står inte i akten. Den officiella formen "Decreto-Lei n.º 83/2018" används i stället.
    - `fullName` har fått kommatecknet som i portalens rubrik: "…, de 19 de outubro".
  - **pt-eaa:** samma kommatecken: "Decreto-Lei n.º 82/2022, de 6 de dezembro".

  Inget av namnen är attesterat än, så lagnamnsgrinden visar fortfarande fallback-frasen för NL och PT. Kunddokumenten ändras inte förrän Juno attesterar.

  **Kod: `lawPhrase` tappar parentesen även när det långa namnet redan bär kortnamnet inom parentes.** Nederländernas opschrift avslutas med citeertiteln, så nl-wad hade skrivit "… (Tijdelijk besluit digitale toegankelijkheid overheid) (Tijdelijk besluit digitale toegankelijkheid overheid)" samma dag som namnet attesterades.

  Grinden dolde felet: ett oattesterat namn renderas aldrig, så inget test såg raden. `lawPhrase` exporteras nu, och ett nytt test prövar frasen för **varje** post, attesterad eller inte. Testet var rött för nl-wad och nl-eaa före rättningen.

## 5.0.0

### Major Changes

- 0538933: Intern #68: Australiens Digital Access Standard är borttagen ur lagdatan, eftersom intern regeringspolicy inte är ett lagrum.

  **Regeln som gäller framåt (Juno):** en post hör hemma i `national-laws.json` bara om ett bindande rättsligt instrument gör efterlevnaden obligatorisk och möjlig att göra gällande mot den som bär skyldigheten. Digital Access Standard är obligatorisk inom den australiska regeringens egen investeringsstyrning. Standarden har däremot ingen författning, ingen tredjepartsrätt, ingen tillsynsmyndighet utanför DTA och ingen domstolsväg.

  **Brytande ändringar, därav major:**

  - Posten `au-dta` finns inte längre. `getNationalLaws('AU')` ger nu en post, `au-dda`, och `getNationalLaw('au-dta', 'AU')` ger `null`.
  - `'DAS'` är borttagen ur `LegalFramework` och ur schemats `euFramework`. Kod som anropar `getNationalLawByFramework('DAS', …)` eller har ett uttömmande `switch` över `LegalFramework` med ett `'DAS'`-fall går inte längre att kompilera. Ta bort fallet. `getLegalFramework('DAS')` gav redan `null`.

  **Lagen i utlåtandet ändras inte.** Utlåtandet för Australien namngav redan Disability Discrimination Act 1992 i båda sektorerna. Det kom tidigare från en egen AU-gren i standards (`deriveEnforcementLaw`), i motorn (`resolveNationalLawReference`) och i komponenten. Grenarna fanns bara för att standarden, med scope `public`, annars vann väljarens företräde för exakt scope. Nu är de borttagna, och den generella väljaren ger samma lag, så tre handhållna speglar som kunde glida isär är borta. Med motorns gren försvann också dess hårdkodade reservtext med lagnamnet, en namnväg som gick förbi lagvalet.

  Digital Inclusion Standard, som är det dokument som faktiskt rör tillgänglighet, beskrivs i `docs/guides/eu-legal-framework.md` och finns inte i datan.

  **Det här ändras i kunddokumenten: avsnittet "Australian Government digital policy" visas bara för offentlig sektor** (Intern #94 fråga 4, Juno). Avsnittet beskriver en policy för federala myndigheter och ingen annan. Ett privat företag är varken "subject to" policyn eller en "Commonwealth agency", så i ett privat utlåtande var avsnittet sakligt fel, oavsett datumen. Ett australiskt utlåtande för privat sektor saknar nu avsnittet, och resten är oförändrat. Offentlig sektor är oförändrad.

  Mallarna har fått ett valfritt fält per avsnitt, `sectors`, som begränsar avsnittet till de angivna sektorerna. Det finns i både motorns mallar och komponentens, och ett avsnitt utan fältet gäller båda sektorerna som förut. Datumen i avsnittet (1 januari och 1 juli 2025) är belagda sedan tidigare men inte omverifierade den här omgången. Juno kontrollerar dem mot primärkällan när den svarar.

### Minor Changes

- 9bdf720: HHS Section 504 (`us-hhs-section-504`) is now marked `inForce: true` with `effectiveDate: "2024-07-08"`, the date the revised HHS Section 504 regulations took effect. The WCAG 2.1 AA dates stay in `complianceDeadlines` (15+ employees: 2027-05-11, fewer than 15: 2028-05-10) and are no longer read as a whole-entry flag. Use the new `isComplianceTierInForce(law, tier, today?)` to check whether a tier's WCAG deadline has passed. `true` only means that the date has passed, not that the requirement applies to whoever uses the package: 45 CFR Part 84 applies only to recipients of federal financial assistance from HHS (45 CFR 84.2(a)). The WCAG citation changes from 45 CFR 84.85 to 84.84(b).
- e92c075: Intern #82: lagnamnsgrinden. Ett utlåtande namnger en lag bara om någon har gått i god för just det namnet mot primärkälla. Annars skriver det fallback-frasen, till exempel "gällande tillgänglighetskrav" (Karins beslut 2026-09-12).

  **Det här ser kunden.** Meningen som namnger lagen skriver i stället fallback-frasen på utlåtandets språk i 18 av 32 kombinationer av land och sektor:

  | Land                   | Sektor som får fallback-frasen |
  | ---------------------- | ------------------------------ |
  | NO, DK, FI, NL, PT, CA | båda                           |
  | DE, ES, IT, GB, US     | privat                         |
  | IE                     | offentlig                      |

  I övriga 14 kombinationer står lagens namn kvar som i dag: SE, FR, PL och AU i båda sektorerna, DE, ES, IT, GB och US i offentlig sektor, och IE i privat. Inget annat i utlåtandet ändras. Myndighetsraden står kvar, eftersom tillsynsmyndighetens namn har en egen registerkategori och tystas inte i det här bygget.

  **Ett land tänds** när Juno lägger `lagnamn` i `bekraftat` för landets poster i registret i holmdigital/Intern och generatorn där körs. Diffen visar då `"lagnamn"` i `attested`, en rad per post. Det finns ingen annan väg in, ingen landflagga och inget fält som sätts för hand.

  **En rad byter form i motorns utlåtanden för US offentlig sektor.** Motorn skrev "Section 508 of the Rehabilitation Act of 1973 (Section 508)" och gick förbi regeln att parentesen faller när kortnamnet redan står först. Komponenten skrev raden utan parentes. Nu används samma funktion överallt, och parentesen faller.

  **Nytt i standards:**

  - `NationalLaw.attestation?: Attestation`, med `attestedBy`, `session`, `sources`, `attested`, `notAttested` och `subject`. Blocket genereras ur registret och redigeras aldrig för hand här. `attested` och `notAttested` är listor av typen `AttestableField`, en union, så att en felstavning fäller typkontrollen i stället för att tyst läsas som "ej granskat". Schemat har `additionalProperties: false` och ingen `minItems` på `attested`, eftersom en tom lista är en giltig spärr.
  - `isNameAttested(law)` är grinden. Den läser `attested` och inget annat, och bara `subject: 'law-entry'` kan öppna den.
  - `resolveNationalLawReference(country, sector, lang)` och `NATIONAL_LAW_FALLBACK` har flyttat hit från motorn och komponenten. Båda bar varsin kopia, och kopiorna har glidit isär en gång redan (Intern #63/#66). Grinden sitter på varje väg som kan returnera ett namn, också US-grenen, där varje lag i kombinationen prövas för sig.
  - `sources` bär registrets källtext. Standardlistan över källor per land och anteckningarna om hur en källa nåddes ingår inte (Intern #94 fråga 1).

  Motorn återexporterar `resolveNationalLawReference`, så dess publika API är oförändrat.

- f998d58: Intern #83, Karins beslut i #94 fråga 2: ett svenskt utlåtande för privat sektor anger hur tillsynen över LPTT är fördelad, i stället för att peka ut PTS för alla.

  **Det här ser kunden.** Tillsynsavsnittet i ett svenskt utlåtande för privat sektor lyder nu, ordagrant som Karin skrev det:

  > Tillsynen över lagen (2023:254) om vissa produkters och tjänsters tillgänglighet är uppdelad mellan flera myndigheter beroende på vilken tjänst som erbjuds: Post- och telestyrelsen ansvarar för elektronisk kommunikation, banktjänster och e-handelstjänster, Mediemyndigheten för audiovisuella medietjänster, Myndigheten för tillgängliga medier för e-böcker, och Konsumentverket respektive Transportstyrelsen för olika delar av persontransporttjänster.

  Förut stod där att PTS har ansvaret för tillsynen och att kunden kan anmäla till PTS. För ett buss-, tåg-, flyg- eller rederibolags webbplats är Konsumentverket tillsynsmyndighet, så meningen var fel för dem. Motorn vet inte vilken tjänst kunden driver, och därför anger avsnittet fördelningen.

  **Texten ersätter hela avsnittet.** Mallens två meningar om att anmäla till PTS och dess stycke om oskäligt betungande krav, tillgänglighetsredogörelsen och begäran om tillgängliggörande står inte längre i ett svenskt utlåtande för privat sektor. Det stycket hör till DOS-lagen och offentlig sektor.

  **Oförändrat:** offentlig sektor, alla andra länder och svensk privat sektor på andra språk än svenska. Det finns bara en svensk text än.

  **Nytt i standards:** `enforcement.statementText`, en språknycklad text för en lag vars tillsyn är delad efter tjänstetyp, och `getEnforcementStatementText(country, sector, lang)`. Funktionen har samma lagval som `resolveNationalLawReference` och samma lagnamnsgrind. Texten namnger lagen, så den används bara när lagnamnet är attesterat; annars vore den en väg förbi grinden. Motorn och komponenten läser den på samma sätt.

- c29822b: Lagdatasvepet 2026-09-24: Sverige (Intern #83), sex ikraftträdanden (Intern #63), och fyra sanktionsbelopp som inte fanns i lagen (Intern #83, #70, #88, #93).

  **Minor, eftersom en typ tillkommer:** `NationalLaw.exemptions.statutory?: StatutoryExemption[]`, med `kind` (`actor`, `content`, `navigation-maps`, `disproportionate-burden`, `transitional`), `description` och `legalBasis`. Typen `exemptions` rymde bara mikroföretagsundantaget, och DOS-lagen har inget sådant (den binder offentliga aktörer) men fem andra undantag. Fältet är valfritt, så ingen befintlig konsument påverkas.

  **Ikraftträdanden.** Sex poster bar direktivets frist eller lagens datum i stället för lagens eget ikraftträdande:

  | Post        | Före       | Efter      |
  | ----------- | ---------- | ---------- |
  | `dos-lagen` | 2019-09-23 | 2019-01-01 |
  | `de-bitv`   | 2019-09-23 | 2011-09-22 |
  | `es-une`    | 2018-09-23 | 2018-09-20 |
  | `it-wad`    | 2004-01-09 | 2004-02-01 |
  | `pl-wad`    | 2019-04-04 | 2019-05-23 |
  | `pt-wad`    | 2018-10-19 | 2019-01-01 |

  Alla sex datum ligger bakåt i tiden, så `inForce` ändras inte för någon post. `no-ikt` behåller 2014-07-01, som är efterlevnadsfristen. `note` förklarar nu båda datumen. Fem EAA-poster har fått sitt formella ikraftträdande i `note`, eftersom `effectiveDate` bär tillämplighetsdagen.

  **Sverige.**

  - `dos-lagen.exemptions.statutory` har fem poster: 8 § med ändringen genom Lag (2025:992), som datan inte speglade, 9 § första stycket med dess fem innehållstyper, 9 § andra stycket, 12 § och övergångsbestämmelse 2. Andra stycket är ett eget undantag för kartor som ÄR avsedda för navigering, med villkoret att väsentlig information görs tillgänglig på annat sätt. Det är alltså inte ett villkor på punkt 2, som undantar kartor som inte är avsedda för navigering utan villkor (Karin 2026-09-28, Intern #83, ordagrant ur riksdagen.se).
  - `lptt.enforcement` och `lptt.sectorAuthorities` följer den färdiga formen i #83 ordagrant. PTS beskrivning säger nu att PTS är marknadskontrollmyndighet för produkter och själv tillsynsmyndighet för elektronisk kommunikation, banktjänster och e-handel. Webbplatser, appar och e-biljetter för persontransport ligger hos **Konsumentverket, inte PTS**, och Transportstyrelsen har resten av persontransporten. Raderna för Mediemyndigheten och MTM är orörda.
  - `lptt.exemptions.microbusiness` vilar nu på svensk lag (2 §, 10 §) i stället för direktivet. Texten skiljer helt undantag för tjänster från en lättnad för produkter.
  - `lptt.note` säger att fristen till 2030-06-27 gäller produkter i tjänsteproduktionen och aldrig får läsas som ett allmänt anstånd.

  **Frankrike.** `fr-rgaa.sectorAuthorities` är **borttaget** (Intern #94 fråga 3, Juno). DGCCRF och Banque de France hör till privat sektor och konsumenträtt, alltså `fr-eaa`, som redan har DGCCRF som `enforcement`. Fältet stod dessutom på svenska. `fr-rgaa.enforcement` (DINUM) är oförändrat.

  **Sanktionstak.**

  - `dos-lagen` (Intern #83): spannet 100 000 till 1 000 000 SEK är **borttaget**, eftersom det inte finns i lagen. 19 § ger påpekande, föreläggande och vite, men inget belopp, och vitet bestäms i varje enskilt fall. Arten `Vitesföreläggande` står i `note` tills sanktionsschemat i #70 ger den ett fält. `getMaxSanction('SE')` ger oförändrat 10 000 000 SEK ur `lptt`.
  - `de-bfsg`: 500 000 EUR → **100 000 EUR**. § 37 Abs. 2 ger 100 000 för bland annat tjänsteledet och 10 000 för övrigt.
  - `fr-rgaa`: 300 000 EUR → **50 000 EUR**. Art. 47-1 ger 50 000 för huvudkravet och 25 000 för deklarations- och plankraven.

  - `ca-aoda` (Intern #93): spannet 200–100 000 CAD är **borttaget**, eftersom det inte finns i lagen. § 37(3) ger 50 000 CAD per dag för en person och 100 000 CAD per dag för ett bolag, och båda taken står citerade i `note`. Här är borttagning rätt och inte ett högsta belopp: taken gäller per dag, så ett platt `maxAmount` skulle underskatta exponeringen.
  - `ca-aca` (Intern #70): lagrummet i `description` är nu § 91(2) i stället för "Part 6". Taket 250 000 CAD är bekräftat.

  För `de-bfsg` och `fr-rgaa` står det lägre taket i `description`. Taken är två separata belopp för olika överträdelser, inte ett spann, så `minAmount` förblir 0 och inte det lägre taket. Tvåelementsformen kommer med sanktionsschemat i #70. `getMaxSanction('DE')` och `getMaxSanction('FR')` ger nu 100 000 respektive 50 000.

  **Inget kunddokument ändras.** Motorn och komponenten läser varken `effectiveDate`, `exemptions`, `sectorAuthorities`, `responsibility` eller `sanctions`. Myndighetsraden i ett svenskt utlåtande för privat sektor säger därför fortfarande PTS, även för en transportkund. Att ändra det kräver ett formuleringsbeslut och ligger kvar i #83.

## 4.2.2

### Patch Changes

- 94022ff: Intern #63 — två språkblandade fält rättade.

  - `de-bitv.enforcement.responsibility`: `Federal tillsyn av offentlig sektor.` → `Federal oversight of the public sector.` Hela meningen var svensk i en tysk post. Engelska följer det mönster som faktiskt gäller för beskrivande prosafält i granskade poster; lagnamn och andra citatfält står kvar på originalspråket.
  - `nl-eaa.sanctions.description`: ett svenskt `eller` mitt i en nederländsk mening → `of`.

  Ingen sakuppgift är ändrad. Varken motorn eller komponenten läser `responsibility` eller `sanctions`, så inget kunddokument påverkas. Ändringen syns bara för den som läser datan via API:t.

## 4.2.1

### Patch Changes

- 982d522: Intern #70 — ta bort obelagda sanktionsbelopp ur `de-bitv` och ur README.

  De två delar av #70 som inte väntar på Junos utredning av `de-bfsg`s belopp eller på MAJOR-schemat. Ingen schemaändring, och ingenting av det renderas.

  **`de-bitv.sanctions` borttagen.** Posten bar ett tak på 500 000 EUR och exempeltexten _"Böter upp till 500 000 EUR för allvarliga brott mot EAA"_ — en EAA-sanktion hängd på en **WAD-förordning**. Enligt Bevakning#7 har BITV 2.0 noll träffar på `Bußgeld`, `Geldbuße`, `Ordnungswidrig` och `Sanktion`. Fältet är valfritt sedan 4.0.0 och fyra poster saknar det redan (`dk-eaa`, `fr-eaa`, `es-eaa`, `pt-eaa`), så mönstret är etablerat: utelämnat i stället för gissat. Skälet ligger i postens `note`.

  Verifierat före borttaget att **ingen kod i motorn eller komponenten läser `.sanctions`** — varken `getSanctions` eller `getMaxSanction` anropas därifrån — så det kan inte ändra något kunddokument. Standards-sviten: 362 gröna, oförändrat.

  **Sanktionstabellen dragen ur README.** Den publicerade en maxsanktion per land, och flera var fel: `100k PLN` för Polen (motbevisad — art. 73 ust. 1 ger en formel, inte ett belopp: det största av tio genomsnittliga månadslöner eller 10 % av föregående års omsättning), `Up to 5% of turnover` för Italien utan de villkor som gäller, `500k EUR` för Tyskland på en rad som parade BITV 2.0 med BFSG, och `44k EUR` för Portugal. Även de två kodexemplen som publicerade `maxAmount: 10000000` och `amount: 500000` i löptext är rensade — de missas lätt eftersom de står utanför tabellen.

  Ersatt med en landlista utan beloppskolumn och en förklaring av **varför** kolumnen inte kan finnas: en sanktion är inte ett tal per land. En lag kan ange ett spann, en formel i stället för ett belopp, en art utan belopp, ingen egen sanktion alls, eller inget tak. Att platta till det i en cell gav siffror vår egen data inte stöder. Belopp läses via `getSanctions()`, som ger `undefined` där inget är belagt — och frånvaro betyder "inte belagt mot primärkälla", aldrig "ingen sanktion finns".

  Avsnittet innehåller efter ändringen noll beloppsliknande strängar, maskinellt kontrollerat.

## 4.2.0

### Minor Changes

- 270f726: Intern #63 — lydelsetabellen från 2026-09-12 16:29, en ny brittisk post, och de två saknade uppslagsfunktionerna.

  ## Jag missade en kommentar och byggde från en äldre version

  Karins team postade _"Färdiga lydelser för alla femton poster. Skriv av, du behöver inte fråga."_ klockan 16:29, plus ett avgörande om `nl-eaa` och `au-dta` klockan 16:07. **Mitt bygge utgick från kommentarerna till och med 15:18.** Åtta av de femton lydelserna avvek därför från den beslutade.

  Rättat nu, ordagrant efter tabellen:

  | Post                                 | Ändring                                                                                                                                                           |
  | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fi-eaa.law`                         | `EAA-implementering` → `Lag om tillhandahållande av digitala tjänster (306/2019), 3 a kap.` Platshållaren var rätt beteende när den skrevs, men lydelsen finns nu |
  | `dk-wad.law`                         | Vår avkortning `Lov om tilgængelighed` → hela titeln. Danska lagar har inget officiellt kortnamn, och avkortningen läste som en titel utan att vara någon         |
  | `dk-wad.fullName`, `dk-eaa.fullName` | LOV-citeringen tillagd                                                                                                                                            |
  | `es-eaa.fullName`                    | Hela slutledet om Ley 12/2011 var avkortat                                                                                                                        |
  | `pt-eaa.fullName`                    | Bara beteckningen; sumário till `note`                                                                                                                            |
  | `us-ada-title-iii.fullName`          | Bindestreck → komma                                                                                                                                               |
  | `us-hhs-section-504`                 | Vår etikett `(HHS Final Rule)` ut ur **båda** fälten; FR-citeringarna till `note`                                                                                 |

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

### Patch Changes

- f28dd03: Intern #66 — två påståenden jag inte kan belägga, borttagna.

  **`ENFORCEMENT_NO_SINGLE_AUTHORITY.PT.private` påstod ett antal.** Strängen som når kundtext sa _"nine bodies by sector"_ medan kodkommentaren ovanför den räknade upp **tio** namn. Siffran kom ur underlaget jag fick — Junos text säger _"nio sektorsorgan"_ och listar sedan tio — och jag byggde den troget. Artigo 28.º n.º 1 har nio _alíneas_, men alínea c) namnger två myndigheter, så _"nine bodies"_ är fel medan _"nine paragraphs"_ hade varit rätt.

  I stället för att välja en siffra i en lagtext jag inte kan läsa är påståendet borttaget. Att namnge artikeln räcker, och det kan inte bli fel. En siffra läggs tillbaka bara med Junos lydelse.

  **`dk-eaa.note` hade blivit falsk.** Den sa att `retsinformation.dk` och `sik.dk` svarar 403 Forbidden och att lagtexten därför aldrig öppnats. Båda svarade 200, och hela texten hämtades som en 422 kB PDF. Noten sa också att `enforcement` är avsiktligt frånvarande, fast fältet lades in 2026-09-11.

  Att lagen faktiskt namnger kontrollmyndigheter i § 45 och en sanktions**art** i § 57 står nu i noten. **Om** fälten ska fyllas är Junos avgörande, inte en mekanisk fix — men skälet att lämna dem tomma kan inte längre vara att källan är oåtkomlig. Noten var det som motiverade tomheten, och ett test låser den, så en inaktuell not höll ett fält stängt på fel grund.

  Båda fynden kommer ur en oberoende granskning av mitt eget bygge, inte ur min egen genomläsning.

## 4.1.1

### Patch Changes

- f73caa5: Intern #63 och #66 — 41 fältändringar ur Junos attestering av alla 32 lagposter.

  ## Fyra påhittade lagnamn ute ur datan

  | Post              | Namnet vi skrev                                                | Vad som finns                                                                                                                                 |
  | ----------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
  | `fi-wad.law`      | `Laki digitaalisten palvelujen saavutettavuudesta`             | `…tarjoamisesta`. `saavutettavuudesta` betyder tillgänglighet, `tarjoamisesta` betyder tillhandahållande. Lagen vi namngav finns inte         |
  | `fi-eaa.fullName` | `Lag om tillgänglighetskrav för produkter och tjänster (EAA)`  | Det namnet finns, men det är **produktlagen** 102/2023. Motorn skannar tjänster. Rätt lagrum är 306/2019 **3 a kap.**                         |
  | `pt-eaa.law`      | `DL 101-D/2023`                                                | DRE:s ELI-resolver lämnar inte ut något sådant diploma på något av 168 prövade datum under 2023. Rätt akt är **82/2022**, belagt i artigo 1.º |
  | `nl-eaa.law`      | `Warenwetbesluit toegankelijkheidseisen producten en diensten` | Motsvarar ingen nederländsk författning — **orörd**, vilket av två riktiga instrument posten ska avse är obeslutat                            |

  ## Sex sätt en levande länk kan vara fel

  Alla sex hittades i vår egen data, och inget av dem hade fångats av ett jobb som kontrollerar svarskod:

  - **fel lag:** `dk-wad` pekade på lag **693**, om återbetalning av olagligt statsstöd vid dricksvattenskyddsavgift. Rätt är 692. Båda svarar 200.
  - **fel lag igen:** `nl-wad` pekade på `BWBR0040990`, ett **redovisningsprotokoll för sjukförsäkring**. Rätt är `BWBR0040936`.
  - **obefintlig:** två `ada.gov`-adresser gav 404.
  - **programportal i stället för lagtext:** `us-508` pekade på `section508.gov`, GSA:s vägledningssajt. Lagrummet är 29 U.S.C. 794d.
  - **överspelad konsolidering:** `au-dda` pekade på en version som säger om sig själv _"Superseded version"_, giltig till 2017.
  - **föråldrad sökväg:** Finlex `ajantasa`-URL:en 308-redirectar.

  **Tio poster fick sin första `lawUrl`**: `fi-eaa`, `dk-eaa`, `fr-eaa`, `es-une`, `es-eaa`, `it-wad`, `pt-wad`, `pt-eaa`, `pl-wad`, `pl-eaa`. Elva saknade en före; nu bara `nl-eaa`, som är medvetet orörd. Noteras: `fr-eaa`s länk svarar **403** eftersom Légifrance blockerar maskinell hämtning — Juno läste innehållet i ett arkivsnapshot av samma kanoniska URL. Icke-200 betyder alltså inte trasig, vilket är halva skälet till att ett automatiskt länkjobb avvisades.

  ## Omskrivningar som ändrade sakinnehåll
  - **`us-ada-title-iii.fullName`** sa `Nondiscrimination … in Public Accommodations and Commercial Facilities`. eCFR säger **`by` Public Accommodations and `in` Commercial Facilities**. Källan skiljer diskriminering _utövad av_ en public accommodation från diskriminering som _sker i_ en commercial facility; vår omskrivning slog ihop leden och ändrade därmed vem bestämmelsen träffar.
  - **`nl-wad.fullName`** hade fel datum (30 juni i stället för 3 maj), tappat `tijdelijke`, omskriven objektsbeskrivning, och **två svenska `av` där nederländskan har `van`**.
  - **`no-ikt.fullName`** tappade ledet `-løsninger` och sa `kommunikasjonsteknologi` där Lovdata säger `kommunikasjonsteknologiske`. Vår version handlade om tekniken, källans om lösningarna.
  - **`it-eaa.fullName`** sa `Recepimento` där Normattiva har `Attuazione`, plus ett engelskt tillägg som inte står i titeln.
  - **`ie-wad.fullName`** hade ett inskjutet `the`.
  - **`de-bfsg.fullName`** bar vår interna platshållare `- EAA-implementering` inklistrad i ett namnfält.

  ## Beskrivningar och metadata ut ur namnfälten

  `dk-eaa`, `ca-aca` och `pt-wad` bar publikationsuppgifter, en parallell författning respektive en beskrivning inne i `fullName`. Allt flyttat till `note` med källangivelse. För `dk-eaa` noteras särskilt att lagens egen datering är **7** juni, inte 8, och att Lovtidende-uppgifterna inte är belagda.

  ## Nio tankstreck, och en spärr

  Alla nio U+2013/U+2014 i `law` och `fullName` är borta. Ny spärr i testsviten med Junos motivering: de förekom **bara** som vår redaktionella skarv mellan beteckning och titel, aldrig i en officiell titel — medan U+002D i `Decreto-Lei`, `101-D` och `EAA-implementering` är del av namnen och inte berörs. En regressionsvakt hindrar att spärren breddas till bindestreck.

  **Känd gräns, medvetet inte lagad:** spärren fångar inte U+002D, så `de-bfsg`s platshållare gick förbi den. Att bredda vore fel medicin.

  ## Portugal fick ingen påhittad tillsynsmyndighet

  `pt-eaa` tappade sitt `enforcement`-block, och utan åtgärd hade derivationen fallit tillbaka på den handskrivna `Directorate-General for Consumer Affairs (DGAC)` — alltså exakt det påhittade huvudorgan Juno förbjöd. Portugal ligger nu i `ENFORCEMENT_NO_SINGLE_AUTHORITY` med samma mönster som Spanien: artigo 28.º n.º 1 delar tillsynen på nio sektorsorgan, och INR ansvarar för acompanhamento och monitorização, inte fiscalização.

  `ENFORCEMENT_BODIES_FALLBACK` rättad på två rader som var död kod men bar fel uppgift: `FI.wad` (AVI → Traficom, 12 § ger samma myndighet båda kapitlen) och `PT.eaa`.

  ## Orörda med avsikt

  `nl-eaa` och `au-dta` — båda kräver ett sakbeslut om vilket instrument posten avser. `au-dta` fick bara skiljetecknet bytt; att Digital Access Standard handlar om att minska antalet ingångar medan tillgänglighetskraven bärs av Digital Inclusion Standard är en egen fråga.

  `fr-eaa`s och `pt-eaa`s sanktionsspann — `Sanction` har ett enda `maxAmount` och rymmer inte tre respektive fyra spann. Modelleringen är specad och Karinspärrad till nästa major.

  `fi-eaa.law` står kvar som `EAA-implementering`. Det är en ärlig platshållare, inte ett fel, och ska inte ersättas med ett påhittat kortnamn.

## 4.1.0

### Minor Changes

- c96eb15: Intern #63 — `ENFORCEMENT_BODIES` och `ENFORCEMENT_BODIES_DETAILED` härleds ur `national-laws.json`, plus Junos tre dataavgöranden.

  ## Motsägelsen som fanns i fyra länder samtidigt

  Samma paket gav två olika svar på vem som utövar tillsyn, och bara ett av dem var det som faktiskt renderades i ett utlåtande:

  | Lag        | Datan sa                             | Konstanten sa                        |
  | ---------- | ------------------------------------ | ------------------------------------ |
  | `gb-psbar` | Central Digital and Data Office      | Equality and Human Rights Commission |
  | `nl-wad`   | Ministerie van Binnenlandse Zaken    | Logius                               |
  | `de-bfsg`  | delstatlig marknadskontroll          | Federal Network Agency               |
  | `ca-aoda`  | Accessibility Directorate of Ontario | Accessibility Commissioner (CHRC)    |

  Båda konstanterna härleds nu ur lagposternas egna `enforcement`-fält, och den flata ur den detaljerade, så de tre kan inte drifta isär igen. Den handskrivna tabellen finns kvar oexporterad som sista utväg för länder utan lagdata — i dag bara `EU`.

  **Sidoeffekt som är hela poängen:** myndighetsnamnet blir landets eget. Ett svenskt dokument sa `Swedish Post and Telecom Authority (PTS)`; det säger nu `PTS (Post- och telestyrelsen)`, precis som lagposten (Intern #65 fynd 3).

  ## Junos dataavgöranden
  - **`au-dta.euFramework`: `DDA` → `DAS`.** Digital Access Standard är ingen lag utan ett internt Commonwealth-styrdokument utan talerätt för tredje part, och att dela DDA:s kod var både sakligt fel och en latent bugg: `getNationalLawByFramework` returnerar första arrayträffen, så en omsortering hade tyst kunnat göra styrdokumentet till Australiens lag. `LegalFramework` får därför ett nytt värde.
  - **`dk-eaa` får tillsynsmyndighet.** Sikkerhedsstyrelsen, belagd via myndighetens eget pressmeddelande. Nyansen _"hovedparten af områderne"_ står i `responsibility` — den täcker de flesta men inte alla områden, och vilka undantagen är förblir obelagt. `sanctions` är fortfarande utelämnad.
  - **`de-bfsg`: Bundesnetzagentur är fel.** BFSG § 20 lägger marknadskontrollen hos delstaterna, och ordet "Bundesnetzagentur" förekommer inte en enda gång i lagen. `authority`-id:t pekade dessutom på BITV:s federala organ medan namnet sa något annat; båda är rättade.

  ## Två mekanismer, medvetet åtskilda
  - `ENFORCEMENT_NO_SINGLE_AUTHORITY` — **undantag**, för äkta rättslig frånvaro. Spanien har ingen nationell tillsynsmyndighet (Ley 11/2023 art. 27.3). Ett undantag säger _"namnge det här i stället"_ och får aldrig skugga ett värde datan kan leverera; ett test failar om det gör det.
  - `ENFORCEMENT_SUPPRESSED` — **undertryckning**, som säger _"namnge ingen"_ och därför får skugga datan. I dag bara norsk privat sektor (Intern #23 Fynd B). Skälet är inte att tillsynen är overifierad — UU-tilsynet utövar tillsyn över `no-ikt` — utan att en tillsynssektion i ett privat utlåtande antyder en rapporteringsplikt en privat aktör inte har.

  Ny exporterad `deriveEnforcementLaw(country, sector)`, som speglar motorns egen AU/US-routing exakt.

## 4.0.1

### Patch Changes

- 78db575: Intern #65 fynd 2 — tankstrecket ur `fr-eaa`s `fullName`, enligt Junos beslut.

  > `… (transposition de la directive (UE) 2019/882) — code de la consommation …`

  blir

  > `… (transposition de la directive (UE) 2019/882), code de la consommation …`

  Ingen saklig ändring, bara skiljetecken. Strängen når kunddokument och bröt mot teamets skrivregel mot tankstreck.

  **Tio andra lagnamn bär samma tecken** och är medvetet orörda: de är Junos granskade data, och lydelsen är teamets att avgöra enligt ansvarsgränsen i Intern #46. De är rapporterade i ärendet med exakta strängar.

## 4.0.0

### Major Changes

- 46a8ed8: Intern #63 — EAA-transponeringarna för Frankrike, Danmark och Spanien, och `enforcement`/`sanctions` blir valfria.

  ## Brytande: `NationalLaw.enforcement` och `NationalLaw.sanctions` är valfria

  De var obligatoriska, och det var fel. Typen påstod att varje lag i världen har exakt en namngiven tillsynsmyndighet och ett eget sanktionsspann i siffror. Tre av Junos fynd visar att den inte gör det:

  - **Spanien har ingen nationell tillsynsmyndighet.** Ley 11/2023 art. 27.3 lägger den hos varje autonom region samt Ceuta och Melilla, var och en utser sin egen. Art. 28:s _unidad técnica_ är uttryckligen ett stöd- och samordningsorgan, inte en tillsynsmyndighet.
  - **Spanien har inget eget sanktionsspann.** Art. 30 hänvisar till sektorslagstiftningen, i andra hand till avdelning III i RDL 1/2013. Det finns ingen siffra att skriva.
  - **Frankrikes sanktionsart är belagd men inte beloppet.** Art. R. 451-4 code de la consommation gör överträdelse till _"une amende relevant des contraventions de 5e classe"_ — straffrättsliga böter, inte en administrativ avgift. `Sanction` kräver `minAmount`/`maxAmount`.
  - **Danmarks tillsyn och sanktioner är obelagda.** `retsinformation.dk` och `sik.dk` svarar båda 403 på automatiserad hämtning, så lagtexten är aldrig öppnad.

  Junos ord: _"Om schemat kräver `enforcement` för att posten ska validera är det schemat som behöver ett sätt att uttrycka 'tillsynen är uppdelad', inte datan som ska fyllas med en gissning."_

  **Migrering.** Läs `law.enforcement?.authorityName` i stället för `law.enforcement.authorityName`, likaså `law.sanctions?`. Saknat fält betyder _"ingen enskild myndighet, eller inte belagd"_ — aldrig _"ingen finns"_. Fall aldrig tillbaka på ett annat lands myndighet. `getMaxSanction()` hoppar nu över lagar utan spann i stället för att läsa dem som ett nolltak, vilket hade underskattat landets maxexponering.

  Schemat speglar ändringen: båda fälten är kvar som `properties`, men ur `required`.

  ## Tre nya lagposter

  Privat sektor i Frankrike, Danmark och Spanien fick tidigare **ingen lag namngiven alls**, bara en omskrivning utan lagnamn, trots att EAA gäller i alla tre sedan 2025-06-28.

  | id       | Lag                                                                         | Tillsyn                                   | Sanktioner                                |
  | -------- | --------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
  | `fr-eaa` | Code de la consommation art. L. 412-13 (+ D. 412-57, arrêté 9 oktober 2023) | DGCCRF                                    | **Utelämnad** — art finns, belopp obelagt |
  | `dk-eaa` | Lov om tilgængelighedskrav for produkter og tjenester                       | **Utelämnad** — obelagd                   | **Utelämnad** — obelagd                   |
  | `es-eaa` | Ley 11/2023, de 8 de mayo                                                   | **Utelämnad** — regional enligt art. 27.3 | **Utelämnad** — saknas i lagen            |

  Varje utelämnat fält har ett `note` som säger exakt varför och vad som krävs för att fylla det. Testerna failar både om posterna försvinner och om någon fyller dem med en gissning.

  ## Två felaktiga tillsynsmyndigheter rättade
  - **`ENFORCEMENT_BODIES_DETAILED.FR.eaa`: Arcom → DGCCRF.** Arcom var fel som generellt påstående. Dess EAA-behörighet enligt art. L. 511-25-1 omfattar bara tjänster som ger tillgång till audiovisuella medietjänster samt e-böcker och läsprogramvara. DGCCRF är den generella marknadskontrollmyndigheten och samordnar sektorsmyndigheterna. Arcoms mandat ligger i `fr-eaa`s `responsibility`. **WAD-sidan rörs inte** — DINUM är fortfarande rätt för RGAA och offentlig sektor, och noten i `fr-rgaa` står kvar oförändrad.
  - **`ENFORCEMENT_BODIES_DETAILED.ES.eaa`: Ministerio de Consumo → arrangemanget.** Ministeriet är inte tillsynsmyndighet enligt lagen. Eftersom Spanien inte har något enskilt nationellt organ att namnge namnges ordningen i stället, med artikelhänvisning.

## 3.1.0

### Minor Changes

- 7a6dfb7: Intern #64 — sektors- och ikraftmedvetet lagval, plus ett fält för provinslagar.

  **Ny `getNationalLawForSector(country, sector)`.** Väljer på land + scope + `inForce`, aldrig på `euFramework`. Lagar med `inForce: false` utesluts villkorslöst, och sub-nationella lagar utesluts från landsnyckeln.

  **`getNationalLawByFramework()` tar nu ett valfritt `scope`.** Utan det returneras första ramverksträffen, vilket gör att `getNationalLawByFramework('ADA', 'US')` alltid ger Title II även när anroparen ville ha privatsektorns Title III. Motorn räddades bara av att den specialfallshanterade US och AU; fällan låg kvar i det publika API:t för alla andra anropare. Parametern är valfri, så befintliga anrop är oförändrade.

  **Nytt valfritt `jurisdiction`-fält på `NationalLaw`** (`'national' | 'subnational'`), med `ca-aoda` satt till `subnational`. Utan det går Junos avgörande inte att bygga: `ca-aoda` och `ca-aca` är båda `scope: 'both'` och båda `inForce: true`, så land + scope + inForce ger två träffar för Kanada och avgör ingenting. Ontarios AODA ligger kvar i datan som provinslag, men kan inte längre bli landets svar. Fältet är valfritt och behandlas som `national` när det saknas, alltså rör det ingen befintlig post eller konsument.

  Schemat tillåter fältet. Det ligger medvetet **inte** i `required`.

## 3.0.6

### Patch Changes

- bc8bcf9: Intern #43 fynd 2 — `remediation.component` föreslår inte längre en komponent där den inte hör hemma.

  Datan klistrade ett komponentförslag på fynd oavsett feltyp: ett `@holmdigital/components/Button`-kodexempel hamnade på ett rent `<span>`-kontrastfel (digg.se) och en `ProgressBar` injicerades på en extern sajt (airbnb). Vilma och Mejas regel: ett komponentförslag hör hemma bara när felet är en trasig eller egenbyggd interaktiv widget där den äkta fixen ÄR att använda rätt komponent. Att tömma fältet betyder aldrig att felet är mindre allvarligt — bara att åtgärdstypen är en annan (CSS, ARIA, generell).

  **Tömt `component` (7 regler, alla 12 locales):** `color-contrast` (1.4.3), `non-text-contrast` (1.4.11), `focus-visible` (2.4.7), `target-size` (2.5.8), `use-of-color` (1.4.1), `name-role-value` (4.1.2), `keyboard-accessible` (2.1.1).

  **Behållet (komponenten passar):** `identify-input-purpose`, `form-labels`, `error-identification`, `error-suggestion` (FormField) och `status-messages` (LiveRegion).

  Kodexemplen följde med där de var rena komponentpitchar — `color-contrast` och `name-role-value` (de två rapporterade symptomen) tömdes, `keyboard-accessible` trimmades så div-till-button-vägledningen står kvar utan komponent-svansen, och `target-size` behöll sitt rena CSS-exempel oförändrat. Ingen regel utan `component` bär längre en `@holmdigital/components`-import i sitt kodexempel.

  Låst med test (`remediation-component.test.ts`) över alla tolv locales. Testet dokumenterar också en drift som upptäcktes när regeln tillämpades: `en-gb`/`en-us`/`en-ca` fick aldrig `status-messages` → LiveRegion, till skillnad från de nio andra.

## 3.0.5

### Patch Changes

- 66e5f9b: Intern #43 (fynd 3) — exponera `./package.json` i `exports`.

  Verktyg som läser paketets version via `require.resolve('@holmdigital/standards/package.json')` föll tidigare på `ERR_PACKAGE_PATH_NOT_EXPORTED`, eftersom `exports` bara listade `.`, `./data/*` och `./schema/*`. Motorns `getStandardsVersion()` fångade felet och rapporterade `standardsVersion: "unknown"` i skanningens metadata. `exports` exponerar nu även `"./package.json"` (standardpraxis, rent additivt), så versionen kan läsas. Ingen kod- eller dataändring i övrigt.

## 3.0.4

### Patch Changes

- 635ac7c: KRAV-13 data cleanup (Intern #27, Karin's decisions 2026-08-26). Two changes:

  **The seven axe best-practice rules no longer claim WCAG 1.3.1.** `region`, `heading-order`, `page-has-heading-one`, `landmark-one-main`, `landmark-unique`, `landmark-banner-is-top-level` and `landmark-no-duplicate-banner` are best-practice rules in axe with no WCAG tag — but our data labelled them 1.3.1 nivå A with a DOS-lagen reference, i.e. a legal requirement they are not. They are now reported as **"Best Practice" (no criterion)** in all twelve locale files: `wcagCriteria: "Best Practice"`, `en301549Criteria: "N/A"`, `dosLagenApplies: false`, and a per-language best-practice reference instead of a legal one (Vilma's ruling — 1.3.1 may live on as advisory text, never in the conformance field). The general 1.3.1 rule `info-and-relationships` is unchanged and remains the single, unambiguous holder of that criterion.

  **Removed the dead `data/wcag-to-en301549.json`.** No runtime code reads it; it duplicated legal strings already locked in `rules.*.json` (and still carried a duplicate `audio-description`). Its assertions are dropped from `doslagen-reference.test.ts`.

  Recomputed KRAV-13 outcome over axe-core 4.13.0 (105 rules): 9 exact id-match, 66 criterion-match, 23 best practice, 7 honestly unmapped, **0 silent errors**.

## 3.0.3

### Patch Changes

- 4d3ea2f: Rätta felaktiga lagrum i `dosLagenReference` (Intern #28). Fältet pekade på fel paragraf/rättsakt i publicerad regeldata — fel hänvisning bredvid rätt kravnivå, så inga fynd eller bedömningar påverkas, bara hänvisningen. Junos godkända lydelser byggda ordagrant:

  - **38 poster på DOS-lagens `§7`** (definitionen av museiföremål) → **10 §** med precisering: `Lag 2018:1937 10 §, preciserad i MDFFS 2019:2 4 och 5 §§ via EN 301 549 V3.2.1 Annex A, WCAG 2.1 nivå A/AA krävs`. I `rules.sv.json` och `wcag-to-en301549.json`.
  - **7 poster på `9 §`** (undantagsparagrafen, alla WCAG 1.3.1 nivå A): `rules.sv.json` → svenska 10 §-lydelsen; `rules.en/da/fi.json` och `wcag-to-en301549.json` → filens neutrala mönster `EN 301 549 V3.2.1, WCAG 2.1 Level A required`. Ingen svensk sträng ligger längre i en icke-svensk fil.
  - **1 post på `100 §`** (finns inte; lagen har 23 §§) i `wcag-to-en301549.json`, posten är `audio-description` (1.2.5 AA) → `EN 301 549 V3.2.1, WCAG 2.1 Level AA required`.
  - **45 spanska poster på det ersatta `UNE 139803:2012`** → `Real Decreto 1112/2018, artículos 5 y 6, mediante UNE-EN 301549:2022 (EN 301 549 V3.2.1) Anexo A, Nivel A/AA requerido`.
  - **`legal/national-laws.json` `es-une`**: `law` `UNE 139803` → `Real Decreto 1112/2018`, `fullName` till full BOE-titel (`id` orört).
  - **`legal/national-laws.json` italienska AgID-akter**: fel akttyp `Delibera n. 84/2026` / `n. 38/2026` → `Determinazione n. 84 del 15 maggio 2026` / `Determinazione n. 38 del 4 marzo 2026` (ren substringbytning i prosafält; sanktionsfält orörda).

  Ett låstest (`doslagen-reference.test.ts`) förhindrar att strängarna glider isär igen. `de/fr/nl/no/en-gb/en-us/en-ca`, `fr-rgaa` och WCAG 2.2-posterna är orörda.

## 3.0.2

### Patch Changes

- 26e4f8d: Translate the readable `codeExample` comments for the alt-text rule (`image-alt`) into each locale (Intern #13 follow-up). The three guiding comments — "Missing alt", "Descriptive alt" and "Decorative image" — were left in English in every non-English rules file even though the surrounding rule text was localised. They are now translated in `sv`, `de`, `fr`, `es`, `nl`, `fi`, `da` and `no`; the English variants (`en`, `en-ca`, `en-gb`, `en-us`) are unchanged. Code identifiers and JSX (`<img>`, `src`, `alt`, `role="presentation"`, the `HolmDigital Logo` sample value) stay in English — only the `//` comment prose is localised.
- 299f376: Rewrite the alt-text rule's `remediation.description` (Intern #13). The old text ("All images must have descriptive alternative text.") was wrong about WCAG 1.1.1: it ignored the decoration exception and implied `alt` is always required. The new, WCAG-reviewed wording distinguishes informative from decorative images, states that decorative images must be actively marked so assistive technology can ignore them (an empty `alt=""` is the standard way, and omitting `alt` entirely is not enough), and frames the requirement as being about the outcome, not the technique.

  Applied in all 11 affected language files (`sv`, `en`, `en-ca`, `en-gb`, `en-us`, `da`, `de`, `fi`, `fr`, `nl`, `no`) — `sv`/`en` verbatim as approved, the rest as faithful translations, none using em/en-dashes. `es` already stated the criterion and is left unchanged.

- 0a99805: Fix alt-text rule data (Intern #13). Two live, customer-facing corrections in all 12 language files:

  - **Typo:** `remediation.codeExample` said `// Bad: Msising alt` — corrected to `Missing`. It shipped in every report on every language.
  - **Missing technique:** added `H67` (null `alt` for decorative images) to `remediation.wcagTechnique`, which listed only `G94`, `G95`, `H37`. `H67` is the sufficient technique for exactly the decorative-image case the rule covers.

  `rules.es.json` included — the typo and technique list were identical across all twelve files. No wording change to `remediation.description` here; that is handled separately.

- e92b6a4: Add two optional fields to `EnrichedReport` for KRAV-3 (Intern #12): `cantTell` (marks a "needs review" post carried from axe's `incomplete`, which must be excluded from stats/score/complianceStatus) and `reviewReason` (axe's `messageKey`, e.g. `bgOverlap`, so a `contrastRatio: 0` is not mistaken for zero contrast). Both are optional and additive — no change for existing consumers.

## 3.0.1

### Patch Changes

- caa24e9: Fix Norwegian legal context (Intern #23). Corrections to law-reference data, six of them customer-visible via generated accessibility statements:

  - **Enforcement body (customer-facing):** `ENFORCEMENT_BODIES.NO` and `ENFORCEMENT_BODIES_DETAILED.NO.wad` now name the body a Norwegian reader files complaints with — `Tilsynet for universell utforming av ikt (uu-tilsynet)` — instead of the parent directorate `Digdir`. `getEnforcementBody('NO', 'public')` reads `.wad`, so this is the value that reaches a public-sector statement.
  - **EAA field emptied, not guessed:** `ENFORCEMENT_BODIES_DETAILED.NO.eaa` was `Nkom` (unverified). Norway is EEA, not EU, and the EAA has not been incorporated into the EEA agreement, so no EAA enforcement body exists in Norwegian law. The field is now empty and must not be filled with an authority name until status is verified against regjeringen.no.
  - **Law title:** `no-ikt.law` restored to the exact Lovdata short title `Forskrift om universell utforming av IKT-løsninger` (the `-løsninger` suffix was missing).
  - **Sanction wording:** `no-ikt.sanctions` no longer calls Norwegian _tvangsmulkt_ (an administrative coercive measure) Swedish _dagsböter_ (a criminal penalty). Now `Löpande vite (tvangsmulkt)`.
  - **Cross-jurisdiction data leak:** seven WCAG 1.3.1 rules in `rules.no.json` carried a Swedish `dosLagenReference` (`9 § (Struktur och relationer)`); replaced with the file's own EN 301 549 phrasing.

## 3.0.0

### Major Changes

- 3b35e3f: Declare Node >=22.22.0 via `engines`

  The published packages carried no `engines` field, so npm performed no
  version check at install time. `@holmdigital/engine` already required
  Node 22 in practice — `html-validate` needs `^22.22.0 || >=24.8.0`, and
  `commander` and `puppeteer` both need `>=22.12.0` — but a consumer on
  Node 18 or 20 installed it without any warning and only failed at
  runtime.

  All three packages now declare `node >=22.22.0`, matching the strictest
  floor the monorepo's dependency tree imposes and the only Node version
  CI exercises. This is a breaking change for consumers below that
  version, hence the major across the board.

  Documentation examples that used Node 20 (the README's GitLab CI
  snippet, the CI/CD integration guide, the developer cookbooks and the
  CI/CD strategy doc) have been corrected to Node 22 — as written they
  could not have run the CLI.

## 2.10.0

### Minor Changes

- 2560b6f: Engelsk klarspråkstext för alla regler i klarspråksrapporten (fallback-golvet för alla språk).

  Tidigare hade bara 11 av reglerna en engelsk klarspråksrubrik och förklaring, resten föll tillbaka på den råa axe-regelkoden. Nu har samtliga 48 regler ett fullständigt `plainLanguage`-block på engelska (rubrik, vad som händer, vem det drabbar, vad det kostar, så fixar du, påverkansnivå). Engelskan är fallback-golvet för alla övriga språk, så varje regel renderar nu läsbar klarspråkstext i stället för en rå regelkod även när målspråket saknar egen text. Engelsk täckning går från 11 till full täckning (48/48).

  Samtidigt städas en dubblettpost för regeln `audio-description` bort ur samtliga icke-svenska regelfiler (da, de, en, en-CA, en-GB, en-US, es, fi, fr, nl, no). Den kvarvarande posten är den korrekta, lokaliserade formuleringen; alla tolv regelfiler har därmed 48 unika regler.

## 2.9.0

### Minor Changes

- ec01cfb: Svensk klarspråkstext för alla regler i klarspråksrapporten (`--plain --lang sv`).

  Tidigare hade bara 11 av reglerna en svensk klarspråksrubrik och förklaring, resten föll tillbaka på den råa engelska regelkoden. Nu har samtliga regler ett fullständigt `plainLanguage`-block på svenska (rubrik, vad som händer, vem det drabbar, vad det kostar, så fixar du, affärspåverkan), skrivet i klarspråk ur besökarens och kundens perspektiv. Svensk täckning går därmed från 11 till full täckning.

  Samtidigt städas en dubblettpost för regeln `audio-description` bort ur den svenska regeldatan. Den kvarvarande posten är den korrekta, ovillkorliga formuleringen av WCAG 1.2.5 AA.

## 2.8.0

### Minor Changes

- 18fe29c: Add WCAG 2.2 Phase 1 criteria as forward-looking documentation: 2.5.8 Target Size (Minimum), 2.5.7 Dragging Movements and 2.4.11 Focus Not Obscured (Minimum). All three ship across the 12 locale files mapped to EN 301 549 V4.x clauses (9.2.5.8, 9.2.5.7, 9.2.4.11).

  Only 2.5.8 Target Size is detectable automatically (ruleId "target-size" wires to axe-core's single WCAG 2.2 rule), so it carries plain-language copy and testability automated true. 2.5.7 and 2.4.11 ship as manual checks (testability automated false, requiresManualCheck true) and as ICT manual checklist entries, because no automated scanner catches them.

  These three criteria are not yet legal requirements: the legal floor stays WCAG 2.1 AA via EN 301 549 V3.2.1. All three carry dosLagenApplies false and no WAD or EAA legal context. They switch to legal-requirement status only when EN 301 549 V4.x is referenced in the OJEU.

### Patch Changes

- cd4ab8f: Klarspråksrapport: launch-blockerande fixar (KRAV 1-4)
  - **KRAV 1 (engine):** gruppera fynd av samma regel till ett enda klarspråkskort med antal förekomster ("color-contrast, 5 förekomster"), i både terminal- och PDF-renderaren. Identiska fynd staplas inte längre som dubblettkort. Grupperingen sker per `ruleId` oavsett position; introtexten ("Hittade N hinder") räknar fortfarande det totala antalet fynd.
  - **KRAV 2 (standards):** ta bort det oinfriade löftet "Vi anger exakt vilka färger…" / "We specify exactly which colours…" ur color-contrast-copyn (sv + en). Den kvarvarande fix-meningen står på egen hand utan hex-koder eller kontrastkvot.
  - **KRAV 3 kort sikt (engine):** läck inte axe-cores råa engelska hjälptext in i en svensk klarspråksrapport. Omappade fynd visar nu en översatt, självbärande ram-mening i stället; engelska rapporter behåller den tekniska detaljen.
  - **KRAV 4 (engine):** visa en fördelningsrad direkt under "Hittade N hinder" med antal per affärspåverkansnivå ("7 hinder: 6 Försämrar upplevelsen, 1 Värt att putsa"), räknat per förekomst så delsummorna summerar till totalen, ordnat efter affärspåverkan, bara nivåer med fynd, badge-etiketter via t(). Gäller terminal och PDF.

## 2.7.0

### Minor Changes

- aa05346: **Plain-language copy (klarspråksläge)** (2026-06-12):

  New public API for non-technical recipients — the plain-language data layer that feeds the `--plain` report mode in `@holmdigital/engine`.

  **New types:**
  - `BusinessImpactLevel`: `'stoppar-kop' | 'hindrar' | 'forsamrar' | 'putsning'` — business-impact severity used for sorting plain reports
  - `PlainLanguageCopy`: interface with six fields (`headline`, `whatHappens`, `whoIsAffected`, `businessImpact`, `howToFix`, `impactLevel`) — plain-language copy for non-technical recipients

  **New optional fields:**
  - `ConvergenceRule.plainLanguage?: PlainLanguageCopy` — plain-language copy on each rule
  - `RegulatoryReport.plainLanguage?: PlainLanguageCopy` — copied through by `generateRegulatoryReport`

  **Data:**
  - 10 Swedish plain-language texts in `rules.sv.json` (`form-labels`, `alt-text`, `name-role-value`, `keyboard-accessible`, `color-contrast`, `link-purpose`, `heading-order`, `language-of-page`, `landmark-one-main`, `region`)
  - 10 English plain-language texts in `rules.en.json` (same rule set, same tone rules: you-address, business-first, no em/en dashes, no invented statistics)

  **Enrichment (D-03):**
  - `generateRegulatoryReport` now copies `plainLanguage` from the rule, with a silent English fallback for languages without translated texts (`lang !== 'en'` and rule missing `plainLanguage`)

  **Deferred (D-02):** Real translations for de/fr/es/nl/fi/dk/no pending native editorial review. The D-03 EN fallback activates automatically for those languages until texts land.

## 2.6.1

### Patch Changes

- 5d7716e: Public discoverability pass (npm metadata only, no runtime changes):
  - **engine**: description now leads with the differentiator (WCAG/EN 301 549 failure mapping to national law and enforcement bodies across 17 jurisdictions) instead of tech internals. Keywords: fixed `ead` typo to `eaa`, added `en-301-549`, `accessibility-testing`, `cli`. README clarifies the 12-language total vs per-subsystem locale file counts (9 CLI output files, 16 statement templates).
  - **standards**: description no longer leads with a single national law (DOS Act); now leads with the 17-jurisdiction WCAG-to-EN 301 549-to-national-law mapping with enforcement-body lookups. Keywords: added `en-301-549`, `eaa`.
  - **components**: description sharpened to lead with regulation-ready components and the 12-locale accessibility-statement generator. Keywords: added `en-301-549`, `eaa`, `accessibility-statement`.
  - All three packages: `homepage` now points to https://wiki.holmdigital.se (the developer documentation front door).

## 2.6.0

### Minor Changes

- 884f142: **Canada federal ACA + France RGAA authority correction** (legal review 2026-06-05):
  1. **New: Accessible Canada Act (`ca-aca`)** — Adds the Canadian federal accessibility framework that was missing entirely. Previously only `ca-aoda` (Ontario provincial) was encoded. Canadian users now resolve the federal layer via `getNationalLawByFramework('ACA', 'CA')`.
     - Law: Accessible Canada Act (S.C. 2019, c. 10) + Accessible Canada Regulations (SOR/2021-241), ICT amendments in force **2025-12-05**
     - Technical standard: **CAN/ASC-EN 301 549:2024** (WCAG 2.1 Level AA)
     - Primary authority: Accessibility Commissioner (Canadian Human Rights Commission)
     - Sector authorities: CRTC (broadcasting + telecom), Canadian Transportation Agency (federally-regulated transport)
     - Compliance deadlines: federal public sector **2027-12-05**, federally-regulated private sector **2028-12-05**
     - Sanctions: up to **250 000 CAD per violation** via administrative monetary penalties (ACA Part 6)
     - Scope: `both` (covers both federal public and federally-regulated private)
  2. **New `LegalFramework` value: `'ACA'`** — added to the union type and registered in `frameworks.json`. `getLegalFramework('ACA')` now returns metadata. This is the MINOR-bump driver (new type union member).
  3. **Schema updated** — `national-laws-schema.json` `euFramework` enum extended with `"ACA"`.
  4. **Fix: France RGAA authority** — `fr-rgaa.enforcement.authorityName` corrected from `'Arcom'` to `'DINUM (Direction interministérielle du numérique)'`. DINUM is the current supervisory authority for RGAA 4.1.2; Arcom only takes over when RGAA 5 publishes (expected late 2026). Previous Arcom designation pre-empted a not-yet-effective transition. `ENFORCEMENT_BODIES.FR` and `ENFORCEMENT_BODIES_DETAILED.FR.wad` updated to match. A new `note` on the `fr-rgaa` entry documents the upcoming RGAA 5 transition (WCAG 2.2 + mobile + documents + Arcom authority).
  5. **Regression tests added** — `getEnforcementBody('FR')` must NOT return Arcom; `fr-rgaa.enforcement.authorityName` must contain DINUM. CA federal layer is asserted with explicit deadlines and `ACA` framework resolution.

  **Items intentionally NOT changed this release** (per the 2026-06-05 legal review, deferred for separate triggers):
  - SE: DIGG + PTS → Digitaliseringsmyndigheten (effective 2027-01-01) — wait for autumn 2026 proposition.
  - EU: EN 301 549 V4.1.x — do not switch until OJEU citation, not just ETSI publication.

  **Sources verified:** Canadian Human Rights Commission, Government of Canada accessible-canada regulations summary, numerique.gouv.fr, DesignGouv RGAA 5 article.

### Patch Changes

- cd1c749: **Italy EAA data correction** — fixes four substantive errors in `it-eaa` discovered during compliance review:
  1. **Law number corrected**: `D.Lgs. 82/2024` → **`D.Lgs. 82/2022`** (Decreto Legislativo 27 May 2022, n. 82 — the actual Italian EAA transposition decree). Previous year was wrong.
  2. **Enforcement authority corrected**: `AGCOM` → **`AgID`**. Per D.Lgs. 82/2022 art. 21, AgID supervises EAA-covered digital services (websites, e-commerce, banking, transport, electronic communications, e-books). AGCOM only handles audiovisual media services (D.Lgs. 208/2021 art. 31). The previous AGCOM designation made `getEnforcementBody('IT', 'private')` return the wrong authority for ~99% of EAA service use cases — including every site `hd-a11y-scan --country IT --sector private` would normally target.
  3. **Sector authority split documented**: new `sectorAuthorities` array makes the three-authority split explicit:
     - **MIMIT** (Ministero delle Imprese e del Made in Italy) — products
     - **AgID** — digital services (primary)
     - **AGCOM** — audiovisual media services only
  4. **Sanctions corrected**: previous range `2,500–40,000 EUR` mixed values from two distinct sanction categories. Corrected to **`5,000–40,000 EUR`** (substantive violation per accessibility requirements). The 2,500–30,000 EUR range (non-cooperation / failure to comply with AgID orders) is now documented in `sanctions.description` rather than blended into the primary range.
  5. **Pre-istruttoria phase documented**: description now reflects AgID's actual enforcement procedure — notification → response window → remediation period → sanctions only on persistent non-compliance. This shifts the messaging from "you risk fines" to "have a response routine ready" (the operative obligation).
  6. **Delibera 84/2026 referenced**: in addition to existing Delibera 38/2026 (Linee Guida, 4 March 2026), `note` now references **Delibera 84/2026** (15 May 2026 — Regolamento sulle procedure di accertamento delle violazioni e applicazione delle sanzioni), which is where the pre-istruttoria procedure is codified.
  7. **Complaint mechanism origin clarified**: `note` makes explicit that the complaint mechanism is NOT new in 2026 — it was established by Legge n. 4/2004 (Legge Stanca) and D.Lgs. 82/2022. The 2026 Delibere systematise the review procedure.
  8. **`ENFORCEMENT_BODIES_DETAILED.IT.eaa`** in `src/index.ts` updated to `Agency for Digital Italy (AgID)` (was AGCOM). Regression test added to assert this never returns AGCOM for `IT` private sector.

  **Impact:** Any consumer calling `getEnforcementBody('IT', 'private')` or generating Italian AccessibilityStatements has been receiving incorrect authority data since the IT entry was added. Upgrade strongly recommended.

  **Sources verified:** UserWay, AccessiWay, Federprivacy, dirittobancario, fiscoetasse, eye-able, redazionefiscale, agendadigitale.eu, AgID official PDF.

## 2.5.7

### Patch Changes

- 8309522: Compliance data updates per legal review (2026-05-22):
  - **IT (`it-eaa`)**: Update sanctions to reflect AgID Delibera n. 38/2026 — PMI fines 2,500–40,000 EUR per violation; added new `note` field documenting the service-level accessibility approach per Linee Guida sull'accessibilità dei servizi digitali (in force 24 March 2026 via Gazzetta Ufficiale, based on EN 301 549 V3.2.1 + WCAG 2.1 AA, mandatory for e-commerce, banking, transport, electronic communications, audiovisual, e-books).
  - **US (`us-ada-title-ii`)**: Correct compliance deadlines per DOJ Interim Final Rule (published 2026-04-20) — large entity 2026-04-24 → 2027-04-26; small entity 2027-04-24 → 2028-04-26. Comment period closes 2026-06-22. Technical standard (WCAG 2.1 AA) unchanged. The previous large-entity deadline had already passed in the data — consumers were seeing an expired deadline.
  - **IE (`ie-eaa`)**: Add new entry for S.I. No. 636/2023 (European Union (Accessibility Requirements of Products and Services) Regulations 2023), in force 28 June 2025. CCPC is primary market surveillance authority; sector authorities are Central Bank of Ireland (financial services, per Consumer Protection Code 2025) and ComReg (electronic communications). Includes EAA microbusiness exemption (Article 4(5)). Ireland's full EAA transposition was missing from the package since 2025-06-28.
  - **frameworks (`REHAB`)**: Align `technicalStandard` effective date to 2027-05-11 per HHS IFR 2026-09266 (consistent with `us-hhs-section-504` realign in 2.5.6).

## 2.5.6

### Patch Changes

- 9b7fbca: HHS Section 504: extend WCAG 2.1 AA compliance deadlines by one year per HHS Interim Final Rule (Federal Register doc 2026-09266, published 2026-05-11, docket HHS-OCR-2026-0004). Large entity (15+ employees) deadline 2026-05-11 → 2027-05-11; small entity (<15 employees) deadline 2027-05-10 → 2028-05-10. Technical standard (WCAG 2.1 AA), scope, sanctions, and `effectiveDate` (2024-07-08) unchanged. Updates `data/legal/national-laws.json` entry `us-hhs-section-504`.
- 49a6bec: HHS Section 504: realign `effectiveDate` and `inForce` to reflect the WCAG benchmark enforcement trigger, not the underlying rule's 2024 effective date. Per HHS Interim Final Rule 2026-09266 (published 2026-05-11), the WCAG 2.1 AA compliance benchmark for large entities (15+ employees) starts 2027-05-11. `us-hhs-section-504` now publishes `effectiveDate: "2027-05-11"` and `inForce: false` — the `inForce` flag will flip to true automatically when the drift-guard validates `effectiveDate <= today` on 2027-05-11. Note field expanded to document the field-semantic choice. Compliance deadlines and all other metadata unchanged.

## 2.5.4

### Patch Changes

- HHS Section 504: extend WCAG 2.1 AA compliance deadlines by one year per HHS Interim Final Rule (Federal Register doc 2026-09266, published 2026-05-11, docket HHS-OCR-2026-0004). Large entity (15+ employees) deadline 2026-05-11 → 2027-05-11; small entity (<15 employees) deadline 2027-05-10 → 2028-05-10. Technical standard (WCAG 2.1 AA), scope, sanctions, and `effectiveDate` (2024-07-08) unchanged. Updates `data/legal/national-laws.json` entry `us-hhs-section-504` (compliance deadlines + descriptions + note). Consumers should re-fetch `getComplianceDeadlines('us-hhs-section-504', 'US')`.

## 2.5.3

### Patch Changes

- c75ea8a: PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — `npm publish` now fails if lint or typecheck reports errors. No source changes.

## 2.5.2

### Patch Changes

- PUB-09 (Phase 33): `verify` script now chains `lint` (eslint) and `typecheck` (tsc --noEmit) before `check:exports` / `check:types` / `test:ci`. `prepublishOnly` unchanged — npm publish now fails if lint or typecheck reports errors. No source changes; current source was already clean against both new gates.

## 2.5.1

### Patch Changes

- ef3d381: Fix HHS Section 504 type contract, framework metadata gaps, and EAA inForce drift (post-2.5.0 review)

  **Type contract fix (was a published-API break in 2.5.0)**
  - Widen `NationalLaw.complianceDeadlines` to a discriminated union covering both `populationThreshold` (ADA Title II) and `employeeThreshold` (HHS Section 504). The 2.5.0 entry shipped `employeeThreshold` against a type that only declared `populationThreshold`, leaving downstream TypeScript consumers with `undefined` where the type promised `number`. New `ComplianceDeadlineEntry` type is exported.
  - Stop excluding `**/*.test.ts` from `tsc` so this class of defect is caught at build time. Updated existing tests to narrow on the new discriminant.

  **Framework metadata symmetry**
  - Add `REHAB` (Rehabilitation Act of 1973 / Section 504) and `DDA` (Disability Discrimination Act 1992) entries to `frameworks.json`. Previously `getLegalFramework('REHAB')` and `getLegalFramework('DDA')` were callable per the union type but returned `null` because the data file had no entries.

  **inForce semantics correction**
  - HHS Section 504 entry is now `inForce: true` with `effectiveDate: "2024-07-08"` (when the HHS Final Rule took effect). The previous `inForce: false` was incorrect — Section 504 obligations are active; only the WCAG 2.1 AA technical benchmark is staged on `complianceDeadlines.largeEntity.deadline` (2026-05-11).
  - Same drift fix applied to four EAA private-sector entries (SE/lptt, FI/fi-eaa, DE/de-bfsg, NL/nl-eaa) which carried `inForce: false` despite `effectiveDate: "2025-06-28"` having passed almost a year ago.

  **Convergence rules tagging**
  - Add `"REHAB"` to the `legalContext.appliesTo` array of all 46 WCAG 2.1 A/AA convergence rules across 12 locale files (552 changes). `getRulesByFramework('REHAB')` now returns the same coverage set as ADA Title II/III. Level AAA rules are excluded (Section 504 does not mandate AAA).

  **EAA microbusiness exemption metadata**
  - New `MicrobusinessExemption` type and `NationalLaw.exemptions.microbusiness` field. Encodes the EAA Article 4(5) exemption: services-providing microenterprises with fewer than 10 employees AND annual turnover or balance sheet at or below 2 million EUR are exempt from accessibility requirements. Both conditions must be met cumulatively. Applied to all 7 EAA private-sector entries (SE, FI, DE, NL, IT, PT, PL).

  **Schema validation**
  - New `schema/national-laws-schema.json` (JSON Schema Draft-07) for structural validation of `national-laws.json`. Vitest now validates the data file against the schema on every run via `ajv`.

  **Test coverage additions**
  - Date-driven `inForce` assertion across all 16 supported countries replaces the brittle entity-ID exclusion filter. Catches future drift like the EAA inForce gap.
  - Direct coverage of the public framework API: `getNationalLawByFramework('REHAB', 'US')`, `getLegalFramework('REHAB')`, `getLegalFramework('DDA')`, `getRulesByFramework('REHAB')`.
  - Regression guard: filtering `euFramework === 'ADA' && scope === 'private'` returns only Title III, not the new Section 504 entry.
  - New tests asserting microbusiness exemption presence and EAA-mandated thresholds across all 7 EAA private-sector entries.
  - Schema validation test fails the suite if any future law entry violates the structural contract.

## 2.5.0

### Minor Changes

- f2e722e: Add HHS Section 504 Final Rule (US) to national laws database

  Adds `us-hhs-section-504` — the HHS Digital Accessibility Final Rule (45 C.F.R. Part 84, 89 FR 40066) — as a new US law entry. Covers private organizations receiving federal financial assistance from HHS (hospitals, FQHCs, research institutions, health plans). Enforcement deadline for entities with 15+ employees is 2026-05-11; smaller entities by 2027-05-10. Technical standard: WCAG 2.1 Level AA (45 C.F.R. § 84.85).

  Also adds `'REHAB'` to the `LegalFramework` union type to represent the Rehabilitation Act framework (no direct EU equivalent).

## 2.4.0

### Minor Changes

- b30249a: Add ADA Title II and Title III support for US accessibility compliance

  **Background:** DOJ's final rule (28 CFR Part 35, published 2024-04-24) requires
  state and local governments to meet WCAG 2.1 Level AA by 2026-04-24 (entities
  serving 50,000+ population) or 2027-04-24 (smaller entities).

  **@holmdigital/standards:**
  - New `LegalFramework` value: `'ADA'`
  - Two new US laws in `national-laws.json`: `us-ada-title-ii` (public sector) and
    `us-ada-title-iii` (private sector)
  - New DOJ authority id `us-doj`
  - New optional `NationalLaw.complianceDeadlines` field (Title II: 2026-04-24 /
    2027-04-24)
  - ADA framework added to `frameworks.json` with WCAG 2.1 AA
  - 46 convergence rules across all 12 rule-locale files now tagged with `"ADA"`
    in `legalContext.appliesTo`
  - Fixed inconsistency: `ENFORCEMENT_BODIES_DETAILED.US.wad` is now
    `'General Services Administration (GSA)'` to align with the Section 508
    enforcement entry. `.eaa` remains DOJ. `ENFORCEMENT_BODIES.US` unchanged (DOJ).
  - New statement tool: ITIC VPAT template (`itic-vpat`)

  **@holmdigital/engine:**
  - Statement generator is now sector-aware for US: `--country US --sector public`
    references ADA Title II + Section 508 with DOJ as enforcement body;
    `--sector private` references ADA Title III with DOJ as enforcement body
  - en-us.json template's intro and enforcement sections now use
    `{<national_law>}` placeholder for dynamic law resolution

  **Migration:** No breaking changes. Consumers using
  `getNationalLawByFramework('WAD', 'US')` still receive Section 508.

## 2.3.0

### Minor Changes

- 4cb76cd: feat: add Australia as supported jurisdiction (DDA, AHRC, en-au)
  - Extended `LegalFramework` type with `'DDA'` — first non-EU framework
  - Added `'AU'` to `Country` type (17 countries total)
  - DDA + DTA law entries in `national-laws.json` with AHRC enforcement body
  - `en-au` AccessibilityStatement template with voluntary DDA framing and AHRC complaint pathway
  - `en-au.json` engine statement template with DDA-specific prose
  - `.au` TLD auto-detection (.au, .com.au, .gov.au)
  - Critical `{<national_law>}` DDA fallback fix for non-WAD/EAA frameworks
  - 292 tests across 3 packages with full auto-syncing coverage

## 2.2.0

### Minor Changes

- Add IT, PT, PL locale support and EAA sector-aware enforcement bodies and national laws

## 2.1.1

### Patch Changes

- fd94d05: v0.1 Stability Pass — type safety, version accuracy, and locale coverage

  **@holmdigital/standards**
  - Added typed `FailingNode`, `EnrichedReport`, and `LegalContext` interfaces
  - Tightened `HolmDigitalInsight` type (removed index signature, added `reasoning` field)
  - All type exports are now fully typed with zero `as any` casts

  **@holmdigital/components**
  - `AccessibilityStatement` now supports 9 locales: en, sv, no, fi, da, nl, de, fr, es
  - Fixed placeholder substitution across all locales (Norwegian `publiseringsdato` bug)
  - FormField accessibility and ESM compatibility fix
  - Button component now spreads `...props` to `<button>` element (fixes onClick, aria-label, type being silently dropped)

  **@holmdigital/engine**
  - Build-time version injection via tsup `define` — replaces 3 hardcoded version strings
  - Zero `as any` casts in production code (was 4)
  - Scan results return fully typed `EnrichedReport[]` with `failingNodes` and `legalContext`
  - Upgraded axe-core from 4.10.2 to 4.11.1

## 2.1.0

### Minor Changes

- a5f0169: # Accessibility Statement Enhancements

  Significant improvements to the accessibility statement generation system:
  - **Multi-Language Support**: Added comprehensive support for 9 European languages (EN, SV, NO, DA, FI, NL, DE, FR, ES).
  - **Externalized Templates**: Templates are now managed as separate JSON files in `@holmdigital/engine`, allowing for professional legal phrasing and easier localization.
  - **Enhanced Component**: Refactored the `AccessibilityStatement` component in `@holmdigital/components` to support template-driven rendering, localized date formatting, and automatic icon mapping for all supported languages.
  - **Centralized Enforcement Data**: Moved regulatory authority data to `@holmdigital/standards` for consistent use across all packages.
  - **Improved Substitution Logic**: Built-in support for conditional blocks and choice strings in both HTML and Markdown outputs.
  - **Hardened JUnit Generation**: Enhanced the JUnit XML reporter to include rich metadata properties, successful test case counts, and detailed failure information (DOM targets and HTML snippets) in `<system-out>` blocks for better CI diagnostics.

## 2.0.0

### Major Changes

- 7013ff2: # 🚀 Release Overview: Premium Ecosystem & Nordic Expansion

  This release marks a major evolution of the HolmDigital Accessibility Ecosystem, transitioning from a technical scanner to a full-scale regulatory compliance suite.

  ## ⚖️ Standards & Legal Database (National Laws)
  - **Nordic Expansion**: Added full support for **Norway (Forskrift om universell utforming)**, **Finland (Laki digitaalisten palvelujen)**, and **Denmark (Lov om tilgængelighed)**.
  - **National Law Mapping**: New database for 12+ countries mapping WCAG to specific national legislations and enforcement bodies (e.g., Digg in SE, Traficom in FI).
  - **Sanctions & Enforcement**: Integrated data on legal sanctions and maximum fines for non-compliance across EU/Nordic regions.
  - **Statement Tools**: Registry of official national accessibility statement generators.

  ## 🚂 Engine: CI/CD & Reporting
  - **Premium V2 Statements**: Complete overhaul of the accessibility statement generator with glassmorphism card design, embedded Lucide-style icons, and micro-animations.
  - **Automatic Badge**: Sites with 100% compliance now automatically trigger a green Shields.io badge in the CLI and reports.
  - **GitHub Actions Integration**: Added native output formatting for GitHub Actions summary pages.
  - **JUnit Reporting**: Support for standard JUnit XML output for CI/CD dashboards (GitLab, Azure DevOps).
  - **Expanded CLI**: New flags for `--publish-date`, `--org`, `--response-time`, and `--country`.
  - **New Locales**: Added `no`, `fi`, `da` (and `nb`, `dk` aliases) for all engine outputs and statements.

  ## 🧱 Components: Prescriptive UI
  - **29+ Accessible Components**: Full library includes `DataTable`, `Combobox`, `TreeView`, `DatePicker`, `MultiSelect`, `NavigationMenu`, and more.
  - **Compliant by Default**: Built-in ARIA management, focus traps, and WCAG AAA contrast patterns.
  - **Premium V2 Statement Component**: The `AccessibilityStatement` component now supports rich metadata for multi-company deployments.

  ## 📚 Documentation
  - **Centralized Docs**: Moved all package-specific guides to a structured root `/docs` directory.
  - **New Guides**: Added "EU Legal Framework", "Nordic Authorities", and "CI/CD Integration" master guides.

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.

## 1.0.0

### Major Changes

- # Initial Public Release 🚀

  We are proud to announce that the HolmDigital Accessibility Ecosystem is now public!

  ### 🔍 @holmdigital/engine

  The core scanning engine is now available for public use.
  - **CLI Tool**: Run accessibility scans directly from your terminal or CI/CD pipeline.
  - **Regulatory Compliance**: Automated mapping of WCAG failures to EN 301 549 and DOS-lagen.
  - **PDF Reporting**: Generate beautiful, shareable compliance reports.
  - **HTML Validation**: Integrated `html-validate` checks for semantic correctness.

  ### 📚 @holmdigital/standards

  The single source of truth for accessibility rules.
  - **Machine-Readable Rules**: Complete database of WCAG 2.1 criteria mapped to legal requirements.
  - **Multi-Language Support**: Rules available in English, Swedish, German, French, and Spanish.
  - **Risk Assessment**: "DIGG-aligned" risk levels to help prioritize remediation.

  ### 🧩 @holmdigital/components

  A library of accessible-by-default React components.
  - **Core Components**: Button, FormField, Modal, Dialog, NavigationMenu, and more.
  - **Compliance Built-in**: Pre-configured ARIA attributes, keyboard navigation, and contrast ratios.

## 0.3.0

### Minor Changes

- feat: localize accessibility rules to Swedish, German, French, and Spanish
  fix: correct legal references in localized rules

## 0.2.2

### Patch Changes

- chore: ensure license files are included in package

## 0.2.1

### Patch Changes

- docs: update README with HTML validation feature

## 0.2.0

### Minor Changes

- Initial public release of the engine and standards packages.
