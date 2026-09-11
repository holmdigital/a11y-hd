---
"@holmdigital/standards": minor
---

Intern #64 — sektors- och ikraftmedvetet lagval, plus ett fält för provinslagar.

**Ny `getNationalLawForSector(country, sector)`.** Väljer på land + scope + `inForce`, aldrig på `euFramework`. Lagar med `inForce: false` utesluts villkorslöst, och sub-nationella lagar utesluts från landsnyckeln.

**`getNationalLawByFramework()` tar nu ett valfritt `scope`.** Utan det returneras första ramverksträffen, vilket gör att `getNationalLawByFramework('ADA', 'US')` alltid ger Title II även när anroparen ville ha privatsektorns Title III. Motorn räddades bara av att den specialfallshanterade US och AU; fällan låg kvar i det publika API:t för alla andra anropare. Parametern är valfri, så befintliga anrop är oförändrade.

**Nytt valfritt `jurisdiction`-fält på `NationalLaw`** (`'national' | 'subnational'`), med `ca-aoda` satt till `subnational`. Utan det går Junos avgörande inte att bygga: `ca-aoda` och `ca-aca` är båda `scope: 'both'` och båda `inForce: true`, så land + scope + inForce ger två träffar för Kanada och avgör ingenting. Ontarios AODA ligger kvar i datan som provinslag, men kan inte längre bli landets svar. Fältet är valfritt och behandlas som `national` när det saknas, alltså rör det ingen befintlig post eller konsument.

Schemat tillåter fältet. Det ligger medvetet **inte** i `required`.
