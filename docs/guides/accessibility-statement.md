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
    />
  );
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `country` | `'SE' \| 'NO' \| 'DK' \| 'FI' \| 'DE' \| 'FR' \| 'ES' \| 'IE'` | ✓ | Country code |
| `sector` | `'public' \| 'private'` | ✓ | Determines WAD or EAA |
| `organizationName` | `string` | ✓ | Organization name |
| `websiteUrl` | `string` | ✓ | Website URL |
| `complianceLevel` | `'full' \| 'partial' \| 'non-compliant'` | ✓ | Current status |
| `lastReviewDate` | `Date` | ✓ | Last review date |
| `contactEmail` | `string` | ✓ | Contact email |
| `nonComplianceItems` | `string[]` | | Known issues |
| `locale` | `'sv' \| 'en'` | | Language (default: 'en') |
| `className` | `string` | | Extra CSS class |

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

## Styling

The component uses inline styles by default. Override with `className`:

```tsx
<AccessibilityStatement
  className="my-custom-statement"
  // ...other props
/>
```

```css
.my-custom-statement {
  font-family: 'Roboto', sans-serif;
  border-radius: 16px;
}
```

## Official Statement Tools

For official statement generators, use the API:

```typescript
import { getStatementTools } from '@holmdigital/standards';

const tools = getStatementTools();
// [
//   { id: 'digg-generator', name: 'Digg Accessibility Statement Generator', ... },
//   { id: 'eu-model-statement', name: 'EU Model Accessibility Statement', ... }
// ]
```
