# Förslag: klarspråksrapport i engine (opt-in via CLI)

**Datum:** 2026-06-05
**Upprättad av:** Meja + Ebba (underlag), Amanda (sammanställning)
**Paket:** `@holmdigital/engine` (nuvarande 2.5.5) och `@holmdigital/standards` (nuvarande 2.5.7)
**Typ:** Utvecklingsförslag, ej publicering. Kräver Karins godkännande innan npm-release.

---

## Bakgrund

En mottagare (företagare, ej utvecklare) fick en skanningsrapport och förstod den inte. Rapporten var skriven på utvecklarspråk med WCAG-koder. Det är rätt för en utvecklare men obegripligt för en vd eller e-handlare, och då missar rapporten hela sitt syfte.

Slutsatsen är inte att göra om verktyget. Slutsatsen är att lägga till ett klarspråksläge som man väljer själv.

## Beslut från Karin (ramen för förslaget)

1. **Default ändras inte.** Verktyget är byggt för utvecklare i första hand och förblir det. Kör man utan flaggor får man dagens utvecklarrapport, oförändrad.
2. **Klarspråk är ett aktivt val** via CLI-flagga.
3. **Allt annat är bara val av CLI-kommandon.** Klarspråk läggs bredvid det som redan finns och ersätter ingenting.

## Föreslagna flaggor

- `--audience <developer|plain>`, default `developer` (inget befintligt beteende ändras).
- `--plain` som genväg för `--audience plain`.
- Kombineras fritt med befintliga flaggor:
  - `hd-a11y-scan url` → som idag, utvecklarspråk.
  - `hd-a11y-scan url --plain` → klarspråk i terminalen.
  - `hd-a11y-scan url --plain --pdf rapport.pdf` → klarspråk som PDF (den man skickar till en kund).
  - `--plain --lang sv`, `--plain --sector private` osv.

Eftersom config laddas via cosmiconfig fungerar `audience: "plain"` i `.a11yrc` automatiskt genom samma merge.

---

## Vad som ska byggas

### 1. Ny texttyp i standards (`packages/standards/src/types.ts`)

Optional, så all befintlig data fungerar oförändrad. Engelska nycklar, svenska (lokaliserade) värden, precis som övrig regeltext.

```ts
export type BusinessImpactLevel =
  | 'stoppar-kop'   // kunden kan inte slutföra köpet
  | 'hindrar'       // kunden kämpar, många ger upp
  | 'forsamrar'     // friktion, en del faller ifrån
  | 'putsning';     // litet, men värt att rätta

export interface PlainLanguageCopy {
  headline: string;       // rubrik utan facktermer
  whatHappens: string;    // vad som faktiskt är fel på sidan
  whoIsAffected: string;  // vilka av kundens besökare
  businessImpact: string; // vad det kostar i köp, kunder, ranking
  howToFix: string;       // konkret nästa steg
  impactLevel?: BusinessImpactLevel; // valfri, annars härleds från diggRisk
}
```

Lägg `plainLanguage?: PlainLanguageCopy` på `ConvergenceRule`. `EnrichedReport` ärver den automatiskt via `RegulatoryReport`.

### 2. Häng på klarspråket i enrichment (viktigast)

`enrichResults()` anropar redan `getConvergenceRule(report.ruleId, lang)`. Hämta `plainLanguage` på samma ställe och lägg på rapporten där. Två vinster:

- Rätt koppling garanterat (samma id-uppslagning som redan fungerar).
- Klarspråket blir tillgängligt för terminal, `--json` och `--pdf` på en gång, inte bara terminalen.

Gör alltså INTE en andra uppslagning vid utskrift. Återanvänd `getConvergenceRule`, bygg ingen ny locale-laddare.

### 3. Klarspråksrenderare för terminalen

Ny fil `packages/engine/src/reporting/plain-report.ts`. CLI:ts utskriftskedja ser i dag ut ungefär så här: `if (options.json && options.light) ... else if (options.json) ... else if (options.light) ... else { dashboard }`. Lägg klarspråk som en egen gren precis före dashboard-fallbacken (det sista `else`):

```ts
} else if (options.audience === 'plain') {
  const { renderPlainReport } = await import('../reporting/plain-report');
  renderPlainReport(result, options.lang);
} else {
  // befintlig dashboard, oförändrad
}
```

