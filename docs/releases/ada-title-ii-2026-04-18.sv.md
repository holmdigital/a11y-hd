# ADA Title II-stöd i @holmdigital/standards 2.4.0 + @holmdigital/engine 2.5.0

> **Publicerad:** 2026-04-18 · **Författare:** HolmDigital-teamet · **Språk:** Svenska · [English version](./ada-title-ii-2026-04-18.en.md)

## TL;DR

Från och med `@holmdigital/standards@2.4.0` och `@holmdigital/engine@2.5.0` stöder verktyget **ADA Title II** och **ADA Title III** — de amerikanska tillgänglighetslagarna för offentlig och privat sektor. Releasen publicerades på npm sex dagar innan den skarpa compliance-deadlinen **2026-04-24**, som gäller för delstatliga och kommunala myndigheter i USA som betjänar 50 000+ invånare.

| Paket | Före | Efter |
|-------|------|-------|
| `@holmdigital/standards` | 2.3.0 | **2.4.0** |
| `@holmdigital/engine` | 2.4.1 | **2.5.0** |
| `@holmdigital/components` | 2.3.0 | 2.3.0 (oförändrad) |

Två deadlines enligt 28 CFR § 35.200(b) ur DOJ:s slutliga regel (publicerad 2024-04-24):

- **2026-04-24** — delstatliga/kommunala myndigheter med 50 000+ invånare
- **2027-04-24** — mindre myndigheter och specialdistrikt

Verktyget ger nu juridiskt korrekt information för amerikanska kunder via `--country US --sector public|private` och via de nya programmatiska API:erna `getNationalLawByFramework('ADA', 'US')` och `getNationalLaws('US')` med scope-medveten filtrering.

---

## Bakgrund: varför ADA Title II betyder något

### Lagens struktur

**Americans with Disabilities Act of 1990** (ADA, 42 U.S.C. §§ 12101 et seq.) är den centrala amerikanska lagen mot funktionsbaserad diskriminering. Den består av flera "Titles" med olika räckvidd:

