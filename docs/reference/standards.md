# 🏛️ Standards Library Catalog
> **Last Updated:** 2026-03-07

The `@holmdigital/standards` package is the **regulatory brain** of the ecosystem. It provides machine-readable legal data, localized WCAG rules, and mappings to EU directives.

It is designed to protect you from legal complexity by hard-coding compliance logic.

## 📦 What's Inside?

### 1. 🌍 Localized Rule Engines
The package includes localized translations for rules and remediations:
- **Swedish** (`sv`) - Full DOS-lagen alignment.
- **English (EU)** (`en`) - Baseline WAD criteria.
- **English (UK)** (`en-gb`) - PSBAR terminology.
- **English (US)** (`en-us`) - Section 508 / ADA context.
- **English (CA)** (`en-ca`) - AODA implementation.
- **German** (`de`) - BITV 2.0 terminology.
- **French** (`fr`) - RGAA compatibility.
- **Spanish** (`es`) - UNE 139803 alignment.
- **Finnish** (`fi`) - 306/2019 alignment.
- **Norwegian** (`no`) - Universell utforming context.
- **Danish** (`da`) - Tilgængelighed compliance.
- **Dutch** (`nl`) - Digitoegankelijk alignment.
- **Italian** (`it`) - Decreto Legislativo 106/2018 alignment.
- **Portuguese** (`pt`) - Decreto-Lei n.o 83/2018 alignment.
- **Polish** (`pl`) - Ustawa o dostepnosci cyfrowej alignment.

### 2. ⚖️ Legal Frameworks (The "Law Layer")
We map technical rules to actual legislation.

- **UK (PSBAR)**: Full mapping of Public Sector Bodies Regulations 2018.
- **USA (Section 508 / ADA)**: Support for Rehabilitation Act and ADA standards.
- **Canada (AODA)**: Alignment with Ontario and Federal accessibility acts.
- **EAA Ready**: All rules are tagged for the June 2025 European Accessibility Act deadline.

| Framework | Description |
|-----------|-------------|
| **Web Accessibility Directive (WAD)** | Applies to **Public Sector** bodies in the EU. |
| **European Accessibility Act (EAA)** | Applies to **Private Sector** services (e-commerce, banking) from June 2025. |
| **Disability Discrimination Act (DDA)** | Australia — applies to **both** public and private sectors under DDA 1992. |
| **Americans with Disabilities Act (ADA)** | USA — Title II (state/local government, DOJ) and Title III (private sector, DOJ). **Deadline 2026-04-24** for state/local entities serving 50,000+ population (28 CFR Part 35 Final Rule). Section 508 (federal agencies, GSA) remains a separate framework. |
| **EN 301 549** | The technical standard that underpins WAD and EAA. |
| **National Laws** | Specific overrides for Sweden (`DOS-lagen`), Norway (`Forskrift om universell utforming av IKT`), Germany (`BFSG`), Italy (`Legge 4/2004`), etc. |

### 3. 🛡️ Verification Data
| Data Set | Purpose |
|----------|---------|
| **ICT Manual Checks** | A structured checklist for things that *cannot* be automated (e.g., "Is the video synchronized?"). |
| **WCAG Mappings** | Exact paragraph references between WCAG 2.1 and EN 301 549 (Table A.1). |

---

## 🛠️ Developer API

Use these functions to build compliance features into your own apps.

### 1. Get the Law for a Country
Automatically resolves the correct law based on sector (Public/Private) and location.