Sortera raderna efter affärspåverkan (impactLevel, annars härledd från `holmdigitalInsight.diggRisk`). Saknas klarspråkstext för en regel faller raden tillbaka på dagens `remediation.description`.

### 4. Klarspråksläge i PDF (så `--plain --pdf` ger en skickbar PDF)

`generateReportHTML(result, sector)` får ett tredje argument `audience`, och mallen väljer klarspråkstexterna på samma sätt som terminalrenderaren. Det ändrar inte defaulten, det styr bara vad flaggan gör när man valt den.

---

## Detaljer att få rätt

### Koppla texterna till rätt regel-id
Regeldatan använder semantiska id (`alt-text`, `form-labels`, `info-and-relationships`, `color-contrast`), inte axe:s råa id (`image-alt`, `label`). De färdiga klarspråkstexterna måste hängas på de korrekta id:na i `rules.sv.json`, annars hittas ingen text och rapporten faller tillbaka på den tekniska. Detta är den enda biten som kräver noggrann handpåläggning.

### impactLevel sätts för hand på de viktigaste reglerna
Regulatorisk risk (`diggRisk`) är inte samma sak som konverteringspåverkan. Köpknapp och kassafält ska markeras som det som faktiskt stoppar köp, även om deras regulatoriska risk klassas lägre. För övriga regler räcker den automatiska härledningen från `diggRisk`.

### Tonregler (fingerprint)
- Du-tilltal. Skriv "din kund", aldrig "användaren".
- Ingen fackterm utan att den förklaras i samma mening.
- Aldrig skuldbeläggande. Ramen är "du har inte gjort fel, du har bara inte fått veta förrän nu".
- Affärsnytta före teknik. Vad det kostar kommer före vad det är.
- Konkret nästa steg på varje rad.
- Inga tankstreck. Korta stycken.

### Håll affärspåståendena ärliga
Klarspråkstexterna ska vara kvalitativa eller källbelagda. Inga uppfunna procentsatser i den skarpa kundrapporten.

---

## Två källdokument ska bli en sanning

Underlaget finns i två filer som säger emot varandra:

- `klarsprak-cli-implementation.md` (engelska nycklar, text i standards).
- `klarsprakslager-engine.md` (svenska nycklar, text i engine, plus åtta färdiga exempeltexter och tonregler).

Bygg enligt CLI-versionen (text i standards). Behåll de åtta färdiga texterna och tonreglerna från den andra filen som innehåll. Den svensk-nycklade datatypen i engine skrotas.

De åtta första texterna att lägga in (vanligast hos e-handlare): produktbilder utan beskrivning, svag knappkontrast, kassafält utan etikett, "läs mer"-länkar, ikonknappar utan namn, sajt som inte går att använda utan mus, rubriker i fel ordning, sida utan språkangivelse.

---

## Sammanfattning av ändringar

- `standards/src/types.ts`: `PlainLanguageCopy` + `BusinessImpactLevel`, fält på `ConvergenceRule`.
- `standards` enrichment: lägg `plainLanguage` på rapporten i `enrichResults()`.
- `engine/src/reporting/plain-report.ts`: ny terminalrenderare.
- `engine/src/cli/index.ts`: flaggorna `--audience` och `--plain`, ny gren i utskriften.
- `engine` PDF: `audience`-argument i `generateReportHTML` plus klarspråksmall.
- `rules.<lang>.json`: fyll på `plainLanguage` per regel, ett språk i taget.

Allt bakåtkompatibelt. Saknad klarspråkstext faller tillbaka på dagens beskrivning, så utrullning kan ske regel för regel.

---

## Öppen fråga till Daniel

Hur bygger `enrichResults()` upp `result.reports` i detalj? Vi vill hänga `plainLanguage` på exakt det steg där `getConvergenceRule` redan körs, så att terminal, json och pdf får samma data utan dubbel uppslagning.

## Föreslagen leverans

1. Branch i `a11y-hd` med de fyra delarna ovan plus de åtta texterna kopplade till rätt regel-id.
2. Testskanning av johancask.com med `--plain --pdf` så Karin ser den färdiga PDF:en lokalt.
3. Release som minor av både `@holmdigital/engine` och `@holmdigital/standards` efter Karins godkännande (npm-publicering går via Karin).
