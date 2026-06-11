# Klarspråksrapport i hd-a11y-scan

Lägger till möjligheten att köra `hd-a11y-scan` och få rapporten i klarspråk istället för utvecklarspråk. Tänkt för e-handlare och andra som inte läser kod, men som ska kunna förstå vad som hindrar deras kunder.

Allt nedan är anpassat efter den befintliga koden: commander, chalk, `EnrichedReport` och `result.reports`.

---

## Översikt för icke-tekniska

Idag skriver verktyget ut WCAG-koder och teknisk vägledning. Det är rätt för utvecklare, men obegripligt för en butiksägare.

Med den här ändringen kan vem som helst köra samma skanning men välja att få svaret i klartext: vad som är fel, vilka kunder det drabbar, vad det kostar i förlorade köp, och vad man gör åt det. Inga facktermer.

Texterna skrivs en gång per regel och språk, och återanvänds av både terminalen och PDF-rapporten.

---

## Flaggval

`--format` är redan upptaget för utlåtandet (html eller md), och `--lang` styr språket. Register, alltså klarspråk mot utvecklarspråk, är en egen dimension.

Förslag:

- `--audience <developer|plain>`, standardvärde `developer` så att inget befintligt beteende ändras
- `--plain` som genväg för `--audience plain`

Det går att kombinera med allt annat, till exempel `--lang sv --plain` eller `--plain --pdf rapport.pdf`.

---

## Steg 1: ny texttyp i @holmdigital/standards

### `packages/standards/src/types.ts`

Lägg till en frivillig klarspråksdel på regeln. Den är optional, så befintlig data fortsätter fungera oförändrad.

```ts
export type BusinessImpactLevel =
    | 'stoppar-kop'   // kunden kan inte slutföra köpet
    | 'hindrar'       // kunden kämpar, många ger upp
    | 'forsamrar'     // friktion, en del faller ifrån
    | 'putsning';     // litet, men värt att rätta

/**
 * Klarspråkstexter: rapport för icke-tekniska mottagare, till exempel e-handlare.
 * Lokaliseras via samma rules.<lang>.json-filer som övrig regeltext.
 */
export interface PlainLanguageCopy {
    headline: string;       // rubrik utan facktermer
    whatHappens: string;    // vad som faktiskt är fel på sidan
    whoIsAffected: string;  // vilka av kundens besökare
    businessImpact: string; // vad det kostar i köp, kunder, ranking
    howToFix: string;       // konkret nästa steg
    impactLevel?: BusinessImpactLevel; // valfri; annars härleds den från diggRisk
}
```

Lägg sedan fältet på regeln och på rapporten:

```ts
export interface ConvergenceRule {
    // ... befintliga fält ...
    plainLanguage?: PlainLanguageCopy;
}

export interface RegulatoryReport {
    // ... befintliga fält ...
    plainLanguage?: PlainLanguageCopy;
}
```

### Hjälpfunktion i `packages/standards/src/index.ts`

Så att engine kan hämta klarspråk per regel och språk utan att ladda om locale-filerna själv. Om ni redan har en intern locale-laddare, återanvänd den i stället för importerna nedan.

```ts
import type { ConvergenceRule, PlainLanguageCopy } from './types';
import rulesSv from '../data/rules.sv.json';
import rulesEn from '../data/rules.en.json';
// ... importera fler språk vid behov ...

const RULES_BY_LANG: Record<string, ConvergenceRule[]> = {
    sv: rulesSv as ConvergenceRule[],
    en: rulesEn as ConvergenceRule[],
};

export function getPlainLanguageCopy(
    ruleId: string,
    lang = 'en'
): PlainLanguageCopy | undefined {
    const rules = RULES_BY_LANG[lang] ?? RULES_BY_LANG['en'];
    return rules.find(r => r.ruleId === ruleId)?.plainLanguage;
}
```

---

## Steg 2: klarspråksrenderaren i engine

### Ny fil `packages/engine/src/reporting/plain-report.ts`

