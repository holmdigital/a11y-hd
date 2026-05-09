---
"@holmdigital/components": minor
---

WCAG 2.1 AA conformance pass — closes 14 false-compliance gaps across Tooltip, Dialog, Modal, Toast, NavigationMenu, Combobox, and Select

A post-2.3.0 audit found that several components advertised WCAG conformance their code did not deliver. This minor closes every BLOCKER finding and adds shared infrastructure to prevent recurrence.

**New shared hooks** (`src/_hooks/`)
- `useFocusTrap(containerRef, active, initialFocusRef?)` — moves focus into the container on activation, traps Tab inside, restores focus to the opener on deactivation.
- `useScrollLock(active)` — ref-counted singleton so stacked dialogs/toasts compose safely.

**Tooltip** (WCAG 1.4.13 Content on Hover or Focus — Dismissible + Hoverable)
- Adds Escape-to-dismiss with proper guards (`if (open)` + `stopPropagation`) so it doesn't double-dismiss an enclosing dialog.
- Adds `dismissed`-state so the tooltip doesn't immediately reopen while the trigger is still hovered/focused; resets on blur/leave so the next interaction starts fresh.
- Adds `onMouseEnter`/`onMouseLeave` to `TooltipContent` with a 100 ms close delay so the pointer can transit from trigger to content (Hoverable).
- Replaces `Math.random()` id with `useId()` for SSR-stable identifiers.

**Dialog / Modal** (focus trap, focus restore, role/ARIA correctness)
- Wires `useFocusTrap` so focus moves into the dialog on open and returns to the opener on close.
- Adds `initialFocusRef?: RefObject<HTMLElement>` prop so consumers can land focus on the safe choice (e.g. Cancel) for destructive confirms.
- `variant="alert"` now produces `role="alertdialog"` (was `dialog`).
- Adds `aria-modal="true"`.
- Replaces hardcoded `id="dialog-title"` / `id="dialog-desc"` with `useId()` — multiple dialogs on the same page no longer collide.
- Backdrop-click detection now uses `e.target === dialog` instead of geometric comparison — works correctly for transformed/scaled dialogs.
- Adds `closeOnBackdropClick?: boolean` and `closeOnEscape?: boolean` props (both default `true`).
- Close button now calls `onClose` directly; `useScrollLock` replaces the local boolean and stays in sync across stacked dialogs.

**Toast** (WCAG 2.2.1 Timing Adjustable, 4.1.3 Status Messages)
- `error` toasts default to `Infinity` duration (sticky until dismissed).
- Non-error toasts use a reading-rate-aware duration: `max(5000ms, content.length * 50ms)`.
- Auto-dismiss timer pauses on hover or focus; resumes on leave/blur.
- `role` and `aria-live` are now severity-aware: `alert`/`assertive` for error/warning, `status`/`polite` for info/success.
- `ToastProvider` listens for Escape at the document level and dismisses the most-recent urgent (error/warning) toast.
- Replaces `Math.random()` id with a monotonic counter ref.

**NavigationMenu**
- Adds `aria-controls` linking the trigger button to a stable `useId()` dropdown id.
- Adds `ArrowDown` on the closed trigger to open the submenu and focus the first item (per APG Disclosure Navigation Menu).
- Adds focus parity: submenu opens on `onFocus` of the `<li>`, not just hover.
- Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.
- JSDoc updated to accurately describe the disclosure pattern (not the menu/menuitem pattern).

**Combobox** (APG keyboard contract)
- Adds `Home`, `End`, `PageUp`, `PageDown` to the keyboard handler.
- Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.

**Select** (APG Listbox + visual-only focus → AT-announced focus)
- Adds `aria-controls` on the trigger pointing to the listbox `useId()` id.
- Adds `aria-activedescendant` on the trigger so screen readers announce the focused option as the user navigates.
- Adds full APG keyboard support: `Home`, `End`, `PageUp`, `PageDown`, type-ahead with 500 ms reset window.
- Escape now `stopPropagation()`s so it doesn't double-dismiss a parent dialog.
- Refactors option tracking from a fragile ref-array (broke on commit-timing) to a DOM-query approach that always reflects the current options.

**Tests**
- New per-component test files for Tooltip (9), Dialog (6), Toast (6), Select (5) covering the new keyboard / focus / ARIA behaviour.
- Total: 162 components tests, all green.
