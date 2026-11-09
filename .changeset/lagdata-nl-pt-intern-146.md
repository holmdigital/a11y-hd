---
"@holmdigital/standards": minor
---

Intern #146: lagdata kontrollerad mot primärkälla. nl-eaa och pt-wad är rättade, och en dold dubbelparentes i lagfrasen är borta.

**Data (`national-laws.json`)**
- **nl-eaa:** det tidigare namnet "Warenwetbesluit toegankelijkheidseisen producten en diensten" finns inte, och `fullName` ("Implementatie van de Richtlijn (EU) 2019/882 (EAA)") var ingen titel.
  - `law` är nu citeertiteln "Implementatiewet toegankelijkheidsvoorschriften producten en diensten".
  - `fullName` är opschrift, ordagrant från wetten.overheid.nl.
  - `lawUrl` är nu `https://wetten.overheid.nl/BWBR0049571/`. Posten hade ingen länk tidigare.
  - En `note` förklarar att Warenwetbesluit toegankelijkheidsvoorschriften 2024 (BWBR0049688) bara gäller produkter, och att kraven för e-handel står i BW 6:230fa–230fd. Vilket instrument ett utlåtande ska namnge avgör Juno.
- **pt-wad:**
  - `lawUrl` ledde till felsidan på diariodarepublica.pt. Den pekar nu på ELI-adressen `https://data.dre.pt/eli/dec-lei/83/2018/10/19/p/dre/pt/pdf`, som leder till PDF:en.
  - `law` "DL 83/2018" står inte i akten. Den officiella formen "Decreto-Lei n.º 83/2018" används i stället.
  - `fullName` har fått kommatecknet som i portalens rubrik: "…, de 19 de outubro".
- **pt-eaa:** samma kommatecken: "Decreto-Lei n.º 82/2022, de 6 de dezembro".

Inget av namnen är attesterat än, så lagnamnsgrinden visar fortfarande fallback-frasen för NL och PT. Kunddokumenten ändras inte förrän Juno attesterar.

**Kod: `lawPhrase` tappar parentesen även när det långa namnet redan bär kortnamnet inom parentes.** Nederländernas opschrift avslutas med citeertiteln, så nl-wad hade skrivit "… (Tijdelijk besluit digitale toegankelijkheid overheid) (Tijdelijk besluit digitale toegankelijkheid overheid)" samma dag som namnet attesterades.

Grinden dolde felet: ett oattesterat namn renderas aldrig, så inget test såg raden. `lawPhrase` exporteras nu, och ett nytt test prövar frasen för **varje** post, attesterad eller inte. Testet var rött för nl-wad och nl-eaa före rättningen.