```ts
import chalk from 'chalk';
import { getPlainLanguageCopy } from '@holmdigital/standards';
import type {
    EnrichedReport,
    PlainLanguageCopy,
    BusinessImpactLevel,
    DiggRisk,
} from '@holmdigital/standards';

interface PlainRenderResult {
    url: string;
    score: number;
    reports: EnrichedReport[];
}

const IMPACT: Record<BusinessImpactLevel, { label: string; rank: number; color: (s: string) => string }> = {
    'stoppar-kop': { label: 'Stoppar köp',           rank: 4, color: chalk.red.bold },
    'hindrar':     { label: 'Hindrar kunder',        rank: 3, color: chalk.red },
    'forsamrar':   { label: 'Försämrar upplevelsen', rank: 2, color: chalk.yellow },
    'putsning':    { label: 'Värt att putsa',        rank: 1, color: chalk.gray },
};

// Fallback när en regel saknar egen impactLevel: härled från regulatorisk risk
const RISK_TO_IMPACT: Record<DiggRisk, BusinessImpactLevel> = {
    critical: 'stoppar-kop',
    high: 'hindrar',
    medium: 'forsamrar',
    low: 'putsning',
};

export function renderPlainReport(result: PlainRenderResult, lang = 'sv'): void {
    const total = result.reports.length;

    console.log('\n');
    console.log(chalk.bold(`Tillgänglighetsrapport för ${result.url}`));
    console.log(chalk.gray('----------------------------------------'));

    if (total === 0) {
        console.log(chalk.green('Vi hittade inga hinder den här gången. Snyggt jobbat.'));
        console.log('');
        return;
    }

    // Igenkänning utan skam
    console.log(`Vi hittade ${total} ${total === 1 ? 'punkt' : 'punkter'} att titta på.`);
    console.log(chalk.gray('Det betyder inte att du gjort något fel. De flesta som bygger en webbplats'));
    console.log(chalk.gray('får aldrig veta att tillgänglighet ens är en sak. Nu vet du.'));
    console.log('');
    console.log(chalk.gray('Sorterat efter vad som kostar dig mest kunder.'));
    console.log(chalk.gray('----------------------------------------'));

    const levelOf = (r: EnrichedReport): BusinessImpactLevel =>
        r.plainLanguage?.impactLevel ?? RISK_TO_IMPACT[r.holmdigitalInsight.diggRisk];

    const sorted = [...result.reports].sort(
        (a, b) => IMPACT[levelOf(b)].rank - IMPACT[levelOf(a)].rank
    );

    sorted.forEach((report, i) => {
        const plain: PlainLanguageCopy | undefined =
            report.plainLanguage ?? getPlainLanguageCopy(report.ruleId, lang);

        const badge = IMPACT[levelOf(report)];
        const headline = plain?.headline ?? report.remediation.description;

        console.log(`\n${i + 1}. ${badge.color(`[${badge.label}]`)} ${chalk.bold(headline)}`);

        if (plain) {
            console.log(`   Vad som händer: ${plain.whatHappens}`);
            console.log(`   Vem det drabbar: ${plain.whoIsAffected}`);
            console.log(`   Vad det kostar: ${plain.businessImpact}`);
            console.log(chalk.green(`   Så fixar du: ${plain.howToFix}`));
        } else {
            // Degraderar snällt tills regeln fått klarspråkstext
            console.log(`   ${report.remediation.description}`);
        }
    });

    console.log(chalk.gray('\n----------------------------------------'));
    console.log('Vill du ha hjälp att prioritera? Hör av dig, så går vi igenom listan tillsammans.');
    console.log('');
}
```

---

## Steg 3: koppla in flaggan i CLI

### `packages/engine/src/cli/index.ts`

**Lägg till flaggorna** bland de andra `.option(...)`:

```ts
    .option('--audience <type>', 'Rapportens mottagare: developer (standard) eller plain (klarspråk)', 'developer')
    .option('--plain', 'Genväg för --audience plain')
```

**I optionssammanslagningen** (där `lang`, `ci` med flera sätts), lägg till:

```ts
            audience: cliOptions.plain
                ? 'plain'
                : (cliOptions.audience || fileConfig.audience || 'developer'),
```

Och i type-castet en bit längre ner:

```ts
            audience: 'developer' | 'plain';
```

**I utskriftsdelen** ligger i dag en kedja `if (json) ... else if (light) ... else { dashboard }`. Lägg klarspråk som en egen gren före den tekniska dashboarden:

