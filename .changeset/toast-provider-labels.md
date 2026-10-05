---
"@holmdigital/components": minor
---

ToastProvider: new optional `ariaLabel` and `closeLabel` props set the accessible names of the toast region and of each toast's close button, so they can match the language of the page (WCAG 3.1.2). Defaults are unchanged ("Notifications" and "Close"). The empty toast region no longer catches pointer events (`pointer-events-none`), only the toasts do (`pointer-events-auto`).