```typescript
import { getNationalLawByFramework, getNationalLaws } from '@holmdigital/standards';

// Case: Public Sector in Sweden
const law = getNationalLawByFramework('WAD', 'SE');
console.log(law.name); 
// Output: "Lag (2018:1937) om tillgänglighet till digital offentlig service"

// Case: Private Sector in Germany (EAA)
const law = getNationalLawByFramework('EAA', 'DE');
console.log(law.name);
// Output: "Barrierefreiheitsstärkungsgesetz (BFSG)"

// Case: U.S. state/local government → ADA Title II (DOJ)
const titleII = getNationalLawByFramework('ADA', 'US');
console.log(titleII.law);
// Output: "ADA Title II"
console.log(titleII.complianceDeadlines.largeEntity.deadline);
// Output: "2026-04-24"

// Case: U.S. private sector → ADA Title III (scope-aware lookup)
const titleIII = getNationalLaws('US').find(l => l.euFramework === 'ADA' && l.scope === 'private');
console.log(titleIII.law);
// Output: "ADA Title III"
```

### 2. Find the Enforcement Authority
Who do you report to? Who issues the fines?

```typescript
import { getEnforcementBody } from '@holmdigital/standards';

// Public sector in Sweden → WAD enforcement
const publicBody = getEnforcementBody('SE', 'public');
// Output: "Agency for Digital Government (Digg)"

// Private sector in Sweden → EAA enforcement
const privateBody = getEnforcementBody('SE', 'private');
// Output: "Swedish Post and Telecom Authority (PTS)"

// Works for all 16 supported countries
const deBody = getEnforcementBody('DE', 'public');
// Output: "Federal Monitoring Body for Accessibility of Information Technology (BFIT-Bund)"
```

### 3. Access Centralized Enforcement Bodies
Get a mapping of all regulatory authorities for 17 supported jurisdictions (16 countries + EU).

```typescript
import { ENFORCEMENT_BODIES, ENFORCEMENT_BODIES_DETAILED } from '@holmdigital/standards';

// Simple map — WAD (public sector) body per jurisdiction (17 keys incl. EU)
console.log(ENFORCEMENT_BODIES.SE);
// Output: "Agency for Digital Government (Digg)"

console.log(ENFORCEMENT_BODIES.AU);
// Output: "Australian Human Rights Commission (AHRC)"

// Detailed map — sector-specific bodies (WAD vs EAA)
console.log(ENFORCEMENT_BODIES_DETAILED.SE.wad);
// Output: "Agency for Digital Government (Digg)"

console.log(ENFORCEMENT_BODIES_DETAILED.SE.eaa);
// Output: "Swedish Post and Telecom Authority (PTS)"

console.log(ENFORCEMENT_BODIES_DETAILED.IT.eaa);
// Output: "Communications Regulatory Authority (AGCOM)"
```

### 4. Get Database Stats
Query rule counts and coverage at runtime.

```typescript
import { getDatabaseStats } from '@holmdigital/standards';

const stats = getDatabaseStats();
// { totalRules: 46, totalICTChecks: ..., rulesByLevel: { A: ..., AA: ..., AAA: ... } }
```

### 5. Check for EAA Deadlines
Identify rules that became critical after June 2025.

```typescript
import { getEAADeadlineRules } from '@holmdigital/standards';

const urgentRules = getEAADeadlineRules();
// Returns list of rules that are mandatory for e-commerce under EAA
```

### 6. Fetch Official Statement Tools
Don't write your own statement if the government provides a mandatory tool.

```typescript
import { getStatementTools, getStatementToolsByCountry } from '@holmdigital/standards';

// All registered official generators across every jurisdiction
const all = getStatementTools();

// Just the tools for a specific country (e.g. Portugal's "O Gerador")
const ptTools = getStatementToolsByCountry('PT');
```

---

## 💡 Why use this package?

1.  **Single Source of Truth:** Never hardcode "WCAG algorithm" logic in your UI components.
2.  **Future Proof:** When laws change (like WCAG 2.2), you update this package, and your whole app updates.
3.  **Global Ready:** Ships with 12 rule-locale databases and national-law metadata for 16 countries + EU (17 jurisdictions). Countries without a dedicated rule file (IT, PT, PL, IE, AU) fall back to the `en` rule set while still getting the correct national law context.
