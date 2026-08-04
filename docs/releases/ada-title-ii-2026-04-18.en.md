# ADA Title II support in @holmdigital/standards 2.4.0 + @holmdigital/engine 2.5.0

> **Published:** 2026-04-18 · **Authors:** HolmDigital team · **Language:** English · [Svensk version](./ada-title-ii-2026-04-18.sv.md)

## TL;DR

Starting with `@holmdigital/standards@2.4.0` and `@holmdigital/engine@2.5.0`, the toolchain supports **ADA Title II** and **ADA Title III** — the U.S. accessibility laws covering public (state and local government) and private sectors respectively. The release shipped to npm six days ahead of the hard compliance deadline **2026-04-24**, which applies to U.S. state/local government entities serving populations of 50,000 or more.

| Package | Before | After |
|---------|--------|-------|
| `@holmdigital/standards` | 2.3.0 | **2.4.0** |
| `@holmdigital/engine` | 2.4.1 | **2.5.0** |
| `@holmdigital/components` | 2.3.0 | 2.3.0 (unchanged) |

Two deadlines per 28 CFR § 35.200(b) from the DOJ final rule (published 2024-04-24):

- **2026-04-24** — state/local government entities serving 50,000+ population
- **2027-04-24** — smaller entities and special district governments

The toolchain now produces legally accurate output for U.S. customers through `--country US --sector public|private` and through the new programmatic API: `getNationalLawByFramework('ADA', 'US')` plus scope-aware filtering via `getNationalLaws('US')`.

---

## Background: why ADA Title II matters

### How the law is structured

The **Americans with Disabilities Act of 1990** (ADA, 42 U.S.C. §§ 12101 et seq.) is the central U.S. statute prohibiting disability-based discrimination. It is organised into multiple "Titles" with different scope:

