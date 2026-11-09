---
'@holmdigital/standards': major
---

Intern #70: sanktionsfältet i Mejas slutliga modell. Karins svar 2026-09-28 är inbyggda, och hela sanktionsdatan är kontrollerad mot primärkälla (Intern #146, 2026-11-09). Varje sanktion bär sitt lagrum och sin källa, och `cap` säger vad ett saknat belopp betyder.

**Brytande ändringar**

- **`NationalLaw.sanctions`** är ett `SanctionRange` eller en lista av dem, i stället för det platta `Sanction`. Typen `Sanction` är borttagen. `SanctionRange`, `SanctionRangeBase` och `MaxSanction` är nya.
- **Ett element** är ett belopp (`kind: 'amount'`, med valfria `minAmount` och `maxAmount`) eller en formel (`kind: 'formula'`, med `factor`, `index` och `combine`).
  - Obligatoriska fält: `type`, `description`, `currency`, `cap`, `legalBasis` och `sourceUrl`.
  - Valfria fält: `liablePerson`, `period`, `severity`, `condition` och `example`.
- **`cap`** anger var taket kommer från:
  - `stated`: lagen själv anger taket.
  - `elsewhere`: en annan författning anger det.
  - `no-ceiling`: lagen har inget tak.
  - `not-established`: inget tak är belagt.
- **Schemat avvisar motsägelser:**
  - `stated` kräver `maxAmount`.
  - `no-ceiling` och `not-established` får inte ha något `maxAmount`.
  - Ett nolltak går inte att skriva.
  - `sourceUrl` måste vara en https-adress med värd.
- **`period: 'day'`** (Karin 2026-09-28): beloppet gäller per dag eller del av dag.
- **`liablePerson`** följer lagens egna kategorier: `natural`, `legal`, `corporation`, `non-corporation` och `director-or-officer`. Ontarios AODA skiljer mellan corporation och allt annat, och en unincorporated organization är inte en fysisk person.
- **`getSanctions(lawId, country)`** ger en lista (en kopia, inte paketets data) eller `null`, i stället för ett ensamt objekt.
- **`getMaxSanction(country)`** ger `MaxSanction`: `{ lawId, amount, currency, legalBasis, sourceUrl, uncounted }` eller `null`.
  - Bara platta tak räknas: `cap: 'stated'`, ett positivt `maxAmount` och ingen `period`.
  - Allt annat räknas i `uncounted`: tak per dag, tak i en annan författning, inget tak, tak som inte är belagt och formler. Är `uncounted` större än noll är `amount` ett golv för exponeringen, inte exponeringen.
  - Det gamla löftet "underskattar aldrig" höll inte. Sverige svarade 10 000 000 SEK fast dos-lagens vite saknar tak.
  - Fältet `law` är borttaget ur svaret, eftersom lagens namn gick förbi lagnamnsgrinden (Intern #146).

**Datan, kontrollerad mot primärkälla 2026-11-09**

| Post | Element |
|---|---|
| `lptt` | 10 000–10 000 000 SEK, 37 § och 39 §. Beskrivningen citerar lagen ordagrant, med paragraf. |
| `dos-lagen` | Vitesföreläggande, `no-ceiling`, 19 § och lagen (1985:206) om viten 3 § |
| `de-bfsg` | 100 000 EUR (§ 37(1) nr 1, 7, 8, 9 och 10) och 10 000 EUR (nr 2–6). OWiG § 17 står i beskrivningen: golv 5 EUR, halva taket vid oaktsamhet, och taket får överskridas för att dra in vinsten. |
| `fr-rgaa` | 50 000 EUR (art. 47 I, bara personer i 47 I 1°–3°) och 25 000 EUR (III och IV). Ny sanktion efter sex månader (47-1 III). Källan är `/loda/`, inte `/codes/`. |
| `ie-eaa` | Class A fine, **högst €5 000** (Fines Act 2010 s. 3 och 4(1)), och 60 000 EUR vid åtal, reg. 32(6) |
| `it-eaa` | art. 24 comma 1, 2 och **3** (2 500–30 000 EUR för den som inte samarbetar). Dessutom **femprocentsgrenen** som formel: legge 4/2004 art. 9 c. 1-bis via art. 24 c. 1 andra meningen, för företag med en omsättning över 500 miljoner EUR. |
| `gb-eqa2010` | Skadestånd efter domstolsprövning, `no-ceiling`, s. 114 och 119 |
| `ca-aca` | 250 000 CAD **per dag** (s. 88), s. 77 och 91(2). Beskrivningen tar upp de tre skalorna i SOR/2021-241. |
| `ca-aoda` | Böter efter fällande dom per dag: 50 000 CAD (non-corporation), 100 000 CAD (corporation) och 50 000 CAD (director or officer, 37(5)). Dessutom O. Reg. 191/11 s. 83: 2 000 och 15 000 CAD, och per dag 50 000 och 100 000 CAD när båda bedömningarna är major. |
| `us-ada-title-iii` | 75 000 och 150 000 USD, `elsewhere`. 28 CFR 85.5 ger 118 225 och 236 451 USD för straff bedömda efter 2025-07-03, och de beloppen gäller även 2026 (91 FR 43405). |

**Källan för us-ada-title-iii avviker från Karins beslut.** Karin valde Cornell 85.5, men `sourceUrl` pekar på Cornell 36.504. Grundbeloppen (75 000 och 150 000) står bara i 36.504, och de gällande beloppen ur 85.5 står i beskrivningen.

**Poster utan sanktionsfält.** Sjutton poster saknar ett attesterat belopp och har inte längre något sanktionsfält. Det gamla fältet står ordagrant i postens `note`. Ett fält som saknas betyder "inte belagt mot primärkälla", aldrig "ingen sanktion". Tre av posterna bar belopp som är kända som fel: `es-une` 1 000 000 EUR, `ie-wad` 60 000 EUR och `nl-eaa` 900 000 EUR. `nl-eaa` tas bort nu i stället för när Intern #67 byggs. Det beslutade Daniel 2026-11-09 i Karins ställe, eftersom beloppet inte är belagt och postens lagnamn visade sig vara fel.

**Så ändras `getMaxSanction`**

| Land | Före | Efter |
|---|---|---|
| SE | 10 000 000 | 10 000 000, `uncounted: 1` |
| DE | 100 000 | 100 000 |
| FR | 50 000 | 50 000 |
| IE | – | 60 000 |
| IT | – | 40 000, `uncounted: 1` |
| CA | 250 000 | 15 000, `uncounted: 6`. ACA och AODA tar ut sina tak per dag, och 15 000 är AODA:s administrativa tak. |
| ES, US, NL | ett tal | `null` |

Ingen kod i motorn eller i komponenterna läser sanktionerna, så inget kunddokument ändras. **a11y-hd-mcp** läser `law.sanctions.maxAmount` utan att först kontrollera fältet. Det har varit trasigt sedan 4.0.0, och felet följs upp i ett eget ärende.
