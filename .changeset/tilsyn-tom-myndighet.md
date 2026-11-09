---
"@holmdigital/components": patch
---

Intern #146: tillsynsavsnittet utelämnas när det inte finns någon tillsynsmyndighet. HTML-utlåtandet för privat norsk sektor hade tomma hål i kundtext:

> "Tilsyn har ansvaret for tilsyn med gjeldende tilgjengelighetskrav. Du kan klage til hvis du mener …"

Motorn hade regeln redan (Intern #23, `statement-generator.ts`), men HTML-utlåtandet renderas av `AccessibilityStatement`, som saknade den. Nu utelämnas avsnittet när myndighetsnamnet är tomt och det inte heller finns någon text för delad tillsyn. Svensk privat sektor behåller sin text om delad tillsyn, och norsk offentlig sektor behåller UU-tilsynet.

Felet hittades när livekörningen i Intern fick en fungerande utplockning av myndighetsnamnet. Av alla 32 kombinationer av land och sektor drabbades bara Norge, privat sektor. Nya tester täcker alla tre fallen. Det första var rött före rättningen.
