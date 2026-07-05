---
"@holmdigital/engine": minor
---

Klarspråk i light-skanningen (den publika snabbskanningen).

Light-läget (`--light`, som den publika `/scan-light` använder) mappade tidigare axe-severity rakt av utan någon standards-uppslagning, så fynden saknade `plainLanguage` och kunde bara visas som råa regelkoder. Nu attacherar light-vägen klarspråkscopy (`plainLanguage`: rubrik, vad som händer, vem drabbas, affärspåverkan, så fixar du, påverkansnivå) för de åtta översta fynden, via `generateRegulatoryReport(id, lang)` med den inbyggda engelska fallbacken. Språket följer `getCurrentLang()`, så en svensk skanning ger svensk klarspråk.

Light-lägets JSON (`--json --light`) exponerar dessutom `headline`, `businessImpact` och `impactLevel` per fynd i `topIssues` för API-konsumenter. Bakåtkompatibelt: fälten är valfria och saknas för otäckta regler och fynd bortom topp-8.
