---
"@holmdigital/engine": patch
---

Show the legal basis to the customer (Intern #29). The DOS-lagen reference corrected in Intern #28 never reached the two surfaces where it matters most — the klarspråk report and the public scan widget.

**Klarspråk (`--plain` + plain HTML):** each finding now carries a one-line legal basis, in Juno's approved Swedish wordings, branched on the content of `dosLagenReference` (order matters — the WCAG 2.2 case is tested before the default so a not-yet-binding criterion is never labelled a legal requirement):
- a real DOS-lagen A/AA requirement → `Lagkrav: DOS-lagen (2018:1937), 10 §.`
- a WCAG 2.2 criterion (`ännu inte lagkrav`) → `Ännu inte lagkrav under DOS-lagen (WCAG 2.2-kriterium). Blir bindande när EN 301 549 V4.x refereras i EU:s officiella tidning.`
- unmapped / a non-law fallback phrase → `Lagrum okänt. Fyndet kunde inte kopplas till ett specifikt lagrum.`

`--plain` and the plain HTML share one helper (`klarsprakLegalLine`) so they cannot drift apart. Swedish only for now (Juno approved Swedish wordings). "10 §" is not derived blindly from data — flag Juno if `standards` ever emits a different paragraph for a requirement.

**Light mode:** `enrichResultsLight` filled `dosLagenReference`/`en301549Criteria` with empty strings, so the widget never saw the reference. It now resolves the rule the same way `enrichResults` does (direct id → criterion fallback, Intern #30) and fills both fields; an unmapped finding says the legal basis is unknown, never an empty string or a phrase posing as a law. The light-JSON `topIssues` gains a single `legalBasis` field carrying the same short three-case klarspråk as `--plain` (not the raw string — otherwise the WCAG 2.2 findings would read as legal requirements in the widget). Light-JSON stays compact.

No change to the developer report, JUnit, GitHub Actions or full JSON.
