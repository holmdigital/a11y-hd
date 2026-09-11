---
"@holmdigital/engine": patch
---

Intern #63 — privat sektor i Frankrike, Danmark och Spanien får ett namngivet lagrum.

Tre av EU-länderna vi säger oss täcka saknade EAA-transponering i lagdatan. En privat kund i något av dem fick ingen lag namngiven alls i sin tillgänglighetsredogörelse, bara omskrivningen "applicable accessibility requirements", trots att EAA gäller i alla tre sedan 2025-06-28. Lagposterna finns nu i `@holmdigital/standards`, och motorn plockar upp dem via `getNationalLawForSector()`:

| Land | Sektor | Före | Efter |
|---|---|---|---|
| FR | privat | ingen lag, omskrivning | Code de la consommation, art. L. 412-13 |
| DK | privat | ingen lag, omskrivning | Lov om tilgængelighedskrav for produkter og tjenester |
| ES | privat | ingen lag, omskrivning | Ley 11/2023, de 8 de mayo |

Tillsynsmyndigheten för fransk privat sektor ändras från Arcom till **DGCCRF**. Arcom var fel som generellt påstående: dess mandat omfattar bara tillgång till audiovisuella medietjänster samt e-böcker. För spansk privat sektor namnges inte längre Ministerio de Consumo, som inte är tillsynsmyndighet enligt lagen — Ley 11/2023 art. 27.3 lägger tillsynen hos de autonoma regionerna.

Offentlig sektor i de tre länderna är oförändrad, och inget annat land rör sig.

Läsningen av `enforcement` i `{<enforcement_body>}` är nu skyddad: fältet är valfritt i standards 4.0.0, och saknas det faller motorn till `getEnforcementBody()` i stället för att rendera ett tomt myndighetsnamn i kundtext.
