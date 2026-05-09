# Teknisk brief: us-hhs-section-504
**Datum:** 2026-05-05  
**Commit:** f2e722e → master  
**Paket:** `@holmdigital/standards`  

> **⚠️ Uppdatering 2026-05-09 (2.5.1-patch):** Kodgranskning efter release hittade tre fel i 2.5.0-posten som är korrigerade i 2.5.1:
> - `inForce` ändrad till `true`, `effectiveDate` till `2024-07-08` (Section 504 var redan i kraft; WCAG-benchmark är det som väntar)
> - `complianceDeadlines`-typen vidgad till discriminated union (`employeeThreshold` saknades i typen men fanns i datan)
> - `REHAB` och `DDA` tillagda i `frameworks.json` (annars returnerar `getLegalFramework('REHAB')` `null`)

---

## Bakgrund

HHS Section 504 Final Rule (45 C.F.R. Part 84, 89 FR 40066) ställer krav på WCAG 2.1 Level AA för privata organisationer som tar emot federalt stöd från U.S. Department of Health and Human Services. Enforcement-deadline för organisationer med 15+ anställda är **2026-05-11** — sex dagar från detta dokuments datum.

Befintliga US-entries i databasen täckte inte denna kategori:

| Entry | Täcker | Gap |
|---|---|---|
| `us-508` | Federala myndigheter | HHS-fondmottagare är privata |
| `us-ada-title-ii` | Stat/kommunal sektor | HHS-fondmottagare är ej myndigheter |
| `us-ada-title-iii` | Kommersiella lokaler | Section 504 är en separat, mer specifik förpliktelse |

---

## Ändringar

### 1. Ny `LegalFramework`-variant
**Fil:** `packages/standards/src/types.ts`

```typescript
// Före
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA';

// Efter
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA' | 'REHAB';
```

`REHAB` används som ramverk-ID för Rehabilitation Act. Inget EU-ekvivalent ramverk existerar — värdet är analogt och krävs för att uppfylla `NationalLaw`-interfacets `euFramework`-fält.

---

### 2. Nytt JSON-objekt i national-laws.json
**Fil:** `packages/standards/data/legal/national-laws.json`  
**Position:** Fjärde elementet i `"US": [...]`, efter `us-ada-title-iii`

Nyckelegenskaper:

| Fält | Värde |
|---|---|
| `id` | `us-hhs-section-504` |
| `euFramework` | `REHAB` |
| `scope` | `private` |
| `inForce` | `false` (deadline ej nådd) |
| `effectiveDate` | `2026-05-11` |
| `enforcement.authority` | `us-hhs-ocr` |
| `enforcement.authorityName` | `HHS Office for Civil Rights (OCR)` |
| `sanctions.type` | Funding Suspension / Termination / Private Lawsuit |
| `complianceDeadlines.largeEntity.deadline` | `2026-05-11` (15+ anst.) |
| `complianceDeadlines.smallEntity.deadline` | `2027-05-10` (<15 anst.) |

Lagen täcker sjukhus, FQHCs, äldreboenden, hälsoplaner, forskningsinstitut och andra HHS-fondmottagare. Medicare Part B-ersättning räknas som federal financial assistance och utlöser Section 504-skyldigheter.

---

### 3. Testuppdateringar
**Fil:** `packages/standards/src/index.test.ts`

**Uppdaterade befintliga tester:**
- `should return 3 laws for US` → `should return 4 laws for US` (längarraylängd)
- `should have inForce true for all US laws` → exkluderar nu `us-hhs-section-504` som förväntat har `inForce: false`

**Nya tester (nytt describe-block):**
```
describe('National Laws — US HHS Section 504')
  ✓ should expose us-hhs-section-504 in US laws
  ✓ should have tiered compliance deadlines for HHS Section 504
  ✓ should have HHS OCR as enforcement authority
```

---

### 4. Changeset
**Fil:** `.changeset/add-us-hhs-section-504.md`  
**Bump:** `@holmdigital/standards` → `minor` (2.4.0 → 2.5.0 vid nästa release)

---

## Testresultat

```
standards:  52/52 passed ✓
engine:    122/122 passed ✓
```

---

## Vad som INTE ändrades

`packages/engine/src/reporting/statement-generator.ts` lämnades oförändrad. Den filtrerar US-lagar via `euFramework === 'ADA'` och störs inte av REHAB-entryn. En framtida förbättring är att lyfta in Section 504 i statement-output för healthcare-kunder i USA (separat issue).

---

## Merge-notering

Vid push uppstod en merge-konflikt i `packages/engine/src/reporting/html-template.ts` mellan remote-commits och pre-existerade lokala ändringar (rörde `sector`-parameterns optionalitet). Upstream-versionen (`sector: 'public' | 'private' = 'public'`) accepterades. Den lokala varianten (`sector?`) kastades bort — om det var pågående arbete behöver det återskapas.

---

*Spec-underlag: `D:\Download\lagandring-us-hhs-section504-2026-05-04.md` (upprättad av Juno 2026-05-05)*
