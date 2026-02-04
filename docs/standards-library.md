# 🏛️ Standards Library Catalog
> **Last Updated:** 2026-02-04

The `@holmdigital/standards` package is the **regulatory brain** of the ecosystem. It provides machine-readable legal data, localized WCAG rules, and mappings to EU directives.

It is designed to protect you from legal complexity by hard-coding compliance logic.

## 📦 What's Inside?

### 1. 🌍 Localized Rule Engines
Instead of generic English error messages, we provide native translations for 12+ locales, customized for local legal terminology.

| Language | Locale | Status |
|----------|--------|--------|
| **Swedish** | `sv` | ✅ Complete (matches DOS-lagen) |
| **English (UK)** | `en-gb` | ✅ Complete (matches UK PSBAR) |
| **English (EU)** | `en` | ✅ Complete (matches EN 301 549) |
| **German** | `de` | ✅ Complete (matches BITV 2.0) |
| **French** | `fr` | ✅ Complete (matches RGAA) |
| **Spanish** | `es` | ✅ Complete (matches UNE 139803) |
| **Finnish** | `fi` | ✅ Complete (matches Digi-laki) |
| **Norwegian** | `no` | ✅ Complete (matches Uu-tilsynet) |
| **Danish** | `da` | ✅ Complete (matches WAD-DK) |
| **Dutch** | `nl` | ✅ Complete (matches Digitoegankelijk) |

### 2. ⚖️ Legal Frameworks (The "Law Layer")
We map technical rules to actual legislation.

| Framework | Description |
|-----------|-------------|
| **Web Accessibility Directive (WAD)** | Applies to **Public Sector** bodies in the EU. |
| **European Accessibility Act (EAA)** | Applies to **Private Sector** services (e-commerce, banking) from June 2025. |
| **EN 301 549** | The technical standard that underpins both laws. |
| **National Laws** | Specific overrides for Sweden (`DOS-lagen`), Norway (`Diskrimineringsloven`), etc. |

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
import { getNordicAuthority } from '@holmdigital/standards';

const authority = getNordicAuthority('digg');
console.log(authority.name); 
// Output: "Myndigheten för digital förvaltning (Digg)"
console.log(authority.monitoringPortal); 
// Output: "https://www.digg.se/analys-och-uppfoljning/..."
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
3.  **Global Ready:** Launch in Finland? Just switch locale to `fi` and your error messages are legally compliant in Finnish.
