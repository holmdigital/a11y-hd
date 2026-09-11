---
"@holmdigital/engine": patch
---

Intern #65 fynd 5 och 6 — tre mallar hårdkodade lagnamn och gick förbi lagvalet.

Lagvalet var rätt sedan #64. Dokumentet sa ändå fel, eftersom `en-ca.json`, `en-gb.json` och `en-us.json` bar lagnamnen i klartext i stället för `{<national_law>}`. **Fixen i #64 var byggd och osynlig precis där den spelade roll.**

| Land | Dokumentet sa | Dokumentet säger nu |
|---|---|---|
| CA, båda sektorerna | `the Accessible Canada Act and the Accessibility for Ontarians with Disabilities Act` | Accessible Canada Act, aldrig Ontarios provinslag |
| GB privat | `the Public Sector Bodies … Regulations 2018` (offentliga sektorns regelverk) | fallback-frasen — GB har ingen EAA-post |
| US, `technical`-sektionen | `Section 508 of the Rehabilitation Act` i båda sektorerna | ADA Title II & Section 508 för offentlig, Title III för privat |

US-fallet är värt att notera särskilt: `intro` och `enforcement` i `en-us.json` var redan korrekta, så samma dokument kunde säga **ADA Title III i ett stycke och Section 508 i nästa**.

Sju fält, sju rader, ingen logikändring. Alla 16 mallar är svepta — det var exakt dessa tre.

**Det som ändras för anropare:** de tre locales namngav tidigare sitt eget lands lag oavsett `country`. Nu följer de `metadata.country` som alla andra mallar. Ett `--lang en-ca` utan `--country CA` ger alltså inte längre kanadensisk lag av en slump.

Sex nya tester, varav två sveper **alla** mallar mot **alla** lagnamn i datan, så en ny mall eller en ny lag fångas utan att någon behöver minnas det här. Ett av dem spärrar tom lagrad för alla 17 länder × 2 sektorer.

Tre befintliga tester **låste fast defekten** — de krävde lagnamnet i klartext och gick grönt just för att mallen gick förbi lagvalet. De är rättade, med kommentar om varför.
