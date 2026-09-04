---
"@holmdigital/engine": minor
---

Intern #43 fynd 1 (omarbetning) — en interstitial-/vänta-/challenge-scan ger nu ett ärligt INCONCLUSIVE-resultat i stället för en vilseledande score.

Detektionen (`interstitialSuspected`, 3.2.0) räckte inte: motorn scannade fortfarande vänta-sidan och emitterade en vanlig score/compliance (t.ex. w3.org → `score 85, FAIL, 2.2.1` — ett artefakt av vänta-sidans egen meta-refresh). En falsk 85 är värre än ett ärligt "kunde inte mäta" (Karins live-regression 2026-08-27).

**Nu:** när `interstitialSuspected` är sant kortsluter scan() till ett INCONCLUSIVE-resultat — vänta-sidans egna artefakter släpps (`reports: []`), `stats` nollas, `score` är `0`, och `htmlValidation`/`noScript` (som också mätte fel sida) hängs inte på.

**⚠️ Kontraktsändring — `complianceStatus` är nu `'PASS' | 'FAIL' | 'INCONCLUSIVE'`.** Konsumenter som grenar på fältet MÅSTE hantera det nya `INCONCLUSIVE`-värdet. Läs `complianceStatus` FÖRST — ett INCONCLUSIVE-`score` (0) är inte ett betyg; `metadata.interstitialSuspected` bär varför.

Alla reportrar säger det ärligt i stället för att visa ett rent/underkänt resultat:
- **CLI** (dashboard/light): en tydlig "kunde inte skanna riktigt innehåll"-banner, aldrig "0/100". `--plain` får ett klarspråksbesked för icke-tekniska mottagare.
- **JUnit**: ett `<error>`-testcase med `errors="1"` i stället för "0 tests" (som såg ut som PASS i CI).
- **HTML** (developer + plain): en ärlig banner i stället för ett score-kort.
- **CI**: exit 1 (inte falskt grönt) + en `::warning::`-annotering.
- **Moln**: en INCONCLUSIVE-scan laddas aldrig upp (inget riktigt innehåll att ingesta; moln-API:ts `compliance_status` är i praktiken PASS/FAIL).
- **Tillgänglighetsredogörelse** (`--statement`): genereras inte (skulle annars påstå "inga brister" från en omätt sida).

Nya i18n-nycklar (`cli.inconclusive_*`, `report.inconclusive_*`, `plain.inconclusive`) i alla nio locales. Exporterar `getStandardsVersion` (redan från 3.2.0) oförändrad. 12 tester i `intern-43.test.ts` (INCONCLUSIVE-kortslutning + kontroll-PASS + JUnit + HTML).
