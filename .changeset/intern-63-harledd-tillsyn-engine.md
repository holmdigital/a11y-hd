---
"@holmdigital/engine": patch
---

Intern #63 — tillsynsmyndigheten i utlåtandet får landets eget namn.

`{<enforcement_body>}` läser `getEnforcementBody()`, som nu härleds ur `national-laws.json`. Fyra länders utlåtanden namnger därmed en annan myndighet än i går, och i samtliga fall är det den datan alltid pekat ut:

| Land | Sektor | Före | Efter |
|---|---|---|---|
| GB | offentlig | Equality and Human Rights Commission | Central Digital and Data Office (CDDO) |
| NL | offentlig | Logius | Ministerie van Binnenlandse Zaken en Koninkrijksrelaties |
| DE | privat | Federal Network Agency (Bundesnetzagentur) | Marktüberwachungsbehörden der Länder |
| SE | båda | `Agency for Digital Government (Digg)` / `Swedish Post and Telecom Authority (PTS)` | `Digg (Myndigheten för digital förvaltning)` / `PTS (Post- och telestyrelsen)` |

Det sista är Intern #65 fynd 3: ett svenskt dokument bar ett engelskt myndighetsnamn bredvid ett korrekt svenskt lagnamn.

Norsk privat sektor är oförändrad — tillsynssektionen utelämnas fortfarande helt (Intern #23 Fynd B), nu genom en uttrycklig undertryckning i standards i stället för genom en tom rad i en handskriven tabell.

AU-grenens kommentar speglar Junos slutgiltiga avgörande 2026-09-11: `au-dda` är Australiens enda bindande instrument i båda sektorerna, och uppslaget är entydigt nu när `au-dta` har en egen ramverkskod.
