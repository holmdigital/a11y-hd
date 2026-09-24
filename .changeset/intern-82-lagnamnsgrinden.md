---
'@holmdigital/standards': minor
'@holmdigital/engine': minor
'@holmdigital/components': minor
---

Intern #82: lagnamnsgrinden. Ett utlåtande namnger en lag bara om någon har gått i god för just det namnet mot primärkälla. Annars skriver det fallback-frasen, till exempel "gällande tillgänglighetskrav" (Karins beslut 2026-09-12).

**Det här ser kunden.** Meningen som namnger lagen skriver i stället fallback-frasen på utlåtandets språk i 18 av 32 kombinationer av land och sektor:

| Land | Sektor som får fallback-frasen |
|---|---|
| NO, DK, FI, NL, PT, CA | båda |
| DE, ES, IT, GB, US | privat |
| IE | offentlig |

I övriga 14 kombinationer står lagens namn kvar som i dag: SE, FR, PL och AU i båda sektorerna, DE, ES, IT, GB och US i offentlig sektor, och IE i privat. Inget annat i utlåtandet ändras. Myndighetsraden står kvar, eftersom tillsynsmyndighetens namn har en egen registerkategori och tystas inte i det här bygget.

**Ett land tänds** när Juno lägger `lagnamn` i `bekraftat` för landets poster i registret i holmdigital/Intern och generatorn där körs. Diffen visar då `"lagnamn"` i `attested`, en rad per post. Det finns ingen annan väg in, ingen landflagga och inget fält som sätts för hand.

**En rad byter form i motorns utlåtanden för US offentlig sektor.** Motorn skrev "Section 508 of the Rehabilitation Act of 1973 (Section 508)" och gick förbi regeln att parentesen faller när kortnamnet redan står först. Komponenten skrev raden utan parentes. Nu används samma funktion överallt, och parentesen faller.

**Nytt i standards:**

- `NationalLaw.attestation?: Attestation`, med `attestedBy`, `session`, `sources`, `attested`, `notAttested` och `subject`. Blocket genereras ur registret och redigeras aldrig för hand här. `attested` och `notAttested` är listor av typen `AttestableField`, en union, så att en felstavning fäller typkontrollen i stället för att tyst läsas som "ej granskat". Schemat har `additionalProperties: false` och ingen `minItems` på `attested`, eftersom en tom lista är en giltig spärr.
- `isNameAttested(law)` är grinden. Den läser `attested` och inget annat, och bara `subject: 'law-entry'` kan öppna den.
- `resolveNationalLawReference(country, sector, lang)` och `NATIONAL_LAW_FALLBACK` har flyttat hit från motorn och komponenten. Båda bar varsin kopia, och kopiorna har glidit isär en gång redan (Intern #63/#66). Grinden sitter på varje väg som kan returnera ett namn, också US-grenen, där varje lag i kombinationen prövas för sig.
- `sources` bär registrets källtext. Standardlistan över källor per land och anteckningarna om hur en källa nåddes ingår inte (Intern #94 fråga 1).

Motorn återexporterar `resolveNationalLawReference`, så dess publika API är oförändrat.
