# 📚 Component Library Catalog
> **Last Updated:** 2026-03-07

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
  className?: string;
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
**Usage:**
```tsx
import { Dialog, Button } from '@holmdigital/components';
import { useState } from 'react';

const MyDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
            <Dialog 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                title="Confirm Action"
                description="This action cannot be undone."
            >
                <div className="flex gap-2 justify-end mt-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant="danger">Confirm</Button>
                </div>
            </Dialog>
        </>
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
Makes the whole card clickable while keeping semantic focus on the headline link. Props: `title?`, `href?`, `children`, `className?`, `as?` (`'div' | 'article' | 'section' | 'li'`). *Note: there is no `image` prop — render the image as part of `children` if needed.*

```tsx
import { Card } from '@holmdigital/components';

<Card
  title="Accessibility Strategy"
  href="/articles/strategy"
  as="article"
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
### 16. Breadcrumbs
**[Source Code](../../packages/components/src/Breadcrumbs)** | Status: ✅ Available

**Usage:**
```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
</Breadcrumbs>
```

### 17. NavigationMenu
**[Source Code](../../packages/components/src/NavigationMenu)** | Status: ✅ Available

**Usage:**
```tsx
const items = [
  { label: 'Home', href: '/' },
  { 
    label: 'Products', 
    children: [
      { label: 'Cloud', href: '/cloud' },
      { label: 'On-Prem', href: '/on-prem' }
    ] 
  }
];

<NavigationMenu items={items} aria-label="Main" />
```

### 18. Pagination
**[Source Code](../../packages/components/src/Pagination)** | Status: ✅ Available

**Usage:**
```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  ariaLabel="Search results pagination"
/>
```

### 19. TreeView
**[Source Code](../../packages/components/src/TreeView)** | Status: ✅ Available

**Usage:**
```tsx
const files = [
  { 
    id: 'src', 
    label: 'src', 
    children: [{ id: 'app.tsx', label: 'App.tsx' }] 
  }
];

<TreeView 
  data={files} 
  onSelect={(node) => console.log('Selected:', node.label)} 
/>
```

### 💡 Navigation Examples

