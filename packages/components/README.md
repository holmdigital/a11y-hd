# @holmdigital/components

[![npm version](https://img.shields.io/npm/v/@holmdigital/components.svg)](https://www.npmjs.com/package/@holmdigital/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
[![Downloads](https://img.shields.io/npm/dm/@holmdigital/components.svg)](https://www.npmjs.com/package/@holmdigital/components)

> Prescriptive, accessible React components for regulatory compliance.

## Why this package?

Building accessible components from scratch is hard. Ensuring they comply with **EN 301 549** and national laws is even harder.

These components are **Compliant by Default**. They automatically handle:
-   **ARIA attributes**: No need to manually manage `aria-expanded`, `aria-controls`, etc.
-   **Focus Management**: Built-in keyboard navigation for modal traps, dropdowns, and menus.
-   **Contrast**: Default styles are tested against WCAG AA/AAA requirements.

Using these components significantly reduces the risk of regulatory violations in your UI.

For a full list of all 29 accessible components, including practical code examples and advanced usage patterns, see the **[Component Library Catalog](../../docs/reference/components.md)**.

## Installation

```bash
npm install @holmdigital/components
```

## Optional dependencies

`@holmdigital/components` declares `lucide-react` as an **optional** peer dependency. The four components that use Lucide icons — `Checkbox`, `HelpText`, `Select`, `Toast` — gracefully fall back to Unicode text glyphs when `lucide-react` is not installed in the consumer application.

| Component | Lucide icon | Fallback glyph |
|-----------|-------------|----------------|
| `Checkbox` | `Check` | `✓` |
| `HelpText` (info) | `Info` | `ℹ` |
| `HelpText` (error) | `AlertCircle` | `⚠` |
| `Select` (chevron) | `ChevronDown` | `▾` |
| `Select` (selected) | `Check` | `✓` |
| `Toast` (close) | `X` | `✕` |
| `Toast` (info) | `Info` | `ℹ` |
| `Toast` (success) | `CheckCircle` | `✓` |
| `Toast` (warning) | `AlertTriangle` | `⚠` |
| `Toast` (error) | `AlertCircle` | `⛔` |

To enable Lucide icons in your application, install `lucide-react` alongside this package:

```bash
npm install @holmdigital/components lucide-react
```

The fallback glyphs are decorative (`aria-hidden="true"`). Semantic meaning is conveyed by the surrounding element's role, label, or text content — screen readers see the same announcement regardless of which icon variant renders.

## Usage

```tsx
import { Button, FormField, Heading, ErrorSummary, AccessibilityStatement, Combobox, DatePicker, MultiSelect, DataTable, Pagination, Card, TreeView } from '@holmdigital/components';

function App() {
  return (
      <ErrorSummary 
        errors={[
          { id: 'email', message: 'Enter a valid email address' },
          { id: 'country', message: 'Select a country' }
        ]} 
      />

      <Heading level={1}>Contact Us</Heading>
      
      <FormField 
        label="Email Address" 
        id="email"
        type="email" 
        required 
        autoComplete="email" 
        helpText="We'll never share your email."
      />

      <Combobox 
        label="Country" 
        id="country"
        options={[
          { label: 'Sweden', value: 'se' },
          { label: 'Norway', value: 'no' }
        ]}
        onChange={(val) => console.log(val)}
      />

      <DatePicker 
        label="Preferred Date" 
        required
      />

      <MultiSelect
        label="Interests"
        options={[
          { label: 'Accessibility', value: 'a11y' },
          { label: 'Performance', value: 'perf' }
        ]}
        selected={['a11y']}
        onChange={(val) => console.log(val)}
      />

      <Card title="Latest Updates" href="/updates">
          Checking out the new components!
      </Card>

      <DataTable 
        caption="Users"
        data={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
        columns={[
            { header: 'ID', accessor: 'id', sortable: true },
            { header: 'Name', accessor: 'name' }
        ]}
      />

      <Pagination 
        currentPage={1} 
        totalPages={10} 
        onPageChange={(page) => console.log(page)} 
      />

      <TreeView 
        data={[
            { id: '1', label: 'Documents', children: [
                { id: '1-1', label: 'Work' },
                { id: '1-2', label: 'Private' }
            ]},
            { id: '2', label: 'Images' }
        ]}
      />

      <AccessibilityStatement
        country="NO"
        organizationName="HolmDigital"
        websiteUrl="https://holmdigital.se"
        complianceLevel="partial"
        lastReviewDate={new Date()}
        publishDate={new Date('2024-02-06')}
        contactEmail="hej@holmdigital.se"
        locale="no"
      />
      
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}
```

## Compliance Features

- **High Contrast**: Default styles meet WCAG AA requirements.
- **Keyboard Navigation**: Full focus management and visible focus indicators.
- **Screen Reader Support**: Correct ARIA attributes and labels built-in.
- **12-Locale Accessibility Statements**: The `AccessibilityStatement` component ships with professional legal templates for `en`, `sv`, `no`, `fi`, `da`, `nl`, `de`, `fr`, `es`, `it`, `pt`, `pl`. Additional locale codes are accepted as input — `nb` aliases to `no`, `dk` aliases to `da`, and `en-gb` / `en-us` / `en-ca` / `en-au` fall back to `en`. Sector-aware (`public`/`private`) for correct enforcement body and law. Supports the full 16-country + EU jurisdiction set including Australia (DDA 1992 / AHRC).

## License

MIT © Holm Digital AB
