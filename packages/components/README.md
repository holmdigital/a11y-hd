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
- **9-Locale Accessibility Statements**: The `AccessibilityStatement` component supports `en`, `sv`, `no`, `fi`, `da`, `nl`, `de`, `fr`, and `es` with complete legal phrasing per locale.

## License

MIT © Holm Digital AB
