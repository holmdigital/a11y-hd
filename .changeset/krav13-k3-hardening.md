---
"@holmdigital/engine": patch
---

Harden the axe-rule → criterion mapping so a correct label can never depend on file order (Intern #27 KRAV-13, K3). The functional fix already shipped (Intern #30/#29): the engine derives the WCAG criterion from axe's own `wcagNNN` tags and looks a rule up by `wcagCriteria`, in both the full and the light path. But a criterion held by several of our rules (e.g. 1.3.1, held by `info-and-relationships` plus seven self-matching landmark/heading rules) resolved to whichever rule came first in the data. It now **prefers a general rule over a self-matching one** — a rule whose id is an axe rule id, only reachable via the direct id match — and uses a self-matching rule only when it alone holds the criterion (so a future axe rule on e.g. `wcag143` still maps to `color-contrast` instead of silently going unmapped). The self-matching set is derived from axe's own rule list, not a hardcoded table.

Adds the full KRAV-13 red-test suite with verbatim axe tag arrays (RT1–RT8), the two regression guards (RG1–RG2), the K3 order-independence test, and the K6 measurable outcome (every installed axe rule through the mapping asserts **zero silent errors**). No behaviour change for any finding that was already correct.
