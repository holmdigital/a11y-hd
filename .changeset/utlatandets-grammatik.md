---
'@holmdigital/engine': patch
'@holmdigital/components': patch
---

Utlåtandet: ingen artikel framför lagnamnet, och fallback-fraser som passar sin mening (Intern #82, förberedelse).

Flera mallar hade en artikel framför lagplatsen, till exempel "con la", "com a", "mit der", "met de" och "alla". För lagnamn med annat genus gav det fel redan i dag:

- "con la Real Decreto 1112/2018"
- "em conformidade com a Decreto-Lei n.º 83/2018"
- "mit der Gesetz zur Umsetzung …"
- i komponentens tyska inledning "im Einklang mit den nationalen Rechtsvorschriften zur Umsetzung der BITV 2.0", där BITV 2.0 är den nationella lagen och inte något som genomförs

Med fallback-frasen, som bär sin egen artikel, blev meningen obegriplig: "con la los requisitos", "avec la la réglementation". Lagnamnsgrinden i #82 kommer att visa fallbacken i ungefär hälften av alla kombinationer av land och sektor.

**Vad kunden ser nu:**

- **HTML-utlåtanden på franska, spanska, nederländska, italienska och portugisiska** har ingen artikel framför lagnamnet. Det är samma meningsbyggnad som Markdown-mallarna redan hade.
- **Tyska, båda formaten:** "im Einklang mit …", "mit … vereinbar" och "für die Überwachung der Einhaltung von … zuständig".
- **Fallback-fraserna**, som visas när ingen lag kan namnges, står nu i den form deras mening kräver:
  - tyska: dativ, "den geltenden Barrierefreiheitsanforderungen"
  - polska: instrumentalis, "obowiązującymi wymaganiami dostępności"
  - finska: genitiv, "sovellettavan saavutettavuuslainsäädännön"
  - italienska och portugisiska: utan artikel, så att "a i" och "de os" inte kan uppstå

  Ingen rad visar fallbacken i dag, så den ändringen syns först när grinden i #82 tänds.

Ett nytt test läser båda mallsamlingarna. Det fäller varje artikel direkt före lagplatsen på de sex språken, kräver instrumentalis för polska och genitiv för finska, och kräver att motorns och komponentens fallback-fraser är ordagrant identiska. Det kravet stod tidigare bara i en kommentar. Mot de gamla mallarna fäller testet 8 av 10.
