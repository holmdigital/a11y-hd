---
"@holmdigital/engine": patch
---

Intern #64 — lagvalet går nu på land + scope + inForce, aldrig på `euFramework`, och en lag som inte trätt i kraft renderas aldrig som gällande rätt.

**M4, felet som nådde kund.** `inForce` deklarerades i typen och lästes ingenstans. `us-hhs-section-504` har `inForce: false` med ikraftträdande 2027-05-11, men namngavs ändå som bindande lag i tillgänglighetsredogörelsen för amerikansk privat sektor. En lag som inte trätt i kraft får aldrig stå som gällande rätt i ett dokument kunden lämnar ifrån sig som sitt eget. Filtret gäller nu båda ställen där en lagpost renderas, även tillsynsmyndigheten.

**M1, lagvalet.** Den gamla raden frågade efter ramverk EAA på privatspåret och WAD annars. Två följder, båda fel: en lag med `scope: 'both'` blev osynlig för privatspåret om dess ramverk inte råkade heta EAA, och en lag vars ramverk varken var WAD eller EAA kunde aldrig väljas alls. Nu används `getNationalLawForSector()`.

Fyra av 34 utfall ändras, och alla fyra är de rapporterade felen:

| Land | Sektor | Före | Efter |
|---|---|---|---|
| NO | privat | ingen lag, fallback-fras | Forskrift om universell utforming av IKT-løsninger |
| US | privat | ADA Title III **& Section 504** | ADA Title III |
| CA | offentlig | **AODA** (Ontarios provinslag) | Accessible Canada Act |
| CA | privat | ingen lag, fallback-fras | Accessible Canada Act |

Inga andra utfall rör sig. AU och US behåller sina egna grenar: AU bär två DDA-lagar och hade tyst bytt till `au-dta` om den routats genom sektorsväljaren, vilket ingen bett om.

Ett test som fanns låste fast defekten — det krävde att Section 504 nämndes för amerikansk privat sektor. Det är vänt, och ersatt av en generell spärr som failar om **någon** post med `inForce: false` når kundtext, för något land eller sektor. Nästa framtida lag fångas av samma test utan att någon behöver minnas den.
