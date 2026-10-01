---
"@holmdigital/engine": patch
---

Bevakning #8: `html-validate` 11.5.6 till 11.16.0, med belagd nolldrift i utfallet.

Beroendet var exakt pinnat utan caret, alltså avsiktligt fruset, eftersom dess fynd
renderas för kund i CLI:ns avsnitt "Structural HTML Issues" och som `htmlErrorsCount`
i HTML-rapporten. En bump får därför inte göras utan att utfallet jämförs först.

**Verifiering, före och efter.** Motorns exakta konfiguration
(`src/core/html-validator.ts` rad 20 till 31) kördes mot samma elva hämtade sidor
(referenssetet holmdigital.se plus webperf topp 10 offentlig sektor) med båda
versionerna. Samma bytes in i båda, så sidbrus är uteslutet:

- 924 fynd totalt i båda versionerna
- 26 regler i båda, identisk regeluppsättning
- 0 av 11 sidor med någon skillnad, per regel och per antal

**Den nya `aria`-optionen ändrar ingenting för oss.** Optionen saknas helt i 11.5.6
och har `"default": "1.2"` i 11.16.0, läst i paketets eget konfigurationsschema
(`dist/schema/config.json`), inte i changelogen. ARIA 1.2 är det beteende vi redan
hade, så 1.3 kräver ett aktivt val vi inte har gjort.

Scoren berörs inte i något fall: den räknas enbart på axe-härledda fynd
(`src/core/regulatory-scanner.ts` rad 852 till 860), aldrig på html-validate.
