# 🧩 The Component-First Strategy: Stopping Accessibility Debt at the Source

*Subtitle: Why fixing accessibility in production is too late, and how `@holmdigital/components` solve it.*

---

**Summary:**  
Trying to "fix" accessibility after building a UI is expensive and painful. The solution is a **Component-First Strategy**. This article explores how pre-built accessible components (like robust DataTables and TreeViews) prevent errors from ever reaching production.

---

### The "Patching" Trap

Traditional workflow:
1.  Designer draws a UI.
2.  Developer builds it (using `<div>` soup).
3.  QA finds accessibility issues 2 days before launch.
4.  Developer adds `aria-label="fix"` and hopes for the best.

**Result:** Fragile code, weird screen reader behavior, and "accessibility debt" that never gets paid.

### The Solution: Bake it in directly

Instead of teaching every developer 100+ ARIA rules, give them components where accessibility is **hard-coded**.

#### Example: The Complex Data Table

Building a sortable table that works with screen readers is hard. You need `aria-sort`, `scope="col"`, and keyboard listeners on headers.

**The HolmDigital Way:**

```tsx
// Developers just write this:
<DataTable 
  data={users}
  columns={[
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Role', accessor: 'role' }
  ]}
  caption="Active Users"
/>
```

**What happens under the hood:**
*   ✅ Automatically generates `th scope="col"`.
*   ✅ Manages `aria-sort="ascending/descending"`.
*   ✅ Ensures keyboard focus states are visible.
*   ✅ Announces sorting changes to screen readers.

### Beyond the Basics: Advanced Patterns

We recently released advanced components for complex data:

1.  **TreeView:** Recursive navigation with *Roving Tabindex*. No more "Tab-Tab-Tab" hell to get past a menu.
2.  **Card:** The "Stretched Link" pattern. Entire card is clickable, but semantically it's just one link. No nested interactive element errors.
3.  **Pagination:** Correctly marked as a navigation landmark with `aria-current="page"`.

### Developer Experience = User Experience

If it's hard to build accessible UIs, developers won't do it. By providing a component library where the *easiest* way to build is also the *accessible* way, we win by default.

**ROI of Component-First:**
*   **Time to market:** Faster dev (no re-inventing wheels).
*   **Quality:** Consistent experience across the app.
*   **Safety:** EAA compliance is handled at the root level.

### Conclusion

Stop patching. Start composing. Adoption of an accessible design system is the single highest-ROI investment you can make for digital compliance.

---

*Tags: #React #DesignSystems #Accessibility #WebComponents #Frontend #HolmDigital*
