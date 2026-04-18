# Accessibility Statement Tutorial

Generate legally compliant accessibility statements using `@holmdigital/components`.

## Quick Start

```tsx
import { AccessibilityStatement } from '@holmdigital/components';

function MyPage() {
  return (
    <AccessibilityStatement
      country="SE"
      sector="public"
      organizationName="HolmDigital"
      websiteUrl="https://holmdigital.se"
      complianceLevel="partial"
      lastReviewDate={new Date('2026-02-08')}
      contactEmail="hej@holmdigital.se"
      locale="sv"
      publishDate={new Date('2024-02-06')}
    />
  );
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `country` | `'SE' \| 'NO' \| 'DK' \| 'FI' \| 'NL' \| 'DE' \| 'FR' \| 'ES' \| 'IE' \| 'IT' \| 'PT' \| 'PL' \| 'GB' \| 'US' \| 'CA' \| 'AU' \| 'EU'` | ✓ | Country code |
| `sector` | `'public' \| 'private'` | ✓ | Determines WAD or EAA |
| `organizationName` | `string` | ✓ | Organization name |
| `websiteUrl` | `string` | ✓ | Website URL |
| `complianceLevel` | `'full' \| 'partial' \| 'non-compliant'` | ✓ | Current status |
| `lastReviewDate` | `Date` | ✓ | Last review date |
| `contactEmail` | `string` | ✓ | Contact email |
| `phoneNumber` | `string` | | Contact phone number |
| `responseTime` | `string` | | Expected response time (e.g., "2 days") |
| `assessmentDate` | `Date` | | Date when the assessment was performed |
| `evaluationMethod` | `string` | | Method used (e.g., "Automated Scan") |
| `generatorTool` | `{ name: string, url: string }` | | Tool used to generate this statement |
| `nonComplianceItems` | `string[]` | | Known issues |
| `locale` | `'sv' \| 'en' \| 'en-gb' \| 'en-us' \| 'en-ca' \| 'en-au' \| 'no' \| 'fi' \| 'da' \| 'de' \| 'fr' \| 'es' \| 'nl' \| 'it' \| 'pt' \| 'pl'` | | Language (default: 'en') |
| `logoUrl` | `string` | | URL or Data URI for organization logo |
| `badgeUrl` | `string` | | URL for a compliance badge (e.g. Shields.io) |
| `publishDate` | `Date` | | Date when the website was first published |
| `className` | `string` | | Extra CSS class |

## Config & CLI Mapping

When using the `@holmdigital/engine` CLI or a `.a11yrc` configuration file, the keys are simplified. They map to the props above as follows:

| CLI Flag / Config Key | Component Prop |
| :--- | :--- |
| `--org` / `"org"` | `organizationName` |
| `--email` / `"email"` | `contactEmail` |
| `--phone` / `"phone"` | `phoneNumber` |
| `--response-time` / `"responseTime"` | `responseTime` |
| `--country` / `"country"` | `country` |
| `--sector` / `"sector"` | `sector` |
| `--publish-date` / `"publishDate"` | `publishDate` |

## What Gets Generated

The component automatically includes:

1. **Compliance Status** - Badge showing full/partial/non-compliant
2. **Legal Basis** - Applicable law with link to legislation
3. **Enforcement Authority** - Who monitors compliance
4. **Contact Section** - How to report issues
5. **Statement Tool Link** - Official generator reference

## Example: Swedish Public Sector

```tsx
<AccessibilityStatement
  country="SE"
  sector="public"
  organizationName="Stockholms kommun"
  websiteUrl="https://stockholm.se"
  complianceLevel="partial"
  lastReviewDate={new Date()}
  contactEmail="tillganglighet@stockholm.se"
  nonComplianceItems={[
    "Some videos lack captions",
    "PDF documents not fully accessible"
  ]}
  locale="sv"
/>
```

**Output includes:**
- 📜 DOS-lagen (Lag 2018:1937)
- 🏛️ Digg as enforcement authority
- 🔗 Link to official legislation
- 📧 Contact form for accessibility issues

## Example: German Private Sector (EAA)

```tsx
<AccessibilityStatement
  country="DE"
  sector="private"
  organizationName="Online Shop GmbH"
  websiteUrl="https://shop.de"
  complianceLevel="full"
  lastReviewDate={new Date()}
  contactEmail="barrierefreiheit@shop.de"
  locale="en"
/>
```

**Output includes:**
- 📜 BFSG (EAA implementation)
- ⚠️ EAA deadline: June 28, 2025
- 💶 Sanctions up to 500,000 EUR

## Example: US State/Local Government (ADA Title II)

```tsx
<AccessibilityStatement
  country="US"
  sector="public"
  organizationName="City of Example"
  websiteUrl="https://cityofexample.gov"
  complianceLevel="partial"
  lastReviewDate={new Date()}
  contactEmail="accessibility@cityofexample.gov"
  locale="en-us"
/>
```

**Output includes:**
- 📜 ADA Title II (28 CFR Part 35, DOJ Final Rule 2024-04-24) + Section 508 as parallel federal reference
- 🏛️ U.S. Department of Justice, Civil Rights Division as enforcement authority
- ⚠️ Compliance deadline: 2026-04-24 for entities serving 50,000+ population
- 💵 Civil penalties up to $75k (first violation) / $150k (subsequent) + private lawsuits

## Example: US Private Sector (ADA Title III)

```tsx
<AccessibilityStatement
  country="US"
  sector="private"
  organizationName="Example Retail Inc."
  websiteUrl="https://shop.example.com"
  complianceLevel="partial"
  lastReviewDate={new Date()}
  contactEmail="accessibility@example.com"
  locale="en-us"
/>
```

**Output includes:**
- 📜 ADA Title III (28 CFR Part 36)
- 🏛️ U.S. Department of Justice, Civil Rights Division as enforcement authority
- 📎 WCAG 2.1 Level AA as de facto standard (per Robles v. Domino's and Gil v. Winn-Dixie)

> **Note on `country="US"`:** The rendered law and enforcement body both depend on `sector`. Set `"public"` for state/local governments (Title II + Section 508), `"private"` for commercial/public-accommodation entities (Title III).

## Template-Driven Architecture

Since version 2.0.0, the accessibility statement system uses **externalized JSON templates**. This allows for:
- **Legal Precision**: Each language uses professional legal phrasing specific to its region.
- **Easy Customization**: You can override templates by placing custom JSON files in your project.
- **17 Statement Locales**: Full professional templates for EN, EN-GB, EN-US, EN-CA, EN-AU, SV, NO, FI, DA, NL, DE, FR, ES, IT, PT, and PL.

### How it works
The `@holmdigital/engine` automatically selects the correct template based on your provided `locale`. It handles substitution of placeholders like `{<website>}`, `{<organisation>}`, and enforcement body names automatically.

## Styling & Premium V2

The component uses a **Premium V2** design with:
- **Glassmorphism Cards**: Modern translucent cards for section grouping.
- **Dynamic Icons**: Icons are automatically mapped based on Section IDs in all support languages.
- **Micro-animations**: Smooth transitions for an interactive feel.

## Official Statement Tools

For official statement generators, use the API:

```typescript
import { getStatementToolsByCountry } from '@holmdigital/standards';
 
 const tools = getStatementToolsByCountry('SE');
 // [
 //   { id: 'digg-generator', name: 'Digg Accessibility Statement Generator', recommended: true, ... },
 //   { id: 'eu-model-statement', name: 'EU Model Accessibility Statement', ... }
 // ]
```