| Title | Vem omfattas | Enforcement | Teknisk standard | Sanktionsmekanism |
|-------|--------------|-------------|------------------|-------------------|
| **Title II** | Delstater, kommuner, county, specialdistrikt | **DOJ**, Civil Rights Division | **WCAG 2.1 AA** (per 28 CFR Part 35) | DOJ-utredningar, settlement agreements, privata stämningar för injunctive relief + skadestånd. Ingen fixed penalty-schedule. |
| **Title III** | Privat sektor ("public accommodations" — hotell, restauranger, e-handel, banker, sjukvård) | **DOJ**, Civil Rights Division | WCAG 2.1 AA (de facto via case law — *Robles v. Domino's Pizza*, *Gil v. Winn-Dixie*) | Privata stämningar (42 U.S.C. § 12188, endast injunctive relief i federal domstol), DOJ civil penalties per 28 CFR § 36.504 (inflationsjusterade) |
| **Section 508** (separat lag — Rehabilitation Act) | Federala myndigheter | **GSA** (General Services Administration) | WCAG 2.0 AA via ICT refresh | Klagomål, stämningar |

### Varför deadlinen 2026-04-24 kom just nu

Den 8 augusti 2023 inledde DOJ rulemaking-processen för digital tillgänglighet under Title II. Den slutliga regeln (89 FR 31320) publicerades i Federal Register 2024-04-24 och kodifierar WCAG 2.1 Level AA som teknisk standard för delstatliga/kommunala webbplatser och mobilappar.

Compliance-fristerna är stegvisa baserat på befolkning:

```
Publicering av final rule:  2024-04-24
Stor entitet (50k+ pop):    2024-04-24 + 2 år  =  2026-04-24   ← NÄSTA VECKA
Liten entitet (<50k pop):   2024-04-24 + 3 år  =  2027-04-24
```

### Vad som var fel innan 2.4.0

I versionerna innan denna release fanns **endast Section 508** som amerikansk lag i `national-laws.json`, med GSA som enforcement body. Det innebar två juridiska fel för amerikanska kunder:

1. **Fel lag:** delstatliga/kommunala myndigheter omfattas av Title II, inte Section 508. Privata företag omfattas av Title III.
2. **Fel myndighet:** GSA hanterar federala myndigheters Section 508-efterlevnad. DOJ Civil Rights Division hanterar både Title II och Title III.

Verktyget genererade alltså juridiskt felaktiga tillgänglighetsredogörelser för tusentals kommuner, counties och kommersiella webbsidor i USA.

---

## Vad vi byggde — @holmdigital/standards 2.4.0

Lagt till på typ- och datalager, inga breaking changes.

### 1. Ny `LegalFramework`-medlem: `'ADA'`

**Fil:** [`packages/standards/src/types.ts:12`](../../packages/standards/src/types.ts#L12)

```typescript
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA';
```

Ramverket för legalFramework-typen har nu fyra medlemmar. Vi övervägde en separat `USFramework`-typ men avfärdade det: DDA (Australien) finns redan i samma union som icke-EU-värde, och en parallell typ skulle ha tvingat oss att skriva två versioner av `getRulesByFramework`, `getNationalLawByFramework`, etc.

### 2. Två separata US-lagar i `national-laws.json`

**Fil:** [`packages/standards/data/legal/national-laws.json:408-469`](../../packages/standards/data/legal/national-laws.json#L408-L469)

Vi tilldelade US-arrayen två nya entries utöver befintliga `us-508`:

```json
{
  "id": "us-ada-title-ii",
  "law": "ADA Title II",
  "fullName": "Americans with Disabilities Act Title II - Nondiscrimination on the Basis of Disability in State and Local Government Services (28 CFR Part 35)",
  "euFramework": "ADA",
  "scope": "public",
  "enforcement": {
    "authority": "us-doj",
    "authorityName": "U.S. Department of Justice, Civil Rights Division",
    "responsibility": "Enforces web accessibility requirements for state and local government entities under ADA Title II. Final rule published 2024-04-24.",
    "website": "https://www.ada.gov"
  },
  "sanctions": { /* ... */ },
  "effectiveDate": "2024-04-24",
  "complianceDeadlines": {
    "largeEntity": { "populationThreshold": 50000, "deadline": "2026-04-24", /* ... */ },
    "smallEntity": { "populationThreshold": 49999, "deadline": "2027-04-24", /* ... */ }
  }
}
```

```json
{
  "id": "us-ada-title-iii",
  "law": "ADA Title III",
  "euFramework": "ADA",
  "scope": "private",
  "enforcement": { "authority": "us-doj", /* ... */ },
  "effectiveDate": "1992-01-26"
}
```

**Varför två separata entries?** Federal separation of law. Title II och Title III är olika kapitel i ADA, styr olika sektorer, har olika sanktionsmodeller. Att komprimera dem till en entry hade dolt den juridiska distinktionen. `scope`-fältet (`"public"` / `"private"`) möjliggör sektor-filtrering utan att behöva ytterligare typ.

### 3. Nytt optional `complianceDeadlines`-fält

**Fil:** [`packages/standards/src/types.ts:272-276`](../../packages/standards/src/types.ts#L272-L276)

```typescript
export interface NationalLaw {
    id: string;
    law: string;
    // ... existing fields ...
    note?: string;
    /** ADA-specific: compliance deadlines keyed by entity size (currently only populated for us-ada-title-ii). */
    complianceDeadlines?: {
        largeEntity?: { populationThreshold: number; deadline: string; description: string };
        smallEntity?: { populationThreshold: number; deadline: string; description: string };
    };
}
```

**Varför `optional`?** Endast ADA Title II har entity-size-baserade deadlines. Inga andra lagar i databasen följer den modellen — WAD:s transposition deadline är samma för alla myndigheter i ett medlemsland, EAA:s application deadline är global (2025-06-28). Att göra fältet required hade tvingat alla 20+ befintliga entries att stoppa in `null`.

### 4. GSA vs DOJ — åtgärd av befintlig inkonsekvens

**Fil:** [`packages/standards/src/index.ts:60`](../../packages/standards/src/index.ts#L60)

Innan 2.4.0 fanns en tyst inkonsekvens:

- `ENFORCEMENT_BODIES.US = 'Department of Justice (Civil Rights Division)'` (konstanten)
- `ENFORCEMENT_BODIES_DETAILED.US.wad = 'Department of Justice (Civil Rights Division)'`
- Men `us-508.enforcement.authorityName = 'General Services Administration (GSA)'` i `national-laws.json`

GSA är korrekt för Section 508 (federal Section508.gov). DOJ är korrekt för ADA. Att blanda gav motsägelsefull output.

**Juridisk bedömning:**

| Export | Värde efter 2.4.0 |
|--------|-------------------|
| `ENFORCEMENT_BODIES.US` | `"Department of Justice (Civil Rights Division)"` (oförändrad — DOJ är den mer kända tillgänglighetsmyndigheten i USA, bättre default för ad-hoc lookups) |
| `ENFORCEMENT_BODIES_DETAILED.US.wad` | `"General Services Administration (GSA)"` (rättad — matchar nu `us-508.enforcement`) |
| `ENFORCEMENT_BODIES_DETAILED.US.eaa` | `"Department of Justice (Civil Rights Division)"` (oförändrad) |

Test-konsekvensen: loopen `ENFORCEMENT_BODIES_DETAILED[country].wad === ENFORCEMENT_BODIES[country]` skippar nu US (se [`index.test.ts:178`](../../packages/standards/src/index.test.ts#L178)). Det är medvetet — US är undantaget där default-konstanten inte matchar den sektor-uppdelade versionen.

> **Obs:** Rekommendationen framåt är att nedströms-konsumenter använder `getNationalLaws('US')` och plockar ut `.enforcement.authorityName` per lag, snarare än de bakåtkompatibla konstanterna. De senare är kvar för att inte bryta befintlig integration.

### 5. ADA-taggning i samtliga 12 rule-locale-filer

`packages/standards/data/rules.*.json`:

- 46 convergence-regler × 12 locales = **552 tillägg** i `legalContext.appliesTo`-arrayen
- Berörda locales: `en`, `en-us`, `en-gb`, `en-ca`, `sv`, `no`, `da`, `fi`, `de`, `fr`, `es`, `nl`
- 0 WCAG Level AAA-regler berörda (AAA är utanför ADA-kraven)

**Varför alla locales, inte bara `en-us`?** Enginet filtrerar regler baserat på `--lang`, inte `--country`. En tysk revisor som scannar en amerikansk delstatssida ska ändå få ADA-taggar i rapporten så att hen kan förstå att reglerna är juridiskt tillämpliga. Hade vi bara taggat `rules.en-us.json` hade `getRulesByFramework('ADA', 'de')` returnerat en tom lista.

Skripten vi använde för taggningen gjorde en säker sök-och-ersätt på `"appliesTo": [ "WAD", "EAA" ]`-mönstret — vi verifierade först att 0 regler hade `"wcagLevel": "AAA"` i någon av de 12 filerna.

### 6. Nytt statement-verktyg: ITIC VPAT

**Fil:** `packages/standards/data/legal/statement-tools.json`

Nytt entry:

```json
{
  "id": "itic-vpat",
  "name": "VPAT (Voluntary Product Accessibility Template)",
  "provider": "Information Technology Industry Council (ITI)",
  "type": "template",
  "url": "https://www.itic.org/policy/accessibility/vpat",
  "country": "US",
  "legalBasis": "ADA, Section 508, EN 301 549",
  "recommended": true
}
```

VPAT är standardmallen för amerikansk accessibility-compliance-dokumentation vid offentliga upphandlingar. Amerikanska kunder som söker federala eller delstatliga kontrakt behöver leverera VPAT som del av sin anbudsprocess. Biblioteket exponerar nu verktyget via `getStatementToolsByCountry('US')`.

---

## Motsvarande @holmdigital/engine 2.5.0-ändringar

Data-uppdateringarna i standards vore meningslösa utan att enginet utnyttjar dem. Engine 2.5.0 gör detta med fyra ändringar.

### 1. Sektor-medveten US-routing i `statement-generator.ts`

**Fil:** [`packages/engine/src/reporting/statement-generator.ts:318-341`](../../packages/engine/src/reporting/statement-generator.ts#L318-L341)

**Problemet:** `getNationalLawByFramework('ADA', 'US')` använder `Array.find()` och returnerar första matchen. I US-arrayen är Title II (public) listad först, så anropet returnerar alltid Title II — även när kundens `sector='private'`. Hade vi inte hanterat detta hade privata sektor-kunder fått fel lag i sin tillgänglighetsredogörelse.

**Lösningen** är en dedikerad US-gren som scope-filtrerar manuellt:

```typescript
'{<national_law>}': (() => {
    if (country === 'AU') { /* DDA-gren */ }
    if (country === 'US') {
        // US har två ADA-lagar uppdelade på scope + Section 508 som parallellt federal-ramverk
        const usLaws = getNationalLaws('US');
        const adaLaw = usLaws.find(l => l.euFramework === 'ADA' && l.scope === sector);
        if (adaLaw) {
            if (sector === 'public') {
                // State/local: inkludera Section 508 som parallell referens
                const s508 = usLaws.find(l => l.id === 'us-508');
                return s508
                    ? `${adaLaw.fullName} (${adaLaw.law}) & ${s508.fullName} (${s508.law})`
                    : `${adaLaw.fullName} (${adaLaw.law})`;
            }
            return `${adaLaw.fullName} (${adaLaw.law})`;
        }
    }
    const law = getNationalLawByFramework(sector === 'private' ? 'EAA' : 'WAD', country);
    return law ? `${law.fullName} (${law.law})` : '';
})(),
```

**Varför inkludera Section 508 för `sector='public'`?** En kompromiss. Engine vet inte säkert om en "public sector"-kund är federal (Section 508) eller delstatlig/kommunal (Title II). Bättre att överspecificera än underspecificera i en juridisk text — kunden kan själv filtrera bort irrelevanta referenser. Se "Kända begränsningar" nedan.

### 2. Sektor-medveten enforcement body-override

**Fil:** [`packages/engine/src/reporting/statement-generator.ts:308-317`](../../packages/engine/src/reporting/statement-generator.ts#L308-L317)

Eftersom `ENFORCEMENT_BODIES_DETAILED.US.wad` nu returnerar GSA (korrekt för Section 508), hade `getEnforcementBody('US', 'public')` returnerat GSA även i Title II-kontext — fel. Engine lägger därför till en US-specifik override som hämtar authority från den *valda* lagen:

```typescript
'{<enforcement_body>}': (() => {
    // US: statements for our customers are primarily about state/local gov (Title II)
    // or private sector (Title III) — both enforced by DOJ. Override the default
    // GSA-returning lookup (which targets federal Section 508).
    if (country === 'US') {
        const adaLaw = getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === sector);
        if (adaLaw) return adaLaw.enforcement.authorityName;
    }
    return getEnforcementBody(country, sector);
})(),
```

Resultat: US-kunder får alltid DOJ som enforcement body i renderade statements (oavsett sektor), vilket är korrekt för samtliga ADA-relaterade scenarier.

### 3. `en-us.json`-mall: dynamisk `{<national_law>}`-placeholder

**Fil:** `packages/engine/src/reporting/templates/en-us.json`

Tidigare var "Section 508 of the Rehabilitation Act" **hårdkodat** i introduktionen och enforcement-sektionen. Efter 2.5.0 använder mallen placeholdern `{<national_law>}` istället, vilket betyder att substitutionen från statement-generator faktiskt syns i output.

Technical-status-sektionen behåller än så länge hårdkodad "Section 508"-text. Skälet: ett befintligt locale-test ([`statement-generator.test.ts:126`](../../packages/engine/src/reporting/statement-generator.test.ts#L126)) assert:ar exakt frasen "partially compliant with Section 508". Att göra statussektionen fullt dynamisk kräver test-refaktor och är P2-arbete — se "Kända begränsningar".

### 4. Utökad testtäckning

Båda paketen har nya tester för US ADA-vägarna:

| Paket | Nya tester | Exempel |
|-------|-----------|---------|
| `@holmdigital/standards` | 7 i `describe('National Laws — US (ADA)', …)` | `getNationalLaws('US')` → 3 lagar; `getNationalLawByFramework('ADA', 'US')` → Title II; `scope='private'`-lookup → Title III; `largeEntity.deadline === '2026-04-24'`; `smallEntity.deadline === '2027-04-24'` |
| `@holmdigital/engine` | 4 i `describe('US ADA — sector-aware national law routing', …)` | US public → Title II + Section 508 + DOJ; US private → Title III + DOJ, ingen Title II-läckage; inga leftover placeholders för US/public och US/private |

Total efter release: **49 standards-tester + 122 engine-tester** grönt.

## Migrationsguide för kunder

### Ingen breaking change

Befintlig kod som använder `getNationalLawByFramework('WAD', 'US')` returnerar fortfarande `Section 508` som tidigare. Konstanten `ENFORCEMENT_BODIES.US` är oförändrad (DOJ). Existerande integrationer påverkas inte.

### Nya möjligheter

Efter `npm install @holmdigital/standards@2.4.0 @holmdigital/engine@2.5.0`:

```typescript
import {
  getNationalLaws,
  getNationalLawByFramework,
  getEnforcementBody
} from '@holmdigital/standards';

// 1. Hämta ADA Title II med compliance-deadline
const titleII = getNationalLawByFramework('ADA', 'US');
console.log(titleII?.law);                                         // "ADA Title II"
console.log(titleII?.complianceDeadlines?.largeEntity?.deadline);  // "2026-04-24"
console.log(titleII?.complianceDeadlines?.smallEntity?.deadline);  // "2027-04-24"

// 2. Sektor-medveten lookup för private sector (Title III)
const titleIII = getNationalLaws('US').find(
  law => law.euFramework === 'ADA' && law.scope === 'private'
);
console.log(titleIII?.law);                    // "ADA Title III"
console.log(titleIII?.enforcement.authorityName); // "U.S. Department of Justice, Civil Rights Division"

// 3. Hämta alla tre US-lagar på en gång
const allUSLaws = getNationalLaws('US');
console.log(allUSLaws.map(l => l.id));
// ['us-508', 'us-ada-title-ii', 'us-ada-title-iii']

// 4. VPAT-mall via statement-tools
import { getStatementToolsByCountry } from '@holmdigital/standards';
const usTools = getStatementToolsByCountry('US');
console.log(usTools.find(t => t.id === 'itic-vpat')?.url);
// "https://www.itic.org/policy/accessibility/vpat"
```

### CLI-exempel

```bash
# U.S. state/local government (ADA Title II + Section 508, DOJ)
npx hd-a11y-scan https://example.gov \
  --country US --sector public \
  --statement statement.md --format md --lang en-us \
  --org "Example City" --email "accessibility@example.gov"

# U.S. privat sektor / public accommodation (ADA Title III, DOJ)
npx hd-a11y-scan https://shop.example.com \
  --country US --sector private \
  --statement statement.md --format md --lang en-us \
  --org "Example Retail Inc" --email "accessibility@example.com"
```

### Vilken version behöver jag?

- För **data** (ADA-lagar, enforcement authorities, compliance deadlines) räcker det att uppdatera `@holmdigital/standards@2.4.0`. Alla query-API:er fungerar.
- För **sektor-medveten statement-rendering** krävs också `@holmdigital/engine@2.5.0`. Äldre engine-versioner returnerar Section 508 oavsett sektor, även om standards-paketet är uppdaterat.

---

## Kända begränsningar och framtida arbete

Följande punkter är medvetet utelämnade ur denna release. De är tracked som P2-arbete efter 2026-04-24.

### 1. `en-us.json` technical-status-sektion är hårdkodad

Mallens sista statement-block säger fortfarande "partially compliant with Section 508 of the Rehabilitation Act" oavsett sektor. Blocket använder inte `{<national_law>}`-placeholdern eftersom det existerande locale-testet ([`statement-generator.test.ts:126`](../../packages/engine/src/reporting/statement-generator.test.ts#L126)) assert:ar exakt frasen. Att göra sektionen fullt dynamisk kräver test-refaktor. P2.

### 2. Dubbla parenteser i lag-output

Fullname-fältet innehåller "(28 CFR Part 35)" och engine appendar "(ADA Title II)" — resultatet blir "… (28 CFR Part 35) (ADA Title II)". Fungerar men inte snyggt. Markerad som kosmetisk i den juridiska granskningen.

### 3. Federal vs delstatlig/kommunal filtrering saknas

För `sector='public'` visar vi både ADA Title II och Section 508. En kund som är en federal myndighet får onödig Title II-referens; en kommun får onödig Section 508-referens. En `entityType: 'federal' | 'state' | 'local'`-flagga i statement-metadata skulle lösa detta men är backlog.

### 4. Title III civil penalties kräver inflations-verifiering

Base-beloppen `$75,000` / `$150,000` är statutory per 28 CFR § 36.504 men årligen inflationsjusterade per 28 CFR Part 85. Den aktuella 2026-siffran behöver verifieras mot senaste Federal Register-notis (publicerad januari 2026). Verifiering av aktuell siffra är tracked som uppföljande arbete.

### 5. `EUDirective`-typen används pragmatiskt för ADA

`frameworks.json` använder `EUDirective`-typen för ADA-entryn, vilket är semantiskt fel — ADA är inte ett EU-direktiv. Det var ett medvetet pragmatiskt val under deadline-tryck. Refaktor till en generisk `LegalDirective`-typ är planerad efter 2026-04-24.

---

## Referenser
### Juridiska källor

| Referens | Beskrivning |
|----------|-------------|
| [28 CFR Part 35](https://www.ecfr.gov/current/title-28/chapter-I/part-35) | ADA Title II-regler, inkl. 2024 web accessibility final rule |
| [28 CFR Part 36](https://www.ecfr.gov/current/title-28/chapter-I/part-36) | ADA Title III-regler |
| [28 CFR Part 85](https://www.ecfr.gov/current/title-28/chapter-I/part-85) | Federal Civil Penalties Inflation Adjustment Act |
| [89 FR 31320](https://www.federalregister.gov/documents/2024/04/24/2024-07758/) | Federal Register publication av Title II final rule (2024-04-24) |
| 42 U.S.C. §§ 12131–12165 | ADA Title II statutory text |
| 42 U.S.C. §§ 12181–12189 | ADA Title III statutory text |
| 42 U.S.C. § 12188 | Title III enforcement mechanisms |
| 42 U.S.C. § 12133 → 29 U.S.C. § 794a | Title II remedies via Rehabilitation Act |
| [ada.gov/law-and-regs/title-ii-2024](https://www.ada.gov/law-and-regs/title-ii-2024/) | DOJ:s officiella Title II-hub |

### Ekosystem
- [`@holmdigital/standards@2.4.0`](https://www.npmjs.com/package/@holmdigital/standards) på npm
- [`@holmdigital/engine@2.5.0`](https://www.npmjs.com/package/@holmdigital/engine) på npm
- Relaterade PR:er: [#25](https://github.com/holmdigital/a11y-hd/pull/25) (feature + legal fix), [#26](https://github.com/holmdigital/a11y-hd/pull/26) (release)
- Merge-commits: `644bb19` (feature) + `3843b3b` (release) + `8b2daa9` (Version Packages)
- [CHANGELOG — @holmdigital/standards@2.4.0](../../packages/standards/CHANGELOG.md)
- [CHANGELOG — @holmdigital/engine@2.5.0](../../packages/engine/CHANGELOG.md)

### Läs vidare
- [EU Legal Framework-guiden](../guides/eu-legal-framework.md) — inkl. ADA-sektion
- [Accessibility Statement-handledningen](../guides/accessibility-statement.md) — US-exempel för både sektorer
- [Standards API-referens](../reference/standards.md)
- [Engine CLI-referens](../reference/engine.md)
