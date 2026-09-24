---
'@holmdigital/engine': minor
'@holmdigital/components': minor
---

Tillgänglighetsutlåtandet kan nu säga hur bedömningen gjordes. Det nya fältet `reviewMethod` har tre värden:

- `self-assessment`: organisationen har bedömt sin egen webbplats. Det är default.
- `external-review`: en extern part har granskat webbplatsen, och utlåtandet namnger den.
- `no-review`: tillgängligheten är uppskattad utan granskning.

**Vad kunden ser.** Ingenting ändras om anroparen inte sätter fältet. Utlåtandet säger då att organisationen gjort en självskattning, precis som i dag och byte för byte. Med `external-review` står granskarens namn i avsnittet om hur webbplatsen testats, till exempel "Granskaren AB har gjort en oberoende granskning av Testkommunen." Valet läses bara ur fältet, aldrig ur efterlevnadsutfallet eller scanresultatet.

Fälten finns i motorns `StatementMetadata` och i komponentens `AccessibilityStatementProps`. Motorn skickar dem vidare till komponenten, så HTML- och Markdown-utlåtanden säger samma sak. CLI:t har två nya flaggor, `--review-method` och `--reviewer`, och nycklarna `reviewMethod` och `reviewer` i config-filen. Ett okänt värde, eller en extern granskning utan granskare, stoppas innan skanningen börjar.

**Två avsteg från kravspecen. Båda finns för att utlåtandet inte ska påstå något falskt.**

1. **Granskaren har ett eget fält, `reviewer: { name, url? }`.** Kravspecen föreslog att återanvända `generatorTool`. Men `generatorTool` styr också sidfoten ("Genererad med hjälp av …"). Med granskaren där skulle sidfoten påstå att dokumentet genererats med granskaren. Sidfoten namnger därför verktyget som förut. Granskarens plats i texten fylls bara från `reviewer`, aldrig från `generatorTool`. `url` tas emot men renderas inte.
2. **Extern granskning utan namngiven granskare är ett fel.** Motorn och komponenten kastar ett fel när `reviewMethod` är `external-review` och `reviewer.name` saknas eller är tomt. Med verktyget som standardvärde hade utlåtandet sagt "HolmDigital Regulatory Engine har gjort en oberoende granskning", alltså exakt felet i Intern #91.

Nya tester läser alla mallar i båda mallsatserna, så en ny mall omfattas automatiskt. Mot den gamla koden fäller de 68 utlåtandetester i motorn och 51 i komponenten.
