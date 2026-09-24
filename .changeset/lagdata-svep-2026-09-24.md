---
'@holmdigital/standards': minor
---

Lagdatasvepet 2026-09-24: Sverige (Intern #83), sex ikraftträdanden (Intern #63), och två sanktionstak som inte fanns i lagen (Intern #70, #88).

**Minor, eftersom en typ tillkommer:** `NationalLaw.exemptions.statutory?: StatutoryExemption[]`, med `kind` (`actor`, `content`, `disproportionate-burden`, `transitional`), `description` och `legalBasis`. Typen `exemptions` rymde bara mikroföretagsundantaget, och DOS-lagen har inget sådant (den binder offentliga aktörer) men fyra andra undantag. Fältet är valfritt, så ingen befintlig konsument påverkas.

**Ikraftträdanden.** Sex poster bar direktivets frist eller lagens datum i stället för lagens eget ikraftträdande:

| Post | Före | Efter |
|---|---|---|
| `dos-lagen` | 2019-09-23 | 2019-01-01 |
| `de-bitv` | 2019-09-23 | 2011-09-22 |
| `es-une` | 2018-09-23 | 2018-09-20 |
| `it-wad` | 2004-01-09 | 2004-02-01 |
| `pl-wad` | 2019-04-04 | 2019-05-23 |
| `pt-wad` | 2018-10-19 | 2019-01-01 |

Alla sex datum ligger bakåt i tiden, så `inForce` ändras inte för någon post. `no-ikt` behåller 2014-07-01, som är efterlevnadsfristen. `note` förklarar nu båda datumen. Fem EAA-poster har fått sitt formella ikraftträdande i `note`, eftersom `effectiveDate` bär tillämplighetsdagen.

**Sverige.**

- `dos-lagen.exemptions.statutory` har fyra poster: 8 § med ändringen genom Lag (2025:992), som datan inte speglade, 9 §, 12 § och övergångsbestämmelse 2.
- `lptt.sectorAuthorities` följer nu förordning (2023:676) 28–31 §§. Webbplatser, appar och e-biljetter för persontransport ligger hos **Konsumentverket, inte PTS**. PTS egna tjänsteområden saknades helt i listan.
- `lptt.exemptions.microbusiness` vilar nu på svensk lag (2 §, 10 §) i stället för direktivet. Texten skiljer helt undantag för tjänster från en lättnad för produkter.
- `lptt.note` säger att fristen till 2030-06-27 gäller produkter i tjänsteproduktionen och aldrig får läsas som ett allmänt anstånd.

**Sanktionstak.**

- `de-bfsg`: 500 000 EUR → **100 000 EUR**. § 37 Abs. 2 ger 100 000 för bland annat tjänsteledet och 10 000 för övrigt.
- `fr-rgaa`: 300 000 EUR → **50 000 EUR**. Art. 47-1 ger 50 000 för huvudkravet och 25 000 för deklarations- och plankraven.

I båda fallen står det lägre taket i `description`. Taken är två separata belopp för olika överträdelser, inte ett spann, så `minAmount` förblir 0 och inte det lägre taket. Tvåelementsformen kommer med sanktionsschemat i #70. `getMaxSanction('DE')` och `getMaxSanction('FR')` ger nu 100 000 respektive 50 000.

**Inget kunddokument ändras.** Motorn och komponenten läser varken `effectiveDate`, `exemptions`, `sectorAuthorities`, `responsibility` eller `sanctions`. Myndighetsraden i ett svenskt utlåtande för privat sektor säger därför fortfarande PTS, även för en transportkund. Att ändra det kräver ett formuleringsbeslut och ligger kvar i #83.

`dos-lagen.sanctions` är avsiktligt orörd. Borttaget samordnas med sanktionsschemat i #70.