**SkipLink (The #1 Accessibility Fix)**
Place this at the very top of your App component.

Props: `targetId?: string` (defaults to `"main"`). Text comes from `children` (default: `"Hoppa till huvudinnehåll"`). Extends `React.AnchorHTMLAttributes<HTMLAnchorElement>`.

```tsx
import { SkipLink } from '@holmdigital/components';

export const App = () => (
  <>
    <SkipLink targetId="main-content">Hoppa till innehållet</SkipLink>
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
### 6. Button
**[Source Code](../../packages/components/src/Button)** | Status: ✅ Available

**Usage:**
```tsx
<div className="flex gap-2">
  <Button variant="primary" onClick={save}>Save</Button>
  <Button variant="secondary" onClick={cancel}>Cancel</Button>
  <Button variant="danger" isLoading={isDeleting}>Delete</Button>
</div>
```

### 7. Checkbox
**[Source Code](../../packages/components/src/Checkbox)** | Status: ✅ Available

**Props Interface:**
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onCheckedChange?: (checked: boolean) => void;
}
```

**Gotcha — dual callbacks:** The component fires **both** the native `onChange(ChangeEvent)` AND the boolean-friendly `onCheckedChange(checked)` when the state changes. Pick whichever fits your form layer; no need to reach for `e.target.checked` if you use `onCheckedChange`.

**Usage:**
```tsx
<Checkbox 
  label="I agree to terms" 
  checked={agreed} 
  onCheckedChange={setAgreed} 
/>
```

### 8. Combobox
**[Source Code](../../packages/components/src/Combobox)** | Status: ✅ Available

**Usage:**
```tsx
const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' }
];

<Combobox
  label="Choose Framework"
  options={frameworks}
  value={selected}
  onChange={setSelected}
  description="Select your primary JS framework."
/>
```

### 9. DatePicker
**[Source Code](../../packages/components/src/DatePicker)** | Status: ✅ Available

**Usage:**
```tsx
<DatePicker
  label="Birth Date"
  error={errors.dob} // "Invalid date"
  required
/>
```

### 10. ErrorSummary
**[Source Code](../../packages/components/src/ErrorSummary)** | Status: ✅ Available

**Usage:**
```tsx
// Place at top of form
<ErrorSummary 
  errors={[
    { id: 'email-input', message: 'Email is required' },
    { id: 'password-input', message: 'Password is too short' }
  ]} 
/>
```

### 11. FormField
**[Source Code](../../packages/components/src/FormField)** | Status: ✅ Available (See Forms & Input)

### 12. MultiSelect
**[Source Code](../../packages/components/src/MultiSelect)** | Status: ✅ Available (See Forms & Input)

### 13. RadioGroup
**[Source Code](../../packages/components/src/RadioGroup)** | Status: ✅ Available

**Usage:**
```tsx
<RadioGroup
  name="notifications"
  label="Notification Settings"
  options={[
    { label: 'All Emails', value: 'all' },
    { label: 'Mentions Only', value: 'mentions' }
  ]}
  value={pref}
  onChange={setPref}
/>
```

### 14. Select
**[Source Code](../../packages/components/src/Select)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Compound Components:** `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` — children share state via React context.
*   **Custom Implementation:** No Radix UI (or any other headless-UI) dependency. Everything is rolled in-package for bundle-size and licensing control.
*   **Context-Guarded:** `SelectTrigger` / `SelectItem` throw if rendered outside a `<Select>` ancestor.

**Usage:**
```tsx
<Select value={role} onChange={setRole}>
  <SelectTrigger placeholder="Pick a role" />
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="editor">Editor</SelectItem>
    <SelectItem value="viewer">Viewer</SelectItem>
  </SelectContent>
</Select>
```

### 15. Switch
**[Source Code](../../packages/components/src/Switch)** | Status: ✅ Available

**Usage:**
```tsx
<Switch
  label="Enable Dark Mode"
  checked={isDark}
  onCheckedChange={setIsDark}
/>
```

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
### 20. HelpText
**[Source Code](../../packages/components/src/HelpText)** | Status: ✅ Available

**Usage:**
```tsx
<label htmlFor="pass">Password</label>
<input id="pass" aria-describedby="pass-help" />
<HelpText id="pass-help" variant="default" showIcon>
  Must be at least 8 characters.
</HelpText>
```

### 21. LiveRegion
**[Source Code](../../packages/components/src/LiveRegion)** | Status: ✅ Available

**Usage:**
```tsx
<LiveRegion 
  message={statusMessage} // e.g., "Saving..." -> "Saved!"
  ariaLive="polite" 
  clearAfter={3000}
/>
```

### 22. ProgressBar
**[Source Code](../../packages/components/src/ProgressBar)** | Status: ✅ Available

**Usage:**
```tsx
<ProgressBar 
  value={75} 
  label="Upload progress" 
  showValueLabel 
/>
```

### 23. Toast
**[Source Code](../../packages/components/src/Toast)** | Status: ✅ Available

**Usage:**
```tsx
// 1. Wrap app in Provider
<ToastProvider>
  <App />
</ToastProvider>

// 2. Use hook in components
const { addToast } = useToast();

const save = () => {
  addToast({
    title: 'Success',
    description: 'Data saved successfully.',
    type: 'success'
  });
};
```

### 24. Tooltip
**[Source Code](../../packages/components/src/Tooltip)** | Status: ✅ Available

**Usage:**
```tsx
<Tooltip>
  <TooltipTrigger>
    <button>Hover me</button>
  </TooltipTrigger>
  <TooltipContent>
    This is accessible helper text
  </TooltipContent>
</Tooltip>
```

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
### 25. DataTable
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

## 🔤 Typography & Surface

### 26. Heading
**[Source Code](../../packages/components/src/Heading)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Semantic Level Enforcement:** Always renders a real `h1`–`h6` element — no divs-with-roles.
*   **Level-Only API:** The `level` prop (`1`–`6`) is required, preventing accidental level skipping.
*   **`forwardRef`:** Extends `React.HTMLAttributes<HTMLHeadingElement>` so standard DOM props pass through.

**Props Interface:**
```typescript
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}
```

**Usage Example:**
```tsx
import { Heading } from '@holmdigital/components';

<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section Title</Heading>
```

### 27. Card
**[Source Code](../../packages/components/src/Card)** | Status: ✅ Available

**Built-in Accessibility Features:**
*   **Stretched Link Pattern:** If `href` is passed, the title becomes a single link that covers the whole card via CSS — one tab stop, valid HTML (no nested interactives).
*   **Semantic Container:** Use the `as` prop to render the appropriate element (`div` / `article` / `section` / `li`).

**Props Interface:**
```typescript
interface CardProps {
  title?: React.ReactNode;
  href?: string;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section' | 'li'; // default: 'div'
}
```

**Usage Example:**
```tsx
import { Card } from '@holmdigital/components';

<Card title="Accessibility Strategy" href="/articles/strategy" as="article">
  Learn how to implement a component-first strategy.
</Card>
```

## ⚖️ Legal & Compliance

| Component | Description | Status |
|-----------|-------------|--------|
| **[AccessibilityStatement](../../packages/components/src/AccessibilityStatement)** | Template-driven legal compliance statement (WAD/EAA/DDA). **`country`** accepts **all 17 `Country` values** — the 16 supported countries plus `'EU'` for EU Commission references. **`sector`** is `'public'` (WAD) or `'private'` (EAA). **`locale`** has 12 dedicated templates (en, sv, no, fi, da, nl, de, fr, es, it, pt, pl); `nb`→`no`, `dk`→`da`, and `en-gb`/`en-us`/`en-ca`/`en-au` fall back to the `en` template. | ✅ Available |

---

> **Note:** Just because a component exists doesn't mean it's fully documented in `/docs` yet. This catalog lists what is available in the codebase.
