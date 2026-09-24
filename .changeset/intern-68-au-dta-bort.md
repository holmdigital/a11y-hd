---
'@holmdigital/standards': major
'@holmdigital/engine': patch
'@holmdigital/components': patch
---

Intern #68: Australiens Digital Access Standard är borttagen ur lagdatan, eftersom intern regeringspolicy inte är ett lagrum.

**Regeln som gäller framåt (Juno):** en post hör hemma i `national-laws.json` bara om ett bindande rättsligt instrument gör efterlevnaden obligatorisk och möjlig att göra gällande mot den som bär skyldigheten. Digital Access Standard är obligatorisk inom den australiska regeringens egen investeringsstyrning. Standarden har däremot ingen författning, ingen tredjepartsrätt, ingen tillsynsmyndighet utanför DTA och ingen domstolsväg.

**Brytande ändringar, därav major:**

- Posten `au-dta` finns inte längre. `getNationalLaws('AU')` ger nu en post, `au-dda`, och `getNationalLaw('au-dta', 'AU')` ger `null`.
- `'DAS'` är borttagen ur `LegalFramework` och ur schemats `euFramework`. Kod som anropar `getNationalLawByFramework('DAS', …)` eller har ett uttömmande `switch` över `LegalFramework` med ett `'DAS'`-fall går inte längre att kompilera. Ta bort fallet. `getLegalFramework('DAS')` gav redan `null`.

**Inget kunddokument ändras.** Utlåtandet för Australien namngav redan Disability Discrimination Act 1992 i båda sektorerna. Det kom tidigare från en egen AU-gren i standards (`deriveEnforcementLaw`), i motorn (`resolveNationalLawReference`) och i komponenten. Grenarna fanns bara för att standarden, med scope `public`, annars vann väljarens företräde för exakt scope. Nu är de borttagna, och den generella väljaren ger samma lag, så tre handhållna speglar som kunde glida isär är borta. Med motorns gren försvann också dess hårdkodade reservtext med lagnamnet, en namnväg som gick förbi lagvalet.

Digital Inclusion Standard, som är det dokument som faktiskt rör tillgänglighet, beskrivs i `docs/guides/eu-legal-framework.md` och finns inte i datan.