| Title | Covered entities | Enforcement | Technical standard | Sanction mechanism |
|-------|------------------|-------------|--------------------|--------------------|
| **Title II** | States, counties, municipalities, special districts | **DOJ**, Civil Rights Division | **WCAG 2.1 AA** (per 28 CFR Part 35) | DOJ investigations, settlement agreements, private lawsuits for injunctive relief and compensatory damages. No fixed penalty schedule. |
| **Title III** | Private sector "places of public accommodation" (hotels, restaurants, e-commerce, banks, healthcare) | **DOJ**, Civil Rights Division | WCAG 2.1 AA (de facto via case law — *Robles v. Domino's Pizza*, *Gil v. Winn-Dixie*) | Private lawsuits (42 U.S.C. § 12188, injunctive relief only in federal court); DOJ civil penalties per 28 CFR § 36.504, annually inflation-adjusted per 28 CFR Part 85 |
| **Section 508** (separate law — Rehabilitation Act) | Federal agencies | **GSA** (General Services Administration) | WCAG 2.0 AA via ICT refresh | Complaints, lawsuits |

### Why the 2026-04-24 deadline lands now

On 2023-08-08 the DOJ opened rulemaking for digital accessibility under Title II. The final rule (89 FR 31320) was published in the Federal Register on 2024-04-24 and codifies WCAG 2.1 Level AA as the technical standard for state/local government websites and mobile apps.

Compliance deadlines are staged based on served population:

```
Final rule publication:  2024-04-24
Large entity (50k+ pop): 2024-04-24 + 2 years = 2026-04-24   ← NEXT WEEK
Small entity (<50k pop): 2024-04-24 + 3 years = 2027-04-24
```

### What was wrong before 2.4.0

Prior releases only included **Section 508** as the U.S. law in `national-laws.json`, with GSA as the enforcement body. That produced two legal errors for U.S. customers:

1. **Wrong law:** state and local government entities are covered by Title II, not Section 508. Private-sector "public accommodations" are covered by Title III.
2. **Wrong authority:** GSA handles federal agency Section 508 compliance. The DOJ Civil Rights Division handles both Title II and Title III.

The toolchain was generating legally inaccurate accessibility statements for thousands of municipalities, counties, and commercial sites in the U.S.

---

## What we built — @holmdigital/standards 2.4.0

Additive changes to types and data. No breaking changes.

### 1. New `LegalFramework` member: `'ADA'`

**File:** [`packages/standards/src/types.ts:12`](../../packages/standards/src/types.ts#L12)

```typescript
export type LegalFramework = 'WAD' | 'EAA' | 'DDA' | 'ADA';
```

The framework union now has four members. We considered a separate `USFramework` type but rejected it: DDA (Australia) already sits in the same union as a non-EU value, and a parallel type would force us to maintain two variants of `getRulesByFramework`, `getNationalLawByFramework`, and so on.

### 2. Two separate U.S. laws in `national-laws.json`

**File:** [`packages/standards/data/legal/national-laws.json:408-469`](../../packages/standards/data/legal/national-laws.json#L408-L469)

We added two new entries to the U.S. array alongside the existing `us-508`:

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

**Why two separate entries?** Federal separation of law. Title II and Title III are different statutory chapters, regulate different sectors, and have different sanction models. Compressing them into one record would have hidden that legal distinction. The `scope` field (`"public"` / `"private"`) enables sector filtering without introducing yet another type.

### 3. New optional `complianceDeadlines` field

**File:** [`packages/standards/src/types.ts:272-276`](../../packages/standards/src/types.ts#L272-L276)

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

**Why optional?** Only ADA Title II has entity-size-based deadlines. No other law in the database follows that model — the WAD transposition deadline applies uniformly to all public bodies in a member state; the EAA application deadline is global (2025-06-28). Making the field required would have forced every existing entry to carry `null`.

### 4. GSA vs DOJ — fix for a pre-existing inconsistency

**File:** [`packages/standards/src/index.ts:60`](../../packages/standards/src/index.ts#L60)

Before 2.4.0 a silent inconsistency lived in the codebase:

- `ENFORCEMENT_BODIES.US = 'Department of Justice (Civil Rights Division)'` (constant)
- `ENFORCEMENT_BODIES_DETAILED.US.wad = 'Department of Justice (Civil Rights Division)'`
- But `us-508.enforcement.authorityName = 'General Services Administration (GSA)'` in `national-laws.json`

GSA is the correct authority for Section 508 (it runs Section508.gov). DOJ is correct for ADA. Mixing the two produced contradictory output.

**Legal ruling:**

| Export | Value after 2.4.0 |
|--------|-------------------|
| `ENFORCEMENT_BODIES.US` | `"Department of Justice (Civil Rights Division)"` (unchanged — DOJ is the more widely recognised accessibility authority in the U.S., so it remains the better default for ad-hoc lookups) |
| `ENFORCEMENT_BODIES_DETAILED.US.wad` | `"General Services Administration (GSA)"` (corrected — now aligns with `us-508.enforcement`) |
| `ENFORCEMENT_BODIES_DETAILED.US.eaa` | `"Department of Justice (Civil Rights Division)"` (unchanged) |

Test consequence: the loop `ENFORCEMENT_BODIES_DETAILED[country].wad === ENFORCEMENT_BODIES[country]` now skips US (see [`index.test.ts:178`](../../packages/standards/src/index.test.ts#L178)). That is deliberate — U.S. is the one jurisdiction where the default constant does not match the sector-split version.

> **Note:** The forward-looking recommendation for downstream consumers is to call `getNationalLaws('US')` and read `.enforcement.authorityName` per law, rather than the backward-compatible constants. The constants remain so existing integrations keep working.

### 5. ADA tagging across all 12 rule-locale files

`packages/standards/data/rules.*.json`:

- 46 convergence rules × 12 locales = **552 additions** to the `legalContext.appliesTo` array
- Locales touched: `en`, `en-us`, `en-gb`, `en-ca`, `sv`, `no`, `da`, `fi`, `de`, `fr`, `es`, `nl`
- Zero WCAG Level AAA rules affected (AAA is outside ADA's requirements)

**Why all locales, not just `en-us`?** The engine filters rules by `--lang`, not `--country`. A German auditor scanning a U.S. state site still needs ADA tags to appear in their report so they can understand which rules are legally applicable. Had we only tagged `rules.en-us.json`, a call like `getRulesByFramework('ADA', 'de')` would have returned an empty array.

Our tagging script performed a safe find-and-replace against the `"appliesTo": [ "WAD", "EAA" ]` pattern. We first verified that zero rules had `"wcagLevel": "AAA"` in any of the 12 files before running it.

### 6. New statement tool: ITIC VPAT

**File:** `packages/standards/data/legal/statement-tools.json`

New entry:

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

The VPAT is the standard template for U.S. accessibility compliance documentation in public procurement. U.S. customers bidding for federal or state contracts must deliver a VPAT as part of their proposal. The library now exposes the tool via `getStatementToolsByCountry('US')`.

---

## Matching @holmdigital/engine 2.5.0 changes

The standards-layer data updates would be meaningless without the engine consuming them. Engine 2.5.0 does that with four changes.

### 1. Sector-aware U.S. routing in `statement-generator.ts`

**File:** [`packages/engine/src/reporting/statement-generator.ts:318-341`](../../packages/engine/src/reporting/statement-generator.ts#L318-L341)

**The problem:** `getNationalLawByFramework('ADA', 'US')` uses `Array.find()` and returns the first match. In the U.S. array, Title II (public) is listed first, so the call always returned Title II — even when the caller's `sector='private'`. Without special handling, private-sector customers would have received the wrong law in their accessibility statement.

**The fix** is a dedicated U.S. branch that filters by scope explicitly:

```typescript
'{<national_law>}': (() => {
    if (country === 'AU') { /* DDA branch */ }
    if (country === 'US') {
        // US has two ADA laws split by scope (Title II public / Title III private)
        // plus Section 508 as a parallel federal-agency framework.
        const usLaws = getNationalLaws('US');
        const adaLaw = usLaws.find(l => l.euFramework === 'ADA' && l.scope === sector);
        if (adaLaw) {
            if (sector === 'public') {
                // State/local: include Section 508 as parallel reference
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

**Why include Section 508 for `sector='public'`?** A compromise. The engine cannot tell whether a "public sector" U.S. customer is federal (Section 508) or state/local (Title II). In legal prose, over-specifying is safer than under-specifying — the customer can filter irrelevant references out. See "Known limitations" below.

### 2. Sector-aware enforcement-body override

**File:** [`packages/engine/src/reporting/statement-generator.ts:308-317`](../../packages/engine/src/reporting/statement-generator.ts#L308-L317)

Because `ENFORCEMENT_BODIES_DETAILED.US.wad` now returns GSA (correct for Section 508), `getEnforcementBody('US', 'public')` would have returned GSA even in a Title II context — wrong. The engine therefore adds a U.S.-specific override that pulls the authority from the *selected* law:

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

Result: U.S. customers consistently get DOJ as the enforcement body in rendered statements (regardless of sector), which is correct for every ADA-related scenario.

### 3. `en-us.json` template: dynamic `{<national_law>}` placeholder

**File:** `packages/engine/src/reporting/templates/en-us.json`

The intro and enforcement sections of the template previously hard-coded "Section 508 of the Rehabilitation Act". After 2.5.0 they use the `{<national_law>}` placeholder, which means the substitution from the statement generator is actually visible in output.

The technical-compliance status section still carries hard-coded "Section 508" text. The reason: an existing locale test ([`statement-generator.test.ts:126`](../../packages/engine/src/reporting/statement-generator.test.ts#L126)) asserts the exact phrase "partially compliant with Section 508". Making that section fully dynamic requires test refactoring and is tracked as P2 — see "Known limitations".

### 4. Expanded test coverage

Both packages ship new tests covering the U.S. ADA paths:

| Package | New tests | Examples |
|---------|-----------|----------|
| `@holmdigital/standards` | 7 in `describe('National Laws — US (ADA)', …)` | `getNationalLaws('US')` → 3 laws; `getNationalLawByFramework('ADA', 'US')` → Title II; scope-filtered lookup → Title III; `largeEntity.deadline === '2026-04-24'`; `smallEntity.deadline === '2027-04-24'` |
| `@holmdigital/engine` | 4 in `describe('US ADA — sector-aware national law routing', …)` | US public → Title II + Section 508 + DOJ; US private → Title III + DOJ, no Title II leakage; no leftover placeholders for US/public and US/private |

Post-release totals: **49 standards tests + 122 engine tests** green.

## Migration guide for consumers

### No breaking changes

Existing code calling `getNationalLawByFramework('WAD', 'US')` still returns Section 508 as before. The constant `ENFORCEMENT_BODIES.US` is unchanged (DOJ). Existing integrations are not affected.

### New capabilities

After `npm install @holmdigital/standards@2.4.0 @holmdigital/engine@2.5.0`:

```typescript
import {
  getNationalLaws,
  getNationalLawByFramework,
  getEnforcementBody
} from '@holmdigital/standards';

// 1. Get ADA Title II with its compliance deadlines
const titleII = getNationalLawByFramework('ADA', 'US');
console.log(titleII?.law);                                         // "ADA Title II"
console.log(titleII?.complianceDeadlines?.largeEntity?.deadline);  // "2026-04-24"
console.log(titleII?.complianceDeadlines?.smallEntity?.deadline);  // "2027-04-24"

// 2. Sector-aware lookup for the private sector (Title III)
const titleIII = getNationalLaws('US').find(
  law => law.euFramework === 'ADA' && law.scope === 'private'
);
console.log(titleIII?.law);                       // "ADA Title III"
console.log(titleIII?.enforcement.authorityName); // "U.S. Department of Justice, Civil Rights Division"

// 3. Retrieve all three U.S. laws at once
const allUSLaws = getNationalLaws('US');
console.log(allUSLaws.map(l => l.id));
// ['us-508', 'us-ada-title-ii', 'us-ada-title-iii']

// 4. VPAT template via statement-tools
import { getStatementToolsByCountry } from '@holmdigital/standards';
const usTools = getStatementToolsByCountry('US');
console.log(usTools.find(t => t.id === 'itic-vpat')?.url);
// "https://www.itic.org/policy/accessibility/vpat"
```

### CLI examples

```bash
# U.S. state/local government (ADA Title II + Section 508, DOJ)
npx hd-a11y-scan https://example.gov \
  --country US --sector public \
  --statement statement.md --format md --lang en-us \
  --org "Example City" --email "accessibility@example.gov"

# U.S. private sector / public accommodation (ADA Title III, DOJ)
npx hd-a11y-scan https://shop.example.com \
  --country US --sector private \
  --statement statement.md --format md --lang en-us \
  --org "Example Retail Inc" --email "accessibility@example.com"
```

### Which version do I need?

- For **data** (ADA laws, enforcement authorities, compliance deadlines) it is enough to upgrade `@holmdigital/standards@2.4.0`. All query APIs work.
- For **sector-aware statement rendering** you also need `@holmdigital/engine@2.5.0`. Older engine versions return Section 508 regardless of sector, even if the standards package is up to date.

---

## Known limitations and future work

The following items are deliberately out of scope for this release. They are tracked as P2 work after 2026-04-24.

### 1. `en-us.json` technical-status block is hard-coded

The template's final status block still reads "partially compliant with Section 508 of the Rehabilitation Act" regardless of sector. The block does not use the `{<national_law>}` placeholder because an existing locale test ([`statement-generator.test.ts:126`](../../packages/engine/src/reporting/statement-generator.test.ts#L126)) asserts the exact phrase. Making the section fully dynamic requires test refactoring. P2.

### 2. Double parentheses in law output

The `fullName` field already contains "(28 CFR Part 35)" and the engine appends "(ADA Title II)" — the result ends up "... (28 CFR Part 35) (ADA Title II)". Functional but aesthetic. Flagged as cosmetic during legal review.

### 3. No federal vs state/local filter

For `sector='public'` we render both ADA Title II and Section 508. A customer that is a federal agency gets an unnecessary Title II reference; a municipality gets an unnecessary Section 508 reference. An `entityType: 'federal' | 'state' | 'local'` flag in statement metadata would solve this but is on the backlog.

### 4. Title III civil penalties need inflation verification

The `$75,000` / `$150,000` base amounts are statutory per 28 CFR § 36.504 but are annually inflation-adjusted per 28 CFR Part 85. The current 2026 figure needs verification against the most recent Federal Register notice (published January 2026). Verification of the current figure is tracked as follow-up work.

### 5. `EUDirective` type used pragmatically for ADA

`frameworks.json` uses the `EUDirective` type for the ADA entry, which is semantically wrong — ADA is not an EU directive. It was a deliberate pragmatic choice under deadline pressure. A refactor into a generic `LegalDirective` type is planned after 2026-04-24.

---

## References
### Legal sources

| Reference | Description |
|-----------|-------------|
| [28 CFR Part 35](https://www.ecfr.gov/current/title-28/chapter-I/part-35) | ADA Title II regulations, incl. 2024 web accessibility final rule |
| [28 CFR Part 36](https://www.ecfr.gov/current/title-28/chapter-I/part-36) | ADA Title III regulations |
| [28 CFR Part 85](https://www.ecfr.gov/current/title-28/chapter-I/part-85) | Federal Civil Penalties Inflation Adjustment Act |
| [89 FR 31320](https://www.federalregister.gov/documents/2024/04/24/2024-07758/) | Federal Register publication of the Title II final rule (2024-04-24) |
| 42 U.S.C. §§ 12131–12165 | ADA Title II statutory text |
| 42 U.S.C. §§ 12181–12189 | ADA Title III statutory text |
| 42 U.S.C. § 12188 | Title III enforcement mechanisms |
| 42 U.S.C. § 12133 → 29 U.S.C. § 794a | Title II remedies via the Rehabilitation Act |
| [ada.gov/law-and-regs/title-ii-2024](https://www.ada.gov/law-and-regs/title-ii-2024/) | DOJ's official Title II hub |

### Ecosystem
- [`@holmdigital/standards@2.4.0`](https://www.npmjs.com/package/@holmdigital/standards) on npm
- [`@holmdigital/engine@2.5.0`](https://www.npmjs.com/package/@holmdigital/engine) on npm
- Related PRs: [#25](https://github.com/holmdigital/a11y-hd/pull/25) (feature + legal fix), [#26](https://github.com/holmdigital/a11y-hd/pull/26) (release)
- Merge commits: `644bb19` (feature) + `3843b3b` (release) + `8b2daa9` (Version Packages)
- [CHANGELOG — @holmdigital/standards@2.4.0](../../packages/standards/CHANGELOG.md)
- [CHANGELOG — @holmdigital/engine@2.5.0](../../packages/engine/CHANGELOG.md)

### Further reading
- [EU Legal Framework guide](../guides/eu-legal-framework.md) — includes the ADA section
- [Accessibility Statement tutorial](../guides/accessibility-statement.md) — U.S. examples for both sectors
- [Standards API reference](../reference/standards.md)
- [Engine CLI reference](../reference/engine.md)