```ts
            } else if (options.audience === 'plain') {
                const { renderPlainReport } = await import('../reporting/plain-report');
                renderPlainReport(result, options.lang);
            } else {
                // --- CLI DASHBOARD IMPLEMENTATION (oförändrad) ---
                ...
            }
```

Eftersom config laddas via cosmiconfig fungerar `audience: "plain"` i `.a11yrc` automatiskt genom samma merge.

---

## Steg 4 (valfritt): klarspråk även i PDF

Den största nyttan är att kunna skicka en klarspråks-PDF till en kund. `generateReportHTML(result, sector)` kan få ett tredje argument `audience`, och mallen väljer klarspråkstexterna på samma sätt som renderaren ovan. Det kan tas i en andra omgång, terminalrapporten räcker för att komma igång.

---

## Exempel: klarspråkstext i `rules.sv.json`

Så här ser det ut att lägga `plainLanguage` på en befintlig regel. Två exempel:

```json
{
  "ruleId": "color-contrast",
  "wcagCriteria": "1.4.3",
  "...": "befintliga fält oförändrade",
  "plainLanguage": {
    "headline": "Knapptexten är för svag mot bakgrunden",
    "whatHappens": "Texten på knappar och länkar har för låg kontrast mot bakgrunden för att alla ska kunna läsa den.",
    "whoIsAffected": "Personer med nedsatt syn, äldre, och alla som handlar på mobilen i solljus.",
    "businessImpact": "Om kunden inte ser köpknappen tydligt så klickar hen inte. Svag kontrast på just den knappen är dyrt.",
    "howToFix": "Gör texten mörkare eller bakgrunden ljusare tills kontrasten räcker. Vi anger exakt vilka färger som behöver justeras.",
    "impactLevel": "forsamrar"
  }
}
```

```json
{
  "ruleId": "image-alt",
  "wcagCriteria": "1.1.1",
  "...": "befintliga fält oförändrade",
  "plainLanguage": {
    "headline": "Produktbilderna saknar beskrivning",
    "whatHappens": "Bilderna saknar textbeskrivning i koden. En besökare med skärmläsare hör bara ordet bild, inte vad bilden visar.",
    "whoIsAffected": "Kunder med synnedsättning, men också Google, som läser bildtexten för att förstå vad du säljer.",
    "businessImpact": "Produkter utan beskrivning blir osynliga både för skärmläsare och sökmotorer. Du tappar kunder och ranking på samma gång.",
    "howToFix": "Lägg en kort beskrivning på varje produktbild, till exempel stickad ylletröja i grått. Det tar några sekunder per bild.",
    "impactLevel": "hindrar"
  }
}
```

---

## Så här ser körningen ut

```
$ npx hd-a11y-scan https://johancask.com --lang sv --plain

Tillgänglighetsrapport för https://johancask.com
----------------------------------------
Vi hittade 3 punkter att titta på.
Det betyder inte att du gjort något fel. De flesta som bygger en webbplats
får aldrig veta att tillgänglighet ens är en sak. Nu vet du.

Sorterat efter vad som kostar dig mest kunder.
----------------------------------------

1. [Hindrar kunder] Produktbilderna saknar beskrivning
   Vad som händer: Bilderna saknar textbeskrivning i koden ...
   Vem det drabbar: Kunder med synnedsättning, men också Google ...
   Vad det kostar: Produkter utan beskrivning blir osynliga ...
   Så fixar du: Lägg en kort beskrivning på varje produktbild ...

2. [Försämrar upplevelsen] Knapptexten är för svag mot bakgrunden
   ...
```

---

## Sammanfattning av ändringar

- `standards/src/types.ts`: ny `PlainLanguageCopy` plus fält på `ConvergenceRule` och `RegulatoryReport`
- `standards/src/index.ts`: `getPlainLanguageCopy(ruleId, lang)`
- `engine/src/reporting/plain-report.ts`: ny renderare
- `engine/src/cli/index.ts`: flaggorna `--audience` och `--plain`, plus en gren i utskriften
- `rules.<lang>.json`: fyll på `plainLanguage` per regel, ett språk i taget

Allt är bakåtkompatibelt. Saknas klarspråkstext för en regel faller rapporten tillbaka på den befintliga beskrivningen, så ni kan rulla ut text regel för regel.
