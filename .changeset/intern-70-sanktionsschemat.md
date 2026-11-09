---
'@holmdigital/standards': major
---

Intern #70: sanktionsfältet i Mejas slutliga modell. Varje sanktion bär sitt lagrum och sin källa, och `cap` säger vad ett saknat belopp betyder.

**Brytande ändringar:**

- `NationalLaw.sanctions` är ett `SanctionRange` eller en lista av dem, i stället för det platta `Sanction`. Typen `Sanction` är borttagen, och `SanctionRange` och `SanctionRangeBase` är nya.
- Ett element är ett belopp (`kind: 'amount'`, med valfria `minAmount` och `maxAmount`) eller en formel (`kind: 'formula'`, med `factor`, `index` och `combine`). Varje element kräver `type`, `description`, `currency`, `cap`, `legalBasis` och `sourceUrl`. Valfria är `liablePerson`, `severity`, `condition` och `example`.
- `cap` är `stated` (lagen anger taket), `elsewhere` (en annan författning gör det), `no-ceiling` (lagen har inget tak) eller `not-established` (inget tak är belagt). Ett deklarerat nolltak går inte längre att skriva, eftersom `maxAmount` måste vara större än noll.
- `getSanctions(lawId, country)` ger en lista eller `null`, i stället för ett ensamt objekt.
- `getMaxSanction(country)` räknar bara belopp med `cap: 'stated'`. Ett tak i en annan författning, en lag utan tak och ett tak som inte är belagt räknas aldrig.

**Datan.** Nio poster har sanktioner i den nya formen, skrivna ur Junos attesteringar:

| Post | Element |
|---|---|
| `lptt` | 10 000 till 10 000 000 SEK, 37 § och 39 § |
| `de-bfsg` | 100 000 EUR (§ 37(1) nr 1, 7, 8, 9 och 10) och 10 000 EUR (övriga), § 37(2). Taket får överskridas enligt OWiG § 17(4) |
| `fr-rgaa` | 50 000 EUR (art. 47 I) och 25 000 EUR (art. 47 III och IV), art. 47-1 |
| `ca-aca` | 250 000 CAD per överträdelse, och varje dag är en ny överträdelse, s. 77, 88 och 91(2) |
| `ie-eaa` | class A-böter vid summarisk dom (taket i Fines Act 2010, `elsewhere`) och 60 000 EUR vid åtal, reg. 32(6) |
| `it-eaa` | 5 000 till 40 000 EUR (art. 24 c. 1 första meningen), upp till 5 % av omsättningen för bolag enligt lag 4/2004 art. 3 c. 1-bis (art. 24 c. 1 andra meningen, formel), 2 500 till 30 000 EUR (art. 24 c. 2) och 2 500 till 30 000 EUR (art. 24 c. 3) |
| `gb-eqa2010` | skadestånd efter domstolsprövning, `no-ceiling`, s. 114 och 119 |
| `us-ada-title-iii` | civil penalty för första och senare överträdelse, taket i 28 CFR 85.5 (`elsewhere`) |
| `us-hhs-section-504` | Junos signerade sanktion från 2026-10-08 i ny form, `no-ceiling` |

Sexton poster saknar ett attesterat belopp och har inte längre något sanktionsfält. Det gamla fältet står ordagrant i postens `note`. Ett fält som saknas betyder "inte belagt mot primärkälla", aldrig "ingen sanktion". Två av de borttagna bar belopp som är kända som fel: `es-une` 1 000 000 EUR och `ie-wad` 60 000 EUR. `nl-eaa` bar 900 000 EUR, som står i Whc art. 2.15 för ACM:s böter, men utan alternativet 1 % av omsättningen och utan övriga sektorer. Beloppet är inte attesterat.

**`getMaxSanction` ändras för tre länder.** ES ger `null` i stället för 1 000 000, eftersom Real Decreto 1112/2018 saknar belopp. NL ger `null` av samma skäl. US ger `null`, eftersom taket för `us-ada-title-iii` står i 28 CFR 85.5 (`elsewhere`) och HHS-sanktionen saknar tak. IE och IT ger för första gången ett belagt tak: 60 000 och 40 000. För IT är 40 000 taket i art. 24 c. 1 första meningen. Bolag enligt lag 4/2004 art. 3 c. 1-bis har upp till 5 % av omsättningen, och den formeln räknar funktionen inte.

`getMaxSanction` ger det högsta tak per överträdelse eller beslut som en lag själv anger. Det är inte landets största exponering: formler, överträdelser som blir nya varje dag (ACA s. 88) och regler som låter taket överskridas (OWiG § 17(4)) räknas inte.

Ingen motor- eller komponentkod läser sanktionerna, så inget kunddokument ändras.
