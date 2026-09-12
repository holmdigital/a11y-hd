---
"@holmdigital/standards": patch
---

Intern #63 och #66 — 41 fältändringar ur Junos attestering av alla 32 lagposter.

## Fyra påhittade lagnamn ute ur datan

| Post | Namnet vi skrev | Vad som finns |
|---|---|---|
| `fi-wad.law` | `Laki digitaalisten palvelujen saavutettavuudesta` | `…tarjoamisesta`. `saavutettavuudesta` betyder tillgänglighet, `tarjoamisesta` betyder tillhandahållande. Lagen vi namngav finns inte |
| `fi-eaa.fullName` | `Lag om tillgänglighetskrav för produkter och tjänster (EAA)` | Det namnet finns, men det är **produktlagen** 102/2023. Motorn skannar tjänster. Rätt lagrum är 306/2019 **3 a kap.** |
| `pt-eaa.law` | `DL 101-D/2023` | DRE:s ELI-resolver lämnar inte ut något sådant diploma på något av 168 prövade datum under 2023. Rätt akt är **82/2022**, belagt i artigo 1.º |
| `nl-eaa.law` | `Warenwetbesluit toegankelijkheidseisen producten en diensten` | Motsvarar ingen nederländsk författning — **orörd**, vilket av två riktiga instrument posten ska avse är obeslutat |

## Sex sätt en levande länk kan vara fel

Alla sex hittades i vår egen data, och inget av dem hade fångats av ett jobb som kontrollerar svarskod:

- **fel lag:** `dk-wad` pekade på lag **693**, om återbetalning av olagligt statsstöd vid dricksvattenskyddsavgift. Rätt är 692. Båda svarar 200.
- **fel lag igen:** `nl-wad` pekade på `BWBR0040990`, ett **redovisningsprotokoll för sjukförsäkring**. Rätt är `BWBR0040936`.
- **obefintlig:** två `ada.gov`-adresser gav 404.
- **programportal i stället för lagtext:** `us-508` pekade på `section508.gov`, GSA:s vägledningssajt. Lagrummet är 29 U.S.C. 794d.
- **överspelad konsolidering:** `au-dda` pekade på en version som säger om sig själv *"Superseded version"*, giltig till 2017.
- **föråldrad sökväg:** Finlex `ajantasa`-URL:en 308-redirectar.

**Tio poster fick sin första `lawUrl`**: `fi-eaa`, `dk-eaa`, `fr-eaa`, `es-une`, `es-eaa`, `it-wad`, `pt-wad`, `pt-eaa`, `pl-wad`, `pl-eaa`. Elva saknade en före; nu bara `nl-eaa`, som är medvetet orörd. Noteras: `fr-eaa`s länk svarar **403** eftersom Légifrance blockerar maskinell hämtning — Juno läste innehållet i ett arkivsnapshot av samma kanoniska URL. Icke-200 betyder alltså inte trasig, vilket är halva skälet till att ett automatiskt länkjobb avvisades.

## Omskrivningar som ändrade sakinnehåll

- **`us-ada-title-iii.fullName`** sa `Nondiscrimination … in Public Accommodations and Commercial Facilities`. eCFR säger **`by` Public Accommodations and `in` Commercial Facilities**. Källan skiljer diskriminering *utövad av* en public accommodation från diskriminering som *sker i* en commercial facility; vår omskrivning slog ihop leden och ändrade därmed vem bestämmelsen träffar.
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
