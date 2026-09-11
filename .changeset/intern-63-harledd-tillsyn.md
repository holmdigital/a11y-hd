---
"@holmdigital/standards": minor
---

Intern #63 — `ENFORCEMENT_BODIES` och `ENFORCEMENT_BODIES_DETAILED` härleds ur `national-laws.json`, plus Junos tre dataavgöranden.

## Motsägelsen som fanns i fyra länder samtidigt

Samma paket gav två olika svar på vem som utövar tillsyn, och bara ett av dem var det som faktiskt renderades i ett utlåtande:

| Lag | Datan sa | Konstanten sa |
|---|---|---|
| `gb-psbar` | Central Digital and Data Office | Equality and Human Rights Commission |
| `nl-wad` | Ministerie van Binnenlandse Zaken | Logius |
| `de-bfsg` | delstatlig marknadskontroll | Federal Network Agency |
| `ca-aoda` | Accessibility Directorate of Ontario | Accessibility Commissioner (CHRC) |

Båda konstanterna härleds nu ur lagposternas egna `enforcement`-fält, och den flata ur den detaljerade, så de tre kan inte drifta isär igen. Den handskrivna tabellen finns kvar oexporterad som sista utväg för länder utan lagdata — i dag bara `EU`.

**Sidoeffekt som är hela poängen:** myndighetsnamnet blir landets eget. Ett svenskt dokument sa `Swedish Post and Telecom Authority (PTS)`; det säger nu `PTS (Post- och telestyrelsen)`, precis som lagposten (Intern #65 fynd 3).

## Junos dataavgöranden

- **`au-dta.euFramework`: `DDA` → `DAS`.** Digital Access Standard är ingen lag utan ett internt Commonwealth-styrdokument utan talerätt för tredje part, och att dela DDA:s kod var både sakligt fel och en latent bugg: `getNationalLawByFramework` returnerar första arrayträffen, så en omsortering hade tyst kunnat göra styrdokumentet till Australiens lag. `LegalFramework` får därför ett nytt värde.
- **`dk-eaa` får tillsynsmyndighet.** Sikkerhedsstyrelsen, belagd via myndighetens eget pressmeddelande. Nyansen *"hovedparten af områderne"* står i `responsibility` — den täcker de flesta men inte alla områden, och vilka undantagen är förblir obelagt. `sanctions` är fortfarande utelämnad.
- **`de-bfsg`: Bundesnetzagentur är fel.** BFSG § 20 lägger marknadskontrollen hos delstaterna, och ordet "Bundesnetzagentur" förekommer inte en enda gång i lagen. `authority`-id:t pekade dessutom på BITV:s federala organ medan namnet sa något annat; båda är rättade.

## Två mekanismer, medvetet åtskilda

- `ENFORCEMENT_NO_SINGLE_AUTHORITY` — **undantag**, för äkta rättslig frånvaro. Spanien har ingen nationell tillsynsmyndighet (Ley 11/2023 art. 27.3). Ett undantag säger *"namnge det här i stället"* och får aldrig skugga ett värde datan kan leverera; ett test failar om det gör det.
- `ENFORCEMENT_SUPPRESSED` — **undertryckning**, som säger *"namnge ingen"* och därför får skugga datan. I dag bara norsk privat sektor (Intern #23 Fynd B). Skälet är inte att tillsynen är overifierad — UU-tilsynet utövar tillsyn över `no-ikt` — utan att en tillsynssektion i ett privat utlåtande antyder en rapporteringsplikt en privat aktör inte har.

Ny exporterad `deriveEnforcementLaw(country, sector)`, som speglar motorns egen AU/US-routing exakt.
