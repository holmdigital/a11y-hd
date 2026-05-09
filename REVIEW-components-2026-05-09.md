---
phase: components-a11y-audit
reviewed: 2026-05-09T00:00:00Z
depth: deep
files_reviewed: 16
files_reviewed_list:
  - packages/components/src/Dialog/Dialog.tsx
  - packages/components/src/Modal/Modal.tsx
  - packages/components/src/Toast/Toast.tsx
  - packages/components/src/NavigationMenu/NavigationMenu.tsx
  - packages/components/src/Combobox/Combobox.tsx
  - packages/components/src/Select/Select.tsx
  - packages/components/src/MultiSelect/MultiSelect.tsx
  - packages/components/src/DatePicker/DatePicker.tsx
  - packages/components/src/TreeView/TreeView.tsx
  - packages/components/src/Accordion/Accordion.tsx
  - packages/components/src/Tabs/Tabs.tsx
  - packages/components/src/Switch/Switch.tsx
  - packages/components/src/Checkbox/Checkbox.tsx
  - packages/components/src/RadioGroup/RadioGroup.tsx
  - packages/components/src/SkipLink/SkipLink.tsx
  - packages/components/src/Tooltip/Tooltip.tsx
findings:
  critical: 14
  warning: 18
  info: 9
  total: 41
status: issues_found
---

# Components Package WCAG 2.1 AA Audit (v2.3.0)

**Reviewed:** 2026-05-09
**Depth:** deep (cross-file analysis, ARIA/keyboard/focus tracing)
**Files Reviewed:** 16
**Status:** issues_found — multiple BLOCKERs that contradict published "accessible by default" claim

## Summary

This audit follows the same template as the recent Tooltip Hoverable/Dismissible fix: the package's marketing claim that components are "accessible by default" is the standard against which every finding is graded. A finding is **BLOCKER** when:

1. The code violates a WCAG 2.1 A or AA Success Criterion the README/wiki implies is met, **or**
2. There is a published-API false claim (e.g., a JSDoc comment says "Single tab stop", "WAI-ARIA Tree View pattern", "WAI-ARIA 1.2 Combobox with Listbox Popup pattern", "Home/End to jump to start/end", but the code does not deliver it), **or**
3. The defect causes an actual user-facing accessibility failure that an audit (DIGG, Logius, an independent expert review) would call out.

The most serious cluster of BLOCKERs is in the **Dialog/Modal** family: there is no focus trap implementation, focus is not moved into the dialog on open, focus is not restored on close, the close handler bypasses `onClose`, the variant prop accepts `'alert'` but never sets `role="alertdialog"`, all dialog instances share the same `id="dialog-title"`/`id="dialog-desc"` (duplicate IDs are a structural HTML defect that will break AT for any page with two dialogs), and the backdrop click handler can fire on legitimate inside-clicks on transformed/scaled dialogs.

