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
| **EN 301 549** | The technical standard that underpins both laws. |
| **National Laws** | Specific overrides for Sweden (`DOS-lagen`), Norway (`Diskrimineringsloven`), Germany (`BFSG`), Italy (`D.Lgs. 106/2018`), etc. |

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
import { getNationalLawByFramework } from '@holmdigital/standards';

// Case: Public Sector in Sweden
const law = getNationalLawByFramework('WAD', 'SE');
console.log(law.name); 
// Output: "Lag (2018:1937) om tillgänglighet till digital offentlig service"

// Case: Private Sector in Germany (EAA)
const law = getNationalLawByFramework('EAA', 'DE');
console.log(law.name);
// Output: "Barrierefreiheitsstärkungsgesetz (BFSG)"
```

### 2. Find the Enforcement Authority
Who do you report to? Who issues the fines?

```typescript
import { getEnforcementBody } from '@holmdigital/standards';

// Public sector in Sweden → WAD enforcement
const publicBody = getEnforcementBody('SE', 'public');
console.log(publicBody);
// Output: "Myndigheten for digital forvaltning (Digg)"

// Private sector in Sweden → EAA enforcement
const privateBody = getEnforcementBody('SE', 'private');
console.log(privateBody);
// Output: "Swedish Post and Telecom Authority (PTS)"

// Works for all supported countries
const deBody = getEnforcementBody('DE', 'public');
// Output: "Uberwachungsstelle des Bundes fur Barrierefreiheit von Informationstechnik (BFIT-Bund)"
```

### 3. Access Centralized Enforcement Bodies
Get a mapping of all regulatory authorities for supported countries.

```typescript
import { ENFORCEMENT_BODIES, ENFORCEMENT_BODIES_DETAILED } from '@holmdigital/standards';

// Simple map (backward compatible)
console.log(ENFORCEMENT_BODIES.SE);
// Output: "Myndigheten for digital forvaltning (Digg)"

// Detailed map with sector-specific bodies
console.log(ENFORCEMENT_BODIES_DETAILED.IT);
// Output: { wad: "AgID – Agenzia per l'Italia Digitale", eaa: "AgID – Agenzia per l'Italia Digitale" }
```

### 3. Check for EAA Deadlines
Identify rules that become critical in June 2025.

```typescript
import { getEAADeadlineRules } from '@holmdigital/standards';

const urgentRules = getEAADeadlineRules();
// Returns list of rules that are mandatory for e-commerce under EAA
```

### 4. Fetch Official Statement Tools
Don't write your own statement if the government provides a mandatory tool.

```typescript
import { getStatementToolsByCountry } from '@holmdigital/standards';

const tools = getStatementToolsByCountry('PT');
// Output: Returns link to Portugal's official generator (O Gerador)
```

---

## 💡 Why use this package?

1.  **Single Source of Truth:** Never hardcode "WCAG algorithm" logic in your UI components.
2.  **Future Proof:** When laws change (like WCAG 2.2), you update this package, and your whole app updates.
3.  **Global Ready:** Launch in Italy? Just switch locale to `it` and your error messages are legally compliant in Italian. Supports 15 locales across 14 countries.
