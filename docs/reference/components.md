# 📚 Component Library Catalog
> **Last Updated:** 2026-02-04

This document serves as a complete directory of all components available in `@holmdigital/components`. All components are built with accessibility (WCAG 2.1 AA & EN 301 549) as a first-class citizen.

## 🏗️ Structure & Layout

| Component | Description | Status |
|-----------|-------------|--------|
### 1. Accordion
**[Source Code](../../packages/components/src/Accordion)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Automatic ARIA:** Manages `aria-expanded` on triggers and `aria-hidden` / `role="region"` on content.
*   **Focus Management:** Standard button focus styles included.
*   **Keyboard:** Enter/Space toggles panels.

**Props Interface:**
```typescript
interface AccordionProps {
  type?: 'single' | 'multiple'; // default: 'single'
  defaultValue?: string | string[];
  children: ReactNode;
}
```

**Usage Example:**
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@holmdigital/components';

<Accordion type="single" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is this accessible?</AccordionTrigger>
    <AccordionContent>
      Yes, it handles aria-expanded and keyboard navigation automatically.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 2. Dialog & Modal
**[Source Code](../../packages/components/src/Modal)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Focus Trap:** *Coming soon* (Currently relies on Dialog implementation).
*   **Role Management:** Defaults to `role="dialog"` and `aria-modal="true"`.
*   **Backdrop:** Automatic backdrop with click-to-dismiss support.

**Usage Example:**
```tsx
import { Modal, Button } from '@holmdigital/components';
import { useState } from 'react';

const MyDialog = () => {
    const [open, setOpen] = useState(false);

    return (
        <Modal open={open} onOpenChange={setOpen}>
            <h2 id="modal-title">Confirm Deletion</h2>
            <p>Are you sure you want to delete this item?</p>
            <div className="flex gap-2 mt-4">
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="danger">Delete</Button>
            </div>
        </Modal>
    );
};
```

### 3. Skeleton
**[Source Code](../../packages/components/src/Skeleton)** | Status: ✅ Available

**Features:**
*   **Reduced Motion:** Respects user's OS preference (`prefers-reduced-motion`).
*   **Layout Stability:** Prevents Cumulative Layout Shift (CLS) penalties.

**Usage Example:**
```tsx
import { Skeleton } from '@holmdigital/components';

const LoadingCard = () => (
  <div className="p-4 border rounded">
    {/* Simulate H2 headline */}
    <Skeleton className="h-8 w-3/4 mb-4" /> 
    {/* Simulate paragraph lines */}
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);
```

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
### 4. Tabs
**[Source Code](../../packages/components/src/Tabs)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Keyboard Navigation:** Full arrow key support (`←` `→` `↑` `↓`) with Home/End support.
*   **Automatic Activation:** Optional `activationMode="automatic"` (focus activates tab) vs "manual" (Enter activates).
*   **ID Linking:** Automatically links `aria-controls` to `aria-labelledby` using a stable, unique ID generator.

**usage:**
```tsx
<Tabs defaultValue="account" orientation="vertical">
  <TabsList>
    <TabTrigger value="account">Account</TabTrigger>
    <TabTrigger value="password">Password</TabTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
  <TabsContent value="password">...</TabsContent>
</Tabs>
```

### 5. SkipLink
**[Source Code](../../packages/components/src/SkipLink)** | Status: ✅ Available

**Built-in Features:**
*   **Visually Hidden:** Hidden by default (`transform: translateY(-150%)`).
*   **Focus Visible:** Slides into view immediately when focused via Tab.
*   **Z-Index:** High z-index ensures it overlays all headers.

### Other Navigation Components
| Component | Description |
|-----------|-------------|
| **[Breadcrumbs](../../packages/components/src/Breadcrumbs)** | Navigation hierarchy trail. |
| **[NavigationMenu](../../packages/components/src/NavigationMenu)** | Accessible site navigation menus. |
| **[Pagination](../../packages/components/src/Pagination)** | Page navigation with `aria-current` support. |
| **[TreeView](../../packages/components/src/TreeView)** | Hierarchical lists with roving tabindex. |

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
| **[Button](../../packages/components/src/Button)** | Standard interactive buttons. | ✅ Available |
| **[Checkbox](../../packages/components/src/Checkbox)** | Tri-state checkboxes and groups. | ✅ Available |
| **[Combobox](../../packages/components/src/Combobox)** | Accessible autocomplete/typeahead. | ✅ Available |
| **[DatePicker](../../packages/components/src/DatePicker)** | Calendar input accessible to screen readers. | ✅ Available |
| **[ErrorSummary](../../packages/components/src/ErrorSummary)** | Top-of-page error listing for form validation. | ✅ Available |
| **[FormField](../../packages/components/src/FormField)** | Wrapper for labels, inputs, and error messages. | ✅ Available |
| **[MultiSelect](../../packages/components/src/MultiSelect)** | Select multiple items with token management. | ✅ Available |
| **[RadioGroup](../../packages/components/src/RadioGroup)** | Mutually exclusive option groups. | ✅ Available |
| **[Select](../../packages/components/src/Select)** | Native or custom accessible dropdowns. | ✅ Available |
| **[Switch](../../packages/components/src/Switch)** | Toggle switch for binary states. | ✅ Available |

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
| **[HelpText](../../packages/components/src/HelpText)** | Contextual help and instructions. | ✅ Available |
| **[LiveRegion](../../packages/components/src/LiveRegion)** | Announce dynamic changes to screen readers. | ✅ Available |
| **[ProgressBar](../../packages/components/src/ProgressBar)** | Visual and semantic progress indication. | ✅ Available |
| **[Toast](../../packages/components/src/Toast)** | Transient notifications. | ✅ Available |
| **[Tooltip](../../packages/components/src/Tooltip)** | Contextual information on hover/focus. | ✅ Available |

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
### 6. DataTable
**[Source Code](../../packages/components/src/DataTable)** | Status: ✅ Available

**Built-in Accessibility Functions:**
*   **Semantic Table Structure:** Generates correct `<caption>`, `<thead>`, `<tbody>`, `th[scope]` markup.
*   **Sort Announcements:** Managing `aria-sort` ("ascending"/"descending") on headers automatically.
*   **Interactive Headers:** Sort buttons are fully keyboard accessible.
*   **Visual Feedback:** Sort direction indicators (▲/▼) are hidden from screen readers (`aria-hidden`) to reduce noise, as `aria-sort` handles the announcement.

**Props Interface:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption: string; // REQUIRED for WCAG compliance
}
```

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
| **[AccessibilityStatement](../../packages/components/src/AccessibilityStatement)** | Auto-generated legal compliance statement (WAD/EAA). | ✅ Available |

---

> **Note:** Just because a component exists doesn't mean it's fully documented in `/docs` yet. This catalog lists what is available in the codebase.