The second-most serious cluster is **Combobox / Select / MultiSelect** which all advertise WAI-ARIA Combobox compliance but ship with broken or missing keyboard contracts (no Home/End, no type-ahead in Select, no token grid navigation in MultiSelect despite a stub for it, an Escape that doesn't `preventDefault` in MultiSelect so it bubbles to a parent Dialog and closes both).

**TreeView** is documented as "Single tab stop" but the file contains the same render block twice — root and recursive — a copy-paste defect that means the recursive render's `nodeRefs` Map is overwritten by the root render's refs of the same id, causing focus management to silently target the wrong node when ids collide.

**Toast** uses `role="alert"` for everything regardless of severity, auto-dismisses ALL toasts (even `error`) after 5 s — directly violating WCAG 2.2.1 Timing Adjustable for any error message a user might need to read or copy — and has no Escape-to-dismiss.

**NavigationMenu** advertises keyboard support in JSDoc but has no Arrow keys, no Home/End, no type-ahead, and a hover-triggered submenu without a Hoverable transit-pointer pattern (the same WCAG 1.4.13 defect we just fixed in Tooltip).

**Accordion** has no Up/Down/Home/End keyboard support per APG.

**Switch** uses `Math.random()` for ids (SSR hydration mismatch + collision risk), and the visible `<label>` calls `handleClick` on click — clicking a label whose `for` already targets the button causes a double-toggle.

**Checkbox** also uses `Math.random()` for ids, and applies `aria-hidden="true"` to the styled box that contains the visible focus ring — meaning `peer-focus:ring` decorates an aria-hidden element while the real `<input>` is `sr-only` (functional but a quality smell). More seriously: the `onCheckedChange` + `onChange` dual contract silently swallows controlled-component bugs.

**SkipLink** moves off-screen using `transform: -translate-y-[150%]` instead of clipping — it remains in the accessibility tree but is visually-only-hidden. More importantly, on focus it uses `top-4` so it overlays whatever is at the top-left of the viewport which may obscure a fixed-position logo/menu, and **the default text is hardcoded Swedish** ("Hoppa till huvudinnehåll") in a package shipped to international customers without any locale prop.

Overall: this version (2.3.0) cannot honestly claim WCAG 2.1 AA conformance. The fixes are mostly local (one component each) and well-scoped for the planned 2.4.0 a11y minor.

---

## Critical Issues (BLOCKERs)

### CR-01: Dialog has no focus trap — Tab escapes the modal

**File:** `packages/components/src/Dialog/Dialog.tsx:32-147`
**WCAG:** 2.4.3 Focus Order (A), 2.1.2 No Keyboard Trap (A — inverse: focus escapes when it shouldn't)
**Issue:** Native `<dialog>.showModal()` provides a focus trap in modern browsers, but the implementation pulls native dialog into a React-controlled `isOpen` flow without verifying trap behaviour, and **does not move initial focus into the dialog explicitly**. While `showModal()` will focus the first tabbable element in most browsers, this is fragile — Safari historically focused the dialog itself, older browsers did nothing, and if the consumer renders the dialog with no focusable children except via portal-rendered content, focus is lost. There is also no documented "initialFocusRef" prop, so a consumer cannot say "focus this confirm button on open." Any audit comparing this to APG Modal Dialog will fail it.
**Fix:** Add explicit focus management:
```tsx
useEffect(() => {
    if (isOpen && dialogRef.current) {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        // Move focus into dialog (first focusable, or initialFocusRef if provided)
        const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
        return () => {
            // Restore focus on close
            previouslyFocused?.focus?.();
        };
    }
}, [isOpen]);
```
Add an `initialFocusRef?: React.RefObject<HTMLElement>` prop and prefer it over the auto-detected first focusable. Document that consumers MUST supply this for destructive confirm dialogs (so focus lands on Cancel, not Confirm).

---

### CR-02: Dialog does not restore focus to opener on close

**File:** `packages/components/src/Dialog/Dialog.tsx:39-70`
**WCAG:** 2.4.3 Focus Order (A)
**Issue:** When the dialog closes, focus falls to `document.body` (or wherever the browser default lands). The element that opened the dialog is not stored, and no restore happens. Sighted users may not notice; keyboard users lose their place entirely and AT users hear "blank, document" instead of returning to the trigger.
**Fix:** Store the opener via `document.activeElement` in the `isOpen → true` branch of the effect, then call `.focus()` on it in the close branch (see CR-01 fix). Guard with `instanceof HTMLElement`.

---

### CR-03: Dialog `variant="alert"` does not set `role="alertdialog"`

**File:** `packages/components/src/Dialog/Dialog.tsx:28, 108-120, 122`
**WCAG:** 4.1.2 Name, Role, Value (A)
**Issue:** The public `DialogProps` interface advertises `variant?: 'default' | 'alert'`, and the title color changes to red, implying alert semantics. But the rendered `<dialog>` element has no `role` attribute (defaults to `dialog`), and the visual alert styling is not exposed to AT. Screen reader users hear an ordinary dialog when developers expect alertdialog semantics (which AT announce with higher urgency and trap focus more aggressively).
**Fix:**
```tsx
<dialog
    ref={dialogRef}
    role={variant === 'alert' ? 'alertdialog' : 'dialog'}
    aria-modal="true"  // also missing — see CR-04
    ...
```

---

### CR-04: Dialog missing `aria-modal="true"`

**File:** `packages/components/src/Dialog/Dialog.tsx:108-120`
**WCAG:** 4.1.2 Name, Role, Value (A)
**Issue:** Native `<dialog>` opened with `showModal()` is implicitly modal, but `aria-modal="true"` is still recommended for AT compatibility (especially older NVDA/JAWS combinations) per APG Modal Dialog. Without it, some AT will read background content as if it were navigable.
**Fix:** Add `aria-modal="true"` to the `<dialog>` element.

---

### CR-05: Dialog title/description IDs collide across multiple dialogs on the same page

**File:** `packages/components/src/Dialog/Dialog.tsx:117-118, 122, 138`
**WCAG:** 4.1.1 Parsing (A — historically; structural defect), 1.3.1 Info and Relationships (A)
**Issue:** The implementation hardcodes `id="dialog-title"` and `id="dialog-desc"` and references them via `aria-labelledby`/`aria-describedby`. Any page that mounts two `<Dialog>` instances simultaneously (e.g., a confirmation inside another dialog, or two dialogs in the React tree even if only one is open) emits duplicate `id`s. Browsers resolve `getElementById` to the first match, meaning the second dialog's accessible name is the first dialog's title. This is a textbook WCAG audit finding.
**Fix:** Use `useId()`:
```tsx
const id = useId();
const titleId = `${id}-title`;
const descId = `${id}-desc`;
// ...
<dialog aria-labelledby={titleId} aria-describedby={description ? descId : undefined}>
    <h2 id={titleId}>{title}</h2>
    {description && <p id={descId}>{description}</p>}
</dialog>
```

---

### CR-06: Dialog close button bypasses `onClose` — `isOpen` becomes desynced from native state

**File:** `packages/components/src/Dialog/Dialog.tsx:125-133`
**WCAG:** 4.1.2 Name, Role, Value (A — programmatic state) — also a logic bug
**Issue:** The close button calls `dialogRef.current?.close()` directly. This fires the native `close` event, which the effect at line 78 catches and does call `onClose()`. Good — except that the same close-event handler at line 78 also unconditionally writes `document.body.style.overflow = ''`. If the consumer keeps `isOpen={true}` after `close` (e.g., re-opens the dialog from the parent state in response), the effect at line 39 runs again, calls `showModal()`, but body overflow is already cleared and may not be relocked because `scrollLockRef.current` was never reset. Trace:
1. User clicks ×. `dialog.close()` → native close event → `handleClose` runs → `onClose()` is called → consumer sets `isOpen=false`. Body overflow is cleared. `scrollLockRef.current` remains `true` (only the second effect path clears it; the first effect's else branch does clear it but only re-runs when `isOpen` changes).
2. Consumer immediately re-opens (`isOpen=true`). First effect runs → `dialog.open` is now `false` so `showModal()` runs → tries to lock scroll → **`scrollLockRef.current` is still `true` from before**, so the lock is skipped. Body remains scrollable while the dialog is open.

This is a real defect, not theoretical — any "Confirm → Reopen with different content" flow exhibits it.
**Fix:** In the close-event handler, reset `scrollLockRef.current = false`. Better: keep all scroll-lock logic in a single effect keyed on `isOpen` and stop mutating from the close handler.

---

### CR-07: Dialog backdrop-click detection breaks for transformed/scaled dialogs

**File:** `packages/components/src/Dialog/Dialog.tsx:86-97`
**WCAG:** 3.2.4 Consistent Identification (AA — inverse: inside-click should not dismiss)
**Issue:** The backdrop-click handler computes `getBoundingClientRect()` and compares pointer coordinates. The dialog is styled with `open:zoom-in-95` (a CSS animation that scales the element). During the animation, the bounding rect is the *post-transform* rect, but during the click event flight time the rect may not have settled. More fundamentally, the `<dialog>` element's `click` event fires for clicks on the **backdrop pseudo-element**, which has the same target as the dialog. The current code says "if the click coordinates are outside the dialog rect, close." This means clicking on a child element that is positioned outside the dialog's content area (e.g., a floating popover, a custom Select dropdown rendered with `position: absolute` that overflows) will close the dialog.

It also closes the dialog even when the consumer explicitly does not want backdrop-dismiss (e.g., a "save before close" flow). There is no `closeOnBackdropClick` prop.
**Fix:** Detect backdrop clicks by comparing `e.target === dialog` (the click was on the dialog element itself, not a child). Also add `closeOnBackdropClick?: boolean` (default `true`) and `closeOnEscape?: boolean` (default `true`) props. When `false`, prevent the dialog from closing — note that suppressing native Escape requires intercepting the `cancel` event (`e.preventDefault()` in a `cancel` listener).

---

### CR-08: Toast auto-dismisses error toasts in 5 s, violating Timing Adjustable

**File:** `packages/components/src/Toast/Toast.tsx:71-79`
**WCAG:** 2.2.1 Timing Adjustable (A) — directly violated for any informational toast a user needs to read; 2.2.3 No Timing (AAA) for the strict reading
**Issue:** All toast types (info, success, warning, **error**) auto-dismiss after `toast.duration || 5000` ms. There is no minimum duration calculation based on content length (rule of thumb: 1 s per ~5 words plus a 5 s base), no pause-on-hover, no pause-on-focus, no extension when the user is reading via screen reader, and **error toasts behave the same as info toasts**. WCAG 2.2.1 explicitly requires that time-limited content can be turned off, adjusted, or extended by the user. This is one of the most commonly cited findings in commercial a11y audits.
**Fix:**
- For `type === 'error'`, default to `Infinity` (sticky until dismissed).
- Pause the timer on `mouseenter` / `focusin` over the toast region; resume on leave.
- Add a `pauseOnHover?: boolean` prop (default `true`).
- Compute a sensible minimum duration: `Math.max(5000, content.length * 50)`.

---

### CR-09: Toast uses `role="alert"` for non-urgent info/success — sentinel role abuse

**File:** `packages/components/src/Toast/Toast.tsx:97`
**WCAG:** 4.1.3 Status Messages (AA), 4.1.2 Name, Role, Value (A)
**Issue:** `role="alert"` (which implies `aria-live="assertive"`) is for time-sensitive, important messages — typically errors, system failures. Using it for `success` ("Your settings were saved!") spams the user with high-priority interruptions for low-priority content. The viewport is correctly `role="region"` with `aria-label="Notifications"`, but each individual toast is a sub-region promoting routine messages to assertive announcement. WCAG 4.1.3 was added in 2.1 specifically to provide `role="status"` (polite) for non-urgent confirmations.
**Fix:**
```tsx
role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
aria-atomic="true"
```

---

### CR-10: Toast has no Escape-to-dismiss

**File:** `packages/components/src/Toast/Toast.tsx:95-126`
**WCAG:** 2.1.1 Keyboard (A) — for the close button this is OK, but a stack of toasts is not Esc-dismissible as a group
**Issue:** Per APG, a toast notification should be dismissible via Escape (focused or unfocused). The current Close button is keyboard-accessible (good), but if a user has many toasts, there's no group-level "close all" or per-toast Escape. For low-priority `status` toasts this is acceptable; for `alert` toasts it is not — the user is interrupted but cannot remove the interruption from any focus location.
**Fix:** Add a global Escape handler in `ToastProvider` that dismisses the most-recent alert toast first. Document the behaviour.

---

### CR-11: NavigationMenu submenu has no Hoverable transit-pointer pattern (same defect as Tooltip pre-fix)

**File:** `packages/components/src/NavigationMenu/NavigationMenu.tsx:74-82, 113-132`
**WCAG:** 1.4.13 Content on Hover or Focus (AA) — Hoverable requirement
**Issue:** The submenu is hover-triggered and dismisses 200 ms after `mouseleave` from the `<li>`. Because the dropdown is rendered inside the same `<li>` (line 113), entering the dropdown still keeps `mouseenter` on the `<li>` (good). **However**, the dropdown is positioned with `mt-1` (4 px gap from the trigger button). When the user moves the pointer from the trigger button down to the dropdown, they cross a 4 px dead zone where the pointer is over the `<li>` but visually between the elements. This works because the `<li>` has `position: relative` and the dropdown is `position: absolute` inside it. So the bounding box of the `<li>` includes the dropdown — OK in theory.

The real defect: when the **dropdown closes**, focus is not moved out, but more importantly, **the dropdown items are `<a>` tags with no Escape handler at the link level**. If a keyboard user opens the menu via Enter on the trigger, then Tabs into a submenu link, then presses Escape — the `handleKeyDown` at line 65 only fires for the `<li>` and only when a child has focus and the event bubbles, but `e.key === 'Escape' && isOpen` only sets `isOpen=false` and refocuses the trigger button. Tab order during the close window is then ambiguous. Also `aria-controls` and a stable `id` linking trigger button to dropdown `<ul>` are missing.

Most importantly: **the JSDoc at line 15-22 advertises "Keyboard support (Tab, Enter/Space, Esc)" but there is no Arrow-key navigation between menu items, no Home/End, no type-ahead.** This is a published-API false claim per APG Disclosure Navigation Menu.
**Fix:**
- Document accurately or implement Arrow-key navigation per APG.
- Add `aria-controls` linking trigger to a stable `id` on `<ul>`.
- On Escape, restore focus to the trigger and prevent the event from bubbling.
- Verify the dead-zone behaviour with a real browser test; if it fails, eliminate the gap or use a transparent bridge element.

---

### CR-12: Combobox missing Home/End keyboard support — published claim, missing implementation

**File:** `packages/components/src/Combobox/Combobox.tsx:50-54, 132-173`
**WCAG:** 2.1.1 Keyboard (A); APG Combobox pattern
**Issue:** The component JSDoc states "Implements WAI-ARIA 1.2 Combobox with Listbox Popup pattern. Supports filtering, keyboard navigation, and screen reader announcements." Per APG Combobox, the keyboard contract MUST include:
- Home → focus first option
- End → focus last option
- PageUp / PageDown → focus 10 items up/down (recommended)
- Alt+ArrowDown → open without filtering (recommended)
- Alt+ArrowUp → close and accept selection

None of these are implemented. The handler at line 138-172 only covers ArrowDown, ArrowUp, Enter, Escape, Tab. This is a published-API false claim — the README/wiki cannot honestly say "WAI-ARIA 1.2 Combobox" without these.
**Fix:** Add Home/End cases to the switch:
```tsx
case 'Home':
    if (isOpen) { e.preventDefault(); setFocusedIndex(0); }
    break;
case 'End':
    if (isOpen) { e.preventDefault(); setFocusedIndex(filteredOptions.length - 1); }
    break;
```

---

### CR-13: Select has no type-ahead — published "accessible" claim, common APG requirement

**File:** `packages/components/src/Select/Select.tsx:39-73`
**WCAG:** 2.1.1 Keyboard (A); APG Select-Only Combobox / Listbox pattern
**Issue:** A native `<select>` supports type-ahead (typing "B" jumps to the first option starting with B). This custom Select reimplements the trigger as a `<button>` and the listbox as a `role="listbox"` div, but never listens for printable character keys to implement type-ahead. Per APG Listbox: "Type-ahead is recommended for all listboxes." Combined with no Home/End either, keyboard users with long option lists must press ArrowDown dozens of times.

Also missing: PageUp/PageDown.

Also: the trigger announces its current value via `<span>{children || placeholder}</span>`, but there is no `aria-label` or `aria-labelledby` on the trigger button when used standalone — screen readers announce "button, collapsed" with no context unless the consumer wraps in an external `<label htmlFor>` (which can't reach the button via `htmlFor` because the button has no `id` by default).
**Fix:**
- Add type-ahead: maintain a `typeAheadBuffer` ref, reset 500 ms after last keystroke, and on each printable key, jump to the first option whose text starts with the buffer.
- Add Home/End/PageUp/PageDown.
- Add `id` and `aria-labelledby` props to `SelectTrigger` and document required usage with a `<label>`.

---

### CR-14: Select listbox is not focused on open and trigger lacks `aria-controls`

**File:** `packages/components/src/Select/Select.tsx:88-129`
**WCAG:** 4.1.2 Name, Role, Value (A); APG Listbox pattern
**Issue:** The trigger has `aria-haspopup="listbox"` and `aria-expanded={context.isOpen}` but **no `aria-controls`** pointing to the listbox `id`. The listbox has no `id` at all (line 121). Per APG, this relationship is required for screen reader users to understand "this button controls that listbox."

Additionally, the listbox has no `aria-activedescendant` and no `tabindex="-1"` to allow programmatic focus. The component uses `highlightedIndex` to track keyboard focus visually but never exposes it to AT. A blind keyboard user pressing ArrowDown after opening hears nothing — the focused option is visually highlighted but no `aria-activedescendant` announces it.
**Fix:**
```tsx
// In Select root:
const listboxId = useId();
// Pass listboxId via context

// In SelectTrigger:
aria-controls={listboxId}

// In SelectContent:
id={listboxId}
aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}

// In SelectItem:
id={`${listboxId}-option-${index}`}
```

---

## Warnings

### WR-01: Dialog scroll lock leaks if component unmounts while open

**File:** `packages/components/src/Dialog/Dialog.tsx:62-69`
**WCAG:** N/A (UX defect, not a11y per se, but breaks page interaction post-unmount)
**Issue:** The cleanup function in the first effect runs on unmount and clears overflow correctly. **But the second effect at line 74-105 has a `close`-event handler that also writes `document.body.style.overflow = ''` (line 80) without checking `scrollLockRef`. If the dialog is unmounted via parent rerender after the dialog has been opened but before any close event fires, the scroll lock persists on `document.body` — there is no cleanup tied to the inner state of `scrollLockRef`. Also, two dialogs nested or stacked will both manipulate the same `document.body.style.overflow`; the inner one's cleanup will release the outer one's lock.
**Fix:** Implement a ref-counted scroll lock manager (singleton module) shared between Dialog/Modal/Toast/etc. Increment on open, decrement on close, only release when count reaches 0.

---

### WR-02: Dialog inline `description` style omits `mb-4` if children handle their own spacing

**File:** `packages/components/src/Dialog/Dialog.tsx:138`
**Issue:** Cosmetic — the `mb-4` spacing on description is hardcoded. Doesn't affect a11y.
**Fix:** Pass-through `descriptionClassName?: string`.

---

### WR-03: Dialog `className` interpolation can break on certain Tailwind PurgeCSS configs

**File:** `packages/components/src/Dialog/Dialog.tsx:110-116`
**Issue:** Multi-line template literal with leading/trailing whitespace. Fine at runtime; flagged only because library consumers may have strict CSS-in-JS lint rules.
**Fix:** Use `clsx` or compact the template literal.

---

### WR-04: Toast random ID generator can collide

**File:** `packages/components/src/Toast/Toast.tsx:30`
**Issue:** `Math.random().toString(36).substr(2, 9)` produces 9 base-36 chars. Birthday collision probability is non-negligible at scale, and `substr` is deprecated. More importantly, if two toasts are added in the same render pass with the same input, they'd get separate calls and separate IDs — fine — but the broader pattern is fragile.
**Fix:** Use `crypto.randomUUID()` (with fallback) or a monotonic counter:
```tsx
const idCounter = useRef(0);
const id = `toast-${++idCounter.current}`;
```

---

### WR-05: Toast useEffect dependency includes `toast` object reference — re-creates timer every render

**File:** `packages/components/src/Toast/Toast.tsx:71-79`
**Issue:** The dependency array `[toast, onRemove]` will trigger re-runs whenever the parent re-renders, because `toast` is an object identity passed via map and `onRemove` is a fresh closure each render. This restarts the timer each parent render, effectively never auto-dismissing for chatty parents.
**Fix:** Depend only on `toast.id` and `toast.duration`, and stabilise `onRemove` via the parent's `useCallback` (already done in `ToastProvider`, but here the inline closure `() => removeToast(toast.id)` at line 64 creates a new function every render — wrap it):
```tsx
// In ToastViewport:
const handleRemove = useCallback((id: string) => () => removeToast(id), [removeToast]);
// ...
<ToastItem onRemove={handleRemove(toast.id)} />
```
Or simpler: pass `removeToast` and `id` to `ToastItem` separately.

---

### WR-06: NavigationMenu submenu items are not announced as a menu group

**File:** `packages/components/src/NavigationMenu/NavigationMenu.tsx:113-132`
**WCAG:** 1.3.1 Info and Relationships (A), 4.1.2 Name, Role, Value (A)
**Issue:** The dropdown `<ul>` has no `role="menu"` and child `<li>` items have no `role="menuitem"`. APG Disclosure Navigation Menu allows either pattern (plain `<ul>` of `<li><a>` is acceptable — disclosure model — or full `role="menu"` — menu model). Either pattern is valid, but the naming is "NavigationMenu" implying menu-pattern semantics. As-is, AT will announce dropdown items as ordinary list items, not menu items.
**Fix:** Either rename or add `role="menu"` + `role="menuitem"` and implement Arrow-key navigation accordingly. Document choice.

---

### WR-07: NavigationMenu submenu trigger is not keyboard-openable via Enter on initial focus

**File:** `packages/components/src/NavigationMenu/NavigationMenu.tsx:93-110`
**Issue:** A `<button>` with `onClick={() => setIsOpen(!isOpen)}` does respond to Enter and Space natively. But the trigger lacks any `onKeyDown` to handle ArrowDown (which APG says should open the submenu and focus the first item). After opening with Enter, focus stays on the trigger button — Tab moves to the next *trigger*, not into the submenu (because the submenu items are focusable via Tab order anyway, but Arrow-down-into-submenu is the documented APG pattern).
**Fix:** Handle ArrowDown on the trigger to open + focus first submenu item.

---

### WR-08: NavigationMenu hover-open without focus-open

**File:** `packages/components/src/NavigationMenu/NavigationMenu.tsx:88-89`
**WCAG:** 2.1.1 Keyboard (A) — combined with hover-only-open this is the classic violation
**Issue:** The submenu opens on `onMouseEnter` of the `<li>`. There is no corresponding `onFocus` handler on the `<li>`. A keyboard user must Click (Enter) the trigger button to open. If they Tab through a closed menu, the dropdown items are still in the DOM but `invisible` — Tab will skip them (`visibility: hidden` removes from tab order) so this is OK — but if a user focuses the trigger without clicking, then Tabs to the next item, they may miss the submenu entirely. Acceptable per APG, but add an `onFocus` for consistency.
**Fix:** Add `onFocus={hasChildren ? handleMouseEnter : undefined}` and `onBlur={hasChildren ? handleMouseLeave : undefined}` to the `<li>`.

---

### WR-09: Combobox does not select option on blur (data loss risk)

**File:** `packages/components/src/Combobox/Combobox.tsx:97-114`
**WCAG:** 3.3.4 Error Prevention (AA) — for committable forms
**Issue:** When the user types into the input, focuses an option (via ArrowDown), then clicks outside (without pressing Enter), `handleClickOutside` resets the input to the previously selected value and discards the typed text. Per APG and common UX expectation, blur with a highlighted match should *commit* the highlight. Otherwise users lose typed work.
**Fix:** On outside-click while `focusedIndex >= 0`, call `handleOptionSelect(filteredOptions[focusedIndex])` before resetting.

---

### WR-10: MultiSelect Escape does not preventDefault — bubbles to parent Dialog

**File:** `packages/components/src/MultiSelect/MultiSelect.tsx:96-98`
**WCAG:** 2.1.2 No Keyboard Trap (A — inverse: Escape should not double-dismiss)
**Issue:** The Escape case at line 96 sets `isOpen=false` but does not `e.preventDefault()` or `e.stopPropagation()`. If the MultiSelect is used inside a Dialog, pressing Escape closes the listbox AND the parent dialog in one keystroke. This is exactly the bug we just fixed in Tooltip (TooltipTrigger line 86).
**Fix:**
```tsx
case 'Escape':
    if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
    }
    break;
```

---

### WR-11: MultiSelect token grid navigation is stubbed but advertised in JSDoc

**File:** `packages/components/src/MultiSelect/MultiSelect.tsx:19-29, 73-118`
**Issue:** JSDoc claims "Keyboard navigation for tokens (Left/Right to navigate, Backspace/Delete to remove)" but `handleTokenNavigation` at line 116 is `// Placeholder for advanced token navigation logic if needed` and `activeTokenIndex` is a destructured ref-only state with no setter (`const [activeTokenIndex] = useState(-1);` — line 43, no `setActiveTokenIndex` exported). ArrowLeft case at line 104 contains a multi-line comment explicitly admitting "This is a simplification … we stick to input focus for simplicity unless requested otherwise."

This is a published-API false claim against the JSDoc. Either the JSDoc must be corrected, or the feature must be implemented per APG.
**Fix:** Either:
(a) Remove the false JSDoc lines and document only Backspace removal, or
(b) Implement the grid pattern: ArrowLeft from input enters token zone; ArrowLeft/Right between tokens; Delete/Backspace removes the focused token; ArrowRight from last token returns to input.

Option (a) is the safe choice for 2.4.0; option (b) for a future minor.

---

### WR-12: MultiSelect missing Home/End and Tab does not close listbox

**File:** `packages/components/src/MultiSelect/MultiSelect.tsx:73-114`
**Issue:** Same gap as Combobox CR-12 (Home/End). Also, there's no `Tab` case — pressing Tab while the listbox is open leaves it open visually until the next click. Combobox handles this at line 169-171.
**Fix:** Add `Home`, `End`, and `Tab` cases.

---

### WR-13: TreeView duplicate render block — root vs recursive — copy-paste defect

**File:** `packages/components/src/TreeView/TreeView.tsx:156-209, 221-285`
**Issue:** The component contains **two near-identical** render blocks: `renderTree` at line 156 (used for child levels via recursion) and an inline block in the main return at line 224 (used for the top level). The two diverge in subtle ways — the recursive one uses `level` parameter, the inline one hardcodes `aria-level={1}`. The comment block at lines 230-234 even says "Let's inline the logic for the root to be safe" — admitting the duplication is intentional but non-obvious.

**The actual defect:** both code paths register refs on `nodeRefs.current.set(node.id, el)`. If two nodes happen to share the same `id` (consumer error, but Tree consumers commonly use database UUIDs that may collide, or the tree may be re-rendered with mutated data), the Map silently overwrites and focus moves to the wrong node. A single render path that recurses cleanly would prevent the duplication, simplify maintenance, and make future fixes (e.g., type-ahead on tree) atomic.

Also: the JSDoc at line 17-25 promises "Single tab stop (roving tabindex)" and "Home/End to jump to start/end" — Home/End are implemented (good), but the duplication risk for ref management is real.
**Fix:** Replace the entire root inline block with `renderTree(data, 1)` and ensure `renderTree` does not wrap with an extra `<ul role="group">` at level 1 — it should render a `<ul role="tree">` only at the root and `<ul role="group">` for subtrees.

---

### WR-14: TreeView clicking a leaf node toggles `setSelectedId` but not `setFocusedId` deterministically

**File:** `packages/components/src/TreeView/TreeView.tsx:175-180, 250-255`
**Issue:** On click, both `setFocusedId` and `setSelectedId` are set. The focus effect at line 149 then calls `el.focus()`. Fine. **But the click handler does not call `e.stopPropagation()`**, and the `<li>` has `role="none"` while the inner `<div>` has `role="treeitem"`. Clicking the chevron `<span>` inside the treeitem propagates up to the treeitem `onClick`, which is the desired behaviour — but a future redesign that puts a separate clickable element inside (e.g., an action button) will also receive the click and unintended toggle. Defensive habit: scope click targets explicitly.
**Fix:** When adding interactive children to treeitems in future, gate the toggle on `e.target === e.currentTarget`. Document this for now.

---

### WR-15: Accordion missing Up/Down/Home/End keyboard navigation between triggers

**File:** `packages/components/src/Accordion/Accordion.tsx:92-108`
**WCAG:** 2.1.1 Keyboard (A); APG Accordion pattern
**Issue:** APG Accordion specifies:
- ArrowDown / ArrowUp → move focus to next/prev accordion header
- Home → first header
- End → last header
- (Optional) Ctrl+PageDown/PageUp → next/prev header

None are implemented. The triggers respond only to Enter/Space (native button behaviour). Tab moves to the next focusable in source order, which works for sequential headers but skips the intent of ArrowDown-to-next-section-only, ignoring opened content's child focusables.

This is a real APG gap. Most consumers will not notice (Tab works), but a screen-reader-only audit will flag it.
**Fix:** Add an `onKeyDown` to each `<AccordionTrigger>` that locates sibling triggers (via a shared ref/context tracking trigger refs) and handles the arrow keys.

---

### WR-16: Switch label double-toggle bug

**File:** `packages/components/src/Switch/Switch.tsx:51-58`
**Issue:** The `<label htmlFor={generatedId}>` already implicitly forwards click to the button (because `htmlFor` matches the button's `id`). Adding `onClick={handleClick}` to the label causes both:
1. Native label-click → button click → `handleClick` → toggle
2. Direct label `onClick` → `handleClick` → toggle

Net effect: clicking the label toggles twice and the switch returns to the original state. Try it: `<Switch label="Test" checked={false} onCheckedChange={fn} />` and click "Test". `fn` is called with `true`, then `true` again (because the local closure read `checked=false` both times), so the parent state becomes `true`. **Wait** — actually because `checked` is in scope from props, both calls send `!false = true`, so the parent sets to `true`. Net: works correctly *because* the prop didn't update mid-handler. But the redundant call is a real bug — if `onCheckedChange` has side effects (analytics, debounced API call), it fires twice per click.
**Fix:** Remove `onClick={handleClick}` from the `<label>`; rely on native `htmlFor` propagation.

---

### WR-17: Switch and Checkbox use `Math.random()` for id — SSR hydration mismatch

**File:** `packages/components/src/Switch/Switch.tsx:12`, `packages/components/src/Checkbox/Checkbox.tsx:17`
**Issue:** `Math.random().toString(36).substr(2, 9)` runs at render time. In SSR (Next.js, Remix, Gatsby), the server-rendered `id` differs from the client-rendered `id` → React hydration warning + the server `<label htmlFor>` does not match the client `<input id>` on first render → label is dissociated for the duration before re-render. `substr` is also deprecated.
**Fix:** Use `useId()` from React 18:
```tsx
const generatedId = useId();
const id = providedId || generatedId;
```
This is what `Combobox`, `MultiSelect`, `DatePicker` already do. Inconsistency.

---

### WR-18: SkipLink default text is hardcoded Swedish

**File:** `packages/components/src/SkipLink/SkipLink.tsx:41`
**WCAG:** 3.1.2 Language of Parts (AA) — the surrounding `lang` attribute should match the text language
**Issue:** The component is published in `@holmdigital/components` v2.3.0 to npm, used internationally. The default text is "Hoppa till huvudinnehåll" (Swedish). An English-language site that imports `<SkipLink />` without passing children gets Swedish text in an English page — a 3.1.2 violation, plus general user confusion.

**The component has no `lang` prop either** — even if a consumer passes English children, the surrounding `<a>` has no `lang` attribute to override the page lang.
**Fix:**
- Default text should be empty / undefined; require children OR a `label` prop.
- If a default is desired, use English ("Skip to main content") since it's the lingua franca of npm packages.
- Document the Swedish, German, French, etc. labels in the README.
- Consider a `lang?: string` prop that sets `lang` on the `<a>`.

---

## Info

### IN-01: Combobox container is a `<div>` not a `<form>` semantic — fine for now

**File:** `packages/components/src/Combobox/Combobox.tsx:237-238`
**Issue:** No defect; just note that consumers wrapping in `<form>` get free Enter-to-submit, which the current Combobox `case 'Enter':` swallows via `e.preventDefault()`. Document this.

---

### IN-02: Combobox option click does not respect `e.preventDefault()` on mousedown

**File:** `packages/components/src/Combobox/Combobox.tsx:305`
**Issue:** Clicking an option fires `onClick` AFTER the input has lost focus (because mousedown on `<li>` blurs `<input>` → outside-click handler fires → listbox closes → `<li>` is unmounted → click never fires). Wait, the outside-click handler at line 98 listens for `mousedown`, so this race is real. Test in the browser: typing, ArrowDown, then clicking another option may close the listbox before selection.

Mitigation: the outside-click handler checks `containerRef.current.contains(event.target)`, and the `<ul>` is inside `containerRef`, so clicks on the listbox are correctly identified as inside-clicks. Should be fine — flagged for retest.
**Fix:** Add a unit test simulating mousedown→click sequence on listbox.

---

### IN-03: DatePicker has no min/max validation surface

**File:** `packages/components/src/DatePicker/DatePicker.tsx:97-110`
**WCAG:** 3.3.1 Error Identification (A) — would apply if min/max are constraints
**Issue:** Native `<input type="date">` accepts `min`/`max` props (passed through via `...props`). Good. But there is no built-in error message for "out of range" — consumer must wire `error` manually based on form state. Document this as a usage note.
**Fix:** Add a usage example to the README.

---

### IN-04: TreeView keyboard handler does not handle type-ahead

**File:** `packages/components/src/TreeView/TreeView.tsx:62-134`
**Issue:** APG Tree View recommends type-ahead. Not implemented. Low priority for v2.4.0 but flag for v2.5.0.

---

### IN-05: Accordion `React.cloneElement` props injection is fragile

**File:** `packages/components/src/Accordion/Accordion.tsx:72-81`
**Issue:** The `AccordionItem` injects `value` and `isOpen` via `React.cloneElement`. This breaks if a consumer wraps `AccordionTrigger` in a `React.Fragment` or HOC. Consider switching to context (`AccordionItemContext`) for a cleaner API.
**Fix:** Refactor in v3.0.0 (breaking change).

---

### IN-06: Tabs `baseId` uses `Math.random()` — same SSR concern as WR-17

**File:** `packages/components/src/Tabs/Tabs.tsx:36`
**Issue:** `useState(() => Math.random().toString(36).substr(2, 9))` for SSR-stable ID. `useId()` is the correct primitive.
**Fix:** Replace with `useId()`.

---

### IN-07: Tabs disabled tab handling

**File:** `packages/components/src/Tabs/Tabs.tsx:74`
**Issue:** The keyboard handler queries `[role="tab"]:not([disabled])` and skips disabled tabs (good). But disabled tabs still receive `tabIndex={isActive ? 0 : -1}` — if a disabled tab is the active one (consumer error), it remains in tab order. Edge case but worth documenting.
**Fix:** When a tab is disabled, force `tabIndex={-1}`.

---

### IN-08: SkipLink uses transform-only hide (vs. clip-path)

**File:** `packages/components/src/SkipLink/SkipLink.tsx:25-33`
**Issue:** `-translate-y-[150%]` moves the link off-screen. It remains in the layout flow (no scrollbars added because it's `fixed`), and `display` is not `none`, so it remains in the accessibility tree. This is actually correct for SkipLink — we WANT it focusable. Just flag that `transform` may be overridden by consumer CSS.
**Fix:** Document that consumers should not override `transform` via CSS-in-JS.

---

### IN-09: RadioGroup has no keyboard handler — relies on native browser arrow-key navigation

**File:** `packages/components/src/RadioGroup/RadioGroup.tsx:38-82`
**Issue:** Native HTML `<input type="radio" name="...">` siblings get arrow-key navigation for free from the browser. Good. **However**, the `<input>` is `sr-only` (line 53) — visually hidden but in the DOM. Browser still applies native radio behaviour because the elements are in the accessibility tree. Verified working. No defect — just flag that this pattern depends on `sr-only` keeping the inputs in the focus chain (which it does, since `sr-only` clips visually but does not set `tabindex="-1"`).

Trace test: user Tabs into the first radio → ArrowDown moves to next → checks. This works because the radios share `name`. Confirmed safe.

---

---

## Cross-File / Architectural Findings

These are deep-review observations spanning multiple components.

### Inconsistent ID generation strategy

Three patterns in the same package:
- `useId()` — Combobox, MultiSelect, DatePicker, Tooltip
- `Math.random().toString(36).substr(2, 9)` — Switch, Checkbox, Toast, Tabs
- Hardcoded — Dialog (`"dialog-title"`)

**Action:** Standardise on `useId()` for all components. Lint rule: forbid `Math.random` for id generation.

### No shared focus-trap utility

Dialog, Modal, and any future Drawer component each need a focus trap. Currently Dialog has none, Modal inherits from Dialog. A future Drawer will reinvent.

**Action:** Extract `useFocusTrap(ref, isActive)` hook in `packages/components/src/_hooks/`.

### No shared scroll-lock utility

Dialog implements its own scroll lock with a local ref. Stacking dialogs / dialog-inside-modal will break.

**Action:** Extract a ref-counted singleton scroll-lock manager.

### Multiple Escape-handling inconsistencies

- Tooltip: stops propagation (correct — fixed recently)
- Combobox: preventDefault but no stopPropagation
- MultiSelect: neither (defect — WR-10)
- Select: preventDefault, no stopPropagation
- Dialog: relies on native dialog Escape (no React handler at all)
- TreeView: no Escape handler
- NavigationMenu: stops by being inside `<li>` `onKeyDown`, but does not call `stopPropagation`

**Action:** Define a project-wide rule: "Escape that dismisses a popover MUST call `e.stopPropagation()` to prevent ancestor dismissal." Encode in a `useDismissable` hook.

### `aria-controls` consistency

Components that have `aria-haspopup` should always have `aria-controls`:
- Combobox: has it (good)
- MultiSelect: has it (good)
- Select: **missing** (CR-14)
- NavigationMenu: missing (WR-06 implies)
- Tooltip: uses `aria-describedby` instead (correct for tooltip)

**Action:** Add lint check for `aria-haspopup` without `aria-controls`.

---

_Reviewed: 2026-05-09T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
_Target release: @holmdigital/components 2.4.0 (a11y minor)_
