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

**Datan.** Sju poster har sanktioner i den nya formen, skrivna ur Junos attesteringar:

| Post | Element |
|---|---|
| `lptt` | 10 000–10 000 000 SEK, 37 § och 39 § |
| `de-bfsg` | 100 000 EUR (§ 37(1) nr 1, 7, 8, 9 och 10) och 10 000 EUR (övriga), § 37(2) |
| `fr-rgaa` | 50 000 EUR (art. 47 I) och 25 000 EUR (art. 47 III och IV), art. 47-1 |
| `ca-aca` | 250 000 CAD, s. 77 och 91(2) |
| `ie-eaa` | class A-böter vid summarisk dom (taket i Fines Act 2010, `elsewhere`) och 60 000 EUR vid åtal, reg. 32(6) |
| `it-eaa` | 5 000–40 000 EUR (art. 24 c. 1) och 2 500–30 000 EUR (art. 24 c. 2) |
| `gb-eqa2010` | skadestånd efter domstolsprövning, `no-ceiling`, s. 114 |

Arton poster saknar ett attesterat belopp och har inte längre något sanktionsfält. Det gamla fältet står ordagrant i postens `note`. Ett fält som saknas betyder "inte belagt mot primärkälla", aldrig "ingen sanktion". Tre av de borttagna bar belopp som är kända som fel: `es-une` 1 000 000 EUR, `ie-wad` 60 000 EUR och `nl-eaa` 900 000 EUR. `us-ada-title-iii` är attesterad, men registret saknar källadressen, och om taket står här eller någon annanstans väntar på Juno. Fältet kommer tillbaka när båda frågorna är avgjorda.

**`getMaxSanction` ändras för tre länder.** ES ger `null` i stället för 1 000 000, eftersom Real Decreto 1112/2018 saknar belopp. US och NL ger `null` av samma skäl. IE och IT ger för första gången ett belagt tak: 60 000 och 40 000.

Ingen motor- eller komponentkod läser sanktionerna, så inget kunddokument ändras.
