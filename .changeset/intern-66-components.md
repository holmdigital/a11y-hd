---
"@holmdigital/components": patch
---

Intern #63 och #66 — `AccessibilityStatement` bar hela defektuppsättningen från Intern #64, som lagades i motorn men aldrig här.

Verifierat mot publicerad **components 4.0.1**. Så här renderade komponenten lagraden:

| Land | Sektor | Renderade |
|---|---|---|
| CA | offentlig | **AODA** — Ontarios provinslag namngiven som Kanadas |
| CA | privat | **tom sträng** |
| NO | privat | **tom sträng** |
| GB | privat | **tom sträng** |
| US | privat | ADA Title III **& Section 504** — `inForce: false` till 2027-05-11, namngiven som bindande rätt |

Raden som orsakade allt var samma uttryck motorn hade före #64:

```ts
getNationalLawByFramework(sector === 'private' ? 'EAA' : 'WAD', country)
  ?? getNationalLawByFramework('DDA', country)
```

Alltså M1 (lagval på ramverk i stället för sektor), M4 (`inForce` läses inte) och Intern #31:s tomma lagrad, alla tre levande i ett publicerat paket som kunder renderar utlåtanden ur. Ingen av dem var ny — de rättades i `@holmdigital/engine` 3.3.6 och komponenten divergerade tyst.

**Nu speglar logiken motorns `statement-generator.ts` exakt:**

- `getNationalLawForSector(country, sector)` — land, `scope`, `inForce`, och subnationella lagar uteslutna, vilket är det som håller AODA ute från Kanadas landsnyckel
- egna grenar för **AU** (Juno 2026-09-11: `au-dda` är Australiens enda bindande instrument i båda sektorerna) och **US** (parallella federala författningar), båda `inForce`-filtrerade
- `NATIONAL_LAW_FALLBACK` med ordagrant samma tolv strängar som motorn, så ett utlåtande inte säger olika saker beroende på om det kom ur CLI:t eller komponenten
- samma prefix-deduplicering, så lagnamnet inte upprepas i parentes

**Ett test låste fast M4 även här.** `US private sector resolves to ADA Title III + HHS Section 504` krävde att Section 504 nämndes. Det är tredje gången i det här repot ett test kodifierade felet det skulle skydda mot. Det är vänt, och kompletterat med en svepning över CA, NO och GB i båda sektorerna som failar på tom lagrad och på att Ontario namnges.
