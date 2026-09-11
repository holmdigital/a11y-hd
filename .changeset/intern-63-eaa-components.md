---
"@holmdigital/components": patch
---

Intern #63 — `AccessibilityStatement` följer de rättade tillsynsmyndigheterna.

Komponenten läser `getEnforcementBody(country, sector)` ur `@holmdigital/standards`, så två renderade värden ändras med 4.0.0:

- **FR, privat sektor:** Arcom → DGCCRF. Arcom var fel som generellt påstående; dess EAA-behörighet omfattar bara tillgång till audiovisuella medietjänster samt e-böcker och läsprogramvara.
- **ES, privat sektor:** Ministerio de Consumo → tillsynsmyndighet utsedd av den autonoma regionen, eller av Ceuta eller Melilla (Ley 11/2023 art. 27.3). Ministeriet är inte tillsynsmyndighet enligt lagen, och Spanien har inget enskilt nationellt organ att namnge.

Ingen API-ändring. Komponenten läser varken `NationalLaw.enforcement` eller `.sanctions` direkt, så att de blev valfria i 4.0.0 påverkar den inte.
