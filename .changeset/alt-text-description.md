---
"@holmdigital/standards": patch
---

Rewrite the alt-text rule's `remediation.description` (Intern #13). The old text ("All images must have descriptive alternative text.") was wrong about WCAG 1.1.1: it ignored the decoration exception and implied `alt` is always required. The new, WCAG-reviewed wording distinguishes informative from decorative images, states that decorative images must be actively marked so assistive technology can ignore them (an empty `alt=""` is the standard way, and omitting `alt` entirely is not enough), and frames the requirement as being about the outcome, not the technique.

Applied in all 11 affected language files (`sv`, `en`, `en-ca`, `en-gb`, `en-us`, `da`, `de`, `fi`, `fr`, `nl`, `no`) — `sv`/`en` verbatim as approved, the rest as faithful translations, none using em/en-dashes. `es` already stated the criterion and is left unchanged.
