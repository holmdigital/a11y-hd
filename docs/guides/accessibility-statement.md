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
      organizationName="Exempelkommun"
      websiteUrl="https://exempel.se"
      complianceLevel="partial"
      lastReviewDate={new Date('2026-01-15')}
      contactEmail="tillganglighet@exempel.se"
      locale="sv"
      publishDate={new Date('2024-02-06')}
      badgeUrl="https://img.shields.io/badge/HolmDigital_Engine-100%25-00703C?style=flat-square"
    />
  );
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `country` | `'SE' \| 'NO' \| 'DK' \| 'FI' \| 'NL' \| 'DE' \| 'FR' \| 'ES' \| 'IE' \| 'GB' \| 'US' \| 'CA' \| 'EU'` | ✓ | Country code |
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
| `locale` | `'sv' \| 'en' \| 'no' \| 'fi' \| 'da' \| 'de' \| 'fr' \| 'es' \| 'nl'` | | Language (default: 'en') |
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

## Styling & Premium V2

Since version 1.4.0, the component defaults to the **Premium V2** design, which includes:
- **Glassmorphism Cards**: Sections are grouped into modern translucent cards.
- **Embedded Icons**: Automatic Lucide-style SVG icons for scannability.
- **Micro-animations**: Subtle interactions for a premium feel.

Override styles with `className` or use theme tokens:

```tsx
<AccessibilityStatement
  className="my-custom-statement"
  logoUrl="data:image/png;base64,..."
  // ...other props
/>
```

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
