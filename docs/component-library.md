# 📚 Component Library Catalog
> **Last Updated:** 2026-02-04

This document serves as a complete directory of all components available in `@holmdigital/components`. All components are built with accessibility (WCAG 2.1 AA & EN 301 549) as a first-class citizen.

## 🏗️ Structure & Layout

| Component | Description | Status |
|-----------|-------------|--------|
| **[Accordion](./../packages/components/src/Accordion)** | Collapsible content sections (Review ARIA patterns). | ✅ Available |
| **[Card](./../packages/components/src/Card)** | Content container with "stretched link" accessibility pattern. | ✅ Available |
| **[Dialog](./../packages/components/src/Dialog)** | Modal or non-modal dialogs with focus management. | ✅ Available |
| **[Heading](./../packages/components/src/Heading)** | Semantic heading levels compliant with document outlines. | ✅ Available |
| **[Modal](./../packages/components/src/Modal)** | Overlay dialogs with strict focus trapping. | ✅ Available |
| **[Skeleton](./../packages/components/src/Skeleton)** | Loading placeholders to reduce layout shift. | ✅ Available |

### 💡 Structure Examples

**Card with "Stretched Link"**
Makes the whole card clickable while keeping semantic focus on the headline link.

```tsx
import { Card } from '@holmdigital/components';

<Card 
  title="Accessibility Strategy" 
  href="/articles/strategy"
  image="/images/a11y-cover.jpg"
>
  Learn how to implement a component-first strategy.
</Card>
```

## 🧭 Navigation

| Component | Description | Status |
|-----------|-------------|--------|
| **[Breadcrumbs](./../packages/components/src/Breadcrumbs)** | Navigation hierarchy trail. | ✅ Available |
| **[NavigationMenu](./../packages/components/src/NavigationMenu)** | Accessible site navigation menus. | ✅ Available |
| **[Pagination](./../packages/components/src/Pagination)** | Page navigation with `aria-current` support. | ✅ Available |
| **[SkipLink](./../packages/components/src/SkipLink)** | Essential "Skip to main content" link for keyboard users. | ✅ Available |
| **[Tabs](./../packages/components/src/Tabs)** | Tabbed interface with automatic keyboard activation modes. | ✅ Available |
| **[TreeView](./../packages/components/src/TreeView)** | Hierarchical lists with roving tabindex. | ✅ Available |

### 💡 Navigation Examples

**SkipLink (The #1 Accessibility Fix)**
Place this at the very top of your App component.

```tsx
import { SkipLink } from '@holmdigital/components';

export const App = () => (
  <>
    <SkipLink targetId="main-content" label="Hoppa till innehållet" />
    <Header />
    <main id="main-content">
      {/* Page content */}
    </main>
  </>
);
```

## 📝 Forms & Input

| Component | Description | Status |
|-----------|-------------|--------|
| **[Button](./../packages/components/src/Button)** | Standard interactive buttons. | ✅ Available |
| **[Checkbox](./../packages/components/src/Checkbox)** | Tri-state checkboxes and groups. | ✅ Available |
| **[Combobox](./../packages/components/src/Combobox)** | Accessible autocomplete/typeahead. | ✅ Available |
| **[DatePicker](./../packages/components/src/DatePicker)** | Calendar input accessible to screen readers. | ✅ Available |
| **[ErrorSummary](./../packages/components/src/ErrorSummary)** | Top-of-page error listing for form validation. | ✅ Available |
| **[FormField](./../packages/components/src/FormField)** | Wrapper for labels, inputs, and error messages. | ✅ Available |
| **[MultiSelect](./../packages/components/src/MultiSelect)** | Select multiple items with token management. | ✅ Available |
| **[RadioGroup](./../packages/components/src/RadioGroup)** | Mutually exclusive option groups. | ✅ Available |
| **[Select](./../packages/components/src/Select)** | Native or custom accessible dropdowns. | ✅ Available |
| **[Switch](./../packages/components/src/Switch)** | Toggle switch for binary states. | ✅ Available |

### 💡 Form Examples

**Accessibile Form Field**
Handles label association, error messaging, and required attributes automatically.

```tsx
import { FormField } from '@holmdigital/components';

<FormField
  id="email-input"
  label="E-postadress"
  type="email"
  required
  error={errors.email} // "Ange en giltig e-post"
  helpText="Vi delar aldrig din e-post."
/>
```

**MultiSelect with Tokens**
Accessible way to tag or select multiple items.

```tsx
import { MultiSelect } from '@holmdigital/components';

<MultiSelect
  label="Välj ämnen"
  options={[
    { label: 'Tillgänglighet', value: 'a11y' },
    { label: 'Design', value: 'ux' }
  ]}
  selected={['a11y']}
  onChange={handleSelectionChange}
/>
```

## 📢 Feedback & Status

| Component | Description | Status |
|-----------|-------------|--------|
| **[HelpText](./../packages/components/src/HelpText)** | Contextual help and instructions. | ✅ Available |
| **[LiveRegion](./../packages/components/src/LiveRegion)** | Announce dynamic changes to screen readers. | ✅ Available |
| **[ProgressBar](./../packages/components/src/ProgressBar)** | Visual and semantic progress indication. | ✅ Available |
| **[Toast](./../packages/components/src/Toast)** | Transient notifications. | ✅ Available |
| **[Tooltip](./../packages/components/src/Tooltip)** | Contextual information on hover/focus. | ✅ Available |

### 💡 Feedback Examples

**LiveRegion (Polite Announcements)**
Tell screen readers when something happens without moving focus.

```tsx
import { LiveRegion } from '@holmdigital/components';

// Announce "Saved!" when save completes
<LiveRegion message={statusMessage} />
```

## 📊 Data Display

| Component | Description | Status |
|-----------|-------------|--------|
| **[DataTable](./../packages/components/src/DataTable)** | Complex accessible tables with sorting. | ✅ Available |

### 💡 Data Examples

**Sortable Data Table**
Generates `th scope="col"`, `aria-sort`, and handles keyboard sorting interactions.

```tsx
import { DataTable } from '@holmdigital/components';

<DataTable
  caption="Pågående ärenden"
  data={tickets}
  columns={[
    { header: 'ID', accessor: 'id', sortable: true },
    { header: 'Status', accessor: 'status' },
    { header: 'Datum', accessor: 'created_at', sortable: true }
  ]}
/>
```

## ⚖️ Legal & Compliance

| Component | Description | Status |
|-----------|-------------|--------|
| **[AccessibilityStatement](./../packages/components/src/AccessibilityStatement)** | Auto-generated legal compliance statement (WAD/EAA). | ✅ Available |

---

> **Note:** Just because a component exists doesn't mean it's fully documented in `/docs` yet. This catalog lists what is available in the codebase.
